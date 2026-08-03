/**
 * Sanity connection, from env with a fallback to the real values.
 *
 * The fallback is deliberate: the dataset is public and read-only, so a missing
 * env var should not break a build. Setting them lets a preview deployment
 * point at a different dataset without a code change.
 */
export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "k8n4gdum";

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-01-01";
