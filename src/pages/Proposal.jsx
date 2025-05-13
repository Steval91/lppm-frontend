import { React, useEffect, useState, useMemo, useRef } from "react";
import {
  getProposals,
  getDosens,
  getStudents,
  uploadProposalFile,
  createProposal,
  updateProposal,
  deleteProposal as deleteProposalApi,
  approveProposalApi,
  rejectProposalApi,
} from "../api/proposal";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { MultiSelect } from "primereact/multiselect";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toolbar } from "primereact/toolbar";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { FileUpload } from "primereact/fileupload";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { useAuth } from "../contexts/AuthContext";
import { proposalSchema } from "../validationSchemas/proposalSchema";
import { z } from "zod";

// Proposal's status options:
// DRAFT,
// WAITING_MEMBER_APPROVAL,
// WAITING_FACULTY_HEAD,
// WAITING_REVIEWER_RESPONSE,
// REVIEW_IN_PROGRESS,
// REVIEW_COMPLETE,
// WAITING_DEAN_APPROVAL,
// APPROVED_BY_DEAN,
// WAITING_LPPM_APPROVAL,
// LPPM_APPROVED,
// ONGOING,
// PROGRESS_REPORT_SUBMITTED,
// PROGRESS_APPROVED,
// FINAL_REPORT_SUBMITTED,
// FINAL_APPROVED_BY_DEAN,
// FINAL_APPROVED_BY_LPPM,
// COMPLETED

const Proposal = () => {
  const toast = useRef(null);

  const { user, loadingUser, fetchNotifications } = useAuth();
  const userId = user?.id;
  const isDosen = user?.roles?.some((role) => role.name === "DOSEN");

  const [proposals, setProposals] = useState([]);
  const [allDosens, setAllDosens] = useState([]);
  const [chiefResearcherOptions, setChiefResearcherOptions] = useState([]);
  const [dosenResearcherOptions, setDosenResearcherOptions] = useState([]);
  const [studentResearcherOptions, setStudentResearcherOptions] = useState([]);
  const [isChiefResearcherChange, setIsChiefResearcherChange] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [fileDialogVisible, setFileDialogVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({
    id: null,
    judul: "",
    waktuPelaksanaan: "",
    sumberDana: "",
    danaYangDiUsulkan: "",
    fileUrl: "",
    luaranPenelitian: "",
    namaMitra: "",
    alamatMitra: "",
    picMitra: "",
    ketuaPeneliti: null,
    proposalMember: [],
    anggotaDosen: [],
    anggotaMahasiswa: [],
    members: [
      { member_type: "MAHASISWA", member_id: "123", status: "PENDING" },
    ],
  });
  const [errors, setErrors] = useState({});
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [proposalDetailDialogVisible, setProposalDetailDialogVisible] =
    useState(false);

  useEffect(() => {
    if (!loadingUser && user) {
      fetchProposals();
    }
  }, [loadingUser, user]);

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
        // 1) user adalah ketua
        if (p.ketuaPeneliti.id === userId) return true;

        // 2) user ada di proposalMember
        if (p.proposalMember.some((pm) => pm.user.id === userId)) return true;

        return false;
      })
      .filter((p) =>
        p.judul.toLowerCase().includes(globalFilter.toLowerCase())
      );
  }, [proposals, userId, globalFilter]);

  const fetchDosens = async () => {
    try {
      const res = await getDosens();
      const data = res.data;

      setAllDosens(data);

      setChiefResearcherOptions(
        data.map((dosen) => ({ label: dosen.name, value: dosen.id }))
      );

      setDosenResearcherOptions(
        data.map((dosen) => ({ label: dosen.name, value: dosen.id }))
      );
    } catch (error) {
      console.error("Gagal fetch users:", error);
    }
  };

  useEffect(() => {
    fetchDosens();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await getStudents();
      const data = res.data;

      setStudentResearcherOptions(
        data.map((student) => ({ label: student.name, value: student.id }))
      );
    } catch (error) {
      console.error("Gagal fetch users:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (form.ketuaPeneliti) {
      setForm((prev) => ({ ...prev, anggotaDosen: [] }));

      const filtered = allDosens
        .filter((dosen) => dosen.id !== form.ketuaPeneliti)
        .map((dosen) => ({ label: dosen.name, value: dosen.id }));

      setDosenResearcherOptions(filtered);

      if (!isChiefResearcherChange) {
        toast.current?.show({
          severity: "warn",
          summary: "Perhatian",
          detail: "Ketua Peneliti berubah. Pilih ulang Anggota Peneliti Dosen.",
          life: 2000,
        });
      } else {
        setIsChiefResearcherChange(false);
      }
    }
  }, [form.ketuaPeneliti]);

  const openDetailProposalDialog = (proposal) => {
    setSelectedProposal(proposal);
    setProposalDetailDialogVisible(true);
  };

  const openAddDialog = () => {
    setIsEditMode(false);
    setForm({
      id: null,
      judul: "",
      waktuPelaksanaan: "",
      sumberDana: "",
      danaYangDiUsulkan: "",
      fileUrl: "",
      luaranPenelitian: "",
      namaMitra: "",
      alamatMitra: "",
      picMitra: "",
      ketuaPeneliti: user.dosen.id,
      proposalMember: [],
      anggotaDosen: [],
      anggotaMahasiswa: [],
      members: [
        { member_type: "MAHASISWA", member_id: "123", status: "PENDING" },
      ],
    });
    setErrors({});
    setDialogVisible(true);
  };

  const openEditDialog = (proposal) => {
    // Filter anggota dosen (exclude ketua peneliti)
    const anggotaDosenIds = proposal.proposalMember
      .filter(
        (member) =>
          member.roleInProposal === "ANGGOTA_DOSEN" &&
          member.user.id !== proposal.ketuaPeneliti.id
      )
      .map((member) => member.user.dosen.id);

    // Filter anggota mahasiswa
    const anggotaMahasiswaIds = proposal.proposalMember
      .filter((member) => member.roleInProposal === "ANGGOTA_MAHASISWA")
      .map((member) => member.user.student.id);

    // Konversi waktuPelaksanaan string ke Date object
    const parseDate = (dateString) => {
      if (!dateString) return null;

      // Format dari API: "5/5/2025" (MM/DD/YYYY atau DD/MM/YYYY)
      const parts = dateString.split("/");
      if (parts.length === 3) {
        // Asumsikan format DD/MM/YYYY
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Bulan di JavaScript dimulai dari 0
        const year = parseInt(parts[2], 10);

        // Pastikan nilai valid
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          return new Date(year, month, day);
        }
      }
      return null;
    };

    setIsEditMode(true);
    setForm({
      id: proposal.id,
      judul: proposal.judul,
      waktuPelaksanaan: parseDate(proposal.waktuPelaksanaan),
      sumberDana: proposal.sumberDana,
      danaYangDiUsulkan: parseInt(proposal.danaYangDiUsulkan),
      fileUrl: proposal.fileUrl,
      luaranPenelitian: proposal.luaranPenelitian,
      namaMitra: proposal.namaMitra,
      alamatMitra: proposal.alamatMitra,
      picMitra: proposal.alamatMitra,
      ketuaPeneliti: proposal.ketuaPeneliti.dosen.id,
      anggotaDosen: anggotaDosenIds,
      anggotaMahasiswa: anggotaMahasiswaIds,
    });
    setErrors({});
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setIsChiefResearcherChange(true);
    setErrors({});
  };

  const validateFormWithZod = (data) => {
    try {
      proposalSchema.parse(data);
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
        return false;
      }
      console.error("Unexpected validation error:", error);
      return false;
    }
  };

  const saveProposal = async () => {
    if (!validateFormWithZod(form)) {
      toast.current.show({
        severity: "error",
        summary: "Validasi Gagal",
        detail: "Periksa kembali formulir Anda",
      });
      return;
    }

    try {
      if (form.waktuPelaksanaan)
        form.waktuPelaksanaan =
          form.waktuPelaksanaan.toLocaleDateString("id-ID");

      console.log(form);
      // return;

      if (isEditMode) {
        await updateProposal(form);
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Proposal diperbarui",
        });
      } else {
        if (form.fileUrl && form.fileUrl.length > 0) {
          const file = form.fileUrl[0];

          const formData = new FormData();
          formData.append("file", file);

          const res = await uploadProposalFile(formData);
          const fileUrl = res.data;
          console.log("File URL:", fileUrl);
          form.fileUrl = fileUrl;
        }

        await createProposal(form);
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Proposal ditambahkan",
        });
      }

      fetchNotifications(userId);
      fetchProposals();
      closeDialog();
    } catch (error) {
      if (error.response?.data?.errors) setErrors(error.response.data.errors);
      console.error("Gagal simpan proposal:", error);
    }
  };

  const confirmDelete = (proposal) => {
    console.log(proposal.judul);

    confirmDialog({
      message: `Hapus proposal ${proposal.judul}?`,
      header: "Konfirmasi",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Tidak",
      accept: () => deleteProposal(proposal.id),
    });
  };

  const deleteProposal = async (id) => {
    await deleteProposalApi(id);
    toast.current.show({
      severity: "success",
      summary: "Berhasil",
      detail: "Proposal dihapus",
    });
    fetchProposals();
  };

  // const addMemberRow = () => {
  //   setForm((prev) => ({
  //     ...prev,
  //     proposalMember: [
  //       ...prev.proposalMember,
  //       { member_type: "", member_id: "", status: "PENDING" },
  //     ],
  //   }));
  // };

  // const updateMember = (index, field, value) => {
  //   const updatedMembers = [...form.proposalMember];
  //   updatedMembers[index][field] = value;
  //   setForm({ ...form, proposalMember: updatedMembers });
  // };

  const approveProposal = async (proposalId) => {
    try {
      console.log(proposalId, user.id);
      await approveProposalApi(proposalId, user.id);
      toast.current.show({
        severity: "success",
        summary: "Diterima",
        detail: "Proposal disetujui",
      });
      fetchProposals();
      fetchNotifications(userId);
      setProposalDetailDialogVisible(false);
    } catch (error) {
      console.error("Gagal menyetujui proposal:", error);
    }
  };

  const rejectProposal = async (proposalId) => {
    try {
      console.log(proposalId, user.id);

      await rejectProposalApi(proposalId, user.id);
      toast.current.show({
        severity: "danger",
        summary: "Ditolak",
        detail: "Proposal ditolak",
      });
      fetchProposals();
      fetchNotifications(userId);
      setProposalDetailDialogVisible(false);
    } catch (error) {
      console.error("Gagal menolak proposal:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="text-2xl font-semibold mb-5">Kelola Proposal</div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="card">
        <Toolbar
          className="mb-4"
          start={
            <div className="flex gap-1.5">
              <Button
                label="Tambah"
                icon="pi pi-plus"
                onClick={openAddDialog}
                className="mr-4"
                size="small"
                disabled={!isDosen}
              />
            </div>
          }
          end={
            <IconField iconPosition="left">
              <InputIcon className="pi pi-search" />
              <InputText
                placeholder="Cari proposal..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                size="small"
              />
            </IconField>
          }
        />

        <DataTable
          value={filteredProposals}
          paginator
          rows={10}
          dataKey={proposals.id}
        >
          <Column field="judul" header="Judul" sortable />
          <Column
            field="ketuaPeneliti.dosen.name"
            header="Ketua Peneliti"
            sortable
          />
          <Column
            field="anggotaDosen"
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
            field="waktuPelaksanaan"
            header="Waktu Pelaksanaan"
            sortable
          />
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
                <div className="text-right">
                  <Button
                    icon="pi pi-eye"
                    className="p-button-text"
                    onClick={() => openDetailProposalDialog(row)}
                  />
                  {userId === row.ketuaPeneliti.id && (
                    <>
                      <Button
                        icon="pi pi-pencil"
                        className="p-button-text"
                        onClick={() => openEditDialog(row)}
                      />
                      <Button
                        icon="pi pi-trash"
                        severity="danger"
                        className="p-button-text"
                        onClick={() => confirmDelete(row)}
                      />
                    </>
                  )}
                </div>
              );
            }}
          />
        </DataTable>
      </div>

      <Dialog
        header="Detail Proposal"
        visible={proposalDetailDialogVisible}
        onHide={() => setProposalDetailDialogVisible(false)}
        style={{ width: "50vw" }}
      >
        {selectedProposal && (
          <>
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
                <p className="text-sm">
                  PIC: {selectedProposal.picMitra || "-"}
                </p>
              </div>

              <div className="field mt-3">
                <label className="font-bold block mb-1">Pendanaan</label>
                <p>Sumber: {selectedProposal.sumberDana || "-"}</p>
                <p>
                  Dana: Rp{" "}
                  {selectedProposal.danaYangDiUsulkan?.toLocaleString(
                    "id-ID"
                  ) || "0"}
                </p>
              </div>

              <div className="field mt-3">
                <label className="font-bold block mb-1">
                  Luaran Penelitian
                </label>
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

              {selectedProposal?.proposalMember?.some(
                (pm) => pm.user.id === userId && pm.status === "PENDING"
              ) && (
                <>
                  <div className="flex gap-1 justify-end mt-3">
                    <Button
                      icon="pi pi-check"
                      label="Terima"
                      className="p-button-success mr-2"
                      onClick={() => approveProposal(selectedProposal.id)}
                      // disabled={!isMember}
                    />
                    <Button
                      icon="pi pi-times"
                      label="Tolak"
                      className="p-button-danger"
                      onClick={() => rejectProposal(selectedProposal.id)}
                      // disabled={!isMember}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </Dialog>

      <Dialog
        header={`File Proposal: ${selectedProposal?.judul}`}
        visible={fileDialogVisible}
        style={{ width: "80vw", height: "90vh" }}
        onHide={() => setFileDialogVisible(false)}
        maximizable
      >
        {selectedProposal?.fileUrl ? (
          <iframe
            src={selectedProposal?.fileUrl}
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

      <Dialog
        header={isEditMode ? "Edit Proposal" : "Tambah Proposal"}
        visible={dialogVisible}
        onHide={closeDialog}
        style={{ width: "60vw" }}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        modal
        footer={
          <div className="flex justify-end mt-3">
            <Button label="Batal" onClick={closeDialog} size="small" outlined />
            <Button label="Simpan" onClick={saveProposal} size="small" />
          </div>
        }
      >
        <div className="grid gap-3">
          <div>
            <label>Judul Proposal</label>
            <InputTextarea
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              rows={4}
              className={`w-full ${errors?.judul ? "p-invalid" : ""}`}
            />
            {errors?.judul && <small className="p-error">{errors.judul}</small>}
          </div>

          <div className="field mb-3">
            <label htmlFor="ketuaPeneliti">Ketua Peneliti</label>
            <Dropdown
              id="ketuaPeneliti"
              value={form.ketuaPeneliti}
              options={chiefResearcherOptions}
              onChange={(e) => setForm({ ...form, ketuaPeneliti: e.value })}
              placeholder="Pilih Ketua Peneliti"
              className={`w-full ${errors?.ketuaPeneliti ? "p-invalid" : ""}`}
              disabled={true}
              size="small"
            />
            {errors?.ketuaPeneliti && (
              <small className="p-error">{errors.ketuaPeneliti}</small>
            )}
          </div>

          <div className="field">
            <label htmlFor="anggotaPenelitiDosen">Anggota Peneliti Dosen</label>
            <MultiSelect
              value={form.anggotaDosen || []}
              onChange={(e) => setForm({ ...form, anggotaDosen: e.value })}
              options={dosenResearcherOptions}
              optionLabel="label"
              placeholder="Pilih Anggota Peneliti Dosen"
              maxSelectedLabels={2}
              className={`w-full md:w-20rem ${
                errors?.anggotaDosen ? "p-invalid" : ""
              }`}
              size="small"
            />
            {errors?.anggotaDosen && (
              <small className="p-error">{errors.anggotaDosen}</small>
            )}
          </div>

          <div className="field">
            <label htmlFor="anggotaPenelitiMahasiswa">
              Anggota Peneliti Mahasiswa
            </label>
            <MultiSelect
              value={form.anggotaMahasiswa || []}
              onChange={(e) => setForm({ ...form, anggotaMahasiswa: e.value })}
              options={studentResearcherOptions}
              optionLabel="label"
              placeholder="Pilih Anggota Peneliti Mahasiswa"
              maxSelectedLabels={2}
              className={`w-full md:w-20rem ${
                errors?.anggotaMahasiswa ? "p-invalid" : ""
              }`}
              size="small"
            />
            {errors?.anggotaMahasiswa && (
              <small className="p-error">{errors.anggotaMahasiswa}</small>
            )}
          </div>

          <div>
            <label>Nama Mitra</label>
            <InputText
              value={form.namaMitra}
              onChange={(e) => setForm({ ...form, namaMitra: e.target.value })}
              className={`w-full ${errors?.namaMitra ? "p-invalid" : ""}`}
              size="small"
            />
            {errors?.namaMitra && (
              <small className="p-error">{errors.namaMitra}</small>
            )}
          </div>

          <div>
            <label>Alamat Mitra</label>
            <InputText
              value={form.alamatMitra}
              onChange={(e) =>
                setForm({ ...form, alamatMitra: e.target.value })
              }
              className={`w-full ${errors?.alamatMitra ? "p-invalid" : ""}`}
              size="small"
            />
            {errors?.alamatMitra && (
              <small className="p-error">{errors.alamatMitra}</small>
            )}
          </div>

          <div>
            <label>PIC</label>
            <InputText
              value={form.picMitra}
              onChange={(e) => setForm({ ...form, picMitra: e.target.value })}
              className={`w-full ${errors?.picMitra ? "p-invalid" : ""}`}
              size="small"
            />
            {errors?.picMitra && (
              <small className="p-error">{errors.picMitra}</small>
            )}
          </div>

          <div>
            <label>Waktu Pelaksanaan</label>
            <Calendar
              value={form.waktuPelaksanaan}
              onChange={(e) =>
                setForm({ ...form, waktuPelaksanaan: e.target.value })
              }
              dateFormat="dd/mm/yy"
              className={`w-full ${
                errors?.waktuPelaksanaan ? "p-invalid" : ""
              }`}
            />
            {errors?.waktuPelaksanaan && (
              <small className="p-error">{errors.waktuPelaksanaan}</small>
            )}
          </div>

          <div>
            <label>Sumber Dana</label>
            <InputText
              value={form.sumberDana}
              onChange={(e) => setForm({ ...form, sumberDana: e.target.value })}
              className={`w-full ${errors?.sumberDana ? "p-invalid" : ""}`}
              size="small"
            />
            {errors?.sumberDana && (
              <small className="p-error">{errors.sumberDana}</small>
            )}
          </div>

          <div>
            <label>Jumlah Dana</label>
            <InputNumber
              value={form.danaYangDiUsulkan}
              onValueChange={(e) =>
                setForm({ ...form, danaYangDiUsulkan: e.value })
              }
              className={`w-full ${
                errors?.danaYangDiUsulkan ? "p-invalid" : ""
              }`}
              inputClassName="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
            {errors?.danaYangDiUsulkan && (
              <small className="p-error">{errors.danaYangDiUsulkan}</small>
            )}
          </div>

          <div>
            <label>Luaran Penelitian</label>
            <InputTextarea
              value={form.luaranPenelitian}
              onChange={(e) =>
                setForm({ ...form, luaranPenelitian: e.target.value })
              }
              rows={3}
              className={`w-full ${
                errors?.luaranPenelitian ? "p-invalid" : ""
              }`}
            />
            {errors?.luaranPenelitian && (
              <small className="p-error">{errors.luaranPenelitian}</small>
            )}
          </div>

          <div>
            <label>File Penelitian</label>
            <FileUpload
              name="proposal"
              customUpload
              uploadHandler={(e) => {
                // Simpan file sebagai array
                setForm((prevForm) => ({
                  ...prevForm,
                  fileUrl: e.files, // Simpan sebagai array
                }));
              }}
              auto
              accept="application/pdf"
              chooseLabel="Pilih File"
              className={errors?.fileUrl ? "p-invalid" : ""}
            />
            {errors?.fileUrl && (
              <small className="p-error">{errors.fileUrl}</small>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Proposal;
