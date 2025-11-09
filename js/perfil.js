// ===========================================================
// PERFIL - Inicialización y manejo de formularios
// ===========================================================

import {
	validarClave,
	clavesIguales,
	setFeedback,
	setupPerfilPage,
} from "./validaciones.js";
import { getCurrentUser, getUsers, saveUsers, sha256 } from "./auth.repo.js";

// Helper para alertas visuales (usa la global de site.js)
const show = (id, msg, type = "success") => {
	if (typeof showAlert === "function") showAlert(id, msg, type);
	else console.log(`[${type}] ${msg}`);
};

// ===========================================================
// CARGAR DATOS DEL PERFIL
// ===========================================================
document.addEventListener("DOMContentLoaded", () => {
	const user = getCurrentUser();
	if (!user) {
		window.location.href = "login.html";
		return;
	}

	// Carga de datos en los campos
	document.getElementById("nombreCompleto").value = user.nombreCompleto || "";
	document.getElementById("nombreUsuario").value = user.nombreUsuario || "";
	document.getElementById("email").value = user.email || "";
	document.getElementById("fechaNacimiento").value = user.fechaNacimiento || "";
	document.getElementById("direccion").value = user.direccion || "";

	// Configura validaciones básicas del perfil
	setupPerfilPage();
});

// ===========================================================
// GUARDAR CAMBIOS DEL PERFIL
// ===========================================================
document.getElementById("perfilForm")?.addEventListener("submit", (e) => {
	e.preventDefault();

	const nombreEl = document.getElementById("nombreCompleto");
	const usuarioEl = document.getElementById("nombreUsuario");
	const fechaEl = document.getElementById("fechaNacimiento");
	const dirEl = document.getElementById("direccion");

	let ok = true;

	if (nombreEl.value.trim().length < 3) {
		setFeedback(nombreEl, false, "El nombre debe tener al menos 3 caracteres.");
		ok = false;
	} else setFeedback(nombreEl, true, "");

	if (usuarioEl.value.trim().length < 3) {
		setFeedback(usuarioEl, false, "El nombre de usuario es demasiado corto.");
		ok = false;
	} else setFeedback(usuarioEl, true, "");

	const fecha = fechaEl.value;
	if (!fecha) {
		setFeedback(fechaEl, false, "Debes ingresar tu fecha de nacimiento.");
		ok = false;
	} else {
		const f = new Date(fecha);
		const hoy = new Date();
		hoy.setHours(0, 0, 0, 0);
		if (f > hoy) {
			setFeedback(fechaEl, false, "La fecha no puede ser futura.");
			ok = false;
		} else setFeedback(fechaEl, true, "");
	}

	if (!ok) return;

	const user = getCurrentUser();
	const users = getUsers();
	const idx = users.findIndex((u) => u.id === user.id);
	if (idx === -1) return;

	users[idx] = {
		...users[idx],
		nombreCompleto: nombreEl.value.trim(),
		nombreUsuario: usuarioEl.value.trim(),
		fechaNacimiento: fechaEl.value,
		direccion: dirEl.value.trim(),
	};
	saveUsers(users);

	show("perfil-alert", "Perfil actualizado correctamente.", "success");
});

// ===========================================================
// CAMBIO DE CONTRASEÑA
// ===========================================================
document.getElementById("passForm")?.addEventListener("submit", async (e) => {
	e.preventDefault();

	const actEl = document.getElementById("passActual");
	const newEl = document.getElementById("passNueva");
	const confEl = document.getElementById("passConfirm");

	const user = getCurrentUser();
	const users = getUsers();
	const idx = users.findIndex((u) => u.id === user.id);
	if (idx === -1) return;

	const actHash = await sha256(actEl.value || "");
	if (users[idx].passwordHash !== actHash) {
		setFeedback(actEl, false, "Contraseña actual incorrecta.");
		return;
	} else setFeedback(actEl, true, "");

	const vClave = validarClave(newEl.value);
	setFeedback(newEl, vClave.ok, vClave.msg);
	if (!vClave.ok) return;

	const okConf = clavesIguales(newEl.value, confEl.value);
	setFeedback(confEl, okConf, "Las contraseñas no coinciden.");
	if (!okConf) return;

	users[idx].passwordHash = await sha256(newEl.value);
	saveUsers(users);

	newEl.value = confEl.value = actEl.value = "";
	show("pass-alert", "Contraseña actualizada correctamente.", "success");
});

// ===========================================================
// BOTONES DE RESETEO
// ===========================================================
document
	.getElementById("btnResetProfile")
	?.addEventListener("click", () => window.location.reload());
document.getElementById("btnResetPass")?.addEventListener("click", () => {
	document.getElementById("passActual").value = "";
	document.getElementById("passNueva").value = "";
	document.getElementById("passConfirm").value = "";
});
