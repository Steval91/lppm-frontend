import { React, useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
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
import { data } from "autoprefixer";
import { Calendar } from "primereact/calendar";
import { FileUpload } from "primereact/fileupload";

const Proposal = () => {
  const BASE_URL =
    "https://7fa6-2001-448a-7061-1443-6027-33b2-5c22-a278.ngrok-free.app/api";

  const toast = useRef(null);

  const [proposals, setProposals] = useState([]);
  const [chiefResercherOptions, setChiefResercherOptions] = useState([]);
  const [dosenResercherOptions, setDosenResercherOptions] = useState([]);
  const [studentResercherOptions, setStudentResercherOptions] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
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
  });
  const [errors, setErrors] = useState({});

  // const memberTypeOptions = [
  //   { label: "Mahasiswa", value: "MAHASISWA" },
  //   { label: "Dosen", value: "DOSEN" },
  // ];

  // const statusOptions = [
  //   { label: "Draft", value: "DRAFT" },
  //   { label: "Pending", value: "PENDING" },
  //   { label: "Disetujui", value: "APPROVED" },
  // ];

  // const memberStatusOptions = [
  //   { label: "PENDING", value: "PENDING" },
  //   { label: "ACCEPT", value: "ACCEPT" },
  //   { label: "REJECT", value: "REJECT" },
  // ];

  const fetchProposals = async () => {
    const res = await axios.get(`${BASE_URL}/proposals`, {
      headers: {
        "ngrok-skip-browser-warning": "any-value",
      },
    });

    console.log(res.data);
    setProposals(res.data);
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  // const filteredProposals = useMemo(() => {
  //   return proposals.filter((proposal) =>
  //     proposal.proposalname.toLowerCase().includes(globalFilter.toLowerCase())
  //   );
  // }, [proposals, globalFilter]);

  const fetchUsers = async () => {
    const res = await axios.get(`${BASE_URL}/users`, {
      headers: {
        "ngrok-skip-browser-warning": "any-value",
      },
    });

    console.log("User: ", res.data);
    const opsiKetuaPeneliti = res.data.map((user) => ({
      label: user.username,
      value: user.id,
    }));
    console.log("Ketua Peneliti: ", opsiKetuaPeneliti);

    const opsiPenelitiDosen = res.data
      .filter((user) => user.userType === "DOSEN_STAFF")
      .map((user) => ({
        label: user.username,
        value: user.id,
      }));
    console.log("Peneliti Dosen: ", opsiPenelitiDosen);

    const opsiPenelitiMahasiswa = res.data
      .filter((user) => user.userType === "STUDENT")
      .map((user) => ({
        label: user.username,
        value: user.id,
      }));
    console.log("Peneliti Mahasiswa: ", opsiPenelitiMahasiswa);

    setChiefResercherOptions(opsiKetuaPeneliti);
    setDosenResercherOptions(opsiPenelitiDosen);
    setStudentResercherOptions(opsiPenelitiMahasiswa);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
      ketuaPeneliti: null,
      proposalMember: [],
      anggotaDosen: [],
      anggotaMahasiswa: [],
    });
    setErrors({});
    setDialogVisible(true);
  };

  const openEditDialog = (proposal) => {
    const selectedDosenResearcher = proposal.anggotaDosen.map(
      (dosen) => dosen.name
    );

    setIsEditMode(true);
    setForm({
      id: proposal.id,
      judul: proposal.judul,
      waktuPelaksanaan: proposal.waktuPelaksanaan,
      sumberDana: proposal.sumberDana,
      danaYangDiUsulkan: proposal.danaYangDiUsulkan,
      fileUrl: proposal.fileUrl,
      luaranPenelitian: proposal.luaranPenelitian,
      namaMitra: proposal.namaMitra,
      alamatMitra: proposal.alamatMitra,
      picMitra: proposal.picMitra,
      ketuaPeneliti: proposal.ketuaPeneliti,
      proposalMember: proposal.proposalMember,
      anggotaDosen: selectedDosenResearcher,
      anggotaMahasiswa: proposal.anggotaMahasiswa,
    });
    setErrors({});
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setErrors({});
  };

  const saveProposal = async () => {
    if (form.fileUrl && form.fileUrl.length > 0) {
      const file = form.fileUrl[0]; // Ambil file pertama dari array
      // Buat FormData dan kirim dengan key "file"
      const formData = new FormData();
      formData.append("file", file); // 🟢 harus sama dengan @RequestPart("file")

      try {
        const res = await axios.post(
          `${BASE_URL}/proposals/upload-file`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("Upload sukses:", res.data);
        form.fileUrl = res.data.fileUrl; // Simpan URL file ke form
      } catch (error) {
        console.error("Upload gagal:", error);
      }
    } else {
      console.warn("File belum dipilih.");
    }

    if (form.waktuPelaksanaan) {
      form.waktuPelaksanaan = form.waktuPelaksanaan.toLocaleDateString("id-ID");
    }
    console.log(form);

    try {
      if (isEditMode) {
        await axios.post(`${BASE_URL}/proposals/update`, form, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Proposal diperbarui",
        });
      } else {
        await axios.post(`${BASE_URL}/proposals/without-file`, form, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Proposal ditambahkan",
        });
      }

      fetchProposals();
      closeDialog();
    } catch (error) {
      if (error.response?.data?.errors) setErrors(error.response.data.errors);
    }
  };

  const confirmDelete = (proposal) => {
    console.log(proposal.judul);

    confirmDialog({
      message: `Hapus proposal ${proposal.judul}?`,
      header: "Konfirmasi",
      icon: "pi pi-exclamation-triangle",
      accept: () => deleteProposal(proposal.id),
    });
  };

  const deleteProposal = async (id) => {
    await axios.delete(`${BASE_URL}/proposals/${id}`);
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

  return (
    <div className="p-4">
      <div className="text-xl font-semibold mb-5">Kelola Proposal</div>
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

        <DataTable value={proposals} paginator rows={10} dataKey={proposals.id}>
          <Column field="judul" header="Judul" sortable />
          <Column
            field="ketuaPeneliti.username"
            header="Ketua Peneliti"
            sortable
          />
          {/* <Column
            field="anggotaDosen"
            header="Anggota Dosen"
            sortable
            body={(row) => (
              <span>
                {row.anggotaDosen
                  .map((dosen) => dosen.username)
                  .join(", ")}
              </span>
            )}
          />
          <Column field="picMitra" header="PIC" sortable />
          <Column
            field="waktuPelaksanaan"
            header="Waktu Pelaksanaan"
            sortable
          /> */}
          {/* <Column
            field="danaYangDiUsulkan"
            header="Dana"
            body={(row) => `Rp ${row.danaYangDiUsulkan.toLocaleString()}`}
          /> */}
          <Column field="status" header="Status" />
          <Column
            headerStyle={{ textAlign: "right" }}
            body={(row) => (
              <div className="text-right">
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
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header={isEditMode ? "Edit Proposal" : "Tambah Proposal"}
        visible={dialogVisible}
        onHide={closeDialog}
        style={{ width: "40vw" }}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        modal
        footer={
          <div className="flex justify-end mt-3">
            <Button
              label="Batal"
              severity="secondary"
              onClick={closeDialog}
              size="small"
            />
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
              className="w-full"
            />
          </div>

          <div className="field mb-3">
            <label htmlFor="ketuaPeneliti">Ketua Peneliti</label>
            <Dropdown
              id="ketuaPeneliti"
              value={form.ketuaPeneliti}
              options={chiefResercherOptions}
              onChange={(e) => setForm({ ...form, ketuaPeneliti: e.value })}
              placeholder="Pilih Ketua Peneliti"
              className={`w-full ${errors.role ? "p-invalid" : ""}`}
              size="small"
            />
          </div>

          <div className="field">
            <label htmlFor="anggotaPenelitiDosen">Anggota Peneliti Dosen</label>
            <MultiSelect
              value={form.anggotaDosen}
              onChange={(e) => setForm({ ...form, anggotaDosen: e.value })}
              options={dosenResercherOptions}
              optionLabel="label"
              placeholder="Pilih Anggota Peneliti Dosen"
              maxSelectedLabels={2}
              className="w-full md:w-20rem"
              size="small"
            />
          </div>

          <div className="field">
            <label htmlFor="anggotaPenelitiMahasiswa">
              Anggota Peneliti Mahasiswa
            </label>
            <MultiSelect
              value={form.anggotaMahasiswa}
              onChange={(e) => setForm({ ...form, anggotaMahasiswa: e.value })}
              options={studentResercherOptions}
              optionLabel="label"
              placeholder="Pilih Anggota Peneliti Mahasiswa"
              maxSelectedLabels={2}
              className="w-full md:w-20rem"
              size="small"
            />
          </div>

          <div>
            <label>Nama Mitra</label>
            <InputText
              value={form.namaMitra}
              onChange={(e) => setForm({ ...form, namaMitra: e.target.value })}
              className="w-full"
              size="small"
            />
          </div>

          <div>
            <label>Alamat Mitra</label>
            <InputText
              value={form.alamatMitra}
              onChange={(e) =>
                setForm({ ...form, alamatMitra: e.target.value })
              }
              className="w-full"
              size="small"
            />
          </div>

          <div>
            <label>PIC</label>
            <InputText
              value={form.picMitra}
              onChange={(e) => setForm({ ...form, picMitra: e.target.value })}
              className="w-full"
              size="small"
            />
          </div>

          <div>
            <label>Waktu Pelaksanaan</label>
            <Calendar
              value={form.waktuPelaksanaan}
              onChange={(e) =>
                setForm({ ...form, waktuPelaksanaan: e.target.value })
              }
              dateFormat="dd/mm/yy"
              className="w-full"
            />
          </div>

          <div>
            <label>Sumber Dana</label>
            <InputText
              value={form.sumberDana}
              onChange={(e) => setForm({ ...form, sumberDana: e.target.value })}
              className="w-full"
              size="small"
            />
          </div>

          <div>
            <label>Jumlah Dana</label>
            <InputNumber
              value={form.danaYangDiUsulkan}
              onValueChange={(e) =>
                setForm({ ...form, danaYangDiUsulkan: e.value })
              }
              className="w-full"
              inputClassName="w-full"
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
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
            />
          </div>

          {/* <div>
            <div className="flex justify-between items-center mb-2">
              <label>Anggota</label>
              <Button
                icon="pi pi-plus"
                onClick={addMemberRow}
                size="small"
                text
              />
            </div>
            {form.members.map((member, index) => (
              <div className="grid grid-cols-3 gap-2 mb-2" key={index}>
                <Dropdown
                  value={member.member_type}
                  options={memberTypeOptions}
                  onChange={(e) => updateMember(index, "member_type", e.value)}
                  placeholder="Tipe"
                  size="small"
                />
                <InputText
                  value={member.member_id}
                  onChange={(e) =>
                    updateMember(index, "member_id", e.target.value)
                  }
                  placeholder="ID Anggota"
                  size="small"
                />
                <Dropdown
                  value={member.status}
                  options={memberStatusOptions}
                  onChange={(e) => updateMember(index, "status", e.value)}
                  placeholder="Status"
                  size="small"
                />
              </div>
            ))}
          </div> */}
        </div>
      </Dialog>
    </div>
  );
};

export default Proposal;
