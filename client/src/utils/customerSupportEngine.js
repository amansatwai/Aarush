import { supabase } from '../lib/supabase';

const TICKETS_TABLE = 'support_tickets';
const MESSAGES_TABLE = 'support_ticket_messages';
const ARTICLES_TABLE = 'knowledge_articles';

export const TICKET_STATES = [
  'Open',
  'In Progress',
  'Waiting',
  'Resolved',
  'Closed',
  'Escalated',
];

export const SUPPORT_CHANNELS = [
  'Chat',
  'Email',
  'Phone',
  'Marketplace',
  'Orders',
  'Payments',
];

function guestMode() {
  if (typeof window === 'undefined') return false;

  return (
    window.localStorage.getItem(
      'aarush_is_guest'
    ) === 'true' &&
    window.localStorage.getItem(
      'aarush_guest_session'
    ) === 'active'
  );
}

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) {
    throw new Error(
      'Sign in to manage support tickets.'
    );
  }

  return user;
}

export async function initializeCustomerSupport() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    states: TICKET_STATES,
    channels: SUPPORT_CHANNELS,
  };
}

export async function createSupportTicket({
  subject,
  description,
  channel = 'Chat',
  priority = 'normal',
  customerId,
  metadata = {},
} = {}) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create support tickets.'
    );
  }

  const user = await requireUser();

  if (!subject || !description) {
    throw new Error(
      'Ticket subject and description are required.'
    );
  }

  const { data, error } = await supabase
    .from(TICKETS_TABLE)
    .insert({
      customer_id: customerId || user.id,
      created_by: user.id,
      subject,
      description,
      channel,
      priority,
      status: 'Open',
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateTicketStatus(
  ticketId,
  status
) {
  if (!TICKET_STATES.includes(status)) {
    throw new Error('Invalid ticket status.');
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(TICKETS_TABLE)
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ticketId)
    .or(
      `created_by.eq.${user.id},customer_id.eq.${user.id}`
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function assignTicket(
  ticketId,
  assigneeId
) {
  const { data, error } = await supabase
    .from(TICKETS_TABLE)
    .update({
      assigned_to: assigneeId,
      status: 'In Progress',
      updated_at: new Date().toISOString(),
    })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function replyToTicket(
  ticketId,
  message
) {
  const user = await requireUser();

  if (!message?.trim()) {
    throw new Error('Reply message is required.');
  }

  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .insert({
      ticket_id: ticketId,
      sender_id: user.id,
      message,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function closeTicket(ticketId) {
  return updateTicketStatus(ticketId, 'Closed');
}

export async function reopenTicket(ticketId) {
  return updateTicketStatus(ticketId, 'Open');
}

export async function getSupportTickets({
  page = 0,
  pageSize = 30,
  status,
} = {}) {
  if (guestMode()) return [];

  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TICKETS_TABLE)
    .select('*')
    .or(
      `created_by.eq.${user.id},customer_id.eq.${user.id}`
    )
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
}

export async function getCustomerHistory(
  customerId
) {
  const user = await requireUser();

  const id = customerId || user.id;

  const { data, error } = await supabase
    .from(TICKETS_TABLE)
    .select('*')
    .eq('customer_id', id)
    .order('created_at', {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
}

export async function createKnowledgeArticle(
  payload = {}
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(ARTICLES_TABLE)
    .insert({
      ...payload,
      author_id: user.id,
      status: payload.status || 'draft',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getKnowledgeBase({
  query,
  category,
} = {}) {
  let request = supabase
    .from(ARTICLES_TABLE)
    .select('*')
    .eq('status', 'published')
    .order('created_at', {
      ascending: false,
    });

  if (category) {
    request = request.eq('category', category);
  }

  if (query) {
    request = request.or(
      `title.ilike.%${query}%,content.ilike.%${query}%`
    );
  }

  const { data, error } = await request;

  if (error) throw error;

  return data || [];
}

export async function getSupportAnalytics() {
  const tickets = await getSupportTickets({
    page: 0,
    pageSize: 500,
  });

  return {
    total: tickets.length,
    open: tickets.filter(
      (ticket) => ticket.status === 'Open'
    ).length,
    in_progress: tickets.filter(
      (ticket) =>
        ticket.status === 'In Progress'
    ).length,
    resolved: tickets.filter(
      (ticket) =>
        ['Resolved', 'Closed'].includes(
          ticket.status
        )
    ).length,
    escalated: tickets.filter(
      (ticket) => ticket.status === 'Escalated'
    ).length,
    average_response_time: 0,
  };
}

export function subscribeToSupportEvents(
  callback
) {
  const channel = supabase
    .channel('aarush-customer-support')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TICKETS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: MESSAGES_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}