import type { JSX } from "react/jsx-runtime"

export function AppPreview(): JSX.Element {
  return (
    <div className="text-center">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg font-bold">C</span>
        </div>
        <span className="text-2xl font-bold text-blue-800">Cashify</span>
      </div>

      {/* Mobile App Preview */}
      <div className="relative mx-auto mb-8">
        <div className="w-80 h-[500px] bg-white rounded-[2.5rem] shadow-2xl p-3 border border-gray-200">
          <div className="w-full h-full bg-gradient-to-b from-gray-50 to-white rounded-[2rem] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">C</span>
              </div>
              <div className="text-sm text-blue-700 font-bold">Cashify</div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200 shadow-sm">
                <div className="text-emerald-600 text-xs font-semibold uppercase tracking-wide">Cash In</div>
                <div className="text-emerald-800 font-bold text-lg">৳42,000</div>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200 shadow-sm">
                <div className="text-red-600 text-xs font-semibold uppercase tracking-wide">Cash Out</div>
                <div className="text-red-800 font-bold text-lg">৳13,000</div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 shadow-sm">
                <div className="text-blue-600 text-xs font-semibold uppercase tracking-wide">Net Balance</div>
                <div className="text-blue-800 font-bold text-lg">৳29,000</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title and Description */}
      <div className="space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Easy Book-keeping for</h2>
        <h3 className="text-3xl font-bold text-gray-800">Healthy Cashflow</h3>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center space-x-2">
        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  )
}
