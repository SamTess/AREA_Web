import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import ServiceFilter from '../src/components/ui/ServiceFilter'
import { services as mockServices } from '../src/mocks/areas'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

describe('ServiceFilter', () => {
  it('renders services', () => {
    render(<ServiceFilter services={mockServices} value={[]} onChange={() => {}} />, { wrapper: AllTheProviders })
    expect(screen.getByPlaceholderText('Search services')).toBeInTheDocument()
  })

  it('displays service names', () => {
    render(<ServiceFilter services={mockServices} value={[]} onChange={() => {}} />, { wrapper: AllTheProviders })
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('Google')).toBeInTheDocument()
  })

  it('handles empty services list', () => {
    render(<ServiceFilter services={[]} value={[]} onChange={() => {}} />, { wrapper: AllTheProviders })
    expect(screen.getByPlaceholderText('Search services')).toBeInTheDocument()
  })

  it('calls onChange when service is selected', () => {
    const mockOnChange = jest.fn()
    render(<ServiceFilter services={mockServices} value={[]} onChange={mockOnChange} />, { wrapper: AllTheProviders })

    const input = screen.getByPlaceholderText('Search services')
    fireEvent.click(input)

    const githubOption = screen.getByText('GitHub')
    fireEvent.click(githubOption)

    expect(mockOnChange).toHaveBeenCalledWith([1])
  })

  it('displays selected services as pills', () => {
    const mockOnChange = jest.fn()
    render(<ServiceFilter services={mockServices} value={[1]} onChange={mockOnChange} />, { wrapper: AllTheProviders })

    const pills = screen.getAllByText('GitHub')
    expect(pills.length).toBeGreaterThan(0)
  })

  it('filters services based on search input', () => {
    render(<ServiceFilter services={mockServices} value={[]} onChange={() => {}} />, { wrapper: AllTheProviders })

    const input = screen.getByPlaceholderText('Search services')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'Git' } })

    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.queryByText('Google')).not.toBeInTheDocument()
  })

  it('shows "Nothing found..." when no services match search', () => {
    render(<ServiceFilter services={mockServices} value={[]} onChange={() => {}} />, { wrapper: AllTheProviders })

    const input = screen.getByPlaceholderText('Search services')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'nonexistent' } })

    expect(screen.getByText('Nothing found...')).toBeInTheDocument()
  })

  it('removes last service with Backspace when search is empty', () => {
    const mockOnChange = jest.fn()
    render(<ServiceFilter services={mockServices} value={[1, 2]} onChange={mockOnChange} />, { wrapper: AllTheProviders })

    const input = screen.getByPlaceholderText('Search services')
    fireEvent.keyDown(input, { key: 'Backspace' })

    expect(mockOnChange).toHaveBeenCalledWith([1])
  })

  it('does not remove service with Backspace when search has content', () => {
    const mockOnChange = jest.fn()
    render(<ServiceFilter services={mockServices} value={[1]} onChange={mockOnChange} />, { wrapper: AllTheProviders })

    const input = screen.getByPlaceholderText('Search services')
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.keyDown(input, { key: 'Backspace' })

    expect(mockOnChange).not.toHaveBeenCalled()
  })
})