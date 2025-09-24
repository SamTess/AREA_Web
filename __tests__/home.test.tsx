import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import Home from '@/app/page'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

describe('Home', () => {
  it('renders without crashing', () => {
    render(<Home />, { wrapper: AllTheProviders })
    // Add your assertions here - checking for the title text instead of main role
    expect(screen.getByText('Base page')).toBeInTheDocument()
  })

  it('renders the area logo', () => {
    render(<Home />, { wrapper: AllTheProviders })
    expect(screen.getByAltText('area logo')).toBeInTheDocument()
  })

  it('renders the base button', () => {
    render(<Home />, { wrapper: AllTheProviders })
    expect(screen.getByText('Base button')).toBeInTheDocument()
  })
})