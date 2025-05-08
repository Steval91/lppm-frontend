import { api, formApi, customApi } from "./axios";

export const getProposals = () =>
  customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get("/proposals");

export const getProposalsByUserId = (userId) =>
  customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get(`/proposals/user/${userId}`);

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

export const updateProposal = (data) => api.put("/proposals/update", data);

export const deleteProposal = (proposalId) =>
  api.delete(`/proposals/${proposalId}`);

export const approveProposalApi = (proposalId, userId) =>
  api.post(`/proposals/${proposalId}/approve-member/${userId}`, userId);

export const rejectProposalApi = (proposalId, userId) =>
  api.post(`/proposals/${proposalId}/reject-member/${userId}`, userId);

export const reviewerApproveProposalApi = (proposalId, userId) =>
  api.post(`/proposals/${proposalId}/approve-member/${userId}`, userId);

export const reviewerRejectProposalApi = (proposalId, userId) =>
  api.post(`/proposals/${proposalId}/reject-member/${userId}`, userId);

export const getProposalReviews = (reviewerId) =>
  api.get(`/proposal-review/reviewer/${reviewerId}`);
