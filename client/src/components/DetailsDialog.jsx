import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useLocation, useNavigate } from "react-router";

import { useAuth } from "../context/AuthContext.jsx";
import {
  addEventToCalendar,
  getCalendarEvents,
} from "../services/events.js";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../services/favorites.js";
import { getVisited, toggleVisited } from "../services/visited.js";
import { MapCard } from "./MapCard.jsx";

function DetailsDialog({ place, places = [], onPlaceChange, onClose }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [authPromptAction, setAuthPromptAction] = useState(null);

  const [favoriteItemIds, setFavoriteItemIds] = useState(
    () => new Set(),
  );
  const [favoritesLoadedForUserId, setFavoritesLoadedForUserId] =
    useState(null);
  const [favoritePendingId, setFavoritePendingId] = useState(null);
  const [favoriteFeedback, setFavoriteFeedback] = useState({
    itemKey: null,
    message: "",
    isError: false,
  });

  const [visitedBusinessIds, setVisitedBusinessIds] = useState(
    () => new Set(),
  );
  const [visitedLoadedForUserId, setVisitedLoadedForUserId] =
    useState(null);
  const [visitedPendingId, setVisitedPendingId] = useState(null);
  const [visitedFeedback, setVisitedFeedback] = useState({
    itemId: null,
    message: "",
    isError: false,
  });

  const [calendarEventIds, setCalendarEventIds] = useState(
    () => new Set(),
  );
  const [calendarLoadedForUserId, setCalendarLoadedForUserId] =
    useState(null);
  const [calendarPendingId, setCalendarPendingId] = useState(null);
  const [calendarFeedback, setCalendarFeedback] = useState({
    eventId: null,
    message: "",
    isError: false,
  });

  const currentUserId = user?.id ?? user?.username ?? null;

  useEffect(() => {
    if (!currentUserId) {
      return undefined;
    }

    let isCurrent = true;

    async function loadCalendarStatus() {
      try {
        const data = await getCalendarEvents();
        const events = Array.isArray(data.events) ? data.events : [];

        if (!isCurrent) {
          return;
        }

        setCalendarEventIds(new Set(events.map((event) => event.id)));
        setCalendarLoadedForUserId(currentUserId);
      } catch {
        // Calendar status should not prevent the dialog from opening.
      }
    }

    loadCalendarStatus();

    return () => {
      isCurrent = false;
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) {
      return undefined;
    }

    let isCurrent = true;

    async function loadFavoriteStatus() {
      try {
        const data = await getFavorites();

        if (!isCurrent) {
          return;
        }

        const businesses = Array.isArray(data.businesses)
          ? data.businesses
          : [];

        const events = Array.isArray(data.events) ? data.events : [];

        const businessKeys = businesses.map(
          (business) =>
            `business:${business.business_id ?? business.id}`,
        );

        const eventKeys = events.map(
          (event) => `event:${event.id}`,
        );

        setFavoriteItemIds(
          new Set([...businessKeys, ...eventKeys]),
        );
        setFavoritesLoadedForUserId(currentUserId);
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setFavoriteFeedback({
          itemKey: null,
          message:
            error instanceof Error
              ? error.message
              : "Unable to load your favorites.",
          isError: true,
        });
      }
    }

    loadFavoriteStatus();

    return () => {
      isCurrent = false;
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) {
      return undefined;
    }

    let isCurrent = true;

    async function loadVisitedStatus() {
      try {
        const data = await getVisited();

        if (!isCurrent) {
          return;
        }

        setVisitedBusinessIds(
          new Set(
            Array.isArray(data.businesses) ? data.businesses : [],
          ),
        );
        setVisitedLoadedForUserId(currentUserId);
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setVisitedFeedback({
          itemId: null,
          message:
            error instanceof Error
              ? error.message
              : "Unable to load visited businesses.",
          isError: true,
        });
      }
    }

    loadVisitedStatus();

    return () => {
      isCurrent = false;
    };
  }, [currentUserId]);

  const isOpen = Boolean(place);

  if (!place) {
    return null;
  }

  const isEvent = Boolean(place.kind || place.eventDate);

  const favoriteType = isEvent ? "event" : "business";
  const favoriteIdentifier = isEvent
    ? place.id
    : place.business_id ?? place.id;
  const favoriteKey = `${favoriteType}:${favoriteIdentifier}`;

  const isFavorite =
    Boolean(user) &&
    favoritesLoadedForUserId === currentUserId &&
    favoriteItemIds.has(favoriteKey);

  const isFavoritePending = favoritePendingId === favoriteKey;

  const visibleFavoriteFeedback =
    favoriteFeedback.itemKey === null ||
    favoriteFeedback.itemKey === favoriteKey
      ? favoriteFeedback
      : null;

  const isVisited =
    Boolean(user) &&
    !isEvent &&
    visitedLoadedForUserId === currentUserId &&
    visitedBusinessIds.has(place.id);

  const isVisitedPending = visitedPendingId === place.id;

  const visibleVisitedFeedback =
    visitedFeedback.itemId === null ||
    visitedFeedback.itemId === place.id
      ? visitedFeedback
      : null;

  const isOnCalendar =
    Boolean(user) &&
    calendarLoadedForUserId === currentUserId &&
    calendarEventIds.has(place.id);

  const isCalendarPending = calendarPendingId === place.id;

  const visibleCalendarFeedback =
    calendarFeedback.eventId === place.id
      ? calendarFeedback
      : null;

  let calendarButtonLabel = "Add to Calendar";

  if (isCalendarPending) {
    calendarButtonLabel = "Adding…";
  } else if (isOnCalendar) {
    calendarButtonLabel = "Added to Calendar";
  }

  const itemName = place.name ?? place.title ?? "Details";
  const categoryValue = place.category ?? place.kind;

  const categoryLabel = categoryValue
    ? categoryValue.replaceAll("_", " ")
    : "Details";

  const eventDate = place.eventDate
    ? new Date(`${place.eventDate}T12:00:00`)
    : null;

  const eventDateLabel =
    eventDate && !Number.isNaN(eventDate.getTime())
      ? new Intl.DateTimeFormat(undefined, {
          dateStyle: "long",
        }).format(eventDate)
      : null;

  const eventTimeLabel = [place.startTime, place.endTime]
    .filter(Boolean)
    .join(" – ");

  const latitude =
    place.location?.lat ?? place.location?.latitude;
  const longitude =
    place.location?.lng ?? place.location?.longitude;

  const hasCoordinates =
    latitude != null &&
    longitude != null &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude));

  const mapPlace = hasCoordinates
    ? {
        ...place,
        location: {
          lat: Number(latitude),
          lng: Number(longitude),
        },
      }
    : null;

  const directionsQuery = hasCoordinates
    ? `${Number(latitude)},${Number(longitude)}`
    : place.address?.trim();

  const directionsUrl = directionsQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        directionsQuery,
      )}`
    : null;

  const currentIndex = places.findIndex(
    (candidate) => candidate.id === place.id,
  );

  const canNavigate =
    places.length > 1 &&
    currentIndex >= 0 &&
    typeof onPlaceChange === "function";

  const currentPosition = currentIndex >= 0 ? currentIndex + 1 : 1;
  const carouselTotal = Math.max(places.length, 1);

  const clearFavoriteFeedback = () => {
    setFavoriteFeedback({
      itemKey: null,
      message: "",
      isError: false,
    });
  };

  const clearVisitedFeedback = () => {
    setVisitedFeedback({
      itemId: null,
      message: "",
      isError: false,
    });
  };

  const clearCalendarFeedback = () => {
    setCalendarFeedback({
      eventId: null,
      message: "",
      isError: false,
    });
  };

  const clearDialogFeedback = () => {
    clearFavoriteFeedback();
    clearVisitedFeedback();
    clearCalendarFeedback();
  };

  const handleClose = () => {
    setAuthPromptAction(null);
    clearDialogFeedback();
    onClose();
  };

  const handleAuthNavigation = (destination) => {
    const intendedAction = authPromptAction;

    setAuthPromptAction(null);
    onClose();

    navigate(destination, {
      state: {
        from: location.pathname,
        intendedAction,
        itemId: place.id,
      },
    });
  };

  const handlePrevious = () => {
    if (!canNavigate) {
      return;
    }

    setAuthPromptAction(null);
    clearDialogFeedback();

    const previousIndex =
      (currentIndex - 1 + places.length) % places.length;

    onPlaceChange(places[previousIndex]);
  };

  const handleNext = () => {
    if (!canNavigate) {
      return;
    }

    setAuthPromptAction(null);
    clearDialogFeedback();

    const nextIndex = (currentIndex + 1) % places.length;

    onPlaceChange(places[nextIndex]);
  };

  const handleFavorite = async () => {
    if (authLoading || isFavoritePending) {
      return;
    }

    if (!user) {
      setAuthPromptAction("favorite");
      return;
    }

    setAuthPromptAction(null);
    setFavoritePendingId(favoriteKey);
    setFavoriteFeedback({
      itemKey: favoriteKey,
      message: "",
      isError: false,
    });

    try {
      const result = isFavorite
        ? await removeFavorite(favoriteType, favoriteIdentifier)
        : await addFavorite(favoriteType, favoriteIdentifier);

      setFavoriteItemIds((currentFavorites) => {
        const nextFavorites = new Set(currentFavorites);

        if (isFavorite) {
          nextFavorites.delete(favoriteKey);
        } else {
          nextFavorites.add(favoriteKey);
        }

        return nextFavorites;
      });

      setFavoritesLoadedForUserId(currentUserId);

      setFavoriteFeedback({
        itemKey: favoriteKey,
        message:
          result.message ??
          (isFavorite
            ? "Removed from your favorites."
            : "Added to your favorites."),
        isError: false,
      });
    } catch (error) {
      setFavoriteFeedback({
        itemKey: favoriteKey,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update your favorites.",
        isError: true,
      });
    } finally {
      setFavoritePendingId(null);
    }
  };

  const handleVisited = async () => {
    if (authLoading || isVisitedPending || isEvent) {
      return;
    }

    if (!user) {
      setAuthPromptAction("visited");
      return;
    }

    setAuthPromptAction(null);
    setVisitedPendingId(place.id);
    setVisitedFeedback({
      itemId: place.id,
      message: "",
      isError: false,
    });

    try {
      const result = await toggleVisited(place.id, "business");

      setVisitedBusinessIds((currentIds) => {
        const nextIds = new Set(currentIds);

        if (result.visited) {
          nextIds.add(place.id);
        } else {
          nextIds.delete(place.id);
        }

        return nextIds;
      });

      setVisitedLoadedForUserId(currentUserId);
      setVisitedFeedback({
        itemId: place.id,
        message:
          result.message ??
          (result.visited
            ? "Marked as visited."
            : "Removed from visited."),
        isError: false,
      });
    } catch (error) {
      setVisitedFeedback({
        itemId: place.id,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update visited status.",
        isError: true,
      });
    } finally {
      setVisitedPendingId(null);
    }
  };

  const handleAddToCalendar = async () => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setAuthPromptAction("calendar");
      return;
    }

    setAuthPromptAction(null);
    setCalendarPendingId(place.id);
    setCalendarFeedback({
      eventId: place.id,
      message: "",
      isError: false,
    });

    try {
      const result = await addEventToCalendar(place.id);

      setCalendarEventIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.add(place.id);
        return nextIds;
      });

      setCalendarLoadedForUserId(currentUserId);
      setCalendarFeedback({
        eventId: place.id,
        message:
          result.message ?? "Event added to your calendar.",
        isError: false,
      });
    } catch (error) {
      setCalendarFeedback({
        eventId: place.id,
        message:
          error instanceof Error
            ? error.message
            : "Unable to add this event to your calendar.",
        isError: true,
      });
    } finally {
      setCalendarPendingId(null);
    }
  };

  const handleCalendarFeedbackClose = (_event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    clearCalendarFeedback();
  };

  const handleViewCalendar = () => {
    clearCalendarFeedback();
    onClose();
    navigate("/user?tab=calendar");
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        aria-labelledby="details-dialog-title"
        slotProps={{
          backdrop: {
            className: "details-dialog-backdrop",
          },
          paper: {
            className: "details-dialog-paper",
          },
        }}
      >
        <DialogTitle
          id="details-dialog-title"
          className="details-dialog-title"
        >
          <Box className="details-dialog-title-copy">
            <Typography
              component="p"
              className="details-dialog-category"
            >
              {categoryLabel}
            </Typography>

            <Typography
              component="h2"
              className="details-dialog-name"
            >
              {itemName}
            </Typography>
          </Box>

          <IconButton
            type="button"
            className="details-dialog-favorite"
            aria-label={
              isFavorite
                ? `Remove ${itemName} from favorites`
                : `Add ${itemName} to favorites`
            }
            disabled={authLoading || isFavoritePending}
            aria-pressed={isFavorite}
            onClick={handleFavorite}
          >
            {isFavorite ? (
              <FavoriteRoundedIcon />
            ) : (
              <FavoriteBorderRoundedIcon />
            )}
          </IconButton>

          {!isEvent && (
            <IconButton
              type="button"
              className="details-dialog-visited"
              aria-label={
                isVisited
                  ? `Remove ${itemName} from visited`
                  : `Mark ${itemName} as visited`
              }
              disabled={authLoading || isVisitedPending}
              aria-pressed={isVisited}
              onClick={handleVisited}
            >
              <CheckCircleRoundedIcon />
            </IconButton>
          )}

          <IconButton
            type="button"
            className="details-dialog-close"
            aria-label="Close details"
            onClick={handleClose}
          >
            ×
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          className="details-dialog-content"
        >
          {visibleFavoriteFeedback?.message && (
            <Box
              role={
                visibleFavoriteFeedback.isError
                  ? "alert"
                  : "status"
              }
              aria-live="polite"
              sx={{
                marginBottom: 2,
                padding: 1.5,
                color: visibleFavoriteFeedback.isError
                  ? "#6f3028"
                  : "var(--rooted-dark-green)",
                backgroundColor: visibleFavoriteFeedback.isError
                  ? "#f7e7e3"
                  : "#e7efe2",
                border: "1px solid",
                borderColor: visibleFavoriteFeedback.isError
                  ? "#c97868"
                  : "var(--rooted-green)",
                borderRadius: 2,
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>
                {visibleFavoriteFeedback.message}
              </Typography>
            </Box>
          )}

          {visibleVisitedFeedback?.message && (
            <Box
              role={
                visibleVisitedFeedback.isError
                  ? "alert"
                  : "status"
              }
              aria-live="polite"
              sx={{
                marginBottom: 2,
                padding: 1.5,
                color: visibleVisitedFeedback.isError
                  ? "#6f3028"
                  : "var(--rooted-dark-green)",
                backgroundColor: visibleVisitedFeedback.isError
                  ? "#f7e7e3"
                  : "#e7efe2",
                border: "1px solid",
                borderColor: visibleVisitedFeedback.isError
                  ? "#c97868"
                  : "var(--rooted-green)",
                borderRadius: 2,
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>
                {visibleVisitedFeedback.message}
              </Typography>
            </Box>
          )}

          {authPromptAction && !user && (
            <Box
              role="status"
              aria-live="polite"
              sx={{
                marginBottom: 3,
                padding: 2,
                backgroundColor: "rgba(122, 166, 100, 0.12)",
                border: "1px solid var(--rooted-green)",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700 }}
              >
                {authPromptAction === "favorite"
                  ? "Save this to your favorites"
                  : authPromptAction === "visited"
                    ? "Mark this as visited"
                    : "Add this event to your calendar"}
              </Typography>

              <Typography variant="body2" sx={{ marginTop: 0.5 }}>
                Log in or create an account to continue.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ marginTop: 2 }}
              >
                <Button
                  type="button"
                  onClick={() => setAuthPromptAction(null)}
                >
                  Not now
                </Button>

                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => handleAuthNavigation("/login")}
                >
                  Log in
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  onClick={() => handleAuthNavigation("/register")}
                >
                  Create account
                </Button>
              </Stack>
            </Box>
          )}

          <Box className="details-dialog-layout">
            <Stack
              spacing={3}
              className="details-dialog-information"
            >
              {place.description && (
                <Box className="details-dialog-field">
                  <Typography
                    variant="subtitle2"
                    component="h3"
                  >
                    About
                  </Typography>

                  <Typography variant="body1">
                    {place.description}
                  </Typography>
                </Box>
              )}

              {eventDateLabel && (
                <Box className="details-dialog-field">
                  <Typography
                    variant="subtitle2"
                    component="h3"
                  >
                    Date
                  </Typography>

                  <Typography variant="body1">
                    {eventDateLabel}
                  </Typography>
                </Box>
              )}

              {eventTimeLabel && (
                <Box className="details-dialog-field">
                  <Typography
                    variant="subtitle2"
                    component="h3"
                  >
                    Time
                  </Typography>

                  <Typography variant="body1">
                    {eventTimeLabel}
                    {place.timeZone
                      ? ` · ${place.timeZone}`
                      : ""}
                  </Typography>
                </Box>
              )}

              {place.venue && (
                <Box className="details-dialog-field">
                  <Typography
                    variant="subtitle2"
                    component="h3"
                  >
                    Venue
                  </Typography>

                  <Typography variant="body1">
                    {place.venue}
                  </Typography>
                </Box>
              )}

              {place.address && (
                <Box className="details-dialog-field">
                  <Typography
                    variant="subtitle2"
                    component="h3"
                  >
                    Address
                  </Typography>

                  <Typography variant="body1">
                    {place.address}
                  </Typography>
                </Box>
              )}

              {place.rating != null && (
                <Box className="details-dialog-field">
                  <Typography
                    variant="subtitle2"
                    component="h3"
                  >
                    Rating
                  </Typography>

                  <Typography variant="body1">
                    {place.rating} out of 5
                  </Typography>
                </Box>
              )}
            </Stack>

            <Box
              className="details-dialog-map-panel"
              aria-label={`Map showing ${itemName}`}
            >
              {mapPlace ? (
                <MapCard place={mapPlace} />
              ) : (
                <Box className="details-dialog-map-fallback">
                  <Typography>Map unavailable</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions className="details-dialog-actions">
          <Box
            className="details-dialog-carousel"
            aria-label="Browse listings in this category"
          >
            <IconButton
              type="button"
              aria-label="View previous listing"
              onClick={handlePrevious}
              disabled={!canNavigate}
            >
              <ChevronLeftRoundedIcon />
            </IconButton>

            <Typography component="span">
              {currentPosition} of {carouselTotal}
            </Typography>

            <IconButton
              type="button"
              aria-label="View next listing"
              onClick={handleNext}
              disabled={!canNavigate}
            >
              <ChevronRightRoundedIcon />
            </IconButton>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            className="details-dialog-action-buttons"
          >
            <Button type="button" onClick={handleClose}>
              Close
            </Button>

            {isEvent && (
              <Button
                type="button"
                variant="contained"
                startIcon={<EventAvailableRoundedIcon />}
                onClick={handleAddToCalendar}
                disabled={
                  authLoading ||
                  isCalendarPending ||
                  isOnCalendar
                }
                aria-pressed={isOnCalendar}
              >
                {calendarButtonLabel}
              </Button>
            )}

            {directionsUrl && (
              <Button
                component="a"
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                variant="outlined"
              >
                Directions
              </Button>
            )}

            {place.website && (
              <Button
                component="a"
                href={place.website}
                target="_blank"
                rel="noreferrer"
                variant="contained"
              >
                Visit website
              </Button>
            )}
          </Stack>
        </DialogActions>
      </Dialog>

      <Snackbar
        key={`${visibleCalendarFeedback?.eventId ?? "event"}-${
          visibleCalendarFeedback?.message ?? ""
        }`}
        open={Boolean(visibleCalendarFeedback?.message)}
        message={visibleCalendarFeedback?.message ?? ""}
        autoHideDuration={6000}
        onClose={handleCalendarFeedbackClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        action={
          visibleCalendarFeedback &&
          !visibleCalendarFeedback.isError ? (
            <Button
              type="button"
              size="small"
              onClick={handleViewCalendar}
              sx={{
                color: "#ffffff",
                fontWeight: 800,
                backgroundColor: "var(--rooted-plum)",
                borderRadius: "6px",
                paddingInline: 2,
                "&:hover": {
                  backgroundColor: "var(--rooted-dark-green)",
                },
              }}
            >
              View Calendar
            </Button>
          ) : null
        }
        sx={{
          bottom: { xs: 20, sm: 28 },

          "& .MuiSnackbarContent-root": {
            minWidth: {
              xs: "calc(100vw - 32px)",
              sm: "470px",
            },
            padding: "10px 14px",
            color: visibleCalendarFeedback?.isError
              ? "var(--rooted-plum)"
              : "var(--rooted-dark-green)",
            backgroundColor: visibleCalendarFeedback?.isError
              ? "#f7e7e3"
              : "#e7efe2",
            border: "1px solid",
            borderColor: visibleCalendarFeedback?.isError
              ? "#c97868"
              : "var(--rooted-green)",
            borderLeft: "6px solid",
            borderLeftColor: visibleCalendarFeedback?.isError
              ? "#c97868"
              : "var(--rooted-green)",
            borderRadius: "10px",
            boxShadow: "0 6px 18px rgba(25, 20, 32, 0.25)",
          },

          "& .MuiSnackbarContent-message": {
            fontSize: "15px",
            fontWeight: 700,
          },
        }}
      />
    </>
  );
}

export default DetailsDialog;