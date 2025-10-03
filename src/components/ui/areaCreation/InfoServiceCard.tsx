
import { Button, Paper, Stepper, Group } from '@mantine/core';
import { useState, useCallback } from 'react';
import SetupStep from './SetupStep';
import ConfigureStep from './ConfigureStep';
import FinishStep from './FinishStep';
import { InfoServiceCardProps } from '../../../types';

export default function InfoServiceCard({ service, onServiceChange }: InfoServiceCardProps) {
    const [activeStep, setActiveStep] = useState(0);

    const handleFieldsChange = useCallback((fields: Record<string, any>) => {
        onServiceChange?.({ ...service, fields });
    }, [onServiceChange, service]);

    const nextStep = () => setActiveStep((current) => (current < 2 ? current + 1 : current));
    const prevStep = () => setActiveStep((current) => (current > 0 ? current - 1 : current));

    return (
        <Paper p="md" shadow="sm">
            <Stepper active={activeStep}>
                <Stepper.Step label="Setup" description="Configure service">
                    <SetupStep service={service} onRemove={() => console.log('Remove service')} onServiceChange={onServiceChange} />
                </Stepper.Step>
                <Stepper.Step label="Configure" description="Set up connections">
                    <ConfigureStep service={service} onFieldsChange={handleFieldsChange} />
                </Stepper.Step>
                <Stepper.Step label="Finish/Tests" description="Finalize and test">
                    <FinishStep service={service} />
                </Stepper.Step>
            </Stepper>

            <Group justify="center" mt="xl">
                <Button variant="default" onClick={prevStep} disabled={activeStep === 0}>
                    Back
                </Button>
                {activeStep < 2 && (
                <Button onClick={nextStep}>
                    Next step
                </Button>
                )}
            </Group>
        </Paper>
    );
}