/* ===========================================================
   VALIDACIONES Y FORMULARIOS (unificado)
   =========================================================== */

/* ---------- Funciones base ---------- */
export function emailValido(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}

export function validarClave(clave) {
	if (!clave || clave.length < 6)
		return { ok: false, msg: "Debe tener al menos 6 caracteres." };
	if (clave.length > 18)
		return { ok: false, msg: "No puede exceder 18 caracteres." };
	if (!/[A-Z]/.test(clave))
		return { ok: false, msg: "Debe incluir al menos una letra mayúscula." };
	if (!/\d/.test(clave))
		return { ok: false, msg: "Debe incluir al menos un número." };
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

/* ===========================================================
   LOGIN
   =========================================================== */
export async function setupLoginPage() {
	const form = document.getElementById("loginForm");
	if (!form) return;

	// Mostrar mensaje persistido desde sessionStorage (si viene del carrito)
	const msg = sessionStorage.getItem("loginRedirectMsg");
	if (msg) {
		if (typeof showAlert === "function")
			showAlert("form-alert", msg, "warning");
		sessionStorage.removeItem("loginRedirectMsg");
	}

	const emailEl = document.getElementById("loginEmail");
	const passEl = document.getElementById("loginClave");
	const recoverLink = document.getElementById("goRecover");

	const { findUserByEmail, sha256, setCurrentUser } = await import(
		"./auth.repo.js"
	);

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const email = (emailEl?.value || "").trim();
		const pass = passEl?.value || "";

		const okEmail = emailValido(email);
		setFeedback(emailEl, okEmail, "Ingresa un correo válido.");

		const okPass = pass.length >= 6;
		setFeedback(passEl, okPass, "Ingresa una contraseña válida.");

		if (!okEmail || !okPass) return;

		const user = findUserByEmail(email);
		if (!user) {
			setFeedback(emailEl, false, "No existe una cuenta con este correo.");
			return;
		}

		const hash = await sha256(pass);
		if (user.passwordHash !== hash) {
			setFeedback(passEl, false, "Correo o contraseña incorrectos.");
			return;
		}

		setCurrentUser(user);
		window.location.href = "index.html";
	});

	// Link de recuperar
	if (recoverLink) {
		recoverLink.addEventListener("click", (e) => {
			const email = (emailEl?.value || "").trim();
			if (!emailValido(email)) {
				e.preventDefault();
				setFeedback(
					emailEl,
					false,
					"Ingresa un correo válido antes de continuar."
				);
				return;
			}
			const url = new URL(
				recoverLink.getAttribute("href"),
				window.location.href
			);
			url.searchParams.set("email", email);
			recoverLink.setAttribute("href", url.pathname + url.search);
		});
	}
}

/* ===========================================================
   REGISTRO
   =========================================================== */
export async function setupRegistroPage() {
	const form = document.getElementById("registroForm");
	if (!form) return;

	const nombreEl = document.getElementById("nombreCompleto");
	const usuarioEl = document.getElementById("nombreUsuario");
	const emailEl = document.getElementById("email");
	const passEl = document.getElementById("clave");
	const confEl = document.getElementById("repetirClave");
	const fechaEl = document.getElementById("fechaNacimiento");

	const { findUserByEmail, saveUsers, getUsers, sha256 } = await import(
		"./auth.repo.js"
	);

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const nombre = nombreEl.value.trim();
		const usuario = usuarioEl.value.trim();
		const email = emailEl.value.trim();
		const pass = passEl.value;
		const conf = confEl.value;
		const fecha = fechaEl.value;

		let ok = true;

		if (nombre.length < 3) {
			setFeedback(
				nombreEl,
				false,
				"El nombre completo debe tener al menos 3 caracteres."
			);
			ok = false;
		} else setFeedback(nombreEl, true, "");

		if (usuario.length < 3) {
			setFeedback(usuarioEl, false, "El nombre de usuario es demasiado corto.");
			ok = false;
		} else setFeedback(usuarioEl, true, "");

		const okEmail = emailValido(email);
		setFeedback(emailEl, okEmail, "Ingresa un correo válido.");
		if (!okEmail) ok = false;

		const vClave = validarClave(pass);
		setFeedback(passEl, vClave.ok, vClave.msg);
		if (!vClave.ok) ok = false;

		const okConf = clavesIguales(pass, conf);
		setFeedback(confEl, okConf, "Las contraseñas no coinciden.");
		if (!okConf) ok = false;

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

		if (findUserByEmail(email)) {
			setFeedback(emailEl, false, "Este correo ya está registrado.");
			return;
		}

		const hash = await sha256(pass);
		const users = getUsers();
		const newUser = {
			id: crypto.randomUUID(),
			email,
			nombreUsuario: usuario,
			nombreCompleto: nombre,
			passwordHash: hash,
			role: "cliente",
			status: "active",
			createdAt: Date.now(),
			fechaNacimiento: fecha,
		};
		users.push(newUser);
		saveUsers(users);

		showAlert(
			"form-alert",
			"✅ Registro exitoso. Ahora puedes iniciar sesión.",
			"success"
		);
		setTimeout(() => (window.location.href = "login.html"), 1500);
	});
}

/* ===========================================================
   RECUPERAR CONTRASEÑA
   =========================================================== */
export async function setupRecuperarPage() {
	const form = document.getElementById("form-reset");
	if (!form) return;

	const emailEl = document.getElementById("emailB");
	const codeEl = document.getElementById("code");
	const passEl = document.getElementById("password");
	const confEl = document.getElementById("confirm");

	const { getResetCode, clearResetCode, getUsers, saveUsers, sha256 } =
		await import("./auth.repo.js");

	const params = new URLSearchParams(window.location.search);
	const preEmail = params.get("email");
	if (preEmail) emailEl.value = preEmail;

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const email = emailEl.value.trim();
		const code = codeEl.value.trim();
		const pass = passEl.value;
		const conf = confEl.value;

		let ok = true;

		const okEmail = emailValido(email);
		setFeedback(emailEl, okEmail, "Correo inválido.");
		if (!okEmail) ok = false;

		const okCode = /^\d{6}$/.test(code);
		setFeedback(codeEl, okCode, "Código inválido (6 dígitos).");
		if (!okCode) ok = false;

		const vClave = validarClave(pass);
		setFeedback(passEl, vClave.ok, vClave.msg);
		if (!vClave.ok) ok = false;

		const okConf = clavesIguales(pass, conf);
		setFeedback(confEl, okConf, "Las contraseñas no coinciden.");
		if (!okConf) ok = false;

		if (!ok) return;

		const storedCode = getResetCode(email);
		if (!storedCode || storedCode !== code) {
			setFeedback(codeEl, false, "Código incorrecto o expirado.");
			return;
		}

		const users = getUsers();
		const idx = users.findIndex(
			(u) => u.email.toLowerCase() === email.toLowerCase()
		);
		if (idx === -1) {
			setFeedback(emailEl, false, "Usuario no encontrado.");
			return;
		}

		users[idx].passwordHash = await sha256(pass);
		saveUsers(users);
		clearResetCode(email);

		showAlert(
			"reset-alert",
			"Contraseña actualizada correctamente.",
			"success"
		);
		setTimeout(() => (window.location.href = "login.html"), 1500);
	});
}

/* ===========================================================
   PERFIL
   =========================================================== */
export async function setupPerfilPage() {
	const form = document.getElementById("perfilForm");
	if (!form) return;

	const nombreEl = document.getElementById("nombreCompleto");
	const usuarioEl = document.getElementById("nombreUsuario");
	const fechaEl = document.getElementById("fechaNacimiento");

	form.addEventListener("submit", (e) => {
		let ok = true;

		if (nombreEl.value.trim().length < 3) {
			setFeedback(
				nombreEl,
				false,
				"El nombre debe tener al menos 3 caracteres."
			);
			ok = false;
		} else setFeedback(nombreEl, true, "");

		if (usuarioEl.value.trim().length < 3) {
			setFeedback(usuarioEl, false, "El nombre de usuario es demasiado corto.");
			ok = false;
		} else setFeedback(usuarioEl, true, "");

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

		if (!ok) e.preventDefault();
	});
}

/* ===========================================================
   AUTO-INICIALIZADOR GLOBAL
   =========================================================== */
document.addEventListener("DOMContentLoaded", () => {
	if (document.getElementById("loginForm")) setupLoginPage();
	if (document.getElementById("registroForm")) setupRegistroPage();
	if (document.getElementById("perfilForm")) setupPerfilPage();
	if (document.getElementById("form-reset")) setupRecuperarPage();
});
