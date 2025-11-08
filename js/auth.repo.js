// js/auth.repo.js

const LS_USERS = "users";
const LS_CURRENT = "currentUser";
const LS_RESETS = "resetCodes";

/* =============== Utils =============== */
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
function toSafeUser(u) {
	if (!u) return null;
	const { passwordHash, ...safe } = u;
	return safe;
}

/* =============== Hash =============== */
export async function sha256(text) {
	const enc = new TextEncoder().encode(text || "");
	const hash = await crypto.subtle.digest("SHA-256", enc);
	return [...new Uint8Array(hash)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

/* =============== Users =============== */
export function getUsers() {
	return safeParse(localStorage.getItem(LS_USERS), []) || [];
}
export function saveUsers(users) {
	localStorage.setItem(LS_USERS, JSON.stringify(users || []));
}

/** Buscar por correo (normalizado) */
export function findUserByEmail(email) {
	const target = normEmail(email);
	if (!target) return undefined;
	return getUsers().find((u) => normEmail(u.email) === target);
}

/** (Opcional) Buscar por nombre de usuario */
export function findUserByUsername(username) {
	const u = (username || "").trim().toLowerCase();
	if (!u) return undefined;
	return getUsers().find(
		(x) => (x.nombreUsuario || "").trim().toLowerCase() === u
	);
}

/** Actualizar un usuario por id (perfil / reset pass) */
export function updateUserById(id, patch) {
	const users = getUsers();
	const i = users.findIndex((u) => u.id === id);
	if (i === -1) return false;
	users[i] = { ...users[i], ...patch };
	saveUsers(users);
	return true;
}

/* =============== Session =============== */
export function setCurrentUser(userOrNull) {
	// Siempre guarda una versión segura (sin passwordHash)
	const safe = userOrNull ? toSafeUser(userOrNull) : null;
	localStorage.setItem(LS_CURRENT, safe ? JSON.stringify(safe) : "null");
}
export function getCurrentUser() {
	return safeParse(localStorage.getItem(LS_CURRENT), null);
}

/** Sincroniza currentUser con la versión guardada */
export function refreshCurrentUser() {
	const cur = getCurrentUser();
	if (!cur) return null;
	const updated = getUsers().find((u) => u.id === cur.id);
	const safe = toSafeUser(updated || null);
	setCurrentUser(safe);
	return safe;
}

/* =============== Password reset (demo con localStorage) =============== */
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

/* =============== Roles, permisos y control de acceso (RBAC) =============== */
export const ROLES = { ADMIN: "admin", CLIENTE: "cliente" };
export const STATUS = { ACTIVE: "active", INACTIVE: "inactive" };

const POLICY = {
	"user:list": [ROLES.ADMIN],
	"user:create": [ROLES.ADMIN],
	"user:update": [ROLES.ADMIN],
	"user:disable": [ROLES.ADMIN],
	"user:enable": [ROLES.ADMIN],
	"catalog:manage": [ROLES.ADMIN],
	"reports:view": [ROLES.ADMIN],
	"cart:checkout": [ROLES.ADMIN, ROLES.CLIENTE],
	"profile:self": [ROLES.ADMIN, ROLES.CLIENTE],
};
export function can(user, action) {
	if (!user) return false;
	const allowed = POLICY[action] || [];
	return allowed.includes(user.role);
}

/* =============== Seed de admin (opcional) =============== */
export async function ensureAdminSeed() {
	const users = getUsers();
	if (users.length === 0) {
		const passwordHash = await sha256("Admin123"); // clave por defecto
		const admin = {
			id: crypto.randomUUID(),
			email: "admin@local.com",
			nombreUsuario: "admin",
			nombreCompleto: "Administrador",
			passwordHash,
			role: ROLES.ADMIN,
			status: STATUS.ACTIVE,
			createdAt: Date.now(),
			// Campos opcionales alineados con el modelo actual (sin teléfono)
			direccion: "",
			fechaNacimiento: "",
			avatarUrl: "",
		};
		saveUsers([admin]);
		console.info("✅ Admin creado: admin@local.com / Admin123");
	}
}
