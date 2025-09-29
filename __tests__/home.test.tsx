import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import Home from '@/app/page'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

describe('Home', () => {
  it('renders without crashing', () => {
    render(<Home />, { wrapper: AllTheProviders })
    expect(screen.getByText('Welcome to AREA')).toBeInTheDocument()
  })

  it('renders the area logo', () => {
    render(<Home />, { wrapper: AllTheProviders })
    expect(screen.getAllByAltText('logo')).toHaveLength(9)
  })

  it('renders the base button', () => {
    render(<Home />, { wrapper: AllTheProviders })
    expect(screen.getByText('Get Started')).toBeInTheDocument()
  })

  it('clicks the Get Started button', () => {
    render(<Home />, { wrapper: AllTheProviders })
    const button = screen.getByText('Get Started')
    fireEvent.click(button)
  })
})