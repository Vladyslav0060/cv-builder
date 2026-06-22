/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from "./http";

// Orval generates absolute URLs (e.g. https://api.render.com/auth/me).
// Axios ignores baseURL when the URL is absolute, so we strip the API origin
// to get a relative path — axios then prepends /api-backend, routing through
// the Next.js proxy and keeping cookies same-origin for Safari ITP.
const API_ORIGIN =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050").replace(
    /\/$/,
    "",
  );

export const mutator = async <T>(
  url: string,
  options: any = {},
): Promise<T> => {
  const method = (options.method ?? "GET").toUpperCase();
  const relativePath = url.startsWith(API_ORIGIN)
    ? url.slice(API_ORIGIN.length)
    : url;

  const res = await http.request({
    url: relativePath,
    method,
    headers: options.headers,
    params: options.params,
    data: options.body ?? options.data,
    withCredentials: true,
  });

  return {
    data: res.data,
    status: res.status,
    headers: res.headers,
  } as T;
};
