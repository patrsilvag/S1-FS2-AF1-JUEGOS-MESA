// ===========================================================
// CART - Evita el acceso al carrito si el usuario no ha iniciado sesión, mostrando una alerta o mensaje alternativo
//  sin duplicar site.js
// ===========================================================

import { getCurrentUser } from "./auth.repo.js";

document.addEventListener("DOMContentLoaded", () => {
	const user = getCurrentUser();

	// Si el usuario no está autenticado (ej: entró directo a carrito.html)
	if (!user) {
		if (typeof showAlert === "function") {
			showAlert(
				"form-alert",
				"Debes iniciar sesión para acceder al carrito.",
				"warning"
			);
		} else {
			// Si showAlert no está disponible, se asegura fallback básico
			const alertBox = document.getElementById("form-alert");
			if (alertBox) {
				alertBox.className = "alert alert-warning";
				alertBox.textContent = "Debes iniciar sesión para acceder al carrito.";
				alertBox.classList.remove("d-none");
			}
		}
	}
});
