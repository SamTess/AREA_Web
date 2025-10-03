'use client';

import { useParams } from 'next/navigation';
import AreaEditor from '../../../components/ui/areaCreation/AreaEditor';

export default function EditAreaPage() {
  const params = useParams();
  const areaId = parseInt(params.id as string);

  return <AreaEditor areaId={areaId} />;
}