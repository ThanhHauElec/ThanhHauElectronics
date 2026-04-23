// =============================================
// GIỎ HÀNG - Lưu trong localStorage
// =============================================
class CartManager {
  constructor() {
    this.items = JSON.parse(localStorage.getItem("thanhhau_cart") || "[]");
    this._updateBadge();
  }

  add(product, qty = 1) {
    const ex = this.items.find(i => i.id === product.id);
    if (ex) ex.qty += qty;
    else this.items.push({ ...product, qty });
    this._save();
    this._toast(`✅ Đã thêm "${product.name}" vào giỏ hàng`);
  }

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this._save();
  }

  updateQty(id, qty) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(0, qty);
    if (item.qty === 0) this.remove(id);
    else this._save();
  }

  clear() { this.items = []; this._save(); }
  total() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); }
  count() { return this.items.reduce((s, i) => s + i.qty, 0); }
  formatPrice(n) { return n.toLocaleString("vi-VN") + "₫"; }

  _save() {
    localStorage.setItem("thanhhau_cart", JSON.stringify(this.items));
    this._updateBadge();
    document.dispatchEvent(new Event("cartUpdated"));
  }

  _updateBadge() {
    document.querySelectorAll(".cart-badge").forEach(b => b.textContent = this.count());
  }

  _toast(msg) {
    let t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2800);
  }

  // Render giỏ hàng panel
  renderPanel() {
    const body = document.getElementById("cartBody");
    const footer = document.getElementById("cartFooter");
    if (!body) return;

    if (this.items.length === 0) {
      body.innerHTML = `<div class="empty-cart"><p>Giỏ hàng trống</p><a href="pages/products.html">Xem sản phẩm</a></div>`;
      if (footer) footer.style.display = "none";
      return;
    }

    body.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <img src="${item.image}" onerror="this.src='${CONFIG.defaultImage}'">
        <div class="cart-item-info">
          <p class="cart-item-cat">${item.bigCategory}</p>
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">${this.formatPrice(item.price)}</p>
          <div class="qty-row">
            <button onclick="CART.updateQty('${item.id}', ${item.qty - 1})">−</button>
            <span>${item.qty}</span>
            <button onclick="CART.updateQty('${item.id}', ${item.qty + 1})">+</button>
          </div>
        </div>
        <button class="cart-remove" onclick="CART.remove('${item.id}'); CART.renderPanel()">✕</button>
      </div>`).join("");

    if (footer) {
      footer.style.display = "block";
      const totalEl = document.getElementById("cartTotal");
      if (totalEl) totalEl.textContent = this.formatPrice(this.total());
    }
  }
}

const CART = new CartManager();
