import axios from "axios";

const api = axios.create({
  baseURL: "http://100.120.71.76:4000/api", // à modifier
  timeout: 5000,
});

export default api;