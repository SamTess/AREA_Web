import { useState, useEffect } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { getCardByAreaId, getAreaById, updateArea, createArea } from '../../services/areasService';
import { ServiceState, ServiceData } from '../../types';

export function useAreaEditor(areaId?: number) {
  const isNewArea = areaId === undefined;

  const [servicesState, setServicesState] = useState<ServiceData[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [areaDescription, setAreaDescription] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (areaId !== undefined) {
        const area = await getAreaById(areaId);
        if (area) {
          setAreaName(area.name);
          setAreaDescription(area.description);
        }
        const cards = await getCardByAreaId(areaId);
        setServicesState(cards);
      }
    };
    loadData();
  }, [areaId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setServicesState((services) => {
      const oldIndex = services.findIndex((service) => service.id === active.id);
      const newIndex = services.findIndex((service) => service.id === over.id);
      return arrayMove(services, oldIndex, newIndex);
    });
  };

  const handleSave = async () => {
    if (isNewArea) {
      await createArea({
        name: areaName,
        description: areaDescription,
        lastRun: '',
        services: servicesState.map(s => s.serviceId),
        status: 'not started'
      });
      // navigation vers le home???
    } else {
      await updateArea(areaId!, {
        name: areaName,
        description: areaDescription,
        services: servicesState.map(s => s.serviceId)
      });
    }
  };

  const handleRun = () => {
    // TODO: Implement run logic
    console.log('Run area');
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
    };
    setServicesState(prev => [...prev, newService]);
  };

  const removeService = (id: string) => {
    setServicesState((prev) => prev.filter((s) => s.id !== id));
  };

  const editService = (service: ServiceData) => {
    setSelectedService(service);
    setModalOpened(true);
  };

  const updateService = (updatedService: ServiceData) => {
    setServicesState(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
    if (selectedService && selectedService.id === updatedService.id) {
      setSelectedService(updatedService);
    }
  };

  return {
    servicesState,
    selectedService,
    modalOpened,
    setModalOpened,
    isDragging,
    setIsDragging,
    areaName,
    setAreaName,
    areaDescription,
    setAreaDescription,
    handleDragEnd,
    handleSave,
    handleRun,
    addNewServiceBelow,
    removeService,
    editService,
    updateService,
  };
}