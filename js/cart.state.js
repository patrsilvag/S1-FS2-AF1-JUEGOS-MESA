// js/cart.state.js
window.Cart = (() => {
	let items = [];

	const init = () => {
		try {
			const data = localStorage.getItem("cart");
			items = data ? JSON.parse(data) : [];
		} catch {
			items = [];
		}
		dispatchEvent(new CustomEvent("cart:updated"));
	};

	const saveAndEmit = () => {
		localStorage.setItem("cart", JSON.stringify(items));
		dispatchEvent(new CustomEvent("cart:updated"));
	};

	const getItems = () => [...items];

	const add = (id, qty = 1) => {
		const producto = window.PRODUCTOS?.find((p) => p.id === id);
		if (!producto) {
			console.warn("Producto no encontrado:", id);
			return;
		}
		const ex = items.find((it) => it.id === id);
		if (ex) ex.qty += qty;
		else
			items.push({
				id: producto.id,
				nombre: producto.nombre,
				precio: producto.precio,
				img: producto.img,
				qty,
			});
		saveAndEmit();
	};

	const setQty = (id, qty) => {
		const it = items.find((i) => i.id === id);
		if (!it) return;
		it.qty = Math.max(1, qty);
		saveAndEmit();
	};
	const remove = (id) => {
		items = items.filter((i) => i.id !== id);
		saveAndEmit();
	};
	const clear = () => {
		items = [];
		saveAndEmit();
	};

	const count = () => items.reduce((a, i) => a + i.qty, 0);
	const total = () => items.reduce((a, i) => a + i.precio * i.qty, 0);

	return { init, getItems, count, total, add, setQty, remove, clear };
})();

// Inicializa al cargar
document.addEventListener("DOMContentLoaded", () => window.Cart.init());
