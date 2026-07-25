import { Calendar, Clock, Search } from "lucide-react";

interface TripSearchProps {
  defaultQuery?: string;
}

export default function TripSearch({ defaultQuery = "" }: TripSearchProps) {
  return (
    <form action="/trips" method="get" className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <label className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 hover:border-[#13b5b1] focus-within:border-[#13b5b1] transition-colors">
          <Search size={18} className="text-gray-400 shrink-0" />
          <span className="sr-only">Destination or trip</span>
          <input
            name="q"
            type="search"
            defaultValue={defaultQuery}
            placeholder="Where to?"
            className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
          />
        </label>

        <button
          type="button"
          disabled
          title="Date filtering arrives in the marketplace phase"
          className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 text-gray-400 sm:min-w-[150px] disabled:cursor-not-allowed"
        >
          <Calendar size={18} className="shrink-0" />
          <span className="text-sm">Dates soon</span>
        </button>

        <button
          type="button"
          disabled
          title="Duration filtering arrives in the marketplace phase"
          className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 text-gray-400 sm:min-w-[130px] disabled:cursor-not-allowed"
        >
          <Clock size={18} className="shrink-0" />
          <span className="text-sm">Duration soon</span>
        </button>

        <button
          id="search-trips-btn"
          type="submit"
          className="flex items-center justify-center gap-2 bg-[#f05c40] hover:bg-[#d94e34] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-[0_4px_14px_rgba(240,92,64,0.35)] hover:shadow-[0_6px_20px_rgba(240,92,64,0.45)] whitespace-nowrap"
        >
          <Search size={16} />
          Find a Trip
        </button>
      </div>
    </form>
  );
}
