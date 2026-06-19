const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050";

/**
 * Resolves an avatarUrl stored in the DB to a fully-qualified URL.
 * - Relative paths (e.g. "/user/avatar/:id") → prepend API base URL.
 * - Absolute URLs (Google OAuth photos, custom URLs) → returned as-is.
 * - Null / empty → undefined (so <AvatarImage> is not rendered).
 */
export function resolveAvatarUrl(
  avatarUrl: string | null | undefined,
): string | undefined {
  if (!avatarUrl) return undefined;
  if (avatarUrl.startsWith("/")) return `${API_BASE}${avatarUrl}`;
  return avatarUrl;
}
