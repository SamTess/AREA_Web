import { Badge, Anchor } from '@mantine/core';
import { DataTable, Column } from '../DataTable';

interface Area {
  id: number;
  name: string;
  description: string;
  lastRun: string;
  status: string;
  user: string;
}

interface AreasTableProps {
  areas: Area[];
  onAddArea?: () => void;
  onEditArea?: (area: Area) => void;
  onDeleteArea?: (area: Area) => void;
}

export function AreasTable({ areas, onAddArea, onEditArea, onDeleteArea }: AreasTableProps) {
  const columns: Column<Area>[] = [
    {
      key: 'id',
      label: 'ID',
    },
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'description',
      label: 'Description',
    },
    {
      key: 'lastRun',
      label: 'Last Run',
    },
    {
      key: 'status',
      label: 'Status',
      render: (area) => (
        <Badge
          color={
            area.status === 'success' ? 'green' :
            area.status === 'failed' ? 'red' :
            'yellow'
          }
          variant="light"
        >
          {area.status}
        </Badge>
      ),
    },
    {
      key: 'user',
      label: 'User',
      render: (area) => (
        <Anchor href={`/profil/${area.user.toLowerCase().replace(' ', '-')}`} c="blue" underline="hover">
          {area.user}
        </Anchor>
      ),
    },
  ];

  return (
    <DataTable
      title="All Areas"
      data={areas}
      columns={columns}
      itemsPerPage={10}
      onAdd={onAddArea}
      onEdit={onEditArea}
      onDelete={onDeleteArea}
      addButtonText="Add Area"
    />
  );
}