# Phân Tích Chức Năng — TicketNFT UI

Tài liệu tóm tắt các chức năng chính, luồng xử lý và điểm chú ý trong dự án `ticket-nft-ui`.

## Tổng quan nền tảng

- Nền tảng blockchain: Ethereum / EVM.
- Thư viện RPC: `web3.js` (package `web3`).
- Hợp đồng: Solidity, file hợp đồng có trong `contracts/EventTicketing.sol`.
- Mặc định RPC local: `http://127.0.0.1:7545` (Ganache GUI thường dùng cổng này).

## `src/services/web3Service.js`

Mô-đun kết nối và thao tác on-chain. Là singleton với các phương thức sau:

- `init(rpcUrl, contractAddress)`
  - Khởi tạo `Web3(rpcUrl)` và `new web3.eth.Contract(CONTRACT_ABI, contractAddress)`.
  - Lưu `rpcUrl` và `contractAddress` vào instance để tái sử dụng.

- `getWeb3()` / `getContract()`
  - Trả về instance web3 / contract; nếu chưa khởi tạo sẽ dùng fallback `http://127.0.0.1:7545` và địa chỉ hợp đồng mặc định.

- `getAccountDetails(address)`
  - Đọc `balance` qua `eth.getBalance` và `nonce` qua `getTransactionCount`.

- `getUserProfile(address)`
  - Gọi `contract.methods.users(address).call()` → trả `name`, `email`, `isRegistered`.

- `loginWithPrivateKey(privateKey)`
  - Tạo account từ private key, thêm vào `web3.eth.accounts.wallet` để auto-sign.
  - Kiểm tra bytecode hợp đồng (nếu không có → throw error).
  - Lấy `balance`, `nonce`, `profile` và trả về cho UI.

- `registerProfile(privateKey, name, email)`
  - Gọi `contract.methods.registerProfile(name,email).send(...)` sau khi estimate gas.
  - Trả `balance`, `nonce` và `profile` mới.

- `createEvent(privateKey, ...)`
  - Chuyển giá từ ETH → wei, gọi `createEvent(...)` trên contract, estimate gas và gửi tx.
  - Trả `txHash`, `balance`, `nonce`.

- `buyTicket(privateKey, eventId, priceEth)`
  - Tương tự `createEvent` nhưng gửi kèm `value = priceWei` và gọi `buyTicket(eventId)`.

- `getEvents()`
  - Kiểm tra hợp đồng đã được deploy (bytecode), gọi `eventCount()`, lặp `events(i)` từ 1..N, chuyển đổi dữ liệu và trả mảng event.

- `getPastTransactions(address)`
  - Dò `Transfer` events lọc `to: address` từ block 0 → trích `tokenId`, lấy `ticketToEvent(tokenId)` và thông tin event liên quan để trả lịch sử vé/token.

### Ghi chú bảo mật

- Hiện private key được nhận trực tiếp và có thể lưu trong `localStorage` (`ticket_nft_pvk`) để thuận tiện cho dev. Đây KHÔNG PHẢI là phương thức an toàn cho production.
- Nếu đưa vào production: tích hợp Wallet Provider (MetaMask / WalletConnect), không lưu private key trên client, thêm xác thực/CSRF/firmware.

## Luồng các trang chính

### `src/pages/Login.jsx`

- Người dùng nhập: `rpcUrl`, `contractAddress`, `privateKey`.
- Luồng chính:
  1. `Web3Service.getInstance().init(rpcUrl, contractAddress)`.
  2. `service.loginWithPrivateKey(privateKey)` để xác thực, đọc `balance`, `nonce`, `profile`.
  3. Dispatch `updateNetwork` và `login` vào Redux.
  4. Lưu private key vào `localStorage` để dùng cho các giao dịch tiếp theo (dev convenience).

### `src/pages/Home.jsx`

- Khi mount: gọi `service.getEvents()` để hiển thị danh sách event.
- Nếu không có event, cho phép user (đã đăng nhập) nạp dữ liệu mẫu bằng `service.createEvent(...)` dùng `pvk` từ `localStorage`.

### `src/pages/CreateEvent.jsx`

- Form thu thập `name`, `priceEth`, `totalTickets`, `description`, `imageUrl`, `location`, `eventTime`.
- Lấy `pvk` từ `localStorage` và gọi `service.createEvent(pvk, ...)`.
- Sau thành công cập nhật `balance`/`nonce` qua `updateAccount` rồi chuyển về trang chủ.

### `src/pages/EventDetail.jsx`

- Khi mount: gọi `service.getEvents()` và tìm event theo `id`.
- Hỗ trợ:
  - Đăng ký profile on-chain: `service.registerProfile(pvk, name, email)` → cập nhật Redux.
  - Mua vé: kiểm tra `profile.isRegistered`, gọi `service.buyTicket(pvk, event.id, event.price)`, cập nhật tài khoản và gọi `getPastTransactions(address)` để lấy `tokenId` vừa nhận.
  - Hiển thị modal vé (tokenId, txHash, owner).

### `src/pages/Dashboard.jsx`

- Khi có `address`, gọi: `getAccountDetails(address)`, `getUserProfile(address)`, `getPastTransactions(address)` để đồng bộ dữ liệu.
- Cho phép refresh tay và submit lại profile (gọi `registerProfile`).

## Components và cơ chế route

- `src/components/EventCard.jsx`: hiển thị preview event, progress bar, link đến `/event/:id`.
- `src/components/Navbar.jsx`: hiển thị trạng thái ví, balance, profile; xử lý `logout()` (dispatch `logout`, xóa `localStorage`).
- `src/components/PrivateRoute.jsx`: bảo vệ route; nếu `account.status` false → redirect về `/login`.

## Redux

- File: `src/features/account/accountSlice.js`.
- State chính: `address`, `balance`, `nonce`, `status`, `profile`, `rpcUrl`, `contractAddress`.
- Actions: `login`, `logout`, `updateAccount`, `updateProfile`, `updateNetwork`.
- Các trang dùng action này để cập nhật giao diện sau khi có tx hoặc thay đổi network.

## Hoạt động end-to-end ví dụ (mua vé)

1. Người dùng đăng nhập ở `/login` với PVK + RPC + contract address.
2. App lưu PVK vào `localStorage` và cập nhật Redux `address`/`balance`/`profile`.
3. Người dùng vào trang event `/event/:id`, nếu chưa có profile thì gọi `registerProfile` (tx on-chain).
4. Người dùng nhấn 'Mint Vé' → `buyTicket(pvk, eventId, price)` gửi tx cùng `value`.
5. Sau tx thành công, app gọi `getPastTransactions(address)` để truy xuất `tokenId` (dựa trên event `Transfer` đến địa chỉ) và hiển thị modal vé.

## Điểm cần cải tiến / khuyến nghị

- Không lưu private key trong `localStorage` trên môi trường production; tích hợp Web3 wallet providers.
- Bắt lỗi và hiển thị chi tiết khi tx fail (hiện chỉ show message cơ bản). Có thể thêm deterministic error parsing.
- Thêm cấu hình mạng mặc định (mainnet/testnets) và xác thực địa chỉ contract trước khi cho user lưu.
- Thêm unit tests cho `web3Service` (mocks) và E2E tests cho luồng mua vé.

## Tệp tham chiếu

- `src/services/web3Service.js`
- `src/features/account/accountSlice.js`
- `src/pages/Login.jsx`, `src/pages/Home.jsx`, `src/pages/CreateEvent.jsx`, `src/pages/EventDetail.jsx`, `src/pages/Dashboard.jsx`

---
