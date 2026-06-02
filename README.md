# Money Saver - Client-Only PWA

Money Saver là giải pháp quản lý tài chính cá nhân tối giản, hoạt động hoàn toàn ở phía máy khách (Client-side) dưới dạng ứng dụng Progressive Web App (PWA). Dự án được thiết kế theo triết lý bảo mật tối đa và tối ưu hóa tài nguyên thiết bị, đảm bảo toàn bộ dữ liệu tài chính của người dùng được lưu trữ cục bộ và không phụ thuộc vào máy chủ trung gian.

---

## Các Giải Pháp Kỹ Thuật Trọng Tâm

### 1. Cơ Sở Dữ Liệu Cục Bộ Bền Vững IndexedDB & Công Cụ Di Trú Tự Động
*   **IndexedDB Engine (`db.ts`)**: Thay thế hoàn toàn cơ chế đồng bộ của `localStorage` bằng hệ thống cơ sở dữ liệu IndexedDB bất đồng bộ. Giải pháp này khắc phục triệt để giới hạn dung lượng 5MB và ngăn ngừa rủi ro thu hồi bộ nhớ (Storage Eviction) từ hệ điều hành di động khi thiết bị cạn kiệt dung lượng.
*   **Di Trú Dữ Liệu Tự Động (Automated Migration)**: Khi ứng dụng được cập nhật, hệ thống tự động kiểm tra và di chuyển toàn bộ dữ liệu hiện tại từ `localStorage` sang cấu trúc mới của `IndexedDB` trước khi giải phóng bộ nhớ đệm cũ, đảm bảo tính liên tục của dữ liệu mà không cần sự can thiệp từ người dùng.
*   **Màn Hình Khởi Chạy Hệ Thống (Splash Screen)**: Thiết kế giao diện chờ trực quan, mờ ảo cao cấp với hiệu ứng tải mượt mà trong thời gian nạp dữ liệu từ hệ thống IndexedDB.

### 2. Thuật Toán Nén & Tối Ưu Hóa Ảnh Đại Diện (Canvas API)
*   **Canvas Image Compressor**: Hỗ trợ xử lý ảnh tải lên từ thiết bị của người dùng, tự động giảm dung lượng kể cả với các tệp ảnh gốc có độ phân giải lớn vượt quá 5MB.
*   **Center-Square Auto-Crop**: Tự động xác định tỷ lệ ảnh, thực hiện cắt cúp lấy khu vực trung tâm theo tỷ lệ 1:1, ngăn chặn hiện tượng biến dạng hoặc méo hình ảnh khi hiển thị.
*   **Tối Ưu Hóa Bộ Nhớ Cực Hạn**: Chuyển đổi và xuất ảnh dưới định dạng JPEG chất lượng nén 70% với kích thước chuẩn 150px x 150px. Phương pháp này giảm dung lượng tệp tin từ 5MB xuống chỉ còn từ 10KB đến 20KB dưới dạng chuỗi Base64, đảm bảo tốc độ phản hồi tối đa của cơ sở dữ liệu.
*   **Giao Diện Tương Tác Hướng Đối Tượng**: Tích hợp Modal tương tác mờ Glassmorphism xuất hiện khi người dùng nhấp vào ảnh đại diện hiện tại để hướng dẫn thay đổi tệp tin ảnh nhanh chóng.

### 3. Cơ Chế Chỉnh Sửa Giao Dịch & Tự Động Cân Bằng Tài Khoản
*   **Wallet Self-Balancing Algorithm**: Hàm xử lý `updateTransaction` trong tầng ngữ cảnh (context) tự động thực hiện hoàn trả số dư chuẩn xác cho tài khoản ví cũ (cộng lại nếu là khoản chi, trừ đi nếu là khoản thu) trước khi khấu trừ hoặc cộng số tiền mới vào ví đích. Giải pháp này đảm bảo tính toàn vẹn dữ liệu tài chính kể cả khi người dùng thay đổi số tiền, loại giao dịch hoặc chuyển đổi giữa các tài khoản ví khác nhau.
*   **Giao Diện Chỉnh Sửa Tích Hợp**: Cải tiến `TransactionModal.tsx` để hỗ trợ song song hai trạng thái: Thêm mới và Chỉnh sửa trực tiếp, tự động đổ dữ liệu cũ của giao dịch khi kích hoạt chế độ sửa.

### 4. Nâng Cấp Quản Lý Danh Mục Chi Tiêu Inline
*   **Inline Edit Form**: Chuyển đổi linh hoạt thẻ danh mục hiện tại thành biểu mẫu cấu hình inline khi kích hoạt chế độ chỉnh sửa, cho phép người dùng thay đổi: Tên danh mục, Tông màu chủ đạo, Biểu tượng hiển thị và Hạn mức ngân sách hàng tháng trực tiếp trên giao diện.
*   **Đa Dạng Hóa Giao Diện**:
    *   Mở rộng bảng màu chủ đạo lên 16 tông màu pastel hiện đại.
    *   Tích hợp 24 biểu tượng Lucide đa dạng, đáp ứng đầy đủ các nhu cầu phân loại giao dịch thực tế trong đời sống.

### 5. Chiến Lược Cập Nhật PWA Chủ Động & Bền Vững
*   **HTML Network-First Strategy**: Giải quyết triệt để lỗi trắng trang hoặc đơ ứng dụng khi triển khai phiên bản mới trên Vercel. File tài liệu HTML (`/index.html` và `/`) được cấu hình luôn ưu tiên tải từ mạng internet để lấy các liên kết tệp tin JS/CSS đã băm (hashed) mới nhất từ máy chủ, chỉ chuyển sang sử dụng bộ nhớ đệm khi thiết bị mất kết nối hoàn toàn.
*   **PWA Update Controller**: Lắng nghe trạng thái cài đặt của Service Worker mới. Khi phát hiện bản cập nhật mới trên máy chủ, hệ thống sẽ hiển thị một Modal thông báo mờ Glassmorphic tinh tế để người dùng chủ động kích hoạt bản mới và tải lại trang một cách sạch sẽ mà không làm ảnh hưởng đến dữ liệu cục bộ hiện tại.

---

## Kiến Trúc Hệ Thống & Công Nghệ Sử Dụng

*   **Tầng Khung Chạy (Framework):** React 19, TypeScript, Vite.
*   **Tầng Giao Diện (Styling):** Tailwind CSS v4.0.
*   **Tầng Dữ Liệu (Database):** IndexedDB (Client-side Key-Value Store).
*   **Chiến Lược Cache:** Custom Service Worker với chiến lược Network-First cho tài liệu điều hướng và Cache-First kết hợp Dynamic Caching cho tài nguyên tĩnh.

---

## Nhật Ký Phát Triển & Đánh Giá Kiến Trúc (Devlog)

### Triển Khai Bộ Lưu Trữ IndexedDB & Xử Lý Sự Cố Cập Nhật Phiên Bản PWA

#### 1. Sự cố đơ ứng dụng khi cập nhật phiên bản tĩnh trên máy chủ (Vercel Deploy 404)
*   **Bối cảnh:** Khi biên dịch và deploy phiên bản mới tĩnh lên Vercel, các tệp tin JS/CSS dạng băm (ví dụ: `index-a1b2c3d4.js`) sẽ được làm mới hoàn toàn và các tệp tin cũ bị xóa bỏ khỏi bộ lưu trữ đám mây. Do Service Worker cũ lưu trữ tệp tin `index.html` cũ trong bộ nhớ đệm cứng, trình duyệt của người dùng sẽ cố gắng yêu cầu các tệp tin JS/CSS cũ từ máy chủ Vercel, dẫn đến lỗi 404 và làm tê liệt toàn bộ giao diện của ứng dụng.
*   **Giải pháp:**
    1. Cấu hình tiêu đề `Cache-Control` đặc biệt trong tệp cấu hình `vercel.json` để yêu cầu các cổng phân phối trung gian tuyệt đối không lưu trữ file quản lý `sw.js`.
    2. Cập nhật tệp `public/sw.js` áp dụng chiến lược Network-First nghiêm ngặt đối với tất cả yêu cầu điều hướng (`navigate`) hoặc các đường dẫn trang chủ:
    ```javascript
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
    3. Triển khai component `UpdatePromptModal.tsx` để giám sát trạng thái Service Worker mới (`reg.waiting`) và thực hiện reload chủ động thông qua sự kiện `controllerchange` sau khi gửi thông điệp kích hoạt bản mới:
    ```typescript
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    ```

#### 2. Xử lý bài toán giới hạn dung lượng lưu trữ cục bộ
*   **Bối cảnh:** Bộ nhớ `localStorage` hoạt động theo cơ chế đồng bộ (blocking), gây ảnh hưởng tiêu cực đến hiệu năng giao diện khi số lượng bản ghi tài chính tăng lớn. Ngoài ra, cơ chế này dễ bị các trình duyệt di động tự động dọn dẹp để giải phóng dung lượng.
*   **Giải pháp:**
    1. Thiết lập class `IndexedDBHelper` bất đồng bộ hoàn toàn để lưu trữ dữ liệu bền vững.
    2. Áp dụng cơ chế nạp dữ liệu ban đầu song song với công cụ chuyển đổi dữ liệu thông minh trong `AppContext.tsx` nhằm đảm bảo tính toàn vẹn của dữ liệu cũ của người dùng.
    3. Giải quyết triệt để lỗi biên dịch TypeScript trong quá trình xử lý nạp dữ liệu bằng cách định kiểu `any` cho biến tạm thời trong vòng lặp:
    ```typescript
    let val: any = await db.get<any>(item.dbKey, null);
    ```

#### 3. Khắc phục vấn đề phình bộ nhớ do ảnh đại diện độ phân giải cao
*   **Bối cảnh:** Người dùng sử dụng máy ảnh di động để chụp ảnh trực tiếp thường tạo ra các tệp tin có dung lượng từ 3MB đến 10MB. Việc chuyển đổi trực tiếp ảnh này sang định dạng Base64 và lưu trữ vào cơ sở dữ liệu sẽ làm giảm nghiêm trọng tốc độ nạp dữ liệu của ứng dụng.
*   **Giải pháp:**
    Ứng dụng thuật toán nén ảnh Client-side sử dụng HTML5 Canvas. Ảnh gốc được dựng lên Canvas ảo, thực hiện tính toán lấy khu vực trung tâm theo tỷ lệ 1:1, giảm kích thước pixel về 150px và trích xuất sang định dạng JPEG chất lượng nén 0.7:
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
    Giải pháp này giúp thu gọn kích thước ảnh đại diện xuống từ 10KB đến 15KB, duy trì tốc độ khởi chạy tối ưu cho ứng dụng.

---

## Bản Quyền & Giấy Phép

Toàn bộ mã nguồn và tài liệu của dự án Money Saver thuộc bản quyền sở hữu trí tuệ của **KietNP0769**. Mọi hành vi sao chép, phân phối hoặc tái sử dụng thương mại cần có sự đồng ý bằng văn bản từ tác giả tác quyền.
