// ============================================================
//  auth.repo.js - Gestión de usuarios, sesiones y reset codes
// ============================================================

const LS_USERS = "users";
const LS_CURRENT = "currentUser";
const LS_RESETS = "resetCodes";

/* ===== Utilidades ===== */
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

/* ===== Hash ===== */
export async function sha256(text) {
	const enc = new TextEncoder().encode(text || "");
	const hash = await crypto.subtle.digest("SHA-256", enc);
	return [...new Uint8Array(hash)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

/* ===== Usuarios ===== */
export function getUsers() {
	return safeParse(localStorage.getItem(LS_USERS), []) || [];
}
export function saveUsers(users) {
	localStorage.setItem(LS_USERS, JSON.stringify(users || []));
}
export function findUserByEmail(email) {
	const target = normEmail(email);
	if (!target) return undefined;
	return getUsers().find((u) => normEmail(u.email) === target);
}
export function updateUserById(id, patch) {
	const users = getUsers();
	const i = users.findIndex((u) => u.id === id);
	if (i === -1) return false;
	users[i] = { ...users[i], ...patch };
	saveUsers(users);
	return true;
}

/* ===== Sesión ===== */
export function setCurrentUser(userOrNull) {
	const safe = userOrNull ? toSafeUser(userOrNull) : null;
	localStorage.setItem(LS_CURRENT, safe ? JSON.stringify(safe) : "null");
}
export function getCurrentUser() {
	return safeParse(localStorage.getItem(LS_CURRENT), null);
}
export function refreshCurrentUser() {
	const cur = getCurrentUser();
	if (!cur) return null;
	const updated = getUsers().find((u) => u.id === cur.id);
	const safe = toSafeUser(updated || null);
	setCurrentUser(safe);
	return safe;
}

/* ===== Recuperar contraseña (demo) ===== */
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

/* ===== Roles y políticas ===== */
export const ROLES = { ADMIN: "admin", CLIENTE: "cliente" };
export const STATUS = { ACTIVE: "active", INACTIVE: "inactive" };

const POLICY = {
	"profile:self": [ROLES.ADMIN, ROLES.CLIENTE],
};
export function can(user, action) {
	if (!user) return false;
	const allowed = POLICY[action] || [];
	return allowed.includes(user.role);
}

/* ===== Admin Seed opcional ===== */
export async function ensureAdminSeed() {
	const users = getUsers();
	if (users.length === 0) {
		const passwordHash = await sha256("Admin123");
		const admin = {
			id: crypto.randomUUID(),
			email: "admin@local.com",
			nombreUsuario: "admin",
			nombreCompleto: "Administrador",
			passwordHash,
			role: ROLES.ADMIN,
			status: STATUS.ACTIVE,
			createdAt: Date.now(),
			direccion: "",
			fechaNacimiento: "",
		};
		saveUsers([admin]);
		console.info("✅ Admin creado: admin@local.com / Admin123");
	}
}
