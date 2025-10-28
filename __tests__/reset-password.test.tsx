import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import ResetPasswordPage from '@/app/reset-password/page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: () => 'mock-token',
  }),
}))

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

describe('ResetPasswordPage', () => {
  it('renders the ResetPasswordForm', async () => {
    await act(async () => {
      render(<ResetPasswordPage />, { wrapper: AllTheProviders })
    })
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirm your new password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()
  })
})