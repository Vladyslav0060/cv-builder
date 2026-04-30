"use client";

import { useMe } from "@/hooks/auth/useMe";

export default function Page() {
  const { data } = useMe();
  return <div>{JSON.stringify(data)}</div>;
}
