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
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('Privacy')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText('Careers')).toBeInTheDocument()
  })

  it('renders links as anchor elements', () => {
    render(<Footer />, { wrapper: AllTheProviders })
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(4)
    links.forEach(link => {
      expect(link).toHaveAttribute('href', '#')
    })
  })

  it('prevents default on link clicks', () => {
    render(<Footer />, { wrapper: AllTheProviders })
    const contactLink = screen.getByText('Contact')
    const clickEvent = fireEvent.click(contactLink)
    expect(clickEvent).toBe(false)
  })
})