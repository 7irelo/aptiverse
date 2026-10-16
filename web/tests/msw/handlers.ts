import { http, HttpResponse } from "msw";

import faqs from "../fixtures/faqs.json";

export const API_URL = "http://api.test";

export const handlers = [
  http.get(`${API_URL}/support/faqs`, () => HttpResponse.json(faqs)),
];
