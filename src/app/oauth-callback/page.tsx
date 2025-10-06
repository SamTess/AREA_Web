"use client";
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Title, Text, Loader, Alert } from '@mantine/core';
import { useAuth } from '../../hooks/useAuth';
import axios from '../../config/axios';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        setStatus('error');
        setMessage(errorDescription || error || 'OAuth authentication failed');

        setTimeout(() => {
          router.push('/login?error=' + encodeURIComponent(error));
        }, 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');

        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }

      try {
        setMessage('Exchanging authorization code...');

        const response = await axios.post('/api/oauth/github/exchange', {
          code: code
        });

        if (response.status === 200) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');

          await refreshAuth();

          setTimeout(() => {
            router.push('/');
          }, 2000);
        }
      } catch (error: unknown) {
        console.error('OAuth exchange error:', error);
        setStatus('error');

        let errorMessage = 'Authentication failed';
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: { status: number; data?: { message?: string } } };
          if (axiosError.response?.status === 401) {
            errorMessage = 'Invalid or expired authorization code';
          } else if (axiosError.response?.status === 500) {
            errorMessage = 'Server error during authentication';
          } else if (axiosError.response?.data?.message) {
            errorMessage = axiosError.response.data.message;
          }
        }

        setMessage(errorMessage);

        setTimeout(() => {
          router.push('/login?error=' + encodeURIComponent(errorMessage));
        }, 3000);
      }
    };

    processCallback();
  }, [router, searchParams, refreshAuth]);

  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="xl" ta="center">
        {status === 'processing' && 'Authentication in progress...'}
        {status === 'success' && 'Authentication successful!'}
        {status === 'error' && 'Authentication error'}
      </Title>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        {status === 'processing' && <Loader size="lg" />}
      </div>

      {status === 'success' && (
        <Alert color="green" ta="center">
          {message}
        </Alert>
      )}

      {status === 'error' && (
        <Alert color="red" ta="center">
          {message}
        </Alert>
      )}

      {status === 'processing' && (
        <Text ta="center">
          {message}
        </Text>
      )}
    </Container>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <Container size="sm" py="xl">
        <Title order={1} mb="xl" ta="center">
          Loading...
        </Title>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader size="lg" />
        </div>
      </Container>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}