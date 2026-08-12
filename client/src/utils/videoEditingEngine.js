import { supabase } from '../lib/supabase';

const PROJECTS_TABLE = 'video_editing_projects';
const RENDER_TABLE = 'video_render_jobs';

export const EXPORT_PRESETS = [
  'Reel',
  'Story',
  'Feed',
  'YouTube',
  'Shorts',
  '720p',
  '1080p',
  '1440p',
  '4K',
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
      'Sign in to manage editing projects.'
    );
  }

  return user;
}

function localKey() {
  return 'aarush_local_video_projects';
}

function getLocalProjects() {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(
      localStorage.getItem(localKey()) || '[]'
    );
  } catch {
    return [];
  }
}

function saveLocalProjects(projects) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      localKey(),
      JSON.stringify(projects)
    );
  }
}

export async function initializeVideoEditor() {
  return {
    enabled: true,
    guest: guestMode(),
    timeline_ready: true,
    tracks_ready: true,
    presets: EXPORT_PRESETS,
  };
}

export async function createProject(
  payload = {}
) {
  const project = {
    name: payload.name || 'Untitled project',
    clips: payload.clips || [],
    tracks: payload.tracks || [],
    overlays: payload.overlays || [],
    filters: payload.filters || [],
    effects: payload.effects || [],
    audio: payload.audio || [],
    settings: payload.settings || {
      aspect_ratio: '9:16',
      preset: 'Reel',
      resolution: '1080p',
      frame_rate: 30,
      watermark: false,
    },
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (guestMode()) {
    const local = {
      ...project,
      id: crypto.randomUUID(),
      local_only: true,
    };

    saveLocalProjects([
      local,
      ...getLocalProjects(),
    ]);

    return local;
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
    .insert({
      ...project,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function openProject(projectId) {
  if (guestMode()) {
    return getLocalProjects().find(
      (project) => project.id === projectId
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
    .select('*')
    .eq('id', projectId)
    .eq('owner_id', user.id)
    .maybeSingle();

  if (error) throw error;

  return data || null;
}

export async function saveProject(
  projectId,
  patch
) {
  if (guestMode()) {
    const projects = getLocalProjects().map(
      (project) =>
        project.id === projectId
          ? {
              ...project,
              ...patch,
              updated_at: new Date().toISOString(),
            }
          : project
    );

    saveLocalProjects(projects);
    return projects.find(
      (project) => project.id === projectId
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function duplicateProject(
  projectId
) {
  const project = await openProject(projectId);

  if (!project) {
    throw new Error('Project not found.');
  }

  return createProject({
    ...project,
    name: `${project.name} copy`,
  });
}

export async function deleteProject(projectId) {
  if (guestMode()) {
    saveLocalProjects(
      getLocalProjects().filter(
        (project) => project.id !== projectId
      )
    );

    return true;
  }

  const user = await requireUser();

  const { error } = await supabase
    .from(PROJECTS_TABLE)
    .delete()
    .eq('id', projectId)
    .eq('owner_id', user.id);

  if (error) throw error;

  return true;
}

function updateClips(
  project,
  operation
) {
  return {
    ...project,
    clips: operation(project.clips || []),
    updated_at: new Date().toISOString(),
  };
}

export async function trimVideo(
  projectId,
  clipId,
  start,
  end
) {
  const project = await openProject(projectId);

  return saveProject(
    projectId,
    updateClips(project, (clips) =>
      clips.map((clip) =>
        clip.id === clipId
          ? { ...clip, start, end }
          : clip
      )
    )
  );
}

export async function splitClip(
  projectId,
  clipId,
  time
) {
  const project = await openProject(projectId);

  return saveProject(
    projectId,
    updateClips(project, (clips) => {
      const result = [];

      clips.forEach((clip) => {
        if (clip.id !== clipId) {
          result.push(clip);
          return;
        }

        result.push(
          {
            ...clip,
            id: crypto.randomUUID(),
            end: time,
          },
          {
            ...clip,
            id: crypto.randomUUID(),
            start: time,
          }
        );
      });

      return result;
    })
  );
}

export async function mergeClips(
  projectId,
  clipIds
) {
  const project = await openProject(projectId);

  return saveProject(
    projectId,
    updateClips(project, (clips) => {
      const selected = clips.filter((clip) =>
        clipIds.includes(clip.id)
      );

      if (!selected.length) return clips;

      const merged = {
        ...selected[0],
        id: crypto.randomUUID(),
        merged_clips: clipIds,
      };

      return [
        ...clips.filter(
          (clip) => !clipIds.includes(clip.id)
        ),
        merged,
      ];
    })
  );
}

async function addProjectItem(
  projectId,
  key,
  item
) {
  const project = await openProject(projectId);

  return saveProject(projectId, {
    [key]: [
      ...(project?.[key] || []),
      {
        ...item,
        id: item.id || crypto.randomUUID(),
      },
    ],
  });
}

export async function addTransition(
  projectId,
  transition
) {
  return addProjectItem(
    projectId,
    'transitions',
    transition
  );
}

export async function addText(projectId, text) {
  return addProjectItem(
    projectId,
    'overlays',
    {
      type: 'text',
      ...text,
    }
  );
}

export async function addSticker(
  projectId,
  sticker
) {
  return addProjectItem(
    projectId,
    'overlays',
    {
      type: 'sticker',
      ...sticker,
    }
  );
}

export async function addFilter(
  projectId,
  filter
) {
  return addProjectItem(
    projectId,
    'filters',
    filter
  );
}

export async function addEffect(
  projectId,
  effect
) {
  return addProjectItem(
    projectId,
    'effects',
    effect
  );
}

export async function addMusic(
  projectId,
  music
) {
  return addProjectItem(
    projectId,
    'audio',
    music
  );
}

export async function adjustVolume(
  projectId,
  clipId,
  volume
) {
  return saveProject(projectId, {
    audio_adjustments: {
      [clipId]: {
        volume,
      },
    },
  });
}

export async function adjustSpeed(
  projectId,
  clipId,
  speed
) {
  return saveProject(projectId, {
    speed_adjustments: {
      [clipId]: {
        speed,
      },
    },
  });
}

export async function reverseVideo(
  projectId,
  clipId
) {
  return saveProject(projectId, {
    reverse_clips: [clipId],
  });
}

export async function exportVideo(
  projectId,
  settings = {}
) {
  if (guestMode()) {
    throw new Error(
      'Guests can create local projects but cannot cloud-render exports.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(RENDER_TABLE)
    .insert({
      project_id: projectId,
      owner_id: user.id,
      settings,
      status: 'Pending',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getRenderingStatus(
  projectId
) {
  if (guestMode()) {
    return {
      status: 'local-only',
      project_id: projectId,
    };
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(RENDER_TABLE)
    .select('*')
    .eq('project_id', projectId)
    .eq('owner_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data || {
    status: 'idle',
    project_id: projectId,
  };
}

export async function getProjects({
  page = 0,
  pageSize = 30,
} = {}) {
  if (guestMode()) {
    const projects = getLocalProjects();

    return projects.slice(
      page * pageSize,
      page * pageSize + pageSize
    );
  }

  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
    .select('*')
    .eq('owner_id', user.id)
    .order('updated_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}