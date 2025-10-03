import { Button, Stack, TextInput, Input, InputBase, Combobox, useCombobox, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import AccountCardServices from './acountCardServices';
import { getActionsByServiceId } from '../../../services/areasService';
import { Action, Service, ServiceState, ServiceData, SetupStepProps } from '../../../types';
import ModalServicesSelection from './ModalServicesSelection';
import { mockUser } from '../../../mocks/user';

export default function SetupStep({ service, onRemove, onServiceChange }: SetupStepProps) {

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    const [actions, setActions] = useState<Action[]>([]);
    const [value, setValue] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        getActionsByServiceId(service.serviceId).then((fetchedActions) => {
            setActions(fetchedActions);
        });
    }, [service.serviceId]);

    useEffect(() => {
        if (actions.length > 0 && service.actionId && service.actionId !== 0) {
            setValue(service.actionId.toString());
        } else {
            setValue(null);
        }
    }, [service.actionId, actions]);

    const options = actions.map((action) => (
        <Combobox.Option value={action.id.toString()} key={action.id}>
            <Stack gap={0}>
                <Text size="sm" fw={500}>{action.name}</Text>
                <Text size="xs" c="dimmed">{action.description}</Text>
            </Stack>
        </Combobox.Option>
    ));

    return (
        <>
            <Stack gap="xs">
                <Text size="sm" fw={500}>Choose a service <span style={{color: 'red'}}>*</span></Text>
                <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setIsModalOpen(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                { service.logo ? (
                    <>
                        <img src={service.logo} alt={service.serviceName} style={{ width: 20, height: 20 }} />
                        {service.serviceName}
                    </>
                ) : (
                    <span>Select a service</span>
                )}
                </Button>
                <TextInput
                    label="Card name"
                    placeholder="e.g., 'When I receive an email...'"
                    value={service.cardName}
                    onChange={(e) => onServiceChange?.({ ...service, cardName: e.target.value })}
                />
                <Combobox
                    store={combobox}
                    onOptionSubmit={(val) => {
                        const selectedAction = actions.find(a => a.id.toString() === val);
                        setValue(val);
                        onServiceChange?.({ ...service, actionId: Number(val), event: selectedAction?.name || '' });
                        combobox.closeDropdown();
                    }}
                >
                    <Combobox.Target>
                        <InputBase
                            component="button"
                            type="button"
                            pointer
                            label="Choose an action"
                            required={true}
                            rightSection={<Combobox.Chevron />}
                            rightSectionPointerEvents="none"
                            onClick={() => combobox.toggleDropdown()}
                        >
                            {value ? actions.find(a => a.id.toString() === value)?.name : <Input.Placeholder>Select an action</Input.Placeholder>}
                        </InputBase>
                    </Combobox.Target>

                    <Combobox.Dropdown>
                        <Combobox.Options>{options}</Combobox.Options>
                    </Combobox.Dropdown>
                </Combobox>
                <Text size="sm" fw={500}>Account <span style={{color: 'red'}}>*</span></Text>
                <AccountCardServices
                    logo={mockUser.avatarSrc} // a appeler la route specifique je sais pas laquelle
                    accountName={mockUser.name}
                    email={mockUser.email}
                    isLoggedIn={true}
                    onView={() => console.log('View account')} // a a changer par un action voulie pour l'instant rien
                    onChange={() => console.log('Change account')}
                    onDelete={() => console.log('Delete account')}
                    onConnect={() => console.log('Connect account')}
                />
            </Stack>
            <ModalServicesSelection
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={(selectedService) => {
                    const newServiceData: ServiceData = {
                        ...service,
                        logo: selectedService.logo,
                        serviceName: selectedService.name,
                        serviceId: selectedService.id,
                        actionId: 0,
                        event: '',
                        cardName: '',
                    };
                    onServiceChange?.(newServiceData);
                    setIsModalOpen(false);
                }}
            />
        </>
    );
}
