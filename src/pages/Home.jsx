import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import EventCard from "../components/EventCard";
import Web3Service from "../services/web3Service";

const MOCK_BANNER_IMAGES = [
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
];

const INITIAL_DEV_EVENTS = [
  { name: "Concert Anh Trai Say Hi - Đà Nẵng", priceEth: "0.015", totalTickets: 200 },
  { name: "Chung Kết Đấu Trường Danh Vọng Mùa Đông", priceEth: "0.005", totalTickets: 500 },
  { name: "Giải Đấu Valorant VKU Mở Rộng", priceEth: "0.002", totalTickets: 300 },
];

export default function Home() {
  const accountState = useSelector((state) => state.account);
  const { status, address } = accountState;

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState("");

  const fetchEvents = async () => {
    setIsLoading(true);
    setError("");
    try {
      const service = Web3Service.getInstance();
      const list = await service.getEvents();
      setEvents(list);
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối blockchain hoặc hợp đồng chưa được triển khai đúng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [accountState.contractAddress, accountState.rpcUrl]);

  // Seeding support so that the page isn't blank on fresh local blockchain installs
  const handleSeedMockData = async () => {
    const pvk = localStorage.getItem("ticket_nft_pvk");
    if (!status || !pvk) {
      alert("Vui lòng kết nối ví (Đăng nhập) trước khi nạp dữ liệu mẫu!");
      return;
    }

    setIsSeeding(true);
    setError("");
    try {
      const service = Web3Service.getInstance();
      for (const item of INITIAL_DEV_EVENTS) {
        await service.createEvent(pvk, item.name, item.priceEth, item.totalTickets);
      }
      await fetchEvents();
    } catch (err) {
      console.error(err);
      setError("Nạp sự kiện thất bại. Đảm bảo ví của bạn có đủ ETH để trả phí gas.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero section */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 mb-4 border border-cyan-500/20">
          Kỷ Nguyên Vé Số Hóa NFT
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-6">
          Sở Hữu Vé Độc Bản <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
            Minh Bạch & Bảo Mật Tuyệt Đối
          </span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          Khám phá các sự kiện âm nhạc, thể thao và điện tử hàng đầu. Vé được đúc trực tiếp dưới dạng NFT (ERC721) vào địa chỉ ví cá nhân của bạn.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 pb-6 border-b border-slate-900 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Sự kiện nổi bật <span className="animate-pulse"></span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Đúc vé trực tiếp bằng Smart Contract</p>
        </div>

        {status && (
          <div className="flex gap-3">
            <Link
              to="/create-event"
              className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
            >
              Tạo Sự Kiện Mới
            </Link>
            {events.length === 0 && (
              <button
                onClick={handleSeedMockData}
                disabled={isSeeding}
                className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSeeding ? "Đang nạp..." : "⚡ Nạp Sự Kiện Mẫu"}
              </button>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500/25 border-t-cyan-500 animate-spin mb-4" />
          <p className="text-slate-400 text-sm font-medium">Đang quét dữ liệu từ blockchain...</p>
        </div>
      ) : error ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-10 text-center max-w-xl mx-auto">
          <p className="text-red-400 mb-4 font-medium"> {error}</p>
          <div className="text-xs text-slate-500 space-y-2 mb-6">
            <p>1. Đảm bảo nút blockchain local (Hardhat/Anvil/Ganache) đang chạy.</p>
            <p>2. Kiểm tra xem contract đã được deploy chưa.</p>
            <p>3. Cấu hình đúng RPC URL và địa chỉ trong phần Đăng Nhập.</p>
          </div>
          <Link
            to="/login"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all inline-block"
          >
            Đến Trang Cấu Hình Ví
          </Link>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl p-16 text-center max-w-xl mx-auto">
          <p className="text-slate-400 text-lg mb-6">Hợp đồng hiện tại chưa có sự kiện nào hoạt động.</p>
          {!status ? (
            <div className="space-y-4">
              <p className="text-slate-500 text-sm">Vui lòng đăng nhập ví để nạp sự kiện mẫu hoặc tạo sự kiện mới.</p>
              <Link
                to="/login"
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 px-6 py-3 rounded-xl font-bold transition-all inline-block shadow-lg shadow-cyan-500/20"
              >
                Đăng Nhập Kết Nối Ví
              </Link>
            </div>
          ) : (
            <button
              onClick={handleSeedMockData}
              disabled={isSeeding}
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 px-6 py-3 rounded-xl font-bold transition-all inline-block shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {isSeeding ? "Đang đúc sự kiện..." : "Tự Động Nạp Dữ Liệu Sự Kiện Mẫu "}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              price={event.price}
              soldTickets={event.soldTickets}
              totalTickets={event.totalTickets}
              image={MOCK_BANNER_IMAGES[index % MOCK_BANNER_IMAGES.length]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
