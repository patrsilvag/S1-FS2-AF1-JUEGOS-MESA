// js/validaciones.js — ES Module COMPARTIDO
// Versión optimizada, comentada y ordenada.
// Compatible con: registro.html, login.html, perfil.html (sin teléfono).
// Reutiliza auth.repo.js (almacenamiento local y auth).

/* ===========================
 *  UTILIDADES (exportadas)
 * ===========================
 */

export const trim = (elOrStr) => {
	if (typeof elOrStr === "string") return elOrStr.trim();
	return elOrStr && typeof elOrStr.value === "string"
		? elOrStr.value.trim()
		: "";
};

export function emailValido(valor) {
	const v = trim(valor);
	// Suficientemente estricta y práctica
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(v);
}

export function validarClave(valor) {
	const v = valor || "";
	if (v.length < 6 || v.length > 18) {
		return { ok: false, msg: "La clave debe tener entre 6 y 18 caracteres." };
	}
	if (!/[A-Z]/.test(v)) {
		return { ok: false, msg: "La clave debe contener al menos una mayúscula." };
	}
	if (!/[0-9]/.test(v)) {
		return { ok: false, msg: "La clave debe contener al menos un número." };
	}
	if (!/[a-z!@#$%^&*()_\-+=\[{\]};:'\",.<>/?`~]/.test(v)) {
		return {
			ok: false,
			msg: "La clave debe incluir al menos una minúscula o un carácter especial.",
		};
	}
	return { ok: true, msg: "" };
}

export function clavesIguales(a, b) {
	const va = typeof a === "string" ? a : a?.value || "";
	const vb = typeof b === "string" ? b : b?.value || "";
	return va === vb;
}

/** Feedback estilo Bootstrap para inputs con <div id="error-{id}" class="invalid-feedback"> */
export function setFeedback(inputEl, ok, msg = "") {
	if (!inputEl) return;
	const errorSlot = document.getElementById(`error-${inputEl.id}`);
	inputEl.classList.toggle("is-valid", ok);
	inputEl.classList.toggle("is-invalid", !ok);
	if (errorSlot) {
		errorSlot.textContent = ok ? "" : msg;
		errorSlot.style.display = ok ? "none" : "block";
		if (!ok) errorSlot.setAttribute("role", "alert");
		else errorSlot.removeAttribute("role");
	}
}

/** Edad mínima 13 años a partir de un <input type="date"> */
export function edadOKInput(inputEl) {
	if (!inputEl?.value) return false;
	const hoy = new Date();
	const fn = new Date(inputEl.value);
	const limite = new Date(
		hoy.getFullYear() - 13,
		hoy.getMonth(),
		hoy.getDate()
	);
	return fn <= limite;
}

/** Sanitiza/normaliza entradas de texto (espacios, Unicode) */
export function sanitizeTextInput(el) {
	if (!el || typeof el.value !== "string") return;
	el.value = el.value.normalize("NFC").trim();
}

/* ===========================
 *  IMPORTS COMUNES
 * ===========================
 */
import {
	getUsers,
	saveUsers,
	findUserByEmail,
	// findUserByUsername, // no se usa ahora; mantener comentado si lo necesitas luego
	sha256,
	setCurrentUser,
	getCurrentUser,
	refreshCurrentUser,
	updateUserById,
	STATUS,
} from "./auth.repo.js";

/* ===========================
 *  HELPERS DE UI
 * ===========================
 */

/** Muestra una alerta Bootstrap en un contenedor ya presente (por id) */
function showAlert(containerEl, msg, type = "info", ms = 3000) {
	if (!containerEl) return;
	containerEl.className = "alert alert-" + type;
	containerEl.textContent = msg;
	containerEl.classList.remove("d-none");
	if (ms) {
		setTimeout(() => containerEl.classList.add("d-none"), ms);
	}
}

/** Notificación amigable: usa #form-alert si existe; si no, fallback a alert() */
function notify(msg, type = "info", ms = 3000) {
	const container = document.getElementById("form-alert");
	if (container) showAlert(container, msg, type, ms);
	else window.alert(msg);
}

/** Limpia feedback de una lista de inputs */
function limpiarFeedbackInputs(inputs) {
	inputs.forEach((i) => {
		if (!i) return;
		i.classList.remove("is-valid", "is-invalid");
		const slot = document.getElementById(`error-${i.id}`);
		if (slot) {
			slot.textContent = "";
			slot.style.display = "none";
			slot.removeAttribute("role");
		}
	});
}

/** Aplica límite de fecha para >= 13 años a un input date */
function setMaxFecha13(inputEl) {
	if (!inputEl) return;
	const hoy = new Date();
	const max = new Date(hoy.getFullYear() - 13, hoy.getMonth(), hoy.getDate());
	inputEl.setAttribute("max", max.toISOString().slice(0, 10));
}

/* ===========================
 *  REGISTRO
 * ===========================
 */

export function setupRegistroPage() {
	const form = document.getElementById("registroForm");
	const limpiarBtn = document.getElementById("limpiarBtn");
	const enviarBtn = document.getElementById("enviarBtn");
	if (!form) return;

	const inputs = {
		nombreCompleto: document.getElementById("nombreCompleto"),
		nombreUsuario: document.getElementById("nombreUsuario"),
		email: document.getElementById("email"),
		clave: document.getElementById("clave"),
		repetirClave: document.getElementById("repetirClave"),
		fechaNacimiento: document.getElementById("fechaNacimiento"),
		direccion: document.getElementById("direccion"),
	};

	// Reglas de entrada
	const soloLetras = (el) => /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/.test(trim(el));
	const noVacio = (el) => (el === inputs.direccion ? true : trim(el) !== "");

	// Límite de fecha (≥ 13 años)
	setMaxFecha13(inputs.fechaNacimiento);

	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		enviarBtn && (enviarBtn.disabled = true);

		// Sanitiza
		Object.values(inputs).forEach(sanitizeTextInput);
		// Limpia feedback
		limpiarFeedbackInputs(Object.values(inputs));

		// Validaciones
		let ok = true;

		if (!soloLetras(inputs.nombreCompleto)) {
			ok = false;
			setFeedback(
				inputs.nombreCompleto,
				false,
				"El nombre solo debe contener letras."
			);
		} else setFeedback(inputs.nombreCompleto, true, "");

		if (!noVacio(inputs.nombreUsuario)) {
			ok = false;
			setFeedback(
				inputs.nombreUsuario,
				false,
				"El nombre de usuario es obligatorio."
			);
		} else setFeedback(inputs.nombreUsuario, true, "");

		if (!emailValido(inputs.email.value)) {
			ok = false;
			setFeedback(inputs.email, false, "Formato de correo inválido.");
		} else setFeedback(inputs.email, true, "");

		if (!edadOKInput(inputs.fechaNacimiento)) {
			ok = false;
			setFeedback(
				inputs.fechaNacimiento,
				false,
				"Debe tener al menos 13 años."
			);
		} else setFeedback(inputs.fechaNacimiento, true, "");

		if (!clavesIguales(inputs.clave, inputs.repetirClave)) {
			ok = false;
			setFeedback(inputs.repetirClave, false, "Las claves no coinciden.");
		} else setFeedback(inputs.repetirClave, true, "");

		if (!ok) {
			enviarBtn && (enviarBtn.disabled = false);
			return;
		}

		// Correo existente
		if (findUserByEmail(trim(inputs.email))) {
			setFeedback(inputs.email, false, "Este correo ya está registrado.");
			enviarBtn && (enviarBtn.disabled = false);
			return;
		}

		// Crear usuario
		try {
			const users = getUsers();
			const user = {
				id: crypto.randomUUID(),
				email: trim(inputs.email),
				nombreUsuario: trim(inputs.nombreUsuario),
				nombreCompleto: trim(inputs.nombreCompleto),
				fechaNacimiento: inputs.fechaNacimiento.value,
				direccion: trim(inputs.direccion),
				passwordHash: await sha256(inputs.clave.value),
				role: "cliente",
				status: "active",
				createdAt: Date.now(),
			};
			users.push(user);
			saveUsers(users);
			setCurrentUser({ ...user, passwordHash: undefined });
			notify("¡Registro exitoso!", "success");

			form.reset();
			limpiarFeedbackInputs(Object.values(inputs));
		} catch (err) {
			console.error(err);

			notify("No se pudo completar el registro.", "danger");
		} finally {
			enviarBtn && (enviarBtn.disabled = false);
		}
	});

	// Botón limpiar
	limpiarBtn?.addEventListener("click", () => {
		form.reset();
		limpiarFeedbackInputs(Object.values(inputs));
	});
}

// Autoinit en carga DOM (si existe el formulario)
document.addEventListener("DOMContentLoaded", () => {
	if (document.getElementById("registroForm")) setupRegistroPage();
});

/* ===========================
 *  LOGIN
 * ===========================
 */

export async function loginWithEmailPassword(email, password) {
	const u = findUserByEmail(email);
	if (!u) throw new Error("Correo o contraseña inválidos.");
	if (u.status !== "active" && u.status !== (STATUS?.ACTIVE || "active")) {
		throw new Error("Tu cuenta está deshabilitada. Contacta al administrador.");
	}
	const hash = await sha256(password || "");
	if (u.passwordHash !== hash)
		throw new Error("Correo o contraseña inválidos.");

	const { passwordHash, ...safeUser } = u;
	setCurrentUser(safeUser);
	return safeUser;
}

export function setupLoginPage() {
	const form = document.getElementById("loginForm");
	const emailEl = document.getElementById("loginEmail");
	const claveEl = document.getElementById("loginClave");
	if (!form) return;

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		// Limpia feedback previo
		limpiarFeedbackInputs([emailEl, claveEl]);

		// Validaciones
		if (!emailValido(emailEl.value)) {
			setFeedback(emailEl, false, "Formato de correo inválido.");
			return;
		}
		if (trim(claveEl) === "") {
			setFeedback(claveEl, false, "La contraseña es obligatoria.");
			return;
		}

		try {
			await loginWithEmailPassword(trim(emailEl), claveEl.value);
			window.location.href = "index.html";
		} catch (err) {
			console.error(err);

			notify(err.message || "No se pudo iniciar sesión.", "danger");
		}
	});
}

// Autoinit en carga DOM (si existe el formulario)
// Autoinit en carga DOM (si existe el formulario)
document.addEventListener("DOMContentLoaded", () => {
	if (document.getElementById("loginForm")) {
		setupLoginPage();
		setupLoginRecoverySMS(); // <--- importante
	}
});

export function setupPerfilPage() {
	const perfilForm = document.getElementById("perfilForm");
	const passForm = document.getElementById("passForm");
	if (!perfilForm) return;

	const alertPerfil = document.getElementById("perfil-alert");
	const alertPass = document.getElementById("pass-alert");

	const nombreCompleto = document.getElementById("nombreCompleto");
	const nombreUsuario = document.getElementById("nombreUsuario");
	const email = document.getElementById("email");
	const fechaNacimiento = document.getElementById("fechaNacimiento");
	const direccion = document.getElementById("direccion");

	const passActual = document.getElementById("passActual");
	const passNueva = document.getElementById("passNueva");
	const passConfirm = document.getElementById("passConfirm");

	function protectWithAuth() {
		const u = getCurrentUser();
		if (
			!u ||
			(u.status !== "active" && u.status !== (STATUS?.ACTIVE || "active"))
		) {
			window.location.href = "login.html";
			return false;
		}
		return true;
	}

	function loadProfile() {
		const cur = getCurrentUser();
		if (!cur) return;
		nombreCompleto.value = cur.nombreCompleto || "";
		nombreUsuario.value = cur.nombreUsuario || "";
		email.value = cur.email || "";
		fechaNacimiento.value = cur.fechaNacimiento || "";
		direccion.value = cur.direccion || "";
	}

	// Prefill
	loadProfile();
	// Límite de fecha (≥ 13 años)
	setMaxFecha13(fechaNacimiento);

	// Guardar perfil
	perfilForm.addEventListener("submit", (e) => {
		e.preventDefault();
		if (!protectWithAuth()) return;

		// Sanitiza y limpia feedback
		[nombreCompleto, nombreUsuario, direccion].forEach(sanitizeTextInput);
		limpiarFeedbackInputs([
			nombreCompleto,
			nombreUsuario,
			fechaNacimiento,
			direccion,
		]);

		const cur = getCurrentUser();
		if (!cur) return (window.location.href = "login.html");

		// Validaciones mínimas
		let ok = true;

		if (trim(nombreCompleto) === "") {
			ok = false;
			setFeedback(nombreCompleto, false, "El nombre completo es obligatorio.");
		} else setFeedback(nombreCompleto, true, "");

		if (trim(nombreUsuario) === "") {
			ok = false;
			setFeedback(nombreUsuario, false, "El nombre de usuario es obligatorio.");
		} else setFeedback(nombreUsuario, true, "");

		if (!edadOKInput(fechaNacimiento)) {
			ok = false;
			setFeedback(fechaNacimiento, false, "Debe tener al menos 13 años.");
		} else setFeedback(fechaNacimiento, true, "");

		if (!ok) {
			return showAlert(
				alertPerfil,
				"Revisa los campos del formulario.",
				"danger",
				4000
			);
		}

		const patch = {
			nombreCompleto: nombreCompleto.value.trim(),
			nombreUsuario: nombreUsuario.value.trim(),
			fechaNacimiento: fechaNacimiento.value,
			direccion: direccion.value.trim(),
		};

		if (updateUserById(cur.id, patch)) {
			refreshCurrentUser();
			showAlert(alertPerfil, "Perfil actualizado correctamente.", "success");
		} else {
			showAlert(
				alertPerfil,
				"No se pudo actualizar el perfil.",
				"danger",
				4000
			);
		}
	});

	// Reset de perfil
	document.getElementById("btnResetProfile")?.addEventListener("click", () => {
		loadProfile();
		limpiarFeedbackInputs([
			nombreCompleto,
			nombreUsuario,
			fechaNacimiento,
			direccion,
		]);
	});

	// Feedback de contraseña en vivo
	passNueva?.addEventListener("input", () => {
		const v = validarClave(passNueva.value);
		setFeedback(passNueva, v.ok, v.msg);
		setFeedback(
			passConfirm,
			clavesIguales(passNueva.value, passConfirm.value),
			"Las claves no coinciden."
		);
	});
	passConfirm?.addEventListener("input", () => {
		setFeedback(
			passConfirm,
			clavesIguales(passNueva.value, passConfirm.value),
			"Las claves no coinciden."
		);
	});

	// Guardar nueva contraseña
	passForm?.addEventListener("submit", async (e) => {
		e.preventDefault();
		if (!protectWithAuth()) return;

		const cur = getCurrentUser();
		if (!cur) return (window.location.href = "login.html");

		try {
			const hashActual = await sha256(passActual.value);
			const users = getUsers();
			const me = users.find((u) => u.id === cur.id);
			if (!me)
				return showAlert(alertPass, "Usuario no encontrado.", "danger", 4000);
			if (me.passwordHash !== hashActual) {
				setFeedback(passActual, false, "Contraseña actual incorrecta.");
				return showAlert(alertPass, "Contraseña actual incorrecta.", "danger");
			}

			// Validar nueva contraseña
			const v = validarClave(passNueva.value);
			if (!v.ok) {
				setFeedback(passNueva, false, v.msg);
				return showAlert(
					alertPass,
					"Revisa la nueva contraseña.",
					"danger",
					4000
				);
			}
			if (!clavesIguales(passNueva.value, passConfirm.value)) {
				setFeedback(passConfirm, false, "Las claves no coinciden.");
				return showAlert(alertPass, "Las claves no coinciden.", "danger", 4000);
			}

			me.passwordHash = await sha256(passNueva.value);
			saveUsers(users);
			refreshCurrentUser();
			showAlert(alertPass, "Contraseña actualizada correctamente.", "success");
			passForm.reset();
			limpiarFeedbackInputs([passActual, passNueva, passConfirm]);
		} catch (err) {
			console.error(err);
			showAlert(
				alertPass,
				"No se pudo actualizar la contraseña.",
				"danger",
				4000
			);
		}
	});
}

// Autoinit en carga DOM (si existe el formulario)

/* ===========================
 *  LOGIN — Recuperación por SMS (simulada)
 * ===========================
 */
function setupLoginRecoverySMS() {
	const btnSend = document.getElementById("btnSendCode");
	const codeArea = document.getElementById("codeArea");
	const simCodeEl = document.getElementById("simCode");
	const recCode = document.getElementById("recCode");
	const recCodeFeedback = document.getElementById("recCodeFeedback");
	const btnVerify = document.getElementById("btnVerifyCode");
	const newPassArea = document.getElementById("newPassArea");
	const btnSave = document.getElementById("btnSaveNewPass");
	const newPass = document.getElementById("newPass");
	const newPass2 = document.getElementById("newPass2");
	const newPassFeedback = document.getElementById("newPassFeedback");

	// Si no estamos en login.html (no existen los nodos), salir
	if (!document.getElementById("recoverBox")) return;

	let currentCode = null;

	function generateCode() {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	if (btnSend) {
		btnSend.addEventListener("click", function (e) {
			e.preventDefault();
			currentCode = generateCode();
			if (simCodeEl) simCodeEl.textContent = currentCode;
			if (codeArea) codeArea.classList.remove("d-none");
			if (recCode) {
				recCode.value = "";
				recCode.classList.remove("is-invalid", "is-valid");
			}
			if (newPassArea) newPassArea.classList.add("d-none");
		});
	}

	if (btnVerify) {
		btnVerify.addEventListener("click", function (e) {
			e.preventDefault();
			const value = (recCode && recCode.value ? recCode.value : "").trim();
			if (value.length !== 6 || !/^[0-9]{6}$/.test(value)) {
				if (recCode) recCode.classList.add("is-invalid");
				if (recCodeFeedback)
					recCodeFeedback.textContent = "Ingresa un código de 6 dígitos.";
				return;
			}
			if (value !== currentCode) {
				if (recCode) recCode.classList.add("is-invalid");
				if (recCodeFeedback)
					recCodeFeedback.textContent =
						"El código no coincide. Revisa e intenta nuevamente.";
				return;
			}
			if (recCode) {
				recCode.classList.remove("is-invalid");
				recCode.classList.add("is-valid");
			}
			if (newPassArea) newPassArea.classList.remove("d-none");
			if (newPass) newPass.value = "";
			if (newPass2) newPass2.value = "";
			if (newPass) newPass.classList.remove("is-invalid", "is-valid");
			if (newPass2) newPass2.classList.remove("is-invalid", "is-valid");
			if (newPassFeedback) newPassFeedback.textContent = "";
		});
	}

	if (btnSave) {
		btnSave.addEventListener("click", async function (e) {
			e.preventDefault();
			const p1 = (newPass && newPass.value ? newPass.value : "").trim();
			const p2 = (newPass2 && newPass2.value ? newPass2.value : "").trim();
			if (p1.length < 6) {
				if (newPass) newPass.classList.add("is-invalid");
				if (newPassFeedback)
					newPassFeedback.textContent =
						"La contraseña debe tener al menos 6 caracteres.";
				return;
			}
			if (p1 !== p2) {
				if (newPass2) newPass2.classList.add("is-invalid");
				if (newPassFeedback)
					newPassFeedback.textContent = "Las contraseñas no coinciden.";
				return;
			}
			if (newPass) newPass.classList.remove("is-invalid");
			if (newPass2) newPass2.classList.remove("is-invalid");
			if (newPass) newPass.classList.add("is-valid");
			if (newPass2) newPass2.classList.add("is-valid");

			// Opcional: persistir en "repo" si el correo existe en el formulario
			try {
				const emailEl = document.getElementById("loginEmail");
				if (emailEl && emailValido(emailEl.value)) {
					const user = findUserByEmail(emailEl.value.trim());
					if (user) {
						const hash = await sha256(p1);
						updateUserById(user.id, { passwordHash: hash });
					}
				}
			} catch (err) {
				/* simulación */
			}

			notify(
				"¡Listo! Contraseña cambiada (simulado). Ahora puedes iniciar sesión con tu nueva contraseña.",
				"success"
			);

			const collapseEl = document.getElementById("recoverBox");
			if (collapseEl && window.bootstrap) {
				try {
					const c = bootstrap.Collapse.getOrCreateInstance(collapseEl);
					c.hide();
				} catch (err) {}
			}
		});
	}
}

document.addEventListener("DOMContentLoaded", () => {
	if (document.getElementById("perfilForm")) setupPerfilPage();
});
