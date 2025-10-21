import { Button, TextInput, Group, Popover, Textarea, Title, Space, Badge } from '@mantine/core';
import { IconDeviceFloppy, IconPlayerPlay, IconFileText, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import styles from './AreaEditor.module.css';

interface AreaEditorToolbarProps {
  areaName: string;
  onNameChange: (name: string) => void;
  areaDescription: string;
  onDescriptionChange: (description: string) => void;
  onSaveDraft: () => void;
  onCommit: () => void;
  onRun: () => void;
  isDraft?: boolean;
}

export default function AreaEditorToolbar({
  areaName,
  onNameChange,
  areaDescription,
  onDescriptionChange,
  onSaveDraft,
  onCommit,
  onRun,
  isDraft = false
}: AreaEditorToolbarProps) {
  const [opened, setOpened] = useState(false);

  return (
    <div className={styles.header}>
      <Group style={{ flex: 1, justifyContent: 'space-between', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
        <Space w="15%" />
        <TextInput
          placeholder="Nom de l'area"
          value={areaName}
          onChange={(e) => onNameChange(e.target.value)}
          style={{ width: '300px', marginLeft: '3%' }}
        />
        {isDraft && (
          <Badge color="blue" variant="light" style={{ flexShrink: 0 }}>Draft</Badge>
        )}
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
          <Button 
            onClick={onSaveDraft} 
            variant="light"
            leftSection={<IconDeviceFloppy size={16} />}
          >
            {isDraft ? 'Update Draft' : 'Save Draft'}
          </Button>
          <Button 
            onClick={onCommit}
            color="green"
            leftSection={<IconCheck size={16} />}
          >
            Commit
          </Button>
          <Button onClick={onRun}>
            <IconPlayerPlay />
          </Button>
        </div>
      </Group>
    </div>
  );
}