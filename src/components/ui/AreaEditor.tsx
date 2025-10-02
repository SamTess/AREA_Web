'use client';

import {  Button, Drawer, Center } from '@mantine/core';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical, IconPlus } from '@tabler/icons-react';
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
  actionId: number;
  serviceId: number;
  areaId: number;
}

interface AreaEditorProps {
  areaId?: number;
}

function ServiceCardItem({ service, onRemove, onClick, onAdd, isLast }: {
  service: ServiceData;
  onRemove?: () => void;
  onClick?: () => void;
  onAdd?: () => void;
  isLast: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: service.id,
    animateLayoutChanges: () => false
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 200ms ease-out',
    marginBottom: 16,
    opacity: isDragging ? 0.6 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 100 : 1,
    touchAction: 'none',
    willChange: isDragging ? 'transform' : 'auto'
  };

  return (
    <div style={{ width: 'fit-content', margin: '0 auto' }}>
      <div ref={setNodeRef} style={style} onDoubleClick={onClick}>
        <div
          style={{
            position: 'absolute',
            left: '-28px',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'grab',
            padding: '8px',
            touchAction: 'none',
            background: isDragging ? '#f0f0f0' : 'transparent',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          {...attributes}
          {...listeners}
        >
          <IconGripVertical size={18} color={isDragging ? "#555" : "#aaa"} />
        </div>
        <ServiceCard
          logo={service.logo}
          serviceName={service.serviceName}
          cardName={service.cardName}
          event={service.event}
          state={service.state}
          onRemove={onRemove}
        />
      </div>
      { isLast && (
          <Center>
              <Button variant="light" size="xs" onClick={onAdd}> <IconPlus size={14} /> </Button>
          </Center>
      )}
    </div>
  );
}

export default function AreaEditor({ areaId }: AreaEditorProps) {
  const isNewArea = areaId === undefined;

  const [servicesState, setServicesState] = useState<ServiceData[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  useEffect(() => {
    const loadCards = async () => {
      if (areaId !== undefined) {
        const cards = await getCardByAreaId(areaId);
        setServicesState(cards);
      }
    };
    loadCards();
  }, [areaId]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setTimeout(() => {
      setIsDragging(false);
    }, 50);
    if (!over || active.id === over.id)
      return;

    setServicesState((services) => {
      const oldIndex = services.findIndex((service) => service.id === active.id);
      const newIndex = services.findIndex((service) => service.id === over.id);
      return arrayMove(services, oldIndex, newIndex);
    });
  };

  const addNewServiceBelow = () => {
    const newId = `new-${Date.now()}`;
    const newService: ServiceData = {
      id: newId,
      logo: '',
      serviceName: '',
      event: '',
      cardName: '',
      state: ServiceState.Configuration,
      actionId: 0,
      serviceId: 0,
      areaId: areaId || 0,
    };
    setServicesState(prev => [...prev, newService]);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      background: '#f5f5f5',
      backgroundImage: `
        linear-gradient(rgba(200, 200, 200, 0.15) 1px, transparent 1px),
        linear-gradient(90deg, rgba(200, 200, 200, 0.15) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      backgroundPosition: 'center center',
      backgroundAttachment: 'fixed'
    }}>
      <TransformWrapper
        initialScale={1}
        minScale={0.2}
        maxScale={2}
        limitToBounds={false}
        centerOnInit
        disabled={isDragging}
        smooth={true}
        velocityAnimation={{
          disabled: true
        }}
        zoomAnimation={{
          disabled: false,
          animationTime: 200,
          animationType: "easeOutCubic"
        }}
        panning={{
          velocityDisabled: true
        }}
      >
        <TransformComponent
          wrapperStyle={{
            width: '100%',
            height: '100%'
          }}
          contentStyle={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{
            width: '16000px',
            height: '15000px',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '40px',
            paddingTop: '200px'
          }}>
            <div style={{ width: '600px', maxWidth: '100%', position: 'relative' }}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={servicesState.map(service => service.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {servicesState.map((service, index) => (
                    <ServiceCardItem
                      key={service.id}
                      service={service}
                      onRemove={() => setServicesState((prev) => prev.filter((s) => s.id !== service.id))}
                      onClick={() => {
                        setSelectedService(service);
                        setModalOpened(true);
                      }}
                      onAdd={addNewServiceBelow}
                      isLast={index === servicesState.length - 1}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              {servicesState.length === 0 && (
                <Button
                  onClick={addNewServiceBelow}
                  variant="outline"
                  style={{ width: '100%', marginTop: 20 }}
                >
                  Add your first service
                </Button>
              )}
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>
      <Drawer opened={modalOpened} onClose={() => setModalOpened(false)} title="Action Details" position="right" size="35%">
        {selectedService && <InfoServiceCard service={selectedService} onServiceChange={(newService) => {
          setSelectedService(prev => prev ? {...prev, ...newService} : null);
          setServicesState(prev => prev.map(s => s.id === selectedService?.id ? {...s, ...newService} : s));
        }} />}
      </Drawer>
    </div>
  );
}