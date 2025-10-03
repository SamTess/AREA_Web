'use client';

import { Drawer } from '@mantine/core';
import AreaEditorToolbar from './AreaEditorToolbar';
import AreaEditorBoard from './AreaEditorBoard';
import InfoServiceCard from './InfoServiceCard';
import { useAreaEditor } from './useAreaEditor';
import styles from './AreaEditor.module.css';

interface AreaEditorProps {
  areaId?: number;
}

export default function AreaEditor({ areaId }: AreaEditorProps) {
  const {
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
    moveServiceUp,
    moveServiceDown,
    duplicateService,
  } = useAreaEditor(areaId);

  return (
    <div className={styles.container}>
      <AreaEditorToolbar
        areaName={areaName}
        onNameChange={setAreaName}
        areaDescription={areaDescription}
        onDescriptionChange={setAreaDescription}
        onSave={handleSave}
        onRun={handleRun}
      />
      <AreaEditorBoard
        services={servicesState}
        onDragEnd={handleDragEnd}
        onAddService={addNewServiceBelow}
        onRemoveService={removeService}
        onEditService={editService}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        onMoveUp={moveServiceUp}
        onMoveDown={moveServiceDown}
        onDuplicate={duplicateService}
      />
      <Drawer opened={modalOpened} onClose={() => setModalOpened(false)} title="Action Details" position="right" size="35%">
        {selectedService && <InfoServiceCard service={selectedService} onServiceChange={updateService} />}
      </Drawer>
    </div>
  );
}