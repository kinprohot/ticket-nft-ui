import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { updateAccount } from "../features/account/accountSlice";
import Web3Service from "../services/web3Service";

export default function CreateEvent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [priceEth, setPriceEth] = useState("");
  const [totalTickets, setTotalTickets] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pvk = localStorage.getItem("ticket_nft_pvk");
    if (!pvk) {
      setError("Không tìm thấy thông tin xác thực Private Key.");
      return;
    }

    if (!name.trim() || !priceEth.trim() || !totalTickets.trim()) {
      setError("Vui lòng nhập đầy đủ tất cả thông tin!");
      return;
    }

    if (Number(priceEth) <= 0) {
      setError("Giá vé phải lớn hơn 0 ETH!");
      return;
    }

    if (Number(totalTickets) <= 0) {
      setError("Số lượng vé phải lớn hơn 0!");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const service = Web3Service.getInstance();
      const res = await service.createEvent(pvk, name, priceEth, Number(totalTickets));

      // Update Redux state with new balance and nonce
      dispatch(updateAccount({ balance: res.balance, nonce: res.nonce }));

      alert("Tạo sự kiện mới trên Blockchain thành công!");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 hover:underline mb-8 transition-colors"
      >
        ← Quay lại trang chủ
      </Link>

      <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative">
        <div className="text-center mb-8">
          <span className="text-4xl">🛠️</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-3">Tạo Sự Kiện Blockchain</h1>
          <p className="text-sm text-slate-400 mt-2">
            Đăng ký và lưu trữ thông tin cấu hình sự kiện trực tiếp vào Smart Contract
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Tên Sự Kiện
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Concert Live Show Nhạc Trẻ..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none transition-colors text-slate-100 placeholder-slate-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Giá Vé (ETH / MATIC)
              </label>
              <input
                type="number"
                step="0.0001"
                value={priceEth}
                onChange={(e) => setPriceEth(e.target.value)}
                placeholder="Ví dụ: 0.015"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none transition-colors text-slate-100 placeholder-slate-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tổng Số Lượng Vé (Supply)
              </label>
              <input
                type="number"
                value={totalTickets}
                onChange={(e) => setTotalTickets(e.target.value)}
                placeholder="Ví dụ: 200"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none transition-colors text-slate-100 placeholder-slate-600 font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-4 break-all leading-relaxed">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative group overflow-hidden rounded-xl p-[1px] focus:outline-none disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 rounded-xl" />
            <div className="px-8 py-3.5 bg-slate-950 rounded-[11px] relative group-hover:bg-transparent transition-colors duration-300">
              <span className="block text-sm font-semibold text-slate-200 group-hover:text-white text-center">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200/25 border-t-slate-200 animate-spin" />
                    Đang gửi giao dịch lên blockchain...
                  </div>
                ) : (
                  "Xác Nhận Đăng Ký Sự Kiện 🚀"
                )}
              </span>
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
