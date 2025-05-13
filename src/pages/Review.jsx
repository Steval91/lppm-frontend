import React, { useState, useRef, useEffect, useMemo } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload } from "primereact/fileupload";
import { MultiSelect } from "primereact/multiselect";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Tooltip } from "primereact/tooltip";
import { useAuth } from "../contexts/AuthContext";
import { getUsers } from "../api/user";
import { getProposals } from "../api/proposal";
import {
  chooseReviewerApi,
  reviewerAcceptProposalReviewApi,
  reviewerRejectProposalReviewApi,
  createProposalReview,
  researchFacultyHeadAcceptProposalApi,
  deanAcceptProposalApi,
  lppmAcceptProposalApi,
  downloadApprovalSheetApi,
} from "../api/proposal-review";
import { evaluationFormSchema } from "../validationSchemas/proposalEvaluationSchema";
import { z } from "zod";
import { downloadFile } from "../utils/downloadFile";

const initialCriteria = [
  {
    id: 1,
    label: "Kualitas dan relevansi masalah penelitian, tujuan, dan kebaruan",
    field: "nilaiKualitasDanKebaruan",
    weight: 25,
  },
  {
    id: 2,
    label: "Kesesuaian dengan Roadmap Penelitian Fakultas",
    field: "nilaiRoadmap",
    weight: 15,
  },
  {
    id: 3,
    label: "Relevansi Tinjauan Pustaka",
    field: "nilaiTinjauanPustaka",
    weight: 10,
  },
  {
    id: 4,
    label: "Kemutakhiran dan sumber primer tinjauan pustaka",
    field: "nilaiKemutakhiranSumber",
    weight: 5,
  },
  {
    id: 5,
    label: "Kesesuaian metodologi dengan masalah penelitian",
    field: "nilaiMetodologi",
    weight: 20,
  },
  {
    id: 6,
    label: "Kewajaran target capaian luaran",
    field: "nilaiTargetLuaran",
    weight: 10,
  },
  {
    id: 7,
    label: "Kesesuaian kompetensi tim peneliti dan pembagian tugas",
    field: "nilaiKompetensiDanTugas",
    weight: 10,
  },
  {
    id: 8,
    label: "Kesesuaian penulisan proposal dengan panduan",
    field: "nilaiPenulisan",
    weight: 5,
  },
];

export default function Review() {
  const toast = useRef(null);

  const { user, fetchNotifications } = useAuth();
  const userId = user?.id;

  const [proposals, setProposals] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [reviewerOptions, setReviewerOptions] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState(null); // 'reviewer' or 'proposal'
  const [dialogHeader, setDialogHeader] = useState(null); // 'reviewer' or 'proposal'
  const [fileDialogVisible, setFileDialogVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchProposals = async () => {
    try {
      const res = await getProposals();
      setProposals(res.data);
    } catch (error) {
      console.error("Gagal fetch proposal:", error);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const filteredProposals = useMemo(() => {
    return proposals
      .filter((p) => {
        // 1) user adalah ketua peneliti
        if (p.ketuaPeneliti.id === userId) return true;

        // 2) user ada di proposalMember
        if (p.proposalMember.some((pm) => pm.user.id === userId)) return true;

        // 3) user ada di proposalReviewer
        if (p.proposalReviewer.some((pm) => pm.user.id === userId)) return true;

        // 4) user adaalah ketua peneliti fakultas
        if (
          user?.roles?.some((role) => role.name === "KETUA_PENELITIAN_FAKULTAS")
        )
          return true;

        // 5) user adalah dekan
        if (user?.roles?.some((role) => role.name === "DEKAN")) return true;

        // 6) user adalah ketua lppm
        if (user?.roles?.some((role) => role.name === "KETUA_LPPM"))
          return true;

        return false;
      })
      .filter(
        (p) =>
          !globalFilter ||
          (p.judul &&
            p.judul.toLowerCase().includes(globalFilter.toLowerCase()))
      );
  }, [proposals, userId, globalFilter]);

  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        const res = await getUsers();

        if (!selectedProposal) return;

        const ketuaPenelitiId = selectedProposal.ketuaPeneliti.id;
        const anggotaDosenIds = selectedProposal.proposalMember
          .filter((member) => member.roleInProposal === "ANGGOTA_DOSEN")
          .map((member) => member.user.id);

        const filteredReviewers = res.data.filter((user) => {
          const isReviewer = user.roles?.some(
            (role) => role.name === "REVIEWER"
          );
          const isKetuaPeneliti = user.id === ketuaPenelitiId;
          const isAnggotaDosen = anggotaDosenIds.includes(user.id);

          return isReviewer && !isKetuaPeneliti && !isAnggotaDosen;
        });

        setReviewerOptions(
          filteredReviewers.map((reviewer) => ({
            label: reviewer.dosen?.name || reviewer.username,
            value: reviewer.id,
          }))
        );
      } catch (error) {
        console.error("Gagal fetch reviewers:", error);
      }
    };

    if (dialogMode === "reviewer" && selectedProposal) {
      fetchReviewers();
    }
  }, [selectedProposal, dialogMode]);

  const submitReviewers = async () => {
    try {
      console.log("Reviewer IDs:", selectedReviewers);

      await chooseReviewerApi(selectedProposal.id, {
        reviewerIds: selectedReviewers,
      });

      toast.current.show({
        severity: "success",
        summary: "Berhasil",
        detail: "Reviewer telah dipilih",
      });

      setDialogVisible(false);
      fetchProposals(); // Refresh data proposal
      fetchNotifications(userId);
    } catch (error) {
      console.error("Gagal memilih reviewer:", error);
    }
  };

  const showDialog = (proposal, mode) => {
    setSelectedProposal(proposal);
    setDialogMode(mode);
    setDialogVisible(true);

    if (mode === "reviewer") {
      setDialogHeader("Pilih Reviewer");
      setSelectedReviewers([]);
    } else if (mode === "proposal_verification") {
      setDialogHeader("Penilain Proposal");
    } else if (mode === "proposal_detail") {
      setDialogHeader("Detail Proposal");
    }
  };

  const downloadApprovalSheet = async (proposalId) => {
    try {
      const blob = await downloadApprovalSheetApi(proposalId);

      downloadFile(blob, "approval_sheet.pdf", "application/pdf");
    } catch (error) {
      console.error("Gagal download lembar pengesahan:", error);
    }
  };

  const approveProposalBy = async (proposalId, approvedBy) => {
    try {
      console.log("TEST ===>", proposalId, user.id, approvedBy);
      if (approvedBy == "KETUA_PENELITIAN_FAKULTAS") {
        await researchFacultyHeadAcceptProposalApi({
          proposalId: proposalId,
          reviewedById: userId,
          status: "ACCEPTED",
        });
      } else if (approvedBy == "DEKAN") {
        await deanAcceptProposalApi(proposalId);
      } else if (approvedBy == "LPPM") {
        await lppmAcceptProposalApi(proposalId);
      }

      toast.current.show({
        severity: "success",
        summary: "Diterima",
        detail: "Proposal disetujui",
      });

      fetchProposals();
      fetchNotifications(userId);
      setDialogVisible(false);
    } catch (error) {
      console.error("Gagal menyetujui proposal:", error);
    }
  };

  const approveProposal = async (proposalId) => {
    try {
      console.log(proposalId, user.id);
      await reviewerAcceptProposalReviewApi(proposalId, user.id);

      toast.current.show({
        severity: "success",
        summary: "Diterima",
        detail: "Proposal disetujui",
      });

      fetchProposals();
      fetchNotifications(userId);
      setDialogVisible(false);
    } catch (error) {
      console.error("Gagal menyetujui proposal:", error);
    }
  };

  const rejectProposal = async (proposalId) => {
    try {
      console.log(proposalId, user.id);

      await reviewerRejectProposalReviewApi(proposalId, user.id);
      toast.current.show({
        severity: "danger",
        summary: "Ditolak",
        detail: "Proposal ditolak",
      });
      fetchProposals();
      fetchNotifications(userId);
      setDialogVisible(false);
    } catch (error) {
      console.error("Gagal menolak proposal:", error);
    }
  };

  const [form, setForm] = useState({
    proposalId: null,
    reviewerId: null,
    nilaiKualitasDanKebaruan: 0,
    nilaiRoadmap: 0,
    nilaiTinjauanPustaka: 0,
    nilaiKemutakhiranSumber: 0,
    nilaiMetodologi: 0,
    nilaiTargetLuaran: 0,
    nilaiKompetensiDanTugas: 0,
    nilaiPenulisan: 0,
    komentar: "",
  });

  const updateScore = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const updateComment = (value) => {
    setForm({ ...form, komentar: value });
  };

  const calculateWeightedScore = (score, weight) => {
    return (score * weight) / 100; // Karena bobot dalam persentase
  };

  const totalScore = initialCriteria.reduce(
    (total, c) => total + calculateWeightedScore(form[c.field] || 0, c.weight),
    0
  );

  const validateFormWithZod = (data) => {
    try {
      evaluationFormSchema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0];
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
        console.error("Zod error:", formattedErrors);
        return false;
      }
      console.error("Unexpected validation error:", error);
      return false;
    }
  };

  const handleSubmit = async () => {
    const newForm = {
      ...form,
      proposalId: selectedProposal.id,
      reviewerId: userId,
      totalNilai: totalScore.toFixed(2),
    };
    console.log("Submitting form:", newForm);

    if (!validateFormWithZod(newForm)) {
      toast.current.show({
        severity: "error",
        summary: "Validasi Gagal",
        detail: "Periksa kembali formulir Anda",
      });
      return;
    }

    try {
      await createProposalReview(newForm);

      toast.current.show({
        severity: "success",
        summary: "Disimpan",
        detail: "Penilaian proposal telah disimpan",
      });

      fetchNotifications(userId);
      fetchProposals();
      setDialogVisible(false);
    } catch (error) {
      console.error("Gagal simpan proposal:", error);
    }
  };

  const renderDialogContent = () => {
    if (!selectedProposal) return null;

    if (dialogMode === "reviewer") {
      return (
        <div className="p-fluid">
          <div className="field">
            <label>Pilih Reviewer</label>
            <MultiSelect
              value={selectedReviewers}
              options={reviewerOptions}
              onChange={(e) => setSelectedReviewers(e.value)}
              optionLabel="label"
              placeholder="Pilih Reviewer"
              display="chip"
              className="w-full"
            />
          </div>
          <small className="p-error">Pilih maksimal 2 reviewer</small>
        </div>
      );
    } else if (dialogMode === "proposal_verification") {
      return (
        <>
          <div className="mt-4">
            <DataTable
              value={initialCriteria}
              className="p-datatable-sm"
              stripedRows
            >
              <Column
                field="label"
                header="Kriteria"
                style={{ width: "35%" }}
              />
              <Column
                header="Bobot"
                body={(rowData) => `${rowData.weight}%`}
                style={{ width: "15%" }}
                className="text-center"
              />
              <Column
                header="Nilai (0-100)"
                body={(rowData) => (
                  <div className="flex flex-col gap-1">
                    <InputNumber
                      value={form[rowData.field]}
                      onValueChange={(e) =>
                        updateScore(rowData.field, e.value || 0)
                      }
                      mode="decimal"
                      min={0}
                      max={100}
                      showButtons
                      step={5}
                      className={`w-full ${
                        errors[rowData.field] ? "p-invalid" : ""
                      }`}
                    />
                    {errors[rowData.field] && (
                      <small className="p-error">{errors[rowData.field]}</small>
                    )}
                  </div>
                )}
                style={{ width: "20%" }}
              />

              <Column
                header="Nilai * Bobot"
                body={(rowData) => (
                  <span className="font-semibold">
                    {calculateWeightedScore(
                      form[rowData.field] || 0,
                      rowData.weight
                    ).toFixed(2)}
                  </span>
                )}
                style={{ width: "20%" }}
                className="text-right"
              />
            </DataTable>

            <div className="flex justify-between items-center mt-6">
              <div className="text-xl font-bold">
                Total Skor:{" "}
                <span className="text-blue-600">{totalScore.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-5">
              <label className="font-bold block mb-2">Komentar</label>
              <InputTextarea
                value={form.komentar}
                onChange={(e) => updateComment(e.target.value)}
                rows={4}
                className={`w-full ${errors.komentar ? "p-invalid" : ""}`}
                placeholder="Berikan komentar konstruktif untuk proposal ini..."
              />
              {errors.komentar && (
                <small className="p-error">{errors.komentar}</small>
              )}
            </div>
          </div>
        </>
      );
    } else if (dialogMode === "proposal_detail") {
      return (
        <div className="grid grid-cols-2">
          <div className="field">
            <label className="font-bold block mb-1">Judul</label>
            <p>{selectedProposal.judul}</p>
          </div>
          <div className="field">
            <label className="font-bold block mb-1">Ketua Peneliti</label>
            <p>{selectedProposal.ketuaPeneliti?.dosen?.name}</p>
          </div>
          <div className="field mt-3">
            <label className="font-bold block mb-1">Anggota Peneliti</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedProposal.proposalMember
                .filter(
                  (pm) => pm.user.id !== selectedProposal.ketuaPeneliti.id
                )
                .map((pm, index) => {
                  const name =
                    pm.user.userType === "DOSEN_STAFF"
                      ? pm.user.dosen?.name
                      : pm.user.student?.name;
                  const role =
                    pm.roleInProposal === "ANGGOTA_DOSEN"
                      ? "Dosen"
                      : "Mahasiswa";

                  return (
                    <Tag
                      key={index}
                      value={`${name} (${role})`}
                      severity={role === "Dosen" ? "default" : "warning"}
                      className="mr-1 mb-2"
                    />
                  );
                })}
            </div>
          </div>
          <div className="field mt-3">
            <label className="font-bold block mb-1">Mitra</label>
            <p>{selectedProposal.namaMitra || "-"}</p>
            <p className="text-sm text-gray-600">
              {selectedProposal.alamatMitra || "-"}
            </p>
            <p className="text-sm">PIC: {selectedProposal.picMitra || "-"}</p>
          </div>
          <div className="field mt-3">
            <label className="font-bold block mb-1">Pendanaan</label>
            <p>Sumber: {selectedProposal.sumberDana || "-"}</p>
            <p>
              Dana: Rp{" "}
              {selectedProposal.danaYangDiUsulkan?.toLocaleString("id-ID") ||
                "0"}
            </p>
          </div>
          <div className="field mt-3">
            <label className="font-bold block mb-1">Luaran Penelitian</label>
            <p>{selectedProposal.luaranPenelitian || "-"}</p>
          </div>
          <div className="field mt-3">
            <Button
              label="Lihat File Proposal"
              icon="pi pi-file-pdf"
              onClick={() => setFileDialogVisible(true)}
              className="p-button-outlined p-button-secondary"
            />
          </div>

          {selectedProposal.proposalReviewer &&
            selectedProposal.proposalReviewer.length > 0 && (
              <div className="field mt-3">
                <label className="font-bold block mb-1">Reviewer</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedProposal.proposalReviewer.map((pr, index) => {
                    const name = pr.reviewer?.dosen?.name;
                    return (
                      <Tag
                        key={index}
                        value={`${name} `}
                        severity={"info"}
                        className="mr-1 mb-2"
                      />
                    );
                  })}
                </div>
              </div>
            )}

          {selectedProposal.proposalEvaluation &&
            selectedProposal.proposalEvaluation.length > 0 && (
              <div className="mt-5">
                <h3 className="font-bold text-lg mb-3">Penilaian Proposal</h3>

                {selectedProposal.proposalEvaluation.map(
                  (itemEvaluation, index) => {
                    // Cari data reviewer yang sesuai
                    const reviewerData =
                      selectedProposal.proposalReviewer?.find(
                        (reviewer) =>
                          reviewer.reviewer.id === itemEvaluation.reviewer
                      );

                    return (
                      <div
                        key={itemEvaluation.id}
                        className="mb-6 border-b pb-4"
                      >
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="field">
                            <label className="font-bold block mb-1">
                              Reviewer {index + 1}
                            </label>
                            <p>
                              {reviewerData?.reviewer.dosen?.name ||
                                reviewerData?.reviewer.username ||
                                "-"}
                            </p>
                          </div>
                          <div className="field">
                            <label className="font-bold block mb-1">
                              Total Nilai
                            </label>
                            <p>
                              {itemEvaluation.totalNilai?.toFixed(2) || "-"}
                            </p>
                          </div>
                          <div className="field">
                            <label className="font-bold block mb-1">
                              Tanggal Evaluasi
                            </label>
                            <p>
                              {itemEvaluation.tanggalEvaluasi
                                ? itemEvaluation.tanggalEvaluasi
                                : "-"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2">
                          <DataTable
                            value={[
                              {
                                kriteria: "Kualitas dan Kebaruan",
                                nilai: itemEvaluation.nilaiKualitasDanKebaruan,
                              },
                              {
                                kriteria: "Roadmap Penelitian",
                                nilai: itemEvaluation.nilaiRoadmap,
                              },
                              {
                                kriteria: "Tinjauan Pustaka",
                                nilai: itemEvaluation.nilaiTinjauanPustaka,
                              },
                              {
                                kriteria: "Kemutakhiran Sumber",
                                nilai: itemEvaluation.nilaiKemutakhiranSumber,
                              },
                              {
                                kriteria: "Metodologi",
                                nilai: itemEvaluation.nilaiMetodologi,
                              },
                              {
                                kriteria: "Target Luaran",
                                nilai: itemEvaluation.nilaiTargetLuaran,
                              },
                              {
                                kriteria: "Kompetensi dan Tugas",
                                nilai: itemEvaluation.nilaiKompetensiDanTugas,
                              },
                              {
                                kriteria: "Penulisan",
                                nilai: itemEvaluation.nilaiPenulisan,
                              },
                            ]}
                            className="p-datatable-sm"
                          >
                            <Column
                              field="kriteria"
                              header="Kriteria Penilaian"
                            />
                            <Column
                              field="nilai"
                              header="Nilai"
                              body={(rowData) => (
                                <span
                                  className={`font-semibold ${
                                    rowData.nilai >= 80
                                      ? "text-green-600"
                                      : rowData.nilai >= 60
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {rowData.nilai}
                                </span>
                              )}
                            />
                          </DataTable>
                        </div>

                        <div className="mt-4">
                          <label className="font-bold block mb-1">
                            Komentar
                          </label>
                          <div className="p-3 bg-gray-100 rounded">
                            {itemEvaluation.komentar || "-"}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}

                {/* Rata-rata Total Nilai */}
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Rata-rata Total Nilai</span>
                    <span className="font-bold text-lg">
                      {(
                        selectedProposal.proposalEvaluation.reduce(
                          (sum, evalItem) => sum + evalItem.totalNilai,
                          0
                        ) / selectedProposal.proposalEvaluation.length
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          <Dialog
            header={`File Proposal: ${selectedProposal.judul}`}
            visible={fileDialogVisible}
            style={{ width: "80vw", height: "90vh" }}
            onHide={() => setFileDialogVisible(false)}
            maximizable
          >
            {selectedProposal?.fileBase64 ? (
              <iframe
                src={`data:application/pdf;base64,${selectedProposal.fileBase64}`}
                width="100%"
                height="100%"
                style={{ minHeight: "70vh", border: "none" }}
                title="File Proposal"
              />
            ) : (
              <div className="text-center p-4">
                <i className="pi pi-exclamation-triangle mr-2" />
                File proposal tidak tersedia
              </div>
            )}
          </Dialog>
        </div>
      );
    }
  };

  const renderDialogFooter = () => {
    if (dialogMode === "reviewer") {
      return (
        <>
          <Button
            label="Batal"
            icon="pi pi-times"
            onClick={() => setDialogVisible(false)}
            className="p-button-text"
          />
          <Button
            label="Simpan"
            icon="pi pi-check"
            onClick={submitReviewers}
            autoFocus
          />
        </>
      );
    } else if (dialogMode === "proposal_verification") {
      return (
        <>
          <Button
            label="Tutup"
            icon="pi pi-times"
            onClick={() => setDialogVisible(false)}
            className="p-button-text"
          />
          <Button
            label="Submit Penilaian"
            icon="pi pi-check"
            onClick={handleSubmit}
          />
        </>
      );
    } else if (dialogMode === "proposal_detail") {
      return (
        <>
          <div className="flex gap-1 justify-end mt-3">
            <Button
              label="Tutup"
              icon="pi pi-times"
              onClick={() => setDialogVisible(false)}
              className="p-button-text"
            />
            {selectedProposal?.proposalReviewer?.some(
              (pr) => pr.reviewer.id === userId && pr.status === "PENDING"
            ) && (
              <>
                <Button
                  icon="pi pi-check"
                  label="Terima"
                  className="p-button-success mr-2 p-button-small"
                  onClick={() => approveProposal(selectedProposal.id)}
                />
                <Button
                  icon="pi pi-times"
                  label="Tolak"
                  className="p-button-danger p-button-small"
                  onClick={() => rejectProposal(selectedProposal.id)}
                />
              </>
            )}
            {selectedProposal?.status === "REVIEW_COMPLETED" &&
              user?.roles?.some(
                (role) => role.name === "KETUA_PENELITIAN_FAKULTAS"
              ) && (
                <>
                  <Button
                    icon="pi pi-check"
                    label="Terima"
                    className="p-button-success mr-2 p-button-small"
                    onClick={() =>
                      approveProposalBy(
                        selectedProposal.id,
                        "KETUA_PENELITIAN_FAKULTAS"
                      )
                    }
                  />
                </>
              )}
            {selectedProposal?.status === "WAITING_DEAN_APPROVAL" &&
              user?.roles?.some((role) => role.name === "DEKAN") && (
                <>
                  <Button
                    icon="pi pi-check"
                    label="Terima"
                    className="p-button-success mr-2 p-button-small"
                    onClick={() =>
                      approveProposalBy(selectedProposal.id, "DEKAN")
                    }
                  />
                </>
              )}
            {user?.roles?.some((role) => role.name === "KETUA_LPPM") && (
              <>
                <Button
                  icon="pi pi-download"
                  label="Download Lembar Pengesahan"
                  className="p-button-default mr-2 p-button-small"
                  onClick={() => {
                    downloadApprovalSheet(selectedProposal.id);
                  }}
                />
              </>
            )}
            {selectedProposal?.status === "WAITING_LPPM_APPROVAL" &&
              user?.roles?.some((role) => role.name === "KETUA_LPPM") && (
                <>
                  <Button
                    icon="pi pi-check"
                    label="Terima"
                    className="p-button-success mr-2 p-button-small"
                    onClick={() =>
                      approveProposalBy(selectedProposal.id, "LPPM")
                    }
                  />
                </>
              )}
          </div>
        </>
      );
    }
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <h2 className="text-2xl font-bold mb-5">Review</h2>

      <DataTable
        value={filteredProposals}
        paginator
        rows={10}
        dataKey="id"
        globalFilter={globalFilter}
        emptyMessage="Tidak ada proposal ditemukan"
        header={
          <div className="flex justify-content-end">
            <IconField iconPosition="left">
              <InputIcon className="pi pi-search" />
              <InputText
                placeholder="Cari proposal..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                size="small"
              />
            </IconField>
          </div>
        }
      >
        <Column field="judul" header="Judul" sortable />
        <Column
          field="ketuaPeneliti.dosen.name"
          header="Ketua Peneliti"
          sortable
        />
        <Column
          field="proposalMember"
          header="Anggota Peneliti"
          sortable
          body={(row) => (
            <span>
              {row.proposalMember
                .filter((pm) => pm.user.id !== row.ketuaPeneliti.id)
                .map((pm) =>
                  pm.user.userType === "DOSEN_STAFF"
                    ? pm.user.dosen?.name
                    : `${pm.user.student?.name} (Mahasiswa)`
                )
                .join(", ")}
            </span>
          )}
        />
        <Column
          field="proposalReviewer"
          header="Reviewer"
          sortable
          body={(row) => (
            <span>
              {row.proposalReviewer
                .map((pm) => pm.reviewer.dosen?.name)
                .join(", ")}
            </span>
          )}
        />
        <Column field="waktuPelaksanaan" header="Waktu Pelaksanaan" sortable />
        <Column
          field="danaYangDiUsulkan"
          header="Dana"
          body={(row) => `Rp ${row.danaYangDiUsulkan?.toLocaleString()}`}
        />
        <Column field="status" header="Status" />
        <Column
          headerStyle={{ textAlign: "right" }}
          body={(row) => {
            const isFacultyHead = user?.roles?.some(
              (role) => role.name === "KETUA_PENELITIAN_FAKULTAS"
            );
            const showChooseReviewer =
              isFacultyHead && row.status === "WAITING_FACULTY_HEAD";

            const isRoleReviewer = user?.roles?.some(
              (role) => role.name === "REVIEWER"
            );
            console.log("===============", row.judul);
            console.log("Role Reviewer: ", isRoleReviewer);
            const isProposalReviewer = row.proposalReviewer.some(
              (r) => r.reviewer.id === userId
            );
            console.log("Proposal Reviewer: ", isProposalReviewer);
            const isProposalEvaluatedByReviewer = row.proposalReviewer.some(
              (r) => r.reviewer.id === userId && r.isEvaluated === false
            );
            console.log("Is Evaluated: ", isProposalEvaluatedByReviewer);

            const showProposalToReview =
              isRoleReviewer &&
              isProposalReviewer &&
              isProposalEvaluatedByReviewer;
            // row.status === "REVIEW_IN_PROGRESS";
            console.log("Show Proposal to Review: ", showProposalToReview);

            return (
              <div className="flex gap-2 text-right">
                <Button
                  icon="pi pi-eye"
                  className="p-button-outlined p-button-sm"
                  onClick={() => showDialog(row, "proposal_detail")}
                  tooltip="Lihat Detail Proposal"
                  tooltipOptions={{ position: "top" }}
                />
                {showChooseReviewer && (
                  <Button
                    icon="pi pi-user-edit"
                    className="p-button-primary p-button-sm"
                    onClick={() => showDialog(row, "reviewer")}
                    tooltip="Pilih Reviewer"
                    tooltipOptions={{ position: "top" }}
                  />
                )}
                {showProposalToReview && (
                  <Button
                    icon="pi pi-pencil"
                    className="p-button-warning p-button-sm"
                    onClick={() => showDialog(row, "proposal_verification")}
                    tooltip="Berikan Penilaian"
                    tooltipOptions={{ position: "top" }}
                  />
                )}
              </div>
            );
          }}
        />
      </DataTable>

      <Dialog
        header={dialogHeader}
        visible={dialogVisible}
        style={{ width: "70vw" }}
        onHide={() => setDialogVisible(false)}
        footer={renderDialogFooter()}
      >
        {renderDialogContent()}
      </Dialog>
    </div>
  );
}
