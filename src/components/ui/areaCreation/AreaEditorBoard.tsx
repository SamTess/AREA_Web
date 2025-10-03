import { Button } from '@mantine/core';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import ServiceCardItem from './ServiceCardItem';
import { ServiceData } from '../../../types';

interface AreaEditorBoardProps {
  services: ServiceData[];
  onDragEnd: (event: DragEndEvent) => void;
  onAddService: () => void;
  onRemoveService: (id: string) => void;
  onEditService: (service: ServiceData) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onDuplicate?: (id: string) => void;

}

export default function AreaEditorBoard({
  services,
  onDragEnd,
  onAddService,
  onRemoveService,
  onEditService,
  isDragging,
  setIsDragging,
  onMoveUp,
  onMoveDown,
  onDuplicate

}: AreaEditorBoardProps) {
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

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEndInternal = (event: DragEndEvent) => {
    setTimeout(() => {
      setIsDragging(false);
    }, 50);
    onDragEnd(event);
  };

  return (
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
          paddingTop: '100px'
        }}>
          <div style={{ width: '600px', maxWidth: '100%', position: 'relative' }}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEndInternal}
            >
              <SortableContext
                items={services.map(service => service.id)}
                strategy={verticalListSortingStrategy}
              >
                {services.map((service, index) => (
                  <ServiceCardItem
                    key={service.id}
                    service={service}
                    onRemove={() => onRemoveService(service.id)}
                    onClick={() => onEditService(service)}
                    onAdd={onAddService}
                    isLast={index === services.length - 1}
                    isFirst={index === 0}
                    isDragging={isDragging}
                    onUp={onMoveUp ? () => onMoveUp(service.id) : undefined}
                    onDown={onMoveDown ? () => onMoveDown(service.id) : undefined}
                    onDuplicate={onDuplicate ? () => onDuplicate(service.id) : undefined}
                  />
                ))}
              </SortableContext>
            </DndContext>
            {services.length === 0 && (
              <Button
                onClick={onAddService}
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
  );
}