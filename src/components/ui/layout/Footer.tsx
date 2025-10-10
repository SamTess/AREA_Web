'use client';
import { Image, Anchor, Group, Container, Flex } from '@mantine/core';
import './Footer.css';

const links = [
  { link: '#', label: 'About' },
  { link: '#', label: 'Features' },
  { link: '#', label: 'Support' },
];

export function Footer() {
  const items = links.map((link) => (
    <Anchor
      c="dimmed"
      key={link.label}
      href={link.link}
      lh={1}
      onClick={(event) => event.preventDefault()}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <div className="footer" style={{ width: '100%', padding: '0 10rem' }}>
      <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1rem' }}>
        <Flex justify="space-between" align="center" className="inner">
          <Image src="/area1.png" alt="area logo" style={{ maxWidth: '100px', height: 'auto' }} />
          <Group justify="center" className="links" style={{ flex: 1 }}>
            {items}
          </Group>
        </Flex>
      </div>
    </div>
  );
}