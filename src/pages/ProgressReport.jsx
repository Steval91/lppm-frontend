import React, { useState, useRef, useEffect, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { FileUpload } from "primereact/fileupload";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Tooltip } from "primereact/tooltip";
import { useAuth } from "../contexts/AuthContext";
import { getProposalByProposalId, getProposals } from "../api/proposal";
import { downloadApprovalSheetApi } from "../api/proposal-review";
import { downloadFile } from "../utils/downloadFile";
import {
  createProposalMonitoring,
  deanApproveProgress,
  lppmApproveProgress,
  researchFacultyHeadApproveProgress,
  uploadSkPemantauanApi,
} from "../api/proposal-monitoring";
import { Calendar } from "primereact/calendar";
import { formatYear } from "../utils/date";
import { formatRupiah } from "../utils/currency";
import { validateWithZod } from "../utils/validation";
import { progressReportSchema } from "../validationSchemas/progressReportSchema";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

export default function ProgressReport() {
  const toast = useRef(null);

  const { user, fetchNotifications } = useAuth();
  const userId = user?.id;

  const [proposals, setProposals] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState(null); // 'reviewer' or 'proposal'
  const [dialogHeader, setDialogHeader] = useState(null); // 'reviewer' or 'proposal'
  const [fileDialogVisible, setFileDialogVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [progressReportForm, setProgressReportForm] = useState({
    tahunPelaksanaan: "",
    biayaTahunBerjalan: null,
    biayaKeseluruhan: null,
    fileLaporanProgress: null,
  });
  const [skPemantauan, setSkPemantauan] = useState(null);

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
      .filter((p) => p.status === "ONGOING")
      .filter((p) => {
        // 1) user adalah ketua peneliti
        if (p.ketuaPeneliti.id === userId) return true;

        // 2) user ada di proposalMember
        if (p.proposalMember.some((pm) => pm.user.id === userId)) return true;

        // 3) user ada di proposalReviewer
        if (p.proposalReviewer.some((pm) => pm.reviewer.id === userId))
          return true;

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

  const showDialog = async (proposal, mode) => {
    if (mode === "proposal_verification") {
      setDialogHeader("Penilain Proposal");
    } else if (mode === "proposal_detail") {
      try {
        const res = await getProposalByProposalId(proposal.id);
        const data = res.data;

        proposal.fileBase64 = data.fileBase64;
      } catch (error) {
        console.error("Gagal fetch users:", error);
      }
      setDialogHeader("Detail Proposal");
    } else if (mode === "progress_report") {
      setDialogHeader("Laporan Progres");
    } else if (mode === "upload_sk_pemantauan") {
      setDialogHeader("Upload SK Pemantauan");
    }

    setSelectedProposal(proposal);
    setDialogMode(mode);
    setDialogVisible(true);
  };

  const downloadApprovalSheet = async (proposalId) => {
    try {
      const blob = await downloadApprovalSheetApi(proposalId);

      downloadFile(blob, "approval_sheet.pdf", "application/pdf");
    } catch (error) {
      console.error("Gagal download lembar pengesahan:", error);
    }
  };

  const confirmApproveProgress = (proposalId, approvedBy) => {
    confirmDialog({
      message: `Anda yakin ingin menyetujui laporan progress ini?`,
      header: "Konfirmasi",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Tidak",
      accept: () => approveProgressBy(proposalId, approvedBy),
    });
  };

  const approveProgressBy = async (proposalId, approvedBy) => {
    try {
      if (approvedBy == "KETUA_PENELITIAN_FAKULTAS") {
        await researchFacultyHeadApproveProgress(proposalId);
      } else if (approvedBy == "DEKAN") {
        await deanApproveProgress(proposalId);
      } else if (approvedBy == "KETUA_LPPM") {
        await lppmApproveProgress(proposalId);
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

  const saveProgressReport = async (proposalId) => {
    const isValid = validateWithZod(
      progressReportSchema,
      progressReportForm,
      setErrors
    );
    if (!isValid) return;

    try {
      const formData = new FormData();
      formData.append("file", progressReportForm.fileLaporanProgress?.[0]); // Perbaikan di sini
      formData.append("proposalId", proposalId);
      formData.append(
        "tahunPelaksanaan",
        formatYear(progressReportForm.tahunPelaksanaan)
      );
      formData.append(
        "biayaTahunBerjalan",
        progressReportForm.biayaTahunBerjalan
      );
      formData.append("biayaKeseluruhan", progressReportForm.biayaKeseluruhan);

      await createProposalMonitoring(formData);

      toast.current.show({
        severity: "success",
        summary: "Diterima",
        detail: "Proposal disetujui",
      });

      fetchProposals();
      fetchNotifications(userId);
      setDialogVisible(false);
      setProgressReportForm({
        tahunPelaksanaan: "",
        biayaTahunBerjalan: 0,
        biayaKeseluruhan: 0,
      });
    } catch (error) {
      console.error("Gagal menyetujui proposal:", error);
    }
  };

  const uploadSkPemantauan = async (proposalId) => {
    if (!skPemantauan || skPemantauan.length === 0) {
      setErrors({ fileLaporanProgress: "File wajib diunggah" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", skPemantauan?.[0]); // Perbaikan di sini

      await uploadSkPemantauanApi(proposalId, formData);

      toast.current.show({
        severity: "success",
        summary: "Diterima",
        detail: "Proposal disetujui",
      });

      fetchProposals();
      fetchNotifications(userId);
      setDialogVisible(false);
      setProgressReportForm({
        tahunPelaksanaan: "",
        biayaTahunBerjalan: 0,
        biayaKeseluruhan: 0,
      });
    } catch (error) {
      console.error("Gagal menyetujui proposal:", error);
    }
  };

  const renderDialogContent = () => {
    if (!selectedProposal) return null;

    if (dialogMode === "progress_report") {
      return (
        <div className="p-fluid">
          <div className="mb-3">
            <label>Tahun Pelaksanaan</label>
            <Calendar
              value={progressReportForm.tahunPelaksanaan}
              onChange={(e) =>
                setProgressReportForm({
                  ...progressReportForm,
                  tahunPelaksanaan: e.target.value,
                })
              }
              view="year"
              dateFormat="yy"
            />
            {errors.tahunPelaksanaan && (
              <small className="p-error">{errors.tahunPelaksanaan}</small>
            )}
          </div>

          <div className="mb-3">
            <label>Biaya Tahun Berjalan</label>
            <InputNumber
              value={progressReportForm.biayaTahunBerjalan}
              onValueChange={(e) =>
                setProgressReportForm({
                  ...progressReportForm,
                  biayaTahunBerjalan: e.value || 0,
                })
              }
              className={`w-full ${
                errors.biayaTahunBerjalan ? "p-invalid" : ""
              }`}
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
            {errors.biayaTahunBerjalan && (
              <small className="p-error">{errors.biayaTahunBerjalan}</small>
            )}
          </div>

          <div className="mb-3">
            <label>Biaya Keseluruhan</label>
            <InputNumber
              value={progressReportForm.biayaKeseluruhan}
              onValueChange={(e) =>
                setProgressReportForm({
                  ...progressReportForm,
                  biayaKeseluruhan: e.value || 0,
                })
              }
              className={`w-full ${errors.biayaKeseluruhan ? "p-invalid" : ""}`}
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
            {errors.biayaKeseluruhan && (
              <small className="p-error">{errors.biayaKeseluruhan}</small>
            )}
          </div>

          <div>
            <label>File Laporan</label>
            <FileUpload
              name="proposal"
              customUpload
              uploadHandler={(e) => {
                // Simpan file sebagai array
                setProgressReportForm((prevForm) => ({
                  ...prevForm,
                  fileLaporanProgress: e.files, // Simpan sebagai array
                }));
              }}
              auto
              accept="application/pdf"
              chooseLabel="Pilih File"
              className={errors?.fileLaporanProgress ? "p-invalid" : ""}
            />
            {errors?.fileLaporanProgress && (
              <small className="p-error">{errors.fileLaporanProgress}</small>
            )}
          </div>
        </div>
      );
    } else if (dialogMode === "upload_sk_pemantauan") {
      return (
        <div className="p-fluid">
          <div>
            <label>File Laporan</label>
            <FileUpload
              name="proposal"
              customUpload
              uploadHandler={(e) => {
                setSkPemantauan(e.files);
              }}
              auto
              accept="application/pdf"
              chooseLabel="Pilih File"
              className={errors?.fileLaporanProgress ? "p-invalid" : ""}
            />
            {errors?.fileLaporanProgress && (
              <small className="p-error">{errors.fileLaporanProgress}</small>
            )}
          </div>
        </div>
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
              Dana: {formatRupiah(selectedProposal.danaYangDiUsulkan) || "-"}
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
                  {selectedProposal.proposalReviewer
                    .filter((pr) => pr.status !== "REJECTED")
                    .map((pr, index) => {
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
    if (dialogMode === "progress_report") {
      return (
        <>
          <Button
            label="Batal"
            icon="pi pi-times"
            onClick={() => {
              setProgressReportForm({
                tahunPelaksanaan: "",
                biayaTahunBerjalan: null,
                biayaKeseluruhan: null,
                fileLaporanProgress: null,
              });
              setDialogVisible(false);
            }}
            className="p-button-text"
          />
          <Button
            label="Simpan"
            icon="pi pi-check"
            onClick={() => saveProgressReport(selectedProposal.id)}
            autoFocus
          />
        </>
      );
    } else if (dialogMode === "upload_sk_pemantauan") {
      return (
        <>
          <Button
            label="Batal"
            icon="pi pi-times"
            onClick={() => {
              setSkPemantauan(null);
              setDialogVisible(false);
            }}
            className="p-button-text"
          />
          <Button
            label="Simpan"
            icon="pi pi-check"
            onClick={() => uploadSkPemantauan(selectedProposal.id)}
            autoFocus
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
          </div>
        </>
      );
    }
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />
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
                .filter((pr) => pr.status !== "REJECTED")
                .map((pm) => pm.reviewer.dosen?.name)
                .join(", ")}
            </span>
          )}
        />
        <Column
          field="danaYangDiUsulkan"
          header="Dana"
          body={(row) => formatRupiah(row.danaYangDiUsulkan)}
        />
        <Column field="status" header="Status Proposal" />
        <Column
          field="reportProgressStatus"
          header="Status Laporan Progres"
          body={(row) => row.reportApprovalFlow?.status}
        />
        <Column
          headerStyle={{ textAlign: "right" }}
          body={(row) => {
            const isResearchFacultyHead = user?.roles?.some(
              (role) => role.name === "KETUA_PENELITIAN_FAKULTAS"
            );

            const isDean = user?.roles?.some((role) => role.name === "DEKAN");

            const isLppm = user?.roles?.some(
              (role) => role.name === "KETUA_LPPM"
            );

            return (
              <div className="flex gap-2 text-right">
                <Button
                  icon="pi pi-eye"
                  className="p-button-outlined p-button-sm"
                  onClick={() => showDialog(row, "proposal_detail")}
                  tooltip="Lihat Detail Proposal"
                  tooltipOptions={{ position: "top" }}
                />
                {row.status === "ONGOING" &&
                  row.ketuaPeneliti.id === userId &&
                  row.reportApprovalFlow?.status === null && (
                    <Button
                      icon="pi pi-pencil"
                      className="p-button-warning p-button-sm"
                      onClick={() => showDialog(row, "progress_report")}
                      tooltip="Buat Laporan Progres"
                      tooltipOptions={{ position: "top" }}
                    />
                  )}
                {row.status === "ONGOING" &&
                  isResearchFacultyHead &&
                  row.reportApprovalFlow?.status ===
                    "LAPORAN_DIUPLOAD_KETUA_PENELITI" && (
                    <Button
                      icon="pi pi-check"
                      className="p-button-success p-button-sm"
                      onClick={() => {
                        confirmApproveProgress(
                          row.id,
                          "KETUA_PENELITIAN_FAKULTAS"
                        );
                      }}
                      tooltip="Approve Laporan Progres"
                      tooltipOptions={{ position: "top" }}
                    />
                  )}
                {row.status === "ONGOING" &&
                  isDean &&
                  row.reportApprovalFlow?.status ===
                    "DISETUJUI_KETUA_PENELITIAN_FAKULTAS" && (
                    <Button
                      icon="pi pi-check"
                      className="p-button-success p-button-sm"
                      onClick={() => {
                        confirmApproveProgress(row.id, "DEKAN");
                      }}
                      tooltip="Approve Laporan Progres"
                      tooltipOptions={{ position: "top" }}
                    />
                  )}
                {row.status === "ONGOING" &&
                  isLppm &&
                  row.reportApprovalFlow?.status === "DISETUJUI_DEKAN" && (
                    <Button
                      icon="pi pi-check"
                      className="p-button-success p-button-sm"
                      onClick={() => {
                        confirmApproveProgress(row.id, "KETUA_LPPM");
                      }}
                      tooltip="Approve Laporan Progres"
                      tooltipOptions={{ position: "top" }}
                    />
                  )}
                {row.status === "ONGOING" &&
                  isLppm &&
                  row.reportApprovalFlow?.status === "DISETUJUI_KETUA_LPPM" && (
                    <Button
                      icon="pi pi-upload"
                      className="p-button-default p-button-sm"
                      onClick={() => {
                        showDialog(row, "upload_sk_pemantauan");
                      }}
                      tooltip="Unggah SK Pemantauan"
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
