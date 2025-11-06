// js/auth.repo.js
const LS_USERS = "users";
const LS_CURRENT = "currentUser";
const LS_RESETS = "resetCodes";

// ---------- Utils ----------
function safeParse(json, fallback) {
	try {
		return JSON.parse(json);
	} catch {
		return fallback;
	}
}
function normEmail(email) {
	return (email || "").trim().toLowerCase();
}

// ---------- Hash ----------
export async function sha256(text) {
	const enc = new TextEncoder().encode(text || "");
	const hash = await crypto.subtle.digest("SHA-256", enc);
	return [...new Uint8Array(hash)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

// ---------- Users ----------
export function getUsers() {
	return safeParse(localStorage.getItem(LS_USERS), []) || [];
}
export function saveUsers(users) {
	localStorage.setItem(LS_USERS, JSON.stringify(users || []));
}

/**
 * Buscar por correo (normalizado)
 */
export function findUserByEmail(email) {
	const target = normEmail(email);
	if (!target) return undefined;
	return getUsers().find((u) => normEmail(u.email) === target);
}

/**
 * (Opcional) Buscar por nombre de usuario.
 * Úsalo solo si decides validar unicidad de username.
 */
export function findUserByUsername(username) {
	const u = (username || "").trim().toLowerCase();
	if (!u) return undefined;
	return getUsers().find(
		(x) => (x.nombreUsuario || "").trim().toLowerCase() === u
	);
}

/**
 * Actualizar un usuario por id (útil para "perfil" o reset de password)
 */
export function updateUserById(id, patch) {
	const users = getUsers();
	const i = users.findIndex((u) => u.id === id);
	if (i === -1) return false;
	users[i] = { ...users[i], ...patch };
	saveUsers(users);
	return true;
}

// ---------- Session ----------
export function setCurrentUser(userOrNull) {
	localStorage.setItem(
		LS_CURRENT,
		userOrNull ? JSON.stringify(userOrNull) : "null"
	);
}
export function getCurrentUser() {
	return safeParse(localStorage.getItem(LS_CURRENT), null);
}

/**
 * Sincroniza currentUser con la versión guardada (por si se actualizó en users).
 * Llamar después de cambios a perfil o contraseña si quieres mantener sesión coherente.
 */
export function refreshCurrentUser() {
	const cur = getCurrentUser();
	if (!cur) return null;
	const updated = getUsers().find((u) => u.id === cur.id);
	setCurrentUser(updated || null);
	return updated || null;
}

// ---------- Password reset (demo con localStorage) ----------
export function setResetCode(email, code) {
	const map = safeParse(localStorage.getItem(LS_RESETS), {}) || {};
	map[normEmail(email)] = String(code || "");
	localStorage.setItem(LS_RESETS, JSON.stringify(map));
}
export function getResetCode(email) {
	const map = safeParse(localStorage.getItem(LS_RESETS), {}) || {};
	return map[normEmail(email)] || null;
}
export function clearResetCode(email) {
	const map = safeParse(localStorage.getItem(LS_RESETS), {}) || {};
	delete map[normEmail(email)];
	localStorage.setItem(LS_RESETS, JSON.stringify(map));
}
