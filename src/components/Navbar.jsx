import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../features/account/accountSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, address, balance, profile } = useSelector((state) => state.account);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("ticket_nft_pvk");
    navigate("/login");
  };

  const getShortAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand Logo */}
        <Link
          to="/"
          className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span>TicketNFT</span>
          <span className="text-xl">🎟️</span>
        </Link>

        {/* Navigation Links and Wallet Status */}
        <div className="flex items-center gap-6">
          {status ? (
            <>
              {/* Internal Nav Links */}
              <div className="hidden sm:flex items-center gap-6 text-xs uppercase tracking-wider font-semibold text-slate-400">
                <Link to="/" className="hover:text-cyan-400 transition-colors">
                  Khám Phá
                </Link>
                <Link to="/dashboard" className="hover:text-cyan-400 transition-colors">
                  Dashboard
                </Link>
                <Link to="/create-event" className="hover:text-cyan-400 transition-colors">
                  Tạo Sự Kiện
                </Link>
              </div>

              {/* Wallet Info Badge */}
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-500 font-mono tracking-tight font-semibold">
                    {profile.isRegistered ? profile.name : "Local Wallet"}
                  </span>
                  <span className="text-xs font-black text-cyan-400 font-sans">
                    {parseFloat(balance).toFixed(4)} ETH
                  </span>
                </div>
                <div className="h-6 w-[1px] bg-slate-800" />
                <Link
                  to="/dashboard"
                  className="text-xs font-mono text-slate-200 bg-slate-950 hover:bg-slate-800 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800/80 transition-colors"
                >
                  {getShortAddress(address)}
                </Link>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-slate-900/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/20 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
              >
                Đăng Xuất
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-cyan-500/10"
            >
              Kết Nối Ví 🦊
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
