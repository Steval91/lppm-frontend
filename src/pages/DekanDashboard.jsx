import React, { useState, useRef, useEffect } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";

const dummyReviewedProposals = [
  {
    id: 1,
    title: "Pengembangan Teknologi Pangan Lokal",
    lecturer: "Dr. Siti Nurjanah",
    status: "Menunggu Persetujuan",
    reviewerDecision: "Terima",
  },
  {
    id: 2,
    title: "Model Ekonomi Digital untuk UMKM",
    lecturer: "Dr. Rudi Santoso",
    status: "Menunggu Persetujuan",
    reviewerDecision: "Revisi",
  },
];

const dummyProgress = [
  {
    id: 101,
    title: "Pengolahan Sampah Organik Desa",
    lecturer: "Dr. Lina Agustina",
    progress: "50%",
    status: "Berjalan",
  },
  {
    id: 102,
    title: "Sistem Cerdas Pendeteksi Banjir",
    lecturer: "Dr. Bima Saputra",
    progress: "100%",
    status: "Selesai",
  },
];

export default function DekanDashboard() {
  const [proposals, setProposals] = useState(dummyReviewedProposals);
  const [monitoring, setMonitoring] = useState(dummyProgress);
  const toast = useRef(null);

  useEffect(() => {
    toast.current.show({
      severity: "info",
      summary: "Notifikasi",
      detail: "2 proposal menunggu persetujuan",
      life: 3000,
    });
  }, []);

  const approveProposal = (id) => {
    toast.current.show({
      severity: "success",
      summary: "Disetujui",
      detail: `Proposal ID ${id} disetujui`,
    });
    setProposals((prev) => prev.filter((p) => p.id !== id));
  };

  const rejectProposal = (id) => {
    toast.current.show({
      severity: "warn",
      summary: "Ditolak",
      detail: `Proposal ID ${id} ditolak`,
    });
    setProposals((prev) => prev.filter((p) => p.id !== id));
  };

  const approvalActions = (rowData) => (
    <>
      <Button
        icon="pi pi-check"
        className="p-button-success mr-2"
        onClick={() => approveProposal(rowData.id)}
      />
      <Button
        icon="pi pi-times"
        className="p-button-danger"
        onClick={() => rejectProposal(rowData.id)}
      />
    </>
  );

  const progressTag = (rowData) => (
    <Tag
      value={rowData.progress}
      severity={rowData.progress === "100%" ? "success" : "info"}
    />
  );
  const statusTag = (rowData) => (
    <Tag
      value={rowData.status}
      severity={rowData.status === "Selesai" ? "success" : "warning"}
    />
  );

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <h2 className="text-xl font-bold mb-4">Dashboard Dekan</h2>

      <TabView>
        <TabPanel header="Persetujuan Proposal">
          <DataTable value={proposals} paginator rows={5}>
            <Column field="title" header="Judul Proposal" />
            <Column field="lecturer" header="Dosen" />
            <Column field="reviewerDecision" header="Keputusan Reviewer" />
            <Column header="Aksi" body={approvalActions} />
          </DataTable>
        </TabPanel>

        <TabPanel header="Monitoring Proposal">
          <DataTable value={monitoring} paginator rows={5}>
            <Column field="title" header="Judul Proposal" />
            <Column field="lecturer" header="Dosen" />
            <Column field="progress" header="Progres" body={progressTag} />
            <Column field="status" header="Status" body={statusTag} />
          </DataTable>
        </TabPanel>
      </TabView>
    </div>
  );
}
