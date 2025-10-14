'use client';

import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/ui/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div>
        <div style={{ height: '130px' }}></div>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
        <div style={{ height: '130px' }}></div>
    </div>
  );
}

