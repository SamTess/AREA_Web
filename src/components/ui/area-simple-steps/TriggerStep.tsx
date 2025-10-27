'use client';

import React from 'react';
import {
  Paper,
  Stack,
  Text,
  Select,
  Card,
  Group,
  Badge,
  SimpleGrid,
  Alert,
  Button,
  Divider,
} from '@mantine/core';
import { IconSettings, IconAlertCircle } from '@tabler/icons-react';
import type { BackendService, Action, FieldData } from '@/types';
import type { ServiceConnectionStatus } from '@/services/serviceConnectionService';

interface TriggerStepProps {
  services: BackendService[];
  serviceConnectionStatuses: Record<string, ServiceConnectionStatus>;
  selectedTriggerService: string | null;
  selectedTrigger: string | null;
  actionTriggers: Action[];
  triggerParams: Record<string, unknown>;
  onTriggerServiceChange: (service: string | null) => void;
  onTriggerChange: (triggerId: string) => void;
  onTriggerParamChange: (paramName: string, value: unknown) => void;
  onConnectService: (serviceKey: string) => void;
  renderParameterField: (
    field: FieldData,
    value: unknown,
    onChange: (value: unknown) => void
  ) => React.ReactNode;
  getActionFields: (actionId: string) => FieldData[];
}

export function TriggerStep({
  services,
  serviceConnectionStatuses,
  selectedTriggerService,
  selectedTrigger,
  actionTriggers,
  triggerParams,
  onTriggerServiceChange,
  onTriggerChange,
  onTriggerParamChange,
  onConnectService,
  renderParameterField,
  getActionFields,
}: TriggerStepProps) {
  const isServiceConnected = (serviceKey: string): boolean => {
    const status = serviceConnectionStatuses[serviceKey];
    return status?.isConnected === true;
  };

  const triggerFields = selectedTrigger ? getActionFields(selectedTrigger) : [];

  return (
    <Paper p="xl" radius="md" withBorder mt="xl">
      <Stack gap="lg">
        <div>
          <Text size="sm" fw={500} mb="xs">
            Select the service
          </Text>
          <Select
            placeholder="Choose a service for the trigger"
            required
            value={selectedTriggerService}
            onChange={onTriggerServiceChange}
            data={services.map((s) => ({
              value: s.key,
              label: s.name,
            }))}
            searchable
            aria-label="Service for trigger"
          />
        </div>

        {selectedTriggerService && !isServiceConnected(selectedTriggerService) && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Service not connected"
            color="yellow"
          >
            <Text size="sm" mb="sm">
              You must connect your{' '}
              {services.find((s) => s.key === selectedTriggerService)?.name} account to
              use this trigger.
            </Text>
            <Button
              size="xs"
              onClick={() => onConnectService(selectedTriggerService)}
            >
              Connect {services.find((s) => s.key === selectedTriggerService)?.name}
            </Button>
          </Alert>
        )}

        {selectedTriggerService && isServiceConnected(selectedTriggerService) && (
          <div>
            <Text size="sm" fw={500} mb="xs">
              Choose an event to trigger your AREA
            </Text>
            {actionTriggers.length === 0 ? (
              <Alert color="blue">Loading available triggers...</Alert>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {actionTriggers.map((trigger) => (
                  <Card
                    key={trigger.id}
                    padding="md"
                    radius="md"
                    withBorder
                    style={{
                      cursor: 'pointer',
                      borderColor: selectedTrigger === trigger.id ? '#228be6' : undefined,
                      borderWidth: selectedTrigger === trigger.id ? 2 : 1,
                    }}
                    onClick={() => onTriggerChange(trigger.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select trigger ${trigger.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onTriggerChange(trigger.id);
                      }
                    }}
                  >
                    <Group justify="space-between" mb="xs">
                      <Text fw={500}>{trigger.name}</Text>
                      {selectedTrigger === trigger.id && (
                        <Badge color="blue">Selected</Badge>
                      )}
                    </Group>
                    <Text size="sm" c="dimmed">
                      {trigger.description || 'No description'}
                    </Text>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </div>
        )}

        {selectedTrigger && triggerFields.length > 0 && (
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
              {triggerFields.map((field) => (
                <div key={field.name}>
                  {renderParameterField(
                    field,
                    triggerParams[field.name],
                    (value) => onTriggerParamChange(field.name, value)
                  )}
                </div>
              ))}
            </Stack>
          </div>
        )}
      </Stack>
    </Paper>
  );
}
