import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { AuthenticationForm } from '@/components/ui/AuthenticationForm'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

describe('AuthenticationForm', () => {
  it('renders login form by default', () => {
    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    expect(screen.getByText('Welcome to Area, login with')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Area@Area.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument()
    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.getByText('Microsoft')).toBeInTheDocument()
    expect(screen.getByText('Github')).toBeInTheDocument()
  })

  it('switches to register mode', () => {
    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    const registerLink = screen.getByText("Don't have an account? Register")
    fireEvent.click(registerLink)
    expect(screen.getByText('Welcome to Area, register with')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
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