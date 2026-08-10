import { supabase } from '../lib/supabase';

const CONVERSATIONS_TABLE = 'conversations';
const PARTICIPANTS_TABLE = 'conversation_participants';
const MESSAGES_TABLE = 'messages';
const READS_TABLE = 'message_reads';
const DELETIONS_TABLE = 'message_deletions';

const PROFILE_FIELDS = `
  id,
  username,
  full_name,
  avatar_url,
  profession
`;

const MESSAGE_FIELDS = `
  id,
  conversation_id,
  sender_id,
  message_type,
  content,
  media_url,
  created_at,
  edited_at,
  deleted_for_everyone,
  profiles!messages_sender_id_fkey (${PROFILE_FIELDS})
`;

function isGuestMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.localStorage.getItem('aarush_is_guest') === 'true' &&
    window.localStorage.getItem(
      'aarush_guest_session'
    ) !== null
  );
}

async function requireAuthenticatedUser() {
  if (isGuestMode()) {
    throw new Error(
      'Chat is not available in Guest Mode. Sign in to continue.'
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error('Sign in to access chat.');
  }

  return user;
}

function normalizeParticipantIds(userIds, currentUserId) {
  return [...new Set([currentUserId, ...(userIds || [])])]
    .filter(Boolean);
}

function normalizeMessage(message) {
  return {
    ...message,
    profile: message.profile || message.profiles || {},
  };
}

export async function createConversation(userIds = []) {
  const currentUser = await requireAuthenticatedUser();

  const participantIds = normalizeParticipantIds(
    userIds,
    currentUser.id
  );

  if (participantIds.length < 2) {
    throw new Error(
      'A conversation requires at least two participants.'
    );
  }

  const { data: existingParticipants, error: lookupError } =
    await supabase
      .from(PARTICIPANTS_TABLE)
      .select('conversation_id, user_id')
      .in('user_id', participantIds);

  if (lookupError) {
    throw lookupError;
  }

  const groupedConversations = new Map();

  (existingParticipants || []).forEach((participant) => {
    if (!groupedConversations.has(
      participant.conversation_id
    )) {
      groupedConversations.set(
        participant.conversation_id,
        new Set()
      );
    }

    groupedConversations
      .get(participant.conversation_id)
      .add(participant.user_id);
  });

  const existingConversation = [...groupedConversations.entries()]
    .find(([, participants]) => {
      if (participants.size !== participantIds.length) {
        return false;
      }

      return participantIds.every((id) =>
        participants.has(id)
      );
    });

  if (existingConversation) {
    return getConversation(existingConversation[0]);
  }

  const { data: conversation, error: conversationError } =
    await supabase
      .from(CONVERSATIONS_TABLE)
      .insert({})
      .select()
      .single();

  if (conversationError) {
    throw conversationError;
  }

  const { error: participantError } = await supabase
    .from(PARTICIPANTS_TABLE)
    .insert(
      participantIds.map((userId) => ({
        conversation_id: conversation.id,
        user_id: userId,
      }))
    );

  if (participantError) {
    await supabase
      .from(CONVERSATIONS_TABLE)
      .delete()
      .eq('id', conversation.id);

    throw participantError;
  }

  return getConversation(conversation.id);
}

export async function getConversation(conversationId) {
  const user = await requireAuthenticatedUser();

  if (!conversationId) {
    throw new Error('Conversation ID is required.');
  }

  const { data, error } = await supabase
    .from(CONVERSATIONS_TABLE)
    .select(`
      id,
      created_at,
      updated_at,
      conversation_participants (
        id,
        user_id,
        joined_at,
        profiles!conversation_participants_user_id_fkey (
          ${PROFILE_FIELDS}
        )
      )
    `)
    .eq('id', conversationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const isParticipant = (
    data.conversation_participants || []
  ).some(
    (participant) => participant.user_id === user.id
  );

  if (!isParticipant) {
    throw new Error('You cannot access this conversation.');
  }

  return data;
}

export async function getUserConversations({
  page = 0,
  pageSize = 20,
} = {}) {
  const user = await requireAuthenticatedUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data: memberships, error: membershipError } =
    await supabase
      .from(PARTICIPANTS_TABLE)
      .select('conversation_id, joined_at')
      .eq('user_id', user.id)
      .order('joined_at', {
        ascending: false,
      })
      .range(from, to);

  if (membershipError) {
    throw membershipError;
  }

  if (!memberships?.length) {
    return [];
  }

  const conversationIds = memberships.map(
    (membership) => membership.conversation_id
  );

  const { data: conversations, error: conversationError } =
    await supabase
      .from(CONVERSATIONS_TABLE)
      .select(`
        id,
        created_at,
        updated_at,
        conversation_participants (
          id,
          user_id,
          joined_at,
          profiles!conversation_participants_user_id_fkey (
            ${PROFILE_FIELDS}
          )
        )
      `)
      .in('id', conversationIds)
      .order('updated_at', {
        ascending: false,
      });

  if (conversationError) {
    throw conversationError;
  }

  const lastMessages = await Promise.all(
    conversationIds.map(async (conversationId) => {
      const { data, error } = await supabase
        .from(MESSAGES_TABLE)
        .select(MESSAGE_FIELDS)
        .eq('conversation_id', conversationId)
        .order('created_at', {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return [conversationId, data ? normalizeMessage(data) : null];
    })
  );

  const lastMessageMap = new Map(lastMessages);

  return (conversations || [])
    .map((conversation) => ({
      ...conversation,
      last_message:
        lastMessageMap.get(conversation.id) || null,
    }))
    .sort(
      (first, second) =>
        new Date(second.updated_at) -
        new Date(first.updated_at)
    );
}

export async function sendMessage({
  conversationId,
  content = '',
  messageType = 'text',
  mediaUrl = null,
}) {
  const user = await requireAuthenticatedUser();

  if (!conversationId) {
    throw new Error('Conversation ID is required.');
  }

  if (
    ![
      'text',
      'image',
      'video',
      'audio',
      'file',
    ].includes(messageType)
  ) {
    throw new Error('Invalid message type.');
  }

  if (messageType === 'text' && !content.trim()) {
    throw new Error('Message cannot be empty.');
  }

  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      message_type: messageType,
      content:
        messageType === 'text'
          ? content.trim()
          : content || null,
      media_url: mediaUrl,
    })
    .select(MESSAGE_FIELDS)
    .single();

  if (error) {
    throw error;
  }

  return normalizeMessage(data);
}

export async function getMessages(
  conversationId,
  {
    page = 0,
    pageSize = 50,
    before = null,
  } = {}
) {
  await requireAuthenticatedUser();

  if (!conversationId) {
    throw new Error('Conversation ID is required.');
  }

  let query = supabase
    .from(MESSAGES_TABLE)
    .select(MESSAGE_FIELDS)
    .eq('conversation_id', conversationId)
    .order('created_at', {
      ascending: false,
    })
    .limit(pageSize);

  if (before) {
    query = query.lt('created_at', before);
  } else if (page > 0) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    query = query.range(from, to);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const messages = (data || []).map(normalizeMessage);

  return messages.reverse();
}

export async function markMessageRead(messageId) {
  const user = await requireAuthenticatedUser();

  if (!messageId) {
    throw new Error('Message ID is required.');
  }

  const { error } = await supabase
    .from(READS_TABLE)
    .upsert(
      {
        message_id: messageId,
        user_id: user.id,
        read_at: new Date().toISOString(),
      },
      {
        onConflict: 'message_id,user_id',
        ignoreDuplicates: false,
      }
    );

  if (error) {
    throw error;
  }

  return true;
}

export async function markConversationRead(
  conversationId
) {
  const user = await requireAuthenticatedUser();

  if (!conversationId) {
    throw new Error('Conversation ID is required.');
  }

  const { data: messages, error: messageError } =
    await supabase
      .from(MESSAGES_TABLE)
      .select('id')
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('deleted_for_everyone', false);

  if (messageError) {
    throw messageError;
  }

  if (!messages?.length) {
    return true;
  }

  const { error } = await supabase
    .from(READS_TABLE)
    .upsert(
      messages.map((message) => ({
        message_id: message.id,
        user_id: user.id,
      })),
      {
        onConflict: 'message_id,user_id',
        ignoreDuplicates: true,
      }
    );

  if (error) {
    throw error;
  }

  return true;
}

export function subscribeToConversation(
  conversationId,
  callback
) {
  if (!conversationId || isGuestMode()) {
    return () => {};
  }

  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: MESSAGES_TABLE,
        filter: `conversation_id=eq.${conversationId}`,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: READS_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToConversations(callback) {
  if (isGuestMode()) {
    return () => {};
  }

  const channel = supabase
    .channel('aarush-conversations')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: MESSAGES_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: READS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: PARTICIPANTS_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function deleteMessageForMe(messageId) {
  const user = await requireAuthenticatedUser();

  if (!messageId) {
    throw new Error('Message ID is required.');
  }

  const { error } = await supabase
    .from(DELETIONS_TABLE)
    .upsert(
      {
        message_id: messageId,
        user_id: user.id,
      },
      {
        onConflict: 'message_id,user_id',
        ignoreDuplicates: true,
      }
    );

  if (error) {
    throw error;
  }

  return true;
}

export async function deleteMessageForEveryone(
  messageId
) {
  const user = await requireAuthenticatedUser();

  if (!messageId) {
    throw new Error('Message ID is required.');
  }

  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .update({
      deleted_for_everyone: true,
      content: null,
      media_url: null,
      edited_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .eq('sender_id', user.id)
    .select(MESSAGE_FIELDS)
    .single();

  if (error) {
    throw error;
  }

  return normalizeMessage(data);
}

export async function editMessage(messageId, content) {
  const user = await requireAuthenticatedUser();
  const normalizedContent = String(content || '').trim();

  if (!messageId) {
    throw new Error('Message ID is required.');
  }

  if (!normalizedContent) {
    throw new Error('Message cannot be empty.');
  }

  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .update({
      content: normalizedContent,
      edited_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .eq('sender_id', user.id)
    .eq('deleted_for_everyone', false)
    .select(MESSAGE_FIELDS)
    .single();

  if (error) {
    throw error;
  }

  return normalizeMessage(data);
}

export async function getUnreadCount() {
  const user = await requireAuthenticatedUser();

  const { data: memberships, error: membershipError } =
    await supabase
      .from(PARTICIPANTS_TABLE)
      .select('conversation_id')
      .eq('user_id', user.id);

  if (membershipError) {
    throw membershipError;
  }

  if (!memberships?.length) {
    return 0;
  }

  const conversationIds = memberships.map(
    (membership) => membership.conversation_id
  );

  const { data: messages, error: messageError } =
    await supabase
      .from(MESSAGES_TABLE)
      .select('id')
      .in('conversation_id', conversationIds)
      .neq('sender_id', user.id)
      .eq('deleted_for_everyone', false);

  if (messageError) {
    throw messageError;
  }

  if (!messages?.length) {
    return 0;
  }

  const messageIds = messages.map((message) => message.id);

  const { data: reads, error: readsError } =
    await supabase
      .from(READS_TABLE)
      .select('message_id')
      .eq('user_id', user.id)
      .in('message_id', messageIds);

  if (readsError) {
    throw readsError;
  }

  const readIds = new Set(
    (reads || []).map((read) => read.message_id)
  );

  return messages.filter(
    (message) => !readIds.has(message.id)
  ).length;
}

export async function getMessageReadReceipts(messageId) {
  await requireAuthenticatedUser();

  if (!messageId) {
    throw new Error('Message ID is required.');
  }

  const { data, error } = await supabase
    .from(READS_TABLE)
    .select(`
      id,
      message_id,
      user_id,
      read_at,
      profiles!message_reads_user_id_fkey (${PROFILE_FIELDS})
    `)
    .eq('message_id', messageId)
    .order('read_at', {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data || [];
}

export function createTypingChannel(conversationId) {
  if (!conversationId || isGuestMode()) {
    return null;
  }

  return supabase.channel(
    `typing:${conversationId}`,
    {
      config: {
        presence: {
          key: conversationId,
        },
      },
    }
  );
}

export function createPresenceChannel(userId) {
  if (!userId || isGuestMode()) {
    return null;
  }

  return supabase.channel(`presence:${userId}`, {
    config: {
      presence: {
        key: userId,
      },
    },
  });
}