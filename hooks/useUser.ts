/**
 * useUser — re-exports from UserProvider context.
 *
 * All 13+ components that import { useUser } from "@/hooks/useUser"
 * continue to work without any changes. The actual auth subscription now
 * lives in providers/UserProvider.tsx (one subscription for the whole app)
 * instead of inside each hook instance (was 13 subscriptions → 401 cascade).
 */
export { useUser, type AppUser, type AppRole } from "@/providers/UserProvider";
