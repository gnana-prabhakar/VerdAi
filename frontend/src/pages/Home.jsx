import Hero from "../components/Hero";
import FeatureCards from "../components/FeatureCards";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero section */}
      <Hero />

      {/* Feature showcase */}
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-slate-900" />
        <div className="py-20">
          <FeatureCards />
        </div>
      </div>

      {/* Testimonials */}
      <div className="relative bg-slate-950/20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-slate-900" />
        <Testimonials />
      </div>

      {/* Modern Footer */}
      <Footer />
    </div>
  );
}