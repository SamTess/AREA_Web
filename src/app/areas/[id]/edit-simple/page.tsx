'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Alert,
  Stepper,
  Card,
  Badge,
  SimpleGrid,
  NumberInput,
  ActionIcon,
  Divider,
  Pill,
  Loader,
  Center,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
  IconPlus,
  IconTrash,
  IconSettings,
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

interface ReactionData {
  id: string;
  service: string | null;
  actionId: string | null;
  params: Record<string, unknown>;
}

interface ArrayInputProps {
  field: FieldData;
  value: unknown;
  onChange: (value: unknown) => void;
}

function ArrayInput({ field, value, onChange }: ArrayInputProps) {
  const arrayValue = Array.isArray(value) ? value : [];
  const [inputValue, setInputValue] = useState('');

  return (
    <div>
      <Text size="sm" fw={500} mb={5}>
        {field.name}
        {field.mandatory && <span style={{ color: 'red' }}> *</span>}
      </Text>
      {field.description && (
        <Text size="xs" c="dimmed" mb={8}>
          {field.description}
        </Text>
      )}
      <Stack gap="xs">
        <Group gap="xs" style={{ flexWrap: 'wrap', minHeight: arrayValue.length > 0 ? 'auto' : '40px' }}>
          {arrayValue.map((item: unknown, index: number) => (
            <Pill
              key={index}
              withRemoveButton
              onRemove={() => {
                const newArray = arrayValue.filter((_: unknown, i: number) => i !== index);
                onChange(newArray);
              }}
            >
              {String(item)}
            </Pill>
          ))}
          {arrayValue.length === 0 && (
            <Text size="sm" c="dimmed" style={{ padding: '8px' }}>
              No items yet. Add items below.
            </Text>
          )}
        </Group>
        <Group gap="xs">
          <TextInput
            placeholder={field.placeholder || 'Type and press Enter or click Add'}
            value={inputValue}
            onChange={(e) => setInputValue(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                e.preventDefault();
                const newArray = [...arrayValue, inputValue.trim()];
                onChange(newArray);
                setInputValue('');
              }
            }}
            style={{ flex: 1 }}
          />
          <Button
            size="sm"
            onClick={() => {
              if (inputValue.trim()) {
                const newArray = [...arrayValue, inputValue.trim()];
                onChange(newArray);
                setInputValue('');
              }
            }}
            disabled={!inputValue.trim()}
          >
            Add
          </Button>
        </Group>
      </Stack>
    </div>
  );
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

  const isServiceConnected = (serviceKey: string): boolean => {
    const status = serviceConnectionStatuses[serviceKey];
    return status?.isConnected === true;
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
            <Paper p="xl" radius="md" withBorder mt="xl">
              <Stack gap="md">
                <TextInput
                  label="AREA Name"
                  placeholder="My automation"
                  required
                  value={areaName}
                  onChange={(e) => setAreaName(e.currentTarget.value)}
                  size="lg"
                  aria-label="AREA Name"
                  description="Give a descriptive name to your automation"
                />
                <Textarea
                  label="Description (optional)"
                  placeholder="This AREA does..."
                  value={areaDescription}
                  onChange={(e) => setAreaDescription(e.currentTarget.value)}
                  size="md"
                  minRows={3}
                  aria-label="AREA Description"
                  description="Describe what your automation does"
                />
              </Stack>
            </Paper>
          </Stepper.Step>

          <Stepper.Step
            label="Trigger"
            description="When something happens"
          >
            <Paper p="xl" radius="md" withBorder mt="xl">
              <Stack gap="lg">
                <div>
                  <Text size="lg" fw={600} mb="xs">
                    Choose the trigger service
                  </Text>
                  <Text c="dimmed" size="sm" mb="md">
                    Select the service that will trigger your automation
                  </Text>
                  <Select
                    label="Service"
                    placeholder="Select a service"
                    required
                    value={selectedTriggerService}
                    onChange={(val) => {
                      setSelectedTriggerService(val);
                      setSelectedTrigger(null);
                      setTriggerParams({});
                    }}
                    data={services.map((s) => ({
                      value: s.key,
                      label: s.name,
                    }))}
                    size="md"
                    searchable
                    aria-label="Trigger service"
                  />

                  {selectedTriggerService && !isServiceConnected(selectedTriggerService) && (
                    <Alert color="blue" variant="light" mt="md">
                      <Stack gap="xs">
                        <Text size="sm">
                          You need to connect this service to use it.
                        </Text>
                        <Button
                          size="sm"
                          onClick={() => handleConnectService(selectedTriggerService)}
                        >
                          Connect {services.find(s => s.key === selectedTriggerService)?.name}
                        </Button>
                      </Stack>
                    </Alert>
                  )}
                </div>

                {selectedTriggerService && (
                  <>
                    <div>
                      <Text size="lg" fw={600} mb="xs">
                        Choose the trigger event
                      </Text>
                      <Text c="dimmed" size="sm" mb="md">
                        Select the event that will trigger the action
                      </Text>
                      {actionTriggers.length === 0 ? (
                        <Alert color="blue">
                          Loading available triggers...
                        </Alert>
                      ) : (
                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                          {actionTriggers.map((action) => (
                            <Card
                              key={action.id}
                              padding="lg"
                              radius="md"
                              withBorder
                              style={{
                                cursor: 'pointer',
                                borderColor:
                                  selectedTrigger === action.id ? '#228be6' : undefined,
                                borderWidth: selectedTrigger === action.id ? 2 : 1,
                              }}
                              onClick={() => {
                                setSelectedTrigger(action.id);
                                setTriggerParams({});
                              }}
                              role="button"
                              tabIndex={0}
                              aria-label={`Select ${action.name}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  setSelectedTrigger(action.id);
                                  setTriggerParams({});
                                }
                              }}
                            >
                              <Group justify="space-between" mb="xs">
                                <Text fw={500}>{action.name}</Text>
                                {selectedTrigger === action.id && (
                                  <Badge color="blue">Selected</Badge>
                                )}
                              </Group>
                              <Text size="sm" c="dimmed">
                                {action.description || 'No description'}
                              </Text>
                            </Card>
                          ))}
                        </SimpleGrid>
                      )}
                    </div>

                    {selectedTrigger && (() => {
                      const trigger = actionTriggers.find(a => a.id === selectedTrigger);
                      const fields = trigger ? getActionFieldsFromActionDefinition(trigger) : [];

                      if (fields.length === 0) return null;

                      return (
                        <div>
                          <Divider
                            label={
                              <Group gap="xs">
                                <IconSettings size={16} />
                                <Text size="sm">Trigger Parameters</Text>
                              </Group>
                            }
                            labelPosition="left"
                            my="md"
                          />
                          <Stack gap="md">
                            {fields.map((field) => (
                              <div key={field.name}>
                                {renderParameterField(
                                  field,
                                  triggerParams[field.name],
                                  (value) => {
                                    setTriggerParams({
                                      ...triggerParams,
                                      [field.name]: value,
                                    });
                                  }
                                )}
                              </div>
                            ))}
                          </Stack>
                        </div>
                      );
                    })()}
                  </>
                )}
              </Stack>
            </Paper>
          </Stepper.Step>

          <Stepper.Step
            label="Reactions"
            description="What happens next?"
          >
            <Paper p="xl" radius="md" withBorder mt="xl">
              <Stack gap="lg">
                <div>
                  <Text size="lg" fw={600} mb="xs">
                    Configure the reactions
                  </Text>
                  <Text c="dimmed" size="sm">
                    Add one or more actions that will be executed
                  </Text>
                </div>

                {reactions.map((reaction, index) => {
                  const reactionActionsForService = reactionActions.filter(
                    a => a.serviceKey === reaction.service
                  );
                  const selectedAction = reactionActionsForService.find(
                    a => a.id === reaction.actionId
                  );
                  const fields = selectedAction
                    ? getActionFieldsFromActionDefinition(selectedAction)
                    : [];

                  return (
                    <Paper key={reaction.id} p="md" withBorder>
                      <Stack gap="md">
                        <Group justify="space-between">
                          <Text fw={500}>Reaction {index + 1}</Text>
                          {reactions.length > 1 && (
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              onClick={() => removeReaction(reaction.id)}
                              aria-label={`Delete reaction ${index + 1}`}
                            >
                              <IconTrash size={18} />
                            </ActionIcon>
                          )}
                        </Group>

                        <div>
                          <Text size="sm" fw={500} mb="xs">
                            Select the service
                          </Text>
                          <Select
                            placeholder="Choose a service"
                            required
                            value={reaction.service}
                            onChange={(val) => {
                              if (val) {
                                setReactions(prev => prev.map(r =>
                                  r.id === reaction.id
                                    ? { ...r, service: val, actionId: null, params: {} }
                                    : r
                                ));
                              }
                            }}
                            data={services.map((s) => ({
                              value: s.key,
                              label: s.name,
                            }))}
                            searchable
                            aria-label={`Service for reaction ${index + 1}`}
                          />
                        </div>

                        {reaction.service && (
                          <div>
                            <Text size="sm" fw={500} mb="xs">
                              Choose the action to perform
                            </Text>
                            {reactionActionsForService.length === 0 ? (
                              <Alert color="blue">
                                Loading available actions...
                              </Alert>
                            ) : (
                              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                {reactionActionsForService.map((action) => (
                                  <Card
                                    key={action.id}
                                    padding="md"
                                    radius="md"
                                    withBorder
                                    style={{
                                      cursor: 'pointer',
                                      borderColor:
                                        reaction.actionId === action.id ? '#228be6' : undefined,
                                      borderWidth: reaction.actionId === action.id ? 2 : 1,
                                    }}
                                    onClick={() => {
                                      setReactions(prev => prev.map(r =>
                                        r.id === reaction.id
                                          ? { ...r, actionId: action.id, params: {} }
                                          : r
                                      ));
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Select action ${action.name}`}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        setReactions(prev => prev.map(r =>
                                          r.id === reaction.id
                                            ? { ...r, actionId: action.id, params: {} }
                                            : r
                                        ));
                                      }
                                    }}
                                  >
                                    <Group justify="space-between" mb="xs">
                                      <Text fw={500}>{action.name}</Text>
                                      {reaction.actionId === action.id && (
                                        <Badge color="blue">Selected</Badge>
                                      )}
                                    </Group>
                                    <Text size="sm" c="dimmed">
                                      {action.description || 'No description'}
                                    </Text>
                                  </Card>
                                ))}
                              </SimpleGrid>
                            )}
                          </div>
                        )}

                        {reaction.actionId && fields.length > 0 && (
                          <div>
                            <Divider
                              label={
                                <Group gap="xs">
                                  <IconSettings size={16} />
                                  <Text size="sm">Parameters</Text>
                                </Group>
                              }
                              labelPosition="left"
                              my="md"
                            />
                            <Stack gap="md">
                              {fields.map((field) => (
                                <div key={field.name}>
                                  {renderParameterField(
                                    field,
                                    reaction.params[field.name],
                                    (value) => {
                                      setReactions(prev => prev.map(r =>
                                        r.id === reaction.id
                                          ? { ...r, params: { ...r.params, [field.name]: value } }
                                          : r
                                      ));
                                    }
                                  )}
                                </div>
                              ))}
                            </Stack>
                          </div>
                        )}
                      </Stack>
                    </Paper>
                  );
                })}

                <Button
                  leftSection={<IconPlus size={18} />}
                  variant="light"
                  onClick={addReaction}
                  fullWidth
                >
                  Add a reaction
                </Button>
              </Stack>
            </Paper>
          </Stepper.Step>

          <Stepper.Completed>
            <Paper p="xl" radius="md" withBorder mt="xl">
              <Stack gap="lg">
                <div>
                  <Text size="xl" fw={700} mb="md">
                    Summary
                  </Text>
                  <Text c="dimmed">
                    Review the information before updating your AREA
                  </Text>
                </div>

                <div>
                  <Text fw={600} mb="xs">
                    AREA Name
                  </Text>
                  <Text>{areaName}</Text>
                </div>

                {areaDescription && (
                  <div>
                    <Text fw={600} mb="xs">
                      Description
                    </Text>
                    <Text>{areaDescription}</Text>
                  </div>
                )}

                <div>
                  <Text fw={600} mb="xs">
                    Trigger
                  </Text>
                  <Text>
                    Service: {services.find(s => s.key === selectedTriggerService)?.name}
                  </Text>
                  <Text>
                    Event: {actionTriggers.find(a => a.id === selectedTrigger)?.name}
                  </Text>
                  {Object.keys(triggerParams).length > 0 && (
                    <Text size="sm" c="dimmed">
                      {Object.keys(triggerParams).length} parameter(s) configured
                    </Text>
                  )}
                </div>

                <div>
                  <Text fw={600} mb="xs">
                    Reactions ({reactions.length})
                  </Text>
                  {reactions.map((reaction, index) => {
                    const service = services.find(s => s.key === reaction.service);
                    const action = reactionActions.find(a => a.id === reaction.actionId);
                    return (
                      <Paper key={reaction.id} p="sm" withBorder mb="xs">
                        <Text size="sm">
                          {index + 1}. Service: {service?.name} - Action: {action?.name}
                        </Text>
                        {Object.keys(reaction.params).length > 0 && (
                          <Text size="xs" c="dimmed">
                            {Object.keys(reaction.params).length} parameter(s) configured
                          </Text>
                        )}
                      </Paper>
                    );
                  })}
                </div>
              </Stack>
            </Paper>
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
