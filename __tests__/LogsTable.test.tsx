import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { LogsTable } from '../src/components/ui/dashboard/LogsTable';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

const mockLogs = [
  { id: 1, timestamp: '2025-10-07 14:30:25', level: 'INFO', message: 'User login successful', source: 'auth-service' },
  { id: 2, timestamp: '2025-10-07 14:28:15', level: 'ERROR', message: 'Failed to connect to database', source: 'db-service' },
  { id: 3, timestamp: '2025-10-07 14:25:10', level: 'WARNING', message: 'High memory usage detected', source: 'system-monitor' },
];

describe('LogsTable', () => {
  it('renders the table with logs data', () => {
    render(<LogsTable logs={mockLogs} />, { wrapper: AllTheProviders });

    expect(screen.getByText('System Logs')).toBeInTheDocument();
    expect(screen.getByText('User login successful')).toBeInTheDocument();
    expect(screen.getByText('Failed to connect to database')).toBeInTheDocument();
    expect(screen.getByText('High memory usage detected')).toBeInTheDocument();
  });

  it('displays log levels with correct badge colors', () => {
    render(<LogsTable logs={mockLogs} />, { wrapper: AllTheProviders });

    expect(screen.getByText('INFO')).toBeInTheDocument();
    expect(screen.getByText('ERROR')).toBeInTheDocument();
    expect(screen.getByText('WARNING')).toBeInTheDocument();
  });

  it('renders timestamps with monospace font', () => {
    render(<LogsTable logs={mockLogs} />, { wrapper: AllTheProviders });

    const timestamp = screen.getByText('2025-10-07 14:30:25');
    expect(timestamp).toBeInTheDocument();
    expect(timestamp).toHaveStyle('font-family: monospace');
  });

  it('renders sources with monospace font', () => {
    render(<LogsTable logs={mockLogs} />, { wrapper: AllTheProviders });

    const source = screen.getByText('auth-service');
    expect(source).toBeInTheDocument();
    expect(source).toHaveStyle('font-family: monospace');
  });

  it('renders table headers correctly', () => {
    render(<LogsTable logs={mockLogs} />, { wrapper: AllTheProviders });

    expect(screen.getByText('Timestamp')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  it('handles empty logs list', () => {
    render(<LogsTable logs={[]} />, { wrapper: AllTheProviders });

    expect(screen.getByText('System Logs')).toBeInTheDocument();
    expect(screen.queryByText('User login successful')).not.toBeInTheDocument();
  });

  it('does not show add button or actions', () => {
    render(<LogsTable logs={mockLogs} />, { wrapper: AllTheProviders });

    expect(screen.queryByText('Add')).not.toBeInTheDocument();
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
  });
});