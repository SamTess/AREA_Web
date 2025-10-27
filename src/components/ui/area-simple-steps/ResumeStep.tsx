'use client';

import React from 'react';
import { Paper, Stack, Text } from '@mantine/core';
import type { BackendService, Action } from '@/types';

interface ReactionData {
  id: string;
  service: string | null;
  actionId: string | null;
  params: Record<string, unknown>;
}

interface ResumeStepProps {
  areaName: string;
  areaDescription: string;
  selectedTriggerService: string | null;
  selectedTrigger: string | null;
  triggerParams: Record<string, unknown>;
  reactions: ReactionData[];
  services: BackendService[];
  actionTriggers: Action[];
  reactionActions: Action[];
}

export function ResumeStep({
  areaName,
  areaDescription,
  selectedTriggerService,
  selectedTrigger,
  triggerParams,
  reactions,
  services,
  actionTriggers,
  reactionActions,
}: ResumeStepProps) {
  return (
    <Paper p="xl" radius="md" withBorder mt="xl">
      <Stack gap="lg">
        <div>
          <Text size="xl" fw={700} mb="md">
            Summary
          </Text>
          <Text c="dimmed">
            Review the information before creating your AREA
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
            Service: {services.find((s) => s.key === selectedTriggerService)?.name}
          </Text>
          <Text>
            Event: {actionTriggers.find((a) => a.id === selectedTrigger)?.name}
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
            const service = services.find((s) => s.key === reaction.service);
            const action = reactionActions.find((a) => a.id === reaction.actionId);
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
  );
}
