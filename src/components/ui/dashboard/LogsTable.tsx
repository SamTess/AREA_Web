import { Badge } from '@mantine/core';
import { DataTable, Column } from '../DataTable';

interface Log {
  id: number;
  timestamp: string;
  level: string;
  message: string;
  source: string;
}

interface LogsTableProps {
  logs: Log[];
}

export function LogsTable({ logs }: LogsTableProps) {
  const columns: Column<Log>[] = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (log) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>
          {log.timestamp}
        </span>
      ),
    },
    {
      key: 'level',
      label: 'Level',
      render: (log) => (
        <Badge
          color={
            log.level === 'ERROR' ? 'red' :
            log.level === 'WARNING' ? 'yellow' :
            'blue'
          }
          variant="light"
          size="sm"
        >
          {log.level}
        </Badge>
      ),
    },
    {
      key: 'source',
      label: 'Source',
      render: (log) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>
          {log.source}
        </span>
      ),
    },
    {
      key: 'message',
      label: 'Message',
    },
  ];

  return (
    <DataTable
      title="System Logs"
      data={logs}
      columns={columns}
      itemsPerPage={5}
      showAddButton={false}
      showActions={false}
    />
  );
}