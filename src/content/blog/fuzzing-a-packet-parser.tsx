import { CodeBlock, Callout } from "@/components/blog/prose";

export default function Post() {
  return (
    <>
      <p>
        A deep packet inspection engine spends its whole life parsing bytes that
        someone else wrote — and some of those someones are hostile. When I built
        the C++17 DPI engine, the parsers for Ethernet, IP, TCP, UDP, TLS SNI,
        HTTP Host, and DNS were the most dangerous code in the project. So they got
        a fuzzing harness before they got features.
      </p>

      <h2>1. One entry point per parser</h2>
      <p>
        Each parser takes a pointer and a length and returns either a parsed view
        or a rejection — never a crash. That shape makes it trivial to fuzz:
      </p>
      <CodeBlock label="fuzz target">{`extern "C" int LLVMFuzzerTestOneInput(const uint8_t* data, size_t size) {
  auto pkt = dpi::parse_frame({data, size});
  if (pkt) dpi::extract_sni(*pkt);   // exercise the deep path too
  return 0;
}`}</CodeBlock>

      <h2>2. Run it under every sanitizer</h2>
      <p>
        A fuzzer only finds what it can observe. Out-of-bounds reads in C++ often
        &ldquo;work&rdquo; silently, so the harness runs under AddressSanitizer,
        UBSan, and — because flows are routed to worker threads by 5-tuple hash —
        ThreadSanitizer too. The engine validated 85,000+ malformed packets clean
        under all three.
      </p>
      <Callout>
        Every length field in a packet is an attacker-controlled integer. Check it
        against the bytes you actually have before you trust it.
      </Callout>

      <h2>3. Keep it in CI</h2>
      <p>
        The harness is one stage of a five-stage GitHub Actions pipeline, so a
        parser change that regresses safety fails the build instead of shipping.
        Downstream, a FastAPI Isolation Forest service scores flows for anomalies
        and a Next.js WebSocket dashboard shows them live.
      </p>
    </>
  );
}
