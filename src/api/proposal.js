import { api, formApi, customApi } from "./axios";

export const getProposals = () =>
  customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get("/proposals");

export const getUsers = () =>
  customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get("/users");

export const getDosens = () =>
  customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get("/dosen");

export const getStudents = () =>
  customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get("/students");

export const uploadProposalFile = (formData) => {
  return formApi.post("/proposals/upload-file", formData);
};

export const createProposal = (data) =>
  api.post("/proposals/without-file", data);

export const updateProposal = (data) => api.post("/proposals/update", data);

export const deleteProposal = (id) => api.delete(`/proposals/${id}`);
