import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, MapPin, DollarSign, Home, Clock, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useJourneyStore } from '@/store/journeyStore';
import type { BuyerProfile, BuyingTimeline, PropertyType, PreApprovalStatus } from '@/types';
import { TIMELINE_LABELS } from '@/constants';
import { cn } from '@/utils/cn';
import { supabase } from '@/lib/supabase';
import type { DbPropertyType } from '@/types/database';

const APP_TO_DB_PROPERTY_TYPE: Record<PropertyType, DbPropertyType> = {
  'single-family': 'SINGLE_FAMILY',
  townhouse: 'TOWNHOUSE',
  condo: 'CONDO',
  'multi-family': 'MULTI_FAMILY',
  land: 'LAND',
};

const TOTAL_STEPS = 4;

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'single-family', label: '🏠 Single Family' },
  { value: 'condo', label: '🏢 Condo' },
  { value: 'townhouse', label: '🏘️ Townhouse' },
  { value: 'multi-family', label: '🏗️ Multi-Family' },
];

const MUST_HAVES = [
  'Yard', 'Garage', 'Home Office', 'Good Schools',
  'Short Commute', 'Updated Kitchen', 'Master Bath', 'Basement',
];

const PRE_APPROVAL_OPTIONS = [
  { value: 'approved', label: '✅ I have a pre-approval letter', desc: "You're ready to make offers right now", color: 'border-green-400 bg-green-50' },
  { value: 'in-progress', label: '⏳ I\'m working on it', desc: 'In contact with a lender', color: 'border-amber-400 bg-amber-50' },
  { value: 'none', label: '🚀 Not started yet', desc: "We'll help you get started", color: '' },
] as const;

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { user, setProfile, setOnboardingComplete } = useAuthStore();
  const { initPipeline } = useJourneyStore();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    preApprovalStatus: 'none' as PreApprovalStatus,
    budgetMin: 400000,
    budgetMax: 600000,
    timeline: '3-6months' as BuyingTimeline,
    locations: [] as string[],
    locationInput: '',
    bedsMin: 3,
    bathsMin: 2,
    propertyTypes: ['single-family'] as PropertyType[],
    mustHaves: [] as string[],
    maxCommuteMinutes: 30,
    requiresYard: false,
  });

  const goNext = async () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
    else await handleComplete();
  };

  const goPrev = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    const profile: BuyerProfile = {
      userId: user.id,
      locations: form.locations.length > 0 ? form.locations : ['New Jersey'],
      budgetMin: form.budgetMin,
      budgetMax: form.budgetMax,
      timeline: form.timeline,
      preferences: {
        bedsMin: form.bedsMin,
        bathsMin: form.bathsMin,
        propertyTypes: form.propertyTypes,
        mustHaves: form.mustHaves,
        niceToHaves: [],
        maxCommuteMinutes: form.maxCommuteMinutes,
        requiresYard: form.mustHaves.includes('Yard'),
      },
      preApprovalStatus: form.preApprovalStatus,
    };

    const dbPreApproval = form.preApprovalStatus.toUpperCase().replace('-', '_');
    await supabase.from('buyer_profiles').upsert({
      user_id: user.id,
      locations: profile.locations,
      budget_min: form.budgetMin,
      budget_max: form.budgetMax,
      timeline: form.timeline,
      bedrooms_min: form.bedsMin,
      bathrooms_min: form.bathsMin,
      property_types: form.propertyTypes.map((t) => APP_TO_DB_PROPERTY_TYPE[t]),
      must_haves: form.mustHaves,
      pre_approval_status: dbPreApproval,
    }, { onConflict: 'user_id' });

    setProfile(profile);
    setOnboardingComplete();
    await initPipeline(user.id);
    setSaving(false);
    navigate('/dashboard');
  };

  const togglePropertyType = (type: PropertyType) => {
    setForm((f) => ({
      ...f,
      propertyTypes: f.propertyTypes.includes(type)
        ? f.propertyTypes.filter((t) => t !== type)
        : [...f.propertyTypes, type],
    }));
  };

  const toggleMustHave = (item: string) => {
    setForm((f) => ({
      ...f,
      mustHaves: f.mustHaves.includes(item)
        ? f.mustHaves.filter((m) => m !== item)
        : [...f.mustHaves, item],
    }));
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-warm-50">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        {step > 1 && (
          <button onClick={goPrev} className="mb-4 p-2 -ml-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
        )}

        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 rounded-full flex-1 transition-all duration-300',
                i + 1 <= step ? 'bg-brand-500' : 'bg-slate-200',
              )}
            />
          ))}
        </div>

        <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest">
          Step {step} of {TOTAL_STEPS}
        </p>
      </div>

      {/* Step content */}
      <div className="flex-1 px-6 animate-fade-in">

        {/* Step 1: Pre-approval (qualifier) */}
        {step === 1 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={20} className="text-brand-500" />
              <h2 className="font-display font-bold text-2xl text-slate-900">Pre-approval status</h2>
            </div>
            <p className="text-slate-500 text-sm mb-6">
              This tells us how quickly you can move on a home you love.
            </p>

            <div className="space-y-3">
              {PRE_APPROVAL_OPTIONS.map(({ value, label, desc, color }) => (
                <button
                  key={value}
                  onClick={() => setForm((f) => ({ ...f, preApprovalStatus: value as PreApprovalStatus }))}
                  className={cn(
                    'w-full p-4 rounded-2xl border-2 text-left transition-all',
                    form.preApprovalStatus === value
                      ? color || 'border-brand-500 bg-brand-50'
                      : 'border-warm-200 hover:border-brand-300',
                  )}
                >
                  <p className="font-semibold text-slate-900">{label}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>

            {form.preApprovalStatus === 'none' && (
              <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <p className="text-sm font-semibold text-amber-800 mb-1">💡 Why it matters</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Pre-approved buyers close 30% faster and win more competitive offers.
                  We'll guide you through the process after setup.
                </p>
              </div>
            )}
            {form.preApprovalStatus === 'approved' && (
              <div className="mt-5 p-4 rounded-2xl bg-green-50 border border-green-200">
                <p className="text-sm font-semibold text-green-800">🎉 You're ready to make offers!</p>
                <p className="text-xs text-green-700 mt-0.5">
                  You can upload your letter in the Journey tracker once you're set up.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Budget & timeline */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-brand-500" />
              <h2 className="font-display font-bold text-2xl text-slate-900">Budget & timeline</h2>
            </div>
            <p className="text-slate-500 text-sm mb-6">Help us find homes in the right range.</p>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Min budget: ${(form.budgetMin / 1000).toFixed(0)}K
                </label>
                <input
                  type="range"
                  min={200000}
                  max={2000000}
                  step={25000}
                  value={form.budgetMin}
                  onChange={(e) => setForm((f) => ({ ...f, budgetMin: Number(e.target.value) }))}
                  className="w-full accent-brand-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Max budget: ${(form.budgetMax / 1000).toFixed(0)}K
                </label>
                <input
                  type="range"
                  min={200000}
                  max={2000000}
                  step={25000}
                  value={form.budgetMax}
                  onChange={(e) => setForm((f) => ({ ...f, budgetMax: Number(e.target.value) }))}
                  className="w-full accent-brand-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-3 block">
                  <Clock size={14} className="inline mr-1.5" />
                  When do you want to move?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(TIMELINE_LABELS).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setForm((f) => ({ ...f, timeline: val as BuyingTimeline }))}
                      className={cn(
                        'p-3 rounded-xl border-2 text-sm font-medium text-left transition-all',
                        form.timeline === val
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-warm-200 text-slate-600 hover:border-slate-300',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={20} className="text-brand-500" />
              <h2 className="font-display font-bold text-2xl text-slate-900">Where are you looking?</h2>
            </div>
            <p className="text-slate-500 text-sm mb-6">Add one or more areas you're interested in.</p>

            <div className="flex gap-2 mb-3">
              <input
                className="input-base flex-1"
                placeholder="e.g. Freehold, NJ"
                value={form.locationInput}
                onChange={(e) => setForm((f) => ({ ...f, locationInput: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && form.locationInput.trim()) {
                    setForm((f) => ({
                      ...f,
                      locations: [...f.locations, f.locationInput.trim()],
                      locationInput: '',
                    }));
                  }
                }}
              />
              <button
                onClick={() => {
                  if (form.locationInput.trim()) {
                    setForm((f) => ({
                      ...f,
                      locations: [...f.locations, f.locationInput.trim()],
                      locationInput: '',
                    }));
                  }
                }}
                className="btn-primary px-4"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {form.locations.map((loc) => (
                <span key={loc} className="badge bg-brand-100 text-brand-700 gap-1.5 py-1.5">
                  <MapPin size={11} />
                  {loc}
                  <button
                    onClick={() => setForm((f) => ({ ...f, locations: f.locations.filter((l) => l !== loc) }))}
                    className="ml-0.5 text-brand-400 hover:text-brand-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {form.locations.length === 0 && (
              <p className="text-xs text-slate-400 mt-3">No locations added yet — you can add these later.</p>
            )}
          </div>
        )}

        {/* Step 4: Preferences */}
        {step === 4 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Home size={20} className="text-brand-500" />
              <h2 className="font-display font-bold text-2xl text-slate-900">What do you need?</h2>
            </div>
            <p className="text-slate-500 text-sm mb-6">Size, type, and must-have features.</p>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Min bedrooms</label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setForm((f) => ({ ...f, bedsMin: n }))}
                      className={cn(
                        'w-9 h-9 rounded-xl font-semibold text-sm transition-all',
                        form.bedsMin === n
                          ? 'bg-brand-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                      )}
                    >
                      {n}+
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Property type</label>
                <div className="grid grid-cols-2 gap-2">
                  {PROPERTY_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => togglePropertyType(value)}
                      className={cn(
                        'p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-2',
                        form.propertyTypes.includes(value)
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-warm-200 text-slate-600 hover:border-slate-300',
                      )}
                    >
                      {form.propertyTypes.includes(value) && (
                        <Check size={14} className="text-brand-600 flex-shrink-0" />
                      )}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Must-haves</label>
                <div className="flex flex-wrap gap-2">
                  {MUST_HAVES.map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleMustHave(item)}
                      className={cn(
                        'badge py-1.5 transition-all',
                        form.mustHaves.includes(item)
                          ? 'bg-brand-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-10 pt-6">
        <button
          onClick={goNext}
          disabled={saving}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? (
            'Setting up your journey…'
          ) : step === TOTAL_STEPS ? (
            <><Check size={18} />Start my HomeFlow journey</>
          ) : (
            <>Continue<ArrowRight size={18} /></>
          )}
        </button>

        {step === TOTAL_STEPS && (
          <button
            onClick={handleComplete}
            className="w-full text-center text-sm text-slate-400 hover:text-slate-600 mt-3 py-2"
          >
            Skip preferences for now
          </button>
        )}
      </div>
    </div>
  );
}
