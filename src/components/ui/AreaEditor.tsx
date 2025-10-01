'use client';

import { Container, Paper, Button, Title, Stack, Text, Modal, Drawer } from '@mantine/core';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
} from '@dnd-kit/core';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useState, useEffect } from 'react';
import ServiceCard from './ServiceCard';
import InfoServiceCard from './InfoServiceCard';
import { ServiceState } from '../../types';
import { getCardByAreaId } from '../../services/areasService';

interface ServiceData {
  id: string;
  logo: string;
  serviceName: string;
  event: string;
  cardName: string;
  state: ServiceState;
  x: number;
  y: number;
  actionId: number;
  serviceId: number;
  areaId: number;
}

interface AreaEditorProps {
  areaId?: number;
}

function DraggableServiceCard({ service, onRemove, onClick }: { service: ServiceData; onRemove?: () => void; onClick?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: service.id,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    position: 'absolute',
    left: service.x,
    top: service.y,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onDoubleClick={onClick}
    >
      <ServiceCard
        logo={service.logo}
        serviceName={service.serviceName}
        cardName={service.cardName}
        event={service.event}
        state={service.state}
        onRemove={onRemove}
      />
    </div>
  );
}

export default function AreaEditor({ areaId }: AreaEditorProps) {
  const isNewArea = areaId === undefined;

  const [servicesState, setServicesState] = useState<ServiceData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  useEffect(() => {
    const loadCards = async () => {
      const cards = await getCardByAreaId(areaId);
      setServicesState(cards);
    };
    loadCards();
  }, [areaId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    setActiveId(null);
    if (!delta.x && !delta.y) return;
    setServicesState((prev) =>
      prev.map((service) =>
        service.id === active.id
          ? { ...service, x: service.x + delta.x, y: service.y + delta.y }
          : service
      )
    );
  };

  const activeService = activeId ? servicesState.find((s) => s.id === activeId) : null;

  return (
    <Container size="xl" style={{ height: '80vh', overflow: 'hidden' }}>
      <Stack gap="md" style={{ height: '100%' }}>
        <Title order={2}>{isNewArea ? 'Create New Area' : 'Edit Area'} - Services Whiteboard</Title>
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={2}
          limitToBounds={false}
          centerOnInit
          disabled={!!activeId}
        >
          <TransformComponent>
            <div style={{ width: '2000px', height: '2000px', position: 'relative', background: '#f5f5f5' }}>
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                {servicesState.map((service) => (
                  <DraggableServiceCard
                    key={service.id}
                    service={service}
                    onRemove={() => setServicesState((prev) => prev.filter((s) => s.id !== service.id))}
                    onClick={() => {
                      setSelectedService(service);
                      setModalOpened(true);
                    }}
                  />
                ))}
                <DragOverlay>
                  {activeService ? (
                    <ServiceCard
                      logo={activeService.logo}
                      serviceName={activeService.serviceName}
                      cardName={activeService.cardName}
                      event={activeService.event}
                      state={activeService.state}
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          </TransformComponent>
        </TransformWrapper>
      </Stack>
      <Drawer opened={modalOpened} onClose={() => setModalOpened(false)} title="Action Details" position="right" size="35%">
        {selectedService && <InfoServiceCard service={selectedService} onServiceChange={(newService) => {
          setSelectedService(prev => prev ? {...prev, ...newService} : null);
          setServicesState(prev => prev.map(s => s.id === selectedService?.id ? {...s, ...newService} : s));
        }} />}
      </Drawer>
    </Container>
  );
}