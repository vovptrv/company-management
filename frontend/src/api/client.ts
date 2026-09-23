import axios from "axios";

// Relative base URL: the dev server and nginx both serve the API from the same origin.
const BASE_URL = "/api";

export const apiClient = axios.create({ baseURL: BASE_URL });

/** Sent with every list request, so the page size does not depend on a backend default. */
export const PAGE_SIZE = 10;
