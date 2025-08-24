import axios from "axios";

export const RestClient = axios.create({
  baseURL: "http://127.0.0.1:5050/api",
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token?: string) {
  if (token) {
    RestClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete RestClient.defaults.headers.common.Authorization;
  }
}

export default RestClient;
