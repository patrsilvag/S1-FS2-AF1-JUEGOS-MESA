// // =======================================================
// //  js/recuperar.js
// //  Flujo de recuperación de contraseña sin alertas flotantes.
// //  Usa feedback accesible y el código fijo “123456” para demo.
// // =======================================================

// import {
// 	emailValido,
// 	validarClave,
// 	clavesIguales,
// 	setFeedback,
// } from "./validaciones.js";

// import {
// 	getResetCode,
// 	clearResetCode,
// 	getUsers,
// 	saveUsers,
// 	findUserByEmail,
// 	sha256,
// } from "./auth.repo.js";

// document.addEventListener("DOMContentLoaded", () => {
// 	// -----------------------------
// 	// Referencias del formulario
// 	// -----------------------------
// 	const form = document.getElementById("form-reset");
// 	if (!form) return;

// 	const emailEl = document.getElementById("emailB");
// 	const codeEl = document.getElementById("code");
// 	const passEl = document.getElementById("password");
// 	const confEl = document.getElementById("confirm");
// 	const stepB = document.getElementById("stepB");

// 	// -----------------------------
// 	// Precargar correo desde query o localStorage
// 	// -----------------------------
// 	const params = new URLSearchParams(window.location.search);
// 	const pre = params.get("email")?.trim();
// 	if (pre) localStorage.setItem("resetEmail", pre);

// 	const storedEmail = localStorage.getItem("resetEmail");
// 	if (storedEmail && emailEl) emailEl.value = storedEmail;

// 	if (stepB) stepB.classList.remove("d-none");

// 	// -----------------------------
// 	// Validaciones en tiempo real
// 	// -----------------------------
// 	codeEl?.addEventListener("input", () => {
// 		const okCode = /^\d{6}$/.test(codeEl.value.trim());
// 		setFeedback(codeEl, okCode, "Código inválido (6 dígitos numéricos).");
// 	});

// 	passEl?.addEventListener("input", () => {
// 		const vClave = validarClave(passEl.value);
// 		setFeedback(passEl, vClave.ok, vClave.msg);
// 		if (confEl)
// 			setFeedback(
// 				confEl,
// 				clavesIguales(passEl.value, confEl.value),
// 				"Las contraseñas no coinciden."
// 			);
// 	});

// 	confEl?.addEventListener("input", () => {
// 		setFeedback(
// 			confEl,
// 			clavesIguales(passEl.value, confEl.value),
// 			"Las contraseñas no coinciden."
// 		);
// 	});

// 	// -----------------------------
// 	// Envío del formulario
// 	// -----------------------------
// 	form.addEventListener("submit", async (e) => {
// 		e.preventDefault();

// 		const email = (emailEl?.value || "").trim();
// 		const code = (codeEl?.value || "").trim();
// 		const pass = passEl?.value || "";
// 		const conf = confEl?.value || "";

// 		// Validaciones previas
// 		const okEmail = emailValido(email);
// 		setFeedback(emailEl, okEmail, "Correo electrónico inválido.");

// 		const vClave = validarClave(pass);
// 		setFeedback(passEl, vClave.ok, vClave.msg);

// 		const okConfirm = clavesIguales(pass, conf);
// 		setFeedback(confEl, okConfirm, "Las contraseñas no coinciden.");

// 		const okCode = /^\d{6}$/.test(code);
// 		setFeedback(codeEl, okCode, "Código inválido (6 dígitos numéricos).");

// 		if (!(okEmail && vClave.ok && okConfirm && okCode)) return;

// 		// Validar código guardado (debe ser 123456 en demo)
// 		const storedCode = getResetCode(email);
// 		if (!storedCode || storedCode !== code) {
// 			setFeedback(codeEl, false, "Código de verificación incorrecto.");
// 			return;
// 		}

// 		// Buscar usuario
// 		const user = findUserByEmail(email);
// 		if (!user) {
// 			setFeedback(emailEl, false, "Usuario no encontrado.");
// 			return;
// 		}

// 		// Actualizar contraseña
// 		user.passwordHash = await sha256(pass);
// 		const users = getUsers().map((u) => (u.id === user.id ? user : u));
// 		saveUsers(users);

// 		clearResetCode(email);
// 		localStorage.removeItem("resetEmail");

// 		setFeedback(
// 			confEl,
// 			true,
// 			"Contraseña actualizada correctamente. Puedes iniciar sesión."
// 		);

// 		setTimeout(() => {
// 			window.location.href = "login.html";
// 		}, 1800);
// 	});
// });
