import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { ServicesTable } from '../src/components/ui/dashboard/ServicesTable';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

const mockServices = [
  { id: 1, name: 'GitHub', logo: 'https://example.com/github.png' },
  { id: 2, name: 'Slack', logo: 'https://example.com/slack.png' },
  { id: 3, name: 'Discord', logo: 'https://example.com/discord.png' },
];

const mockOnAddService = jest.fn();
const mockOnEditService = jest.fn();
const mockOnDeleteService = jest.fn();

describe('ServicesTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the table with services data', () => {
    render(
      <ServicesTable
        services={mockServices}
        onAddService={mockOnAddService}
        onEditService={mockOnEditService}
        onDeleteService={mockOnDeleteService}
      />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByText('All Services')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Slack')).toBeInTheDocument();
    expect(screen.getByText('Discord')).toBeInTheDocument();
  });

  it('renders service logos', () => {
    render(
      <ServicesTable
        services={mockServices}
        onAddService={mockOnAddService}
        onEditService={mockOnEditService}
        onDeleteService={mockOnDeleteService}
      />,
      { wrapper: AllTheProviders }
    );

    // Check for images - they should be rendered with alt text
    const images = screen.getAllByAltText(/GitHub|Slack|Discord/);
    expect(images).toHaveLength(3);
  });

  it('renders add service button', () => {
    render(
      <ServicesTable
        services={mockServices}
        onAddService={mockOnAddService}
        onEditService={mockOnEditService}
        onDeleteService={mockOnDeleteService}
      />,
      { wrapper: AllTheProviders }
    );

    const addButton = screen.getByText('Add Service');
    expect(addButton).toBeInTheDocument();
    fireEvent.click(addButton);
    expect(mockOnAddService).toHaveBeenCalled();
  });

  it('handles edit service action', () => {
    render(
      <ServicesTable
        services={mockServices}
        onAddService={mockOnAddService}
        onEditService={mockOnEditService}
        onDeleteService={mockOnDeleteService}
      />,
      { wrapper: AllTheProviders }
    );

    // Find edit buttons by their icon
    const editButtons = screen.getAllByRole('button').filter(button => 
      button.querySelector('svg') && button.textContent === ''
    );
    expect(editButtons.length).toBeGreaterThan(0);
    fireEvent.click(editButtons[0]);
    expect(mockOnEditService).toHaveBeenCalledWith(mockServices[0]);
  });



  it('renders table headers correctly', () => {
    render(
      <ServicesTable
        services={mockServices}
        onAddService={mockOnAddService}
        onEditService={mockOnEditService}
        onDeleteService={mockOnDeleteService}
      />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Logo')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('handles empty services list', () => {
    render(
      <ServicesTable
        services={[]}
        onAddService={mockOnAddService}
        onEditService={mockOnEditService}
        onDeleteService={mockOnDeleteService}
      />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByText('All Services')).toBeInTheDocument();
    expect(screen.queryByText('GitHub')).not.toBeInTheDocument();
  });
});