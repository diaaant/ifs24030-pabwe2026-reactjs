import { api } from "../../../helpers/apiHelper";

const login = async ({ email, password }) => {
  const json = await api.post("/auth/login", {
    body: { email, password },
    auth: false,
  });
  return json.data; // { user, token }
};

const register = async ({ name, email, password }) =>
  api.post("/auth/register", { body: { name, email, password }, auth: false });

const logout = async () => api.post("/auth/logout");

export default { login, register, logout };
