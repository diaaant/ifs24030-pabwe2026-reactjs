import { api } from "../../../helpers/apiHelper";

const getUsers = async () => (await api.get("/users")).data.users;
const getUserById = async (id) => (await api.get(`/users/${id}`)).data.user;
const getProfile = async () => (await api.get("/users/me")).data.user;
const updateProfile = async ({ name, email }) =>
  (await api.put("/users/me", { body: { name, email } })).data.user;

const updatePhoto = async (file) => {
  const form = new FormData();
  form.append("photo", file);
  return api.post("/users/me/photo", { body: form });
};

// Endpoint sesuai dokumentasi: PUT /users/password
const updatePassword = async ({
  password,
  new_password,
  new_password_confirmation,
}) =>
  api.put("/users/password", {
    body: { password, new_password, new_password_confirmation },
  });

export default {
  getUsers,
  getUserById,
  getProfile,
  updateProfile,
  updatePhoto,
  updatePassword,
};
