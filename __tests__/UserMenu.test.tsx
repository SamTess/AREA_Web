import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { UserMenu } from '@/components/ui/user/UserMenu'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

const mockUser = {
  name: "Test User",
  email: "testuser@example.com",
  avatarSrc: "https://example.com/avatar.png",
  isAdmin: true,
  profileData: {
    email: "testuser@example.com",
    firstName: "Test",
    lastName: "User",
    language: "English",
  },
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

  it('clicks profile section without error', async () => {
    render(<UserMenu user={mockUser} />, { wrapper: AllTheProviders })
    const avatar = screen.getByRole('img')
    fireEvent.click(avatar)
    await waitFor(() => {
      const profileGroup = screen.getByText(mockUser.name).closest('div')
      fireEvent.click(profileGroup!)
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