/**
 * Request place records from the Rooted backend.
 *
 * The frontend only depends on the /api/places response.
 * The backend can later switch from dummy data to PostgreSQL or
 * Google Places without requiring components to change.
 */
export async function getPlaces({ category, limit = 12 } = {}) {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  params.set("limit", String(limit));

  const response = await fetch(`/api/places?${params.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Unable to load places");
  }

  return data;
}