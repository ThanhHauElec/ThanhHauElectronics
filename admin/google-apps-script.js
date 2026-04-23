// =============================================
// GOOGLE APPS SCRIPT
// Dán code này vào: script.google.com → New project
// Deploy → Web app → Anyone → Copy URL → dán vào orders.js
// =============================================

const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const EMAIL_NOTIFY = "hothanhhau.work@gmail.com"; // Email nhận thông báo

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    if (payload.type === "order") {
      saveOrder(payload.data);
      sendEmailNotification(payload.data);
      return ok();
    }

    if (payload.type === "contact") {
      saveContact(payload.data);
      return ok();
    }

    return err("Unknown type");
  } catch(ex) {
    return err(ex.toString());
  }
}

// ─── Lưu đơn hàng vào sheet "Đơn hàng" ─────
function saveOrder(order) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let ws = ss.getSheetByName("Đơn hàng");

  // Tự tạo sheet nếu chưa có
  if (!ws) {
    ws = ss.insertSheet("Đơn hàng");
    ws.appendRow(["Mã đơn", "Thời gian", "Khách hàng", "SĐT", "Email", "Địa chỉ", "Ghi chú", "Sản phẩm", "Tổng tiền", "Trạng thái"]);
    ws.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#1A56DB").setFontColor("#FFFFFF");
  }

  const itemsSummary = order.items.map(i => `${i.name} x${i.qty} (${i.subtotal.toLocaleString()}₫)`).join("\n");

  ws.appendRow([
    order.orderId,
    order.timestamp,
    order.customer.name,
    order.customer.phone,
    order.customer.email,
    order.customer.address,
    order.customer.note,
    itemsSummary,
    order.total,
    order.status
  ]);
}

// ─── Lưu liên hệ vào sheet "Khách hàng" ─────
function saveContact(info) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let ws = ss.getSheetByName("Khách hàng");

  if (!ws) {
    ws = ss.insertSheet("Khách hàng");
    ws.appendRow(["Thời gian", "Họ tên", "SĐT", "Email", "Nội dung quan tâm", "Ghi chú"]);
    ws.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#1A56DB").setFontColor("#FFFFFF");
  }

  ws.appendRow([info.timestamp, info.name, info.phone, info.email || "", info.interest || "", info.note || ""]);
}

// ─── Gửi email thông báo đơn mới ────────────
function sendEmailNotification(order) {
  const items = order.items.map(i =>
    `• ${i.name} x${i.qty} — ${i.subtotal.toLocaleString()}₫`
  ).join("\n");

  const body = `
🛒 ĐƠN HÀNG MỚI - ${order.orderId}
━━━━━━━━━━━━━━━━━━━━━
Thời gian: ${order.timestamp}

THÔNG TIN KHÁCH HÀNG:
• Tên: ${order.customer.name}
• SĐT: ${order.customer.phone}
• Email: ${order.customer.email || "Không có"}
• Địa chỉ: ${order.customer.address}
• Ghi chú: ${order.customer.note || "Không có"}

SẢN PHẨM ĐẶT:
${items}
━━━━━━━━━━━━━━━━━━━━━
TỔNG CỘNG: ${order.total.toLocaleString()}₫
━━━━━━━━━━━━━━━━━━━━━

👉 Xem đơn hàng: https://docs.google.com/spreadsheets/d/${SHEET_ID}
  `;

  GmailApp.sendEmail(
    EMAIL_NOTIFY,
    `🛒 Đơn hàng mới #${order.orderId} - ${order.customer.name}`,
    body
  );
}

function ok()  { return ContentService.createTextOutput(JSON.stringify({ success: true  })).setMimeType(ContentService.MimeType.JSON); }
function err(msg) { return ContentService.createTextOutput(JSON.stringify({ success: false, error: msg })).setMimeType(ContentService.MimeType.JSON); }
