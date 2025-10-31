import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { ResumeStep } from '../src/components/ui/area-simple-steps/ResumeStep';
import type { BackendService, Action } from '@/types';

const renderWithProvider = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

const mockServices: BackendService[] = [
  { key: 'github', name: 'GitHub', description: 'GitHub service' },
  { key: 'discord', name: 'Discord', description: 'Discord service' },
];

const mockActionTriggers: Action[] = [
  { id: '1', name: 'Push', description: 'Trigger on push', fields: [] },
];

const mockReactionActions: Action[] = [
  { id: '2', name: 'Send Message', description: 'Send message', fields: [] },
];

describe('ResumeStep', () => {
  it('should display AREA name', () => {
    renderWithProvider(
      <ResumeStep
        areaName="Test AREA"
        areaDescription=""
        selectedTriggerService="github"
        selectedTrigger="1"
        triggerParams={{}}
        reactions={[]}
        services={mockServices}
        actionTriggers={mockActionTriggers}
        reactionActions={mockReactionActions}
      />
    );

    expect(screen.getByText('Test AREA')).toBeInTheDocument();
  });

  it('should display description when provided', () => {
    renderWithProvider(
      <ResumeStep
        areaName="Test AREA"
        areaDescription="Test Description"
        selectedTriggerService="github"
        selectedTrigger="1"
        triggerParams={{}}
        reactions={[]}
        services={mockServices}
        actionTriggers={mockActionTriggers}
        reactionActions={mockReactionActions}
      />
    );

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should not display description when empty', () => {
    const { container } = renderWithProvider(
      <ResumeStep
        areaName="Test AREA"
        areaDescription=""
        selectedTriggerService="github"
        selectedTrigger="1"
        triggerParams={{}}
        reactions={[]}
        services={mockServices}
        actionTriggers={mockActionTriggers}
        reactionActions={mockReactionActions}
      />
    );

    const descriptionElements = Array.from(container.querySelectorAll('*')).filter(
      el => el.textContent === 'Description'
    );
    expect(descriptionElements.length).toBe(0);
  });

  it('should display trigger service name', () => {
    renderWithProvider(
      <ResumeStep
        areaName="Test AREA"
        areaDescription=""
        selectedTriggerService="github"
        selectedTrigger="1"
        triggerParams={{}}
        reactions={[]}
        services={mockServices}
        actionTriggers={mockActionTriggers}
        reactionActions={mockReactionActions}
      />
    );

    expect(screen.getByText(/Service: GitHub/)).toBeInTheDocument();
  });

  it('should display trigger event name', () => {
    renderWithProvider(
      <ResumeStep
        areaName="Test AREA"
        areaDescription=""
        selectedTriggerService="github"
        selectedTrigger="1"
        triggerParams={{}}
        reactions={[]}
        services={mockServices}
        actionTriggers={mockActionTriggers}
        reactionActions={mockReactionActions}
      />
    );

    expect(screen.getByText(/Event: Push/)).toBeInTheDocument();
  });

  it('should display number of configured trigger parameters', () => {
    renderWithProvider(
      <ResumeStep
        areaName="Test AREA"
        areaDescription=""
        selectedTriggerService="github"
        selectedTrigger="1"
        triggerParams={{ repo: 'test', branch: 'main' }}
        reactions={[]}
        services={mockServices}
        actionTriggers={mockActionTriggers}
        reactionActions={mockReactionActions}
      />
    );

    expect(screen.getByText('2 parameter(s) configured')).toBeInTheDocument();
  });

  it('should display reactions count', () => {
    const reactions = [
      { id: '1', service: 'discord', actionId: '2', params: {} },
    ];

    renderWithProvider(
      <ResumeStep
        areaName="Test AREA"
        areaDescription=""
        selectedTriggerService="github"
        selectedTrigger="1"
        triggerParams={{}}
        reactions={reactions}
        services={mockServices}
        actionTriggers={mockActionTriggers}
        reactionActions={mockReactionActions}
      />
    );

    expect(screen.getByText('Reactions (1)')).toBeInTheDocument();
  });

  it('should display reaction details', () => {
    const reactions = [
      { id: '1', service: 'discord', actionId: '2', params: {} },
    ];

    renderWithProvider(
      <ResumeStep
        areaName="Test AREA"
        areaDescription=""
        selectedTriggerService="github"
        selectedTrigger="1"
        triggerParams={{}}
        reactions={reactions}
        services={mockServices}
        actionTriggers={mockActionTriggers}
        reactionActions={mockReactionActions}
      />
    );

    expect(screen.getByText(/1\. Service: Discord - Action: Send Message/)).toBeInTheDocument();
  });

  it('should display multiple reactions', () => {
    const reactions = [
      { id: '1', service: 'discord', actionId: '2', params: {} },
      { id: '2', service: 'github', actionId: '2', params: {} },
    ];

    renderWithProvider(
      <ResumeStep
        areaName="Test AREA"
        areaDescription=""
        selectedTriggerService="github"
        selectedTrigger="1"
        triggerParams={{}}
        reactions={reactions}
        services={mockServices}
        actionTriggers={mockActionTriggers}
        reactionActions={mockReactionActions}
      />
    );

    expect(screen.getByText('Reactions (2)')).toBeInTheDocument();
  });

  it('should display reaction parameters count', () => {
    const reactions = [
      { id: '1', service: 'discord', actionId: '2', params: { channel: 'general', message: 'test' } },
    ];

    renderWithProvider(
      <ResumeStep
        areaName="Test AREA"
        areaDescription=""
        selectedTriggerService="github"
        selectedTrigger="1"
        triggerParams={{}}
        reactions={reactions}
        services={mockServices}
        actionTriggers={mockActionTriggers}
        reactionActions={mockReactionActions}
      />
    );

    expect(screen.getByText('2 parameter(s) configured')).toBeInTheDocument();
  });

  it('should display summary heading', () => {
    renderWithProvider(
      <ResumeStep
        areaName="Test AREA"
        areaDescription=""
        selectedTriggerService="github"
        selectedTrigger="1"
        triggerParams={{}}
        reactions={[]}
        services={mockServices}
        actionTriggers={mockActionTriggers}
        reactionActions={mockReactionActions}
      />
    );

    expect(screen.getByText('Summary')).toBeInTheDocument();
  });
});
