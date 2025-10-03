"use client";
import '@mantine/carousel/styles.css';
import { Carousel } from '@mantine/carousel';
import { Paper, Title } from '@mantine/core';
import classes from './CardsCarousel.module.css';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getServices } from '../../../services/areasService';
import { Service, CardProps } from '../../../types';

function Card({ image }: CardProps) {
  return (
    <Paper
      shadow="md"
      p="md"
      radius="md"
      className={classes.card}
      style={{ position: 'relative' }}
    >
      <Image src={image} alt="logo" fill style={{ objectFit: 'contain' }} />
    </Paper>
  );
}

export function LogoCarousel() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const loadServices = async () => {
      const servicesData = await getServices();
      setServices(servicesData);
    };
    loadServices();
  }, []);

  const slides = services.map((service) => (
    <Carousel.Slide key={service.id}>
      <Card image={service.logo} />
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