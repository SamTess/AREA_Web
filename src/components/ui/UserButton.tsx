import { Avatar, Group, Text, UnstyledButton } from '@mantine/core';
import classes from './UserButton.module.css';
import { useRouter } from 'next/navigation';

interface UserButtonProps {
  name: string;
  email: string;
  avatarSrc: string;
}

export function UserButton({ name, email, avatarSrc }: UserButtonProps) {
  const router = useRouter();

  return (
    <UnstyledButton className={classes.user}>
      <Group>

        <div style={{ flex: 1 }}>
            <div style={{ textAlign: 'right' }}>
            <Text size="sm" fw={500}>
              {name}
            </Text>
            <Text c="dimmed" size="xs">
              {email}
            </Text>
            </div>
        </div>
        <Avatar
          src={avatarSrc}
          radius="xl"
          onClick={() => {router.push('/profile');}}
        />
      </Group>
    </UnstyledButton>
  );
}