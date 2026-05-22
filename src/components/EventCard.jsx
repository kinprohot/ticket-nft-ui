import { Link } from "react-router-dom";

export default function EventCard({ id, image, title, price, soldTickets, totalTickets }) {
  const percentSold = totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;
  const isSoldOut = soldTickets >= totalTickets;

  return (
    <div className="group bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)] transition-all duration-300 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-slate-800/80 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          On-Chain
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">
          {title}
        </h3>

        {/* Progress Bar for Ticket Supply */}
        <div className="mt-4 mb-6">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Còn lại: {totalTickets - soldTickets} vé</span>
            <span className="font-semibold">{Math.round(percentSold)}% đã bán</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${percentSold}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-900">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Giá Vé</p>
            <p className="text-lg font-black text-cyan-400">{price} ETH</p>
          </div>
          {isSoldOut ? (
            <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
              Hết Vé
            </span>
          ) : (
            <Link
              to={`/event/${id}`}
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-500/10"
            >
              Xem Chi Tiết
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
