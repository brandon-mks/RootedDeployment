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
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  deleteMyEvent,
  getMyEvents,
  updateMyEvent,
} from "../services/events.js";

const emptyEditForm = {
  title: "",
  description: "",
  location: "",
  eventDate: "",
  startTime: "",
  endTime: "",
};

const statusLabels = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Needs changes",
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

function MyEventsPanel({
  onCreateEvent,
  submissionMessage = "",
}){
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");

  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    getMyEvents()
      .then((data) => {
        if (!isCurrent) {
          return;
        }

        setEvents(
          Array.isArray(data.events)
            ? data.events
            : [],
        );
      })
      .catch((error) => {
        if (!isCurrent) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load your events.",
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
  }, []);

  const handleOpenEdit = (event) => {
    setNotice("");
    setEditError("");
    setEditingEvent(event);

    setEditForm({
      title: event.title ?? "",
      description: event.description ?? "",
      location: event.address ?? "",
      eventDate: event.eventDate ?? "",
      startTime: event.startTime ?? "",
      endTime: event.endTime ?? "",
    });
  };

  const handleCloseEdit = () => {
    if (saving) {
      return;
    }

    setEditingEvent(null);
    setEditForm(emptyEditForm);
    setEditError("");
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setEditError("");
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editingEvent) {
      return;
    }

    setSaving(true);
    setEditError("");
    setNotice("");

    try {
      const data = await updateMyEvent(
        editingEvent.id,
        editForm,
      );

      setEvents((currentEvents) =>
        currentEvents.map((currentEvent) =>
          currentEvent.id === editingEvent.id
            ? data.event
            : currentEvent,
        ),
      );

      setNotice(
        data.message ??
          "Event updated and submitted for review.",
      );

      setEditingEvent(null);
      setEditForm(emptyEditForm);
    } catch (error) {
      setEditError(
        error instanceof Error
          ? error.message
          : "Unable to update this event.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRequestDelete = (event) => {
    setNotice("");
    setEventToDelete(event);
  };

  const handleCancelDelete = () => {
    if (!deleting) {
      setEventToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) {
      return;
    }

    setDeleting(true);
    setNotice("");

    try {
      const data = await deleteMyEvent(eventToDelete.id);

      setEvents((currentEvents) =>
        currentEvents.filter(
          (event) => event.id !== eventToDelete.id,
        ),
      );

      setNotice(
        data.message ?? "Event deleted.",
      );

      setEventToDelete(null);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to delete this event.",
      );
    } finally {
      setDeleting(false);
    }
  };

const visibleNotice = notice || submissionMessage;

  return (
    <>
      <Typography className="section-eyebrow">
        YOUR EVENT SUBMISSIONS
      </Typography>

      <Typography variant="h2" className="section-title">
        My Events
      </Typography>

      <Typography className="calendar-description">
        Review the events you’ve submitted, follow their approval
        status, or make changes.
      </Typography>

        {visibleNotice && (
        <Alert
          severity="info"
          className="event-alert"
          sx={{ marginTop: 2 }}
        >
          {visibleNotice}
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

          <Typography>Loading your events…</Typography>
        </Stack>
      ) : events.length === 0 ? (
        <Box
          className="empty-state"
          sx={{ marginTop: 3 }}
        >
          <Typography variant="h4">
            You haven’t submitted any events yet
          </Typography>

          <Typography>
            Create a local event and track its review status here.
          </Typography>

          {typeof onCreateEvent === "function" && (
            <Button
              type="button"
              variant="contained"
              className="rooted-button"
              onClick={onCreateEvent}
            >
              Create an Event
            </Button>
          )}
        </Box>
      ) : (
        <Box
          className="my-events-grid"
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
            },
            gap: 2,
            marginTop: 3,
          }}
        >
          {events.map((event) => {
            const status =
              event.moderationStatus ?? "pending";

            const eventTime = getEventTime(event);

            return (
              <Card
                key={event.id}
                className={`my-event-card my-event-card--${status}`}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Chip
                      label={statusLabels[status] ?? status}
                      className={`event-status-chip event-status-chip--${status}`}
                    />

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {formatEventDate(event.eventDate)}
                    </Typography>
                  </Stack>

                  <Typography
                    variant="h3"
                    sx={{
                      marginTop: 2,
                      color: "var(--rooted-plum)",
                      fontSize: "22px",
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
                    {eventTime && (
                      <Typography variant="body2">
                        <strong>Time:</strong> {eventTime}
                      </Typography>
                    )}

                    {event.address && (
                      <Typography variant="body2">
                        <strong>Location:</strong> {event.address}
                      </Typography>
                    )}
                  </Stack>

                  {status === "pending" && (
                    <Alert
                      severity="info"
                      sx={{ marginTop: 2 }}
                    >
                      This event is waiting for administrator review
                      and is not publicly visible yet.
                    </Alert>
                  )}

                  {status === "approved" && (
                    <Alert
                      severity="success"
                      sx={{ marginTop: 2 }}
                    >
                      This event is approved and visible in Connect.
                    </Alert>
                  )}

                  {status === "rejected" && (
                    <Alert
                      severity="warning"
                      sx={{ marginTop: 2 }}
                    >
                      <Typography
                        component="p"
                        sx={{ fontWeight: 700 }}
                      >
                        Changes are required before this event can
                        be published.
                      </Typography>

                      {event.moderationNote && (
                        <Typography
                          component="p"
                          variant="body2"
                          sx={{ marginTop: 0.5 }}
                        >
                          {event.moderationNote}
                        </Typography>
                      )}
                    </Alert>
                  )}

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    sx={{ marginTop: 2.5 }}
                  >
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => handleOpenEdit(event)}
                    >
                      Edit Event
                    </Button>

                    <Button
                      type="button"
                      color="error"
                      variant="outlined"
                      onClick={() =>
                        handleRequestDelete(event)
                      }
                    >
                      Delete Event
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <Dialog
        open={Boolean(editingEvent)}
        onClose={handleCloseEdit}
        fullWidth
        maxWidth="sm"
        aria-labelledby="edit-event-dialog-title"
      >
        <Box
          component="form"
          onSubmit={handleEditSubmit}
        >
          <DialogTitle id="edit-event-dialog-title">
            Edit Event
          </DialogTitle>

          <DialogContent dividers>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ marginBottom: 2 }}
            >
              Saving changes will return this event to pending
              review.
            </Typography>

            {editError && (
              <Alert
                severity="error"
                sx={{ marginBottom: 2 }}
              >
                {editError}
              </Alert>
            )}

            <Stack spacing={2}>
              <TextField
                label="Event name"
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                required
                fullWidth
              />

              <TextField
                label="Description"
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                multiline
                minRows={4}
                fullWidth
              />

              <TextField
                label="Location"
                name="location"
                value={editForm.location}
                onChange={handleEditChange}
                required
                fullWidth
              />

              <TextField
                label="Date"
                name="eventDate"
                type="date"
                value={editForm.eventDate}
                onChange={handleEditChange}
                required
                fullWidth
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
              >
                <TextField
                  label="Start time"
                  name="startTime"
                  type="time"
                  value={editForm.startTime}
                  onChange={handleEditChange}
                  fullWidth
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />

                <TextField
                  label="End time"
                  name="endTime"
                  type="time"
                  value={editForm.endTime}
                  onChange={handleEditChange}
                  fullWidth
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </Stack>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button
              type="button"
              onClick={handleCloseEdit}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save and Resubmit"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(eventToDelete)}
        onClose={handleCancelDelete}
        aria-labelledby="delete-event-dialog-title"
      >
        <DialogTitle id="delete-event-dialog-title">
          Delete this event?
        </DialogTitle>

        <DialogContent>
          <Typography>
            {eventToDelete
              ? `"${eventToDelete.title}" will be permanently deleted.`
              : "This event will be permanently deleted."}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            type="button"
            onClick={handleCancelDelete}
            disabled={deleting}
          >
            Keep Event
          </Button>

          <Button
            type="button"
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete Event"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MyEventsPanel;
