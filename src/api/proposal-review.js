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
