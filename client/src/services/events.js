import { opportunities } from "../data/connectOpportunities.js";

/**
 * Return Connect listings from the temporary client fixture.
 *
 * Replace this implementation with a request to /api/events when the
 * backend event response includes categories and map coordinates.
 */
export async function getEvents() {
  return {
    events: opportunities,
  };
}