import { api, customApi } from "./axios";

export const getProposalReviews = () =>
  customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get(`/proposal-review`);

export const getProposalReviewsByReviewerId = (reviewerId) =>
  customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get(`/proposal-review/reviewer/${reviewerId}`);

export const createProposalReview = (data) =>
  api.post("/proposal-review/form-evaluation", data);

export const reviewerAcceptProposalReviewApi = (proposalId, reviewerId) =>
  customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get(`/proposal-review/${proposalId}/reviewer/${reviewerId}/accept`);

export const reviewerRejectProposalReviewApi = (proposalId, reviewerId) =>
  customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get(`/proposal-review/${proposalId}/reviewer/${reviewerId}/reject`);

export const chooseReviewerApi = (proposalId, data) =>
  api.post(`/proposal-review/${proposalId}/add-reviewer`, data);

export const researchFacultyHeadAcceptProposalApi = (data) =>
  api.post(`/proposal-review/proposal-accepted`, data);

export const deanAcceptProposalApi = (proposalId) =>
  customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get(`/proposal-review/dean-approve/${proposalId}`);

export const lppmAcceptProposalApi = (proposalId) =>
  customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get(`/proposal-review/lppm-approve/${proposalId}`);

export const downloadApprovalSheetApi = async (proposalId) => {
  const response = await customApi({
    "ngrok-skip-browser-warning": "any-value",
  }).get(`/proposal-review/download-approval-sheet/${proposalId}`, {
    responseType: "blob", // ⚠️ penting untuk file
  });

  return response.data; // Mengembalikan data blob
};
