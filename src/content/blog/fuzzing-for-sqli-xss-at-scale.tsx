import { CodeBlock, Callout } from "@/components/blog/prose";

export default function Post() {
  return (
    <>
      <p>
        A vulnerability scanner is really just a very patient, very rude user. It
        finds every place your app accepts input and then sends each one exactly
        the payload you hoped nobody would. Building the scanner inside CivicShield
        — the attack-surface mapper and vulnerability scanner I worked on — taught
        me that the interesting engineering isn&apos;t the injection payloads
        everyone can look up. It&apos;s the plumbing: how you <em>discover</em> the
        inputs in the first place, how you decide something actually fired, and how
        you rank what you find so a human isn&apos;t drowned in noise. Here&apos;s
        the pipeline, end to end.
      </p>

      <h2>1. Crawl to find the surface</h2>
      <p>
        You can&apos;t test inputs you don&apos;t know exist. The first stage is a
        crawler that walks the target from a seed URL, following links and
        recording every page, form, and query string it reaches. The goal isn&apos;t
        content — it&apos;s <em>surface</em>: the set of places the application will
        take something from a user. Every form field, every <code>?id=</code>,
        every path segment that looks dynamic is a candidate.
      </p>
      <p>
        Two things keep a crawler from either missing half the app or running
        forever: scope and dedup. Stay on the target&apos;s origin so you&apos;re
        not fuzzing someone else&apos;s site, and normalize URLs before you queue
        them or you&apos;ll crawl the same page a thousand times under a thousand
        tracking parameters.
      </p>

      <h2>2. Mine JavaScript for the endpoints crawling misses</h2>
      <p>
        Here&apos;s the part that separates a real scanner from a link-follower.
        Modern apps don&apos;t put their API surface in <code>&lt;a href&gt;</code>{" "}
        tags — it&apos;s buried in JavaScript bundles as <code>fetch()</code> calls
        and string-built URLs that a link crawler never sees. So the scanner pulls
        down every script the pages load and mines them for routes and parameter
        names.
      </p>
      <CodeBlock label="endpoint extraction from JS">{`# Static extraction: pull candidate API paths and params out of
# bundled JS. Regex is crude but catches the fetch/axios patterns
# that a link crawler structurally cannot reach.
ENDPOINT = re.compile(r'["\\'](/api/[\\w/-]+)["\\']')
PARAM    = re.compile(r'[?&]([\\w-]+)=')

for script in scripts:
    endpoints |= set(ENDPOINT.findall(script))
    params    |= set(PARAM.findall(script))`}</CodeBlock>
      <p>
        The payoff is disproportionate. An <code>/api/internal/lookup</code> that
        appears in no HTML anywhere, only in a minified bundle, is exactly the kind
        of forgotten endpoint that skipped a code review — and it&apos;s now on the
        list to fuzz.
      </p>

      <h2>3. Fuzz each parameter</h2>
      <p>
        Now the rude part. For every parameter discovered, the scanner sends a
        battery of payloads and watches how the app reacts. For the two classes I
        focused on — SQL injection and cross-site scripting — the tells are
        different, and reading them correctly is the whole game.
      </p>
      <p>
        <strong>SQLi</strong> is inferred from the server&apos;s <em>behavior</em>,
        not from seeing your payload echoed. A quote that produces a database error,
        a boolean pair (<code>1=1</code> vs <code>1=2</code>) that flips the
        response, or a timing payload that makes a fast endpoint suddenly hang for
        five seconds — each is evidence the input reached a SQL engine.
      </p>
      <CodeBlock label="signal, not just payload">{`SQLI_PROBES = [
    "'",                      # provoke a raw DB error
    "' OR '1'='1",            # boolean: does the result set widen?
    "1' AND SLEEP(5)-- -",    # blind/time-based: does it stall?
]

XSS_PROBES = [
    "<script>__probe()</script>",
    "\\"><svg onload=__probe()>",  # break out of an attribute context
]`}</CodeBlock>
      <p>
        <strong>XSS</strong> is the opposite: you send a marked payload and check
        whether it comes back <em>unescaped</em> in the response, landing in a
        context (raw HTML, an attribute, a script block) where a browser would
        execute it. Reflected verbatim means the app didn&apos;t encode it, which
        means a browser won&apos;t either.
      </p>
      <Callout>
        The payload list is the easy 10%. Deciding a vulnerability actually fired —
        distinguishing a real DB error from a generic 500, a reflected script from
        a harmlessly-escaped one — is the 90% that makes a scanner trustworthy
        instead of a false-positive cannon.
      </Callout>

      <h2>4. Classify severity so a human knows where to look</h2>
      <p>
        A scanner that emits 400 undifferentiated &quot;findings&quot; is worse
        than useless — it trains people to ignore it. Every confirmed issue gets
        sorted into a severity tier, Low through Critical, from the class of flaw
        and where it sits. A blind SQL injection on an auth-adjacent endpoint is
        Critical; a reflected XSS behind three logins is not. That ranking is what
        lets someone triage the report top-down and fix what matters first.
      </p>
      <p>
        In CivicShield this fed the same severity model the rest of the platform
        used to color its dashboard — the scanner&apos;s output was just another
        stream of classified events, sitting next to the live threat feed. A
        finding wasn&apos;t a log line; it was a ranked, actionable item.
      </p>

      <h2>The mindset that made it work</h2>
      <p>
        Building an offensive tool changes how you write defensive code, because
        you internalize where the inputs really are. They&apos;re not just the form
        fields — they&apos;re the query params, the JSON body keys, the header
        values, and the endpoints you forgot you shipped inside a JavaScript
        bundle. That&apos;s the whole thesis I build under now: assume every one of
        them is hostile, validate at the boundary, and encode on the way out.
      </p>
      <p>
        The scanner and the secure app are the same knowledge pointed in opposite
        directions. Writing the attacker taught me the defender&apos;s checklist
        better than any checklist could.
      </p>
      <Callout>
        Only ever run tooling like this against systems you own or are explicitly
        authorized to test. The techniques are for finding your own holes before
        someone else does — not for poking at someone else&apos;s site.
      </Callout>
    </>
  );
}
