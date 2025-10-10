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
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Support')).toBeInTheDocument()
  })

  it('renders links as anchor elements', () => {
    render(<Footer />, { wrapper: AllTheProviders })
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    links.forEach(link => {
      expect(link).toHaveAttribute('href', '#')
    })
  })

  it('prevents default on link clicks', () => {
    render(<Footer />, { wrapper: AllTheProviders })
    const aboutLink = screen.getByText('About')
    const clickEvent = fireEvent.click(aboutLink)
    expect(clickEvent).toBe(false)
  })
})