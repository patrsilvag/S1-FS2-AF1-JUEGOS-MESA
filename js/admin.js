// js/admin.js — versión estable para panel admin
// Muestra lista de usuarios y permite activar/desactivar su estado

import {
	getUsers,
	updateUserById,
	refreshCurrentUser,
	STATUS,
	ROLES,
} from "./auth.repo.js";

function $(sel) {
	return document.querySelector(sel);
}

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

function renderTable() {
	const tbody = $("#tabla-usuarios tbody");
	if (!tbody) return;
	tbody.innerHTML = "";

	const users = getUsers();

	users.forEach((u) => {
		const tr = document.createElement("tr");
		tr.innerHTML = `
      <td>${u.email}</td>
      <td>${usernameOrFallback(u)}</td>
      <td>${roleBadge(u.role)}</td>
      <td>${statusBadge(u.status)}</td>
      <td class="text-end">
        <button type="button" class="btn btn-sm ${
					u.status === STATUS.ACTIVE
						? "btn-outline-danger"
						: "btn-outline-success"
				}" data-id="${u.id}">
          ${u.status === STATUS.ACTIVE ? "Deshabilitar" : "Habilitar"}
        </button>
      </td>
    `;
		tbody.appendChild(tr);
	});
}

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

export function setupAdminPage() {
	renderTable();
	wireActions();
}
