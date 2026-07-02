import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Clients from "./components/Clients";
import Features from "./components/Features";
import Stats from "./components/Stats";
import Demo from "./components/Demo";
import Pricing from "./components/Pricing";
import Testimonials from "./components/Testimonials";
import Team from "./components/Team";
import CTABanner from "./components/CTABanner";
import Footer from "./components/Footer";
import "./index.css";

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Clients />
      <Features />
      <Stats />
      <Demo />
      <Pricing />
      <Testimonials />
      <Team />
      <CTABanner />
      <Footer />
    </>
  );
}
