# ⚡ ThanhHau Electronics — Website

## Cấu trúc thư mục

```
ThanhHauElectronics/
├── index.html                  ← Trang chủ
├── pages/
│   ├── products.html           ← Trang sản phẩm (có sidebar lọc)
│   ├── checkout.html           ← Thanh toán
│   └── contact.html            ← Liên hệ
├── components/
│   ├── header.html             ← Header dùng chung
│   └── footer.html             ← Footer dùng chung
├── assets/
│   ├── css/main.css            ← CSS toàn bộ website
│   ├── js/
│   │   ├── config.js           ← ⚙️ CẤU HÌNH CHÍNH - sửa file này
│   │   ├── products.js         ← Quản lý sản phẩm, đọc Google Sheets
│   │   ├── cart.js             ← Giỏ hàng
│   │   └── orders.js           ← Gửi đơn hàng
│   └── images/products/        ← Ảnh sản phẩm (đặt file ảnh vào đây)
├── admin/
│   └── google-apps-script.js   ← Code dán vào Google Apps Script
└── data/                       ← Backup dữ liệu JSON (tùy chọn)
```

## Quản lý sản phẩm qua Excel

### Cách thêm sản phẩm
1. Mở file `products.xlsx` trên Google Sheets
2. Chọn sheet đúng danh mục (SmartHome, SmartLight...)
3. Thêm hàng mới vào cuối, điền đầy đủ các cột
4. **Lưu → Website tự cập nhật ngay** (không cần làm gì thêm)

### Cách thêm danh mục nhỏ
- Chỉ cần điền tên danh mục nhỏ vào cột đầu tiên
- Website tự nhóm sản phẩm theo cột này

### Cách thêm danh mục lớn (sheet mới)
1. Tạo sheet mới trong Excel, đặt tên = tên danh mục
2. Copy header từ sheet có sẵn (dòng 1-3)
3. Thêm tên sheet vào `CONFIG.sheets.sheetNames` trong `assets/js/config.js`
4. Push lên GitHub → website cập nhật

## Cài đặt ban đầu (1 lần duy nhất)

### Bước 1: Upload Excel lên Google Sheets
1. Vào drive.google.com → Upload file `products.xlsx`
2. Click chuột phải → Mở bằng Google Sheets
3. Copy ID từ URL: `https://docs.google.com/spreadsheets/d/[ID]/edit`
4. Vào File → Share → Anyone with link → Viewer

### Bước 2: Tạo Google API Key
1. Vào https://console.cloud.google.com
2. Tạo project mới
3. APIs & Services → Enable → Google Sheets API
4. Credentials → Create credentials → API Key
5. Copy API Key

### Bước 3: Cập nhật config.js
Mở `assets/js/config.js`, thay:
```js
spreadsheetId: "ID vừa copy ở Bước 1",
apiKey: "API Key vừa tạo ở Bước 2",
```

### Bước 4: Cài đặt nhận đơn hàng
1. Mở file `admin/google-apps-script.js`
2. Vào https://script.google.com → New project
3. Dán toàn bộ nội dung vào
4. Deploy → Web app → Anyone → Copy URL
5. Dán URL vào `assets/js/orders.js` tại dòng `APPS_SCRIPT_URL`

### Bước 5: Push lên GitHub
```bash
git add .
git commit -m "cau truc moi - doc tu Google Sheets"
git push
```

## Cập nhật website
```bash
# Sau khi sửa file bất kỳ:
git add .
git commit -m "mo ta thay doi"
git push
# Website cập nhật sau ~1 phút
```
