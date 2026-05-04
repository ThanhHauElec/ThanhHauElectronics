// =============================================
// QUẢN LÝ SẢN PHẨM - Đọc từ Google Sheets
// =============================================
class ProductManager {
  constructor() {
    this.products = [];
    this.categories = {};
    this.loaded = false;
  }

  async loadAll() {
    const { spreadsheetId, apiKey, sheetNames } = CONFIG.sheets;
    const results = await Promise.all(sheetNames.map(async sheet => {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheet)}!A4:H500?key=${apiKey}`;
        const res = await fetch(url);
        return { sheet, data: await res.json() };
      } catch(e) {
        console.warn(`Không tải được sheet: ${sheet}`, e);
        return { sheet, data: {} };
      }
    }));
    const all = [];
    for (const { sheet, data } of results) {
      if (!data.values) continue;
      data.values.forEach(row => {
        if (!row[0] || !row[1] || !row[2]) return;
        const p = {
          bigCategory: sheet,
          category:      row[0] || "",
          id:            row[1] || "",
          name:          row[2] || "",
          price:         parseInt((row[3]||"0").toString().replace(/[,. ]/g,"")) || 0,
          originalPrice: parseInt((row[4]||"0").toString().replace(/[,. ]/g,"")) || 0,
          description:   row[5] || "",
          image:         row[6] ? CONFIG.imagePath + row[6] : CONFIG.defaultImage,
          status:        (row[7] || "active").trim().toLowerCase()
        };
        if (p.status !== "inactive") all.push(p);
      });
    }
    this.products = all;
    this._buildCategories();
    this.loaded = true;
    return all;
  }

  _buildCategories() {
    this.categories = {};
    this.products.forEach(p => {
      if (!this.categories[p.bigCategory]) this.categories[p.bigCategory] = {};
      if (!this.categories[p.bigCategory][p.category]) this.categories[p.bigCategory][p.category] = [];
      this.categories[p.bigCategory][p.category].push(p);
    });
  }

  filter({ bigCategory, category, status, search, minPrice, maxPrice } = {}) {
    return this.products.filter(p => {
      if (bigCategory && p.bigCategory !== bigCategory) return false;
      if (category && p.category !== category) return false;
      if (status === "sale" && p.status !== "sale") return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q)) return false;
      }
      if (minPrice && p.price < minPrice) return false;
      if (maxPrice && p.price > maxPrice) return false;
      return true;
    });
  }

  paginate(products, page = 1, perPage = CONFIG.productsPerPage) {
    const start = (page - 1) * perPage;
    return {
      items: products.slice(start, start + perPage),
      total: products.length,
      pages: Math.ceil(products.length / perPage),
      current: page
    };
  }

  formatPrice(n) {
    if (!n || n === 0) return "";
    return n.toLocaleString("vi-VN") + "₫";
  }

  renderCard(p) {
    const isSale = p.status === "sale" && p.originalPrice > 0;
    const discount = isSale ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
    return `
      <div class="prod-card" data-id="${p.id}">
        <div class="prod-img">
          <img src="${p.image}" alt="${p.name}" onerror="this.src='${CONFIG.defaultImage}'">
          ${isSale ? `<span class="badge badge-sale">-${discount}%</span>` : ""}
          ${p.status === "new" ? `<span class="badge badge-new">MỚI</span>` : ""}
          <button class="add-btn" onclick="CART.add(${JSON.stringify(p).replace(/"/g,'&quot;')})">+ Thêm vào giỏ</button>
        </div>
        <div class="prod-info">
          <p class="prod-cat">${p.bigCategory} / ${p.category}</p>
          <p class="prod-name">${p.name}</p>
          <p class="prod-desc">${p.description}</p>
          <div class="prod-price-row">
            <span class="prod-price">${this.formatPrice(p.price)}</span>
            ${isSale ? `<span class="prod-orig">${this.formatPrice(p.originalPrice)}</span>` : ""}
          </div>
        </div>
      </div>`;
  }
}

const PM = new ProductManager();
