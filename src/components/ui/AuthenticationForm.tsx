"use client";
import { useState } from 'react';
import Image from 'next/image';
import {
  Anchor,
  Button,
  Divider,
  Paper,
  PaperProps,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { upperFirst } from '@mantine/hooks';
import { PasswordStrength } from './PasswordStrength';

const data = [
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png", label: 'Google' },
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", label: 'Microsoft' },
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg", label: 'Github' },
];

export function AuthenticationForm(props: PaperProps) {
  const [type, setType] = useState<'login' | 'register' | 'forgotPassword'>('login');
  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
      confirmPassword: (val, values) => (val !== values.password ? 'Passwords do not match' : null),
    },
    validateInputOnChange: false,
    validateInputOnBlur: false,
  });

  return (
    <Paper radius="md" p="lg" withBorder w="40%" mx="auto" {...props}>
      <Text size="lg" fw={500}>
        Welcome to Area, {type} with
      </Text>

      <form onSubmit={form.onSubmit(() => {})}>
        {type !== 'forgotPassword' && (
            <>
            <Stack mb="md" mt="md">
                {data.map((item) => (
              <Button variant="default" key={item.label} radius="xl" leftSection={<Image src={item.iconPath} alt={item.label} width={20} height={20} />}>
                {item.label}
              </Button>
                ))}
            </Stack>
            <Divider label="Or continue with email" labelPosition="center" my="lg" />
            </>
        )}
        {type === 'forgotPassword' && (
          <>
            <Divider labelPosition="center" my="lg" />
          </>
        )}
        <Stack>
          {type === 'register' && (
            <TextInput
              label="Name"
              placeholder="Your name"
              value={form.values.name}
              onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
              radius="md"
            />
          )}

          <TextInput
            required
            label="Email"
            placeholder="Area@Area.com"
            value={form.values.email}
            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
            error={form.errors.email && 'Invalid email'}
            radius="md"
          />

          {type === 'register' ? (
            <>
              <PasswordStrength
                value={form.values.password}
                onChange={(val) => form.setFieldValue('password', val)}
              />
              <PasswordInput
                required
                label="Confirm Password"
                placeholder="Confirm your password"
                value={form.values.confirmPassword}
                onChange={(event) => form.setFieldValue('confirmPassword', event.currentTarget.value)}
                error={form.errors.confirmPassword}
                radius="md"
              />
            </>
          ) : type === 'login' ? (
            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
              error={form.errors.password && 'Password should include at least 6 characters'}
              radius="md"
            />
          ) : null}
        </Stack>

        <Stack align="flex-start" mt="xl">
          <Anchor component="button" type="button" c="dimmed" onClick={() => setType(type === 'login' ? 'register' : type === 'register' ? 'login' : 'login')} size="xs">
            {type === 'register'
              ? 'Already have an account? Login'
              : type === 'forgotPassword'
              ? 'Remember your password? Login'
              : "Don't have an account? Register"}
          </Anchor>
          <Anchor component="button" type="button" c="dimmed" onClick={() => setType('forgotPassword')} size="xs">
            {type === 'login' ? 'Forgot password?' : ''}
          </Anchor>
        </Stack>
        <Stack mb="md" mt="md">
          <Button type="submit" radius="xl">
            {type === 'forgotPassword' ? 'Send' : upperFirst(type)}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}