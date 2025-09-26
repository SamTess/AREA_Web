import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import LoginPage from '@/app/login/page'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

describe('LoginPage', () => {
  it('renders the AuthenticationForm', () => {
    render(<LoginPage />, { wrapper: AllTheProviders })
    expect(screen.getByText('Welcome to Area, login with')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Area@Area.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument()
  })
})