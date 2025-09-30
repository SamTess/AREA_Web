'use client';

import { Container, Paper, Button, Title, Stack, Text } from '@mantine/core';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useListState } from '@mantine/hooks';
import ServiceCard from '../../components/ui/ServiceCard';
import { services } from '../../mocks/areas';

interface ServiceData {
  id: string;
  logo: string;
  serviceName: string;
  event: string;
  state: boolean;
}

const initialData: ServiceData[] = services.map(service => ({
  id: service.id.toString(),
  logo: service.logo,
  serviceName: service.name,
  event: 'rien pour l\'instant',
  state: Math.random() > 0.5,
}));

function SortableServiceCard({ service, position, onRemove }: { service: ServiceData; position?: number; onRemove?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: service.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <ServiceCard
        logo={service.logo}
        serviceName={service.serviceName}
        event={service.event}
        state={service.state}
        index={position ?? Number(service.id)}
        onRemove={onRemove}
      />
    </div>
  );
}

export default function Whiteboard() {
  const [state, handlers] = useListState(initialData);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id)
      return;
    const oldIndex = state.findIndex((i) => i.id === active.id);
    const newIndex = state.findIndex((i) => i.id === over.id);
    handlers.setState(arrayMove(state, oldIndex, newIndex));
  };

  return (
    <Container size="md">
      <Stack gap="md">
        <Title order={2}>Services Board</Title>
        {state.length === 0 ? (
          <Text>No services configured yet.</Text>
        ) : (
          <Paper shadow="xs" p="md">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={state.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                {state.map((service, idx) => (
                  <div key={service.id} style={{ marginBottom: 18 }}>
                    <SortableServiceCard service={service} position={idx + 1} onRemove={() => handlers.remove(idx)} />
                  </div>
                ))}
              </SortableContext>
            </DndContext>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}