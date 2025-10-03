import { Button, TextInput, Group } from '@mantine/core';
import { IconDeviceFloppy, IconPlayerPlay } from '@tabler/icons-react';
import styles from './AreaEditor.module.css';

interface AreaEditorToolbarProps {
  areaName: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onRun: () => void;
}

export default function AreaEditorToolbar({
  areaName,
  onNameChange,
  onSave,
  onRun
}: AreaEditorToolbarProps) {
  return (
    <div className={styles.header}>
      <Group style={{ flex: 1, justifyContent: 'space-between', width: '100%' }}>
        <TextInput
          placeholder="Nom de l'area"
          value={areaName}
          onChange={(e) => onNameChange(e.target.value)}
          style={{ width: '300px', marginLeft: '3%' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button onClick={onSave}><IconDeviceFloppy /></Button>
          <Button onClick={onRun}><IconPlayerPlay /></Button>
        </div>
      </Group>
    </div>
  );
}