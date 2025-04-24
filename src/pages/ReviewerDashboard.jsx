import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

const dummyReviews = [
  {
    id: 1,
    title: "Analisis Ketahanan Pangan Lokal",
    lecturer: "Dr. Dian Wulandari",
    status: "Perlu Direview",
  },
  {
    id: 2,
    title: "Strategi Digitalisasi UMKM",
    lecturer: "Dr. Rizal Hakim",
    status: "Sedang Dinilai",
  },
];

const decisionOptions = [
  { label: "Revisi", value: "Revisi" },
  { label: "Terima", value: "Terima" },
  { label: "Tolak", value: "Tolak" },
];

export default function ReviewerDashboard() {
  const [proposals, setProposals] = useState(dummyReviews);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [decision, setDecision] = useState(null);
  const toast = useRef(null);

  useEffect(() => {
    toast.current.show({
      severity: "info",
      summary: "Notifikasi",
      detail: "Ada 1 proposal baru untuk direview",
      life: 3000,
    });
  }, []);

  const openReviewDialog = (proposal) => {
    setSelectedProposal(proposal);
    setScore(0);
    setComment("");
    setDecision(null);
    setDialogVisible(true);
  };

  const handleSubmitReview = () => {
    toast.current.show({
      severity: "success",
      summary: "Berhasil",
      detail: "Penilaian berhasil disimpan",
    });
    setDialogVisible(false);
  };

  const actionTemplate = (rowData) => (
    <Button
      label="Nilai"
      icon="pi pi-pencil"
      onClick={() => openReviewDialog(rowData)}
    />
  );

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <h2 className="text-xl font-semibold mb-4">
        Daftar Proposal untuk Direview
      </h2>

      <DataTable value={proposals} paginator rows={5}>
        <Column field="title" header="Judul Proposal" />
        <Column field="lecturer" header="Dosen" />
        <Column field="status" header="Status" />
        <Column header="Aksi" body={actionTemplate} />
      </DataTable>

      <Dialog
        header="Form Penilaian Proposal"
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

            <label className="block mt-3 mb-1 font-medium">Komentar</label>
            <InputTextarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full"
            />

            <label className="block mt-4 mb-1 font-medium">Nilai (0-100)</label>
            <InputNumber
              value={score}
              onValueChange={(e) => setScore(e.value)}
              showButtons
              min={0}
              max={100}
              className="w-full"
            />

            <label className="block mt-4 mb-1 font-medium">Keputusan</label>
            <Dropdown
              value={decision}
              options={decisionOptions}
              onChange={(e) => setDecision(e.value)}
              placeholder="Pilih"
              className="w-full"
            />

            <Button
              label="Simpan Penilaian"
              icon="pi pi-check"
              className="mt-4"
              onClick={handleSubmitReview}
            />
          </>
        )}
      </Dialog>
    </div>
  );
}
