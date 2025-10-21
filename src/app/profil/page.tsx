'use client';

import { AxiosError } from 'axios';
import { PasswordInput, TextInput, Title, Avatar, Button, Container, Card, Stack, Group, Menu, Text, Loader, Alert } from '@mantine/core';
import { IconCamera } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { z } from 'zod';
import { getCurrentUser, updateProfile } from '../../services/authService';
import {  uploadAvatar } from '../../services/userService';
import { ProfileData, UserContent } from '../../types';
import { useState, useEffect, useRef, useCallback } from 'react';

const profileSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: z.string().optional().refine((val: string | undefined) => !val || val.length >= 6, {
    message: 'Password must be at least 6 characters',
  }),
});

export default function ProfilPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserContent | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [originalAvatarSrc, setOriginalAvatarSrc] = useState<string>('');
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | " ">(" ");
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const form = useForm<ProfileData>({
    initialValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
    },
    validate: (values) => {
      try {
        profileSchema.parse(values);
        return {};
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.flatten().fieldErrors;
        }
        return {};
      }
    },
  });

  const readFileAsDataURL = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setOriginalAvatarSrc(userData.avatarSrc);
        form.setValues(userData.profileData);
        form.resetDirty(userData.profileData);
        setUserId(userData.id);
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      try {
        await getCurrentUser();
      } catch (authError) {
        console.error('User not authenticated:', authError);
        setNotification({ message: 'Your session has expired. Please log in again.', type: 'error' });
        setLoading(false);
        return;
      }

      let avatarUrl = user?.avatarSrc;
      if (avatarFile) {
        try {
          avatarUrl = await uploadAvatar(avatarFile);
          setOriginalAvatarSrc(avatarUrl);
        } catch (uploadError) {
          console.error('Failed to upload avatar:', uploadError);
          setNotification({ message: 'Failed to upload avatar. Profile will be updated without avatar change.', type: 'warning' });
          avatarUrl = user?.avatarSrc;
        }
      }

      const updatedUser = await updateProfile(userId, form.values, avatarFile ? avatarUrl : undefined);
      setUser(updatedUser);
      setOriginalAvatarSrc(updatedUser.avatarSrc);
      form.setValues(updatedUser.profileData);
      form.resetDirty(updatedUser.profileData);
      setAvatarFile(null);
      setNotification({ message: 'Profile updated successfully!', type: 'success' });
      window.location.reload();
    } catch (error) {
      console.error('Failed to update profile', error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 403) {
          setNotification({ message: 'You are not authorized to update your profile. Please check your authentication.', type: 'error' });
        } else if (error.response?.status === 404) {
          setNotification({ message: 'User not found. Please try logging in again.', type: 'error' });
        } else if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.error || 'Invalid request. Please check your input.';
          setNotification({ message: errorMessage, type: 'error' });
        } else {
          setNotification({ message: 'Failed to update profile. Please try again.', type: 'error' });
        }
      } else {
        setNotification({ message: 'Failed to update profile. Please try again.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
    try {
      const avatarPreviewSrc = await readFileAsDataURL(file);
      setUser(prev => prev ? { ...prev, avatarSrc: avatarPreviewSrc } : null);
      setAvatarFile(file);
    } catch (error) {
      console.error('Failed to read file', error);
    }
  };

  const isDirty = form.isDirty() || avatarFile !== null;

  if (isLoadingUser) {
    return (
      <Container size="sm" py="xl">
        <Group justify="center">
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container size="sm" py="xl">
        <Text ta="center">Failed to load user data.</Text>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Title order={1} ta="center">Profile</Title>
          {notification && (
            <Alert
              variant="light"
              color={notification.type === 'success' ? 'green' : notification.type === 'error' ? 'red' : 'yellow'}
              withCloseButton
              onClose={() => setNotification(null)}
            >
              {notification.message}
            </Alert>
          )}
          <Group justify="center">
            <div style={{ position: 'relative' }}>
              <Avatar size="xl" src={user.avatarSrc} />
              <Button
                size="xs"
                style={{ position: 'absolute', bottom: 0, right: 0, borderRadius: '50%' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <IconCamera size={12} />
              </Button>
            </div>
          </Group>
          <TextInput
            label="Email"
            variant="filled"
            placeholder="Email"
            readOnly
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="New Password (optional)"
            description="Leave empty to keep current password"
            placeholder="New Password"
            {...form.getInputProps('password')}
          />
          <TextInput
            label="First Name"
            placeholder="First Name"
            {...form.getInputProps('firstName')}
          />
          <TextInput
            label="Last Name"
            placeholder="Last Name"
            {...form.getInputProps('lastName')}
          />
          <Group justify="flex-end">
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button disabled={!isDirty} variant="filled" loading={loading}>
                  Save Changes
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={handleSave}>
                  Confirm Save
                </Menu.Item>
                <Menu.Item onClick={() => {
                  form.setValues(user.profileData);
                  form.resetDirty(user.profileData);
                  setUser(prev => prev ? { ...prev, avatarSrc: originalAvatarSrc } : null);
                  setAvatarFile(null);
                }}>
                  Discard Changes
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Stack>
      </Card>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (file.size > 5 * 1024 * 1024) {
              setNotification({ message: 'File size must be less than 5MB', type: 'error' });
              return;
            }
            handleAvatarChange(file);
          }
        }}
      />
    </Container>
  );
}
