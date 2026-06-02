# 📱 Money Saver - Client-Only PWA

**Money Saver** là ứng dụng quản lý chi tiêu tài chính cá nhân tối giản, hiện đại và hoạt động hoàn toàn ở phía máy khách (Client-only / Offline-first). Ứng dụng được thiết kế tối ưu cho các thiết bị di động dưới dạng PWA (Progressive Web App) với tốc độ tải trang tức thì, giao diện mượt mà theo phong cách tối giản cao cấp.

> [!IMPORTANT]  
> Ứng dụng **không sử dụng Database Server**, toàn bộ thông tin của bạn được bảo mật tuyệt đối 100% cục bộ trên thiết bị cá nhân của bạn.

---

## 🎯 Các Tính Năng Cốt Lõi Vừa Được Nâng Cấp

### 💾 1. Bộ Lưu Trữ IndexedDB Siêu Bền & Migration Tự Động
*   **IndexedDB Engine (`db.ts`)**: Thay thế hoàn toàn `localStorage` đồng bộ bằng hệ thống cơ sở dữ liệu IndexedDB bất đồng bộ (asynchronous). Khắc phục triệt để giới hạn dung lượng 5MB và rủi ro bị hệ điều hành di động (đặc biệt là iOS) xóa dữ liệu khi đầy bộ nhớ.
*   **Migration An Toàn 100%**: Cơ chế tự động quét dữ liệu cũ trong `localStorage` khi người dùng cập nhật ứng dụng lần đầu, sao chép toàn vẹn sang `IndexedDB` và dọn dẹp bộ nhớ đệm cũ. Người dùng không bao giờ bị mất dữ liệu.
*   **Aesthetic Splash Screen**: Màn hình chờ khởi chạy đẹp mắt, mang phong cách mờ cao cấp với biểu tượng ví chuyển động nhẹ trong khi dữ liệu được nạp ngầm từ cơ sở dữ liệu.

### 🖼️ 2. Chọn & Nén Ảnh Đại Diện Client-Side (Canvas API)
*   **Canvas Image Compressor**: Hỗ trợ người dùng tự upload ảnh đại diện bất kỳ từ máy hoặc điện thoại (chấp nhận ảnh dung lượng cao > 5MB). 
*   **Center-Square Auto-Crop**: Tự động đo đạc tỷ lệ và cắt (crop) lấy khung hình vuông hoàn hảo ở tâm ảnh, giúp ảnh đại diện tròn không bao giờ bị biến dạng hay méo mó.
*   **Dung Lượng Siêu Nhẹ**: Ảnh được resize về kích thước chuẩn **150px x 150px** và nén định dạng JPEG 70% chất lượng. Dung lượng ảnh giảm từ **5MB xuống chỉ còn 10KB - 20KB**, lưu trữ mượt mà không gây nghẽn hiệu năng.
*   **Popup Chọn Ảnh Hướng Đối Tượng**: Chạm trực tiếp vào avatar để mở một Modal kính mờ Glassmorphism có biểu tượng camera và hướng dẫn chi tiết để thay đổi ảnh nhanh chóng.

### 🔄 3. Chỉnh Sửa Giao Dịch & Tự Động Cân Bằng Tài Chính
*   **Self-Balancing Wallet Algorithm**: Khi chỉnh sửa bất kỳ giao dịch cũ nào (đổi số tiền, đổi loại Chi tiêu <-> Thu nhập, hoặc đổi từ Ví tiền mặt sang Ví online), hệ thống tự động hoàn lại số dư chuẩn xác cho ví cũ rồi mới áp dụng thay đổi vào ví mới.
*   **Transaction Modal Đa Năng**: Hỗ trợ mượt mà cả 2 trạng thái: Thêm mới và Chỉnh sửa trực tiếp. Điền sẵn thông tin cũ khi click sửa.
*   **Pencil Action**: Tích hợp biểu tượng bút chì tinh tế nằm cạnh nút xóa trong danh sách lịch sử giao dịch.

### 🎨 4. Nâng Cấp Chỉnh Sửa Danh Mục Inline & Kho Giao Diện
*   **Full Inline Edit Form**: Khi click sửa trên một thẻ danh mục, thẻ đó sẽ biến đổi thành một form cấu hình toàn diện inlined cực đẹp, cho phép thay đổi: Tên danh mục, Màu sắc chủ đạo, Biểu tượng và Hạn mức định mức hàng tháng.
*   **Giao Diện Cực Nhiều Lựa Chọn**:
    *   Mở rộng bảng màu chủ đạo lên **16 mã màu pastel cao cấp** (Slate, Olive, Sage, Sapphire, Teal, Rose...).
    *   Mở rộng kho biểu tượng lên **24 icon Lucide đa dạng** đáp ứng 100% nhu cầu chi tiêu đời sống thực tế (đi chợ, hóa đơn, sửa chữa, tiệc tùng, đầu tư, thể thao...).

### 🚀 5. Tự Động Cập Nhật PWA Mượt Mà (Tránh Lỗi Trắng Trang)
*   **HTML Network-First Strategy**: Giải quyết triệt để lỗi trắng trang (đơ giao diện) khi deploy phiên bản mới lên Vercel do Service Worker gọi các file tĩnh JS/CSS đã băm (hashed) cũ bị Vercel xóa bỏ (404). File HTML giờ đây luôn được ưu tiên tải từ mạng để lấy danh sách file JS/CSS mới nhất.
*   **PWA Update Modal**: Khi phát hiện có phiên bản code mới được deploy lên Vercel từ GitHub, một modal mờ Glassmorphic tinh tế sẽ hiện lên. Người dùng nhấn nút sẽ gửi tín hiệu `SKIP_WAITING` để kích hoạt Service Worker mới và tự động reload trang sạch sẽ mà không làm mất dữ liệu.

---

## 🛠️ Công Nghệ & Kiến Trúc Dự Án

*   **Core:** React 19, TypeScript, Vite.
*   **Styling:** Tailwind CSS v4.0.
*   **Database:** IndexedDB (Client-side Key-Value Store).
*   **Service Worker:** Custom SW với chiến lược Network-First cho tài liệu HTML điều hướng và Dynamic Caching cho static assets.

---

## 📝 Nhật Ký Phát Triển & Bản Review Code (Devlog)

### 🗓️ Tuần 1 - Tái cấu trúc Bộ lưu trữ và Xử lý Update PWA

#### 🔍 1. Vấn đề 1: Tránh lỗi đơ ứng dụng và mất dữ liệu khi Deploy trên Vercel
*   **Nguyên nhân:** Service Worker cũ lưu cache file `index.html` dạng cứng. Khi bạn push code mới lên GitHub và Vercel deploy, các file JS/CSS dạng băm (ví dụ: `index-a1b2c3d4.js`) sẽ được tạo mới và các file cũ bị xóa khỏi CDN của Vercel. Khi người dùng mở app, Service Worker phục vụ file `index.html` cũ trong cache, file này lại yêu cầu file JS/CSS cũ đã bị xóa trên Vercel dẫn đến lỗi 404, khiến ứng dụng bị đơ trắng trang.
*   **Giải pháp xử lý:**
    1. Cấu hình lại `Cache-Control` cho file Service Worker (`sw.js`) trong `vercel.json` để trình duyệt không bao giờ cache file quản lý này.
    2. Cải tiến file `public/sw.js` áp dụng chiến lược **Network-First cho HTML** và **Dynamic Caching cho Assets**:
    ```javascript
    // sw.js
    if (e.request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
      e.respondWith(
        fetch(e.request)
          .then((response) => {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseCopy));
            return response;
          })
          .catch(() => caches.match(e.request) || caches.match('/'))
      );
      return;
    }
    ```
    3. Thiết kế component `UpdatePromptModal.tsx` để bắt sự kiện Service Worker mới đang ở trạng thái chờ kích hoạt (`reg.waiting`), hiển thị popup nhắc nhở người dùng nhấn để cập nhật sạch sẽ thông qua tín hiệu:
    ```typescript
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    ```

#### 🔍 2. Vấn đề 2: Bộ lưu trữ dung lượng lớn và An toàn (IndexedDB)
*   **Nguyên nhân:** `localStorage` tuy dễ dùng nhưng có dung lượng giới hạn thấp (~5MB), chạy đồng bộ gây nghẽn UI khi lưu lượng giao dịch tăng cao, và có nguy cơ bị hệ điều hành iOS tự động xóa bộ nhớ đệm nếu máy sắp hết dung lượng.
*   **Giải pháp xử lý:**
    1. Xây dựng tiện ích `src/utils/db.ts` chuyển đổi các thao tác ghi dữ liệu sang IndexedDB bất đồng bộ dựa trên API thuần của trình duyệt để đảm bảo dung lượng lưu trữ lớn (hàng trăm MB) và độ bền vững dữ liệu cao.
    2. Viết logic di chuyển (Migration) tự động trong `AppContext.tsx` để bảo vệ 100% dữ liệu cũ của người dùng trong quá trình chuyển giao công nghệ.
    3. Sửa lỗi biên dịch TypeScript trong vòng lặp nạp dữ liệu bằng cách định vị kiểu `any` cho dữ liệu trung gian:
    ```typescript
    let val: any = await db.get<any>(item.dbKey, null);
    ```

#### 🔍 3. Vấn đề 3: Avatar tự chụp nặng > 5MB làm chậm ứng dụng
*   **Nguyên nhân:** Điện thoại ngày nay chụp ảnh độ phân giải cao khiến file ảnh nặng từ 3MB - 10MB. Lưu trữ chuỗi Base64 dài hàng triệu ký tự của ảnh này trực tiếp vào IndexedDB sẽ làm phình cơ sở dữ liệu và khiến ứng dụng khởi động rất chậm.
*   **Giải pháp xử lý:**
    Xây dựng thuật toán nén ảnh Client-side tận dụng sức mạnh xử lý của HTML5 `<canvas>`. Cắt ảnh thành hình vuông ở tâm, co kích thước về đúng **150px** và xuất dạng JPEG chất lượng nén 70%:
    ```typescript
    const size = Math.min(img.width, img.height);
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const sourceX = (img.width - size) / 2;
      const sourceY = (img.height - size) / 2;
      ctx.drawImage(img, sourceX, sourceY, size, size, 0, 0, 150, 150);
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
    }
    ```
    Thuật toán giúp tối ưu hoàn hảo dung lượng ảnh xuống chỉ còn **12KB - 15KB**, đảm bảo app hoạt động với hiệu năng cực đỉnh.

---

## 🚀 Hướng Dẫn Chạy & Cài Đặt Local

### 1. Yêu cầu hệ thống
*   Đã cài đặt Node.js (khuyên dùng phiên bản 18+).

### 2. Cài đặt các thư viện phụ thuộc
Mở thư mục dự án và cài đặt:
```bash
npm install
```

### 3. Khởi chạy môi trường phát triển (Local Development)
Chạy lệnh sau để khởi động dev server:
```bash
npm run dev
```
Truy cập đường dẫn hiển thị ở Terminal (thường là `http://localhost:5173`) trên trình duyệt để trải nghiệm.

### 4. Build ứng dụng cho môi trường Production
Trước khi deploy lên Vercel, bạn có thể kiểm tra biên dịch build sản phẩm tĩnh cục bộ:
```bash
npm run build
```
Lệnh này sẽ biên dịch toàn bộ TypeScript và tạo bundle tĩnh tối ưu hóa cao nằm trong thư mục `/dist`.
