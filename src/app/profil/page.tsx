'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PasswordInput, NativeSelect, TextInput, Title, Avatar, Button, Container, Card, Stack, Group, Menu, Modal, Text, Loader } from '@mantine/core';
import { IconCamera } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { z } from 'zod';
import { updateProfile } from '../../services/authService';
import { getUser, uploadAvatar } from '../../services/userService';
import { ProfileData, UserContent } from '../../types';

const profileSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  language: z.string().min(1, 'Language is required'),
  password: z.string().optional().refine((val: string | undefined) => !val || val.length >= 6, {
    message: 'Password must be at least 6 characters',
  }),
});

export default function ProfilPage() {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserContent | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [originalAvatarSrc, setOriginalAvatarSrc] = useState<string>('');
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileData>({
    initialValues: {
      email: '',
      firstName: '',
      lastName: '',
      language: user?.profileData.language || 'French',
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
        const userData = await getUser('user@example.com'); // a rempldacer par l'id dans le /me route
        setUser(userData);
        setOriginalAvatarSrc(userData.avatarSrc);
        form.setValues(userData.profileData);
        form.resetDirty(userData.profileData);
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadUser();
  }, [form]);

  const handleSave = async () => {
    setLoading(true);
    try {
      let avatarUrl = user?.avatarSrc;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
        setUser(prev => prev ? { ...prev, avatarSrc: avatarUrl! } : null);
      }
      await updateProfile(form.values);
      form.resetDirty();
      setAvatarFile(null);
      setOpened(false);
    } catch (error) {
      console.error('Failed to update profile', error);
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
          <NativeSelect
            label="Language"
            description="Select your preferred language"
            data={['French', 'English']}
            {...form.getInputProps('language')}
          />
          <Group justify="flex-end">
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button disabled={!isDirty} variant="filled">
                  Save Changes
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => setOpened(true)}>
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

      <Modal opened={opened} onClose={() => setOpened(false)} title="Confirm Save">
        <Text>Are you sure you want to save the changes?</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setOpened(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={loading}>
            Save
          </Button>
        </Group>
      </Modal>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (file.size > 5 * 1024 * 1024) {
              alert('File size must be less than 5MB');
              return;
            }
            handleAvatarChange(file);
          }
        }}
      />
    </Container>
  );
}
