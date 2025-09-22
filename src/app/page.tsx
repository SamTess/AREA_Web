import { Container, Title, Text, Button, Image } from '@mantine/core';

export default function Home() {
  return (
    <Container size="md" py="xl">
      <Title order={1}>Base page</Title>
      <Text>texte</Text>
      <Image src="/areaLogo.png" alt="area logo" width={180} height={38} />
      <Button>Base button</Button>
    </Container>
  );
}
