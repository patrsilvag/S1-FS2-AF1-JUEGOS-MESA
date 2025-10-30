document.addEventListener("DOMContentLoaded", () => {
	// === refs ===
	const form = document.getElementById("registroForm");
	const limpiarBtn = document.getElementById("limpiarBtn");
	const enviarBtn = document.getElementById("enviarBtn");
	const formAlert = document.getElementById("form-alert");

	if (!form || !limpiarBtn || !enviarBtn) return;

	const inputs = {
		nombreCompleto: document.getElementById("nombreCompleto"),
		nombreUsuario: document.getElementById("nombreUsuario"),
		email: document.getElementById("email"),
		clave: document.getElementById("clave"),
		repetirClave: document.getElementById("repetirClave"),
		fechaNacimiento: document.getElementById("fechaNacimiento"),
		direccion: document.getElementById("direccion"), // opcional
	};

	// === utilitarios ===
	const trim = (el) =>
		el && typeof el.value === "string" ? el.value.trim() : "";

	function sanitizeTextInput(el) {
		if (!el || typeof el.value !== "string") return;
		el.value = el.value.normalize("NFC").trim();
	}

	function announce(msg) {
		if (!formAlert) return;
		formAlert.textContent = msg;
		formAlert.classList.remove("visually-hidden");
		setTimeout(() => formAlert.classList.add("visually-hidden"), 3000);
	}

	function noVacio(el) {
		if (el === inputs.direccion) return true; // dirección es opcional
		return trim(el) !== "";
	}

	function soloLetras(el) {
		const re = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/;
		const v = trim(el);
		return v !== "" && re.test(v);
	}

	function emailValido(el) {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(trim(el));
	}

	function validarClave(el) {
		const v = el.value || "";
		if (v.length < 6 || v.length > 18) {
			return { ok: false, msg: "La clave debe tener entre 6 y 18 caracteres." };
		}
		if (!/[A-Z]/.test(v)) {
			return {
				ok: false,
				msg: "La clave debe contener al menos una mayúscula.",
			};
		}
		if (!/[0-9]/.test(v)) {
			return { ok: false, msg: "La clave debe contener al menos un número." };
		}
		return { ok: true, msg: "" };
	}

	function clavesIguales(a, b) {
		return (a.value || "") === (b.value || "");
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

	function setFeedback(input, ok, msg = "") {
		const errorSlot = document.getElementById(`error-${input.id}`);
		input.classList.toggle("is-valid", ok);
		input.classList.toggle("is-invalid", !ok);
		if (errorSlot) {
			errorSlot.textContent = ok ? "" : msg;
			errorSlot.style.display = ok ? "none" : "block";
			if (!ok) errorSlot.setAttribute("role", "alert");
			else errorSlot.removeAttribute("role");
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

	// === Mejora UX: límite de fecha (no menores de 13) ===
	{
		const hoy = new Date();
		const max = new Date(hoy.getFullYear() - 13, hoy.getMonth(), hoy.getDate());
		const toISO = (d) => d.toISOString().slice(0, 10);
		inputs.fechaNacimiento.setAttribute("max", toISO(max));
	}

	// === Validación de campo individual (reutilizable en 'input' y 'blur') ===
	function validarCampo(input) {
		switch (input.id) {
			case "nombreCompleto":
				if (!noVacio(input))
					return setFeedback(
						input,
						false,
						"El nombre completo es obligatorio."
					);
				if (!soloLetras(input))
					return setFeedback(
						input,
						false,
						"El nombre solo debe contener letras."
					);
				return setFeedback(input, true);

			case "nombreUsuario":
				return setFeedback(
					input,
					noVacio(input),
					"El nombre de usuario es obligatorio."
				);

			case "email":
				return setFeedback(
					input,
					noVacio(input) && emailValido(input),
					"Ingrese un correo válido."
				);

			case "clave": {
				const res = validarClave(input);
				setFeedback(input, res.ok, res.msg || "");
				// revalida coincidencia si ya hay repetición
				if (inputs.repetirClave.value) {
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
					input,
					clavesIguales(inputs.clave, inputs.repetirClave),
					"Las claves no coinciden."
				);

			case "fechaNacimiento":
				return setFeedback(
					input,
					edadOK(input),
					"Debe tener al menos 13 años."
				);

			case "direccion":
				// opcional: no marcar inválido si vacío
				if (trim(input) === "")
					input.classList.remove("is-valid", "is-invalid");
				else setFeedback(input, true);
				return;
		}
	}

	// === validación principal ===
	function validarFormulario(e) {
		e.preventDefault();
		enviarBtn.disabled = true;

		// sanea entradas
		Object.values(inputs).forEach(sanitizeTextInput);

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
			setFeedback(
				inputs.nombreCompleto,
				false,
				"El nombre solo debe contener letras."
			);
			ok = false;
		} else setFeedback(inputs.nombreCompleto, true);

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
			setFeedback(
				inputs.fechaNacimiento,
				false,
				"Debe tener al menos 13 años."
			);
			ok = false;
		} else setFeedback(inputs.fechaNacimiento, true);

		// Dirección (opcional)
		if (trim(inputs.direccion) !== "") setFeedback(inputs.direccion, true);
		else {
			inputs.direccion.classList.remove("is-valid", "is-invalid");
			const slot = document.getElementById(`error-${inputs.direccion.id}`);
			if (slot) {
				slot.textContent = "";
				slot.style.display = "none";
				slot.removeAttribute("role");
			}
		}

		if (ok) {
			alert("¡Registro exitoso! Formulario válido.");
			announce("Registro exitoso.");
			form.reset();
			limpiarFeedback();
			enviarBtn.classList.remove("btn-primary");
			enviarBtn.classList.add("btn-success");
			enviarBtn.textContent = "¡Registro completado!";
		} else {
			announce("Revisa los campos marcados en rojo.");
		}

		enviarBtn.disabled = false;
	}

	// eventos
	form.addEventListener("submit", validarFormulario);

	limpiarBtn.addEventListener("click", () => {
		form.reset();
		limpiarFeedback();
		announce("Formulario limpiado.");
	});

	// Validación en tiempo real + on blur
	Object.values(inputs).forEach((input) => {
		if (!input) return;
		input.addEventListener("input", () => validarCampo(input));
		input.addEventListener("blur", () => validarCampo(input));
	});
});
