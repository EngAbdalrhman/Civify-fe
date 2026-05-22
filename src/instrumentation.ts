import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Install DNS bypass for civify hosts BEFORE Sentry or any other module
    // captures a reference to dns.lookup.
    const { installSsrDispatcher } = await import("./lib/ssr-dispatcher");
    installSsrDispatcher();

    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
