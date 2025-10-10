import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { ResetPasswordForm } from '@/components/ui/auth/ResetPasswordForm'
import { resetPassword } from '../src/services/authService';

const mockResetPassword = resetPassword as jest.MockedFunction<typeof resetPassword>;

jest.mock('../src/services/authService', () => ({
  resetPassword: jest.fn(),
}))

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: jest.fn(() => 'mock-token'),
  }),
}))

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, { wrapper: AllTheProviders, ...options })

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with password fields', () => {
    customRender(<ResetPasswordForm />);

    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your new password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    customRender(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText('Your password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');

    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'differentpassword');

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('shows validation error when password is too short', async () => {
    const user = userEvent.setup();
    customRender(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText('Your password');

    await user.type(passwordInput, '123');
    await user.tab(); // blur the input

    await waitFor(() => {
      expect(screen.getByText('Password should include at least 6 characters')).toBeInTheDocument();
    });
  });

  it('submits the form successfully', async () => {
    const user = userEvent.setup();
    mockResetPassword.mockResolvedValueOnce();

    customRender(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText('Your password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('mock-token', 'newpassword123');
    });

    expect(screen.getByText('Password reset successful! Redirecting to login...')).toBeInTheDocument();

    // Wait for the redirect
    await new Promise(resolve => setTimeout(resolve, 1600));
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('shows error when reset password fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid token';
    mockResetPassword.mockRejectedValueOnce({
      response: { status: 401, data: { message: errorMessage } }
    });

    customRender(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText('Your password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid or expired token.')).toBeInTheDocument();
    });
  });

  it('disables submit button when form has errors', async () => {
    const user = userEvent.setup();
    customRender(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText('Your password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'differentpassword');

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});