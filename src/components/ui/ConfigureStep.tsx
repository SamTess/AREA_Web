import { TextInput, NumberInput, Select, Stack } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useState, useEffect, useRef } from 'react';
import { ConfigureStepProps, FieldData } from '../../types';
import { getActionFieldsByServiceAndActionId } from '../../services/areasService';

export default function ConfigureStep({ service, onFieldsChange }: ConfigureStepProps) {
    const [formValues, setFormValues] = useState<Record<string, any>>({});

    const [data, setData] = useState<FieldData[]>([]);

    const onFieldsChangeRef = useRef(onFieldsChange);

    useEffect(() => {
        onFieldsChangeRef.current = onFieldsChange;
    }, [onFieldsChange]);

    useEffect(() => {
        getActionFieldsByServiceAndActionId(service.serviceId, service.actionId).then((fetchedData) => {
            setData(fetchedData);
        });
    }, [service.serviceId, service.actionId]);

    useEffect(() => {
        setFormValues(service.fields || {});
    }, [service.fields]);

    const handleChange = (name: string, value: any) => {
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        setTimeout(() => onFieldsChangeRef.current?.(formValues), 0);
    }, [formValues]);

    return (
        <Stack gap="md">
            {data.map((field, index) => {
                const commonProps = {
                    label: field.name,
                    placeholder: field.placeholder,
                    required: field.mandatory,
                };

                switch (field.type) {
                    case 'text':
                        return (
                            <TextInput
                                key={index}
                                {...commonProps}
                                value={formValues[field.name] || ''}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                            />
                        );
                    case 'number':
                        return (
                            <NumberInput
                                key={index}
                                {...commonProps}
                                value={formValues[field.name] ? Number(formValues[field.name]) : ''}
                                onChange={(value) => handleChange(field.name, value)}
                            />
                        );
                    case 'dropdown':
                        return (
                            <Select
                                key={index}
                                {...commonProps}
                                value={formValues[field.name] || ''}
                                onChange={(value) => handleChange(field.name, value)}
                                data={field.options || []}
                            />
                        );
                    case 'date':
                        return (
                            <DatePickerInput
                                key={index}
                                {...commonProps}
                                valueFormat="YYYY-MM-DD"
                                value={formValues[field.name] ? new Date(formValues[field.name]) : null}
                                onChange={(value) => handleChange(field.name, value)}
                            />
                        );
                    default:
                        return null;
                }
            })}
        </Stack>
    );
}
