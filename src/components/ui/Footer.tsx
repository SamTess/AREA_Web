'use client';
import { Image, Anchor, Group, Container, Flex } from '@mantine/core';

const links = [
  { link: '#', label: 'Contact' },
  { link: '#', label: 'Privacy' },
  { link: '#', label: 'Blog' },
  { link: '#', label: 'Careers' },
];

export function FooterCentered() {
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
    <Container size="lg" mt="md" style={{ borderTop: '1px solid #e0e0e0' , paddingTop: '1rem'}}>
      <Flex justify="space-between" align="center">
        <Image src="/1.png" alt="area logo" style={{ maxWidth: '15%', height: 'auto' }} />
        <Group justify="center" style={{ flex: 1 }}>
          {items}
        </Group>
      </Flex>
    </Container>
  );
}