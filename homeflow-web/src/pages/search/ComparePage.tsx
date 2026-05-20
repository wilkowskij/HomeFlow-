import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { useSearchStore } from '@/store/searchStore';
import { MOCK_PROPERTIES } from '@/utils/mockData';
import { formatCurrency, formatSqft } from '@/utils/cn';

const COMPARE_FIELDS = [
  { key: 'price', label: 'Price', format: (v: unknown) => formatCurrency(v as number) },
  { key: 'beds', label: 'Bedrooms', format: (v: unknown) => `${v} bd` },
  { key: 'baths', label: 'Bathrooms', format: (v: unknown) => `${v} ba` },
  { key: 'sqft', label: 'Square Feet', format: (v: unknown) => formatSqft(v as number) },
  { key: 'yearBuilt', label: 'Year Built', format: (v: unknown) => String(v ?? '—') },
];

export default function ComparePage() {
  const navigate = useNavigate();
  const { compareList, toggleCompare } = useSearchStore();
  const properties = MOCK_PROPERTIES.filter((p) => compareList.includes(p.id));

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <p className="text-4xl mb-3">⚖️</p>
        <h2 className="font-semibold text-slate-900">No homes to compare</h2>
        <p className="text-sm text-slate-500 mt-1">
          Add up to 3 properties from search results to compare them side by side.
        </p>
        <button onClick={() => navigate('/search')} className="btn-primary mt-4">
          Browse Homes
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-8">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display font-bold text-xl">Compare Homes</h1>
      </div>

      {/* Photos row */}
      <div className={`grid gap-3 mb-6`} style={{ gridTemplateColumns: `repeat(${properties.length}, 1fr)` }}>
        {properties.map((p) => (
          <div key={p.id} className="relative">
            <img src={p.photos[0]} alt={p.address.street} className="w-full h-28 object-cover rounded-xl" />
            <button
              onClick={() => toggleCompare(p.id)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"
            >
              <X size={12} className="text-white" />
            </button>
            <p className="text-xs font-semibold text-slate-800 mt-1 truncate">{p.address.street}</p>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="card overflow-hidden">
        {COMPARE_FIELDS.map(({ key, label, format }, i) => (
          <div
            key={key}
            className={`grid gap-px ${i > 0 ? 'border-t border-slate-100' : ''}`}
            style={{ gridTemplateColumns: `120px repeat(${properties.length}, 1fr)` }}
          >
            <div className="bg-slate-50 p-3 flex items-center">
              <span className="text-xs font-semibold text-slate-500">{label}</span>
            </div>
            {properties.map((p) => (
              <div key={p.id} className="p-3 flex items-center">
                <span className="text-sm font-medium text-slate-900">
                  {format((p as Record<string, unknown>)[key])}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* AI verdict */}
      <div className="mt-4 p-4 rounded-2xl bg-brand-50 border border-brand-100">
        <p className="text-xs font-semibold text-brand-600 mb-1">✨ AI Verdict</p>
        <p className="text-sm text-slate-700">
          {properties[0]?.address.street} offers better value per square foot.
          {properties[1] && ` ${properties[1].address.street} is newer and may need fewer repairs.`}
        </p>
      </div>
    </div>
  );
}
