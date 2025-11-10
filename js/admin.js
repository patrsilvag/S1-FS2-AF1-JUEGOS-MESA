// ======================================================
// admin.js — Panel de administración accesible y seguro
// ======================================================

import {
	getUsers,
	updateUserById,
	refreshCurrentUser,
	getCurrentUser,
	STATUS,
	ROLES,
} from "./auth.repo.js";

// ---------- Utilidades DOM ----------
function $(sel) {
	return document.querySelector(sel);
}

// ---------- Alertas accesibles ----------
const alertBox = $("#admin-alert");
const showAlert = (msg, type = "danger") => {
	if (!alertBox) return;
	alertBox.className = "alert alert-" + type;
	alertBox.textContent = msg;
	alertBox.classList.remove("d-none");
	alertBox.setAttribute("tabindex", "-1");
	alertBox.focus();
};

// ---------- Generadores de contenido ----------
function usernameOrFallback(u) {
	return u?.nombreUsuario?.trim() || (u?.email ? u.email.split("@")[0] : "—");
}

function roleBadge(role) {
	const label = role === ROLES.ADMIN ? "Admin" : "Cliente";
	return `<span class="badge text-bg-primary">${label}</span>`;
}

function statusBadge(status) {
	const active = status === STATUS.ACTIVE;
	return `<span class="badge ${
		active ? "text-bg-success" : "text-bg-secondary"
	}">
		${active ? "Activo" : "Inactivo"}
	</span>`;
}

// ---------- Renderizado accesible ----------
function renderTable() {
	const tbody = $("#tabla-usuarios tbody");
	if (!tbody) return;
	tbody.innerHTML = "";

	const users = getUsers();

	users.forEach((u) => {
		const tr = document.createElement("tr");

		// texto visible y atributos ARIA coherentes
		const isActive = u.status === STATUS.ACTIVE;
		const btnLabel = isActive
			? `Desactivar usuario ${usernameOrFallback(u)}`
			: `Activar usuario ${usernameOrFallback(u)}`;

		tr.innerHTML = `
			<td data-label="Email">${u.email}</td>
			<td data-label="Usuario">${usernameOrFallback(u)}</td>
			<td data-label="Rol">${roleBadge(u.role)}</td>
			<td data-label="Estado">${statusBadge(u.status)}</td>
			<td data-label="Acciones" class="text-end">
				<button 
					type="button" 
					class="btn btn-sm ${isActive ? "btn-outline-danger" : "btn-outline-success"}" 
					data-id="${u.id}"
					aria-label="${btnLabel}"
					aria-pressed="${isActive}"
					aria-describedby="acciones-info"
				>
					${isActive ? "Desactivar" : "Activar"}
				</button>
			</td>
		`;

		tbody.appendChild(tr);
	});
}

// ---------- Acciones ----------
function wireActions() {
	const tbody = $("#tabla-usuarios tbody");
	if (!tbody) return;

	tbody.addEventListener("click", (e) => {
		const btn = e.target.closest("button[data-id]");
		if (!btn) return;

		const id = btn.dataset.id;
		const users = getUsers();
		const user = users.find((x) => x.id === id);
		if (!user) return;

		const newStatus =
			user.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;

		updateUserById(id, { status: newStatus });
		refreshCurrentUser();
		renderTable();
	});
}

// ---------- Protección y arranque ----------
function protectAndInit() {
	const user = getCurrentUser();

	if (!user || user.status !== STATUS.ACTIVE || user.role !== ROLES.ADMIN) {
		showAlert("Acceso denegado. Solo administradores pueden ver esta sección.");
		setTimeout(() => (window.location.href = "index.html"), 900);
		return;
	}

	renderTable();
	wireActions();
}

document.addEventListener("DOMContentLoaded", protectAndInit);
