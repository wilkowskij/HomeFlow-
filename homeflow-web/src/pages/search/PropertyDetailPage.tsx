import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, Share2, Calendar, BedDouble, Bath,
  Maximize2, Star, MapPin, TrendingUp, School,
  Sparkles,
} from 'lucide-react';
import { useSearchStore } from '@/store/searchStore';
import { useAuthStore } from '@/store/authStore';
import { useProperty } from '@/hooks/useProperties';
import { cn, formatCurrency, formatSqft } from '@/utils/cn';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { saveHome, unsaveHome, isSaved, toggleCompare, isInCompare } = useSearchStore();
  const { user } = useAuthStore();

  const { data: property, isLoading } = useProperty(id ?? '', user?.id);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><p className="text-slate-400">Loading…</p></div>;
  }
  if (!property) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Property not found.</p>
      </div>
    );
  }

  const saved = isSaved(property.id);
  const inCompare = isInCompare(property.id);

  return (
    <div className="pb-32">
      {/* Photo gallery */}
      <div className="relative">
        <img
          src={property.photos[0] ?? '/placeholder-home.jpg'}
          alt={property.address.formattedAddress}
          className="w-full h-72 object-cover"
        />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
        >
          <ArrowLeft size={18} className="text-slate-700" />
        </button>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <Share2 size={15} className="text-slate-700" />
          </button>
          <button
            onClick={() => user && (saved ? unsaveHome(property.id, user.id) : saveHome(property, user.id))}
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
          >
            <Heart size={15} className={cn(saved ? 'fill-red-500 text-red-500' : 'text-slate-700')} />
          </button>
        </div>

        {/* Photo count */}
        <div className="absolute bottom-3 right-3 badge bg-black/60 text-white text-[10px]">
          📸 {property.photos.length} photos
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {/* Price & address */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display font-bold text-3xl text-slate-900">
                {formatCurrency(property.price)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={13} className="text-slate-400" />
                <p className="text-sm text-slate-600">{property.address.formattedAddress}</p>
              </div>
            </div>
            {property.aiInsights?.matchScore && (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5">
                  <Star size={13} className="text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-amber-700">
                    {property.aiInsights.matchScore}% match
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">based on your profile</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4 p-4 rounded-2xl bg-warm-50">
            <div className="flex-1 flex flex-col items-center">
              <BedDouble size={18} className="text-slate-400 mb-1" />
              <span className="font-bold text-slate-900">{property.beds}</span>
              <span className="text-xs text-slate-500">Beds</span>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="flex-1 flex flex-col items-center">
              <Bath size={18} className="text-slate-400 mb-1" />
              <span className="font-bold text-slate-900">{property.baths}</span>
              <span className="text-xs text-slate-500">Baths</span>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="flex-1 flex flex-col items-center">
              <Maximize2 size={18} className="text-slate-400 mb-1" />
              <span className="font-bold text-slate-900">{formatSqft(property.sqft)}</span>
              <span className="text-xs text-slate-500">Sq ft</span>
            </div>
          </div>
        </div>

        {/* AI Pros & Cons */}
        {property.aiInsights && (
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-brand-500" />
              <h3 className="font-semibold text-slate-900">AI Analysis</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {property.aiInsights.summary}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-green-600 mb-2">✅ Pros</p>
                <ul className="space-y-1">
                  {property.aiInsights.pros.map((pro, i) => (
                    <li key={i} className="text-xs text-slate-600">{pro}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-500 mb-2">⚠️ Cons</p>
                <ul className="space-y-1">
                  {property.aiInsights.cons.map((con, i) => (
                    <li key={i} className="text-xs text-slate-600">{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Neighborhood */}
        {property.neighborhood && (
          <div className="card p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Neighborhood</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: TrendingUp, label: 'Walk Score', value: property.neighborhood.walkScore },
                { icon: School, label: 'School Rating', value: property.neighborhood.schoolRating ? `${property.neighborhood.schoolRating}/10` : null },
              ]
                .filter((item) => item.value != null)
                .map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2 p-3 rounded-xl bg-warm-50">
                    <Icon size={15} className="text-brand-500" />
                    <div>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="font-semibold text-slate-900 text-sm">{value}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Compare button */}
        <button
          onClick={() => toggleCompare(property.id)}
          className={cn(
            'w-full py-3 rounded-xl border-2 text-sm font-semibold transition-all',
            inCompare
              ? 'border-brand-500 text-brand-600 bg-brand-50'
              : 'border-warm-200 text-slate-600 hover:border-brand-300',
          )}
        >
          {inCompare ? '✓ Added to Compare' : '+ Add to Compare'}
        </button>

        {/* Description */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">About this home</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{property.description}</p>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-[64px] left-0 right-0 px-4 pb-4 glass border-t border-warm-200 pt-3">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate(`/schedule?propertyId=${property.id}`)}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Calendar size={17} />
            Schedule a Viewing
          </button>
        </div>
      </div>
    </div>
  );
}
