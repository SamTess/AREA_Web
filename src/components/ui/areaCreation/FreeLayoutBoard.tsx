'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button, Group, Modal, Text, Stack, TextInput, Select, Textarea } from '@mantine/core';
import { IconPlus, IconLink } from '@tabler/icons-react';
import ServiceCard from './ServiceCard';
import { ServiceData, ConnectionData, LinkData, ServiceState } from '../../../types';
import styles from './FreeLayoutBoard.module.css';

interface FreeLayoutBoardProps {
  services: ServiceData[];
  connections: ConnectionData[];
  onAddService: () => void;
  onRemoveService: (id: string) => void;
  onEditService: (service: ServiceData) => void;
  onUpdateService: (service: ServiceData) => void;
  onCreateConnection: (connection: ConnectionData) => void;
  onRemoveConnection: (connectionId: string) => void;
  onUpdateConnection: (connection: ConnectionData) => void;
}

interface DragState {
  isDragging: boolean;
  draggedServiceId: string | null;
  offset: { x: number; y: number };
}

interface LinkingState {
  isLinking: boolean;
  sourceId: string | null;
  targetId: string | null;
}

export default function FreeLayoutBoard({
  services,
  connections,
  onAddService,
  onRemoveService,
  onEditService,
  onUpdateService,
  onCreateConnection,
  onRemoveConnection,
}: FreeLayoutBoardProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedServiceId: null,
    offset: { x: 0, y: 0 },
  });

  const [linkingState, setLinkingState] = useState<LinkingState>({
    isLinking: false,
    sourceId: null,
    targetId: null,
  });

  const [linkModalOpened, setLinkModalOpened] = useState(false);
  const [tempConnection, setTempConnection] = useState<Partial<ConnectionData> | null>(null);
  const [connectionsKey, setConnectionsKey] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const serviceClickTimesRef = useRef<Map<string, number>>(new Map());

  const isServiceConfigured = useCallback((serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return false;
    return service.state === ServiceState.Success ||
           (service.actionDefinitionId &&
            service.serviceName &&
            service.event);
  }, [services]);

  const handleServiceClick = useCallback((serviceId: string) => {
    if (!linkingState.isLinking) return;

    if (!isServiceConfigured(serviceId)) {
      console.warn('Cannot create link: Service is not properly configured');
      return;
    }

    if (!linkingState.sourceId) {
      setLinkingState(prev => ({ ...prev, sourceId: serviceId }));
    } else if (linkingState.sourceId !== serviceId) {
      if (!isServiceConfigured(linkingState.sourceId)) {
        console.warn('Cannot create link: Source service is not properly configured');
        setLinkingState(prev => ({ ...prev, sourceId: serviceId }));
        return;
      }

      setLinkingState(prev => ({ ...prev, targetId: serviceId }));
      setTempConnection({
        id: `link-${Date.now()}`,
        sourceId: linkingState.sourceId,
        targetId: serviceId,
        linkData: {
          type: 'chain',
          mapping: {},
          condition: {},
          order: 0,
        },
      });
      setLinkModalOpened(true);
    }
  }, [linkingState, isServiceConfigured]);

  const startLinking = useCallback(() => {
    const configuredServices = services.filter(service => isServiceConfigured(service.id));

    if (configuredServices.length < 2) {
      console.warn('Cannot start linking: Need at least 2 configured services');
      return;
    }

    setLinkingState({
      isLinking: true,
      sourceId: null,
      targetId: null,
    });
  }, [services, isServiceConfigured]);

  const cancelLinking = useCallback(() => {
    setLinkingState({
      isLinking: false,
      sourceId: null,
      targetId: null,
    });
  }, []);

  const confirmLink = useCallback(() => {
    if (tempConnection && tempConnection.sourceId && tempConnection.targetId) {
      onCreateConnection(tempConnection as ConnectionData);
    }

    setLinkModalOpened(false);
    setTempConnection(null);
    cancelLinking();
  }, [tempConnection, onCreateConnection, cancelLinking]);

  const handleMouseDown = useCallback((e: React.MouseEvent, serviceId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const currentTime = Date.now();
    const lastClickTime = serviceClickTimesRef.current.get(serviceId) || 0;
    const timeDiff = currentTime - lastClickTime;

    serviceClickTimesRef.current.set(serviceId, currentTime);

    if (timeDiff < 300) {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        onEditService(service);
      }
      return;
    }

    if (linkingState.isLinking) {
      setTimeout(() => {
        const lastTime = serviceClickTimesRef.current.get(serviceId) || 0;
        if (currentTime === lastTime) {
          handleServiceClick(serviceId);
        }
      }, 300);
      return;
    }

    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    const serviceRect = e.currentTarget.getBoundingClientRect();
    const offset = {
      x: e.clientX - serviceRect.left,
      y: e.clientY - serviceRect.top,
    };

    setDragState({
      isDragging: true,
      draggedServiceId: serviceId,
      offset,
    });

    const handleMove = (moveEvent: MouseEvent) => {
      const newBoardRect = boardRef.current?.getBoundingClientRect();
      if (!newBoardRect) return;

      const newX = moveEvent.clientX - newBoardRect.left - offset.x;
      const newY = moveEvent.clientY - newBoardRect.top - offset.y;

      const constrainedX = Math.max(0, Math.min(newX, newBoardRect.width - 300));
      const constrainedY = Math.max(0, Math.min(newY, newBoardRect.height - 150));

      const currentService = services.find(s => s.id === serviceId);
      if (currentService) {
        onUpdateService({
          ...currentService,
          position: { x: constrainedX, y: constrainedY },
        });
      }
    };

    const handleUp = () => {
      setDragState({
        isDragging: false,
        draggedServiceId: null,
        offset: { x: 0, y: 0 },
      });

      setTimeout(() => {
        setConnectionsKey(prev => prev + 1);
      }, 10);

      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [services, linkingState.isLinking, onUpdateService, onEditService, handleServiceClick]);

  const renderConnections = () => {
    if (connections.length === 0) return null;

    return connections.map((connection) => {
      const sourceService = services.find(s => s.id === connection.sourceId);
      const targetService = services.find(s => s.id === connection.targetId);

      if (!sourceService || !targetService) return null;

      const sourceElement = document.querySelector(`[data-service-id="${connection.sourceId}"]`);
      const targetElement = document.querySelector(`[data-service-id="${connection.targetId}"]`);
      const boardElement = boardRef.current;

      let sourceX, sourceY, targetX, targetY;

      if (sourceElement && targetElement && boardElement) {
        const boardRect = boardElement.getBoundingClientRect();
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        sourceX = sourceRect.right - boardRect.left;
        sourceY = sourceRect.top + sourceRect.height / 2 - boardRect.top;
        targetX = targetRect.left - boardRect.left;
        targetY = targetRect.top + targetRect.height / 2 - boardRect.top;
      } else {
        const sourcePos = sourceService.position || { x: 100, y: 100 };
        const targetPos = targetService.position || { x: 300, y: 100 };

        const cardWidth = 300;
        const cardHeight = 150;

        sourceX = sourcePos.x + cardWidth;
        sourceY = sourcePos.y + cardHeight / 2;
        targetX = targetPos.x;
        targetY = targetPos.y + cardHeight / 2;
      }

      const distance = Math.abs(targetX - sourceX);
      const controlPoint1X = sourceX + Math.min(distance * 0.3, 80);
      const controlPoint2X = targetX - Math.min(distance * 0.3, 80);

      const pathD = `M ${sourceX} ${sourceY} C ${controlPoint1X} ${sourceY} ${controlPoint2X} ${targetY} ${targetX} ${targetY}`;
      const midX = (sourceX + targetX) / 2;
      const midY = (sourceY + targetY) / 2;

      const getLinkStyle = (linkType: LinkData['type']) => {
        switch (linkType) {
          case 'chain':
            return {
              color: '#4DABF7',
              marker: 'url(#arrowhead)',
              strokeDasharray: 'none',
              label: '🔗'
            };
          case 'conditional':
            return {
              color: '#FFD43B',
              marker: 'url(#arrowhead-yellow)',
              strokeDasharray: '5,5',
              label: '❓'
            };
          case 'parallel':
            return {
              color: '#51CF66',
              marker: 'url(#arrowhead-green)',
              strokeDasharray: '10,5',
              label: '⚡'
            };
          case 'sequential':
            return {
              color: '#9775FA',
              marker: 'url(#arrowhead-purple)',
              strokeDasharray: 'none',
              label: '⏭️'
            };
          default:
            return {
              color: '#FF6B6B',
              marker: 'url(#arrowhead-red)',
              strokeDasharray: 'none',
              label: '🔗'
            };
        }
      };

      const linkStyle = getLinkStyle(connection.linkData.type || 'chain');
      const linkColor = linkStyle.color;
      const arrowMarker = linkStyle.marker;

      return React.createElement('g', {
        key: `${connection.id}-${connectionsKey}`,
        className: 'connection-group',
        style: { transition: 'all 0.3s ease' }
      }, [
        React.createElement('path', {
          key: 'bg-path',
          d: pathD,
          stroke: linkColor + '40',
          strokeWidth: 8,
          fill: 'none',
          style: { filter: 'blur(2px)' }
        }),
        React.createElement('path', {
          key: 'main-path',
          d: pathD,
          stroke: linkColor,
          strokeWidth: 3,
          fill: 'none',
          markerEnd: arrowMarker,
          strokeDasharray: linkStyle.strokeDasharray,
          style: {
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            transition: 'all 0.3s ease'
          },
          onMouseEnter: (e) => {
            const target = e.target as SVGPathElement;
            target.style.strokeWidth = '4';
            target.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))';
          },
          onMouseLeave: (e) => {
            const target = e.target as SVGPathElement;
            target.style.strokeWidth = '3';
            target.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))';
          }
        }),
        React.createElement('g', {
          key: 'delete-button',
          style: { cursor: 'pointer' },
          onClick: () => onRemoveConnection(connection.id),
          onMouseEnter: (e) => {
            const circle = e.currentTarget.querySelector('circle');
            const text = e.currentTarget.querySelector('text');
            if (circle) {
              circle.style.transformOrigin = `${midX}px ${midY}px`;
              circle.style.transform = 'scale(1.2)';
              circle.style.fill = '#FA5252';
            }
            if (text) {
              text.style.fontSize = '16px';
            }
          },
          onMouseLeave: (e) => {
            const circle = e.currentTarget.querySelector('circle');
            const text = e.currentTarget.querySelector('text');
            if (circle) {
              circle.style.transformOrigin = `${midX}px ${midY}px`;
              circle.style.transform = 'scale(1)';
              circle.style.fill = '#FF6B6B';
            }
            if (text) {
              text.style.fontSize = '14px';
            }
          }
        }, [
          React.createElement('circle', {
            key: 'delete-circle',
            cx: midX,
            cy: midY,
            r: 14,
            fill: '#FF6B6B',
            stroke: '#FFF',
            strokeWidth: 2,
            style: {
              transition: 'all 0.2s ease',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              transformOrigin: `${midX}px ${midY}px`
            }
          }),
          React.createElement('text', {
            key: 'delete-text',
            x: midX,
            y: midY + 5,
            textAnchor: 'middle',
            fill: 'white',
            fontSize: 14,
            fontWeight: 'bold',
            style: {
              userSelect: 'none',
              transition: 'all 0.2s ease',
              pointerEvents: 'none'
            }
          }, '×')
        ]),
        React.createElement('g', {
          key: 'label',
          style: { pointerEvents: 'none' }
        }, [
          React.createElement('rect', {
            key: 'label-bg',
            x: midX - 25,
            y: sourceY < targetY ? midY - 25 : midY + 10,
            width: 50,
            height: 18,
            fill: linkColor,
            rx: 9,
            ry: 9,
            style: {
              opacity: 0.9,
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
            }
          }),
          React.createElement('text', {
            key: 'label-text',
            x: midX,
            y: sourceY < targetY ? midY - 12 : midY + 23,
            textAnchor: 'middle',
            fill: 'white',
            fontSize: 10,
            fontWeight: '600',
            style: { userSelect: 'none' }
          }, `${linkStyle.label} ${connection.linkData?.order || 0}`)
        ])
      ]);
    });
  };

  const canStartLinking = services.filter(service => isServiceConfigured(service.id)).length >= 2;

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <Group>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={onAddService}
            variant="outline"
          >
            Add Service
          </Button>
          <Button
            leftSection={<IconLink size={16} />}
            onClick={linkingState.isLinking ? cancelLinking : startLinking}
            variant={linkingState.isLinking ? "filled" : "outline"}
            color={linkingState.isLinking ? "red" : "blue"}
            disabled={!linkingState.isLinking && !canStartLinking}
            title={!canStartLinking ? "Configure at least 2 services to create links" : ""}
          >
            {linkingState.isLinking ? 'Cancel Linking' : 'Create Link'}
          </Button>
        </Group>
      </div>

      <div
        ref={boardRef}
        className={styles.board}
      >
        <svg className={styles.connections}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="12"
              markerHeight="8"
              refX="11"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L0,8 L12,4 z"
                fill="#4DABF7"
                stroke="white"
                strokeWidth="0.5"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
              />
            </marker>

            <marker
              id="arrowhead-green"
              markerWidth="12"
              markerHeight="8"
              refX="11"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L0,8 L12,4 z"
                fill="#51CF66"
                stroke="white"
                strokeWidth="0.5"
              />
            </marker>

            <marker
              id="arrowhead-yellow"
              markerWidth="12"
              markerHeight="8"
              refX="11"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L0,8 L12,4 z"
                fill="#FFD43B"
                stroke="white"
                strokeWidth="0.5"
              />
            </marker>

            <marker
              id="arrowhead-red"
              markerWidth="12"
              markerHeight="8"
              refX="11"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L0,8 L12,4 z"
                fill="#FF6B6B"
                stroke="white"
                strokeWidth="0.5"
              />
            </marker>

            <marker
              id="arrowhead-purple"
              markerWidth="12"
              markerHeight="8"
              refX="11"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L0,8 L12,4 z"
                fill="#9775FA"
                stroke="white"
                strokeWidth="0.5"
              />
            </marker>

            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {renderConnections()}
        </svg>

        {services.map((service, index) => {
          const position = service.position || {
            x: 100 + (index % 3) * 320,
            y: 100 + Math.floor(index / 3) * 170
          };

          const isSelected = linkingState.sourceId === service.id;
          const isLinkingMode = linkingState.isLinking;
          const isConfigured = isServiceConfigured(service.id);
          const canLink = !isLinkingMode || isConfigured;

          const linkInfo = (() => {
            const fields = service.fields || {};

            if (fields._chainSource) {
              return {
                type: 'chain' as const,
                sourceService: fields._chainSource as string
              };
            }
            if (fields._conditionalSource) {
              return {
                type: 'conditional' as const,
                sourceService: fields._conditionalSource as string
              };
            }
            if (fields._parallelWith) {
              return {
                type: 'parallel' as const,
                sourceService: fields._parallelWith as string
              };
            }
            if (fields._sequentialSource) {
              return {
                type: 'sequential' as const,
                sourceService: fields._sequentialSource as string
              };
            }

            if (fields._hasChainTarget) {
              return {
                hasChainTarget: true
              };
            }

            return undefined;
          })();

          return (
            <div
              key={service.id}
              data-service-id={service.id}
              className={`${styles.serviceWrapper} ${isSelected ? styles.selected : ''} ${isLinkingMode ? styles.linkingMode : ''} ${!canLink ? styles.notConfigured : ''}`}
              style={{
                left: position.x,
                top: position.y,
                cursor: isLinkingMode
                  ? (canLink ? 'pointer' : 'not-allowed')
                  : (dragState.isDragging ? 'grabbing' : 'grab'),
                opacity: isLinkingMode && !canLink ? 0.5 : 1,
              }}
              onMouseDown={(e) => handleMouseDown(e, service.id)}
            >
              <ServiceCard
                logo={service.logo}
                serviceName={service.serviceName}
                cardName={service.cardName}
                event={service.event}
                state={service.state}
                isFirst={index === 0}
                isLast={index === services.length - 1}
                onRemove={() => onRemoveService(service.id)}
                onEdit={() => onEditService(service)}
                onUp={() => {}}
                onDown={() => {}}
                onDuplicate={() => {}}
                linkInfo={linkInfo}
              />

              {isLinkingMode && !canLink && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  border: '2px dashed #ff6b6b',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  pointerEvents: 'none'
                }}>
                  <Text size="xs" color="red" fw={600} style={{
                    backgroundColor: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    Configure service first
                  </Text>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        opened={linkModalOpened}
        onClose={() => {
          setLinkModalOpened(false);
          setTempConnection(null);
          cancelLinking();
        }}
        title="Configure Link"
        size="md"
      >
        {tempConnection && (
          <Stack>
            <Text size="sm">
              Creating link from <strong>{services.find(s => s.id === tempConnection.sourceId)?.serviceName}</strong>
              {' '} to <strong>{services.find(s => s.id === tempConnection.targetId)?.serviceName}</strong>
            </Text>

            <Select
              label="Link Type"
              placeholder="Select link type"
              data={[
                { value: 'chain', label: 'Chain Reaction - Triggers when source completes' },
                { value: 'conditional', label: 'Conditional - Triggers based on conditions' },
                { value: 'parallel', label: 'Parallel - Runs simultaneously' },
                { value: 'sequential', label: 'Sequential - Waits for source completion' }
              ]}
              value={tempConnection.linkData?.type || 'chain'}
              onChange={(value) => setTempConnection(prev => prev ? {
                ...prev,
                linkData: {
                  type: value as LinkData['type'] || 'chain',
                  mapping: prev.linkData?.mapping || {},
                  order: prev.linkData?.order || 0,
                  metadata: prev.linkData?.metadata || {},
                  condition: prev.linkData?.condition || {
                    field: '',
                    operator: 'equals',
                    value: ''
                  }
                }
              } : null)}
            />

            <TextInput
              label="Execution Order"
              placeholder="0"
              value={tempConnection.linkData?.order?.toString() || '0'}
              onChange={(e) => setTempConnection(prev => prev ? {
                ...prev,
                linkData: {
                  type: prev.linkData?.type || 'chain',
                  mapping: prev.linkData?.mapping || {},
                  condition: prev.linkData?.condition || {},
                  metadata: prev.linkData?.metadata || {},
                  order: parseInt(e.target.value) || 0
                }
              } : null)}
            />

            {tempConnection.linkData?.type === 'conditional' && (
              <Textarea
                label="Condition (JSON format)"
                placeholder='{"field": "status", "operator": "equals", "value": "success"}'
                value={JSON.stringify(tempConnection.linkData?.condition || {})}
                onChange={(e) => {
                  try {
                    const condition = JSON.parse(e.target.value);
                    setTempConnection(prev => prev ? {
                      ...prev,
                      linkData: {
                        type: prev.linkData?.type || 'chain',
                        mapping: prev.linkData?.mapping || {},
                        order: prev.linkData?.order || 0,
                        metadata: prev.linkData?.metadata || {},
                        condition
                      }
                    } : null);
                  } catch (error) {
                    console.error('Invalid JSON for condition', error);
                  }
                }}
                minRows={3}
              />
            )}

            {(tempConnection.linkData?.type === 'chain' || tempConnection.linkData?.type === 'sequential') && (
              <Textarea
                label="Data Mapping (JSON format)"
                placeholder='{"sourceField": "targetField", "result": "input"}'
                value={JSON.stringify(tempConnection.linkData?.mapping || {})}
                onChange={(e) => {
                  try {
                    const mapping = JSON.parse(e.target.value);
                    setTempConnection(prev => prev ? {
                      ...prev,
                      linkData: {
                        type: prev.linkData?.type || 'chain',
                        order: prev.linkData?.order || 0,
                        metadata: prev.linkData?.metadata || {},
                        condition: prev.linkData?.condition || {
                          field: '',
                          operator: 'equals',
                          value: ''
                        },
                        mapping
                      }
                    } : null);
                  } catch (error) {
                    console.error('Invalid JSON for mapping', error);
                  }
                }}
                minRows={3}
              />
            )}

            <Text size="xs" c="dimmed">
              {tempConnection.linkData?.type === 'chain' && 'Chain: Target activates when source completes, inheriting source data.'}
              {tempConnection.linkData?.type === 'conditional' && 'Conditional: Target activates only if conditions are met.'}
              {tempConnection.linkData?.type === 'parallel' && 'Parallel: Target runs simultaneously with source.'}
              {tempConnection.linkData?.type === 'sequential' && 'Sequential: Target waits for source completion, then executes.'}
            </Text>

            <Group justify="flex-end">
              <Button variant="outline" onClick={() => {
                setLinkModalOpened(false);
                setTempConnection(null);
                cancelLinking();
              }}>
                Cancel
              </Button>
              <Button onClick={confirmLink}>
                Create Link
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </div>
  );
}