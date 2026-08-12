import {
  AppState,
  NativeModules,
} from 'react-native';

const MODULE_NAME = 'AarushBackgroundModule';

let backgroundModule = null;
let taskTimers = new Map();

let backgroundState = {
  ready: false,
  running: false,
  paused: false,
  tasks: [],
  last_sync_at: null,
  last_backup_at: null,
  last_security_check_at: null,
};

function getModule() {
  if (!backgroundModule) {
    backgroundModule =
      NativeModules?.[MODULE_NAME] || null;
  }

  return backgroundModule;
}

export async function initializeNativeBackground() {
  const module = getModule();

  backgroundState = {
    ...backgroundState,
    ready: true,
    native_module_ready: Boolean(module),
    app_state: AppState.currentState,
  };

  return backgroundState;
}

export async function startBackgroundService(
  options = {}
) {
  const module = getModule();

  if (module?.startService) {
    await module.startService(options);
  }

  backgroundState = {
    ...backgroundState,
    running: true,
    paused: false,
    started_at: new Date().toISOString(),
  };

  return backgroundState;
}

export async function stopBackgroundService() {
  const module = getModule();

  if (module?.stopService) {
    await module.stopService();
  }

  backgroundState = {
    ...backgroundState,
    running: false,
    paused: false,
  };

  return backgroundState;
}

export async function pauseBackgroundService() {
  const module = getModule();

  if (module?.pauseService) {
    await module.pauseService();
  }

  backgroundState = {
    ...backgroundState,
    paused: true,
  };

  return backgroundState;
}

export async function resumeBackgroundService() {
  const module = getModule();

  if (module?.resumeService) {
    await module.resumeService();
  }

  backgroundState = {
    ...backgroundState,
    running: true,
    paused: false,
  };

  return backgroundState;
}

export async function scheduleBackgroundTask({
  id,
  type = 'sync',
  delay = 60000,
  repeat = false,
  handler,
} = {}) {
  const taskId =
    id || `task-${Date.now()}`;

  if (taskTimers.has(taskId)) {
    clearInterval(taskTimers.get(taskId));
  }

  const callback = async () => {
    try {
      await handler?.();

      backgroundState = {
        ...backgroundState,
        tasks: backgroundState.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                last_run_at:
                  new Date().toISOString(),
                status: 'completed',
              }
            : task
        ),
      };
    } catch {
      backgroundState = {
        ...backgroundState,
        tasks: backgroundState.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: 'failed',
              }
            : task
        ),
      };
    }
  };

  const timer = repeat
    ? setInterval(callback, delay)
    : setTimeout(callback, delay);

  taskTimers.set(taskId, timer);

  backgroundState = {
    ...backgroundState,
    tasks: [
      ...backgroundState.tasks.filter(
        (task) => task.id !== taskId
      ),
      {
        id: taskId,
        type,
        delay,
        repeat,
        status: 'scheduled',
        created_at: new Date().toISOString(),
      },
    ],
  };

  return taskId;
}

export async function cancelBackgroundTask(
  taskId
) {
  const timer = taskTimers.get(taskId);

  if (timer) {
    clearTimeout(timer);
    clearInterval(timer);
    taskTimers.delete(taskId);
  }

  backgroundState = {
    ...backgroundState,
    tasks: backgroundState.tasks.filter(
      (task) => task.id !== taskId
    ),
  };

  return true;
}

export async function runBackgroundSync(
  handler
) {
  const module = getModule();

  if (module?.runSync) {
    await module.runSync();
  }

  await handler?.();

  backgroundState = {
    ...backgroundState,
    last_sync_at: new Date().toISOString(),
  };

  return true;
}

export async function runOfflineQueue(
  handler
) {
  await handler?.();

  return {
    completed: true,
    type: 'offline_queue',
  };
}

export async function runBackupTask(handler) {
  await handler?.();

  backgroundState = {
    ...backgroundState,
    last_backup_at: new Date().toISOString(),
  };

  return {
    completed: true,
    type: 'backup',
  };
}

export async function runSecurityMonitoring(
  handler
) {
  await handler?.();

  backgroundState = {
    ...backgroundState,
    last_security_check_at:
      new Date().toISOString(),
  };

  return {
    completed: true,
    type: 'security',
  };
}

export function getBackgroundStatus() {
  return {
    ...backgroundState,
    app_state: AppState.currentState,
    active_tasks: taskTimers.size,
    work_manager_ready: true,
    background_fetch_ready: true,
    foreground_service_ready: true,
  };
}