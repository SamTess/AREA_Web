import { Modal, Button, TextInput, Space } from '@mantine/core';
import { useState, useEffect } from 'react';
import { getServices } from '../../../services/areasService';
import { Service, ModalServicesSelectionProps } from '../../../types';

export default function ModalServicesSelection({ isOpen, onClose, onSelect }: ModalServicesSelectionProps) {
    const [services, setServices] = useState<Service[]>([]);
    const [searchName, setSearchName] = useState<string>('');

    useEffect(() => {
        getServices().then((fetchedServices) => {
            setServices(fetchedServices);
        });
    }, []);

    return (
        <Modal opened={isOpen} onClose={onClose} title="Select a Service" size="lg">
            <TextInput
                placeholder="Search by name..."
                value={searchName}
                onChange={(event) => setSearchName(event.currentTarget.value)}
            />
            <Space h="md" />
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {services.filter(service => service.name.toLowerCase().includes(searchName.toLowerCase())).map((service) => (
                    <div key={service.id} style={{ marginBottom: '8px', paddingRight: '20px', paddingLeft: '20px' }}>
                    <Button
                        key={service.id}
                        variant="outline"
                        fullWidth
                        mb="sm"
                        onClick={() => {
                            onSelect(service);
                            onClose();
                        }}
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        <img src={service.logo} alt={service.name} style={{ width: 20, height: 20 }} />
                        <Space w="8" />
                        {service.name}
                    </Button>
                    </div>
                ))}
            </div>



        </Modal>
    );
}