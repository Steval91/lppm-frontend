import { api, formApi } from "./axios";

export const createProposalMonitoring = (data) =>
  formApi.post(`/proposal-monitoring/save-or-upload`, data);

export const researchFacultyHeadApproveProgress = (proposalId) =>
  api.post(`/proposal-monitoring/approve-ketua-fakultas/${proposalId}`);

export const deanApproveProgress = (proposalId) =>
  api.post(`/proposal-monitoring/approve-dekan/${proposalId}`);

export const lppmApproveProgress = (proposalId) =>
  api.post(`/proposal-monitoring/approve-lppm/${proposalId}`);

export const uploadSkPemantauanApi = (proposalId, data) =>
  formApi.post(`/proposal-monitoring/upload-sk-pemantauan/${proposalId}`, data);
