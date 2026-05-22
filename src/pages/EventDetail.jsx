import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { updateAccount, updateProfile } from "../features/account/accountSlice";
import Web3Service from "../services/web3Service";

const MOCK_EVENT_LOCATIONS = {
  1: {
    location: "Sân vận động Quân khu 5, Đà Nẵng",
    date: "20/10/2026 - 19:00",
    description: "Đêm nhạc bùng nổ quy tụ dàn Anh Trai hot nhất năm. Trải nghiệm hệ thống vé NFT độc bản, minh bạch và bảo mật tuyệt đối.",
    banner: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80"
  },
  2: {
    location: "Nhà thi đấu Quân khu 7",
    date: "05/11/2026 - 14:00",
    description: "Trận chung kết đỉnh cao của làng esport Việt Nam. Các đội mạnh nhất tranh tài trực tiếp.",
    banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  3: {
    location: "Khuôn viên trường VKU",
    date: "12/12/2026 - 08:00",
    description: "Giải đấu Valorant sinh viên lớn nhất khu vực miền Trung, quy tụ các team từ các trường đại học.",
    banner: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
};

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80";

export default function EventDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const accountState = useSelector((state) => state.account);
  const { status, address, profile } = accountState;

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Registration state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");

  // Mint success ticket
  const [mintedTicket, setMintedTicket] = useState(null);

  const fetchEventDetails = async () => {
    setIsLoading(true);
    setError("");
    try {
      const service = Web3Service.getInstance();
      const list = await service.getEvents();
      const ev = list.find((e) => e.id === id);
      if (ev) {
        setEvent(ev);
      } else {
        setError("Sự kiện không tồn tại trên blockchain.");
      }
    } catch (err) {
      console.error(err);
      setError("Không thể đọc thông tin sự kiện.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id, accountState.contractAddress]);

  const handleRegisterProfile = async (e) => {
    e.preventDefault();
    const pvk = localStorage.getItem("ticket_nft_pvk");
    if (!pvk) return;

    if (!regName.trim() || !regEmail.trim()) {
      alert("Vui lòng điền đầy đủ thông tin để đăng ký!");
      return;
    }

    setIsActionLoading(true);
    try {
      const service = Web3Service.getInstance();
      const res = await service.registerProfile(pvk, regName, regEmail);
      
      // Update local Redux state
      dispatch(updateProfile(res.profile));
      dispatch(updateAccount({ balance: res.balance, nonce: res.nonce }));
      
      alert("Đăng ký Profile thành công! Bây giờ bạn đã có thể mua vé.");
    } catch (err) {
      console.error(err);
      alert("Đăng ký hồ sơ thất bại: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBuy = async () => {
    const pvk = localStorage.getItem("ticket_nft_pvk");
    if (!status || !pvk) {
      alert("Vui lòng đăng nhập ví trước!");
      return;
    }

    if (!profile.isRegistered) {
      alert("Vui lòng đăng ký Profile trước khi mua vé!");
      return;
    }

    setIsActionLoading(true);
    try {
      const service = Web3Service.getInstance();
      const res = await service.buyTicket(pvk, event.id, event.price);
      
      dispatch(updateAccount({ balance: res.balance, nonce: res.nonce }));
      
      // Query token ID and transactions details
      const txs = await service.getPastTransactions(address);
      const ticketId = txs.length > 0 ? txs[txs.length - 1].tokenId : "NEW";

      setMintedTicket({
        ticketId,
        eventTitle: event.title,
        price: event.price,
        txHash: res.txHash,
        owner: address,
      });

      await fetchEventDetails();
    } catch (err) {
      console.error(err);
      alert("Giao dịch mua vé thất bại: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500/25 border-t-cyan-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Đang tải chi tiết vé...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <p className="text-red-400 text-lg mb-6">⚠️ {error || "Không tìm thấy sự kiện"}</p>
        <Link to="/" className="bg-slate-800 text-slate-200 px-6 py-2.5 rounded-xl font-bold transition-all">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const staticMetadata = MOCK_EVENT_LOCATIONS[event.id] || {
    location: "Khu vực ảo blockchain (Metaverse)",
    date: "Tùy chỉnh - Liên hệ nhà tổ chức",
    description: "Sự kiện được lưu trữ bảo mật trên blockchain. Mua vé để nhận mã khóa tham gia độc quyền.",
    banner: DEFAULT_BANNER
  };

  const isSoldOut = event.soldTickets >= event.totalTickets;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Success Mint Modal */}
      {mintedTicket && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full relative shadow-2xl overflow-hidden">
            {/* Holographic background glow */}
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-cyan-500/20 rounded-full blur-[40px] pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-violet-500/20 rounded-full blur-[40px] pointer-events-none" />

            <div className="text-center mb-6">
              <span className="text-5xl">🎉</span>
              <h2 className="text-2xl font-black text-white mt-3">Đúc NFT Thành Công!</h2>
              <p className="text-slate-400 text-xs mt-1">Vé của bạn đã được ghi nhận vào Smart Contract</p>
            </div>

            {/* Premium Simulated physical NFT ticket container */}
            <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-6 relative font-mono text-xs overflow-hidden mb-6 shadow-inner">
              <div className="absolute top-0 right-0 bg-cyan-500/10 border-l border-b border-cyan-500/30 text-cyan-400 px-3 py-1 rounded-bl-xl font-bold uppercase tracking-wider text-[9px]">
                NFT TICKET
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Sự Kiện</p>
                  <p className="text-sm font-bold text-white tracking-tight">{mintedTicket.eventTitle}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Token ID</p>
                    <p className="text-cyan-400 font-bold text-sm"># {mintedTicket.ticketId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Giá Trị</p>
                    <p className="text-white font-bold">{mintedTicket.price} ETH</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Địa Chỉ Sở Hữu</p>
                  <p className="text-slate-400 break-all text-[10px]">
                    {mintedTicket.owner.slice(0, 18)}...{mintedTicket.owner.slice(-10)}
                  </p>
                </div>
                
                {/* QR placeholder */}
                <div className="flex justify-center pt-2">
                  <div className="bg-white p-2 rounded-xl flex items-center justify-center">
                    {/* Simulated vector QR */}
                    <div className="w-24 h-24 bg-slate-900 rounded-lg flex flex-wrap p-1">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 border border-slate-950 ${
                            (i % 3 === 0 || i % 4 === 1 || i === 7) ? "bg-white" : "bg-transparent"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={`${accountState.rpcUrl === "http://127.0.0.1:8545" ? "#" : `https://sepolia.etherscan.io/tx/${mintedTicket.txHash}`}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                🔗 Xem trên Block Explorer
              </a>
              <button
                onClick={() => setMintedTicket(null)}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
              >
                Đóng & Tiếp Tục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 hover:underline mb-8 transition-colors"
      >
        ← Quay lại danh sách
      </Link>

      {/* Banner */}
      <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-slate-900 mb-10 relative">
        <img
          src={staticMetadata.banner}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
        {/* Info Column */}
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
            {event.title}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">📅 Thời Gian</span>
              <p className="text-slate-200 text-sm font-semibold">{staticMetadata.date}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">📍 Địa Điểm</span>
              <p className="text-slate-200 text-sm font-semibold">{staticMetadata.location}</p>
            </div>
          </div>

          <hr className="border-slate-900" />

          <div>
            <h3 className="text-xl font-bold text-white mb-3">Giới thiệu sự kiện</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              {staticMetadata.description}
            </p>
          </div>

          <hr className="border-slate-900" />

          {/* Technical Specs */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Thông số Hợp đồng Thông minh (Smart Contract)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-slate-900/10 border border-slate-900 p-4 rounded-xl">
                <span className="text-slate-500 text-[10px] block mb-1">CONTRACT NAME</span>
                <span className="text-slate-300 font-semibold">EventTicketing</span>
              </div>
              <div className="bg-slate-900/10 border border-slate-900 p-4 rounded-xl">
                <span className="text-slate-500 text-[10px] block mb-1">EVENT INDEX</span>
                <span className="text-slate-300 font-semibold">#{event.id}</span>
              </div>
              <div className="bg-slate-900/10 border border-slate-900 p-4 rounded-xl col-span-2 sm:col-span-1">
                <span className="text-slate-500 text-[10px] block mb-1">STANDARDS</span>
                <span className="text-cyan-400 font-semibold">ERC721 (NFT)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Card */}
        <div>
          <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-md rounded-3xl p-6 shadow-xl sticky top-28 space-y-6">
            <h3 className="text-lg font-bold text-white">Trạng Thái Vé</h3>

            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Giá Vé Bán Ra</span>
                <span className="text-2xl font-black text-cyan-400">{event.price} ETH</span>
              </div>

              <div className="w-full h-[1px] bg-slate-800" />

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Còn lại: {event.totalTickets - event.soldTickets} vé</span>
                  <span>Tổng: {event.totalTickets} vé</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${(event.soldTickets / event.totalTickets) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Profile Gate */}
            {!status ? (
              <div className="text-center space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bạn cần kết nối ví bảo mật cá nhân để thực hiện đúc vé trên blockchain.
                </p>
                <Link
                  to="/login"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-bold py-3.5 rounded-xl block text-sm transition-all shadow-lg shadow-cyan-500/10 text-center"
                >
                  Kết Nối Ví Để Mua 🦊
                </Link>
              </div>
            ) : !profile.isRegistered ? (
              /* Inline Profile Registration Gate */
              <form onSubmit={handleRegisterProfile} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="text-center">
                  <span className="text-xs font-semibold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full">
                    ⚠️ Chưa Khai Báo Hồ Sơ
                  </span>
                  <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                    Theo quy định trong Smart Contract, bạn phải liên kết tên và email với địa chỉ ví trước khi mua vé!
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Tên của bạn"
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Email của bạn"
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all disabled:opacity-50"
                >
                  {isActionLoading ? "Đang gửi Blockchain..." : "Đăng Ký Hồ Sơ Lên Chain"}
                </button>
              </form>
            ) : (
              /* Mint Ticket Action Buttons */
              <div className="space-y-4">
                <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-4 flex gap-3 items-center">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                  <div className="text-xs">
                    <p className="text-slate-300 font-semibold">Tài khoản hợp lệ</p>
                    <p className="text-slate-500 font-mono text-[9px] break-all">{profile.name} ({profile.email})</p>
                  </div>
                </div>

                <button
                  onClick={handleBuy}
                  disabled={isSoldOut || isActionLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-600 text-slate-950 font-extrabold py-4 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isActionLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-950/25 border-t-slate-950 animate-spin" />
                      Đang thực thi hợp đồng...
                    </div>
                  ) : isSoldOut ? (
                    "HẾT VÉ SỰ KIỆN"
                  ) : (
                    "Mint Vé NFT Ngay 🎫"
                  )}
                </button>
                <p className="text-[10px] text-slate-500 text-center font-mono">
                  Giao dịch an toàn được xử lý trực tiếp trên blockchain.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
