import axios from "axios";

export const http = axios.create({
  baseURL: "/api-backend",
  withCredentials: true,
});
