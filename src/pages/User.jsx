import { React, useEffect, useState, useMemo, useRef } from "react";
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
import {
  createUser,
  getRoles,
  getUsers,
  updateUser,
  deleteUser as deleteUserApi,
} from "../api/user";
import { getFaculties } from "../api/faculty";

const User = () => {
  const toast = useRef(null);

  const [users, setUsers] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  // const [selectedUsers, setSelectedUsers] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({
    id: null,
    userType: null,
    username: "",
    email: "",
    name: "",
    nidn: "",
    nik: "",
    functionalPosition: "",
    nim: "",
    facultyId: null,
    roles: [],
  });
  const [errors, setErrors] = useState({});

  const userTypeOptions = [
    { label: "Dosen/Staff", value: "DOSEN_STAFF" },
    { label: "Mahasiswa", value: "STUDENT" },
  ];

  const fetchUsers = async () => {
    const res = await getUsers();
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
    const res = await getRoles();

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
    const res = await getFaculties();

    const transformedFacultyOptions = res.data.map((faculty) => ({
      label: faculty.facultyName,
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
      userType: null,
      username: "",
      email: "",
      name: "",
      nidn: "",
      nik: "",
      functionalPosition: "",
      nim: "",
      facultyId: null,
      roles: [],
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
      name: user.dosen?.name,
      nidn: user.dosen?.nidn,
      nik: user.dosen?.nik,
      functionalPosition: user.dosen?.functionalPosition,
      nim: user.student?.nim,
      facultyId: user.faculty.id,
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
    const payload = {
      userType: form.userType,
      username: form.username,
      email: form.email,
      roles: form.roles,
      dosen: null,
      student: null,
    };

    if (form.userType === "DOSEN_STAFF") {
      payload.dosen = {
        name: form.name,
        nik: form.nik,
        nidn: form.nidn,
        functionalPosition: form.functionalPosition,
        facultyId: form.facultyId,
      };
    }

    if (form.userType === "STUDENT") {
      payload.student = {
        name: form.name,
        nim: form.nim,
        facultyId: form.facultyId,
        // programStudyId: form.programStudyId,
      };
    }

    console.log("Payload yang dikirim:", payload);
    // return;

    try {
      if (isEditMode) {
        payload.id = form.id;
        await updateUser(payload);
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Pengguna diperbarui",
        });
      } else {
        await createUser(payload);
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
      message: `Hapus pengguna ${user.username}?`,
      header: "Konfirmasi",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Tidak",
      accept: () => deleteUser(user.id),
    });
  };

  const deleteUser = async (id) => {
    await deleteUserApi(id);
    toast.current.show({
      severity: "success",
      summary: "Berhasil",
      detail: "Pengguna dihapus",
    });
    fetchUsers();
  };

  // const confirmBulkDelete = () => {
  //   confirmDialog({
  //     message: "Hapus pengguna yang dipilih?",
  //     header: "Konfirmasi",
  //     icon: "pi pi-exclamation-triangle",
  //     accept: bulkDeleteUsers,
  //   });
  // };

  // const bulkDeleteUsers = async () => {
  //   const ids = selectedUsers.map((u) => u.id);
  //   await axios.post(`${BASE_URL}/users/bulk-delete`, { ids });
  //   toast.current.show({
  //     severity: "success",
  //     summary: "Berhasil",
  //     detail: "Pengguna dihapus",
  //   });
  //   fetchUsers();
  //   setSelectedUsers([]);
  // };

  return (
    <div className="p-4">
      <div className="text-2xl font-semibold mb-5">Kelola Pengguna</div>
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
          // selection={selectedUsers}
          // onSelectionChange={(e: DataTableSelectionChangeParams) =>
          //   setSelectedUsers(e.value)
          // }
          scrollable
          scrollHeight="460px"
          dataKey="id"
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
          {errors.username && (
            <small className="p-error">{errors.username}</small>
          )}
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
        {form.userType === "DOSEN_STAFF" && (
          <>
            <div className="field mb-3">
              <label htmlFor="nidn">NIDN</label>
              <InputText
                id="nidn"
                value={form.nidn}
                onChange={(e) => setForm({ ...form, nidn: e.target.value })}
                className={`w-full ${errors.nidn ? "p-invalid" : ""}`}
                size="small"
              />
              {errors.nidn && <small className="p-error">{errors.nidn}</small>}
            </div>
            <div className="field mb-3">
              <label htmlFor="nik">NIK</label>
              <InputText
                id="nik"
                value={form.nik}
                onChange={(e) => setForm({ ...form, nik: e.target.value })}
                className={`w-full ${errors.nik ? "p-invalid" : ""}`}
                size="small"
              />
              {errors.nik && <small className="p-error">{errors.nik}</small>}
            </div>
            <div className="field mb-3">
              <label htmlFor="functionalPosition">Jabatan</label>
              <InputText
                id="functionalPosition"
                value={form.functionalPosition}
                onChange={(e) =>
                  setForm({ ...form, functionalPosition: e.target.value })
                }
                className={`w-full ${
                  errors.functionalPosition ? "p-invalid" : ""
                }`}
                size="small"
              />
              {errors.functionalPosition && (
                <small className="p-error">{errors.functionalPosition}</small>
              )}
            </div>
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
          </>
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
          </>
        )}
        <div className="field mb-3">
          <label htmlFor="faculty">Fakultas</label>
          <Dropdown
            id="faculty"
            options={facultyOptions}
            value={form.facultyId}
            onChange={(e) => setForm({ ...form, facultyId: e.value })}
            placeholder="Pilih Fakultas"
            className={`w-full ${errors.faculty ? "p-invalid" : ""}`}
            size="small"
          />
          {errors.faculty && (
            <small className="p-error">{errors.faculty}</small>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default User;
