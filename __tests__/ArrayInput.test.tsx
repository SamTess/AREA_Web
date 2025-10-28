import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ArrayInput } from '../src/components/ui/area-simple-steps/ArrayInput';
import { MantineProvider } from '@mantine/core';

const renderWithMantine = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

describe('ArrayInput', () => {
  const mockOnChange = jest.fn();
  const field = {
    name: 'Test Array',
    description: 'A test array field',
    placeholder: 'Enter value',
    mandatory: true,
    type: 'array' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the field name and description', () => {
    renderWithMantine(<ArrayInput field={field} value={[]} onChange={mockOnChange} />);

    expect(screen.getByText('Test Array')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('A test array field')).toBeInTheDocument();
  });

  it('renders empty state message when no items', () => {
    renderWithMantine(<ArrayInput field={field} value={[]} onChange={mockOnChange} />);

    expect(screen.getByText('No items yet. Add items below.')).toBeInTheDocument();
  });

  it('renders pills for array items', () => {
    const value = ['item1', 'item2'];
    renderWithMantine(<ArrayInput field={field} value={value} onChange={mockOnChange} />);

    expect(screen.getByText('item1')).toBeInTheDocument();
    expect(screen.getByText('item2')).toBeInTheDocument();
  });

  it('adds item when Enter is pressed', () => {
    renderWithMantine(<ArrayInput field={field} value={[]} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter value');
    fireEvent.change(input, { target: { value: 'new item' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnChange).toHaveBeenCalledWith(['new item']);
  });

  it('adds item when Add button is clicked', () => {
    renderWithMantine(<ArrayInput field={field} value={[]} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter value');
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.change(input, { target: { value: 'new item' } });
    fireEvent.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith(['new item']);
  });

  it('does not add empty item', () => {
    renderWithMantine(<ArrayInput field={field} value={[]} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Enter value');
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(addButton);

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('removes item when pill remove button is clicked', () => {
    const value = ['item1', 'item2'];
    renderWithMantine(<ArrayInput field={field} value={value} onChange={mockOnChange} />);

    // Find remove buttons - they are svg elements inside buttons
    const removeButtons = screen.getAllByRole('button');
    // The remove buttons are the ones with svg
    const removeButton = removeButtons.find(button => button.querySelector('svg'));
    if (removeButton) {
      fireEvent.click(removeButton);
      expect(mockOnChange).toHaveBeenCalledWith(['item2']);
    }
  });
});