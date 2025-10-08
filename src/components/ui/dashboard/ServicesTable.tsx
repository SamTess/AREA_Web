import { DataTable, Column } from '../DataTable';

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
        <img
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
      itemsPerPage={4}
      onAdd={onAddService}
      onEdit={onEditService}
      onDelete={onDeleteService}
      addButtonText="Add Service"
    />
  );
}