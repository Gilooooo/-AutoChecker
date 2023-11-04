"use client"
import FooterLanding from "@/_Components/Default fix/FooterLanding";
import HeaderLanding from "@/_Components/Default fix/HeaderLanding";
import About from "@/_Components/LandingPage/About";
import Contact from "@/_Components/LandingPage/Contact";
import Hero from "@/_Components/LandingPage/Hero";
import Manual from "@/_Components/LandingPage/Manual";

export default function Home() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <main className="d-flex flex-column justify-content-center align-items-center ">
      <HeaderLanding />
      <Hero/>
      <About/>
      <Manual/>
      <Contact scrollToTop={scrollToTop}/>
      <FooterLanding />
    </main>
  );
}
