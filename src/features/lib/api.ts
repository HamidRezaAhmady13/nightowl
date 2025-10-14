import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export const API_URL: string = process.env.NEXT_PUBLIC_API_URL || "";
