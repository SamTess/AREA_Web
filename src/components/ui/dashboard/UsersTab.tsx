'use client';

import { useState, useEffect } from 'react';
import { Grid, Card, Title, TextInput, Combobox, useCombobox, Space } from '@mantine/core';
import { LineChart, BarChart } from '@mantine/charts';
import { StatsGrid } from './StatsGrid';
import { UsersTable } from './UsersTable';
import { getLineData, getBarData, getCardUserData, getUsers } from '../../../services/adminService';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function UsersTab() {
  const [lineData, setLineData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [cardUserData, setCardUserData] = useState([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchUsers, setSearchUsers] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const comboboxValueUser = ['', 'User', 'Admin'];

  useEffect(() => {
    const fetchData = async () => {
      setLineData(await getLineData());
      setBarData(await getBarData());
      setCardUserData(await getCardUserData());
      setUsers(await getUsers());
    };
    fetchData();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchUsers.toLowerCase()) &&
    (selectedRole ? user.role === selectedRole : true)
  );

  return (
    <>
      <StatsGrid data={cardUserData} />
      <Space h="md" />
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder shadow="sm" p="md" radius="md">
            <Title order={3} mb="xs">Users Connected per Day</Title>
            <LineChart
              h={300}
              data={lineData}
              dataKey="date"
              series={[{ name: 'users', color: 'blue' }]}
              curveType="linear"
              gridAxis="xy"
            />
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder shadow="sm" p="md" radius="md">
            <Title order={3} mb="xs">New users per Month</Title>
            <BarChart
              h={300}
              data={barData}
              dataKey="month"
              series={[{ name: 'users', color: 'indigo' }]}
              gridAxis="y"
            />
          </Card>
        </Grid.Col>

        <Grid.Col span={12}>
          <Grid>
            <Grid.Col span={{ base: 8, md: 10 }}>
              <TextInput
                placeholder="Search users by name..."
                value={searchUsers}
                onChange={(event) => setSearchUsers(event.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 4, md: 2 }}>
              <Combobox
                store={combobox}
                onOptionSubmit={(value) => {
                  setSelectedRole(value);
                  combobox.closeDropdown();
                }}
              >
                <Combobox.Target>
                  <TextInput
                    placeholder="Select role"
                    value={selectedRole || ''}
                    readOnly
                    rightSection={<Combobox.Chevron />}
                    onClick={() => combobox.toggleDropdown()}
                  />
                </Combobox.Target>

                <Combobox.Dropdown>
                  <Combobox.Options>
                    {comboboxValueUser.map(role => (
                      <Combobox.Option key={role} value={role}>
                        {role === '' ? 'All' : role}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
            </Grid.Col>
          </Grid>
        </Grid.Col>

        <Grid.Col span={12}>
          <UsersTable users={filteredUsers} />
        </Grid.Col>
      </Grid>
    </>
  );
}