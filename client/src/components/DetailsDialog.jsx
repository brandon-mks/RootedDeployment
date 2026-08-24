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
import { useLocation, useNavigate } from "react-router";

import { useAuth } from "../context/AuthContext.jsx";
import {
  addEventToCalendar,
  getCalendarEvents,
} from "../services/events.js";
import { MapCard } from "./MapCard.jsx";

function DetailsDialog({ place, places = [], onPlaceChange, onClose }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [authPromptAction, setAuthPromptAction] = useState(null);

  // Temporary visual state until the favorites API is connected.
  const [favoriteItemIds, setFavoriteItemIds] = useState(() => new Set());

  const [calendarEventIds, setCalendarEventIds] = useState(() => new Set());
  const [calendarLoadedForUserId, setCalendarLoadedForUserId] = useState(null);
  const [calendarPendingId, setCalendarPendingId] = useState(null);

  const [calendarFeedback, setCalendarFeedback] = useState({
    eventId: null,
    message: "",
    isError: false,
  });

  const calendarUserId = user?.id ?? user?.username ?? null;

  useEffect(() => {
    if (!calendarUserId) {
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

        setCalendarEventIds(
          new Set(events.map((event) => event.id)),
        );

        setCalendarLoadedForUserId(calendarUserId);
      } catch {
        // Calendar status should not prevent the details dialog from opening.
      }
    }

    loadCalendarStatus();

    return () => {
      isCurrent = false;
    };
  }, [calendarUserId]);

  const isOpen = Boolean(place);

  if (!place) {
    return null;
  }

  const isEvent = Boolean(place.kind || place.eventDate);

  const isOnCalendar =
    Boolean(user) &&
    calendarLoadedForUserId === calendarUserId &&
    calendarEventIds.has(place.id);

  const isCalendarPending = calendarPendingId === place.id;

  const visibleCalendarFeedback =
    calendarFeedback.eventId === place.id ? calendarFeedback : null;

  let calendarButtonLabel = "Add to Calendar";

  if (isCalendarPending) {
    calendarButtonLabel = "Adding…";
  } else if (isOnCalendar) {
    calendarButtonLabel = "Added to Calendar";
  }

  // Businesses use name/category while events use title/kind.
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

  /*
   * Normalize either supported coordinate shape for MapCard:
   * { lat, lng } or { latitude, longitude }.
   */
  const latitude = place.location?.lat ?? place.location?.latitude;
  const longitude = place.location?.lng ?? place.location?.longitude;

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
  const isFavorite = favoriteItemIds.has(place.id);

  const clearCalendarFeedback = () => {
    setCalendarFeedback({
      eventId: null,
      message: "",
      isError: false,
    });
  };

  const handleClose = () => {
    setAuthPromptAction(null);
    clearCalendarFeedback();
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
    clearCalendarFeedback();

    const previousIndex = (currentIndex - 1 + places.length) % places.length;
    onPlaceChange(places[previousIndex]);
  };

  const handleNext = () => {
    if (!canNavigate) {
      return;
    }

    setAuthPromptAction(null);
    clearCalendarFeedback();

    const nextIndex = (currentIndex + 1) % places.length;
    onPlaceChange(places[nextIndex]);
  };

  const handleFavorite = () => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setAuthPromptAction("favorite");
      return;
    }

    setAuthPromptAction(null);

    setFavoriteItemIds((currentFavorites) => {
      const nextFavorites = new Set(currentFavorites);

      if (nextFavorites.has(place.id)) {
        nextFavorites.delete(place.id);
      } else {
        nextFavorites.add(place.id);
      }

      return nextFavorites;
    });
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

      setCalendarLoadedForUserId(calendarUserId);

      setCalendarFeedback({
        eventId: place.id,
        message: result.message ?? "Event added to your calendar.",
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
        <DialogTitle id="details-dialog-title" className="details-dialog-title">
          <Box className="details-dialog-title-copy">
            <Typography component="p" className="details-dialog-category">
              {categoryLabel}
            </Typography>

            <Typography component="h2" className="details-dialog-name">
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
            disabled={authLoading}
            aria-pressed={isFavorite}
            onClick={handleFavorite}
          >
            {isFavorite ? (
              <FavoriteRoundedIcon />
            ) : (
              <FavoriteBorderRoundedIcon />
            )}
          </IconButton>

          <IconButton
            type="button"
            className="details-dialog-close"
            aria-label="Close details"
            onClick={handleClose}
          >
            ×
          </IconButton>
        </DialogTitle>

        <DialogContent dividers className="details-dialog-content">
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
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {authPromptAction === "favorite"
                  ? "Save this to your favorites"
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
            <Stack spacing={3} className="details-dialog-information">
              {place.description && (
                <Box className="details-dialog-field">
                  <Typography variant="subtitle2" component="h3">
                    About
                  </Typography>

                  <Typography variant="body1">{place.description}</Typography>
                </Box>
              )}

              {eventDateLabel && (
                <Box className="details-dialog-field">
                  <Typography variant="subtitle2" component="h3">
                    Date
                  </Typography>

                  <Typography variant="body1">{eventDateLabel}</Typography>
                </Box>
              )}

              {eventTimeLabel && (
                <Box className="details-dialog-field">
                  <Typography variant="subtitle2" component="h3">
                    Time
                  </Typography>

                  <Typography variant="body1">
                    {eventTimeLabel}
                    {place.timeZone ? ` · ${place.timeZone}` : ""}
                  </Typography>
                </Box>
              )}

              {place.venue && (
                <Box className="details-dialog-field">
                  <Typography variant="subtitle2" component="h3">
                    Venue
                  </Typography>

                  <Typography variant="body1">{place.venue}</Typography>
                </Box>
              )}

              {place.address && (
                <Box className="details-dialog-field">
                  <Typography variant="subtitle2" component="h3">
                    Address
                  </Typography>

                  <Typography variant="body1">{place.address}</Typography>
                </Box>
              )}

              {place.rating != null && (
                <Box className="details-dialog-field">
                  <Typography variant="subtitle2" component="h3">
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
                disabled={authLoading || isCalendarPending || isOnCalendar}
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
          visibleCalendarFeedback && !visibleCalendarFeedback.isError ? (
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