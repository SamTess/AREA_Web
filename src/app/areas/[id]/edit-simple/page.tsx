'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Alert,
  Stepper,
  Stack,
  NumberInput,
  TextInput,
  Loader,
  Center,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
} from '@tabler/icons-react';
import { getCurrentUser } from '@/services/authService';
import {
  getServices,
  getActionsByServiceKey,
  updateAreaComplete,
  CreateAreaPayload,
  getActionFieldsFromActionDefinition,
  getAreaById,
} from '@/services/areasService';
import type { BackendService, Action, FieldData } from '@/types';
import {
  getServiceConnectionStatus,
  initiateServiceConnection,
  ServiceConnectionStatus,
} from '@/services/serviceConnectionService';
import { NameStep, TriggerStep, ReactionsStep, ResumeStep } from '@/components/ui/area-simple-steps';
import { ArrayInput } from '@/components/ui/area-simple-steps/ArrayInput';

interface ReactionData {
  id: string;
  service: string | null;
  actionId: string | null;
  params: Record<string, unknown>;
}

export default function EditSimpleAreaPage() {
  const router = useRouter();
  const params = useParams();
  const areaId = params.id as string;

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [services, setServices] = useState<BackendService[]>([]);
  const [serviceConnectionStatuses, setServiceConnectionStatuses] = useState<Record<string, ServiceConnectionStatus>>({});
  const [actionTriggers, setActionTriggers] = useState<Action[]>([]);
  const [reactionActions, setReactionActions] = useState<Action[]>([]);

  const [areaName, setAreaName] = useState('');
  const [areaDescription, setAreaDescription] = useState('');
  const [selectedTriggerService, setSelectedTriggerService] = useState<string | null>(null);
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [triggerParams, setTriggerParams] = useState<Record<string, unknown>>({});

  const [reactions, setReactions] = useState<ReactionData[]>([
    { id: '1', service: null, actionId: null, params: {} }
  ]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser();
      } catch {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const loadArea = async () => {
      try {
        setInitialLoading(true);
        const area = await getAreaById(areaId);

        if (!area) {
          setError('Area not found');
          return;
        }

        setAreaName(area.name);
        setAreaDescription(area.description || '');

        if (area.actions && area.actions.length > 0) {
          const trigger = area.actions[0];
          setSelectedTrigger(trigger.actionDefinitionId);
          setTriggerParams(trigger.parameters || {});

        }

        if (area.reactions && area.reactions.length > 0) {
          const loadedReactions: ReactionData[] = area.reactions.map((reaction, index) => ({
            id: reaction.id || `reaction-${index}`,
            service: null,
            actionId: reaction.actionDefinitionId,
            params: reaction.parameters || {},
          }));
          setReactions(loadedReactions);
        }

        setInitialLoading(false);
      } catch (err) {
        console.error('Failed to load area:', err);
        setError('Failed to load area details');
        setInitialLoading(false);
      }
    };

    if (areaId) {
      loadArea();
    }
  }, [areaId]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const servicesData = await getServices();
        setServices(servicesData);

        const statusChecks: Record<string, ServiceConnectionStatus> = {};
        for (const service of servicesData) {
          try {
            const status = await getServiceConnectionStatus(service.key);
            statusChecks[service.key] = status;
          } catch {
            statusChecks[service.key] = {
              serviceKey: service.key,
              serviceName: service.name,
              iconUrl: service.iconLightUrl || service.iconDarkUrl || '',
              isConnected: false,
              connectionType: 'NONE',
              userEmail: '',
              userName: '',
            };
          }
        }
        setServiceConnectionStatuses(statusChecks);
      } catch (err) {
        console.error('Failed to load services:', err);
        setError('Unable to load services.');
      }
    };
    loadServices();
  }, []);

  useEffect(() => {
    const determineServiceFromTrigger = async () => {
      if (selectedTrigger && services.length > 0 && !selectedTriggerService) {
        for (const service of services) {
          try {
            const actions = await getActionsByServiceKey(service.key);
            const matchingAction = actions.find(a => a.id === selectedTrigger);
            if (matchingAction) {
              setSelectedTriggerService(service.key);
              break;
            }
          } catch (err) {
            console.error(`Failed to load actions for ${service.key}:`, err);
          }
        }
      }
    };

    determineServiceFromTrigger();
  }, [selectedTrigger, services, selectedTriggerService]);

  useEffect(() => {
    const determineServicesFromReactions = async () => {
      if (reactions.some(r => r.actionId && !r.service) && services.length > 0) {
        const updatedReactions = [...reactions];
        let hasChanges = false;

        for (let i = 0; i < updatedReactions.length; i++) {
          if (updatedReactions[i].actionId && !updatedReactions[i].service) {
            for (const service of services) {
              try {
                const actions = await getActionsByServiceKey(service.key);
                const matchingAction = actions.find(a => a.id === updatedReactions[i].actionId);
                if (matchingAction) {
                  updatedReactions[i].service = service.key;
                  hasChanges = true;
                  break;
                }
              } catch (err) {
                console.error(`Failed to load actions for ${service.key}:`, err);
              }
            }
          }
        }

        if (hasChanges) {
          setReactions(updatedReactions);
        }
      }
    };

    determineServicesFromReactions();
  }, [reactions, services]);

  useEffect(() => {
    if (selectedTriggerService) {
      const loadTriggerActions = async () => {
        try {
          const actions = await getActionsByServiceKey(selectedTriggerService);
          setActionTriggers(actions.filter(a => a.isEventCapable));
        } catch (err) {
          console.error('Failed to load trigger actions:', err);
          setError('Unable to load triggers.');
        }
      };
      loadTriggerActions();
    }
  }, [selectedTriggerService]);

  useEffect(() => {
    const loadAllReactionActions = async () => {
      const uniqueServices = [...new Set(reactions.map(r => r.service).filter(Boolean))];
      const allActions: Action[] = [];

      for (const service of uniqueServices) {
        if (service) {
          try {
            const actions = await getActionsByServiceKey(service);
            allActions.push(...actions.filter(a => a.isExecutable));
          } catch (err) {
            console.error('Failed to load reaction actions:', err);
          }
        }
      }
      setReactionActions(allActions);
    };

    if (reactions.some(r => r.service)) {
      loadAllReactionActions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactions.map(r => r.service).join(',')]);

  const addReaction = () => {
    setReactions([...reactions, {
      id: Date.now().toString(),
      service: null,
      actionId: null,
      params: {}
    }]);
  };

  const removeReaction = (id: string) => {
    if (reactions.length > 1) {
      setReactions(reactions.filter(r => r.id !== id));
    }
  };

  const handleConnectService = async (serviceKey: string) => {
    try {
      await initiateServiceConnection(serviceKey, window.location.href);
    } catch (error) {
      console.error('Error initiating service connection:', error);
      setError('Unable to connect the service.');
    }
  };

  useEffect(() => {
    const handleFocus = async () => {
      const statusChecks: Record<string, ServiceConnectionStatus> = {};
      for (const service of services) {
        try {
          const status = await getServiceConnectionStatus(service.key);
          statusChecks[service.key] = status;
        } catch {
          statusChecks[service.key] = {
            serviceKey: service.key,
            serviceName: service.name,
            iconUrl: service.iconLightUrl || service.iconDarkUrl || '',
            isConnected: false,
            connectionType: 'NONE',
            userEmail: '',
            userName: '',
          };
        }
      }
      setServiceConnectionStatuses(statusChecks);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [services]);

  const handleUpdateArea = async () => {
    if (!areaName || !selectedTrigger) {
      setError('Please fill in all required fields.');
      return;
    }

    const invalidReactions = reactions.filter(r => !r.service || !r.actionId);
    if (invalidReactions.length > 0) {
      setError('All reactions must have a service and an action selected.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: CreateAreaPayload = {
        name: areaName,
        description: areaDescription || undefined,
        actions: [
          {
            actionDefinitionId: selectedTrigger,
            name: `Trigger - ${areaName}`,
            description: 'Trigger action',
            parameters: triggerParams,
          },
        ],
        reactions: reactions.map((reaction, index) => ({
          actionDefinitionId: reaction.actionId!,
          name: `Reaction ${index + 1} - ${areaName}`,
          description: `Reaction action ${index + 1}`,
          parameters: reaction.params,
          order: index + 1,
        })),
        links: [],
        connections: [],
      };

      await updateAreaComplete(areaId, payload);
      setSuccess(true);
      setTimeout(() => {
        router.push('/areas');
      }, 2000);
    } catch (err) {
      console.error('Failed to update area:', err);
      setError('Failed to update AREA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canGoNext = () => {
    switch (activeStep) {
      case 0:
        return areaName.trim().length > 0;
      case 1:
        return selectedTriggerService && selectedTrigger;
      case 2:
        return reactions.every(r => r.service && r.actionId);
      default:
        return false;
    }
  };

  const renderParameterField = (
    field: FieldData,
    value: unknown,
    onChange: (value: unknown) => void
  ) => {
    const commonProps = {
      label: field.name,
      description: field.description,
      required: field.mandatory,
    };

    switch (field.type) {
      case 'number':
        return (
          <NumberInput
            {...commonProps}
            value={typeof value === 'number' ? value : undefined}
            onChange={onChange}
            placeholder={field.placeholder}
          />
        );
      case 'text':
      case 'email':
        return (
          <TextInput
            {...commonProps}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.currentTarget.value)}
            type={field.type}
            placeholder={field.placeholder}
          />
        );
      case 'datetime':
      case 'date':
      case 'time':
        return (
          <TextInput
            {...commonProps}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.currentTarget.value)}
            type={field.type === 'datetime' ? 'datetime-local' : field.type}
            placeholder={field.placeholder}
          />
        );
      case 'array':
        return <ArrayInput field={field} value={value} onChange={onChange} />;
      default:
        return (
          <TextInput
            {...commonProps}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.currentTarget.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  if (initialLoading) {
    return (
      <Container size="sm" py="xl">
        <Center style={{ minHeight: '400px' }}>
          <Stack align="center" gap="md">
            <Loader size="xl" />
            <Text>Loading area details...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (success) {
    return (
      <Container size="sm" py="xl">
        <Alert icon={<IconCheck size={20} />} title="Success" color="green">
          Your AREA has been updated successfully! Redirecting...
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Group justify="space-between" mb="md">
            <div>
              <Title order={1}>Edit AREA</Title>
              <Text c="dimmed" size="lg" mt="sm">
                Modify your automation in a few simple steps
              </Text>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/areas/${areaId}?mode=advanced`)}
            >
              Advanced Mode
            </Button>
          </Group>
        </div>

        {error && (
          <Alert
            icon={<IconAlertCircle size={20} />}
            title="Error"
            color="red"
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {Object.keys(serviceConnectionStatuses).length > 0 &&
         Object.values(serviceConnectionStatuses).every(s => !s.isConnected) &&
         services.length > 0 && (
          <Alert
            icon={<IconAlertCircle size={20} />}
            title="Disconnected Services"
            color="yellow"
          >
            Some services require a connection. You can connect them when selecting the service.
          </Alert>
        )}

        <Stepper
          active={activeStep}
          onStepClick={setActiveStep}
          allowNextStepsSelect={false}
          size="md"
        >
          <Stepper.Step
            label="Information"
            description="Name and description"
          >
            <NameStep
              areaName={areaName}
              areaDescription={areaDescription}
              onNameChange={setAreaName}
              onDescriptionChange={setAreaDescription}
            />
          </Stepper.Step>

          <Stepper.Step
            label="Trigger"
            description="When something happens"
          >
            <TriggerStep
              services={services}
              serviceConnectionStatuses={serviceConnectionStatuses}
              selectedTriggerService={selectedTriggerService}
              selectedTrigger={selectedTrigger}
              actionTriggers={actionTriggers}
              triggerParams={triggerParams}
              onTriggerServiceChange={(val) => {
                setSelectedTriggerService(val);
                setSelectedTrigger(null);
                setTriggerParams({});
              }}
              onTriggerChange={(triggerId) => {
                setSelectedTrigger(triggerId);
                setTriggerParams({});
              }}
              onTriggerParamChange={(paramName, value) => {
                setTriggerParams({
                  ...triggerParams,
                  [paramName]: value,
                });
              }}
              onConnectService={handleConnectService}
              renderParameterField={renderParameterField}
              getActionFields={(actionId) => {
                const action = actionTriggers.find(a => a.id === actionId);
                return action ? getActionFieldsFromActionDefinition(action) : [];
              }}
            />
          </Stepper.Step>

          <Stepper.Step
            label="Reactions"
            description="What should happen"
          >
            <ReactionsStep
              services={services}
              serviceConnectionStatuses={serviceConnectionStatuses}
              reactions={reactions}
              reactionActions={reactionActions}
              onReactionServiceChange={(reactionId, service) => {
                setReactions(prev => prev.map(r =>
                  r.id === reactionId
                    ? { ...r, service, actionId: null, params: {} }
                    : r
                ));
              }}
              onReactionActionChange={(reactionId, actionId) => {
                setReactions(prev => prev.map(r =>
                  r.id === reactionId
                    ? { ...r, actionId, params: {} }
                    : r
                ));
              }}
              onReactionParamChange={(reactionId, paramName, value) => {
                setReactions(prev => prev.map(r =>
                  r.id === reactionId
                    ? { ...r, params: { ...r.params, [paramName]: value } }
                    : r
                ));
              }}
              onAddReaction={addReaction}
              onRemoveReaction={removeReaction}
              onConnectService={handleConnectService}
              renderParameterField={renderParameterField}
              getActionFields={(actionId) => {
                const action = reactionActions.find(a => a.id === actionId);
                return action ? getActionFieldsFromActionDefinition(action) : [];
              }}
            />
          </Stepper.Step>

          <Stepper.Completed>
            <ResumeStep
              areaName={areaName}
              areaDescription={areaDescription}
              selectedTriggerService={selectedTriggerService}
              selectedTrigger={selectedTrigger}
              triggerParams={triggerParams}
              reactions={reactions}
              services={services}
              actionTriggers={actionTriggers}
              reactionActions={reactionActions}
            />
          </Stepper.Completed>
        </Stepper>

        <Group justify="space-between" mt="xl">
          {activeStep > 0 && (
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => setActiveStep(activeStep - 1)}
            >
              Previous
            </Button>
          )}
          {activeStep < 3 && (
            <Button
              rightSection={<IconArrowRight size={18} />}
              onClick={() => setActiveStep(activeStep + 1)}
              disabled={!canGoNext()}
              ml="auto"
            >
              Next
            </Button>
          )}
          {activeStep === 3 && (
            <Button
              onClick={handleUpdateArea}
              loading={loading}
              ml="auto"
              color="green"
            >
              Update AREA
            </Button>
          )}
        </Group>
      </Stack>
    </Container>
  );
}
