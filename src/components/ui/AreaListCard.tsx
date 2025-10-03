import React, { useMemo } from 'react';
import { Card, Text, Badge, Group, Stack, Anchor } from '@mantine/core';
import { Menu, ActionIcon } from '@mantine/core';
import { IconDotsVertical, IconEdit, IconPlayerPlay, IconTrash } from '@tabler/icons-react';
import Image from 'next/image';
import { AreaListCardProps } from '../../types';
import { useRouter } from 'next/navigation';

export default function AreaListCard({ areas, services, onDelete, onRun }: AreaListCardProps) {
  const servicesMap = useMemo(() => {
    return new Map(services.map(s => [s.id, s]));
  }, [services]);

  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'green';
      case 'failed': return 'red';
      case 'in progress': return 'yellow';
      case 'not started': return 'grey';
      default: return 'gray';
    }
  };
  return (
    <Stack>
      {areas.map((area) => (
          <Card key={area.id} shadow="sm" padding="lg" radius="md" withBorder style={{ cursor: 'pointer' }}>
            <Group justify="space-between" mb="xs">
              <Anchor href={`/areas/${area.id}`} style={{ textDecoration: 'none' }}>
                <Text fw={500}>{area.name}</Text>
              </Anchor>
              <Group>
              <Badge color={
                getStatusColor(area.status)
              } variant="light">
                {area.status}
              </Badge>
                <Menu
                  transitionProps={{ transition: 'pop' }}
                  withArrow
                  position="right-start"
                  offset={20}
                  withinPortal
                >
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray">
                      <IconDotsVertical size={16} stroke={1.5} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item leftSection={<IconPlayerPlay size={16} stroke={1.5} />} color='blue' onClick={() => onRun?.(area.id)}>
                      Run area
                    </Menu.Item>
                    <Menu.Item leftSection={<IconEdit size={16} stroke={1.5} />} onClick={() => router.push(`/areas/${area.id}`)}>
                      Edit area
                    </Menu.Item>
                    <Menu.Item leftSection={<IconTrash size={16} stroke={1.5} />} color="red" onClick={() => onDelete?.(area.id)}>
                      Delete area
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>

            <Text size="sm" c="dimmed" mb="xs">
              {area.description}
            </Text>

            <Group justify="space-between">
              <Text size="sm">Last run: {area.lastRun}</Text>
              <Group gap="xs">
                {area.services.map((serviceId) => {
                  const service = servicesMap.get(serviceId);
                  return service ? (
                    <Badge key={service.id} color="blue" variant="light">
                      <Group gap="xs" align="center">
                        {service.logo && <Image src={service.logo} alt={service.name} width={12} height={12} />}
                        {service.name}
                      </Group>
                    </Badge>
                  ) : null;
                })}
              </Group>
            </Group>
          </Card>
      ))}
    </Stack>
  );
}
