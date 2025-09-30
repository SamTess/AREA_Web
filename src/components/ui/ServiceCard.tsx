
import { ServiceCardProps } from '../../types';
import { Card, Text, Menu, ActionIcon } from '@mantine/core';
import Image from 'next/image';
import styles from './ServiceCard.module.css';
import { IconDotsVertical, IconClipboardCopy, IconCopy, IconEdit, IconTrash } from '@tabler/icons-react';

export default function ServiceCard({ logo, serviceName, event, index, onRemove, onConfigure }: ServiceCardProps) {
    return (
            <Card radius="md" withBorder className={styles.card}>
                <div className={styles.leftStripe} />
                <div className={styles.content}>
                    <div className={styles.header}>
                        <div className={styles.leading}>
                            <div className={styles.index}>{index ?? ''}</div>
                            <div className={styles.logoWrap}>
                                <Image src={logo} alt={serviceName} width={36} height={36} className={styles.logo} />
                            </div>
                            <div className={styles.texts}>
                                <Text fw={700} size="sm">{serviceName}</Text>
                                {event ? <Text size="xs" color="dimmed">{event}</Text> : null}
                            </div>
                        </div>

                        <Menu width={180} withArrow>
                            <Menu.Target>
                                <ActionIcon variant="subtle">
                                    <IconDotsVertical size={18} />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item leftSection={<IconClipboardCopy size={16} />}>Duplicate</Menu.Item>
                                <Menu.Item leftSection={<IconCopy size={16} />}>Copy</Menu.Item>
                                <Menu.Item leftSection={<IconEdit size={16} />} onClick={onConfigure}>Edit</Menu.Item>
                                <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={onRemove}>Delete</Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </div>

                </div>
            </Card>
    );
}