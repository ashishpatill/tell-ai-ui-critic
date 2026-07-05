/**
 * Next.js instrumentation hook — exports traces to Grafana Cloud Tempo via OTLP.
 *
 * Grafana Cloud setup:
 *   Home → Connections → Add new connection → OpenTelemetry → copy the OTLP endpoint + token.
 *
 * Required env vars (see .env.example):
 *   OTEL_EXPORTER_OTLP_ENDPOINT   https://otlp-gateway-prod-<region>.grafana.net/otlp
 *   OTEL_EXPORTER_OTLP_HEADERS    Authorization=Basic <base64(instanceId:token)>
 *   OTEL_SERVICE_NAME              tell  (default: tell)
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Only instrument when an OTLP endpoint is configured.
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) return;

  const { registerOTel } = await import("@vercel/otel");

  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME ?? "tell",
    attributes: {
      "deployment.environment": process.env.VERCEL_ENV ?? process.env.RENDER_SERVICE_NAME ? "production" : "development",
      "service.version": process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.RENDER_GIT_COMMIT ?? "local",
    },
  });
}
