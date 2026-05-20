import { create } from 'zustand';
import type { ViewingAppointment } from '../types';
import type { DbAppointmentStatus } from '../types/database';
import { supabase } from '../lib/supabase';
import { mapDbPropertyToApp } from '../lib/mappers';
import type { PropertyRow } from '../types/database';

interface ScheduleState {
  appointments: ViewingAppointment[];
  isLoading: boolean;
  pendingItineraryPropertyIds: string[];

  fetchAppointments: (userId: string) => Promise<void>;
  addAppointment: (appt: Omit<ViewingAppointment, 'id' | 'createdAt' | 'updatedAt'>, userId: string) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<ViewingAppointment>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  getUpcoming: () => ViewingAppointment[];
  getPast: () => ViewingAppointment[];

  addToItineraryBuilder: (propertyId: string) => void;
  removeFromItineraryBuilder: (propertyId: string) => void;
  clearItineraryBuilder: () => void;
}

function mapDbApptToApp(row: {
  id: string;
  user_id: string;
  property_id: string;
  scheduled_at: string;
  duration: number;
  status: DbAppointmentStatus;
  agent_name: string | null;
  agent_phone: string | null;
  notes: string | null;
  post_visit_rating: number | null;
  created_at: string;
  updated_at: string;
  properties?: PropertyRow | null;
}): ViewingAppointment {
  return {
    id: row.id,
    userId: row.user_id,
    propertyId: row.property_id,
    property: row.properties ? mapDbPropertyToApp(row.properties) : undefined,
    slotId: row.id,
    slot: {
      id: row.id,
      propertyId: row.property_id,
      startTime: row.scheduled_at,
      endTime: new Date(new Date(row.scheduled_at).getTime() + row.duration * 60000).toISOString(),
      type: 'private-showing',
      status: 'confirmed',
    },
    status: row.status,
    agentContact: row.agent_name
      ? { id: '', name: row.agent_name, phone: row.agent_phone ?? '', email: '' }
      : undefined,
    notes: row.notes ?? undefined,
    rating: row.post_visit_rating ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const useScheduleStore = create<ScheduleState>()((set, get) => ({
  appointments: [],
  isLoading: false,
  pendingItineraryPropertyIds: [],

  fetchAppointments: async (userId) => {
    set({ isLoading: true });
    const { data } = await supabase
      .from('viewing_appointments')
      .select('*, properties(*)')
      .eq('user_id', userId)
      .order('scheduled_at', { ascending: true });

    set({
      appointments: (data ?? []).map((row) =>
        mapDbApptToApp(row as Parameters<typeof mapDbApptToApp>[0]),
      ),
      isLoading: false,
    });
  },

  addAppointment: async (appt, userId) => {
    const { data, error } = await supabase
      .from('viewing_appointments')
      .insert({
        user_id: userId,
        property_id: appt.propertyId,
        scheduled_at: appt.slot?.startTime ?? new Date().toISOString(),
        duration: 60,
        status: 'PENDING',
        agent_name: appt.agentContact?.name ?? null,
        agent_phone: appt.agentContact?.phone ?? null,
        notes: appt.notes ?? null,
      })
      .select('*, properties(*)')
      .single();

    if (!error && data) {
      set((state) => ({
        appointments: [
          ...state.appointments,
          mapDbApptToApp(data as Parameters<typeof mapDbApptToApp>[0]),
        ],
      }));
    }
  },

  updateAppointment: async (id, updates) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.status)           dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.rating !== undefined) dbUpdates.post_visit_rating = updates.rating;

    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from('viewing_appointments').update(dbUpdates).eq('id', id);
    }

    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, ...updates } : a,
      ),
    }));
  },

  cancelAppointment: async (id) => {
    await supabase
      .from('viewing_appointments')
      .update({ status: 'CANCELLED' })
      .eq('id', id);

    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, status: 'CANCELLED' as const } : a,
      ),
    }));
  },

  getUpcoming: () => {
    const now = new Date().toISOString();
    return get()
      .appointments.filter(
        (a) => a.status !== 'CANCELLED' && a.slot?.startTime && a.slot.startTime > now,
      )
      .sort((a, b) =>
        (a.slot?.startTime ?? '').localeCompare(b.slot?.startTime ?? ''),
      );
  },

  getPast: () => {
    const now = new Date().toISOString();
    return get()
      .appointments.filter((a) => a.slot?.startTime && a.slot.startTime <= now)
      .sort((a, b) =>
        (b.slot?.startTime ?? '').localeCompare(a.slot?.startTime ?? ''),
      );
  },

  addToItineraryBuilder: (propertyId) =>
    set((state) => {
      if (
        state.pendingItineraryPropertyIds.includes(propertyId) ||
        state.pendingItineraryPropertyIds.length >= 5
      )
        return state;
      return { pendingItineraryPropertyIds: [...state.pendingItineraryPropertyIds, propertyId] };
    }),

  removeFromItineraryBuilder: (propertyId) =>
    set((state) => ({
      pendingItineraryPropertyIds: state.pendingItineraryPropertyIds.filter((id) => id !== propertyId),
    })),

  clearItineraryBuilder: () => set({ pendingItineraryPropertyIds: [] }),
}));
