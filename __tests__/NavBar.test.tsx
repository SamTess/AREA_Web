import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { NavbarMinimal } from '@/components/ui/NavBar'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

describe('NavbarMinimal', () => {
  it('renders the logo', () => {
    render(<NavbarMinimal />, { wrapper: AllTheProviders })
    const logo = screen.getByAltText('Logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/A1.png')
  })

  it('renders navigation buttons', () => {
    render(<NavbarMinimal />, { wrapper: AllTheProviders })
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(4)
  })

  it('renders login button when not connected', () => {
    render(<NavbarMinimal />, { wrapper: AllTheProviders })
    const buttons = screen.getAllByRole('button')
    expect(buttons[3]).toBeInTheDocument()
  })

  it('clicks navigation buttons without error', () => {
    render(<NavbarMinimal />, { wrapper: AllTheProviders })
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
  })
})