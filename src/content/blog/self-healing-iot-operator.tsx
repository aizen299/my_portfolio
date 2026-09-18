import { CodeBlock, Callout } from "@/components/blog/prose";

export default function Post() {
  return (
    <>
      <p>
        The Self-Healing IoT Fleet started with one question: when an edge device
        dies, how fast can the platform notice and put it back — without a human
        and without doing the wrong thing twice? The answer ended up being two
        detection paths feeding one idempotent Kubernetes operator, and a median
        MTTR of 1332&nbsp;ms across 20 measured failures.
      </p>

      <h2>1. Detect failure two ways</h2>
      <p>
        Fifty simulated devices talk MQTT to a Java 21 gateway. A device that
        crashes cleanly is easy: the broker publishes its <em>Last Will</em>
        message the moment the connection drops. A device that hangs is harder —
        the TCP session can stay open while nothing useful happens. So the gateway
        also tracks a heartbeat per device and declares it dead on timeout. Either
        path emits the same failure event onto Kafka, and history lands in a
        time-series store.
      </p>

      <h2>2. Recover exactly once</h2>
      <p>
        Two detection paths means duplicate failure events are normal, not an edge
        case. The operator can&apos;t trust itself to dedupe in memory — it can
        restart mid-recovery. Instead each recovery gets a deterministic id, and
        the Kubernetes API server enforces uniqueness for us:
      </p>
      <CodeBlock label="idempotent recovery id">{`// Same failure → same id → the second create is rejected by the API server.
String recoveryId = sha256(deviceId + ":" + failureEpoch).substring(0, 16);
pod.getMetadata().getLabels().put("recovery-id", recoveryId);`}</CodeBlock>
      <Callout>
        Let the system of record enforce idempotency. An in-memory set works until
        the process that owns it is the thing that crashed.
      </Callout>

      <h2>3. Measure it</h2>
      <p>
        &ldquo;Self-healing&rdquo; is a claim until you time it. Across 20 injected
        failures the operator recovered 20/20, with a median MTTR of 1332&nbsp;ms —
        backed by 279 tests across 5 Maven modules so the recovery path stays
        honest as the code changes.
      </p>
    </>
  );
}
