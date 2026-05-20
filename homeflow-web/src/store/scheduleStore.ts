import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ViewingAppointment, ViewingItinerary } from '@homeflow/shared';

interface ScheduleState {
  appointments: ViewingAppointment[];
  itineraries: ViewingItinerary[];
  pendingItineraryPropertyIds: string[]; // selected for itinerary builder

  addAppointment: (appt: ViewingAppointment) => void;
  updateAppointment: (id: string, updates: Partial<ViewingAppointment>) => void;
  cancelAppointment: (id: string) => void;
  getUpcoming: () => ViewingAppointment[];
  getPast: () => ViewingAppointment[];

  addToItineraryBuilder: (propertyId: string) => void;
  removeFromItineraryBuilder: (propertyId: string) => void;
  clearItineraryBuilder: () => void;

  saveItinerary: (itinerary: ViewingItinerary) => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      appointments: [],
      itineraries: [],
      pendingItineraryPropertyIds: [],

      addAppointment: (appt) =>
        set((state) => ({ appointments: [...state.appointments, appt] })),

      updateAppointment: (id, updates) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, ...updates } : a,
          ),
        })),

      cancelAppointment: (id) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, status: 'cancelled' as const } : a,
          ),
        })),

      getUpcoming: () => {
        const now = new Date().toISOString();
        return get()
          .appointments.filter(
            (a) =>
              a.status !== 'cancelled' &&
              a.slot?.startTime &&
              a.slot.startTime > now,
          )
          .sort((a, b) =>
            (a.slot?.startTime ?? '').localeCompare(b.slot?.startTime ?? ''),
          );
      },

      getPast: () => {
        const now = new Date().toISOString();
        return get()
          .appointments.filter(
            (a) => a.slot?.startTime && a.slot.startTime <= now,
          )
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
          return {
            pendingItineraryPropertyIds: [
              ...state.pendingItineraryPropertyIds,
              propertyId,
            ],
          };
        }),

      removeFromItineraryBuilder: (propertyId) =>
        set((state) => ({
          pendingItineraryPropertyIds:
            state.pendingItineraryPropertyIds.filter((id) => id !== propertyId),
        })),

      clearItineraryBuilder: () =>
        set({ pendingItineraryPropertyIds: [] }),

      saveItinerary: (itinerary) =>
        set((state) => ({ itineraries: [...state.itineraries, itinerary] })),
    }),
    {
      name: 'homeflow-schedule',
    },
  ),
);
