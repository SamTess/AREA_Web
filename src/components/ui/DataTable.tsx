import { Card, Title, Group, Button, Table, Pagination } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useState, ReactNode } from 'react';

export interface Column<T> {
  key: keyof T | 'actions';
  label: string;
  render?: (item: T) => ReactNode;
  width?: string | number;
}

export interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  itemsPerPage?: number;
  
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  
  addButtonText?: string;
  showAddButton?: boolean;
  showActions?: boolean;
}

export function DataTable<T extends { id: number | string }>({
  title,
  data,
  columns,
  itemsPerPage = 10,
  onAdd,
  onEdit,
  onDelete,
  addButtonText,
  showAddButton = true,
  showActions = true,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  // Add actions column if needed
  const allColumns: Column<T>[] = showActions ? [
    ...columns,
    {
      key: 'actions' as keyof T,
      label: 'Actions',
      render: (item: T) => (
        <Group gap="xs">
          {onEdit && (
            <Button
              size="xs"
              variant="subtle"
              leftSection={<IconEdit size={14} />}
              onClick={() => onEdit(item)}
            />
          )}
          {onDelete && (
            <Button
              size="xs"
              variant="subtle"
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={() => onDelete(item)}
            />
          )}
        </Group>
      )
    }
  ] : columns;

  return (
    <Card withBorder shadow="sm" p="md" radius="md">
      <Group justify="space-between" mb="sm">
        <Title order={3}>{title}</Title>
        {showAddButton && onAdd && (
          <Button
            leftSection={<IconPlus size={16} />}
            size="sm"
            variant="light"
            onClick={onAdd}
          >
            {addButtonText || 'Add'}
          </Button>
        )}
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            {allColumns.map((column) => (
              <Table.Th key={String(column.key)} style={{ width: column.width }}>
                {column.label}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {paginatedData.map((item) => (
            <Table.Tr key={item.id}>
              {allColumns.map((column) => (
                <Table.Td key={String(column.key)}>
                  {column.render ? (
                    column.render(item)
                  ) : (
                    String(item[column.key as keyof T] || '')
                  )}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {totalPages > 1 && (
        <Group justify="center" mt="md">
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={setCurrentPage}
            size="sm"
            radius="xl"
          />
        </Group>
      )}
    </Card>
  );
}