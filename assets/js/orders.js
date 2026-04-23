// =============================================
// ĐƠN HÀNG - Gửi về Google Sheets + Email
// Dán URL của Google Apps Script vào APPS_SCRIPT_URL
// =============================================

const APPS_SCRIPT_URL = "APPS_SCRIPT_URL_CUA_BAN";

class OrderManager {

  // Gửi đơn hàng
  async submit(customerInfo) {
    if (!CART.items.length) {
      alert("Giỏ hàng trống!");
      return false;
    }

    const order = {
      orderId: "DH" + Date.now(),
      timestamp: new Date().toLocaleString("vi-VN"),
      customer: {
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email || "",
        address: customerInfo.address,
        note: customerInfo.note || ""
      },
      items: CART.items.map(i => ({
        id: i.id,
        name: i.name,
        category: `${i.bigCategory} / ${i.category}`,
        price: i.price,
        qty: i.qty,
        subtotal: i.price * i.qty
      })),
      total: CART.total(),
      status: "Mới"
    };

    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "order", data: order })
      });
      const result = await res.json();
      if (result.success) {
        CART.clear();
        return order.orderId;
      }
    } catch(e) {
      console.error("Lỗi gửi đơn hàng:", e);
    }
    return false;
  }

  // Gửi thông tin khách hàng (form liên hệ)
  async submitContact(info) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", data: { ...info, timestamp: new Date().toLocaleString("vi-VN") } })
      });
      return true;
    } catch(e) {
      return false;
    }
  }
}

const ORDER = new OrderManager();
