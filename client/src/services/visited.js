const API_URL = "/api/visited";

export async function getVisited() {
  const response = await fetch(API_URL, {
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to load visited items.");
  }

  return data;
}

export async function toggleVisited(itemId, itemType) {
  const response = await fetch(API_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      itemId,
      itemType,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to update visited status.");
  }

  return data;
}
