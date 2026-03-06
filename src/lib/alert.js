import Swal from "sweetalert2";

export function confirmAlert({
  title = "Apakah Anda Yakin?",
  text = "",
  confirmText = "Ya",
  cancelText = "Batal",
}) {
  return Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: true,
  });
}

export function successAlert(title, text) {
  return Swal.fire({
    title,
    text,
    icon: "success",
    confirmButtonText: "OK",
  });
}

export function errorAlert(title ,text) {
  return Swal.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: "OK",
  });
}

export function confirmLogout() {
  return Swal.fire({
    title: "Logout?",
    text: "Anda akan keluar dari akun ini",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Logout",
    cancelButtonText: "Batal",
    confirmButtonColor: "#dc2626", // red-600
    cancelButtonColor: "#6b7280",  // gray-500
  });
}