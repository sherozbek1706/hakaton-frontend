export const ADMIN_SECRET_PATH =
  process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH || "vault-hq-9x4k7m2p8q5w";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";

export function adminPath(subpath = "") {
  const cleanSub = subpath.replace(/^\/+/, "");
  return cleanSub ? `/${ADMIN_SECRET_PATH}/${cleanSub}` : `/${ADMIN_SECRET_PATH}`;
}
