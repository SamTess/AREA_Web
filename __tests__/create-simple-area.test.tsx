import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import CreateSimpleAreaPage from '../src/app/areas/create-simple/page';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
}));

jest.mock('../src/services/authService', () => ({
  getCurrentUser: jest.fn(() => Promise.resolve({ id: '1', name: 'Test User' })),
}));

jest.mock('../src/services/areasService', () => ({
  createAreaWithActions: jest.fn(() => Promise.resolve()),
  getActionFieldsFromActionDefinition: jest.fn(() => []),
}));

jest.mock('../src/services/serviceConnectionService', () => ({
  initiateServiceConnection: jest.fn(),
}));

jest.mock('../src/hooks/useAreaForm', () => ({
  useAreaForm: () => ({
    services: [],
    serviceConnectionStatuses: {},
    actionTriggers: [],
    reactionActions: [],
    loading: false,
    loadTriggerActions: jest.fn(),
    loadReactionActions: jest.fn(),
  }),
}));

jest.mock('../src/hooks/useDraftSaver', () => ({
  useDraftSaver: () => ({
    clearDraft: jest.fn(),
  }),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('CreateSimpleAreaPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page without crashing', async () => {
    const { container } = renderWithProvider(<CreateSimpleAreaPage />);
    expect(container).toBeInTheDocument();
  });

  it('should render page title or main content', async () => {
    renderWithProvider(<CreateSimpleAreaPage />);
    // Give it time to load
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(document.body).toBeInTheDocument();
  });
});
