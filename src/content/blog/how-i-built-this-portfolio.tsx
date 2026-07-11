import { CodeBlock, Callout } from "@/components/blog/prose";

export default function Post() {
  return (
    <>
      <p>
        This site is a Next.js App Router app with an unreasonable amount of
        WebGL for a portfolio: a particle field of roughly 80,000 points that
        morphs between forms, a scroll-driven wireframe companion, and shader
        panels behind every project. The fun part wasn&apos;t building the
        effects — it was keeping them from tanking the experience on a mid-range
        phone, and one bug that made the whole site look completely broken while
        being, technically, perfectly rendered.
      </p>

      <h2>Making 80k particles cheap enough</h2>
      <p>
        A particle system is only free until it isn&apos;t. Three rules kept the
        frame budget under control:
      </p>
      <ul>
        <li>
          <strong>Gate on the GPU.</strong> I use <code>detect-gpu</code> to
          read the device&apos;s tier and simply don&apos;t mount the heavy
          scenes on tier-0 hardware or phones. No WebGL beats janky WebGL.
        </li>
        <li>
          <strong>Cap the pixel ratio.</strong> Rendering at the full retina{" "}
          <code>devicePixelRatio</code> is the fastest way to quadruple your
          fragment cost for no visible gain. I clamp it to{" "}
          <code>[1, 1.5]</code>.
        </li>
        <li>
          <strong>Pause what you can&apos;t see.</strong> Every project panel
          canvas is wrapped in an <code>IntersectionObserver</code> and its
          render loop is suspended while off-screen, so five shader canvases
          never run at once.
        </li>
      </ul>
      <p>
        The other silent killer was reading layout in the animation loop. Any{" "}
        <code>scrollHeight</code> or <code>getBoundingClientRect()</code> call
        inside <code>useFrame</code> forces a synchronous reflow every frame. I
        cache those values and refresh them from a <code>ResizeObserver</code>{" "}
        instead.
      </p>

      <h2>The bug that hid every click</h2>
      <p>
        At one point every button on the site stopped working. Not throwing —{" "}
        just dead. No console errors, the page looked pixel-perfect, and the
        elements were all in the DOM. The culprit was a{" "}
        <strong>hydration mismatch</strong>.
      </p>
      <p>
        My preloader (the &quot;decrypting identity&quot; intro) read{" "}
        <code>sessionStorage</code> in its <code>useState</code> initializer to
        skip itself on repeat visits:
      </p>
      <CodeBlock label="preloader.tsx — the bug">{`// Server renders done=false (no sessionStorage on the server).
// Client's first render reads the key and returns done=true.
// The two trees don't match -> hydration fails.
const [done, setDone] = useState(
  () => !!sessionStorage.getItem("divi:loaded")
);`}</CodeBlock>
      <p>
        When hydration fails, React discards the server HTML and re-renders on
        the client. During that thrash the preloader&apos;s exit animation never
        ran, so its full-screen <code>z-index: 200</code> overlay — with{" "}
        <code>pointer-events: auto</code> — stayed on top of everything,
        swallowing every click. The page under it was fine; you just
        couldn&apos;t reach it.
      </p>
      <p>The fix is boring, which is the point: match the server.</p>
      <CodeBlock label="preloader.tsx — the fix">{`// Always start false so SSR and first client render agree.
const [done, setDone] = useState(false);

useEffect(() => {
  // Skip on repeat visits AFTER hydration, where it's safe.
  if (sessionStorage.getItem("divi:loaded")) setDone(true);
}, []);`}</CodeBlock>
      <Callout>
        Hydration errors aren&apos;t cosmetic. A mismatch can silently break
        interactivity across the entire page while everything still{" "}
        <em>looks</em> right. If clicks die with no error, check the dev overlay
        for a recoverable hydration warning first.
      </Callout>
      <p>
        The same class of bug bit me twice more: WebGL components reading a{" "}
        <code>ref</code> during render, and an <code>ssr:false</code> dynamic
        component rendering before mount. The general fix is the same — anything
        that differs between server and client belongs in an effect, not in
        render.
      </p>

      <h2>Mobile: stop being clever</h2>
      <p>
        Desktop uses Lenis for smooth momentum scrolling. On touch devices that
        was actively harmful — Lenis intercepts touch events, which broke tap
        targets and link navigation. The fix was to detect{" "}
        <code>(pointer: coarse)</code> and bypass Lenis entirely, letting native
        scroll do its job. I also disable the WebGL companion on phones, ship a
        real hamburger drawer instead of a hidden desktop nav, and made the chat
        panel fluid so it never overflows a 320px screen.
      </p>

      <h2>What I&apos;d tell someone starting one</h2>
      <p>
        Build the performance gates <em>first</em> — GPU tiering, reduced-motion
        handling, and off-screen pausing are much harder to retrofit. And treat
        SSR/client parity as a correctness property, not a nice-to-have: the
        scariest bugs here don&apos;t crash, they just quietly stop working.
      </p>
    </>
  );
}
