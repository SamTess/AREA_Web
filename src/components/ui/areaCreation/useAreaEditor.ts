import { useState, useEffect } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { notifications } from '@mantine/notifications';
import {
  getAreaById,
  updateAreaComplete,
  createAreaWithActions,
  CreateAreaPayload,
  getServices,
  runAreaById,
  getActionDefinitionById
} from '../../../services/areasService';
import { ServiceState, ServiceData, BackendArea, BackendService, ConnectionData, ActivationConfig } from '../../../types';

let servicesCache: BackendService[] | null = null;

const transformBackendDataToServiceData = async (area: BackendArea): Promise<ServiceData[]> => {
  const serviceData: ServiceData[] = [];
  if (!servicesCache) {
    try {
      servicesCache = await getServices();
    } catch (error) {
      console.error('Error fetching services:', error);
      servicesCache = [];
    }
  }
  const findServiceInfoByActionDefinitionId = async (actionDefinitionId: string) => {
    try {
      const actionDefinition = await getActionDefinitionById(actionDefinitionId);

      if (actionDefinition && actionDefinition.serviceKey) {
        const service = servicesCache?.find(s => s.key === actionDefinition.serviceKey);

        if (service) {
          return {
            logo: service.iconLightUrl || service.iconDarkUrl || '/file.svg',
            serviceName: service.name,
            serviceKey: service.key,
            serviceId: service.id,
            actionDefinition
          };
        }

        return {
          logo: '/file.svg',
          serviceName: actionDefinition.serviceName,
          serviceKey: actionDefinition.serviceKey,
          serviceId: actionDefinition.serviceId,
          actionDefinition
        };
      }

      if (!servicesCache || servicesCache.length === 0) {
        console.warn('No services available for actionDefinitionId:', actionDefinitionId);
        return {
          logo: '/file.svg',
          serviceName: 'Unknown Service',
          serviceKey: 'unknown',
          serviceId: 'unknown',
          actionDefinition: null
        };
      }

      const defaultService = servicesCache.find(s => s.key === 'github') || servicesCache[0];

      if (defaultService) {
        return {
          logo: defaultService.iconLightUrl || defaultService.iconDarkUrl || '/file.svg',
          serviceName: defaultService.name,
          serviceKey: defaultService.key,
          serviceId: defaultService.id,
          actionDefinition: null
        };
      }

      return {
        logo: '/file.svg',
        serviceName: 'Unknown Service',
        serviceKey: 'unknown',
        serviceId: 'unknown',
        actionDefinition: null
      };
    } catch (error) {
      console.error('Error finding service info for actionDefinitionId:', actionDefinitionId, error);

      if (servicesCache && servicesCache.length > 0) {
        const defaultService = servicesCache.find(s => s.key === 'github') || servicesCache[0];
        if (defaultService) {
          return {
            logo: defaultService.iconLightUrl || defaultService.iconDarkUrl || '/file.svg',
            serviceName: defaultService.name,
            serviceKey: defaultService.key,
            serviceId: defaultService.id,
            actionDefinition: null
          };
        }
      }

      return {
        logo: '/file.svg',
        serviceName: 'Unknown Service',
        serviceKey: 'unknown',
        serviceId: 'unknown',
        actionDefinition: null
      };
    }
  };

  const actionsArray = Array.isArray(area.actions) ? area.actions : [];

  for (const [, action] of actionsArray.entries()) {


    let actionDefinitionId = '';
    let actionName = 'Unnamed Action';
    let actionParameters = {};
    let actionId = '';
    let activationConfig: ActivationConfig = { type: 'webhook' };

    if ('actionDefinitionId' in action && typeof action.actionDefinitionId === 'string') {
      actionDefinitionId = action.actionDefinitionId;
      actionName = action.name || 'Unnamed Action';
      actionParameters = action.parameters || {};
      actionId = action.id || `action-${Date.now()}-${Math.random()}`;
      activationConfig = action.activationConfig || { type: 'webhook' };
    } else {
      const rawAction = action as unknown as Record<string, unknown>;
      actionDefinitionId = String(rawAction.actionDefinitionId || '');
      actionName = String(rawAction.name || 'Unnamed Action');
      actionParameters = (rawAction.parameters as Record<string, unknown>) || {};
      actionId = String(rawAction.id || `action-${Date.now()}-${Math.random()}`);
      activationConfig = (rawAction.activationConfig as ActivationConfig) || { type: 'webhook' };
    }

    if (actionDefinitionId) {
      const serviceInfo = await findServiceInfoByActionDefinitionId(actionDefinitionId);

      serviceData.push({
        id: actionId,
        logo: serviceInfo.logo,
        serviceName: serviceInfo.serviceName,
        serviceKey: serviceInfo.serviceKey,
        event: actionName,
        cardName: actionName,
        state: ServiceState.Success,
        actionId: 0,
        serviceId: serviceInfo.serviceId,
        actionDefinitionId: actionDefinitionId,
        fields: actionParameters,
        activationConfig: activationConfig
      });
    } else {
      console.warn(`DEBUG - No actionDefinitionId found for action:`, action);
    }
  }

  const reactionsArray = Array.isArray(area.reactions) ? area.reactions : [];

  for (const [, reaction] of reactionsArray.entries()) {
    let actionDefinitionId = '';
    let reactionName = 'Unnamed Reaction';
    let reactionParameters = {};
    let reactionId = '';
    let activationConfig: ActivationConfig = { type: 'chain' };

    if ('actionDefinitionId' in reaction && typeof reaction.actionDefinitionId === 'string') {
      actionDefinitionId = reaction.actionDefinitionId;
      reactionName = reaction.name || 'Unnamed Reaction';
      reactionParameters = reaction.parameters || {};
      reactionId = reaction.id || `reaction-${Date.now()}-${Math.random()}`;
      activationConfig = reaction.activationConfig || { type: 'chain' };
    } else {
      const rawReaction = reaction as unknown as Record<string, unknown>;
      actionDefinitionId = String(rawReaction.actionDefinitionId || '');
      reactionName = String(rawReaction.name || 'Unnamed Reaction');
      reactionParameters = (rawReaction.parameters as Record<string, unknown>) || {};
      reactionId = String(rawReaction.id || `reaction-${Date.now()}-${Math.random()}`);
      activationConfig = (rawReaction.activationConfig as ActivationConfig) || { type: 'chain' };
    }

    if (actionDefinitionId) {
      const serviceInfo = await findServiceInfoByActionDefinitionId(actionDefinitionId);

      serviceData.push({
        id: reactionId,
        logo: serviceInfo.logo,
        serviceName: serviceInfo.serviceName,
        serviceKey: serviceInfo.serviceKey,
        event: reactionName,
        cardName: reactionName,
        state: ServiceState.Success,
        actionId: 0,
        serviceId: serviceInfo.serviceId,
        actionDefinitionId: actionDefinitionId,
        fields: reactionParameters,
        activationConfig: activationConfig
      });
    } else {
      console.warn(`DEBUG - No actionDefinitionId found for reaction:`, reaction);
    }
  }

  return serviceData;
};

const transformServiceDataToPayload = async (services: ServiceData[], areaName: string, areaDescription: string, connections: ConnectionData[] = []): Promise<CreateAreaPayload> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actions: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reactions: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const links: any[] = [];

  console.log('Starting transformation with services:', services);

  for (let index = 0; index < services.length; index++) {
    const service = services[index];
    console.log(`Processing service ${index}:`, {
      serviceName: service.serviceName,
      actionDefinitionId: service.actionDefinitionId,
      event: service.event
    });

    let isEvent = false;
    let isReaction = false;
    if (service.actionDefinitionId) {
      try {
        const actionDef = await getActionDefinitionById(service.actionDefinitionId);
        isEvent = actionDef.isEventCapable && !actionDef.isExecutable;
        isReaction = actionDef.isExecutable && !actionDef.isEventCapable;
        console.log(`Action ${service.actionDefinitionId}: isEvent=${isEvent}, isReaction=${isReaction}`);
      } catch (error) {
        console.error(`Failed to fetch action definition for ${service.actionDefinitionId}:`, error);
      }
    }

    if (index === 0) {
      let actionActivationConfig = service.activationConfig;
      if (isEvent && actionActivationConfig?.type === 'chain') {
        actionActivationConfig = { type: 'webhook' };
      }
      if (isEvent && actionActivationConfig?.type === 'cron') {
        actionActivationConfig = { type: 'webhook' };
      }
      actions.push({
        actionDefinitionId: service.actionDefinitionId || '',
        name: service.event || service.cardName || 'Unnamed Action',
        description: `Action for ${service.serviceName}`,
        parameters: service.fields || {},
        activationConfig: actionActivationConfig ? {
          type: actionActivationConfig.type,
          ...(actionActivationConfig.cron_expression && { cron_expression: actionActivationConfig.cron_expression }),
          ...(actionActivationConfig.poll_interval && {
            poll_interval: actionActivationConfig.poll_interval,
            interval_seconds: actionActivationConfig.poll_interval
          }),
          ...(actionActivationConfig.webhook_url && { webhook_url: actionActivationConfig.webhook_url }),
          ...(actionActivationConfig.secret_token && { secret_token: actionActivationConfig.secret_token }),
        } : {
          type: 'webhook'
        }
      });
    } else {
      let reactionActivationConfig = service.activationConfig || { type: 'chain' };
      if (isReaction && reactionActivationConfig.type === 'webhook') {
        reactionActivationConfig = { type: 'chain' };
      }
      if (isReaction && reactionActivationConfig.type === 'poll') {
        reactionActivationConfig = { type: 'chain' };
      }

      reactions.push({
        actionDefinitionId: service.actionDefinitionId || '',
        name: service.event || service.cardName || 'Unnamed Reaction',
        description: `Reaction for ${service.serviceName}`,
        parameters: service.fields || {},
        mapping: {},
        condition: {},
        order: index - 1,
        activationConfig: reactionActivationConfig
      });
    }
  }

  connections.forEach(connection => {
    const sourceService = services.find(s => s.id === connection.sourceId);
    const targetService = services.find(s => s.id === connection.targetId);

    if (sourceService && targetService) {
      links.push({
        sourceActionDefinitionId: sourceService.actionDefinitionId,
        targetActionDefinitionId: targetService.actionDefinitionId,
        mapping: connection.linkData?.mapping || {},
        condition: connection.linkData?.condition || {},
        order: connection.linkData?.order || 0
      });
    }
  });

  const payload = {
    name: areaName || 'Unnamed Area',
    description: areaDescription,
    actions,
    reactions,
    links
  };

  console.log('Final payload to send:', JSON.stringify(payload, null, 2));

  return payload;
};

export function useAreaEditor(areaId?: string) {
  const isNewArea = areaId === undefined;

  const [servicesState, setServicesState] = useState<ServiceData[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [areaDescription, setAreaDescription] = useState('');

  const [connections, setConnections] = useState<ConnectionData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (areaId !== undefined) {
        try {
          console.log('Loading area with ID:', areaId);
          const area = await getAreaById(areaId);
          console.log('Loaded area data:', area);

          if (area) {
            setAreaName(area.name);
            setAreaDescription(area.description);

            console.log('Raw actions from backend:', area.actions);
            console.log('Raw reactions from backend:', area.reactions);

            const transformedServices = await transformBackendDataToServiceData(area);
            console.log('Transformed services:', transformedServices);
            setServicesState(transformedServices);
          }
        } catch (error) {
          console.error('Error loading area data:', error);
        }
      }
    };
    loadData();
  }, [areaId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setServicesState((services) => {
      const oldIndex = services.findIndex((service) => service.id === active.id);
      const newIndex = services.findIndex((service) => service.id === over.id);
      return arrayMove(services, oldIndex, newIndex);
    });
  };

  const handleSave = async () => {
    try {
      if (!areaName || areaName.trim() === '') {
        notifications.show({
          title: 'Error',
          message: 'AREA name is required',
          color: 'red',
        });
        return;
      }

      if (servicesState.length === 0) {
        notifications.show({
          title: 'Error',
          message: 'At least one service is required',
          color: 'red',
        });
        return;
      }

      if (isNewArea) {
        console.log('Services state before transform:', servicesState);
        const payload = await transformServiceDataToPayload(servicesState, areaName, areaDescription, connections);
        console.log('Creating area with payload:', payload);

        const newArea = await createAreaWithActions(payload);
        console.log('New area created:', newArea);
        notifications.show({
          title: 'Success',
          message: `AREA "${areaName}" was created successfully!`,
          color: 'green',
        });
      } else {
          console.log('Services state before transform:', servicesState);
          const payload = await transformServiceDataToPayload(servicesState, areaName, areaDescription, connections);
          console.log('Updating area with payload:', payload);

          await updateAreaComplete(areaId!, payload);
          console.log('Area updated successfully');

          notifications.show({
            title: 'Success',
            message: `AREA "${areaName}" was updated successfully!`,
            color: 'green',
          });
      }
    } catch (error) {
        console.error('Error saving area:', error);

        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        notifications.show({
          title: 'Error',
          message: `Failed to save AREA: ${errorMessage}`,
          color: 'red',
        });
      }
    };

    const handleRun = async () => {
      if (!areaId) {
        notifications.show({
          title: 'Error',
          message: 'Unable to run AREA: missing ID',
          color: 'red',
        });
        return;
      }

      try {
        await runAreaById(areaId);
        console.log('Area executed successfully');

        notifications.show({
          title: 'Success',
          message: `AREA "${areaName}" was executed successfully!`,
          color: 'green',
        });
      } catch (error) {
        console.error('Error running area:', error);

        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        notifications.show({
          title: 'Error',
          message: `Failed to execute AREA: ${errorMessage}`,
          color: 'red',
        });
      }
  };

  const addNewServiceBelow = () => {
    const newId = `new-${Date.now()}`;
    const newService: ServiceData = {
      id: newId,
      logo: '',
      serviceName: '',
      event: '',
      cardName: '',
      state: ServiceState.Configuration,
      actionId: 0,
      serviceId: '',
      activationConfig: {
        type: 'chain'
      }
    };
    setServicesState(prev => [...prev, newService]);
  };

  const removeService = (id: string) => {
    setServicesState((prev) => prev.filter((s) => s.id !== id));
  };

  const editService = (service: ServiceData) => {
    setSelectedService(service);
    setModalOpened(true);
  };

  const updateService = (updatedService: ServiceData) => {
    setServicesState(prev => prev.map(s => {
      if (s.id === updatedService.id) {
        const preservedActionDefinitionId = updatedService.actionDefinitionId || s.actionDefinitionId;
        return {
          ...updatedService,
          actionDefinitionId: preservedActionDefinitionId
        };
      }
      return s;
    }));

    if (selectedService && selectedService.id === updatedService.id) {
      const preservedActionDefinitionId = updatedService.actionDefinitionId || selectedService.actionDefinitionId;
      setSelectedService({
        ...updatedService,
        actionDefinitionId: preservedActionDefinitionId
      });
    }
  };

  const moveServiceUp = (id: string) => {
    setServicesState(prev => {
      const index = prev.findIndex(service => service.id === id);
      if (index <= 0)
        return prev;

      return arrayMove(prev, index, index - 1);
    });
  };

  const moveServiceDown = (id: string) => {
    setServicesState(prev => {
      const index = prev.findIndex(service => service.id === id);
      if (index < 0 || index >= prev.length - 1)
        return prev;

      return arrayMove(prev, index, index + 1);
    });
  };

  const duplicateService = (id: string) => {
    setServicesState(prev => {
      const serviceToDuplicate = prev.find(service => service.id === id);
      if (!serviceToDuplicate)
        return prev;
      const newId = `new-${Date.now()}`;
      const duplicatedService = {
        ...serviceToDuplicate,
        id: newId,
        position: { x: (serviceToDuplicate.position?.x || 0) + 50, y: (serviceToDuplicate.position?.y || 0) + 50 }
      };
      const index = prev.findIndex(service => service.id === id);
      const newServices = [...prev];
      newServices.splice(index + 1, 0, duplicatedService);
      return newServices;
    });
  };

  const createConnection = (connection: ConnectionData) => {
    setConnections(prev => [...prev, connection]);

    applyLinkEffect(connection);
  };

  const applyLinkEffect = (connection: ConnectionData) => {
    const sourceService = servicesState.find(s => s.id === connection.sourceId);
    const targetService = servicesState.find(s => s.id === connection.targetId);

    if (!sourceService || !targetService) return;

    const { type } = connection.linkData;

    switch (type) {
      case 'chain':
        updateService({
          ...targetService,
          activationConfig: {
            type: 'chain',
          },
          fields: {
            ...targetService.fields,
            _chainSource: sourceService.serviceName,
            _chainSourceId: sourceService.id,
            _chainMapping: connection.linkData.mapping || {},
          }
        });

        updateService({
          ...sourceService,
          fields: {
            ...sourceService.fields,
            _hasChainTarget: true,
            _chainTargets: [...(sourceService.fields?._chainTargets as string[] || []), targetService.id]
          }
        });
        break;

      case 'conditional':
        updateService({
          ...targetService,
          activationConfig: {
            type: 'webhook',
            events: ['conditional_trigger']
          },
          fields: {
            ...targetService.fields,
            _conditionalSource: sourceService.serviceName,
            _conditionalSourceId: sourceService.id,
            _conditions: connection.linkData.condition || {},
          }
        });
        break;

      case 'parallel':
        updateService({
          ...targetService,
          fields: {
            ...targetService.fields,
            _parallelWith: sourceService.serviceName,
            _parallelSourceId: sourceService.id,
            _synchronizedExecution: true
          }
        });

        updateService({
          ...sourceService,
          fields: {
            ...sourceService.fields,
            _parallelWith: targetService.serviceName,
            _parallelTargetId: targetService.id,
            _synchronizedExecution: true
          }
        });
        break;

      case 'sequential':
        updateService({
          ...targetService,
          activationConfig: {
            type: 'chain',
          },
          fields: {
            ...targetService.fields,
            _sequentialSource: sourceService.serviceName,
            _sequentialSourceId: sourceService.id,
            _waitForCompletion: true,
            _dataMapping: connection.linkData.mapping || {},
          }
        });
        break;

      default:
        updateService({
          ...targetService,
          activationConfig: {
            type: 'chain',
          }
        });
        break;
    }
  };

  const removeConnection = (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);

    setConnections(prev => prev.filter(c => c.id !== connectionId));

    if (connection) {
      const targetService = servicesState.find(s => s.id === connection.targetId);
      const sourceService = servicesState.find(s => s.id === connection.sourceId);

      if (targetService) {
        const hasOtherConnections = connections.some(c =>
          c.id !== connectionId && c.targetId === connection.targetId
        );

        if (!hasOtherConnections) {
          const cleanFields = { ...targetService.fields };

          delete cleanFields._chainSource;
          delete cleanFields._chainSourceId;
          delete cleanFields._chainMapping;
          delete cleanFields._conditionalSource;
          delete cleanFields._conditionalSourceId;
          delete cleanFields._conditions;
          delete cleanFields._parallelWith;
          delete cleanFields._parallelSourceId;
          delete cleanFields._synchronizedExecution;
          delete cleanFields._sequentialSource;
          delete cleanFields._sequentialSourceId;
          delete cleanFields._waitForCompletion;
          delete cleanFields._dataMapping;

          updateService({
            ...targetService,
            activationConfig: {
              type: 'cron',
              cron_expression: '0 */30 * * * *'
            },
            fields: cleanFields
          });
        }
      }

      if (sourceService && connection.linkData.type === 'chain') {
        const cleanSourceFields = { ...sourceService.fields };
        const chainTargets = (cleanSourceFields._chainTargets as string[] || []).filter(
          targetId => targetId !== connection.targetId
        );

        if (chainTargets.length === 0) {
          delete cleanSourceFields._hasChainTarget;
          delete cleanSourceFields._chainTargets;
        } else {
          cleanSourceFields._chainTargets = chainTargets;
        }

        updateService({
          ...sourceService,
          fields: cleanSourceFields
        });
      }

      if (sourceService && connection.linkData.type === 'parallel') {
        const cleanSourceFields = { ...sourceService.fields };
        delete cleanSourceFields._parallelWith;
        delete cleanSourceFields._parallelTargetId;
        delete cleanSourceFields._synchronizedExecution;

        updateService({
          ...sourceService,
          fields: cleanSourceFields
        });
      }
    }
  };

  const updateConnection = (connection: ConnectionData) => {
    setConnections(prev => prev.map(c => c.id === connection.id ? connection : c));
  };

  return {
    servicesState,
    selectedService,
    modalOpened,
    setModalOpened,
    isDragging,
    setIsDragging,
    areaName,
    setAreaName,
    areaDescription,
    setAreaDescription,
    handleDragEnd,
    handleSave,
    handleRun,
    addNewServiceBelow,
    removeService,
    editService,
    updateService,
    moveServiceUp,
    moveServiceDown,
    duplicateService,
    connections,
    createConnection,
    removeConnection,
    updateConnection,
  };
}