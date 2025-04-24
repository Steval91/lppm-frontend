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

const User = () => {
  const BASE_URL =
    "https://7fa6-2001-448a-7061-1443-6027-33b2-5c22-a278.ngrok-free.app/api";

  const toast = useRef(null);

  const [users, setUsers] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({
    id: null,
    userType: null,
    username: "",
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
  const [errors, setErrors] = useState({});

  const userTypeOptions = [
    { label: "Dosen/Staff", value: "DOSEN_STAFF" },
    { label: "Mahasiswa", value: "STUDENT" },
  ];

  const fetchUsers = async () => {
    const res = await axios.get(`${BASE_URL}/users`, {
      headers: {
        "ngrok-skip-browser-warning": "any-value",
      },
    });

    console.log(res.data);
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.username.toLowerCase().includes(globalFilter.toLowerCase())
    );
  }, [users, globalFilter]);

  const fetchRoles = async () => {
    const res = await axios.get(`${BASE_URL}/roles`, {
      headers: {
        "ngrok-skip-browser-warning": "any-value",
      },
    });

    const transformedRoleOptions = res.data.map((role) => ({
      label: role.name.replaceAll("_", " ").toUpperCase(),
      value: role.name,
    }));

    console.log(transformedRoleOptions);
    setRoleOptions(transformedRoleOptions);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchFaculties = async () => {
    const res = await axios.get(`${BASE_URL}/roles`, {
      headers: {
        "ngrok-skip-browser-warning": "any-value",
      },
    });

    const transformedFacultyOptions = res.data.map((faculty) => ({
      label: faculty.name,
      value: faculty.id,
    }));

    console.log(transformedFacultyOptions);
    setFacultyOptions(transformedFacultyOptions);
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const openAddDialog = () => {
    setIsEditMode(false);
    setForm({
      id: null,
      username: "",
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

  const openEditDialog = (user) => {
    const selectedRoles = user.roles.map((role) => role.name); // hasil: ['DOSEN', 'REVIEWER']

    setIsEditMode(true);
    setForm({
      id: user.id,
      userType: user.userType,
      username: user.username,
      email: user.email,
      roles: selectedRoles,
    });
    setErrors({});
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setErrors({});
  };

  const saveUser = async () => {
    console.log(form);

    try {
      if (isEditMode) {
        await axios.put(`${BASE_URL}/users`, form);
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Pengguna diperbarui",
        });
      } else {
        await axios.post(`${BASE_URL}/users`, form);
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Pengguna ditambahkan",
        });
      }
      fetchUsers();
      closeDialog();
    } catch (error) {
      if (error.response?.data?.errors) setErrors(error.response.data.errors);
    }
  };

  const confirmDelete = (user) => {
    confirmDialog({
      message: `Hapus pengguna ${user.name}?`,
      header: "Konfirmasi",
      icon: "pi pi-exclamation-triangle",
      accept: () => deleteUser(user.id),
    });
  };

  const deleteUser = async (id) => {
    await axios.delete(`${BASE_URL}/users/${id}`);
    toast.current.show({
      severity: "success",
      summary: "Berhasil",
      detail: "Pengguna dihapus",
    });
    fetchUsers();
  };

  const confirmBulkDelete = () => {
    confirmDialog({
      message: "Hapus pengguna yang dipilih?",
      header: "Konfirmasi",
      icon: "pi pi-exclamation-triangle",
      accept: bulkDeleteUsers,
    });
  };

  const bulkDeleteUsers = async () => {
    const ids = selectedUsers.map((u) => u.id);
    await axios.post(`${BASE_URL}/users/bulk-delete`, { ids });
    toast.current.show({
      severity: "success",
      summary: "Berhasil",
      detail: "Pengguna dihapus",
    });
    fetchUsers();
    setSelectedUsers([]);
  };

  return (
    <div className="p-4">
      <div className="text-xl font-semibold mb-5">Kelola Pengguna</div>
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
                disabled={!selectedUsers.length}
                onClick={confirmBulkDelete}
                size="small"
              /> */}
            </div>
          }
          end={
            <IconField iconPosition="left">
              <InputIcon className="pi pi-search" />
              <InputText
                placeholder="Cari pengguna..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                size="small"
              />
            </IconField>
          }
        />

        <DataTable
          value={filteredUsers}
          paginator
          rows={10}
          selection={selectedUsers}
          // onSelectionChange={(e: DataTableSelectionChangeParams) =>
          //   setSelectedUsers(e.value)
          // }
          scrollable
          scrollHeight="460px"
          dataKey={users.id}
        >
          {/* <Column
            selectionMode="multiple"
            headerStyle={{ width: "3rem" }}
          ></Column> */}
          <Column field="userType" header="Tipe Pengguna" sortable />
          <Column field="username" header="Username" sortable />
          <Column field="email" header="Email" sortable />
          <Column
            field="role"
            header="Peran"
            sortable
            body={(row) => (
              <span>
                {row.roles
                  .map((role) => role.name.replaceAll("_", " "))
                  .join(", ")}
              </span>
            )}
          />
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
        header={isEditMode ? "Edit Pengguna" : "Tambah Pengguna"}
        visible={dialogVisible}
        onHide={closeDialog}
        style={{ width: "30vw" }}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        modal
        footer={
          <div className="flex justify-end mt-3">
            <Button label="Batal" onClick={closeDialog} size="small" outlined />
            <Button label="Simpan" onClick={saveUser} size="small" />
          </div>
        }
      >
        <div className="field mb-3">
          <label htmlFor="userType">Tipe Pengguna</label>
          <Dropdown
            id="userType"
            value={form.userType}
            options={userTypeOptions}
            onChange={(e) => setForm({ ...form, userType: e.value })}
            placeholder="Pilih Peran"
            className={`w-full ${errors.role ? "p-invalid" : ""}`}
            size="small"
          />
          {errors.userType && (
            <small className="p-error">{errors.userType}</small>
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="name">Username</label>
          <InputText
            id="name"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className={`w-full ${errors.name ? "p-invalid" : ""}`}
            size="small"
          />
          {errors.name && <small className="p-error">{errors.name}</small>}
        </div>
        <div className="field mb-3">
          <label htmlFor="email">Email</label>
          <InputText
            id="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`w-full ${errors.email ? "p-invalid" : ""}`}
            size="small"
          />
          {errors.email && <small className="p-error">{errors.email}</small>}
        </div>
        {form.userType === "DOSEN_STAFF" && (
          <div className="field mb-3">
            <label htmlFor="role">Peran</label>
            <MultiSelect
              value={form.roles}
              onChange={(e) => setForm({ ...form, roles: e.value })}
              options={roleOptions}
              optionLabel="label"
              placeholder="Pilih Peran"
              // maxSelectedLabels={3}
              className="w-full md:w-20rem"
              size="small"
            />
            {errors.role && <small className="p-error">{errors.role}</small>}
          </div>
        )}

        {form.userType === "STUDENT" && (
          <>
            <div className="field mb-3">
              <label htmlFor="nik">NIM</label>
              <InputText
                id="nim"
                value={form.nim}
                onChange={(e) => setForm({ ...form, nim: e.target.value })}
                className={`w-full ${errors.nim ? "p-invalid" : ""}`}
                size="small"
              />
              {errors.nim && <small className="p-error">{errors.nim}</small>}
            </div>
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
            <div className="field mb-3">
              <label htmlFor="faculty">Fakultas</label>
              <Dropdown
                id="faculty"
                options={facultyOptions}
                onChange={(e) => setForm({ ...form, faculty: e.value })}
                placeholder="Pilih Peran"
                className={`w-full ${errors.faculty ? "p-invalid" : ""}`}
                size="small"
              />
              {errors.faculty && (
                <small className="p-error">{errors.faculty}</small>
              )}
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default User;
