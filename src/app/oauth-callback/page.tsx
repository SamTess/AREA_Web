"use client";
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Title, Text, Loader, Alert, Button, Stack } from '@mantine/core';
import { useAuth } from '../../hooks/useAuth';
import axios from '../../config/axios';
import { isAxiosError } from 'axios';

function isProbablyMobileApp(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const expectFlag = localStorage.getItem('oauth_expect_mobile') === 'true';
    const win = window as Window & { ReactNativeWebView?: unknown };
    const hasReactNativeWebView = typeof win.ReactNativeWebView !== 'undefined';
    const hasExpo = ua.includes('Expo');
    return Boolean(expectFlag || hasReactNativeWebView || hasExpo);
  } catch (e) {
    console.warn('isProbablyMobileApp detection failed:', e);
    return false;
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseState(raw: string | null): { app_redirect_uri?: string; returnUrl?: string; provider?: string } | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);

    if (typeof parsed !== 'object' || parsed === null) return null;

    const obj = parsed as Record<string, unknown>;
    const result: { app_redirect_uri?: string; returnUrl?: string; provider?: string } = {};
    if (typeof obj.app_redirect_uri === 'string') result.app_redirect_uri = obj.app_redirect_uri;
    if (typeof obj.returnUrl === 'string') result.returnUrl = obj.returnUrl;
    if (typeof obj.provider === 'string') result.provider = obj.provider.toLowerCase();

    return result;
  } catch (e) {
    console.warn('Failed to parse OAuth state:', e);
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
      console.warn('fetchCurrentUser failed:', e);
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

    try {
      await refreshAuth?.();
    } catch (e) {
      console.warn('refreshAuth failed after OAuth success:', e);
    }

    setTimeout(() => {
      const safe = validateReturnUrl(returnUrl);
      if (safe) {
        window.location.replace(safe);
        return;
      }
      try {
        const stored = localStorage.getItem('oauth_return_url');
        if (stored && stored === returnUrl) {
          window.location.replace(returnUrl);
          return;
        }
      } catch (e) {
        console.warn('Error reading oauth_return_url from localStorage:', e);
      }

      console.warn('Blocked unsafe returnUrl redirect:', returnUrl);
      window.location.replace('/');
    }, 800);
  }, [refreshAuth]);

  function validateReturnUrl(url: string | undefined | null): string | null {
    if (!url) return null;
    try {
      if (url.startsWith('/')) return url;
      if (/^\/\//.test(url)) return null;
      const parsed = new URL(url, window.location.origin);
      if (parsed.origin === window.location.origin) return parsed.pathname + parsed.search + parsed.hash;
      const ALLOWLIST: string[] = [];
      if (ALLOWLIST.includes(parsed.hostname)) return parsed.toString();
      return null;
    } catch (e) {
      console.warn('validateReturnUrl failed:', e);
      return null;
    }
  }

  async function forceWebExchange(code: string, provider: string, isLinkMode: boolean, returnUrl: string) {
    const url = isLinkMode ? `/api/oauth-link/${provider}/exchange` : `/api/oauth/${provider}/exchange`;
    console.debug('Attempting OAuth exchange', { url, provider, isLinkMode });
    try {
      setStatus('processing');
      setMessage('Completing authentication in browser...');
      const response = await axios.post(url, { code });
      console.debug('OAuth exchange response', { status: response?.status, data: response?.data });

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
        console.error('Axios error response during OAuth exchange:', resp?.status, resp?.data);
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
      const provider: string = storedProvider;
      const returnUrl = (state?.returnUrl && typeof state.returnUrl === 'string' ? state.returnUrl : (localStorage.getItem('oauth_return_url') || '/')) as string;
      const forceWeb = searchParams.get('forceWeb') === '1';

      const deeplinkKey = `oauth_deeplink_attempted_${code}`;
      const alreadyTriedDeepLink = sessionStorage.getItem(deeplinkKey) === 'true';

      if (!forceWeb && isProbablyMobileApp()) {
        if (!alreadyTriedDeepLink) {
          try {
            sessionStorage.setItem(deeplinkKey, 'true');
          } catch (e) {
            console.warn('sessionStorage.setItem failed:', e);
            setShowBrowserFallback(true);
          }
          setStatus('processing');
          setMessage('Returning to the app...');

          const appRedirect = state?.app_redirect_uri || 'areamobile://oauthredirect';
          const dl = `${appRedirect}?code=${encodeURIComponent(code)}&provider=${encodeURIComponent(provider)}`;
          try {
            window.location.href = dl;
          } catch (e) {
            console.warn('Deep link navigation failed:', e, 'dl:', dl);
          }

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

        {showBrowserFallback && status !== 'success' && (() => {
          const fallbackCode = searchParams.get('code');
          const rawState = searchParams.get('state');
          const state = parseState(rawState);
          const storedProvider = (localStorage.getItem('oauth_provider') || state?.provider || 'github').toLowerCase();
          const provider: string = storedProvider;
          const isLinkMode = localStorage.getItem('oauth_link_mode') === 'true';
          const returnUrl = state?.returnUrl || localStorage.getItem('oauth_return_url') || '/';

          return (
            <Button
              onClick={() => {
                if (!fallbackCode) {
                  console.warn('Fallback clicked but no code present');
                  setMessage('No authorization code available. Please retry the flow from the original app.');
                  return;
                }
                forceWebExchange(fallbackCode, provider, isLinkMode, returnUrl as string);
              }}
              disabled={!fallbackCode}
            >
              Continue in browser
            </Button>
          );
        })()}
      </Stack>
    </Container>
  );
}