import {
  executeAutomationRule,
  getAutomationRules,
} from './automationEngine';
import {
  askAssistant,
} from './aiAssistantEngine';

const HISTORY_KEY =
  'aarush_voice_command_history';

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

function readHistory() {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(
      localStorage.getItem(HISTORY_KEY) || '[]'
    );
  } catch {
    return [];
  }
}

function saveHistory(history) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(history.slice(-50))
  );
}

export function classifyIntent(text = '') {
  const value = text.toLowerCase();

  if (
    /open|show|go to|navigate/.test(value)
  ) {
    return 'navigation';
  }

  if (
    /privacy|private|hide profile|emergency privacy/.test(
      value
    )
  ) {
    return 'privacy';
  }

  if (
    /security|scan|logout all|app lock|device/.test(
      value
    )
  ) {
    return 'security';
  }

  if (
    /chat|message|conversation/.test(value)
  ) {
    return 'chat';
  }

  if (
    /automation|rule|automate/.test(value)
  ) {
    return 'automation';
  }

  if (
    /setting|preferences|language|voice/.test(value)
  ) {
    return 'settings';
  }

  return 'help';
}

export function extractEntities(text = '') {
  const value = text.trim();

  const quoted = value.match(/["']([^"']+)["']/);
  const username = value.match(
    /@([a-zA-Z0-9_.-]+)/
  );

  return {
    query: quoted?.[1] || null,
    username: username?.[1] || null,
    raw: value,
  };
}

export function parseCommand(text = '') {
  return {
    text: text.trim(),
    intent: classifyIntent(text),
    entities: extractEntities(text),
    created_at: new Date().toISOString(),
  };
}

function storeCommand(command, result) {
  const history = readHistory();

  history.push({
    ...command,
    result,
  });

  saveHistory(history);

  return result;
}

export function executeNavigationCommand(
  command,
  navigate
) {
  const value = command.text.toLowerCase();

  const routes = [
    [/chat|message/, '/chats'],
    [/profile/, '/profile'],
    [/setting/, '/profile-settings'],
    [/security/, '/security-center'],
    [/privacy dashboard/, '/privacy-dashboard'],
    [/privacy/, '/social-privacy-settings'],
    [/notification/, '/notifications'],
    [/backup/, '/backup-center'],
    [/offline|sync/, '/offline-center'],
    [/reel/, '/reels'],
    [/explore|search/, '/explore'],
  ];

  const match = routes.find(([pattern]) =>
    pattern.test(value)
  );

  if (!match) {
    return {
      executed: false,
      message: 'I could not find that area.',
    };
  }

  navigate(match[1]);

  return {
    executed: true,
    route: match[1],
    message: `Opening ${match[1].replace('/', '')}.`,
  };
}

export async function executePrivacyCommand(
  command,
  navigate
) {
  const value = command.text.toLowerCase();

  if (value.includes('emergency privacy')) {
    navigate('/social-privacy-settings');

    return {
      executed: true,
      message:
        'Opening emergency privacy controls.',
    };
  }

  navigate('/social-privacy-settings');

  return {
    executed: true,
    message: 'Opening privacy settings.',
  };
}

export async function executeSecurityCommand(
  command,
  navigate
) {
  const value = command.text.toLowerCase();

  if (
    value.includes('logout all') ||
    value.includes('logout every')
  ) {
    navigate('/session-security');
    return {
      executed: true,
      confirmationRequired: true,
      message:
        'Please confirm logout everywhere in Session Security.',
    };
  }

  if (value.includes('scan')) {
    navigate('/threat-center');
    return {
      executed: true,
      message: 'Opening Threat Center.',
    };
  }

  if (value.includes('app lock')) {
    navigate('/app-lock-settings');
    return {
      executed: true,
      message: 'Opening app lock settings.',
    };
  }

  navigate('/security-center');

  return {
    executed: true,
    message: 'Opening Security Center.',
  };
}

export async function executeChatCommand(
  command,
  navigate
) {
  navigate('/chats');

  return {
    executed: true,
    message: 'Opening chats.',
  };
}

export async function executeSettingsCommand(
  command,
  navigate
) {
  navigate('/profile-settings');

  return {
    executed: true,
    message: 'Opening settings.',
  };
}

export async function executeAutomationCommand(
  command
) {
  if (guestMode()) {
    return {
      executed: false,
      message:
        'Sign in to create or run automations.',
    };
  }

  const rules = await getAutomationRules();
  const rule = rules.find((item) =>
    command.text
      .toLowerCase()
      .includes(item.trigger.replace('_', ' '))
  );

  if (!rule) {
    return {
      executed: false,
      message: 'No matching automation rule found.',
    };
  }

  return executeAutomationRule(rule, {
    source: 'voice-command',
  });
}

export async function executeCommand(
  command,
  {
    navigate,
    speak,
  } = {}
) {
  const parsed =
    typeof command === 'string'
      ? parseCommand(command)
      : command;

  let result;

  if (parsed.intent === 'navigation') {
    result = executeNavigationCommand(
      parsed,
      navigate
    );
  } else if (parsed.intent === 'privacy') {
    result = await executePrivacyCommand(
      parsed,
      navigate
    );
  } else if (parsed.intent === 'security') {
    result = await executeSecurityCommand(
      parsed,
      navigate
    );
  } else if (parsed.intent === 'chat') {
    result = await executeChatCommand(
      parsed,
      navigate
    );
  } else if (parsed.intent === 'settings') {
    result = await executeSettingsCommand(
      parsed,
      navigate
    );
  } else if (parsed.intent === 'automation') {
    result = await executeAutomationCommand(
      parsed
    );
  } else {
    result = await askAssistant(parsed.text, {
      source: 'voice-command',
    });
  }

  const message =
    result?.message ||
    result?.content ||
    'Command completed.';

  speak?.(message);

  storeCommand(parsed, {
    ...result,
    message,
  });

  return {
    ...result,
    message,
  };
}

export function getCommandHistory() {
  return readHistory();
}

export function clearCommandHistory() {
  saveHistory([]);
  return true;
}