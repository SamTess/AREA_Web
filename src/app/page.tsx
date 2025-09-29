import { HeroBanner } from '@/components/ui/HeroBanner';
import { LogoCarousel } from '@/components/ui/LogoCarousel';
import { FeaturesCards } from '@/components/ui/FeatureCard';
export default function Home() {
  return (
    <>
      <HeroBanner />
      <div style={{ height: '40px' }}></div>

      <LogoCarousel />
      <div style={{ height: '80px' }}></div>
      <FeaturesCards />
    </>
  );
}
