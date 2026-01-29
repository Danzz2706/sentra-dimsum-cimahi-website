"use client";

export default function SearchFilter({
    categories,
    selectedCategory,
    onCategoryChange,
    searchQuery,
    onSearchChange,
}) {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Search Bar */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400 group-focus-within:text-primary transition-colors"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm text-text-primary placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all shadow-sm hover:shadow-md"
                    placeholder="Cari dimsum favoritmu..."
                />
            </div>

            {/* Category Pills */}
            <div className="flex flex-nowrap items-center gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        className={`
              relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0
              ${selectedCategory === category
                                ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                                : "bg-white text-text-secondary hover:bg-gray-50 hover:text-primary border border-gray-100"
                            }
            `}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
}
