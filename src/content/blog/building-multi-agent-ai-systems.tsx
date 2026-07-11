import { CodeBlock, Callout } from "@/components/blog/prose";

export default function Post() {
  return (
    <>
      <p>
        &quot;Multi-agent AI&quot; sounds like the hard part is the model. In my
        experience it isn&apos;t. The models are the one component you{" "}
        <em>don&apos;t</em> own — they&apos;re non-deterministic, occasionally
        slow, sometimes down, and never exactly what you tested against. The
        engineering is everything around them: where you draw the service
        boundary, what happens when a model is unreachable, and whether you can
        run your whole test suite without touching a GPU. I&apos;ve built two
        systems that lean on this — an AI-driven HR backend at XtraGrad and a
        four-agent forensic pipeline called TrustSphere — and the lessons were
        the same both times.
      </p>

      <h2>Treat the model as a service, not a library</h2>
      <p>
        The tempting move is to <code>import</code> the model directly into your
        request handlers. It&apos;s fast to write and miserable to live with:
        your API process now owns the model&apos;s memory, its cold starts, and
        its failure modes. On the HR backend I put the entire AI layer behind a
        single client with one contract, so nothing else in the codebase knows
        or cares how inference actually happens.
      </p>
      <CodeBlock label="ai_client.py — one boundary, two backends">{`# Every AI call in the app goes through this client. Callers get a
# plain dict back; they never see whether it came over HTTP or ran
# in-process. That single indirection is what makes the rest testable.
async def score_candidate(payload: dict) -> dict:
    if settings.AI_SERVICE_ENABLED:
        # Remote inference microservice owned by the AI team.
        return await _post(settings.AI_SERVICE_URL, "/score", payload)
    # Local fallback — richer default services, no network needed.
    return await _local.score_candidate(payload)`}</CodeBlock>
      <p>
        The flag matters more than it looks. In production the AI team&apos;s
        inference service handles scoring; in CI, on my laptop, and any time
        their service is down, the backend falls back to its own local
        implementation and keeps serving. Neither side had to wait on the other
        to make progress, because the boundary — not the model — was the shared
        contract.
      </p>

      <h2>If you can&apos;t mock the model, you can&apos;t test the system</h2>
      <p>
        A system that only works when a live LLM answers is a system you can
        never run in CI. The fix follows straight from the boundary above:
        because every AI call goes through one seam, the tests replace that seam
        with a stub and assert on <em>everything else</em> — routing, auth, data
        models, error handling, the shape of the response.
      </p>
      <p>
        The HR backend&apos;s suite is 39 pytest cases running against in-memory
        SQLite with the AI layer, Redis, and the résumé-parsing step all mocked.
        It runs in seconds, offline, deterministically. What it verifies isn&apos;t
        &quot;is the model good&quot; — that&apos;s a separate evaluation problem
        — but &quot;does the system do the right thing with whatever the model
        returns,&quot; including the malformed and empty cases a real model will
        eventually hand you.
      </p>
      <Callout>
        The question to design for is not &quot;is the model accurate&quot; but
        &quot;what does my system do when the model is wrong, slow, or absent.&quot;
        You can only answer that if the model is mockable — which means it has to
        sit behind a seam you control.
      </Callout>

      <h2>Inference is slow — get it out of the request</h2>
      <p>
        Model calls take seconds, and a user-facing request can&apos;t block on
        them. Both systems push inference onto a Celery queue backed by Redis:
        the API accepts the work, hands back a task id immediately, and the
        client polls for the result. TrustSphere does exactly this — upload
        returns fast, an <code>/analyze</code> call kicks off the pipeline, and a{" "}
        <code>/result</code> endpoint reports progress until the verdict lands.
      </p>
      <CodeBlock label="the async seam">{`# Request thread: enqueue and return, never wait on the model.
task = analyze_evidence.delay(evidence_id)
return {"task_id": task.id, "status": "queued"}

# Worker: the slow, GPU-bound agents run here, off the request path.`}</CodeBlock>
      <p>
        This also gives you a natural place to fan out. In TrustSphere the
        analysis isn&apos;t one model — it&apos;s four agents run in parallel via
        CrewAI, each looking at a different facet of the same file: one on
        metadata, one on the image itself, one on video frames, one on audio.
        Because they&apos;re independent, they run concurrently in the worker
        rather than in a slow chain.
      </p>

      <h2>Make every agent return the same shape</h2>
      <p>
        The thing that keeps a multi-agent system from turning into spaghetti is
        a rigid output contract. Every TrustSphere agent — no matter how
        differently it works inside — returns the same structure:
      </p>
      <CodeBlock label="the agent contract">{`{
  "agent_name": "image",
  "confidence": 0.82,      # 0..1, or null when the agent has no signal
  "findings": [...],        # human-readable evidence
  "heatmap_path": "..."     # optional artifact for the report
}`}</CodeBlock>
      <p>
        With that in place, the decision engine doesn&apos;t need special cases.
        It takes the agents&apos; confidences, applies fixed weights (the visual
        agents count for more than metadata), and produces one verdict —
        authentic, inconclusive, or fake — plus the reasoning behind it. Adding a
        fifth agent later (a provenance/watermark checker) meant writing one more
        component that spoke the same contract and giving it a weight. Nothing
        downstream changed.
      </p>
      <p>
        The subtle part is the <code>null</code> confidence. An agent that has{" "}
        <em>no</em> signal is not the same as an agent that&apos;s{" "}
        <em>confident it&apos;s authentic</em>, and collapsing the two is how you
        get a system that fast-tracks a fake because one agent simply had nothing
        to say. Absence of evidence has to be representable, and the aggregator
        has to treat it as absence, not as a vote.
      </p>

      <h2>What actually breaks</h2>
      <p>The failures were never &quot;the model was a bit inaccurate.&quot; They were:</p>
      <ul>
        <li>
          <strong>The model returned something unparseable</strong> — and code
          that assumed clean JSON threw on a real request. Validate the output
          at the boundary, the same as any other untrusted input.
        </li>
        <li>
          <strong>The service was simply down</strong> — and without a fallback
          the whole feature was down with it. A local default path is cheaper
          than an incident.
        </li>
        <li>
          <strong>Inference blocked a request</strong> until something timed out.
          The queue exists so a slow model degrades latency, not availability.
        </li>
        <li>
          <strong>One agent&apos;s silence was read as a signal.</strong> Make
          &quot;no opinion&quot; a first-class value or the aggregator will
          invent one for it.
        </li>
      </ul>
      <p>
        None of these are model problems. They&apos;re boundary, testability, and
        contract problems — ordinary backend engineering, applied to a component
        that happens to be probabilistic. Get the seams right and the models
        become swappable details. Get them wrong and no amount of model quality
        will save you.
      </p>
    </>
  );
}
