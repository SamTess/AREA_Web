"use client";
import '@mantine/carousel/styles.css';
import { Carousel } from '@mantine/carousel';
import { Paper, Title, useMantineTheme } from '@mantine/core';
import classes from './CardsCarousel.module.css';
import Autoplay from 'embla-carousel-autoplay';

interface CardProps {
  image: string;
}

function Card({ image }: CardProps) {
  return (
    <Paper
      shadow="md"
      p="md"
      radius="md"
      className={classes.card}
    >
      <img src={image} alt="logo" className={classes.logo} />
    </Paper>
  );
}

const data = [
  'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg',
  'https://upload.wikimedia.org/wikipedia/commons/4/4e/Gmail_Icon.png',
  'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
  'https://upload.wikimedia.org/wikipedia/commons/6/6c/Facebook_Logo_2023.png',
  'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
];

export function LogoCarousel() {
  const slides = data.map((item) => (
    <Carousel.Slide key={item}>
      <Card image={item} />
    </Carousel.Slide>
  ));

  return (
    <>
      <Title order={2} ta="center" mt="xl" mb="md">
        Our services
      </Title>
      <Carousel
        slideSize={{ base: '100%', sm: '50%', md: '33.333%', lg: '33.333%' }}
        slideGap={4}
        emblaOptions={{ align: 'start', loop: true }}
        plugins={[Autoplay({ delay: 3000 })]}
        withControls={false}
      >
        {slides}
      </Carousel>
    </>
  );
}