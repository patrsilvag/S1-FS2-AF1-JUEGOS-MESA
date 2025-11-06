// js/validaciones.js  (ES Module compartido)

// === UTILIDADES COMPARTIDAS (exportadas) ===
export const trim = (elOrStr) => {
	if (typeof elOrStr === "string") return elOrStr.trim();
	return elOrStr && typeof elOrStr.value === "string"
		? elOrStr.value.trim()
		: "";
};

export function emailValido(valor) {
	const v = trim(valor);
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
	return { ok: true, msg: "" };
}

export function clavesIguales(a, b) {
	const va = typeof a === "string" ? a : a?.value || "";
	const vb = typeof b === "string" ? b : b?.value || "";
	return va === vb;
}

/**
 * Pinta feedback estilo Bootstrap (reutilizable en registro/recuperar)
 * Espera que exista un <small id="error-<input.id">...</small> para el mensaje.
 */
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

// (Si necesitas también edadOK/sanitizadores para recuperar, expórtalos aquí)
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
export function sanitizeTextInput(el) {
	if (!el || typeof el.value !== "string") return;
	el.value = el.value.normalize("NFC").trim();
}

// === SOLO PARA PÁGINA DE REGISTRO ===
// Importa persistencia (misma carpeta /js/)
import {
	getUsers,
	saveUsers,
	findUserByEmail,
	/* opcional */ findUserByUsername,
	sha256,
	setCurrentUser,
} from "./auth.repo.js";

function announce(msg) {
	const el = document.getElementById("form-alert");
	if (!el) return;
	el.textContent = msg;
	el.classList.remove("visually-hidden");
	setTimeout(() => el.classList.add("visually-hidden"), 3000);
}

// Monta la lógica de REGISTRO solo si existe el formulario en la página
export function setupRegistroPage() {
	const form = document.getElementById("registroForm");
	const limpiarBtn = document.getElementById("limpiarBtn");
	const enviarBtn = document.getElementById("enviarBtn");
	if (!form || !limpiarBtn || !enviarBtn) return; // no estamos en registro.html

	const inputs = {
		nombreCompleto: document.getElementById("nombreCompleto"),
		nombreUsuario: document.getElementById("nombreUsuario"),
		email: document.getElementById("email"),
		clave: document.getElementById("clave"),
		repetirClave: document.getElementById("repetirClave"),
		fechaNacimiento: document.getElementById("fechaNacimiento"),
		direccion: document.getElementById("direccion"),
	};

	// Límite fecha (13+)
	{
		const hoy = new Date();
		const max = new Date(hoy.getFullYear() - 13, hoy.getMonth(), hoy.getDate());
		const toISO = (d) => d.toISOString().slice(0, 10);
		inputs.fechaNacimiento?.setAttribute("max", toISO(max));
	}

	const noVacio = (el) => (el === inputs.direccion ? true : trim(el) !== "");
	const soloLetras = (el) => {
		const re = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/;
		const v = trim(el);
		return v !== "" && re.test(v);
	};

	function validarCampo(el) {
		switch (el.id) {
			case "nombreCompleto":
				if (!noVacio(el))
					return setFeedback(el, false, "El nombre completo es obligatorio.");
				if (!soloLetras(el))
					return setFeedback(el, false, "El nombre solo debe contener letras.");
				return setFeedback(el, true);

			case "nombreUsuario":
				return setFeedback(
					el,
					noVacio(el),
					"El nombre de usuario es obligatorio."
				);

			case "email":
				return setFeedback(
					el,
					noVacio(el) && emailValido(el.value),
					"Ingrese un correo válido."
				);

			case "clave": {
				const res = validarClave(el.value);
				setFeedback(el, res.ok, res.msg || "");
				if (inputs.repetirClave?.value) {
					setFeedback(
						inputs.repetirClave,
						clavesIguales(inputs.clave, inputs.repetirClave),
						"Las claves no coinciden."
					);
				}
				return;
			}

			case "repetirClave":
				return setFeedback(
					el,
					clavesIguales(inputs.clave, el),
					"Las claves no coinciden."
				);

			case "fechaNacimiento":
				return setFeedback(el, edadOKInput(el), "Debe tener al menos 13 años.");

			case "direccion":
				if (trim(el) === "") el.classList.remove("is-valid", "is-invalid");
				else setFeedback(el, true);
				return;
		}
	}

	function limpiarFeedback() {
		Object.values(inputs).forEach((i) => {
			if (!i) return;
			i.classList.remove("is-valid", "is-invalid");
			const slot = document.getElementById(`error-${i.id}`);
			if (slot) {
				slot.textContent = "";
				slot.style.display = "none";
				slot.removeAttribute("role");
			}
		});
		enviarBtn.classList.remove("btn-success");
		enviarBtn.classList.add("btn-primary");
		enviarBtn.textContent = "Enviar registro";
	}

	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		enviarBtn.disabled = true;

		// Sanear
		Object.values(inputs).forEach(sanitizeTextInput);

		let ok = true;

		if (!noVacio(inputs.nombreCompleto)) {
			setFeedback(
				inputs.nombreCompleto,
				false,
				"El nombre completo es obligatorio."
			);
			ok = false;
		} else if (!soloLetras(inputs.nombreCompleto)) {
			setFeedback(
				inputs.nombreCompleto,
				false,
				"El nombre solo debe contener letras."
			);
			ok = false;
		} else setFeedback(inputs.nombreCompleto, true);

		if (!noVacio(inputs.nombreUsuario)) {
			setFeedback(
				inputs.nombreUsuario,
				false,
				"El nombre de usuario es obligatorio."
			);
			ok = false;
		} else setFeedback(inputs.nombreUsuario, true);

		if (!noVacio(inputs.email)) {
			setFeedback(inputs.email, false, "El correo electrónico es obligatorio.");
			ok = false;
		} else if (!emailValido(inputs.email.value)) {
			setFeedback(
				inputs.email,
				false,
				"El formato del correo electrónico es inválido."
			);
			ok = false;
		} else setFeedback(inputs.email, true);

		if (!noVacio(inputs.clave)) {
			setFeedback(inputs.clave, false, "La clave de ingreso es obligatoria.");
			ok = false;
		} else {
			const res = validarClave(inputs.clave.value);
			if (!res.ok) {
				setFeedback(inputs.clave, false, res.msg);
				ok = false;
			} else setFeedback(inputs.clave, true);
		}

		if (!noVacio(inputs.repetirClave)) {
			setFeedback(inputs.repetirClave, false, "Debe repetir la clave.");
			ok = false;
		} else if (!clavesIguales(inputs.clave, inputs.repetirClave)) {
			setFeedback(inputs.repetirClave, false, "Las claves no coinciden.");
			ok = false;
		} else setFeedback(inputs.repetirClave, true);

		if (!noVacio(inputs.fechaNacimiento)) {
			setFeedback(
				inputs.fechaNacimiento,
				false,
				"La fecha de nacimiento es obligatoria."
			);
			ok = false;
		} else if (!edadOKInput(inputs.fechaNacimiento)) {
			setFeedback(
				inputs.fechaNacimiento,
				false,
				"Debe tener al menos 13 años."
			);
			ok = false;
		} else setFeedback(inputs.fechaNacimiento, true);

		if (trim(inputs.direccion) !== "") setFeedback(inputs.direccion, true);
		else {
			inputs.direccion?.classList.remove("is-valid", "is-invalid");
			const slot = inputs.direccion
				? document.getElementById(`error-${inputs.direccion.id}`)
				: null;
			if (slot) {
				slot.textContent = "";
				slot.style.display = "none";
				slot.removeAttribute("role");
			}
		}

		if (!ok) {
			announce("Revisa los campos marcados en rojo.");
			enviarBtn.disabled = false;
			return;
		}

		// Persistencia (duplicados + guardado)
		const email = trim(inputs.email);
		const nombreUsuario = trim(inputs.nombreUsuario);

		if (findUserByEmail(email)) {
			setFeedback(inputs.email, false, "Este correo ya está registrado.");
			enviarBtn.disabled = false;
			return;
		}
		// Si quieres validar username único, descomenta:
		// if (findUserByUsername?.(nombreUsuario)) {
		//   setFeedback(inputs.nombreUsuario, false, "Ese nombre de usuario ya existe.");
		//   enviarBtn.disabled = false;
		//   return;
		// }

		const users = getUsers();
		const user = {
			id: crypto.randomUUID(),
			email,
			nombreUsuario,
			nombreCompleto: trim(inputs.nombreCompleto),
			fechaNacimiento: inputs.fechaNacimiento.value,
			direccion: trim(inputs.direccion),
			passwordHash: await sha256(inputs.clave.value),
			avatarUrl: "",
			telefono: "",
		};
		users.push(user);
		saveUsers(users);
		setCurrentUser(user);

		alert("¡Registro exitoso! Formulario válido.");
		announce("Registro exitoso.");
		form.reset();
		limpiarFeedback();
		enviarBtn.classList.remove("btn-primary");
		enviarBtn.classList.add("btn-success");
		enviarBtn.textContent = "¡Registro completado!";
		enviarBtn.disabled = false;
	});

	limpiarBtn.addEventListener("click", () => {
		form.reset();
		limpiarFeedback();
		announce("Formulario limpiado.");
	});

	// Validación en tiempo real
	Object.values(inputs).forEach((input) => {
		if (!input) return;
		input.addEventListener("input", () => validarCampo(input));
		input.addEventListener("blur", () => validarCampo(input));
	});
}

// Auto-inicializa SOLO si estamos en registro.html (existe #registroForm)
document.addEventListener("DOMContentLoaded", () => {
	if (document.getElementById("registroForm")) {
		setupRegistroPage();
	}
});
