import { Modal, Button } from '@mantine/core';
import { useState, useEffect } from 'react';
import { getServices } from '../../../services/areasService';
import { Service, ModalServicesSelectionProps } from '../../../types';

export default function ModalServicesSelection({ isOpen, onClose, onSelect }: ModalServicesSelectionProps) {
    const [services, setServices] = useState<Service[]>([]);

    useEffect(() => {
        getServices().then((fetchedServices) => {
            setServices(fetchedServices);
        });
    }, []);

    return (
        <Modal opened={isOpen} onClose={onClose} title="Select a Service">
            {services.map((service) => (
                <Button
                    key={service.id}
                    variant="outline"
                    fullWidth
                    mb="sm"
                    onClick={() => {
                        onSelect(service);
                        onClose();
                    }}
                    style={{ display: 'flex', alignItems: 'center'}}
                >
                    <img src={service.logo} alt={service.name} style={{ width: 20, height: 20 }} />
                    {service.name}
                </Button>
            ))}
        </Modal>
    );
}