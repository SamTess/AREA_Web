"use client";
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Title, Text, Loader, Alert, Button, Stack } from '@mantine/core';
import { useAuth } from '../../hooks/useAuth';
import axios from '../../config/axios';
import { isAxiosError } from 'axios';

type Provider = 'github' | 'google';

function isProbablyMobileApp(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const expectFlag = localStorage.getItem('oauth_expect_mobile') === 'true';
    const win = window as Window & { ReactNativeWebView?: unknown };
    const hasReactNativeWebView = typeof win.ReactNativeWebView !== 'undefined';
    return expectFlag || ua.includes('Expo') || hasReactNativeWebView || /Android|iPhone|iPad|iPod/i.test(ua);
  } catch {
    return false;
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseState(raw: string | null): { app_redirect_uri?: string; returnUrl?: string; provider?: Provider } | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function getMessageFromUnknown(data: unknown): string | undefined {
  if (!data) return undefined;
  if (typeof data === 'object' && data !== null) {
    const d = data as Record<string, unknown>;
    const m = d['message'];
    if (typeof m === 'string') return m;
  }
  return undefined;
}

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('Preparing authentication...');
  const [showBrowserFallback, setShowBrowserFallback] = useState(false);

  const processedRef = useRef(false);

  async function fetchCurrentUser() {
    try {
      const me = await axios.get('/api/auth/me');
      if (me?.status === 200) return me?.data;
    } catch (e) {
    }
    return null;
  }

  const handleSuccess = useCallback(async (messageText: string, returnUrl: string) => {
    setStatus('success');
    setMessage(messageText);
    localStorage.removeItem('oauth_link_mode');
    localStorage.removeItem('oauth_provider');
    localStorage.removeItem('oauth_return_url');
    localStorage.removeItem('oauth_expect_mobile');

    try { await refreshAuth?.(); } catch { /* no-op */ }

    setTimeout(() => {
      window.location.replace(returnUrl);
    }, 800);
  }, [refreshAuth]);

  async function forceWebExchange(code: string, provider: Provider, isLinkMode: boolean, returnUrl: string) {
    const url = isLinkMode ? `/api/oauth-link/${provider}/exchange` : `/api/oauth/${provider}/exchange`;
    try {
      setStatus('processing');
      setMessage('Completing authentication in browser...');
      const response = await axios.post(url, { code });

      if (response.status === 200) {
        await handleSuccess(isLinkMode ? 'Account linked successfully! Redirecting...' : 'Authentication successful! Redirecting...', returnUrl);
      } else {
        const me = await fetchCurrentUser();
        if (me) {
          await handleSuccess('Authentication completed (verified). Redirecting...', returnUrl);
        } else {
          setStatus('error');
          setMessage('Unexpected response during authentication');
        }
      }
    } catch (err: unknown) {
      console.error('OAuth exchange error (forced web):', err);
      const me = await fetchCurrentUser();
      if (me) {
        await handleSuccess('Authentication completed (verified). Redirecting...', returnUrl);
        return;
      }

      setStatus('error');
      let errorMessage = 'Server error during authentication';
      if (isAxiosError(err)) {
        const resp = err.response;
        if (resp) {
          const status = resp.status;
          const data = resp.data as unknown;
          if (status === 409) {
            const d = data as { message?: string; suggestion?: string } | undefined;
            errorMessage = d?.message || 'This account is already linked to another user';
            if (d?.suggestion) errorMessage += '. ' + d.suggestion;
          } else if (status === 400) {
            const d = data as { message?: string; suggestion?: string } | undefined;
            errorMessage = d?.message || 'Invalid request';
            if (d?.suggestion) errorMessage += '. ' + d.suggestion;
          } else if (status === 401) {
            errorMessage = 'Invalid or expired authorization code';
          } else {
            const msg = getMessageFromUnknown(data);
            if (typeof msg === 'string') errorMessage = msg;
          }
        }
      }
      setMessage(errorMessage);
    }
  }

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    (async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const rawState = searchParams.get('state');
      const state = parseState(rawState);

      if (error) {
        setStatus('error');
        setMessage(errorDescription || error || 'OAuth authentication failed');
        setTimeout(() => router.push('/login?error=' + encodeURIComponent(error)), 2500);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        setTimeout(() => router.push('/login'), 1500);
        return;
      }

      const isLinkMode = localStorage.getItem('oauth_link_mode') === 'true';
      const storedProvider = (localStorage.getItem('oauth_provider') || state?.provider || 'github').toLowerCase();
      const provider: Provider = storedProvider === 'google' ? 'google' : 'github';
      const returnUrl = (state?.returnUrl && typeof state.returnUrl === 'string' ? state.returnUrl : (localStorage.getItem('oauth_return_url') || '/')) as string;
      const forceWeb = searchParams.get('forceWeb') === '1';

      const deeplinkKey = `oauth_deeplink_attempted_${code}`;
      const alreadyTriedDeepLink = sessionStorage.getItem(deeplinkKey) === 'true';

      if (!forceWeb && isProbablyMobileApp()) {
        if (!alreadyTriedDeepLink) {
          try { sessionStorage.setItem(deeplinkKey, 'true'); } catch { }
          setStatus('processing');
          setMessage('Returning to the app...');

          const appRedirect = state?.app_redirect_uri || 'areamobile://oauthredirect';
          const dl = `${appRedirect}?code=${encodeURIComponent(code)}&provider=${encodeURIComponent(provider)}`;
          try { window.location.href = dl; } catch { /* ignore */ }

          await delay(800);
          setShowBrowserFallback(true);
          setMessage('If nothing happens, you can continue in the browser below.');
          return;
        } else {
          setShowBrowserFallback(true);
          setMessage('If nothing happens, you can continue in the browser below.');
          return;
        }
      }

      const meBefore = await fetchCurrentUser();
      if (meBefore) {
        await handleSuccess('Authentication already completed. Redirecting...', returnUrl);
        return;
      }

      const url = isLinkMode ? `/api/oauth-link/${provider}/exchange` : `/api/oauth/${provider}/exchange`;
      try {
        setStatus('processing');
        setMessage('Exchanging authorization code...');
        const response = await axios.post(url, { code });

        if (response.status === 200) {
          await handleSuccess(isLinkMode ? 'Account linked successfully! Redirecting...' : 'Authentication successful! Redirecting...', returnUrl);
        } else {
          const me = await fetchCurrentUser();
          if (me) {
            await handleSuccess('Authentication completed (verified). Redirecting...', returnUrl);
          } else {
            setStatus('error');
            setMessage('Unexpected response during authentication');
          }
        }
      } catch (err: unknown) {
        console.error('OAuth exchange error:', err);
        const me = await fetchCurrentUser();
        if (me) {
          await handleSuccess('Authentication completed (verified). Redirecting...', returnUrl);
          return;
        }

        setStatus('error');
        let errorMessage = 'Server error during authentication';
        if (isAxiosError(err)) {
          const resp = err.response;
          if (resp) {
            const status = resp.status;
            const data = resp.data as unknown;
            if (status === 409) {
              const d = data as { message?: string; suggestion?: string } | undefined;
              errorMessage = d?.message || 'This account is already linked to another user';
              if (d?.suggestion) errorMessage += '. ' + d.suggestion;
            } else if (status === 400) {
              const d = data as { message?: string; suggestion?: string } | undefined;
              errorMessage = d?.message || 'Invalid request';
              if (d?.suggestion) errorMessage += '. ' + d.suggestion;
            } else if (status === 401) {
              errorMessage = 'Invalid or expired authorization code';
            } else {
              const msg = getMessageFromUnknown(data);
              if (typeof msg === 'string') errorMessage = msg;
            }
          }
        }
        setMessage(errorMessage);

        if (isLinkMode) {
          setTimeout(() => {
            const backUrl = localStorage.getItem('oauth_return_url') || '/';
            localStorage.removeItem('oauth_link_mode');
            localStorage.removeItem('oauth_provider');
            localStorage.removeItem('oauth_return_url');
            localStorage.removeItem('oauth_expect_mobile');
            router.push(backUrl);
          }, 5000);
        }
      }
    })();
  }, [router, searchParams, refreshAuth, handleSuccess]);

  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="xl" ta="center">
        {status === 'processing' && 'Authentication in progress...'}
        {status === 'success' && 'Authentication successful!'}
        {status === 'error' && 'Authentication error'}
      </Title>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
        {status === 'processing' && <Loader size="lg" />}
      </div>

      <Stack gap="md" align="center">
        {status === 'success' && <Alert color="green" ta="center">{message}</Alert>}
        {status === 'error' && <Alert color="red" ta="center">{message}</Alert>}
        {status === 'processing' && <Text ta="center">{message}</Text>}

        {showBrowserFallback && status !== 'success' && (
          <Button
            onClick={() => {
              const code = searchParams.get('code')!;
              const rawState = searchParams.get('state');
              const state = parseState(rawState);
              const storedProvider = (localStorage.getItem('oauth_provider') || state?.provider || 'github').toLowerCase();
              const provider: Provider = storedProvider === 'google' ? 'google' : 'github';
              const isLinkMode = localStorage.getItem('oauth_link_mode') === 'true';
              const returnUrl = state?.returnUrl || localStorage.getItem('oauth_return_url') || '/';
              forceWebExchange(code, provider, isLinkMode, returnUrl);
            }}
          >
            Continue in browser
          </Button>
        )}
      </Stack>
    </Container>
  );
}