import { useState, useCallback, useRef } from 'react';
import { DragState } from '../types';
import { ServiceData } from '../../../../types';

export function useDragAndDrop(
  services: ServiceData[],
  onUpdateService: (service: ServiceData) => void,
  onEditService: (service: ServiceData) => void,
  screenToCanvas: (screenX: number, screenY: number) => { x: number; y: number },
  linkingState: { isLinking: boolean },
  handleServiceClick: (serviceId: string) => void
) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedServiceId: null,
    offset: { x: 0, y: 0 },
  });

  const serviceClickTimesRef = useRef<Map<string, number>>(new Map());
  const handleMouseDown = useCallback((e: React.MouseEvent, serviceId: string) => {
    if (e.button === 1)
      return;
    e.preventDefault();
    e.stopPropagation();
    const currentTime = Date.now();
    const lastClickTime = serviceClickTimesRef.current.get(serviceId) || 0;
    const timeDiff = currentTime - lastClickTime;
    serviceClickTimesRef.current.set(serviceId, currentTime);
    // detection double click
    if (timeDiff < 300) {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        onEditService(service);
      }

      setDragState({
        isDragging: false,
        draggedServiceId: null,
        offset: { x: 0, y: 0 },
      });
      return;
    }
    if (linkingState.isLinking) {
      setTimeout(() => {
        const lastTime = serviceClickTimesRef.current.get(serviceId) || 0;
        if (currentTime === lastTime) {
          handleServiceClick(serviceId);
        }
      }, 300);
      return;
    }
    const service = services.find(s => s.id === serviceId);
    if (!service)
      return;
    const serviceRect = e.currentTarget.getBoundingClientRect();
    const offset = {
      x: e.clientX - serviceRect.left,
      y: e.clientY - serviceRect.top,
    };

    setDragState({
      isDragging: true,
      draggedServiceId: serviceId,
      offset,
    });
    const handleMove = (moveEvent: MouseEvent) => {
      const canvasPos = screenToCanvas(moveEvent.clientX - offset.x, moveEvent.clientY - offset.y);
      const currentService = services.find(s => s.id === serviceId);
      if (currentService) {
        onUpdateService({
          ...currentService,
          position: { x: canvasPos.x, y: canvasPos.y },
        });
      }
    };
    const handleUp = () => {
      setDragState({
        isDragging: false,
        draggedServiceId: null,
        offset: { x: 0, y: 0 },
      });

      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [services, linkingState.isLinking, onUpdateService, onEditService, handleServiceClick, screenToCanvas]);

  return {
    dragState,
    handleMouseDown,
  };
}
