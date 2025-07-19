// src/components/home/HomePage.tsx - update imports and add component
import Header from '../layout/Header';
import HeroSection from './HeroSection';
import ServicesSection from './ServicesSection';
import TeamSection from './TeamSection';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <ServicesSection />
      <TeamSection />
      
      {/* Future content sections will go here */}
      <main className="bg-white">
        {/* Content will be added here in next steps */}
      </main>
    </div>
  );
}