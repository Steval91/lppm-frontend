import { React, useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { MultiSelect } from "primereact/multiselect";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toolbar } from "primereact/toolbar";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";

const Faculty = () => {
  const BASE_URL =
    "https://7fa6-2001-448a-7061-1443-6027-33b2-5c22-a278.ngrok-free.app/api";

  const toast = useRef(null);

  const [faculties, setFaculties] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: "",
  });
  const [errors, setErrors] = useState({});

  const facultyTypeOptions = [
    { label: "Dosen/Staff", value: "DOSEN_STAFF" },
    { label: "Mahasiswa", value: "STUDENT" },
  ];

  const fetchFaculties = async () => {
    const res = await axios.get(`${BASE_URL}/faculties`, {
      headers: {
        "ngrok-skip-browser-warning": "any-value",
      },
    });

    console.log(res.data);
    setFaculties(res.data);
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const filteredFaculties = useMemo(() => {
    return faculties.filter((faculty) =>
      faculty.name.toLowerCase().includes(globalFilter.toLowerCase())
    );
  }, [faculties, globalFilter]);

  useEffect(() => {
    fetchFaculties();
  }, []);

  const openAddDialog = () => {
    setIsEditMode(false);
    setForm({
      id: null,
      facultyname: "",
      email: "",
      roles: [],
      dosen: {
        name: "",
        nik: "",
        nidn: "",
        functionalPosition: "",
        facultyId: null,
      },
      student: {
        name: "",
        nim: "",
        facultyId: null,
      },
    });
    setErrors({});
    setDialogVisible(true);
  };

  const openEditDialog = (faculty) => {
    const selectedRoles = faculty.roles.map((role) => role.name); // hasil: ['DOSEN', 'REVIEWER']

    setIsEditMode(true);
    setForm({
      id: faculty.id,
      facultyType: faculty.facultyType,
      facultyname: faculty.facultyname,
      email: faculty.email,
      roles: selectedRoles,
    });
    setErrors({});
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setErrors({});
  };

  const saveFaculty = async () => {
    console.log(form);

    try {
      if (isEditMode) {
        await axios.put(`${BASE_URL}/faculties`, form);
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Fakultas diperbarui",
        });
      } else {
        await axios.post(`${BASE_URL}/faculties`, form);
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Fakultas ditambahkan",
        });
      }
      fetchFaculties();
      closeDialog();
    } catch (error) {
      if (error.response?.data?.errors) setErrors(error.response.data.errors);
    }
  };

  const confirmDelete = (faculty) => {
    confirmDialog({
      message: `Hapus fakultas ${faculty.name}?`,
      header: "Konfirmasi",
      icon: "pi pi-exclamation-triangle",
      accept: () => deleteFaculty(faculty.id),
    });
  };

  const deleteFaculty = async (id) => {
    await axios.delete(`${BASE_URL}/faculties/${id}`);
    toast.current.show({
      severity: "success",
      summary: "Berhasil",
      detail: "Fakultas dihapus",
    });
    fetchFaculties();
  };

  const confirmBulkDelete = () => {
    confirmDialog({
      message: "Hapus fakultas yang dipilih?",
      header: "Konfirmasi",
      icon: "pi pi-exclamation-triangle",
      accept: bulkDeleteFaculties,
    });
  };

  const bulkDeleteFaculties = async () => {
    const ids = selectedFaculties.map((u) => u.id);
    await axios.post(`${BASE_URL}/faculties/bulk-delete`, { ids });
    toast.current.show({
      severity: "success",
      summary: "Berhasil",
      detail: "Fakultas dihapus",
    });
    fetchFaculties();
    setSelectedFaculties([]);
  };

  return (
    <div className="p-4">
      <div className="text-xl font-semibold mb-5">Kelola Fakultas</div>
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
              {/* <Button
                label="Hapus"
                icon="pi pi-trash"
                severity="danger"
                disabled={!selectedFaculties.length}
                onClick={confirmBulkDelete}
                size="small"
              /> */}
            </div>
          }
          end={
            <IconField iconPosition="left">
              <InputIcon className="pi pi-search" />
              <InputText
                placeholder="Cari fakultas..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                size="small"
              />
            </IconField>
          }
        />

        <DataTable
          value={filteredFaculties}
          paginator
          rows={10}
          selection={selectedFaculties}
          // onSelectionChange={(e: DataTableSelectionChangeParams) =>
          //   setSelectedFaculties(e.value)
          // }
          scrollable
          scrollHeight="460px"
          dataKey={faculties.id}
        >
          <Column field="nama" header="Nama" sortable />
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
        header={isEditMode ? "Edit Fakultas" : "Tambah Fakultas"}
        visible={dialogVisible}
        onHide={closeDialog}
        style={{ width: "30vw" }}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        modal
        footer={
          <div className="flex justify-end mt-3">
            <Button label="Batal" onClick={closeDialog} size="small" outlined />
            <Button label="Simpan" onClick={saveFaculty} size="small" />
          </div>
        }
      >
        <div className="field mb-3">
          <label htmlFor="name">Nama</label>
          <InputText
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`w-full ${errors.name ? "p-invalid" : ""}`}
            size="small"
          />
          {errors.name && <small className="p-error">{errors.name}</small>}
        </div>
      </Dialog>
    </div>
  );
};

export default Faculty;
