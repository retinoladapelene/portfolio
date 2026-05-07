import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Hero from "@/components/sections/Hero";
import Pricing from "@/components/sections/Pricing";
import HorizontalBloomingTimeline from "@/components/portfolio/HorizontalBloomingTimeline";
import Testimonials from "@/components/sections/Testimonials";
import OrderForm from "@/components/sections/OrderForm";


export default function Home() {
  return (
    <div className="relative min-h-screen">

      <Navbar />
      
      <Hero />
      <HorizontalBloomingTimeline />
      <Pricing />
      <Testimonials />
      <OrderForm />
      <Footer />
    </div>
  );
}
