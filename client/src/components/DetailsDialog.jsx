import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";

import { MapCard } from "./MapCard.jsx";

function DetailsDialog({ place, places = [], onPlaceChange, onClose }) {
  // Temporary visual state until the favorites POST request is connected.
  const [favoriteItemIds, setFavoriteItemIds] = useState(() => new Set());

  const isOpen = Boolean(place);

  if (!place) {
    return null;
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

  const handlePrevious = () => {
    if (!canNavigate) {
      return;
    }

    const previousIndex = (currentIndex - 1 + places.length) % places.length;
    onPlaceChange(places[previousIndex]);
  };

  const handleNext = () => {
    if (!canNavigate) {
      return;
    }

    const nextIndex = (currentIndex + 1) % places.length;
    onPlaceChange(places[nextIndex]);
  };

  const handleFavorite = () => {
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

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
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
          aria-pressed={isFavorite}
          onClick={handleFavorite}
        >
          {isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
        </IconButton>

        <IconButton
          type="button"
          className="details-dialog-close"
          aria-label="Close details"
          onClick={onClose}
        >
          ×
        </IconButton>
      </DialogTitle>

      <DialogContent dividers className="details-dialog-content">
        <Box className="details-dialog-layout">
          <Stack spacing={3} className="details-dialog-information">
            {place.description && (
              <Box className="details-dialog-field">
                <Typography variant="subtitle2" component="h3">
                  About
                </Typography>

                <Typography variant="body1">
                  {place.description}
                </Typography>
              </Box>
            )}

            {eventDateLabel && (
              <Box className="details-dialog-field">
                <Typography variant="subtitle2" component="h3">
                  Date
                </Typography>

                <Typography variant="body1">
                  {eventDateLabel}
                </Typography>
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
          <Button type="button" onClick={onClose}>
            Close
          </Button>

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
  );
}

export default DetailsDialog;