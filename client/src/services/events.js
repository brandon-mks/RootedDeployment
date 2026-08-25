async function requestEvents(path, options = {}) {
  let response;

  try {
    response = await fetch(path, {
      ...options,
      credentials: "include",
    });
  } catch {
    throw new Error(
      "Unable to connect to the Rooted events service.",
    );
  }

  const responseBody = await response.text();
  let data = null;

  if (responseBody) {
    try {
      data = JSON.parse(responseBody);
    } catch {
      throw new Error(
        `The Rooted events service returned an invalid response (${response.status}).`,
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.error ??
        `Unable to complete the event request (${response.status}).`,
    );
  }

  return data ?? {};
}

function jsonRequest(method, body) {
  return {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

export function getEvents() {
  return requestEvents("/api/events");
}

export function getCalendarEvents() {
  return requestEvents("/api/events/calendar");
}

export function getMyEvents() {
  return requestEvents("/api/events/mine");
}

export function createEvent(eventInput) {
  return requestEvents(
    "/api/events",
    jsonRequest("POST", eventInput),
  );
}

export function updateMyEvent(eventId, eventInput) {
  return requestEvents(
    `/api/events/${encodeURIComponent(eventId)}`,
    jsonRequest("PATCH", eventInput),
  );
}

export function deleteMyEvent(eventId) {
  return requestEvents(
    `/api/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
    },
  );
}

export function getModerationEvents(status = "pending") {
  const searchParams = new URLSearchParams({
    status,
  });

  return requestEvents(
    `/api/events/moderation?${searchParams.toString()}`,
  );
}

export function reviewEvent(
  eventId,
  status,
  moderationNote = "",
) {
  return requestEvents(
    `/api/events/${encodeURIComponent(eventId)}/moderation`,
    jsonRequest("PATCH", {
      status,
      moderationNote,
    }),
  );
}

export function addEventToCalendar(eventId) {
  return requestEvents(
    `/api/events/${encodeURIComponent(eventId)}/attendance`,
    {
      method: "POST",
    },
  );
}

export function removeEventFromCalendar(eventId) {
  return requestEvents(
    `/api/events/${encodeURIComponent(eventId)}/attendance`,
    {
      method: "DELETE",
    },
  );
}
