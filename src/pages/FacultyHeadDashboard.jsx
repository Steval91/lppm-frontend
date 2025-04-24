import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";

const dummyProposals = [
  {
    id: 1,
    title: "Analisis Dampak Sosial di Daerah X",
    lecturer: "Dr. Siti Nurhaliza",
    status: "Menunggu Verifikasi",
    progress: "Belum Mulai",
  },
  {
    id: 2,
    title: "Model AI untuk Prediksi Banjir",
    lecturer: "Prof. Budi Santoso",
    status: "Sedang Diverifikasi",
    progress: "30%",
  },
];

export default function FacultyHeadDashboard() {
  const [proposals, setProposals] = useState(dummyProposals);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [initialComment, setInitialComment] = useState("");
  const toast = React.useRef(null);

  useEffect(() => {
    toast.current.show({
      severity: "info",
      summary: "Notifikasi",
      detail: "1 Proposal baru masuk",
      life: 3000,
    });
  }, []);

  const actionTemplate = (rowData) => (
    <Button
      label="Verifikasi"
      icon="pi pi-eye"
      onClick={() => openDialog(rowData)}
    />
  );

  const statusTemplate = (rowData) => (
    <Tag
      severity={rowData.status === "Menunggu Verifikasi" ? "warning" : "info"}
      value={rowData.status}
    />
  );

  const openDialog = (proposal) => {
    setSelectedProposal(proposal);
    setDialogVisible(true);
    setInitialComment("");
  };

  const handleSave = () => {
    toast.current.show({
      severity: "success",
      summary: "Disimpan",
      detail: "Komentar & rekomendasi berhasil disimpan",
    });
    setDialogVisible(false);
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <h2 className="mb-4 text-xl font-semibold">Proposal Dosen Fakultas</h2>

      <DataTable value={proposals} paginator rows={5}>
        <Column field="title" header="Judul Proposal" sortable />
        <Column field="lecturer" header="Dosen" />
        <Column field="status" header="Status" body={statusTemplate} />
        <Column field="progress" header="Progress" />
        <Column header="Aksi" body={actionTemplate} />
      </DataTable>

      <Dialog
        header="Verifikasi Proposal"
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: "50vw" }}
      >
        {selectedProposal && (
          <>
            <p>
              <strong>Judul:</strong> {selectedProposal.title}
            </p>
            <p>
              <strong>Dosen:</strong> {selectedProposal.lecturer}
            </p>

            <label className="block mt-3 mb-1 font-medium">Komentar Awal</label>
            <InputTextarea
              value={initialComment}
              onChange={(e) => setInitialComment(e.target.value)}
              rows={4}
              className="w-full"
            />

            <label className="block mt-4 mb-1 font-medium">
              Upload Rekomendasi Fakultas (PDF)
            </label>
            <FileUpload
              name="rekomendasi"
              accept="application/pdf"
              mode="basic"
              chooseLabel="Pilih File"
            />

            <Button
              label="Simpan & Lanjutkan"
              icon="pi pi-check"
              className="mt-4"
              onClick={handleSave}
            />
          </>
        )}
      </Dialog>
    </div>
  );
}
