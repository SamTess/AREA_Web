'use client';

import { useParams, useSearchParams } from 'next/navigation';
import AreaEditor from '../../../components/ui/areaCreation/AreaEditor';
import { getCurrentUser } from '@/services/authService';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAreaById } from '@/services/areasService';

export default function EditAreaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const areaId = params.id as string;
  const draftId = searchParams.get('draft') || undefined;
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      let user;
      try {
        user = await getCurrentUser();
        if (!user) {
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Error getting current user:', error);
        router.push('/');
        return;
      }
      try {
        const area = await getAreaById(areaId);
        if (area) {
          if (area.userId !== user.id) {
            router.push('/areas');
          }
        } else {
          router.push('/areas');
        }
      } catch (error) {
        console.error('Error getting area by ID:', error);
        router.push('/areas');
      }
    };
    checkLogin();
  }, [router, areaId]);
  return <AreaEditor areaId={areaId} draftId={draftId} />;
}