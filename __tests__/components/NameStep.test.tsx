import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { NameStep } from '../../src/components/ui/area-simple-steps/NameStep';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

describe('NameStep', () => {
  const mockOnNameChange = jest.fn();
  const mockOnDescriptionChange = jest.fn();

  const defaultProps = {
    areaName: '',
    areaDescription: '',
    onNameChange: mockOnNameChange,
    onDescriptionChange: mockOnDescriptionChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render name and description inputs', () => {
    render(<NameStep {...defaultProps} />, { wrapper: Wrapper });
    
    expect(screen.getByLabelText(/AREA Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('should display current values', () => {
    render(<NameStep {...defaultProps} areaName="Test Area" areaDescription="Test Description" />, { wrapper: Wrapper });
    
    expect(screen.getByDisplayValue('Test Area')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });

  it('should call onNameChange when name input changes', async () => {
    const user = userEvent.setup();
    render(<NameStep {...defaultProps} />, { wrapper: Wrapper });
    
    const nameInput = screen.getByLabelText(/AREA Name/i);
    await user.type(nameInput, 'New Area');
    
    expect(mockOnNameChange).toHaveBeenCalled();
  });

  it('should call onDescriptionChange when description changes', async () => {
    const user = userEvent.setup();
    render(<NameStep {...defaultProps} />, { wrapper: Wrapper });
    
    const descInput = screen.getByPlaceholderText('This AREA does...');
    await user.type(descInput, 'New Description');
    
    expect(mockOnDescriptionChange).toHaveBeenCalled();
  });

  it('should show placeholder text', () => {
    render(<NameStep {...defaultProps} />, { wrapper: Wrapper });
    
    expect(screen.getByPlaceholderText('My automation')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('This AREA does...')).toBeInTheDocument();
  });

  it('should show helper text', () => {
    render(<NameStep {...defaultProps} />, { wrapper: Wrapper });
    
    expect(screen.getByText('Give your AREA a descriptive name')).toBeInTheDocument();
    expect(screen.getByText('Explain what this AREA will do')).toBeInTheDocument();
  });

  it('should mark name field as required', () => {
    render(<NameStep {...defaultProps} />, { wrapper: Wrapper });
    
    const nameInput = screen.getByLabelText(/AREA Name/i);
    expect(nameInput).toBeRequired();
  });
});
