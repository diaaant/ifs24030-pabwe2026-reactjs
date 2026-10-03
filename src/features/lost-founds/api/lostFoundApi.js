import { api } from "../../../helpers/apiHelper";

// filters: { status: "lost" | "found", is_completed: 1 | 0, is_me: 1 }
const getLostFounds = async (filters = {}) =>
  (await api.get("/lost-founds", { query: filters })).data.lost_founds;

const getLostFound = async (id) =>
  (await api.get(`/lost-founds/${id}`)).data.lost_found;

const addLostFound = async ({ title, description, status }) =>
  (await api.post("/lost-founds", { body: { title, description, status } }))
    .data.lost_found_id;

const changeLostFound = async (id, { title, description, status, is_completed }) =>
  api.put(`/lost-founds/${id}`, {
    body: { title, description, status, is_completed },
  });

const changeCover = async (id, file) => {
  const form = new FormData();
  form.append("cover", file);
  return api.post(`/lost-founds/${id}/cover`, { body: form });
};

const deleteLostFound = async (id) => api.delete(`/lost-founds/${id}`);

const getStatsDaily = async (totalData) =>
  (await api.get("/lost-founds/stats/daily", { query: { total_data: totalData } }))
    .data;

const getStatsMonthly = async (totalData) =>
  (await api.get("/lost-founds/stats/monthly", { query: { total_data: totalData } }))
    .data;

export default {
  getLostFounds,
  getLostFound,
  addLostFound,
  changeLostFound,
  changeCover,
  deleteLostFound,
  getStatsDaily,
  getStatsMonthly,
};
