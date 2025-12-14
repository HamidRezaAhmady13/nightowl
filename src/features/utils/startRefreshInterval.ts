import { doRefresh } from "../lib/api";

let refreshIntervalId: number | null = null;

export function startRefreshInterval() {
  if (refreshIntervalId) clearInterval(refreshIntervalId);
  refreshIntervalId = window.setInterval(
    () => {
      // proactively call /auth/refresh before expiry
      doRefresh().catch(() => {
        clearInterval(refreshIntervalId!);
        refreshIntervalId = null;
        // optional: redirect to login
      });
      console.log(refreshIntervalId);
    },

    1000 * 60 * 10
  );
}

export function clearRefreshInterval() {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
}
