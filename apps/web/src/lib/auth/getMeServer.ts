import "server-only";
import { cookies } from "next/headers";
import { getAuthControllerMeUrl } from "@/api/generated";

export async function getMeServer() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
    .join("; ");

  const res = await fetch(getAuthControllerMeUrl(), {
    headers: { cookie: cookieHeader },
    credentials: "include",
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw new Error(`Auth check failed: ${res.status}`);

  const data = await res.json();
  console.log({ data }, { status: res.status });
  return data;
}
