// ===========================================================
// PERFIL - Inicialización y manejo de formularios
// ===========================================================

import { validarPerfil } from "./validaciones.js";
import { getCurrentUser, saveUsers } from "./auth.repo.js";

// Espera a que el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("perfilForm");
  const passForm = document.getElementById("passForm");

  // Protección: solo usuarios activos pueden acceder
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // ==========================
  // CARGA DE DATOS DE PERFIL
  // ==========================
  if (form) {
    form.nombreCompleto.value = user.nombreCompleto || "";
    form.nombreUsuario.value = user.nombreUsuario || "";
    form.email.value = user.email || "";
    form.fechaNacimiento.value = user.fechaNacimiento || "";
    form.direccion.value = user.direccion || "";

    // --------------------------
    // GUARDAR CAMBIOS DE PERFIL
    // --------------------------
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Validar usando función centralizada
      if (!validarPerfil(form)) return;

      // Obtener usuarios almacenados
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const idx = users.findIndex((u) => u.email === user.email);
      if (idx !== -1) {
        users[idx].nombreCompleto = form.nombreCompleto.value.trim();
        users[idx].nombreUsuario = form.nombreUsuario.value.trim();
        users[idx].fechaNacimiento = form.fechaNacimiento.value;
        users[idx].direccion = form.direccion.value.trim();
        saveUsers(users);
      }

      showAlert("perfil-alert", "Perfil actualizado correctamente.", "success");
    });
  }

  // ===========================================================
  // FORMULARIO DE CAMBIO DE CONTRASEÑA
  // ===========================================================
  if (passForm) {
    passForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const passActualEl = document.getElementById("passActual");
      const passNuevaEl = document.getElementById("passNueva");
      const passConfEl = document.getElementById("passConfirm");

      const { sha256, saveUsers } = await import("./auth.repo.js");
      const { validarClave, clavesIguales, setFeedback } = await import("./validaciones.js");

      const hashActual = await sha256(passActualEl.value);
      if (hashActual !== user.passwordHash) {
        setFeedback(passActualEl, false, "La contraseña actual es incorrecta.");
        return;
      } else setFeedback(passActualEl, true, "");

      const vClave = validarClave(passNuevaEl.value);
      setFeedback(passNuevaEl, vClave.ok, vClave.msg);
      if (!vClave.ok) return;

      const okConf = clavesIguales(passNuevaEl.value, passConfEl.value);
      setFeedback(passConfEl, okConf, "Las contraseñas no coinciden.");
      if (!okConf) return;

      // Guardar nueva contraseña
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const idx = users.findIndex((u) => u.email === user.email);
      if (idx !== -1) {
        users[idx].passwordHash = await sha256(passNuevaEl.value);
        saveUsers(users);
      }

      showAlert("pass-alert", "Contraseña actualizada correctamente.", "success");
      passForm.reset();
    });
  }
});
