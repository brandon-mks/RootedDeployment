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

  let response;

  try {
    response = await fetch(`/api/places?${params.toString()}`);
  } catch {
    throw new Error(
        "Unable to connect to the Rooted API. Please confirm the backend URL and port are correct and that the backend is running."
    );
  }

  const responseBody = await response.text();
    let data = null;

    if (responseBody) {
      try {
        data = JSON.parse(responseBody);
      } catch {
        throw new Error(
          `The Rooted API returned an invalid response (${response.status}).`);
      }
    }


  if (!response.ok) {
    throw new Error(
        data?.error ?? `Unable to load places (${response.status}).`
    );
  }

  if (!data) {
    throw new Error(
        `The Rooted API returned an empty response (${response.status}).`
    );
  }

  return data;
}