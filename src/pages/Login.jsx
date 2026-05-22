import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, updateNetwork } from "../features/account/accountSlice";
import Web3Service from "../services/web3Service";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentNetwork = useSelector((state) => state.account);

  const [privateKey, setPrivateKey] = useState("");
  const [rpcUrl, setRpcUrl] = useState(currentNetwork.rpcUrl || "http://127.0.0.1:7545");
  const [contractAddress, setContractAddress] = useState(
    currentNetwork.contractAddress || "0xf8e81D47203A594245E36C48e151709F0C19fBe8"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!privateKey.trim()) {
      setError("Vui lòng nhập Private Key!");
      return;
    }
    if (!rpcUrl.trim()) {
      setError("Vui lòng nhập RPC Network URL!");
      return;
    }
    if (!contractAddress.trim()) {
      setError("Vui lòng nhập địa chỉ hợp đồng!");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // 1. Initialize web3 service singleton
      const service = Web3Service.getInstance();
      service.init(rpcUrl, contractAddress);

      // 2. Perform login with private key
      const accountData = await service.loginWithPrivateKey(privateKey);

      // 3. Dispatch to Redux state
      dispatch(
        updateNetwork({
          rpcUrl,
          contractAddress,
        })
      );
      dispatch(
        login({
          address: accountData.address,
          balance: accountData.balance,
          nonce: accountData.nonce,
          profile: accountData.profile,
        })
      );

      // Save key locally to allow seamless signing for subsequent functions
      localStorage.setItem("ticket_nft_pvk", privateKey);

      navigate("/");
    } catch (err) {
      console.error("Login failure details:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to fill with local Ganache dev credentials for easy verification
  const handleAutoFillDev = () => {
    setPrivateKey("0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d");
    setRpcUrl("http://127.0.0.1:7545");
    setContractAddress("0xf8e81D47203A594245E36C48e151709F0C19fBe8");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-950">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg z-10">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">
              Kết Nối Ví Cá Nhân
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Nhập khóa bảo mật và cấu hình blockchain để bắt đầu giao dịch
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                RPC Provider URL (Blockchain Node)
              </label>
              <input
                type="text"
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                placeholder="http://127.0.0.1:7545"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none transition-colors text-slate-100 placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Địa Chỉ Hợp Đồng EventTicketing
              </label>
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0xf8e81D47203A594245E36C48e151709F0C19fBe8"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none transition-colors text-slate-100 placeholder-slate-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Private Key (Khóa Riêng Tư)
              </label>
              <input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="0x..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none transition-colors text-slate-100 placeholder-slate-600 font-mono"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-4 break-all leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 rounded-xl" />
              <div className="px-8 py-3 bg-slate-950 rounded-[11px] relative group-hover:bg-transparent transition-colors duration-300">
                <span className="block text-sm font-semibold text-slate-200 group-hover:text-white text-center">
                  {isLoading ? "Đang liên kết & đồng bộ..." : "Đăng Nhập Ngay ⚡"}
                </span>
              </div>
            </button>
          </form>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase tracking-wider">Hoặc</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            type="button"
            onClick={handleAutoFillDev}
            className="w-full bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 text-slate-300 text-xs py-3 px-4 rounded-xl transition-all font-semibold flex items-center justify-center gap-2"
          >
            🛠️ Dành cho Lập Trình Viên (Nạp Ví Local Dev)
          </button>
        </div>
      </div>
    </div>
  );
}
