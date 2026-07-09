import { HeroSection } from '../components/HeroSection';
import { FeaturedRooms } from '../components/FeaturedRooms';
import { DestinationGrid } from '../components/DestinationGrid';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { PartnerLogos } from '../components/PartnerLogos';

export const HomePage = () => (
  <>
    <HeroSection />
    <FeaturedRooms />
    <DestinationGrid />
    <TestimonialsSection />
    <PartnerLogos />
  </>
);
