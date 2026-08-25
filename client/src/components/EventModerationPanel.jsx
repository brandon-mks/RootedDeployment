import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  getModerationEvents,
  reviewEvent,
} from "../services/events.js";

const statusLabels = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

function formatEventDate(value) {
  if (!value) {
    return "Date not provided";
  }

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
  }).format(date);
}

function getEventTime(event) {
  return [event.startTime, event.endTime]
    .filter(Boolean)
    .join(" – ");
}

function EventModerationPanel({ onPendingCountChange }) {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");

  const [reviewingEvent, setReviewingEvent] = useState(null);
  const [reviewDecision, setReviewDecision] = useState("");
  const [moderationNote, setModerationNote] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    getModerationEvents(statusFilter)
      .then((data) => {
        if (!isCurrent) {
          return;
        }

        const loadedEvents = Array.isArray(data.events)
          ? data.events
          : [];

        setEvents(loadedEvents);

        if (statusFilter === "pending") {
          onPendingCountChange?.(loadedEvents.length);
        }
      })
      .catch((error) => {
        if (!isCurrent) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load the moderation queue.",
        );
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [statusFilter, onPendingCountChange]);

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setLoading(true);
    setLoadError("");
    setNotice("");
  };

  const handleOpenReview = (event, decision) => {
    setReviewingEvent(event);
    setReviewDecision(decision);
    setModerationNote(
      decision === "rejected"
        ? event.moderationNote ?? ""
        : "",
    );
    setReviewError("");
    setNotice("");
  };

  const handleCloseReview = () => {
    if (savingReview) {
      return;
    }

    setReviewingEvent(null);
    setReviewDecision("");
    setModerationNote("");
    setReviewError("");
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!reviewingEvent || !reviewDecision) {
      return;
    }

    if (
      reviewDecision === "rejected" &&
      !moderationNote.trim()
    ) {
      setReviewError(
        "Explain what the event creator needs to change.",
      );
      return;
    }

    setSavingReview(true);
    setReviewError("");

    try {
       const data = await reviewEvent(
        reviewingEvent.id,
        reviewDecision,
        moderationNote.trim(),
      );

      if (reviewingEvent.moderationStatus === "pending") {
        onPendingCountChange?.((currentCount) =>
          Math.max(0, currentCount - 1),
        );
      }

      setEvents((currentEvents) => {
        if (
          statusFilter === "all" ||
          statusFilter === reviewDecision
        ) {
          return currentEvents.map((currentEvent) =>
            currentEvent.id === reviewingEvent.id
              ? data.event
              : currentEvent,
          );
        }

        return currentEvents.filter(
          (currentEvent) =>
            currentEvent.id !== reviewingEvent.id,
        );
      });

      setNotice(
        data.message ??
          (reviewDecision === "approved"
            ? "Event approved and published."
            : "Event rejected."),
      );

      setReviewingEvent(null);
      setReviewDecision("");
      setModerationNote("");
    } catch (error) {
      setReviewError(
        error instanceof Error
          ? error.message
          : "Unable to review this event.",
      );
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "flex-start" }}
      >
        <Box>
          <Typography className="section-eyebrow">
            ADMINISTRATOR REVIEW
          </Typography>

          <Typography
            variant="h2"
            className="section-title"
          >
            Event Review
          </Typography>

          <Typography className="calendar-description">
            Review community submissions before they become
            publicly visible.
          </Typography>
        </Box>

        <FormControl
          size="small"
          sx={{ minWidth: 190 }}
        >
          <InputLabel id="moderation-status-filter-label">
            Status
          </InputLabel>

          <Select
            labelId="moderation-status-filter-label"
            value={statusFilter}
            label="Status"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="pending">
              Pending review
            </MenuItem>

            <MenuItem value="approved">
              Approved
            </MenuItem>

            <MenuItem value="rejected">
              Rejected
            </MenuItem>

            <MenuItem value="all">
              All submissions
            </MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {notice && (
        <Alert
          severity="success"
          className="event-alert"
          sx={{ marginTop: 2 }}
        >
          {notice}
        </Alert>
      )}

      {loadError && (
        <Alert
          severity="error"
          className="event-alert"
          sx={{ marginTop: 2 }}
        >
          {loadError}
        </Alert>
      )}

      {loading ? (
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ marginTop: 4 }}
        >
          <CircularProgress size={24} />

          <Typography>
            Loading event submissions…
          </Typography>
        </Stack>
      ) : events.length === 0 ? (
        <Box
          className="empty-state"
          sx={{ marginTop: 3 }}
        >
          <Typography variant="h4">
            No {statusFilter === "all" ? "" : statusFilter} submissions
          </Typography>

          <Typography>
            {statusFilter === "pending"
              ? "The moderation queue is currently clear."
              : "No event submissions match this status."}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2} sx={{ marginTop: 3 }}>
          {events.map((event) => {
            const status =
              event.moderationStatus ?? "pending";

            const eventTime = getEventTime(event);

            return (
              <Card
                key={event.id}
                className={`moderation-event-card moderation-event-card--${status}`}
              >
                <CardContent>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={3}
                    justifyContent="space-between"
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Chip
                          label={
                            statusLabels[status] ?? status
                          }
                          className={`event-status-chip event-status-chip--${status}`}
                        />

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Submitted by{" "}
                          {event.creator?.username ??
                            "Unknown user"}
                          {event.creator?.email
                            ? ` · ${event.creator.email}`
                            : ""}
                        </Typography>
                      </Stack>

                      <Typography
                        variant="h3"
                        sx={{
                          marginTop: 2,
                          color: "var(--rooted-plum)",
                          fontSize: "23px",
                          fontWeight: 700,
                        }}
                      >
                        {event.title}
                      </Typography>

                      {event.description && (
                        <Typography sx={{ marginTop: 1 }}>
                          {event.description}
                        </Typography>
                      )}

                      <Stack spacing={0.5} sx={{ marginTop: 2 }}>
                        <Typography variant="body2">
                          <strong>Date:</strong>{" "}
                          {formatEventDate(event.eventDate)}
                        </Typography>

                        {eventTime && (
                          <Typography variant="body2">
                            <strong>Time:</strong> {eventTime}
                          </Typography>
                        )}

                        {event.address && (
                          <Typography variant="body2">
                            <strong>Location:</strong>{" "}
                            {event.address}
                          </Typography>
                        )}
                      </Stack>

                      {event.moderationNote && (
                        <Alert
                          severity={
                            status === "rejected"
                              ? "warning"
                              : "info"
                          }
                          sx={{ marginTop: 2 }}
                        >
                          {event.moderationNote}
                        </Alert>
                      )}
                    </Box>

                    <Stack
                      direction={{ xs: "row", md: "column" }}
                      spacing={1}
                      alignItems="stretch"
                      sx={{
                        minWidth: {
                          xs: "auto",
                          md: 150,
                        },
                      }}
                    >
                      <Button
                        type="button"
                        variant="contained"
                        color="success"
                        onClick={() =>
                          handleOpenReview(
                            event,
                            "approved",
                          )
                        }
                      >
                        Approve
                      </Button>

                      <Button
                        type="button"
                        variant="outlined"
                        color="error"
                        onClick={() =>
                          handleOpenReview(
                            event,
                            "rejected",
                          )
                        }
                      >
                        Reject
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      <Dialog
        open={Boolean(reviewingEvent)}
        onClose={handleCloseReview}
        fullWidth
        maxWidth="sm"
        aria-labelledby="event-review-dialog-title"
      >
        <Box
          component="form"
          onSubmit={handleSubmitReview}
        >
          <DialogTitle id="event-review-dialog-title">
            {reviewDecision === "approved"
              ? "Approve Event"
              : "Reject Event"}
          </DialogTitle>

          <DialogContent dividers>
            <Typography
              variant="h3"
              sx={{
                marginBottom: 1,
                color: "var(--rooted-plum)",
                fontSize: "21px",
                fontWeight: 700,
              }}
            >
              {reviewingEvent?.title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ marginBottom: 2 }}
            >
              {reviewDecision === "approved"
                ? "Approving this event will publish it in Connect."
                : "The event will remain private. Explain what the creator must change before resubmitting."}
            </Typography>

            {reviewError && (
              <Alert
                severity="error"
                sx={{ marginBottom: 2 }}
              >
                {reviewError}
              </Alert>
            )}

            <TextField
              label={
                reviewDecision === "rejected"
                  ? "Required explanation"
                  : "Optional note"
              }
              value={moderationNote}
              onChange={(event) => {
                setModerationNote(event.target.value);
                setReviewError("");
              }}
              required={reviewDecision === "rejected"}
              multiline
              minRows={4}
              fullWidth
              inputProps={{
                maxLength: 1000,
              }}
              helperText={`${moderationNote.length}/1000`}
            />
          </DialogContent>

          <DialogActions>
            <Button
              type="button"
              onClick={handleCloseReview}
              disabled={savingReview}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              color={
                reviewDecision === "approved"
                  ? "success"
                  : "error"
              }
              disabled={savingReview}
            >
              {savingReview
                ? "Saving…"
                : reviewDecision === "approved"
                  ? "Approve and Publish"
                  : "Reject Event"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}

export default EventModerationPanel;
