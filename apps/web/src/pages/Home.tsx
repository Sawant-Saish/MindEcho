import { AboutUsSection } from '../components/AboutUsSection'
import { BlogSection } from '../components/BlogSection'
import { ContactSection } from '../components/ContactSection'
import { FeatureBar, WhyUsSection } from '../components/FeatureBar'
import { Footer } from '../components/Footer'
import { Hero } from '../components/Hero'
import { HowItWorks } from '../components/HowItWorks'
import { Navbar } from '../components/Navbar'
import { ProblemSection } from '../components/ProblemSection'
import { ServicesSection } from '../components/ServicesSection'

export function Home() {
  return (
    <div className="min-h-screen bg-[#1e1917]">
      <Navbar />
      <Hero />
      <FeatureBar />
      <ProblemSection />
      <ServicesSection />
      <HowItWorks />
      <WhyUsSection />
      <AboutUsSection />
      <BlogSection />
      <ContactSection />
      <Footer />
    </div>
  )
}

