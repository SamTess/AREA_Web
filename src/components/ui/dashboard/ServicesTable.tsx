import { DataTable, Column } from '../DataTable';
import Image from 'next/image';
interface Service {
  id: number;
  name: string;
  logo: string;
}

interface ServicesTableProps {
  services: Service[];
  onAddService?: () => void;
  onEditService?: (service: Service) => void;
  onDeleteService?: (service: Service) => void;
}

export function ServicesTable({ services, onAddService, onEditService, onDeleteService }: ServicesTableProps) {
  const columns: Column<Service>[] = [
    {
      key: 'id',
      label: 'ID',
    },
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'logo',
      label: 'Logo',
      render: (service) => (
        <Image
          width={24}
          height={24}
          src={service.logo}
          alt={service.name}
          style={{ width: 24, height: 24 }}
        />
      ),
    },
  ];

  return (
    <DataTable
      title="All Services"
      data={services}
      columns={columns}
      itemsPerPage={5}
      onAdd={onAddService}
      onEdit={onEditService}
      onDelete={onDeleteService}
      addButtonText="Add Service"
    />
  );
}