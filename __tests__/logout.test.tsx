import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import LogoutPage from '../src/app/logout/page';

// Mock scrollIntoView for jsdom
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  writable: true,
  value: jest.fn(),
});

// Mock the authService logout function
jest.mock('../src/services/authService', () => ({
  logout: jest.fn(),
}));

import { logout } from '../src/services/authService';

// Mock Next.js router
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Create a custom render function with MantineProvider
const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>
    {children}
  </MantineProvider>
);

const customRender = (ui: React.ReactElement) => render(ui, { wrapper: AllTheProviders });

describe('LogoutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.href = '';
  });

  it('renders the logout page with initial processing state', () => {
    customRender(<LogoutPage />);

    expect(screen.getByRole('heading', { name: 'Logging out...' })).toBeInTheDocument();
    expect(document.querySelector('.mantine-Loader-root')).toBeInTheDocument(); // Loader
  });

  it('successfully logs out and redirects to login', async () => {
    (logout as jest.MockedFunction<typeof logout>).mockResolvedValueOnce(undefined);

    customRender(<LogoutPage />);

    // Wait for the logout to complete
    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1);
    });

    // Check that success message appears
    await waitFor(() => {
      expect(screen.getByText('Logout Successful')).toBeInTheDocument();
      expect(screen.getByText('Logout successful! Redirecting to login...')).toBeInTheDocument();
    });

    // Check that window.location.href is set to /login after timeout
    await waitFor(() => {
      expect(mockLocation.href).toBe('/login');
    }, { timeout: 2000 });
  });

  it('handles logout error and still redirects to login', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (logout as jest.MockedFunction<typeof logout>).mockRejectedValueOnce(new Error('Logout failed'));

    customRender(<LogoutPage />);

    // Wait for the logout to complete
    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1);
    });

    // Check that error message appears
    await waitFor(() => {
      expect(screen.getByText('Logout Error')).toBeInTheDocument();
      expect(screen.getByText('Logout failed, but redirecting to login...')).toBeInTheDocument();
    });

    // Check that console.error was called
    expect(consoleSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error));

    // Check that window.location.href is set to /login after timeout
    await waitFor(() => {
      expect(mockLocation.href).toBe('/login');
    }, { timeout: 2500 });

    consoleSpy.mockRestore();
  });

  it('shows loader during logout process', () => {
    customRender(<LogoutPage />);

    const loader = document.querySelector('.mantine-Loader-root');
    expect(loader).toBeInTheDocument();
  });
});