import React from 'react';
import { Modal, Stack, Text, Select, TextInput, Textarea, Button, Group } from '@mantine/core';
import { ServiceData, ConnectionData, LinkData } from '../../../../types';

interface LinkConfigModalProps {
  opened: boolean;
  onClose: () => void;
  tempConnection: Partial<ConnectionData> | null;
  services: ServiceData[];
  onConnectionChange: (connection: Partial<ConnectionData>) => void;
  onConfirm: () => void;
}

export default function LinkConfigModal({
  opened,
  onClose,
  tempConnection,
  services,
  onConnectionChange,
  onConfirm,
}: LinkConfigModalProps) {
  if (!tempConnection) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Configure Link"
      size="md"
    >
      <Stack>
        <Text size="sm">
          Creating link from <strong>{services.find(s => s.id === tempConnection.sourceId)?.serviceName}</strong>
          {' '} to <strong>{services.find(s => s.id === tempConnection.targetId)?.serviceName}</strong>
        </Text>
        <Select
          label="Link Type"
          placeholder="Select link type"
          data={[
            { value: 'chain', label: 'Chain Reaction - Triggers when source completes' },
            { value: 'conditional', label: 'Conditional - Triggers based on conditions' },
            { value: 'parallel', label: 'Parallel - Runs simultaneously' },
            { value: 'sequential', label: 'Sequential - Waits for source completion' }
          ]}
          value={tempConnection.linkData?.type || 'chain'}
          onChange={(value) => onConnectionChange({
            ...tempConnection,
            linkData: {
              type: value as LinkData['type'] || 'chain',
              mapping: tempConnection.linkData?.mapping || {},
              order: tempConnection.linkData?.order || 0,
              metadata: tempConnection.linkData?.metadata || {},
              condition: tempConnection.linkData?.condition || {
                field: '',
                operator: 'equals',
                value: ''
              }
            }
          })}
        />

        <TextInput
          label="Execution Order"
          placeholder="0"
          value={tempConnection.linkData?.order?.toString() || '0'}
          onChange={(e) => onConnectionChange({
            ...tempConnection,
            linkData: {
              type: tempConnection.linkData?.type || 'chain',
              mapping: tempConnection.linkData?.mapping || {},
              condition: tempConnection.linkData?.condition || {},
              metadata: tempConnection.linkData?.metadata || {},
              order: parseInt(e.target.value) || 0
            }
          })}
        />

        {tempConnection.linkData?.type === 'conditional' && (
          <Textarea
            label="Condition (JSON format)"
            placeholder='{"field": "status", "operator": "equals", "value": "success"}'
            value={JSON.stringify(tempConnection.linkData?.condition || {})}
            onChange={(e) => {
              try {
                const condition = JSON.parse(e.target.value);
                onConnectionChange({
                  ...tempConnection,
                  linkData: {
                    type: tempConnection.linkData?.type || 'chain',
                    mapping: tempConnection.linkData?.mapping || {},
                    order: tempConnection.linkData?.order || 0,
                    metadata: tempConnection.linkData?.metadata || {},
                    condition
                  }
                });
              } catch (error) {
                console.error('Invalid JSON for condition', error);
              }
            }}
            minRows={3}
          />
        )}

        {(tempConnection.linkData?.type === 'chain' || tempConnection.linkData?.type === 'sequential') && (
          <Textarea
            label="Data Mapping (JSON format)"
            placeholder='{"sourceField": "targetField", "result": "input"}'
            value={JSON.stringify(tempConnection.linkData?.mapping || {})}
            onChange={(e) => {
              try {
                const mapping = JSON.parse(e.target.value);
                onConnectionChange({
                  ...tempConnection,
                  linkData: {
                    type: tempConnection.linkData?.type || 'chain',
                    order: tempConnection.linkData?.order || 0,
                    metadata: tempConnection.linkData?.metadata || {},
                    condition: tempConnection.linkData?.condition || {
                      field: '',
                      operator: 'equals',
                      value: ''
                    },
                    mapping
                  }
                });
              } catch (error) {
                console.error('Invalid JSON for mapping', error);
              }
            }}
            minRows={3}
          />
        )}

        <Text size="xs" c="dimmed">
          {tempConnection.linkData?.type === 'chain' && 'Chain: Target activates when source completes, inheriting source data.'}
          {tempConnection.linkData?.type === 'conditional' && 'Conditional: Target activates only if conditions are met.'}
          {tempConnection.linkData?.type === 'parallel' && 'Parallel: Target runs simultaneously with source.'}
          {tempConnection.linkData?.type === 'sequential' && 'Sequential: Target waits for source completion, then executes.'}
        </Text>

        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Create Link
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
