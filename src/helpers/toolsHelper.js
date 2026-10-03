import Swal from "sweetalert2";

const COLOR = "#0f766e";

export const showSuccessDialog = (message) =>
  Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: message,
    timer: 1800,
    showConfirmButton: false,
  });

export const showErrorDialog = (message) =>
  Swal.fire({
    icon: "error",
    title: "Gagal",
    text: message,
    confirmButtonColor: COLOR,
  });

export const showConfirmDialog = async (message) => {
  const result = await Swal.fire({
    icon: "warning",
    title: "Apakah Anda yakin?",
    text: message,
    showCancelButton: true,
    confirmButtonText: "Ya, lanjutkan",
    cancelButtonText: "Batal",
    confirmButtonColor: COLOR,
  });
  return result.isConfirmed;
};

export const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const getInitial = (name) =>
  name ? name.trim().charAt(0).toUpperCase() : "?";
