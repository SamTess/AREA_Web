import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { AuthenticationForm } from '@/components/ui/AuthenticationForm'

const mockProviders = [
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png", label: 'Google' },
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", label: 'Microsoft' },
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg", label: 'Github' },
];

// Mock the services
jest.mock('../src/services/oauthService', () => ({
  getOAuthProviders: jest.fn(() => Promise.resolve(mockProviders)),
  initiateOAuth: jest.fn(),
}))

jest.mock('../src/services/authService', () => ({
  login: jest.fn(),
  register: jest.fn(),
  forgotPassword: jest.fn(),
  extractToken: jest.fn(),
}))

// Import mocked modules with proper typing
import { initiateOAuth } from '../src/services/oauthService';
import { login, register, forgotPassword, extractToken } from '../src/services/authService';

const mockInitiateOAuth = initiateOAuth as jest.MockedFunction<typeof initiateOAuth>;
const mockLogin = login as jest.MockedFunction<typeof login>;
const mockRegister = register as jest.MockedFunction<typeof register>;
const mockForgotPassword = forgotPassword as jest.MockedFunction<typeof forgotPassword>;
const mockExtractToken = extractToken as jest.MockedFunction<typeof extractToken>;

// Mock router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

describe('AuthenticationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.setItem.mockClear();
    mockPush.mockClear();
  });

  it('renders login form by default', async () => {
    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    expect(screen.getByText('Welcome to Area, login with')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Area@Area.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument()
      expect(screen.getByText('Microsoft')).toBeInTheDocument()
      expect(screen.getByText('Github')).toBeInTheDocument()
    })
  })

  it('switches to register mode', () => {
    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    const registerLink = screen.getByText("Don't have an account? Register")
    fireEvent.click(registerLink)
    expect(screen.getByText('Welcome to Area, register with')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your first name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your last name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument()
  })

  it('switches to forgot password mode', () => {
    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    const forgotLink = screen.getByText('Forgot password?')
    fireEvent.click(forgotLink)
    expect(screen.getByText('Welcome to Area, forgotPassword with')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Your password')).not.toBeInTheDocument()
    expect(screen.getByText('Send')).toBeInTheDocument()
  })

  it('submits the form without errors for valid input', async () => {
    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    const emailInput = screen.getByPlaceholderText('Area@Area.com')
    const passwordInput = screen.getByPlaceholderText('Your password')
    const submitButton = screen.getByText('Login')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.queryByText('Invalid email')).not.toBeInTheDocument()
      expect(screen.queryByText('Password should include at least 6 characters')).not.toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    
    const emailInput = screen.getByPlaceholderText('Area@Area.com')
    await user.type(emailInput, 'invalid-email')
    await user.tab()
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })
  })

  it('validates password length', async () => {
    const user = userEvent.setup();
    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    
    const passwordInput = screen.getByPlaceholderText('Your password')
    await user.type(passwordInput, '123')
    await user.tab()
    
    await waitFor(() => {
      expect(screen.getByText('Password should include at least 6 characters')).toBeInTheDocument()
    })
  })

  it('validates password confirmation in register mode', async () => {
    const user = userEvent.setup();
    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    
    // Switch to register mode
    fireEvent.click(screen.getByText("Don't have an account? Register"))
    
    const passwordInput = screen.getByPlaceholderText('Your password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password')
    
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'different')
    await user.tab()
    
    await waitFor(() => {
      expect(screen.getByText('Passwords did not match')).toBeInTheDocument()
    })
  })

  it('validates required fields in register mode', async () => {
    const user = userEvent.setup();
    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    
    // Switch to register mode
    fireEvent.click(screen.getByText("Don't have an account? Register"))
    
    const firstNameInput = screen.getByPlaceholderText('Your first name')
    const lastNameInput = screen.getByPlaceholderText('Your last name')
    
    await user.click(firstNameInput)
    await user.tab()
    await user.click(lastNameInput)
    await user.tab()
    
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument()
      expect(screen.getByText('Last name is required')).toBeInTheDocument()
    })
  })

  it('handles successful login', async () => {
    const mockToken = 'mock-token';
    mockLogin.mockResolvedValue({ 
      token: mockToken,
      message: 'Login successful',
      user: {
        id: 1,
        email: 'test@example.com',
        isActive: true,
        isAdmin: false,
        createdAt: new Date().toISOString()
      },
      refreshToken: 'refresh-token'
    });
    mockExtractToken.mockReturnValue(mockToken);

    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    
    const emailInput = screen.getByPlaceholderText('Area@Area.com')
    const passwordInput = screen.getByPlaceholderText('Your password')
    const submitButton = screen.getByText('Login')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', mockToken);
    })
  })

  it('handles login error', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValue(new Error(errorMessage));

    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    
    const emailInput = screen.getByPlaceholderText('Area@Area.com')
    const passwordInput = screen.getByPlaceholderText('Your password')
    const submitButton = screen.getByText('Login')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('handles successful registration', async () => {
    const mockToken = 'mock-token';
    mockRegister.mockResolvedValue({ 
      token: mockToken,
      message: 'Registration successful',
      user: {
        id: 1,
        email: 'test@example.com',
        isActive: true,
        isAdmin: false,
        createdAt: new Date().toISOString()
      },
      refreshToken: 'refresh-token'
    });
    mockExtractToken.mockReturnValue(mockToken);

    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    
    // Switch to register mode
    fireEvent.click(screen.getByText("Don't have an account? Register"))
    
    const emailInput = screen.getByPlaceholderText('Area@Area.com')
    const passwordInput = screen.getByPlaceholderText('Your password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password')
    const firstNameInput = screen.getByPlaceholderText('Your first name')
    const lastNameInput = screen.getByPlaceholderText('Your last name')
    const submitButton = screen.getByText('Register')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    fireEvent.change(firstNameInput, { target: { value: 'John' } })
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      });
    })
  })

  it('handles successful forgot password', async () => {
    mockForgotPassword.mockResolvedValue();

    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    
    // Switch to forgot password mode
    fireEvent.click(screen.getByText('Forgot password?'))
    
    const emailInput = screen.getByPlaceholderText('Area@Area.com')
    const submitButton = screen.getByText('Send')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(screen.getByText('Password reset email sent. Check your inbox.')).toBeInTheDocument()
    })
  })

  it('handles OAuth provider click', async () => {
    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    
    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Google'))
    
    expect(mockInitiateOAuth).toHaveBeenCalledWith('Google')
  })

  it('switches back to login from register', () => {
    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    
    // Switch to register mode
    fireEvent.click(screen.getByText("Don't have an account? Register"))
    expect(screen.getByText('Welcome to Area, register with')).toBeInTheDocument()
    
    // Switch back to login
    fireEvent.click(screen.getByText('Already have an account? Login'))
    expect(screen.getByText('Welcome to Area, login with')).toBeInTheDocument()
  })

  it('switches back to login from forgot password', () => {
    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    
    // Switch to forgot password mode
    fireEvent.click(screen.getByText('Forgot password?'))
    expect(screen.getByText('Welcome to Area, forgotPassword with')).toBeInTheDocument()
    
    // Switch back to login
    fireEvent.click(screen.getByText('Back to login'))
    expect(screen.getByText('Welcome to Area, login with')).toBeInTheDocument()
  })

  it('handles login without token', async () => {
    mockLogin.mockResolvedValue({ 
      message: 'Success',
      user: {
        id: 1,
        email: 'test@example.com',
        isActive: true,
        isAdmin: false,
        createdAt: new Date().toISOString()
      },
      token: '',
      refreshToken: ''
    });
    mockExtractToken.mockReturnValue(null);

    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    
    const emailInput = screen.getByPlaceholderText('Area@Area.com')
    const passwordInput = screen.getByPlaceholderText('Your password')
    const submitButton = screen.getByText('Login')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Login failed: No token received')).toBeInTheDocument()
    })
  })

  it('clears messages when switching form types', () => {
    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    
    // First trigger an error
    fireEvent.click(screen.getByText('Login'))
    
    // Then switch form type
    fireEvent.click(screen.getByText("Don't have an account? Register"))
    
    // The error should be cleared
    expect(screen.queryByText('Invalid email')).not.toBeInTheDocument()
  })

  it('prevents double submission', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    
    const emailInput = screen.getByPlaceholderText('Area@Area.com')
    const passwordInput = screen.getByPlaceholderText('Your password')
    const submitButton = screen.getByText('Login')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    // Click submit twice rapidly
    fireEvent.click(submitButton)
    fireEvent.click(submitButton)
    
    // Should only be called once
    expect(mockLogin).toHaveBeenCalledTimes(1)
  })
})