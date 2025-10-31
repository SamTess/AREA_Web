import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { NameStep } from '../src/components/ui/area-simple-steps/NameStep';

const renderWithProvider = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('NameStep', () => {
  const mockOnNameChange = jest.fn();
  const mockOnDescriptionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render name and description inputs', () => {
    renderWithProvider(
      <NameStep
        areaName=""
        areaDescription=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('should call onNameChange when name input changes', () => {
    renderWithProvider(
      <NameStep
        areaName=""
        areaDescription=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    const nameInput = inputs[0];

    fireEvent.change(nameInput, { target: { value: 'Test Area' } });
    expect(mockOnNameChange).toHaveBeenCalledWith('Test Area');
  });

  it('should call onDescriptionChange when description input changes', () => {
    renderWithProvider(
      <NameStep
        areaName=""
        areaDescription=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    const descriptionInput = inputs[1];

    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    expect(mockOnDescriptionChange).toHaveBeenCalledWith('Test Description');
  });

  it('should display provided area name', () => {
    renderWithProvider(
      <NameStep
        areaName="My Area"
        areaDescription=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const nameInput = screen.getByDisplayValue('My Area');
    expect(nameInput).toBeInTheDocument();
  });

  it('should display provided description', () => {
    renderWithProvider(
      <NameStep
        areaName=""
        areaDescription="My Description"
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const descriptionInput = screen.getByDisplayValue('My Description');
    expect(descriptionInput).toBeInTheDocument();
  });

  it('should render with both name and description', () => {
    renderWithProvider(
      <NameStep
        areaName="Test Area"
        areaDescription="Test Description"
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const nameInput = screen.getByDisplayValue('Test Area');
    const descriptionInput = screen.getByDisplayValue('Test Description');

    expect(nameInput).toBeInTheDocument();
    expect(descriptionInput).toBeInTheDocument();
  });

  it('should handle empty initial values', () => {
    renderWithProvider(
      <NameStep
        areaName=""
        areaDescription=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('');
    expect(inputs[1]).toHaveValue('');
  });
});
