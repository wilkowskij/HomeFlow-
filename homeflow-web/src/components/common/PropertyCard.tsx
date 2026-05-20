import { useState } from 'react';
import { Heart, Calendar, BedDouble, Bath, Maximize2, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Property } from '@/types';
import { cn, formatCurrency, formatSqft, relativeTime } from '@/utils/cn';
import { useSearchStore } from '@/store/searchStore';
import { useAuthStore } from '@/store/authStore';
import ScheduleModal from './ScheduleModal';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'compact' | 'horizontal';
  showAiScore?: boolean;
  className?: string;
}

export default function PropertyCard({
  property,
  variant = 'default',
  showAiScore = true,
  className,
}: PropertyCardProps) {
  const navigate = useNavigate();
  const { saveHome, unsaveHome, isSaved } = useSearchStore();
  const { user } = useAuthStore();
  const saved = isSaved(property.id);
  const [showSchedule, setShowSchedule] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Sign in to save homes');
      return;
    }
    if (saved) {
      unsaveHome(property.id, user.id);
    } else {
      saveHome(property, user.id);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={() => navigate(`/search/property/${property.id}`)}
        className={cn(
          'card card-hover flex items-center gap-3 p-3 w-full text-left',
          className,
        )}
      >
        <img
          src={property.photos[0] ?? '/placeholder-home.jpg'}
          alt={property.address.formattedAddress}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-sm truncate">
            {property.address.street}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {property.address.city}, {property.address.state}
          </p>
          <p className="font-bold text-brand-600 text-sm mt-0.5">
            {formatCurrency(property.price, true)}
          </p>
        </div>
        <div className="flex-shrink-0 text-slate-400">
          <span className="text-xs">{property.beds}bd</span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate(`/search/property/${property.id}`)}
      className={cn('card card-hover overflow-hidden text-left w-full', className)}
    >
      {/* Image */}
      <div className="relative">
        <img
          src={property.photos[0] ?? '/placeholder-home.jpg'}
          alt={property.address.formattedAddress}
          className="w-full h-48 object-cover"
        />

        {/* AI Match Score */}
        {showAiScore && property.aiInsights?.matchScore && (
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-white">
              {property.aiInsights.matchScore}% match
            </span>
          </div>
        )}

        {/* Status badge */}
        <div
          className={cn(
            'absolute top-3 right-12 badge text-white text-[10px]',
            property.status === 'active' && 'bg-success',
            property.status === 'pending' && 'bg-warning',
            property.status === 'under-contract' && 'bg-orange-500',
          )}
        >
          {property.status === 'active'
            ? 'Active'
            : property.status === 'pending'
              ? 'Pending'
              : 'Under Contract'}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className={cn(
            'absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all duration-150 hover:scale-110',
          )}
        >
          <Heart
            size={15}
            className={cn(
              'transition-colors',
              saved ? 'fill-red-500 text-red-500' : 'text-slate-500',
            )}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xl text-slate-900">
              {formatCurrency(property.price, true)}
            </p>
            <p className="text-sm text-slate-700 font-medium truncate mt-0.5">
              {property.address.street}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {property.address.city}, {property.address.state} {property.address.zip}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-warm-200">
          <span className="flex items-center gap-1 text-xs text-slate-600">
            <BedDouble size={13} className="text-slate-400" />
            {property.beds} bd
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-600">
            <Bath size={13} className="text-slate-400" />
            {property.baths} ba
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-600">
            <Maximize2 size={13} className="text-slate-400" />
            {formatSqft(property.sqft)}
          </span>
          <span className="ml-auto text-xs text-slate-400">
            {relativeTime(property.listedAt)}
          </span>
        </div>

        {/* AI match reasons */}
        {property.aiInsights && property.aiInsights.pros.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {property.aiInsights.pros.slice(0, 2).map((pro, i) => (
              <span key={i} className="text-[10px] bg-green-50 text-green-700 border border-green-100 rounded-full px-2 py-0.5">
                ✓ {pro}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowSchedule(true);
          }}
          className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold transition-colors"
        >
          <Calendar size={13} />
          Schedule Viewing
        </button>
      </div>

      {showSchedule && (
        <ScheduleModal
          propertyId={property.id}
          propertyAddress={property.address.formattedAddress}
          onClose={() => setShowSchedule(false)}
        />
      )}
    </button>
  );
}
