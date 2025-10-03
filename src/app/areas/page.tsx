'use client';
import React, { useState, useEffect, useMemo } from 'react';
import AreaListCard from '../../components/ui/AreaListCard';
import ServiceFilter from '../../components/ui/ServiceFilter';
import { IconPlus } from '@tabler/icons-react';
import { Title, TextInput, Select, Button, Group, Container, Stack, Divider, Pagination, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { getAreas, getServices, deleteAreabyId, runAreaById } from '../../services/areasService';
import { Area, Service } from '../../types';

export default function AreaListPage() {
    const [searchName, setSearchName] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const [page, setPage] = useState(1);
    const router = useRouter();
    const [areas, setAreas] = useState<Area[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const [areasData, servicesData] = await Promise.all([getAreas(), getServices()]);
            setAreas(areasData);
            setServices(servicesData);
        };
        loadData();
    }, []);

    const filteredAreas = useMemo(() => {
        return areas.filter(area => {
            if (searchName && !area.name.toLowerCase().includes(searchName.toLowerCase())) return false;
            if (statusFilter && area.status !== statusFilter) return false;
            if (selectedServices.length > 0 && !selectedServices.some(s => area.services.includes(s))) return false;
            return true;
        });
    }, [searchName, statusFilter, selectedServices, areas]);

    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredAreas.length / itemsPerPage);
    const paginatedAreas = filteredAreas.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    useEffect(() => {
        if (page > totalPages && totalPages > 0) {
            setPage(totalPages);
        } else if (totalPages === 0) {
            setPage(1);
        }
    }, [filteredAreas.length, totalPages, page]);

    const clearFilters = () => {
        setSearchName('');
        setStatusFilter('');
        setSelectedServices([]);
        setPage(1);
    };

    const handleDelete = (id: string) => {
        const areaId = Number(id);
        deleteAreabyId(areaId).then(() => {
            const updatedAreas = areas.filter(area => area.id !== areaId);
            setAreas(updatedAreas);
        });
    };
    const handleRun = (id: string) => {
        const areaId = Number(id);
        runAreaById(areaId);
    };
    return (
        <Container size="lg" py="xl">
            <Stack gap="md">
                <Group justify="space-between">
                    <Title order={1}>Areas</Title>
                    <Button leftSection={<IconPlus size={18} />} onClick={() => router.push('/areas/new')}>Add Area</Button>
                </Group>
                <Divider />
                <Group grow>
                    <TextInput
                        placeholder="Search by name..."
                        value={searchName}
                        onChange={(event) => setSearchName(event.currentTarget.value)}
                    />
                    <Select
                        placeholder="Filter by status"
                        data={[
                            { value: '', label: 'All' },
                            { value: 'failed', label: 'Failed' },
                            { value: 'not started', label: 'Not Started' },
                            { value: 'in progress', label: 'In Progress' },
                            { value: 'success', label: 'Success' },
                        ]}
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value || '')}
                    />
                    <div style={{ flex: 1 }}>
                        <ServiceFilter
                            services={services}
                            value={selectedServices}
                            onChange={setSelectedServices}
                        />
                    </div>
                    <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
                </Group>
                <AreaListCard areas={paginatedAreas} services={services} onDelete={handleDelete} onRun={handleRun} />
                {filteredAreas.length === 0 && (
                    <Text ta="center" c="dimmed">No areas found.</Text>
                )}
                {totalPages > 1 && (
                    <Group justify="center" mt="md">
                        <Pagination
                            total={totalPages}
                            value={page}
                            onChange={setPage}
                            radius="xl"
                        />
                    </Group>
                )}
            </Stack>
        </Container>
    );
}