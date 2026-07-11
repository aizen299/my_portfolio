import { Nav } from "@/components/layout/nav";
import { Preloader } from "@/components/fx/preloader";
import { AgentBot } from "@/components/fx/agent-bot";
import { Footer } from "@/components/layout/footer";
import { SkewWrapper } from "@/components/providers/skew-wrapper";
import { ParticleField } from "@/components/webgl/particle-field";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Experience } from "@/components/sections/experience";
import { Skills } from "@/components/sections/skills";
import { Projects } from "@/components/sections/projects";
import { Vault } from "@/components/sections/vault";
import { Logs } from "@/components/sections/logs";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      {/* Fixed, behind everything — must be outside SkewWrapper so its
          position:fixed isn't broken by a transformed ancestor. Lives on
          page.tsx (not layout) so it remounts on each visit and the GSAP
          opacity/paused state resets cleanly on back-navigation. */}
      <ParticleField />
      <Preloader />
      {/* 3-D wireframe robot companion — full-viewport overlay that climbs
          a 7-floor level mapped to the page's sections, purely driven by
          scroll percentage (no keyboard control).
          Outside SkewWrapper so position:fixed isn't broken by the transform. */}
      <AgentBot />
      <Nav />
      {/* Only the scrolling content shears on velocity — Nav/Preloader/
          ParticleField/Cursor stay outside so their fixed positioning
          (and the bento sticky/snap children) aren't broken by transform. */}
      <SkewWrapper>
        <main className="flex-1">
          <Hero />
          <About />
          <Experience />
          <Skills />
          <Projects />
          <Vault />
          <Logs />
          <Contact />
        </main>
        <Footer />
      </SkewWrapper>
    </>
  );
}
