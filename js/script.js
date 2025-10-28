// === refs ===
const form = document.getElementById("registroForm");
const limpiarBtn = document.getElementById("limpiarBtn");
const enviarBtn = document.getElementById("enviarBtn");

const inputs = {
	nombreCompleto: document.getElementById("nombreCompleto"),
	nombreUsuario: document.getElementById("nombreUsuario"),
	email: document.getElementById("email"),
	clave: document.getElementById("clave"),
	repetirClave: document.getElementById("repetirClave"),
	fechaNacimiento: document.getElementById("fechaNacimiento"),
	direccion: document.getElementById("direccion"), // opcional
};

// === helpers ===
const trim = (el) => el.value.trim();

function noVacio(el) {
	if (el === inputs.direccion) return true; // dirección es opcional
	return trim(el) !== "";
}

function soloLetras(el) {
	const re = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/;
	return re.test(el.value.trim());
}


function emailValido(el) {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(trim(el));
}

function validarClave(el) {
	const v = el.value;
	if (v.length < 6 || v.length > 18) {
		return { ok: false, msg: "La clave debe tener entre 6 y 18 caracteres." };
	}
	if (!/[A-Z]/.test(v)) {
		return {
			ok: false,
			msg: "La clave debe contener al menos una letra mayúscula.",
		};
	}
	if (!/[0-9]/.test(v)) {
		return { ok: false, msg: "La clave debe contener al menos un número." };
	}
	return { ok: true, msg: "" };
}

function clavesIguales(a, b) {
	return a.value === b.value;
}

function edadOK(el) {
	if (!el.value) return false;
	const hoy = new Date();
	const fn = new Date(el.value);
	const limite = new Date(
		hoy.getFullYear() - 13,
		hoy.getMonth(),
		hoy.getDate()
	);
	return fn <= limite;
}

// feedback visual (Bootstrap)
function setFeedback(input, ok, msg = "") {
	// dónde mostrar el error
	const errorSlot = document.getElementById(`error-${input.id}`);
	// clases
	input.classList.toggle("is-valid", ok);
	input.classList.toggle("is-invalid", !ok);

	if (errorSlot) {
		errorSlot.textContent = ok ? "" : msg;
		errorSlot.style.display = ok ? "none" : "block";
	}
}

function limpiarFeedback() {
	Object.values(inputs).forEach((i) => {
		i.classList.remove("is-valid", "is-invalid");
		const slot = document.getElementById(`error-${i.id}`);
		if (slot) {
			slot.textContent = "";
			slot.style.display = "none";
		}
	});
	enviarBtn.classList.remove("btn-success");
	enviarBtn.classList.add("btn-primary");
	enviarBtn.textContent = "Enviar registro";
}

// === validación principal ===
function validarFormulario(e) {
	e.preventDefault();

	let ok = true;

	// 1) Nombre completo
	if (!noVacio(inputs.nombreCompleto)) {
		setFeedback(
			inputs.nombreCompleto,
			false,
			"El nombre completo es obligatorio."
		);
		ok = false;
	} else if (!soloLetras(inputs.nombreCompleto)) {
		// Ahora esto se ejecuta solo si no está vacío
		setFeedback(
			inputs.nombreCompleto,
			false,
			"El nombre solo debe contener letras."
		);
		ok = false;
	} else {
		setFeedback(inputs.nombreCompleto, true);
	}

	// 2) Usuario
	if (!noVacio(inputs.nombreUsuario)) {
		setFeedback(
			inputs.nombreUsuario,
			false,
			"El nombre de usuario es obligatorio."
		);
		ok = false;
	} else setFeedback(inputs.nombreUsuario, true);

	// 3) Email
	if (!noVacio(inputs.email)) {
		setFeedback(inputs.email, false, "El correo electrónico es obligatorio.");
		ok = false;
	} else if (!emailValido(inputs.email)) {
		setFeedback(
			inputs.email,
			false,
			"El formato del correo electrónico es inválido."
		);
		ok = false;
	} else setFeedback(inputs.email, true);

	// 4) Clave
	if (!noVacio(inputs.clave)) {
		setFeedback(inputs.clave, false, "La clave de ingreso es obligatoria.");
		ok = false;
	} else {
		const res = validarClave(inputs.clave);
		if (!res.ok) {
			setFeedback(inputs.clave, false, res.msg);
			ok = false;
		} else setFeedback(inputs.clave, true);
	}

	// 5) Repetir clave
	if (!noVacio(inputs.repetirClave)) {
		setFeedback(inputs.repetirClave, false, "Debe repetir la clave.");
		ok = false;
	} else if (!clavesIguales(inputs.clave, inputs.repetirClave)) {
		setFeedback(inputs.repetirClave, false, "Las claves no coinciden.");
		ok = false;
	} else setFeedback(inputs.repetirClave, true);

	// 6) Fecha de nacimiento
	if (!noVacio(inputs.fechaNacimiento)) {
		setFeedback(
			inputs.fechaNacimiento,
			false,
			"La fecha de nacimiento es obligatoria."
		);
		ok = false;
	} else if (!edadOK(inputs.fechaNacimiento)) {
		setFeedback(inputs.fechaNacimiento, false, "Debe tener al menos 13 años.");
		ok = false;
	} else setFeedback(inputs.fechaNacimiento, true);

	// Dirección (opcional) siempre ok visualmente si hay algo escrito
	if (trim(inputs.direccion) !== "") {
		setFeedback(inputs.direccion, true);
	} else {
		// sin borde rojo/verde si está vacío
		inputs.direccion.classList.remove("is-valid", "is-invalid");
	}

	// Éxito
	if (ok) {
		alert("¡Registro exitoso! Formulario válido.");
		enviarBtn.classList.remove("btn-primary");
		enviarBtn.classList.add("btn-success");
		enviarBtn.textContent = "¡Registro completado!";
		form.reset();
		limpiarFeedback();
	}
}

// === eventos ===
form.addEventListener("submit", validarFormulario);
limpiarBtn.addEventListener("click", () => {
	form.reset();
	limpiarFeedback();
});

// Validación en tiempo real (opcional pero útil)
Object.values(inputs).forEach((input) => {
	input.addEventListener("input", () => {
		// sólo revalidar el campo editado, de forma ligera
		switch (input.id) {
			case "nombreCompleto":
				if (!noVacio(input)) {
					setFeedback(input, false, "El nombre completo es obligatorio.");
				} else if (!soloLetras(input)) {
					setFeedback(input, false, "El nombre solo debe contener letras.");
				} else {
					setFeedback(input, true);
				}
				break;
			case "nombreUsuario":
				setFeedback(
					input,
					noVacio(input),
					`El ${
						input.id === "nombreCompleto"
							? "nombre completo"
							: "nombre de usuario"
					} es obligatorio.`
				);
				break;
			case "email":
				setFeedback(
					input,
					noVacio(input) && emailValido(input),
					"Ingrese un correo válido."
				);
				break;
			case "clave": {
				const res = validarClave(input);
				setFeedback(input, res.ok, res.msg || "");
				// si cambia la clave, revalida coincidencia
				if (inputs.repetirClave.value) {
					setFeedback(
						inputs.repetirClave,
						clavesIguales(inputs.clave, inputs.repetirClave),
						"Las claves no coinciden."
					);
				}
				break;
			}
			case "repetirClave":
				setFeedback(
					input,
					clavesIguales(inputs.clave, inputs.repetirClave),
					"Las claves no coinciden."
				);
				break;
			case "fechaNacimiento":
				setFeedback(input, edadOK(input), "Debe tener al menos 13 años.");
				break;
			case "direccion":
				// opcional: no marcar como inválido si está vacío
				if (trim(input) === "")
					input.classList.remove("is-valid", "is-invalid");
				else setFeedback(input, true);
				break;
		}
	});
});
