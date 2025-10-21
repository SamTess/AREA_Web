'use client';

import { Drawer } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import AreaEditorToolbar from './AreaEditorToolbar';
import FreeLayoutBoard from './FreeLayoutBoard';
import InfoServiceCard from './InfoServiceCard';
import { useAreaEditor } from './useAreaEditor';
import styles from './AreaEditor.module.css';

interface AreaEditorProps {
  areaId?: string;
  draftId?: string;
}

export default function AreaEditor({ areaId, draftId }: AreaEditorProps) {
  const {
    servicesState,
    selectedService,
    modalOpened,
    setModalOpened,
    areaName,
    setAreaName,
    areaDescription,
    setAreaDescription,
    currentDraftId,
    handleSaveDraft,
    handleCommit,
    handleRun,
    addNewServiceBelow,
    removeService,
    editService,
    updateService,
    connections,
    createConnection,
    removeConnection,
    duplicateService,
  } = useAreaEditor(areaId, draftId);
  const isSmall = useMediaQuery('(max-width: 768px)');
  const isMedium = useMediaQuery('(max-width: 992px)');
  const drawerSize = isSmall ? '80%' : isMedium ? '50%' : '35%';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <AreaEditorToolbar
          areaName={areaName}
          onNameChange={setAreaName}
          areaDescription={areaDescription}
          onDescriptionChange={setAreaDescription}
          onSaveDraft={handleSaveDraft}
          onCommit={handleCommit}
          onRun={handleRun}
          isDraft={!!currentDraftId}
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

      <Drawer
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Action Details"
        position="right"
        size={drawerSize}
      >
        {selectedService && <InfoServiceCard service={selectedService} onServiceChange={updateService} />}
      </Drawer>
    </div>
  );
}