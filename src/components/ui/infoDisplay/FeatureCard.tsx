"use client";
import { IconGauge, IconUser , IconAutomation } from '@tabler/icons-react';
import {
  Card,
  Container,
  SimpleGrid,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import classes from './FeaturesCards.module.css';

const mockdata = [
  {
    title: 'Automate your tasks',
    description:
      'Create automations between your favorite apps to save time and simplify your daily routine.',
    icon: IconAutomation,
  },
  {
    title: 'Privacy first',
    description:
      'Your data remains confidential and is never shared with third parties. You keep full control.',
    icon: IconUser,
  },
  {
    title: 'Seamless integration',
    description:
      'Easily connect your services without relying on intermediaries. AREA takes care of everything for you.',
    icon: IconGauge,
  },
];

export function FeaturesCards() {
  const theme = useMantineTheme();
  const features = mockdata.map((feature) => (
    <Card key={feature.title} shadow="md" radius="md" className={classes.card} padding="xl">
      <feature.icon size={50} stroke={1.5} color={theme.colors.blue[6]} />
      <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
        {feature.title}
      </Text>
      <Text fz="sm" c="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ));

  return (
    <Container size="lg" py="xl">

      <Title order={2} className={classes.title} ta="center" mt="sm">
        Integrate effortlessly with any technology stack
      </Title>

      <Text c="dimmed" className={classes.description} ta="center" mt="md">
        Every once in a while, you'll see a Golbat that's missing some fangs. This happens when
        hunger drives it to try biting a Steel-type Pokémon.
      </Text>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
        {features}
      </SimpleGrid>
    </Container>
  );
}