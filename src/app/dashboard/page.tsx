'use client';

import { Tabs, Container, Divider } from '@mantine/core';
import { IconUser, IconMap, IconSettings, IconFileText } from '@tabler/icons-react';
import { UsersTab } from '../../components/ui/dashboard/UsersTab';
import { AreasTab } from '../../components/ui/dashboard/AreasTab';
import { ServicesTab } from '../../components/ui/dashboard/ServicesTab';
import { LogsTab } from '../../components/ui/dashboard/LogsTab';

export default function DashboardPage() {
  return (
    <Container size="xl" py="md">
    <Tabs variant="pills" radius="lg" defaultValue="users">
      <Tabs.List justify="center" mb="md">
        <Tabs.Tab value="users" leftSection={<IconUser size={16} />}>
            Users
        </Tabs.Tab>
        <Tabs.Tab value="areas" leftSection={<IconMap size={16} />}>
            Areas
        </Tabs.Tab>
        <Tabs.Tab value="services" leftSection={<IconSettings size={16} />}>
            Services
        </Tabs.Tab>
        <Tabs.Tab value="logs" leftSection={<IconFileText size={16} />}>
            Logs
        </Tabs.Tab>
      </Tabs.List>

        <Divider my="lg" />

        <Tabs.Panel value="users" pt="md">
          <UsersTab />
        </Tabs.Panel>

        <Tabs.Panel value="areas" pt="md">
          <AreasTab />
        </Tabs.Panel>

        <Tabs.Panel value="services" pt="md">
          <ServicesTab />
        </Tabs.Panel>

        <Tabs.Panel value="logs" pt="md">
          <LogsTab />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
