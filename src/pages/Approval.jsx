import React, { useState, useRef, useEffect, useMemo } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Tooltip } from "primereact/tooltip";
import { useAuth } from "../contexts/AuthContext";
import { getProposals } from "../api/proposal";
import {
  researchFacultyHeadAcceptProposalApi,
  deanAcceptProposalApi,
  lppmAcceptProposalApi,
  downloadApprovalSheetApi,
} from "../api/proposal-review";

export default function Approval() {
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
        const isResearchFacultyHead = user?.roles?.some(
          (role) => role.name === "KETUA_PENELITIAN_FAKULTAS"
        );
        const isDean = user?.roles?.some((role) => role.name === "DEKAN");
        const isLppm = user?.roles?.some((role) => role.name === "KETUA_LPPM");

        return !!(
          (isResearchFacultyHead || isDean || isLppm) &&
          (p.status === "REVIEW_COMPLETED" ||
            p.status === "WAITING_DEAN_APPROVAL" ||
            p.status === "WAITING_LPPM_APPROVAL" ||
            p.status === "ONGOING")
        );
      })
      .filter(
        (p) =>
          !globalFilter ||
          (p.judul &&
            p.judul.toLowerCase().includes(globalFilter.toLowerCase()))
      );
  }, [proposals, userId, globalFilter]);

  const showDialog = (proposal, mode) => {
    setSelectedProposal(proposal);
    setDialogMode(mode);
    setDialogVisible(true);

    if (mode === "reviewer") {
      setDialogHeader("Pilih Reviewer");
    } else if (mode === "proposal_verification") {
      setDialogHeader("Penilain Proposal");
    } else if (mode === "proposal_detail") {
      setDialogHeader("Detail Proposal");
    }
  };

  const downloadApprovalSheet = async (proposalId) => {
    try {
      const blob = await downloadApprovalSheetApi(proposalId);

      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "approval_sheet.pdf"); // nama file
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // optional cleanup
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

  const renderDialogContent = () => {
    if (!selectedProposal) return null;

    if (dialogMode === "proposal_detail") {
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
            {selectedProposal.fileUrl ? (
              <iframe
                src={selectedProposal.fileUrl}
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
    if (dialogMode === "proposal_detail") {
      return (
        <>
          <div className="flex gap-1 justify-end mt-3">
            <Button
              label="Tutup"
              icon="pi pi-times"
              onClick={() => setDialogVisible(false)}
              className="p-button-text"
            />
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
      <h2 className="text-2xl font-bold mb-5">Persetujuan</h2>

      <DataTable
        value={filteredProposals}
        paginator
        rows={10}
        dataKey="id"
        globalFilter={globalFilter}
        emptyMessage="Tidak ada proposal."
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
            return (
              <div className="flex gap-2 text-right">
                <Tooltip />
                <Button
                  icon="pi pi-eye"
                  className="p-button-outlined p-button-sm"
                  onClick={() => showDialog(row, "proposal_detail")}
                  tooltip="Lihat Detail Proposal"
                  tooltipOptions={{ position: "top" }}
                />
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
