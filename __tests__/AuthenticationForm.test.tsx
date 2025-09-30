import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { AuthenticationForm } from '@/components/ui/AuthenticationForm'

const mockProviders = [
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png", label: 'Google' },
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", label: 'Microsoft' },
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg", label: 'Github' },
];

jest.mock('../src/services/oauthService', () => ({
  getOAuthProviders: jest.fn(() => Promise.resolve(mockProviders)),
}))

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

describe('AuthenticationForm', () => {
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
})