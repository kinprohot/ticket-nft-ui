import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateAccount, updateProfile } from "../features/account/accountSlice";
import Web3Service from "../services/web3Service";

export default function Dashboard() {
  const dispatch = useDispatch();
  const accountState = useSelector((state) => state.account);
  const { address, balance, nonce, profile, rpcUrl, contractAddress } = accountState;

  const [tickets, setTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("tickets"); // "tickets" | "profile"

  // Profile forms
  const [name, setName] = useState(profile.name || "");
  const [email, setEmail] = useState(profile.email || "");
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading) setIsLoadingTickets(true);
    try {
      const service = Web3Service.getInstance();
      
      // Update account details (balance & nonce)
      const accDetails = await service.getAccountDetails(address);
      dispatch(updateAccount(accDetails));

      // Update user profile status
      const userProfile = await service.getUserProfile(address);
      dispatch(updateProfile(userProfile));

      // Fetch user's purchased NFT Transfer events
      const list = await service.getPastTransactions(address);
      setTickets(list);
    } catch (err) {
      console.error("Dashboard synchronization error:", err);
    } finally {
      if (showLoading) setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchDashboardData();
    }
  }, [address, contractAddress]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData(false);
    setIsRefreshing(false);
  };

  const handleRegisterProfile = async (e) => {
    e.preventDefault();
    const pvk = localStorage.getItem("ticket_nft_pvk");
    if (!pvk) return;

    if (!name.trim() || !email.trim()) {
      alert("Vui lòng điền tên và email hợp lệ!");
      return;
    }

    setIsSubmittingProfile(true);
    try {
      const service = Web3Service.getInstance();
      const res = await service.registerProfile(pvk, name, email);
      
      dispatch(updateProfile(res.profile));
      dispatch(updateAccount({ balance: res.balance, nonce: res.nonce }));

      alert("Cập nhật Profile lên blockchain thành công!");
      fetchDashboardData(false);
    } catch (err) {
      console.error(err);
      alert("Cập nhật Profile thất bại: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Welcome Panel */}
      <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-md rounded-3xl p-8 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none" />
        <div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
            Bảng Điều Khiển
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-3 flex items-center gap-2">
            Xin chào, {profile.isRegistered ? profile.name : "Nhà đầu tư"}
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-mono break-all">
            {address}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 px-5 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {isRefreshing ? "Đang đồng bộ..." : "🔄 Đồng Bộ Blockchain"}
        </button>
      </div>

      {/* Grid: Left metrics panel, Right detailed tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Metric Column */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-md rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white">Số Dư & Mạng Lưới</h3>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-mono">TÀI SẢN KHẢ DỤNG</span>
                <p className="text-3xl font-black text-cyan-400 mt-1">{parseFloat(balance).toFixed(5)} ETH</p>
              </div>
              <div className="h-[1px] bg-slate-800" />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">GIAO DỊCH (NONCE)</span>
                  <span className="text-slate-300 font-bold font-mono">{nonce}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">MÃ KHÓA SỞ HỮU</span>
                  <span className="text-green-400 font-bold">Hoạt Động ✔️</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 space-y-2 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[9px] block">BLOCKCHAIN RPC NODE</span>
                <span className="text-slate-400 truncate block">{rpcUrl}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] block">CONTRACT ADDRESS</span>
                <span className="text-slate-400 truncate block">{contractAddress}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs Selector */}
          <div className="flex border-b border-slate-900 gap-6">
            <button
              onClick={() => setActiveTab("tickets")}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative ${
                activeTab === "tickets" ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Vé Của Tôi ({tickets.length})
              {activeTab === "tickets" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative ${
                activeTab === "profile" ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Hồ Sơ Của Tôi
              {activeTab === "profile" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
              )}
            </button>
          </div>

          {/* Tab Content Display */}
          {activeTab === "tickets" ? (
            isLoadingTickets ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 rounded-full border-4 border-cyan-500/25 border-t-cyan-500 animate-spin mb-4" />
                <p className="text-slate-400 text-sm font-medium">Đang tải danh sách NFT từ Blockchain...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="bg-slate-900/10 border border-dashed border-slate-800 rounded-3xl p-16 text-center">
                <span className="text-4xl block mb-4">🎟️</span>
                <p className="text-slate-400 text-lg mb-2">Bạn chưa sở hữu chiếc vé NFT nào.</p>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">
                  Các giao dịch mua vé thành công trên hệ thống sẽ tự động đúc ra một mã thông báo ERC721 duy nhất hiển thị tại đây.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {tickets.map((t) => (
                  /* Animated Physical-style Ticket NFTs */
                  <div
                    key={t.tokenId}
                    className="relative group bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs overflow-hidden shadow-2xl hover:border-cyan-500/30 transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 bg-cyan-500/10 text-cyan-400 px-3 py-1 border-l border-b border-slate-800 rounded-bl-xl font-bold uppercase tracking-wider text-[8px]">
                      VERIFIED NFT
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase tracking-widest">SỞ HỮU CỦA</span>
                        <span className="text-slate-300 font-bold block truncate">{profile.name || "Wallet Account"}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] text-slate-500 block uppercase tracking-widest">TOKEN ID</span>
                          <span className="text-cyan-400 font-extrabold text-sm font-sans"># {t.tokenId}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 block uppercase tracking-widest">BLOCK CODE</span>
                          <span className="text-slate-300 font-bold font-mono">{t.blockNumber}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-900">
                        <span className="text-[9px] text-slate-500 block uppercase tracking-widest">TRANSACTION HASH</span>
                        <span className="text-slate-500 block truncate text-[9px] font-mono select-all">
                          {t.transactionHash}
                        </span>
                      </div>

                      {/* Barcode representation */}
                      <div className="pt-3 flex flex-col items-center">
                        <div className="h-6 w-full bg-slate-100 flex items-center justify-around px-2 rounded">
                          {Array.from({ length: 30 }).map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-4 bg-slate-950 rounded-sm ${
                                idx % 3 === 0 ? "w-[1px]" : idx % 5 === 1 ? "w-[3px]" : "w-[2px]"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[8px] text-slate-500 mt-1 uppercase tracking-widest">ERC721 TICKET TOKEN</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Profile Management tab */
            <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-md rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Liên Kết Thông Tin Cá Nhân</h3>
              <form onSubmit={handleRegisterProfile} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Tên Hiển Thị (Hồ Sơ)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tên của bạn..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none transition-colors text-slate-100 placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Email Liên Hệ
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none transition-colors text-slate-100 placeholder-slate-600"
                  />
                </div>

                <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl text-xs text-slate-500 leading-relaxed space-y-1">
                  <p className="font-semibold text-slate-400">Lưu ý quan trọng:</p>
                  <p>- Việc đăng ký / cập nhật hồ sơ sẽ yêu cầu ký một giao dịch lưu thông tin trực tiếp vào Smart Contract.</p>
                  <p>- Việc này tiêu tốn một khoản phí gas nhỏ trên mạng lưới.</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="w-full relative group overflow-hidden rounded-xl p-[1px] focus:outline-none disabled:opacity-50"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 rounded-xl" />
                  <div className="px-8 py-3.5 bg-slate-950 rounded-[11px] relative group-hover:bg-transparent transition-colors duration-300">
                    <span className="block text-sm font-semibold text-slate-200 group-hover:text-white text-center">
                      {isSubmittingProfile ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-slate-200/25 border-t-slate-200 animate-spin" />
                          Đang lưu lên blockchain...
                        </div>
                      ) : profile.isRegistered ? (
                        "Cập Nhật Hồ Sơ Trên Blockchain"
                      ) : (
                        "Đăng Ký Khởi Tạo Hồ Sơ Mới"
                      )}
                    </span>
                  </div>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
