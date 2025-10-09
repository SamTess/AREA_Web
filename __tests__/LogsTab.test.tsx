import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { LogsTab } from '../src/components/ui/dashboard/LogsTab';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

// Mock the adminService
jest.mock('../src/services/adminService', () => ({
  getLogs: jest.fn(() => Promise.resolve([
    { id: 1, timestamp: '2025-10-07 14:30:25', level: 'INFO', message: 'User login successful', source: 'auth-service' },
    { id: 2, timestamp: '2025-10-07 14:28:15', level: 'ERROR', message: 'Failed to connect to database', source: 'db-service' },
  ])),
}));

describe('LogsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the logs tab with table', async () => {
    render(<LogsTab />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(screen.getByText('User login successful')).toBeInTheDocument();
      expect(screen.getByText('Failed to connect to database')).toBeInTheDocument();
    });
  });

  it('filters logs by search', async () => {
    render(<LogsTab />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(screen.getByText('User login successful')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search logs by message or source...');
    fireEvent.change(searchInput, { target: { value: 'database' } });

    await waitFor(() => {
      expect(screen.queryByText('User login successful')).not.toBeInTheDocument();
      expect(screen.getByText('Failed to connect to database')).toBeInTheDocument();
    });
  });

  it('filters logs by level', async () => {
    render(<LogsTab />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(screen.getByText('User login successful')).toBeInTheDocument();
    });

    const levelSelect = screen.getByPlaceholderText('Select level');
    fireEvent.click(levelSelect);

    const errorOptions = screen.getAllByText('ERROR');
    // Click the option in the dropdown (not the badge in the table)
    const errorOption = errorOptions.find(option => option.closest('[role="option"]'));
    expect(errorOption).toBeInTheDocument();
    fireEvent.click(errorOption!);

    await waitFor(() => {
      expect(screen.queryByText('User login successful')).not.toBeInTheDocument();
      expect(screen.getByText('Failed to connect to database')).toBeInTheDocument();
    });
  });

  it('handles reload logs', async () => {
    const { getLogs } = require('../src/services/adminService');

    render(<LogsTab />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(getLogs).toHaveBeenCalledTimes(1);
    });

    // Find reload button by its icon
    const reloadButtons = screen.getAllByRole('button').filter(button => 
      button.querySelector('svg')
    );
    const reloadButton = reloadButtons.find(button => !button.textContent?.trim());
    expect(reloadButton).toBeInTheDocument();
    fireEvent.click(reloadButton!);

    await waitFor(() => {
      expect(getLogs).toHaveBeenCalledTimes(2);
    });
  });
});