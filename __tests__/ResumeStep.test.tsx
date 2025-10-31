import React from 'react';
import { render, screen } from './test-utils';
import { ResumeStep } from '../src/components/ui/area-simple-steps/ResumeStep';
import type { BackendService, Action } from '@/types';

const mockServices: BackendService[] = [
  { id: '1', key: 'github', name: 'GitHub', auth: 'OAUTH2', isActive: true },
  { id: '2', key: 'discord', name: 'Discord', auth: 'APIKEY', isActive: true },
];

const mockActionTriggers: Action[] = [
  { id: '1', serviceId: '1', serviceKey: 'github', serviceName: 'GitHub', key: 'push', name: 'Push', description: 'Trigger on push', inputSchema: { type: 'object', properties: {} }, outputSchema: {}, isEventCapable: true, isExecutable: true, version: 1 },
];

const mockReactionActions: Action[] = [
  { id: '2', serviceId: '2', serviceKey: 'discord', serviceName: 'Discord', key: 'send_message', name: 'Send Message', description: 'Send message', inputSchema: { type: 'object', properties: {} }, outputSchema: {}, isEventCapable: false, isExecutable: true, version: 1 },
];

describe('ResumeStep', () => {
  it('should display AREA name', () => {
    render(
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
    render(
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
    const { container } = render(
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
      (el: Element) => el.textContent === 'Description'
    );
    expect(descriptionElements.length).toBe(0);
  });

  it('should display trigger service name', () => {
    render(
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
    render(
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
    render(
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

    render(
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

    render(
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

    render(
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

    render(
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
    render(
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
