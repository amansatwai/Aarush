import { useCallback, useEffect, useState } from 'react';

import {
  getProjects,
  getRenderingStatus,
  initializeVideoEditor,
} from '../utils/videoEditingEngine';
import {
  getEnhancementStatus,
  initializeAIMediaEnhancement,
} from '../utils/aiMediaEnhancementEngine';

export default function useVideoEditor() {
  const [projects, setProjects] = useState([]);
  const [editor, setEditor] = useState(null);
  const [enhancement, setEnhancement] =
    useState(null);
  const [rendering, setRendering] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        projectList,
        editorStatus,
        enhancementStatus,
      ] = await Promise.all([
        getProjects({
          page: 0,
          pageSize: 30,
        }),
        Promise.resolve(
          initializeVideoEditor()
        ),
        Promise.resolve(
          initializeAIMediaEnhancement()
        ),
      ]);

      setProjects(projectList || []);
      setEditor(editorStatus);
      setEnhancement({
        ...enhancementStatus,
        ...getEnhancementStatus(),
      });

      if (projectList?.[0]?.id) {
        setRendering(
          await getRenderingStatus(
            projectList[0].id
          )
        );
      }
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load Creator Production.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    projects,
    editor,
    enhancement,
    rendering,
    loading,
    error,
    refresh,
  };
}