"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  Alert,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { upperFirst } from '@mantine/hooks';
import { AxiosError } from 'axios';
import { PasswordStrength } from './PasswordStrength';
import { login, register, forgotPassword, extractToken } from '../../services/authService';
import { getOAuthProviders, initiateOAuth } from '../../services/oauthService';
import { FormValues, OAuthProvider } from '../../types';
import { setSecureToken } from '../../utils/secureStorage';

export function AuthenticationForm(props: PaperProps) {
  const [type, setType] = useState<'login' | 'register' | 'forgotPassword'>('login');
  const [data, setData] = useState<OAuthProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const isSubmittingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [error, success]);

  useEffect(() => {
    const loadProviders = async () => {
      const providers = await getOAuthProviders();
      setData(providers);
    };
    loadProviders();
  }, []);

  const form = useForm({
    initialValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },

    validate: {
      email: (val) => { return /^\S+@\S+$/.test(val) ? null : 'Invalid email'; },
      password: (val) => { return val.length <= 6 ? 'Password should include at least 6 characters' : null; },
      confirmPassword: (val, values) => {
        if (type !== 'register') return null;
        return val !== values.password ? 'Passwords do not match' : null;
      },
      firstName: (val) => {
        if (type !== 'register') return null;
        return val.trim().length === 0 ? 'First name is required' : null;
      },
      lastName: (val) => {
        if (type !== 'register') return null;
        return val.trim().length === 0 ? 'Last name is required' : null;
      },
    },
    validateInputOnChange: true,
    validateInputOnBlur: true,
  });

  const handleTypeChange = (newType: 'login' | 'register' | 'forgotPassword') => {
    setType(newType);
    setError(null);
    setSuccess(null);
    form.reset();
    form.clearErrors();
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleOAuthClick = (provider: string) => {
    initiateOAuth(provider);
  };

  const handleSubmit = async (values: FormValues) => {
    if (isSubmittingRef.current) { return; }
    if (loading) { return; }

    isSubmittingRef.current = true;
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (type === 'login') {
        const response = await login({ email: values.email, password: values.password });
        const token = extractToken(response);
        if (token) {
          setSecureToken(token, 24 * 60 * 60 * 1000); // 24 hours expiry
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            router.push('/');
          }, 1500);
        } else {
          console.error('Login response:', response);
          setError('Login failed. No authentication token received.');
        }
      } else if (type === 'register') {
        const response = await register({
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          password: values.password
        });
        const token = extractToken(response);
        if (token) {
          setSecureToken(token, 24 * 60 * 60 * 1000); // 24 hours expiry
          setSuccess('Registration successful! Redirecting...');
          setTimeout(() => {
            router.push('/');
          }, 1500);
        } else {
          console.error('Register response:', response);
          setError('Registration failed. No authentication token received.');
        }
      } else if (type === 'forgotPassword') {
        await forgotPassword(values.email);
        setSuccess('Password reset email sent! Please check your inbox.');
        form.reset();
      }
    } catch (error: unknown) {
      console.error('Authentication error caught:', error);
      let errorMessage = 'An error occurred. Please try again.';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const status = axiosError.response?.status;
        const data = axiosError.response?.data;

        switch (status) {
          case 400:
            if (type === 'login') {
              errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            } else if (type === 'register') {
              errorMessage = data?.message || 'Registration failed. Please check your information and try again.';
            } else if (type === 'forgotPassword') {
              errorMessage = 'Invalid email address. Please enter a valid email.';
            }
            break;
          case 401:
            if (type === 'login') {
              errorMessage = 'Invalid email or password. Please check your credentials.';
            } else {
              errorMessage = 'Authentication failed. Please try again.';
            }
            break;
          case 403:
            errorMessage = 'Access denied. Your account may be suspended.';
            break;
          case 409:
            if (type === 'register') {
              errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
            } else {
              errorMessage = 'Conflict error. Please try again.';
            }
            break;
          case 422:
            errorMessage = data?.message || 'Invalid data provided. Please check your information.';
            break;
          case 429:
            errorMessage = 'Too many attempts. Please wait a few minutes before trying again.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          case 503:
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = data?.message || 'An unexpected error occurred. Please try again.';
        }
      } else if (error instanceof Error) {
        if (error.message.includes('Network Error') || error.message.includes('ERR_NETWORK')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      e.stopPropagation();
      handleFormSubmit();
    }
  };

  const handleFormSubmit = async () => {
    const now = Date.now();
    if (now - lastSubmitTime < 1000) {
      return;
    }
    setLastSubmitTime(now);
    if (isSubmittingRef.current) { return; }
    if (loading) { return; }
    setError(null);
    setSuccess(null);
    const validation = form.validate();
    if (validation.hasErrors) {
      setError('Please correct the errors in the form before submitting.');
      return;
    }
    await handleSubmit(form.values);
  };

  return (
    <Paper radius="md" p="lg" withBorder w="40%" mx="auto" {...props}>
      <Text size="lg" fw={500}>
        Welcome to Area, {type} with
      </Text>

      <div>
        {error && (
          <Alert color="red" mb="md" icon={<IconAlertCircle size={16} />} title="Authentication Failed">
            {error}
          </Alert>
        )}

        {success && (
          <Alert color="green" mb="md" icon={<IconCheck size={16} />} title="Success">
            {success}
          </Alert>
        )}

        {type !== 'forgotPassword' && (
            <>
            <Stack mb="md" mt="md">
                {data.map((item) => (
              <Button
                variant="default"
                key={item.label}
                radius="xl"
                leftSection={<Image src={item.iconPath} alt={item.label} width={20} height={20} />}
                onClick={() => handleOAuthClick(item.label)}
              >
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
            <>
              <TextInput
                label="First Name"
                placeholder="Your first name"
                value={form.values.firstName}
                onChange={(event) => {
                  form.setFieldValue('firstName', event.currentTarget.value);
                  clearMessages();
                }}
                radius="md"
              />
              <TextInput
                label="Last Name"
                placeholder="Your last name"
                value={form.values.lastName}
                onChange={(event) => {
                  form.setFieldValue('lastName', event.currentTarget.value);
                  clearMessages();
                }}
                radius="md"
              />
            </>
          )}

          <TextInput
            required
            label="Email"
            placeholder="Area@Area.com"
            value={form.values.email}
            onChange={(event) => {
              form.setFieldValue('email', event.currentTarget.value);
              clearMessages();
            }}
            error={form.errors.email && 'Invalid email'}
            radius="md"
          />

          {type === 'register' ? (
            <>
              <PasswordStrength
                value={form.values.password}
                onChange={(val) => {
                  form.setFieldValue('password', val);
                  clearMessages();
                }}
              />
              <PasswordInput
                required
                label="Confirm Password"
                placeholder="Confirm your password"
                value={form.values.confirmPassword}
                onChange={(event) => {
                  form.setFieldValue('confirmPassword', event.currentTarget.value);
                  clearMessages();
                }}
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
              onChange={(event) => {
                form.setFieldValue('password', event.currentTarget.value);
                clearMessages();
              }}
              onKeyDown={handleKeyDown}
              error={form.errors.password && 'Password should include at least 6 characters'}
              radius="md"
            />
          ) : null}
        </Stack>

        <Stack align="flex-start" mt="xl">
          <Anchor component="button" type="button" c="dimmed" onClick={() => handleTypeChange(type === 'login' ? 'register' : type === 'register' ? 'login' : 'login')} size="xs">
            {type === 'register'
              ? 'Already have an account? Login'
              : type === 'forgotPassword'
              ? 'Remember your password? Login'
              : "Don't have an account? Register"}
          </Anchor>
          <Anchor component="button" type="button" c="dimmed" onClick={() => handleTypeChange('forgotPassword')} size="xs">
            {type === 'login' ? 'Forgot password?' : ''}
          </Anchor>
        </Stack>
        <Stack mb="md" mt="md">
          <Button
            type="button"
            radius="xl"
            loading={loading}
            disabled={loading || Object.keys(form.errors).length > 0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!loading) {
                handleFormSubmit();
              }
            }}
          >
            {loading ? 'Processing...' : (type === 'forgotPassword' ? 'Send' : upperFirst(type))}
          </Button>
        </Stack>
      </div>
    </Paper>
  );
}