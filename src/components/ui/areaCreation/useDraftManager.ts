import { useState, useEffect, useCallback, useRef } from 'react';
import {
  saveDraft,
  getDraft,
  getUserDrafts,
  getEditDraft,
  deleteDraft,
  AreaDraft
} from '../../../services/areaDraftService';
import { CreateAreaPayload } from '../../../services/areasService';
import { ServiceData, BackendArea, BackendAction, BackendReaction, ConnectionData } from '../../../types';

interface UseDraftManagerProps {
  areaName: string;
  areaDescription: string;
  servicesState: ServiceData[];
  connections: ConnectionData[];
  draftId?: string;
  areaId?: string;
  isNewArea: boolean;
  transformServiceDataToPayload: (services: ServiceData[], name: string, description: string, connections: ConnectionData[]) => Promise<CreateAreaPayload>;
  transformBackendDataToServiceData: (area: BackendArea) => Promise<ServiceData[]>;
  onDraftLoaded: (data: {
    name: string;
    description: string;
    services: ServiceData[];
    connections: ConnectionData[];
    draftId: string;
    savedAt: string;
  }) => void;
  onDraftRejected: () => void;
  onShowDraftModal: (draftData: { draftId: string; name: string; savedAt: string }, onAccept: () => void, onReject: () => void) => void;
}

export function useDraftManager({
  areaName,
  areaDescription,
  servicesState,
  connections,
  draftId,
  areaId,
  isNewArea,
  transformServiceDataToPayload,
  transformBackendDataToServiceData,
  onDraftLoaded,
  onDraftRejected,
  onShowDraftModal,
}: UseDraftManagerProps) {
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(draftId);
  const [draftSavedAt, setDraftSavedAt] = useState<string | undefined>(undefined);
  const [hasShownModal, setHasShownModal] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const autoSaveDraft = useCallback(async () => {
    if (!areaName && servicesState.length === 0) {
      return;
    }

    try {
      const payload = await transformServiceDataToPayload(servicesState, areaName || 'Untitled Draft', areaDescription, connections);

      const transformedConnections = connections.map(conn => ({
        id: conn.id,
        sourceServiceId: conn.sourceId,
        targetServiceId: conn.targetId,
        linkType: conn.linkData.type,
        mapping: conn.linkData.mapping || {},
        condition: conn.linkData.condition || {},
        order: conn.linkData.order || 0,
      }));

      const draftPayload: AreaDraft = {
        name: payload.name,
        description: payload.description || '',
        actions: payload.actions || [],
        reactions: payload.reactions || [],
        connections: transformedConnections,
        layoutMode: 'vertical',
        draftId: currentDraftId,
        savedAt: draftSavedAt,
      };

      // Si on édite une AREA existante (areaId présent), on envoie l'areaId
      // Sinon, on utilise le draftId pour les nouvelles AREAs
      const savedDraftId = await saveDraft(draftPayload, areaId);
      setCurrentDraftId(savedDraftId);
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }, [areaName, areaDescription, servicesState, connections, currentDraftId, draftSavedAt, transformServiceDataToPayload, areaId]);

  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveDraft();
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [areaName, areaDescription, servicesState, connections, autoSaveDraft]);

  const loadDraftFromData = useCallback(async (draft: { draftId: string; name: string; description: string; userId: string; actions: unknown[]; reactions: unknown[]; connections: unknown[]; savedAt: string }) => {
    const mockArea: BackendArea = {
      id: draft.draftId,
      name: draft.name,
      description: draft.description,
      enabled: true,
      userId: draft.userId,
      userEmail: '',
      actions: draft.actions as BackendAction[],
      reactions: draft.reactions as BackendReaction[],
      createdAt: draft.savedAt,
      updatedAt: draft.savedAt,
    };

    const transformedServices = await transformBackendDataToServiceData(mockArea);

    const transformedConnections = draft.connections && Array.isArray(draft.connections)
      ? draft.connections.map((conn: unknown) => {
          const c = conn as { id?: string; sourceServiceId?: string; sourceId?: string; targetServiceId?: string; targetId?: string; linkType?: string; mapping?: Record<string, unknown>; condition?: Record<string, unknown>; order?: number };
          return {
            id: c.id || `conn-${Math.random()}`,
            sourceId: c.sourceServiceId || c.sourceId || '',
            targetId: c.targetServiceId || c.targetId || '',
            linkData: {
              type: (c.linkType || 'chain') as 'chain' | 'conditional' | 'parallel' | 'sequential',
              mapping: (c.mapping || {}) as Record<string, string>,
              condition: c.condition || {},
              order: c.order || 0,
            }
          };
        })
      : [];

    setCurrentDraftId(draft.draftId);
    setDraftSavedAt(draft.savedAt);

    onDraftLoaded({
      name: draft.name,
      description: draft.description,
      services: transformedServices,
      connections: transformedConnections as ConnectionData[],
      draftId: draft.draftId,
      savedAt: draft.savedAt,
    });
  }, [transformBackendDataToServiceData, onDraftLoaded]);

  useEffect(() => {
    const loadDraftData = async () => {
      if (draftId) {
        try {
          const draft = await getDraft(draftId);
          if (draft) {
            await loadDraftFromData(draft);
          }
        } catch (error) {
          console.error('Error loading draft data:', error);
        }
      } else if (areaId && !isNewArea) {
        try {
          const editDraft = await getEditDraft(areaId);
          if (editDraft) {
            await loadDraftFromData(editDraft);
            setHasShownModal(true);
          }
        } catch (error) {
          console.error('Error loading edit draft:', error);
        }
      } else if (isNewArea && !areaId && !hasShownModal) {
        try {
          const drafts = await getUserDrafts();
          if (drafts && drafts.length > 0) {
            const latestDraft = drafts.sort((a, b) =>
              new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
            )[0];

            setHasShownModal(true);

            const draftAge = Date.now() - new Date(latestDraft.savedAt).getTime();
            const FIVE_MINUTES = 5 * 60 * 1000;

            if (draftAge > FIVE_MINUTES) {
              const handleAccept = async () => {
                await loadDraftFromData(latestDraft);
              };

              const handleReject = async () => {
                try {
                  await deleteDraft(latestDraft.draftId);
                  onDraftRejected();
                } catch (error) {
                  console.error('Error deleting draft:', error);
                }
              };

              onShowDraftModal(
                {
                  draftId: latestDraft.draftId,
                  name: latestDraft.name,
                  savedAt: latestDraft.savedAt,
                },
                handleAccept,
                handleReject
              );
            } else {
              await loadDraftFromData(latestDraft);
            }
          }
        } catch (error) {
          console.error('Error loading user drafts:', error);
        }
      }
    };

    loadDraftData();
  }, [draftId, isNewArea, areaId, hasShownModal, loadDraftFromData, onShowDraftModal, onDraftRejected]);

  const handleDeleteDraft = useCallback(async () => {
    if (currentDraftId) {
      try {
        await deleteDraft(currentDraftId);
        setCurrentDraftId(undefined);
        setDraftSavedAt(undefined);
      } catch (error) {
        console.error('Error deleting draft:', error);
      }
    }
  }, [currentDraftId]);

  return {
    currentDraftId,
    setCurrentDraftId,
    draftSavedAt,
    setDraftSavedAt,
    handleDeleteDraft,
  };
}
