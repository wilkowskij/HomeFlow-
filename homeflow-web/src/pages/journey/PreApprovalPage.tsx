import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

const LENDERS = [
  {
    name: 'Better Mortgage',
    tagline: 'Fastest online approval · avg. 3 days',
    badge: '⚡ Fastest',
    badgeColor: 'bg-amber-500/20 text-brand-400',
    pros: ['100% online', 'No origination fee', 'Lock rate instantly'],
    url: '#',
  },
  {
    name: 'Rocket Mortgage',
    tagline: 'Most trusted · 4.8★ from 2,000+ reviews',
    badge: '⭐ Most Trusted',
    badgeColor: 'bg-brand-100 text-brand-400',
    pros: ['24/7 support', 'Easy app', 'First-time buyer programs'],
    url: '#',
  },
  {
    name: 'Guild Mortgage',
    tagline: 'Best for first-time buyers · local NJ offices',
    badge: '🏡 Best for FTB',
    badgeColor: 'bg-green-500/20 text-green-400',
    pros: ['Down payment assistance', 'Local agents', 'FHA/VA/USDA loans'],
    url: '#',
  },
];

const DOCS_NEEDED = [
  { label: 'Pay stubs', desc: 'Last 2 months', icon: '💼' },
  { label: 'Tax returns', desc: 'Last 2 years (W-2 or 1040)', icon: '📋' },
  { label: 'Bank statements', desc: 'Last 2–3 months, all accounts', icon: '🏦' },
  { label: 'Employment letter', desc: 'On employer letterhead', icon: '📄' },
  { label: 'Government ID', desc: 'Driver\'s license or passport', icon: '🪪' },
  { label: 'Social Security number', desc: 'For credit check', icon: '🔒' },
];

export default function PreApprovalPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const status = profile?.preApprovalStatus ?? 'none';

  return (
    <div className="px-4 pt-4 pb-8 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-warm-200 rounded-xl">
          <ArrowLeft size={18} className="text-slate-400" />
        </button>
        <div>
          <h1 className="font-display font-bold text-xl text-white">Pre-Approval Guide</h1>
          <p className="text-xs text-slate-500 mt-0.5">Get pre-approved in as little as 24 hours</p>
        </div>
      </div>

      {/* Status banner */}
      <div className={cn(
        'rounded-2xl p-4 border',
        status === 'approved'
          ? 'bg-green-500/10 border-green-500/30'
          : status === 'in-progress'
            ? 'bg-brand-100 border-brand-200'
            : 'bg-warm-200 border-warm-300',
      )}>
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className={status === 'approved' ? 'text-green-400' : 'text-brand-500'} />
          <div>
            <p className="font-semibold text-white text-sm">
              {status === 'approved' && '✅ Pre-approved — ready to make offers'}
              {status === 'in-progress' && '⏳ In progress — check in with your lender'}
              {status === 'none' && '🚀 Not started — let\'s get you approved'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {status === 'approved'
                ? 'Upload your letter in the Journey tracker to complete this stage'
                : 'Pre-approved buyers close 30% faster and win more offers'}
            </p>
          </div>
        </div>
        {status !== 'approved' && (
          <button
            onClick={() => navigate('/journey/stage/PROFILE_PREAPPROVAL')}
            className="mt-3 w-full btn-primary text-sm py-2.5"
          >
            Update My Status
          </button>
        )}
      </div>

      {/* Why it matters */}
      <div className="card p-4">
        <h2 className="font-semibold text-white mb-3">Why pre-approval matters</h2>
        <div className="space-y-2">
          {[
            { stat: '30%', desc: 'faster closing for pre-approved buyers' },
            { stat: '2×', desc: 'more likely to win in a bidding war' },
            { stat: '5 min', desc: 'is all it takes to start the process' },
          ].map(({ stat, desc }) => (
            <div key={stat} className="flex items-center gap-3 p-3 rounded-xl bg-warm-100 border border-warm-300">
              <span className="font-display font-bold text-brand-500 text-lg w-10 flex-shrink-0">{stat}</span>
              <span className="text-sm text-slate-400">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended lenders */}
      <div>
        <h2 className="font-semibold text-white mb-3">Recommended Lenders</h2>
        <div className="space-y-3">
          {LENDERS.map((lender) => (
            <div key={lender.name} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-white">{lender.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{lender.tagline}</p>
                </div>
                <span className={cn('badge text-[10px]', lender.badgeColor)}>
                  {lender.badge}
                </span>
              </div>
              <div className="space-y-1 mb-3">
                {lender.pros.map((pro) => (
                  <p key={pro} className="text-xs text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 size={11} className="text-brand-500 flex-shrink-0" />
                    {pro}
                  </p>
                ))}
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-brand-500/40 text-brand-400 text-sm font-semibold hover:bg-brand-100 transition-colors">
                Start with {lender.name}
                <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Documents checklist */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-brand-500" />
          <h2 className="font-semibold text-white">Documents you'll need</h2>
        </div>
        <div className="card overflow-hidden">
          {DOCS_NEEDED.map((doc, i) => (
            <div
              key={doc.label}
              className={cn(
                'flex items-center gap-3 px-4 py-3',
                i < DOCS_NEEDED.length - 1 && 'border-b border-warm-300',
              )}
            >
              <span className="text-lg flex-shrink-0">{doc.icon}</span>
              <div>
                <p className="text-sm font-medium text-white">{doc.label}</p>
                <p className="text-xs text-slate-500">{doc.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
          <Clock size={11} />
          Gathering these in advance cuts approval time in half
        </p>
      </div>
    </div>
  );
}
