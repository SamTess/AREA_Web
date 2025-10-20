'use client';

import { Drawer} from '@mantine/core';
import AreaEditorToolbar from './AreaEditorToolbar';
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
    areaName,
    setAreaName,
    areaDescription,
    setAreaDescription,
    handleSave,
    handleRun,
    addNewServiceBelow,
    removeService,
    editService,
    updateService,
    connections,
    createConnection,
    removeConnection,
    duplicateService,
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
        />
      </div>

      <div className={styles.boardContainer}>
        <FreeLayoutBoard
          services={servicesState}
          connections={connections}
          onAddService={() => addNewServiceBelow()}
          onRemoveService={removeService}
          onEditService={editService}
          onUpdateService={updateService}
          onCreateConnection={createConnection}
          onRemoveConnection={removeConnection}
          onDuplicateService={duplicateService}
        />
      </div>

      <Drawer opened={modalOpened} onClose={() => setModalOpened(false)} title="Action Details" position="right" size="35%">
        {selectedService && <InfoServiceCard service={selectedService} onServiceChange={updateService} />}
      </Drawer>
    </div>
  );
}