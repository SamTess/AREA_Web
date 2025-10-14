import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { Footer } from '@/components/ui/layout/Footer'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

describe('Footer', () => {
  it('renders the area logo', () => {
    render(<Footer />, { wrapper: AllTheProviders })
    const logo = screen.getByAltText('area logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/area1.png')
  })

  it('renders footer links', () => {
    render(<Footer />, { wrapper: AllTheProviders })
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('renders links as anchor elements', () => {
    render(<Footer />, { wrapper: AllTheProviders })
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', '/about')
    expect(links[1]).toHaveAttribute('href', '/contact')
  })

  it('allows default on link clicks', () => {
    render(<Footer />, { wrapper: AllTheProviders })
    const aboutLink = screen.getByText('About')
    const clickEvent = fireEvent.click(aboutLink)
    expect(clickEvent).toBe(true)
  })
})