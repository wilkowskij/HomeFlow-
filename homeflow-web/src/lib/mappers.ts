import type { Property, PropertyType, ListingStatus, NeighborhoodData } from '../types';
import type { PropertyRow, PropertyAiInsightRow, DbPropertyType } from '../types/database';

export const DB_TO_APP_PROPERTY_TYPE: Record<DbPropertyType, PropertyType> = {
  SINGLE_FAMILY: 'single-family',
  TOWNHOUSE: 'townhouse',
  CONDO: 'condo',
  MULTI_FAMILY: 'multi-family',
  LAND: 'land',
};

const DB_TO_APP_LISTING_STATUS: Record<string, ListingStatus> = {
  ACTIVE: 'active',
  PENDING: 'pending',
  UNDER_CONTRACT: 'under-contract',
  SOLD: 'sold',
  OFF_MARKET: 'off-market',
};

export function mapDbPropertyToApp(
  row: PropertyRow,
  insight?: PropertyAiInsightRow | null,
): Property {
  return {
    id: row.id,
    mlsId: row.mls_id ?? undefined,
    address: {
      street: row.address,
      city: row.city,
      state: row.state,
      zip: row.zip,
      lat: row.lat ?? 0,
      lng: row.lng ?? 0,
      formattedAddress: `${row.address}, ${row.city}, ${row.state} ${row.zip}`,
    },
    price: row.price,
    beds: row.bedrooms,
    baths: row.bathrooms,
    sqft: row.square_feet ?? 0,
    lotSqft: row.lot_size ?? undefined,
    yearBuilt: row.year_built ?? undefined,
    propertyType: DB_TO_APP_PROPERTY_TYPE[row.property_type],
    status: DB_TO_APP_LISTING_STATUS[row.listing_status] ?? 'active',
    daysOnMarket: row.days_on_market,
    photos: row.photos,
    virtualTourUrl: row.virtual_tour_url ?? undefined,
    description: row.description ?? '',
    features: [],
    neighborhood: (row.neighborhood_data as NeighborhoodData | null) ?? undefined,
    aiInsights: insight
      ? {
          matchScore: insight.match_score,
          pros: insight.pros,
          cons: insight.cons,
          summary: insight.summary,
          commuteMinutes: insight.commute_minutes ?? undefined,
          estimatedMonthlyCost: insight.estimated_monthly_cost ?? undefined,
        }
      : undefined,
    listedAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
