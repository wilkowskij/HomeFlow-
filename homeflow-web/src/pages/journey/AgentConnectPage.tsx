import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Star, Clock, CheckCircle2 } from 'lucide-react';
import { useJourneyStore } from '@/store/journeyStore';
import { generateId } from '@/utils/cn';
import toast from 'react-hot-toast';

const MOCK_AGENTS = [
  {
    id: 'agent_1',
    name: 'Sarah Rodriguez',
    agency: 'Coldwell Banker NJ',
    rating: 4.9,
    reviews: 147,
    responseTime: '< 1 hour',
    specialty: 'First-time buyers',
    areas: ['Freehold', 'Marlboro', 'Manalapan'],
    avatarUrl: null,
  },
  {
    id: 'agent_2',
    name: 'Michael Chen',
    agency: 'RE/MAX Central',
    rating: 4.8,
    reviews: 89,
    responseTime: '< 2 hours',
    specialty: 'Competitive markets',
    areas: ['Freehold', 'Howell', 'Jackson'],
    avatarUrl: null,
  },
  {
    id: 'agent_3',
    name: 'Lisa Thompson',
    agency: 'Keller Williams Monmouth',
    rating: 4.7,
    reviews: 203,
    responseTime: 'Same day',
    specialty: 'Relocating professionals',
    areas: ['Freehold', 'Shrewsbury', 'Colts Neck'],
    avatarUrl: null,
  },
];

export default function AgentConnectPage() {
  const navigate = useNavigate();
  const { connectAgent } = useJourneyStore();
  const [inviteCode, setInviteCode] = useState('');

  const handleConnect = (agentId: string, agentName: string) => {
    connectAgent(agentId);
    toast.success(`Connected with ${agentName}!`);
    navigate('/journey');
  };

  const handleCodeConnect = () => {
    if (!inviteCode.trim()) return;
    connectAgent(generateId('agent'));
    toast.success('Connected via invite code!');
    navigate('/journey');
  };

  return (
    <div className="px-4 pt-4 pb-8 space-y-6">
      <div className="flex items-center gap-3 mb-1">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display font-bold text-xl">Connect with Agent</h1>
      </div>

      <p className="text-sm text-slate-600">
        Connect your agent to share your pipeline, collaborate on tasks, and communicate securely in-app.
      </p>

      {/* Enter invite code */}
      <div className="card p-4">
        <p className="text-sm font-semibold text-slate-800 mb-3">Already have an agent?</p>
        <div className="flex gap-2">
          <input
            className="input-base flex-1 text-sm py-2.5"
            placeholder="Enter agent invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
          <button onClick={handleCodeConnect} className="btn-primary px-4 py-2.5 text-sm">
            Connect
          </button>
        </div>
      </div>

      {/* Agent recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Search size={15} className="text-brand-500" />
          <h2 className="font-semibold text-slate-800">Recommended Agents Near You</h2>
        </div>

        <div className="space-y-3">
          {MOCK_AGENTS.map((agent) => (
            <div key={agent.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 text-lg font-bold text-brand-600">
                  {agent.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{agent.name}</p>
                  <p className="text-xs text-slate-500">{agent.agency}</p>

                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <Star size={11} fill="currentColor" />
                      {agent.rating} ({agent.reviews})
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={11} />
                      {agent.responseTime}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    Specializes in: <span className="font-medium text-slate-700">{agent.specialty}</span>
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {agent.areas.map((area) => (
                      <span key={area} className="badge bg-slate-100 text-slate-600 text-[10px]">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleConnect(agent.id, agent.name)}
                className="w-full mt-3 btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={15} />
                Connect with {agent.name.split(' ')[0]}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
