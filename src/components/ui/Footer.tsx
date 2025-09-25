'use client';
import { Image, Anchor, Group, Container, Flex } from '@mantine/core';
import './Footer.css';

const links = [
  { link: '#', label: 'Contact' },
  { link: '#', label: 'Privacy' },
  { link: '#', label: 'Blog' },
  { link: '#', label: 'Careers' },
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
    <Container size="lg" mt="md" className="footer" style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1rem' }}>
      <Flex justify="space-between" align="center" className="inner">
        <Image src="/area1.png" alt="area logo" style={{ maxWidth: '15%', height: 'auto' }} />
        <Group justify="center" className="links" style={{ flex: 1 }}>
          {items}
        </Group>
      </Flex>
    </Container>
  );
}