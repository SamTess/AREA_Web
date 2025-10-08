'use client';

import { useState, useEffect } from 'react';
import { Tabs, Grid, Card, Text, Container, Title, Divider, Space } from '@mantine/core';
import { IconPhoto, IconMessageCircle, IconSettings, IconFileText, IconUser, IconMap, IconCheck, IconX, IconClock } from '@tabler/icons-react';
import { LineChart, PieChart, BarChart } from '@mantine/charts';
import { StatsGrid } from '../../components/ui/dashboard/StatsGrid';
import { AreaStatsCards } from '../../components/ui/dashboard/AreaStatsCards';
import { AreasTable } from '../../components/ui/dashboard/AreasTable';
import { AreaRunsTable } from '../../components/ui/dashboard/AreaRunsTable';
import { UsersTable } from '../../components/ui/dashboard/UsersTable';
import { ServicesTable } from '../../components/ui/dashboard/ServicesTable';
import { LogsTable } from '../../components/ui/dashboard/LogsTable';
import {
  getLineData,
  getPieData,
  getBarData,
  getRevenueData,
  getProfitData,
  getUsers,
  getAreas,
  getServices,
  getAreasPieData,
  getServicesBarData,
  getLogs,
  getAreaRuns,
  getAreaStats,
  getCardUserData
} from '../../services/adminService';

export default function DashboardPage() {
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [users, setUsers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [services, setServices] = useState([]);
  const [areasPieData, setAreasPieData] = useState([]);
  const [servicesBarData, setServicesBarData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [areaRuns, setAreaRuns] = useState([]);
  const [areaStats, setAreaStats] = useState([]);
  const [cardUserData, setCardUserData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLineData(await getLineData());
      setPieData(await getPieData());
      setBarData(await getBarData());
      setRevenueData(await getRevenueData());
      setProfitData(await getProfitData());
      setUsers(await getUsers());
      setAreas(await getAreas());
      setServices(await getServices());
      setAreasPieData(await getAreasPieData());
      setServicesBarData(await getServicesBarData());
      setLogs(await getLogs());
      setAreaRuns(await getAreaRuns());
      setAreaStats(await getAreaStats());
      setCardUserData(await getCardUserData());
    };
    fetchData();
  }, []);

  return (
    <Container size="xl" py="md">
    <Tabs variant="pills" radius="lg" defaultValue="gallery">
      <Tabs.List justify="center" mb="md">
        <Tabs.Tab value="gallery" leftSection={<IconUser size={16} />}>
            Users
        </Tabs.Tab>
        <Tabs.Tab value="messages" leftSection={<IconMap size={16} />}>
            Areas
        </Tabs.Tab>
        <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
            Services
        </Tabs.Tab>
        <Tabs.Tab value="logs" leftSection={<IconFileText size={16} />}>
            Logs
        </Tabs.Tab>
      </Tabs.List>

        <Divider my="lg" />

        <Tabs.Panel value="gallery" pt="md">
        <StatsGrid data={cardUserData} />
        <Space  h="md" />
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
              <UsersTable users={users} />
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="messages" pt="md">
          <AreaStatsCards areaStats={areaStats} />


            <AreasTable areas={areas} />
            <Space h="md" />
          <AreaRunsTable areaRuns={areaRuns} />
        </Tabs.Panel>

        <Tabs.Panel value="settings" pt="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder shadow="sm" p="md" radius="md">
                <Title order={3} mb="xs">Service Usage</Title>
                <BarChart
                  h={300}
                  data={servicesBarData}
                  dataKey="service"
                  series={[{ name: 'usage', color: 'blue' }]}
                  gridAxis="y"
                />
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <ServicesTable services={services} />
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="logs" pt="md">
          <LogsTable logs={logs} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
