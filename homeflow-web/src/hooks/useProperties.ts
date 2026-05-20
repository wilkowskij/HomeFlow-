import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { mapDbPropertyToApp } from '@/lib/mappers';
import type { Property, SearchFilters } from '@/types';
import type { PropertyRow, PropertyAiInsightRow } from '@/types/database';

export function useProperties(filters: SearchFilters, userId?: string) {
  return useQuery<Property[]>({
    queryKey: ['properties', filters, userId],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.priceMin) query = query.gte('price', filters.priceMin);
      if (filters.priceMax) query = query.lte('price', filters.priceMax);
      if (filters.bedsMin)  query = query.gte('bedrooms', filters.bedsMin);
      if (filters.bathsMin) query = query.gte('bathrooms', filters.bathsMin);
      if (filters.sqftMin)  query = query.gte('square_feet', filters.sqftMin);
      if (filters.yearBuiltMin) query = query.gte('year_built', filters.yearBuiltMin);
      if (filters.query) {
        query = query.or(
          `address.ilike.%${filters.query}%,city.ilike.%${filters.query}%`,
        );
      }
      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        const dbTypes = filters.propertyTypes.map((t) =>
          t.toUpperCase().replace('-', '_'),
        );
        query = query.in('property_type', dbTypes);
      }

      const { data: rawRows, error } = await query.limit(filters.pageSize ?? 40);
      if (error) throw error;
      const rows = (rawRows ?? []) as PropertyRow[];

      // Fetch per-user AI insights if authenticated
      let insightMap: Record<string, PropertyAiInsightRow> = {};
      if (userId && rows.length > 0) {
        const ids = rows.map((r) => r.id);
        const { data: rawInsights } = await supabase
          .from('property_ai_insights')
          .select('*')
          .eq('user_id', userId)
          .in('property_id', ids);
        const insights = (rawInsights ?? []) as PropertyAiInsightRow[];
        insightMap = Object.fromEntries(insights.map((i) => [i.property_id, i]));
      }

      return rows.map((row) =>
        mapDbPropertyToApp(row, insightMap[row.id] ?? null),
      );
    },
  });
}

export function useProperty(id: string, userId?: string) {
  return useQuery<Property | null>({
    queryKey: ['property', id, userId],
    queryFn: async () => {
      const { data: rawRow, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !rawRow) return null;
      const row = rawRow as PropertyRow;

      let insight: PropertyAiInsightRow | null = null;
      if (userId) {
        const { data } = await supabase
          .from('property_ai_insights')
          .select('*')
          .eq('property_id', id)
          .eq('user_id', userId)
          .maybeSingle();
        insight = (data as PropertyAiInsightRow | null);
      }
      return mapDbPropertyToApp(row, insight);
    },
    enabled: !!id,
  });
}
