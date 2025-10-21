'use client';

import { useSearchParams } from 'next/navigation';
import AreaEditor from '../../../components/ui/areaCreation/AreaEditor';

export default function NewAreaPage() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draft') || undefined;
  
  return <AreaEditor draftId={draftId} />;
}