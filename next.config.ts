import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// Makes the Hyperdrive/Queue/Cron bindings available to `next dev` via
// getCloudflareContext(), same as they are in `wrangler dev` / production.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
