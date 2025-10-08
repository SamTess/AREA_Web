'use client';

import { Drawer} from '@mantine/core';
import AreaEditorToolbar from './AreaEditorToolbar';
import AreaEditorBoard from './AreaEditorBoard';
import FreeLayoutBoard from './FreeLayoutBoard';
import InfoServiceCard from './InfoServiceCard';
import { useAreaEditor } from './useAreaEditor';
import styles from './AreaEditor.module.css';

interface AreaEditorProps {
  areaId?: string;
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
    connections,
    createConnection,
    removeConnection,
    updateConnection,
    layoutMode,
    toggleLayoutMode,
  } = useAreaEditor(areaId);



  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <AreaEditorToolbar
          areaName={areaName}
          onNameChange={setAreaName}
          areaDescription={areaDescription}
          onDescriptionChange={setAreaDescription}
          onSave={handleSave}
          onRun={handleRun}
          layoutMode={layoutMode}
          onToggleLayoutMode={toggleLayoutMode}
        />
      </div>

      <div className={styles.boardContainer}>
        {layoutMode === 'linear' ? (
          <AreaEditorBoard
            services={servicesState}
            connections={connections}
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
        ) : (
          <FreeLayoutBoard
            services={servicesState}
            connections={connections}
            onAddService={() => addNewServiceBelow()}
            onRemoveService={removeService}
            onEditService={editService}
            onUpdateService={updateService}
            onCreateConnection={createConnection}
            onRemoveConnection={removeConnection}
            onUpdateConnection={updateConnection}
          />
        )}
      </div>

      <Drawer opened={modalOpened} onClose={() => setModalOpened(false)} title="Action Details" position="right" size="35%">
        {selectedService && <InfoServiceCard service={selectedService} onServiceChange={updateService} />}
      </Drawer>
    </div>
  );
}