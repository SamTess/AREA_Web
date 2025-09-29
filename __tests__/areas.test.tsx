import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import React from 'react'
import AreaListPage from '@/app/areas/page'
import { services as mockServices, data as mockAreas } from '../src/mocks/areas'

jest.mock('../src/services/areasService', () => ({
  getAreas: jest.fn(() => mockAreas),
  getServices: jest.fn(() => mockServices),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

jest.mock('@tabler/icons-react', () => ({
  IconPlus: () => 'IconPlus',
}))

jest.mock('../src/components/ui/AreaListCard', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'area-list-card' }, 'AreaListCard'),
}))

jest.mock('../src/components/ui/ServiceFilter', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'service-filter' }, 'ServiceFilter'),
}))

jest.mock('@mantine/core', () => ({
  MantineProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
  Title: ({ children }: { children: React.ReactNode }) => React.createElement('h1', {}, children),
  TextInput: () => React.createElement('input', { 'data-testid': 'text-input' }),
  Select: () => React.createElement('select', { 'data-testid': 'select' }),
  Button: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => React.createElement('button', { onClick }, children),
  Group: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
  Container: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
  Stack: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
  Divider: () => React.createElement('hr'),
  Pagination: () => React.createElement('div', { 'data-testid': 'pagination' }),
  Text: ({ children }: { children: React.ReactNode }) => React.createElement('p', {}, children),
}))

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

describe('AreaListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', async () => {
    await act(async () => {
      render(<AreaListPage />, { wrapper: AllTheProviders })
    })
    expect(screen.getByText('Areas')).toBeInTheDocument()
  })

  it('loads and displays areas', async () => {
    await act(async () => {
      render(<AreaListPage />, { wrapper: AllTheProviders })
    })
    expect(screen.getByTestId('area-list-card')).toBeInTheDocument()
  })

  it('renders the add area button', async () => {
    await act(async () => {
      render(<AreaListPage />, { wrapper: AllTheProviders })
    })
    expect(screen.getByText('Add Area')).toBeInTheDocument()
  })

  it('renders the clear filters button', async () => {
    await act(async () => {
      render(<AreaListPage />, { wrapper: AllTheProviders })
    })
    expect(screen.getByText('Clear Filters')).toBeInTheDocument()
  })

  it('renders the search input', async () => {
    await act(async () => {
      render(<AreaListPage />, { wrapper: AllTheProviders })
    })
    expect(screen.getByTestId('text-input')).toBeInTheDocument()
  })

  it('renders the status select', async () => {
    await act(async () => {
      render(<AreaListPage />, { wrapper: AllTheProviders })
    })
    expect(screen.getByTestId('select')).toBeInTheDocument()
  })

  it('renders the service filter', async () => {
    await act(async () => {
      render(<AreaListPage />, { wrapper: AllTheProviders })
    })
    expect(screen.getByTestId('service-filter')).toBeInTheDocument()
  })

  it('renders pagination', async () => {
    await act(async () => {
      render(<AreaListPage />, { wrapper: AllTheProviders })
    })
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
  })
})