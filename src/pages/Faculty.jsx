import { React, useEffect, useState, useMemo, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toolbar } from "primereact/toolbar";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import {
  createFaculty,
  getFaculties,
  updateFaculty,
  deleteFaculty as deleteFacultyApi,
} from "../api/faculty";

const Faculty = () => {
  const toast = useRef(null);

  const [faculties, setFaculties] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: "",
  });
  const [errors, setErrors] = useState({});

  const fetchFaculties = async () => {
    const res = await getFaculties();

    console.log(res.data);
    setFaculties(res.data);
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const filteredFaculties = useMemo(() => {
    return faculties.filter((faculty) =>
      faculty.facultyName.toLowerCase().includes(globalFilter.toLowerCase())
    );
  }, [faculties, globalFilter]);

  const openAddDialog = () => {
    setIsEditMode(false);
    setForm({
      id: null,
      facultyName: "",
    });
    setErrors({});
    setDialogVisible(true);
  };

  const openEditDialog = (faculty) => {
    setIsEditMode(true);
    setForm({
      id: faculty.id,
      facultyName: faculty.facultyName,
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
        await updateFaculty(form);

        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Fakultas diperbarui",
        });
      } else {
        await createFaculty(form);

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
      message: `Hapus fakultas ${faculty.facultyName}?`,
      header: "Konfirmasi",
      icon: "pi pi-exclamation-triangle",
      accept: () => deleteFaculty(faculty.id),
    });
  };

  const deleteFaculty = async (id) => {
    await deleteFacultyApi(id);

    toast.current.show({
      severity: "success",
      summary: "Berhasil",
      detail: "Fakultas dihapus",
    });
    fetchFaculties();
  };

  return (
    <div className="p-4">
      <div className="text-2xl font-semibold mb-5">Kelola Fakultas</div>

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
          scrollable
          scrollHeight="460px"
          dataKey={faculties.id}
        >
          <Column field="facultyName" header="Nama" sortable />
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
            value={form.facultyName}
            onChange={(e) => setForm({ ...form, facultyName: e.target.value })}
            className={`w-full ${errors.facultyName ? "p-invalid" : ""}`}
            size="small"
          />
          {errors.facultyName && (
            <small className="p-error">{errors.facultyName}</small>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default Faculty;
