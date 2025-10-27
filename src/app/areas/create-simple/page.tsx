'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
} from '@tabler/icons-react';
import { getCurrentUser } from '@/services/authService';
import {
  createAreaWithActions,
  CreateAreaPayload,
  getActionFieldsFromActionDefinition,
} from '@/services/areasService';
import type { FieldData } from '@/types';
import { initiateServiceConnection } from '@/services/serviceConnectionService';
import { NameStep, TriggerStep, ReactionsStep, ResumeStep } from '@/components/ui/area-simple-steps';
import { ArrayInput } from '@/components/ui/area-simple-steps/ArrayInput';
import { useAreaForm } from '@/hooks/useAreaForm';
import { useDraftSaver } from '@/hooks/useDraftSaver';

interface ReactionData {
  id: string;
  service: string | null;
  actionId: string | null;
  params: Record<string, unknown>;
}

interface SimpleDraft {
  areaName: string;
  areaDescription: string;
  selectedTriggerService: string | null;
  selectedTrigger: string | null;
  triggerParams: Record<string, unknown>;
  reactions: ReactionData[];
  activeStep: number;
  savedAt: string;
}

const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000;

const getDraftKey = (userId: string) => `simple-area-draft-${userId}`;

export default function CreateSimpleAreaPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [areaName, setAreaName] = useState('');
  const [areaDescription, setAreaDescription] = useState('');
  const [selectedTriggerService, setSelectedTriggerService] = useState<string | null>(null);
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [triggerParams, setTriggerParams] = useState<Record<string, unknown>>({});
  const [reactions, setReactions] = useState<ReactionData[]>([
    { id: '1', service: null, actionId: null, params: {} }
  ]);

  const {
    services,
    serviceConnectionStatuses,
    actionTriggers,
    reactionActions,
    loading: servicesLoading,
    loadTriggerActions,
    loadReactionActions,
  } = useAreaForm();

  const draftData = useMemo(() => ({
    areaName,
    areaDescription,
    selectedTriggerService,
    selectedTrigger,
    triggerParams,
    reactions,
    activeStep,
  }), [areaName, areaDescription, selectedTriggerService, selectedTrigger, triggerParams, reactions, activeStep]);

  const { clearDraft } = useDraftSaver(
    currentUserId,
    currentUserId ? getDraftKey(currentUserId) : '',
    draftData
  );

  useEffect(() => {
    if (selectedTriggerService) {
      loadTriggerActions(selectedTriggerService);
    }
  }, [selectedTriggerService, loadTriggerActions]);

  const reactionServiceKeys = useMemo(() => {
    return reactions
      .map(r => r.service)
      .filter((service): service is string => service !== null);
  }, [reactions]);

  useEffect(() => {
    if (reactionServiceKeys.length > 0) {
      loadReactionActions(reactionServiceKeys);
    }
  }, [reactionServiceKeys, loadReactionActions]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUserId(user.id);
      } catch {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!currentUserId) return;

    const loadDraft = () => {
      try {
        const draftKey = getDraftKey(currentUserId);
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          const draft: SimpleDraft = JSON.parse(savedDraft);
          const savedAt = new Date(draft.savedAt);
          const now = new Date();
          if (now.getTime() - savedAt.getTime() < DRAFT_EXPIRY_MS) {
            setAreaName(draft.areaName);
            setAreaDescription(draft.areaDescription);
            setSelectedTriggerService(draft.selectedTriggerService);
            setSelectedTrigger(draft.selectedTrigger);
            setTriggerParams(draft.triggerParams);
            setReactions(draft.reactions);
            setActiveStep(draft.activeStep);
          } else {
            localStorage.removeItem(draftKey);
          }
        }
      } catch (err) {
        console.error('Failed to load draft:', err);
        if (currentUserId) {
          localStorage.removeItem(getDraftKey(currentUserId));
        }
      }
    };
    loadDraft();
  }, [currentUserId]);

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

  const handleClearDraft = () => {
    clearDraft();
    setAreaName('');
    setAreaDescription('');
    setSelectedTriggerService(null);
    setSelectedTrigger(null);
    setTriggerParams({});
    setReactions([{ id: '1', service: null, actionId: null, params: {} }]);
    setActiveStep(0);
  };

  const handleConnectService = async (serviceKey: string) => {
    try {
      await initiateServiceConnection(serviceKey, window.location.href);
    } catch (error) {
      console.error('Error initiating service connection:', error);
      setError('Unable to connect the service.');
    }
  };

  const handleCreateArea = async () => {
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

      await createAreaWithActions(payload);

      if (currentUserId) {
        localStorage.removeItem(getDraftKey(currentUserId));
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/areas');
      }, 2000);
    } catch (err) {
      console.error('Failed to create area:', err);
      setError('Failed to create AREA. Please try again.');
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

  if (success) {
    return (
      <Container size="sm" py="xl">
        <Alert icon={<IconCheck size={20} />} title="Success" color="green">
          Your AREA has been created successfully! Redirecting...
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
              <Title order={1}>Create a Simple AREA</Title>
              <Text c="dimmed" size="lg" mt="sm">
                Create an automation in a few simple steps
              </Text>
            </div>
            <Group>
              {(areaName || areaDescription || selectedTriggerService) && (
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={handleClearDraft}
                >
                  Clear Form
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => router.push('/areas/new')}
              >
                Advanced Mode
              </Button>
            </Group>
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
              onClick={handleCreateArea}
              loading={loading || servicesLoading}
              ml="auto"
              color="green"
            >
              Create AREA
            </Button>
          )}
        </Group>
      </Stack>
    </Container>
  );
}
