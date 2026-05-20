import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const makeRequest = axios.create({
  baseURL: API,
  withCredentials: true,
});