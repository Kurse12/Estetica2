import { useEffect, useState } from "react";
import { LanguageProvider } from "./i18n/LanguageContext";
import { startSmoothScroll, scrollToTarget } from "./lib/smoothScroll";
import { attachPreloader } from "./lib/preloader";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Portfolio from "./components/Portfolio";
import Services from "./components/Services";
import Professionals from "./components/Professionals";
import Booking from "./components/Booking";
import Footer from "./components/Footer";
import { SakuraDivider } from "./components/Sakura";

export default function App() {
  const [preset, setPreset] = useState(null);

  // Declared before the scroll effect on purpose: the preloader takes the
  // scroll lock, and Lenis reads that lock when it starts a line below.
  useEffect(attachPreloader, []);

  // Smooth scrolling is a property of the page, not of any section, so it is
  // started once here and torn down with the app.
  useEffect(startSmoothScroll, []);

  function bookService(serviceId) {
    setPreset({ serviceId, nonce: Date.now() });
    scrollToTarget("reservar");
  }

  function bookWithProfessional(professionalId) {
    setPreset({ professionalId, nonce: Date.now() });
    scrollToTarget("reservar");
  }

  function bookFromPortfolio(serviceId, professionalId) {
    setPreset({ serviceId, professionalId, nonce: Date.now() });
    scrollToTarget("reservar");
  }

  return (
    <LanguageProvider>
      <Nav />
      <main>
        <Hero />
        <Portfolio onBook={bookFromPortfolio} />
        <SakuraDivider className="sakura-divider--gap" />
        <Services onBookService={bookService} />
        <SakuraDivider className="sakura-divider--gap" />
        <Professionals onBookWith={bookWithProfessional} />
        <SakuraDivider className="sakura-divider--gap" />
        <Booking preset={preset} />
      </main>
      <Footer />
    </LanguageProvider>
  );
}
