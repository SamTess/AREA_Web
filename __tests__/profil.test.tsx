import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import ProfilPage from '@/app/profil/page';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

describe('ProfilPage', () => {
  it('renders loading state initially', () => {
    render(<ProfilPage />, { wrapper: AllTheProviders });
    expect(document.querySelector('.mantine-Loader-root')).toBeInTheDocument();
  });


  it('displays avatar', async () => {
    render(<ProfilPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(document.querySelector('img')).toBeInTheDocument();
    });
  });

  it('allows changing first name', async () => {
    render(<ProfilPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      const firstNameInput = screen.getByLabelText('First Name');
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
      expect(firstNameInput).toHaveValue('Jane');
    });
  });

  it('allows changing last name', async () => {
    render(<ProfilPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      const lastNameInput = screen.getByLabelText('Last Name');
      fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
      expect(lastNameInput).toHaveValue('Smith');
    });
  });


  it('allows changing password', async () => {
    render(<ProfilPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      const passwordInput = screen.getByLabelText('New Password (optional)');
      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      expect(passwordInput).toHaveValue('newpassword123');
    });
  });

  it('enables save button when form is dirty', async () => {
    render(<ProfilPage />, { wrapper: AllTheProviders });

    const firstNameInput = await screen.findByLabelText('First Name');
    act(() => {
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });
  });
});