/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from "./http";

export const mutator = async <T>(
  url: string,
  options: any = {},
): Promise<T> => {
  const method = (options.method ?? "GET").toUpperCase();

  const res = await http.request({
    url,
    method,
    headers: options.headers,
    params: options.params,
    data: options.body ?? options.data,
    withCredentials: true,
  });

  // ✅ Orval-generated функции ожидают именно такой объект
  return {
    data: res.data,
    status: res.status,
    headers: res.headers,
  } as T;
};
