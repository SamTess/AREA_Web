'use client';

import { useSearchParams } from 'next/navigation';
import AreaEditor from '../../../components/ui/areaCreation/AreaEditor';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/services/authService';

export default function NewAreaPage() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draft') || undefined;
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          await router.replace('/login');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        await router.replace('/login');
      }
    };
    checkLogin();
  }, [router]);
  
  return <AreaEditor draftId={draftId} />;
}