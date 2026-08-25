const favoriteTypes = new Set(["business", "event"]);

function getFavoritePath(type, itemId) {
  if (!favoriteTypes.has(type)) {
    throw new Error("Invalid favorite type.");
  }

  if (!itemId) {
    throw new Error("A favorite item ID is required.");
  }

  return `/api/favorites/${type}/${encodeURIComponent(itemId)}`;
}

async function requestFavorites(path, options = {}) {
  let response;

  try {
    response = await fetch(path, {
      ...options,
      credentials: "include",
    });
  } catch {
    throw new Error("Unable to connect to the Rooted favorites service.");
  }

  const responseBody = await response.text();
  let data = {};

  if (responseBody) {
    try {
      data = JSON.parse(responseBody);
    } catch {
      throw new Error(
        `The favorites service returned an invalid response (${response.status}).`,
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data.error ??
        data.message ??
        `Unable to complete the favorites request (${response.status}).`,
    );
  }

  return data;
}

export function getFavorites() {
  return requestFavorites("/api/favorites");
}

export function addFavorite(type, itemId) {
  return requestFavorites(getFavoritePath(type, itemId), {
    method: "POST",
  });
}

export function removeFavorite(type, itemId) {
  return requestFavorites(getFavoritePath(type, itemId), {
    method: "DELETE",
  });
}