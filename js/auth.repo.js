// js/auth.repo.js
const LS_USERS = "users";
const LS_CURRENT = "currentUser";
const LS_RESETS = "resetCodes";

export async function sha256(text) {
	const enc = new TextEncoder().encode(text);
	const hash = await crypto.subtle.digest("SHA-256", enc);
	return [...new Uint8Array(hash)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

export function getUsers() {
	return JSON.parse(localStorage.getItem(LS_USERS) || "[]");
}
export function saveUsers(users) {
	localStorage.setItem(LS_USERS, JSON.stringify(users));
}

export function findUserByEmail(email) {
	return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function setCurrentUser(userOrNull) {
	localStorage.setItem(
		LS_CURRENT,
		userOrNull ? JSON.stringify(userOrNull) : "null"
	);
}
export function getCurrentUser() {
	return JSON.parse(localStorage.getItem(LS_CURRENT) || "null");
}

export function setResetCode(email, code) {
	const map = JSON.parse(localStorage.getItem(LS_RESETS) || "{}");
	map[email.toLowerCase()] = code;
	localStorage.setItem(LS_RESETS, JSON.stringify(map));
}
export function getResetCode(email) {
	const map = JSON.parse(localStorage.getItem(LS_RESETS) || "{}");
	return map[email.toLowerCase()] || null;
}
export function clearResetCode(email) {
	const map = JSON.parse(localStorage.getItem(LS_RESETS) || "{}");
	delete map[email.toLowerCase()];
	localStorage.setItem(LS_RESETS, JSON.stringify(map));
}
