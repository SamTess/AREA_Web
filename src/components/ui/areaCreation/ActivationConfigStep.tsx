import { Stack, Text, Select, Alert, Modal, Button, Group } from '@mantine/core';
import { useState, useEffect } from 'react';
import { ServiceData, ActivationConfig } from '../../../types';
import { IconInfoCircle, IconAlertTriangle } from '@tabler/icons-react';

interface ActivationConfigStepProps {
  service: ServiceData;
  onServiceChange: (service: ServiceData) => void;
}

export default function ActivationConfigStep({ service, onServiceChange }: ActivationConfigStepProps) {
  if (!service.selectedAction) {
    return (
      <Stack gap="md">
        <Text size="sm" fw={500}>Activation Mode</Text>
        <Alert icon={<IconInfoCircle size={16} />} title="Select an Action First" color="yellow">
          <Text size="sm">
            Please select an action first to configure its activation mode.
          </Text>
        </Alert>
      </Stack>
    );
  }

  const isReaction = service.selectedAction.isExecutable === true && service.selectedAction.isEventCapable === false;
  const getDefaultActivationType = () => {
    if (!service.selectedAction) return 'manual';
    const isReaction = service.selectedAction.isExecutable === true && service.selectedAction.isEventCapable === false;
    const isEvent = service.selectedAction.isEventCapable === true && service.selectedAction.isExecutable === false;
    if (isReaction) return 'chain';
    if (isEvent) return 'webhook';
    return 'manual';
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [activationType, setActivationType] = useState<string>(getDefaultActivationType());
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [showWarningModal, setShowWarningModal] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [pendingActivationType, setPendingActivationType] = useState<string | null>(null);

  const activationTypeOptions = [
    { value: 'manual', label: 'Manual' },
    { value: 'cron', label: 'CRON Schedule' },
    { value: 'webhook', label: 'Webhook' },
    { value: 'poll', label: 'Polling' },
    { value: 'chain', label: 'Chain Reaction' }
  ];

  const getFilteredActivationOptions = () => {
    if (!service.selectedAction) {
      return activationTypeOptions;
    }

    const isEvent = service.selectedAction.isEventCapable === true && service.selectedAction.isExecutable === false;
    const isReaction = service.selectedAction.isExecutable === true && service.selectedAction.isEventCapable === false;

    if (isEvent) {
      return activationTypeOptions.filter(option =>
        ['webhook', 'poll', 'manual'].includes(option.value)
      );
    } else if (isReaction) {
      return activationTypeOptions.filter(option =>
        ['cron', 'chain', 'manual'].includes(option.value)
      );
    } else {
      return activationTypeOptions;
    }
  };

  const updateActivationConfig = (type: string) => {
    const newConfig: ActivationConfig = { type: type as ActivationConfig['type'] };
    const updatedService: ServiceData = {
      ...service,
      activationConfig: newConfig
    };
    onServiceChange(updatedService);
  };

  const handleActivationTypeChange = (newType: string) => {
    if (isReaction && activationType === 'chain' && newType !== 'chain') {
      setPendingActivationType(newType);
      setShowWarningModal(true);
    } else {
      setActivationType(newType);
      updateActivationConfig(newType);
    }
  };

  const confirmActivationTypeChange = () => {
    if (pendingActivationType) {
      setActivationType(pendingActivationType);
      updateActivationConfig(pendingActivationType);
      setPendingActivationType(null);
    }
    setShowWarningModal(false);
  };

  const cancelActivationTypeChange = () => {
    setPendingActivationType(null);
    setShowWarningModal(false);
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    console.log('ActivationConfigStep - useEffect TRIGGERED');
    console.log('ActivationConfigStep - useEffect - service.selectedAction:', service.selectedAction);
    console.log('ActivationConfigStep - useEffect - current activationType:', activationType);

    if (!service.selectedAction) return;

    const isEvent = service.selectedAction.isEventCapable === true && service.selectedAction.isExecutable === false;
    const isReaction = service.selectedAction.isExecutable === true && service.selectedAction.isEventCapable === false;

    console.log('ActivationConfigStep - useEffect - isEvent:', isEvent, 'isReaction:', isReaction);

    let defaultType = 'manual';
    if (isReaction) defaultType = 'chain';
    if (isEvent) defaultType = 'webhook';

    console.log('ActivationConfigStep - useEffect - defaultType should be:', defaultType);

    const validOptions = [];
    if (isEvent) {
      validOptions.push('webhook', 'poll', 'manual');
    } else if (isReaction) {
      validOptions.push('cron', 'chain', 'manual');
    } else {
      validOptions.push('manual', 'cron', 'webhook', 'poll', 'chain');
    }

    console.log('ActivationConfigStep - useEffect - validOptions:', validOptions);
    const currentTypeIsValid = validOptions.includes(activationType);
    console.log('ActivationConfigStep - useEffect - currentTypeIsValid:', currentTypeIsValid);

    // Met à jour seulement si nécessaire
    if (!currentTypeIsValid || (activationType === 'manual' && defaultType !== 'manual')) {
      console.log('ActivationConfigStep - useEffect - UPDATING activation type from', activationType, 'to', defaultType);
      setActivationType(defaultType);
      updateActivationConfig(defaultType);
    } else {
      console.log('ActivationConfigStep - useEffect - NO UPDATE needed, current type is valid');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service.selectedAction?.id, service.selectedAction?.isEventCapable, service.selectedAction?.isExecutable]);

  return (
    <>
      <Stack gap="md">
        <Text size="sm" fw={500}>Activation Mode</Text>

        {isReaction && activationType === 'chain' && (
          <Alert icon={<IconInfoCircle size={16} />} title="Chain Reaction Mode" color="blue">
            <Text size="sm">
              This reaction will be automatically triggered by the previous action in your chain.
              This is the recommended mode for reactions.
            </Text>
          </Alert>
        )}

        <Select
          label="Trigger Type"
          placeholder="Choose how this action should be triggered"
          value={activationType}
          onChange={(value) => {
            if (value) {
              handleActivationTypeChange(value);
            }
          }}
          data={getFilteredActivationOptions()}
          required
        />

        <Text size="sm" c="dimmed">
          {activationType === 'manual' && 'Manually triggered by user action'}
          {activationType === 'cron' && 'Triggered on a schedule using CRON expressions'}
          {activationType === 'webhook' && 'Triggered by incoming webhook calls'}
          {activationType === 'poll' && 'Periodically checks for changes'}
          {activationType === 'chain' && 'Triggered by another action completion'}
        </Text>
      </Stack>

      {/* Modal de confirmation pour changer depuis CHAIN */}
      <Modal
        opened={showWarningModal}
        onClose={cancelActivationTypeChange}
        title="Change Activation Mode"
        centered
      >
        <Stack gap="md">
          <Alert icon={<IconAlertTriangle size={16} />} title="Warning" color="orange">
            <Text size="sm">
              You are about to change from <strong>Chain Reaction</strong> mode to <strong>{pendingActivationType?.toUpperCase()}</strong> mode.
            </Text>
            <Text size="sm" mt="xs">
              Chain Reaction is the recommended mode for reactions as it ensures proper sequencing
              with the previous action. Are you sure you want to change this?
            </Text>
          </Alert>

          <Group justify="flex-end">
            <Button variant="outline" onClick={cancelActivationTypeChange}>
              Cancel
            </Button>
            <Button color="orange" onClick={confirmActivationTypeChange}>
              Change Mode
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
