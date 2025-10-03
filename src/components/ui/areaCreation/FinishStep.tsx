import { Text, Button } from '@mantine/core';
import { ServiceState, ServiceData, FinishStepProps } from '../../../types';
import { createAction } from '../../../services/areasService';

export default function FinishStep({ service }: FinishStepProps) {
    const handleCreate = async () => {
        try {
            const newAction = await createAction({
                serviceId: service.serviceId,
                name: service.cardName || service.event,
                description: `${service.actionId}`,
                fields: service.fields
            });
            console.log('Action created:', newAction);
        } catch (error) {
            console.error('Error creating action:', error);
        }
    };

    return (
        <div>
            <Button onClick={handleCreate} mt="md">Create Action</Button>
        </div>
    );
}
