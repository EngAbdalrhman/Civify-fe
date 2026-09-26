import { addIntegration, replayIntegration } from "@sentry/nextjs";

/** Split recording out of the initial error-monitoring bundle. */
export function startReplay() {
  addIntegration(replayIntegration());
}
