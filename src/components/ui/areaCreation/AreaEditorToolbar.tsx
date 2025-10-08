import { Button, TextInput, Group, Popover, Textarea, Title, Space } from '@mantine/core';
import { IconDeviceFloppy, IconPlayerPlay, IconFileText, IconTable, IconVectorTriangle } from '@tabler/icons-react';
import { useState } from 'react';
import styles from './AreaEditor.module.css';

interface AreaEditorToolbarProps {
  areaName: string;
  onNameChange: (name: string) => void;
  areaDescription: string;
  onDescriptionChange: (description: string) => void;
  onSave: () => void;
  onRun: () => void;
  layoutMode: 'linear' | 'free';
  onToggleLayoutMode: () => void;
}

export default function AreaEditorToolbar({
  areaName,
  onNameChange,
  areaDescription,
  onDescriptionChange,
  onSave,
  onRun,
  layoutMode,
  onToggleLayoutMode
}: AreaEditorToolbarProps) {
  const [opened, setOpened] = useState(false);

  return (
    <div className={styles.header}>
      <Group style={{ flex: 1, justifyContent: 'space-between', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Space w="15%" />
        <TextInput
          placeholder="Nom de l'area"
          value={areaName}
          onChange={(e) => onNameChange(e.target.value)}
          style={{ width: '300px', marginLeft: '3%' }}
        />
        <Popover opened={opened} onChange={setOpened} position="bottom" withArrow>
            <Popover.Target>
              <Button onClick={() => setOpened((o) => !o)} variant="light">
                <IconFileText size={16} />
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Title order={6}>Description</Title>
              <Textarea
                placeholder="Area description"
                value={areaDescription}
                onChange={(e) => onDescriptionChange(e.target.value)}
                autosize
                minRows={3}
                maxRows={6}
                style={{ width: '300px' }}
              />
            </Popover.Dropdown>
          </Popover>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Group gap="xs">
            <Button
              variant={layoutMode === 'linear' ? 'filled' : 'outline'}
              size="sm"
              onClick={onToggleLayoutMode}
              leftSection={<IconTable size={16} />}
            >
              Linear
            </Button>
            <Button
              variant={layoutMode === 'free' ? 'filled' : 'outline'}
              size="sm"
              onClick={onToggleLayoutMode}
              leftSection={<IconVectorTriangle size={16} />}
            >
              Free
            </Button>
          </Group>
          <Button onClick={onSave}><IconDeviceFloppy /></Button>
          <Button onClick={onRun}><IconPlayerPlay /></Button>
        </div>
      </Group>
    </div>
  );
}