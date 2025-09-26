"use client";
import {
  IconChevronRight,
  IconLogout,
  IconSettings,
  IconSwitchHorizontal,
} from '@tabler/icons-react';
import { Avatar, Group, Menu, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';


interface UserContent {
  name: string;
  email: string;
  avatarSrc: string;
}

export function UserMenu({ user }: { user: UserContent }) {
  const router = useRouter();

  return (
    <Group justify="center">
      <Menu
        withArrow
        width={300}
        position="right"
        transitionProps={{ transition: 'pop' }}
        withinPortal
      >
        <Menu.Target>
          <Avatar size={40} src={user.avatarSrc} radius={40} />
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item rightSection={<IconChevronRight size={16} stroke={1.5} />}>
            <Group onClick={() => router.push("/profile")}>
              <Avatar
                radius="xl"
                src={user.avatarSrc}
              />

              <div>
                <Text fw={500}>{user.name}</Text>
                <Text size="xs" c="dimmed">
                  {user.email}
                </Text>
              </div>
            </Group>
          </Menu.Item>

          <Menu.Divider />

          <Menu.Label>Settings</Menu.Label>
          <Menu.Item leftSection={<IconSettings size={16} stroke={1.5} />} onClick={() => router.push("/settings")}>
            Account settings
          </Menu.Item>
          <Menu.Item leftSection={<IconSwitchHorizontal size={16} stroke={1.5} />} onClick={() => router.push("/change-account")}>
            Change account
          </Menu.Item>
          <Menu.Item leftSection={<IconLogout size={16} stroke={1.5} />} onClick={() => router.push("/logout")}>
            Logout
          </Menu.Item>

          <Menu.Divider />

        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}