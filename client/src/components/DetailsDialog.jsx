import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

function DetailsDialog({ place, onClose }) {
  // Boolean(place) is false when no place is selected and true when one is.
  const isOpen = Boolean(place);

  if (!place) {
    return null;
  }

  // Convert values such as "live_music_venue" into "Live music venue".
  const categoryLabel = place.category
    ? place.category.replaceAll("_", " ")
    : "Place";

  const latitude = place.location?.latitude;
  const longitude = place.location?.longitude;

  // Use coordinates when available; otherwise Google Maps can search by address.
  const directionsQuery =
    latitude != null && longitude != null
      ? `${latitude},${longitude}`
      : place.address;

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    directionsQuery,
  )}`;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="details-dialog-title"
    >
      <DialogTitle id="details-dialog-title">
        {place.name}

        <IconButton
          aria-label="Close place details"
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 10 }}
        >
          ×
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography
            variant="overline"
            sx={{ color: "var(--rooted-green)", fontWeight: 700 }}
          >
            {categoryLabel}
          </Typography>

          {place.address && (
            <div>
              <Typography variant="subtitle2" component="h2">
                Address
              </Typography>

              <Typography variant="body1">{place.address}</Typography>
            </div>
          )}

          {place.rating != null && (
            <div>
              <Typography variant="subtitle2" component="h2">
                Rating
              </Typography>

              <Typography variant="body1">
                {place.rating} out of 5
              </Typography>
            </div>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button type="button" onClick={onClose}>
          Close
        </Button>

        <Button
          component="a"
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          variant="outlined"
        >
          Directions
        </Button>

        {place.website && (
          <Button
            component="a"
            href={place.website}
            target="_blank"
            rel="noreferrer"
            variant="contained"
            sx={{
              backgroundColor: "var(--rooted-green)",
              "&:hover": {
                backgroundColor: "var(--rooted-dark-green)",
              },
            }}
          >
            Visit website
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default DetailsDialog;