import { api, customApi } from "./axios";

export const getFaculties = () =>
  customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get("/faculties");

export const createFaculty = (data) => api.post("/faculties", data);

export const updateFaculty = (data) => api.put("/faculties", data);

export const deleteFaculty = (id) => api.delete(`/faculties/${id}`);
