// ===========================================================
// validaciones.js
// Centraliza las validaciones de formularios (login, registro, recuperación y perfil) y provee feedback visual
// ===========================================================

/* ---------- Funciones base ---------- */
export function emailValido(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}
// Validación robusta de contraseñas (mínimo 4 criterios)
export function validarClave(clave = "") {
	// Eliminar espacios al inicio y fin
	const valor = clave.trim();

	// Longitud mínima
	if (valor.length < 6)
		return { ok: false, msg: "Debe tener al menos 6 caracteres." };

	// Longitud máxima
	if (valor.length > 18)
		return { ok: false, msg: "No puede exceder 18 caracteres." };

	// Letra mayúscula
	if (!/[A-Z]/.test(valor))
		return { ok: false, msg: "Debe incluir al menos una letra mayúscula." };

	// Letra minúscula
	if (!/[a-z]/.test(valor))
		return { ok: false, msg: "Debe incluir al menos una letra minúscula." };

	// Número
	if (!/\d/.test(valor))
		return { ok: false, msg: "Debe incluir al menos un número." };

	// Símbolo especial
	if (!/[^A-Za-z0-9]/.test(valor))
		return {
			ok: false,
			msg: "Debe incluir al menos un símbolo especial (por ejemplo: !, $, #, %).",
		};

	// Si pasa todas las validaciones
	return { ok: true, msg: "" };
}

export function clavesIguales(a, b) {
	return a === b;
}

export function setFeedback(input, ok, msg = "") {
	if (!input) return;
	const errorEl = document.getElementById(`error-${input.id}`);
	if (!errorEl) return;

	if (ok) {
		input.classList.remove("is-invalid");
		errorEl.style.display = "none";
		errorEl.textContent = "";
	} else {
		input.classList.add("is-invalid");
		errorEl.style.display = "block";
		errorEl.textContent = msg;
	}
}

export function showAlert(id, msg, tipo = "info") {
	const el = document.getElementById(id);
	if (!el) return alert(msg);
	el.className = `alert alert-${tipo}`;
	el.textContent = msg;
	el.classList.remove("d-none");
}

// ===========================================================
// LOGIN
// ===========================================================
export async function setupLoginPage() {
	const form = document.getElementById("loginForm");
	if (!form) return;

	const emailEl = document.getElementById("loginEmail");
	const passEl = document.getElementById("loginClave");

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const email = (emailEl?.value || "").trim().toLowerCase();
		const pass = passEl?.value || "";

		const { findUserByEmail, sha256 } = await import("./auth.repo.js");
		const user = findUserByEmail(email);

		if (!user) {
			setFeedback(emailEl, false, "Usuario no registrado.");
			return;
		}

		const hash = await sha256(pass);
		if (user.passwordHash !== hash) {
			setFeedback(passEl, false, "Correo o contraseña incorrectos.");
			return;
		}

		// 🔹 guardar usuario completo (con hash) para el perfil
		const { setCurrentUserFull } = await import("./auth.repo.js");
		setCurrentUserFull(user);

		window.location.href = "index.html";
	});
}

// ===========================================================
// REGISTRO
// ===========================================================
export async function setupRegistroPage() {
	const form = document.getElementById("registroForm");
	if (!form) return;

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const nombreEl = document.getElementById("nombreCompleto");
		const usuarioEl = document.getElementById("nombreUsuario");
		const emailEl = document.getElementById("email");
		const claveEl = document.getElementById("clave");
		const repetirEl = document.getElementById("repetirClave");
		const fechaEl = document.getElementById("fechaNacimiento");
		const direccionEl = document.getElementById("direccion");

		let ok = true;

		if (nombreEl.value.trim().length < 3) {
			setFeedback(nombreEl, false, "Debe tener al menos 3 caracteres.");
			ok = false;
		} else setFeedback(nombreEl, true, "");

		if (usuarioEl.value.trim().length < 3) {
			setFeedback(usuarioEl, false, "Debe tener al menos 3 caracteres.");
			ok = false;
		} else setFeedback(usuarioEl, true, "");

		const email = emailEl.value.trim();
		if (!emailValido(email)) {
			setFeedback(emailEl, false, "Correo inválido.");
			ok = false;
		} else setFeedback(emailEl, true, "");

		const { findUserByEmail, addUser, sha256 } = await import("./auth.repo.js");
		if (findUserByEmail(email)) {
			setFeedback(emailEl, false, "Ya existe un usuario con este correo.");
			ok = false;
		}

		const vClave = validarClave(claveEl.value);
		setFeedback(claveEl, vClave.ok, vClave.msg);
		if (!vClave.ok) ok = false;

		const iguales = clavesIguales(claveEl.value, repetirEl.value);
		setFeedback(repetirEl, iguales, "Las contraseñas no coinciden.");
		if (!iguales) ok = false;

		if (!fechaEl.value) {
			setFeedback(fechaEl, false, "Debes ingresar una fecha válida.");
			ok = false;
		} else {
			const f = new Date(fechaEl.value);
			const hoy = new Date();
			hoy.setHours(0, 0, 0, 0);
			if (f > hoy) {
				setFeedback(fechaEl, false, "La fecha no puede ser futura.");
				ok = false;
			} else {
				setFeedback(fechaEl, true, "");
			}
		}

		if (!ok) return;

		const passwordHash = await sha256(claveEl.value);
		addUser({
			id: crypto.randomUUID(),
			nombreCompleto: nombreEl.value.trim(),
			nombreUsuario: usuarioEl.value.trim(),
			email,
			passwordHash,
			fechaNacimiento: fechaEl.value,
			direccion: direccionEl.value.trim(),
		});

		showAlert("form-alert", "Usuario registrado con éxito", "success");
		form.reset();
	});
}

// ===========================================================
// RECUPERAR CONTRASEÑA
// ===========================================================
export async function setupRecuperarPage() {
	const form = document.getElementById("form-reset");
	if (!form) return;

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const emailEl = document.getElementById("emailB");
		const codeEl = document.getElementById("code");
		const passEl = document.getElementById("password");
		const confEl = document.getElementById("confirm");

		const email = emailEl.value.trim();
		const code = codeEl.value.trim();
		const pass = passEl.value;
		const conf = confEl.value;

		let ok = true;
		// const { emailValido, validarClave, clavesIguales, setFeedback } = 			await import("./utils.js");
		if (!emailValido(email)) {
			setFeedback(emailEl, false, "Correo inválido.");
			ok = false;
		} else setFeedback(emailEl, true, "");

		if (!/^\d{6}$/.test(code)) {
			setFeedback(codeEl, false, "El código debe tener 6 dígitos.");
			ok = false;
		} else setFeedback(codeEl, true, "");

		const vClave = validarClave(pass);
		setFeedback(passEl, vClave.ok, vClave.msg);
		if (!vClave.ok) ok = false;

		const iguales = clavesIguales(pass, conf);
		setFeedback(confEl, iguales, "Las contraseñas no coinciden.");
		if (!iguales) ok = false;

		if (!ok) return;

		const { getResetCode, getUsers, saveUsers, sha256 } = await import(
			"./auth.repo.js"
		);
		const storedCode = getResetCode(email);
		if (!storedCode || storedCode !== code) {
			setFeedback(codeEl, false, "Código inválido o expirado.");
			return;
		}

		const users = getUsers();
		const idx = users.findIndex((u) => u.email === email);
		if (idx === -1) {
			setFeedback(emailEl, false, "Usuario no encontrado.");
			return;
		}

		users[idx].passwordHash = await sha256(pass);
		saveUsers(users);

		showAlert(
			"reset-alert",
			"Contraseña actualizada correctamente.",
			"success"
		);
		form.reset();
	});
}

/* ===========================================================
   PERFIL - Validación reutilizable
   =========================================================== */
export function validarPerfil(form) {
	if (!form) return false;

	const nombreEl = form.querySelector("#nombreCompleto");
	const usuarioEl = form.querySelector("#nombreUsuario");
	const fechaEl = form.querySelector("#fechaNacimiento");

	let ok = true;

	// Nombre completo
	if (nombreEl.value.trim().length < 3) {
		setFeedback(nombreEl, false, "El nombre debe tener al menos 3 caracteres.");
		ok = false;
	} else setFeedback(nombreEl, true, "");

	// Nombre de usuario
	if (usuarioEl.value.trim().length < 3) {
		setFeedback(usuarioEl, false, "El nombre de usuario es demasiado corto.");
		ok = false;
	} else setFeedback(usuarioEl, true, "");

	// Fecha de nacimiento
	const fecha = fechaEl.value;
	if (!fecha) {
		setFeedback(fechaEl, false, "Debes ingresar una fecha válida.");
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

	return ok;
}

// ===========================================================
// Inicialización automática
// ===========================================================
document.addEventListener("DOMContentLoaded", () => {
	if (document.getElementById("loginForm")) setupLoginPage();
	if (document.getElementById("registroForm")) setupRegistroPage();
	if (document.getElementById("form-reset")) setupRecuperarPage();
});

// ============================================================
// Alternar visibilidad de contraseñas con botón accesible 👁️
// ============================================================
document.addEventListener("click", (e) => {
	const btn = e.target.closest(".toggle-password");
	if (!btn) return;
	const input = btn.previousElementSibling;
	if (!input) return;

	const isVisible = input.type === "text";
	input.type = isVisible ? "password" : "text";
	btn.setAttribute("aria-pressed", String(!isVisible));
	btn.setAttribute("aria-label", isVisible ? "Mostrar contraseña" : "Ocultar contraseña");
	btn.textContent = isVisible ? "👁️" : "🙈";
});