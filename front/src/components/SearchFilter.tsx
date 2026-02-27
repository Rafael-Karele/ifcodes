import { Search, Filter } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  statusOptions: FilterOption[];
}

export function SearchFilter({
  searchTerm,
  onSearchChange,
  placeholder = "Buscar por título...",
  statusFilter,
  onStatusFilterChange,
  statusOptions,
}: SearchFilterProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-12 h-10 rounded-xl text-sm bg-white border border-stone-200 focus:outline-none focus:border-teal-600 focus:ring focus:ring-teal-600/20 transition-colors"
      />
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="appearance-none w-7 h-7 rounded-lg cursor-pointer opacity-0 absolute inset-0 z-10"
          >
            <option value="all">Todos os status</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              statusFilter !== "all"
                ? "text-teal-600 bg-teal-50"
                : "text-stone-400 hover:text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Filter className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
