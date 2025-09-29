import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { UserMenu } from '@/components/ui/UserMenu'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

const mockUser = {
  name: "Test User",
  email: "testuser@example.com",
  avatarSrc: "https://example.com/avatar.png"
}

describe('UserMenu', () => {
  it('renders the user avatar', () => {
    render(<UserMenu user={mockUser} />, { wrapper: AllTheProviders })
    const avatar = screen.getByRole('img')
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', mockUser.avatarSrc)
  })

  it('opens menu when avatar is clicked', async () => {
    render(<UserMenu user={mockUser} />, { wrapper: AllTheProviders })
    const avatar = screen.getByRole('img')
    fireEvent.click(avatar)
    await waitFor(() => {
      expect(screen.getByText(mockUser.name)).toBeInTheDocument()
    })
  })

  it('renders menu items when opened', async () => {
    render(<UserMenu user={mockUser} />, { wrapper: AllTheProviders })
    const avatar = screen.getByRole('img')
    fireEvent.click(avatar)
    await waitFor(() => {
      expect(screen.getByText('Account settings')).toBeInTheDocument()
    })
    expect(screen.getByText('Change account')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('clicks menu items without error', async () => {
    render(<UserMenu user={mockUser} />, { wrapper: AllTheProviders })
    const avatar = screen.getByRole('img')
    fireEvent.click(avatar)
    await waitFor(() => {
      const settingsItem = screen.getByText('Account settings')
      fireEvent.click(settingsItem)
    })
  })

  it('clicks profile section without error', async () => {
    render(<UserMenu user={mockUser} />, { wrapper: AllTheProviders })
    const avatar = screen.getByRole('img')
    fireEvent.click(avatar)
    await waitFor(() => {
      const profileGroup = screen.getByText(mockUser.name).closest('div')
      fireEvent.click(profileGroup!)
    })
  })

  it('clicks change account menu item without error', async () => {
    render(<UserMenu user={mockUser} />, { wrapper: AllTheProviders })
    const avatar = screen.getByRole('img')
    fireEvent.click(avatar)
    await waitFor(() => {
      const changeAccountItem = screen.getByText('Change account')
      fireEvent.click(changeAccountItem)
    })
  })

  it('clicks logout menu item without error', async () => {
    render(<UserMenu user={mockUser} />, { wrapper: AllTheProviders })
    const avatar = screen.getByRole('img')
    fireEvent.click(avatar)
    await waitFor(() => {
      const logoutItem = screen.getByText('Logout')
      fireEvent.click(logoutItem)
    })
  })
})