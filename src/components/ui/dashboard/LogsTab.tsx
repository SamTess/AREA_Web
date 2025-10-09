'use client';

import { useState, useEffect } from 'react';
import { Grid, TextInput, Combobox, useCombobox, Button } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';
import { LogsTable } from './LogsTable';
import { getLogs } from '../../../services/adminService';

interface Log {
  id: number;
  timestamp: string;
  level: string;
  message: string;
  source: string;
}

export function LogsTab() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [searchLogs, setSearchLogs] = useState('');
  const [selectedLogLevel, setSelectedLogLevel] = useState<string | null>(null);

  const comboboxLog = useCombobox({
    onDropdownClose: () => comboboxLog.resetSelectedOption(),
  });

  useEffect(() => {
    const fetchData = async () => {
      setLogs(await getLogs());
    };
    fetchData();
  }, []);

  const comboboxValueLogLevel = ['', 'INFO', 'ERROR', 'WARN', 'DEBUG'];

  const reloadLogs = async () => {
    setLogs(await getLogs());
  };

  const filteredLogs = logs.filter(log =>
    (log.message.toLowerCase().includes(searchLogs.toLowerCase()) ||
     log.source.toLowerCase().includes(searchLogs.toLowerCase())) &&
    (selectedLogLevel ? log.level === selectedLogLevel : true)
  );

  return (
    <Grid>
      <Grid.Col span={12}>
        <Grid>
          <Grid.Col span={{ base: 6, md: 8 }}>
            <TextInput
              placeholder="Search logs by message or source..."
              value={searchLogs}
              onChange={(event) => setSearchLogs(event.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 3, md: 2 }}>
            <Combobox
              store={comboboxLog}
              onOptionSubmit={(value) => {
                setSelectedLogLevel(value);
                comboboxLog.closeDropdown();
              }}
            >
              <Combobox.Target>
                <TextInput
                  placeholder="Select level"
                  value={selectedLogLevel || ''}
                  readOnly
                  rightSection={<Combobox.Chevron />}
                  onClick={() => comboboxLog.toggleDropdown()}
                />
              </Combobox.Target>

              <Combobox.Dropdown>
                <Combobox.Options>
                  {comboboxValueLogLevel.map(level => (
                    <Combobox.Option key={level} value={level}>
                      {level === '' ? 'All' : level}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>
          </Grid.Col>
          <Grid.Col span={{ base: 3, md: 2 }}>
            <Button
              onClick={() => {
                reloadLogs();
              }}
            >
              <IconReload />
            </Button>
          </Grid.Col>

          <Grid.Col span={12}>
            <LogsTable logs={filteredLogs} />
          </Grid.Col>
        </Grid>
      </Grid.Col>
    </Grid>
  );
}