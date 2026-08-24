import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  addEventToCalendar,
  getCalendarEvents,
  removeEventFromCalendar,
} from "../services/events.js";

const dashboardTabs = ["favorites", "calendar", "create-event"];

function getInitialTab(tabName) {
  const tabIndex = dashboardTabs.indexOf(tabName);
  return tabIndex >= 0 ? tabIndex : 0;
}

function sortCalendarEvents(events) {
  return [...events].sort((firstEvent, secondEvent) => {
    const firstValue = `${firstEvent.eventDate ?? ""}T${
      firstEvent.startTime ?? ""
    }`;

    const secondValue = `${secondEvent.eventDate ?? ""}T${
      secondEvent.startTime ?? ""
    }`;

    return firstValue.localeCompare(secondValue);
  });
}

function getLocalDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getEventDate(event) {
  if (!event.eventDate) {
    return null;
  }

  const date = new Date(`${event.eventDate}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function UserPage() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(() =>
    getInitialTab(searchParams.get("tab")),
  );

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarActiveStartDate, setCalendarActiveStartDate] = useState(
    () => new Date(),
  );
  const selectedDateSectionRef = useRef(null);

  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoadedForUserId, setCalendarLoadedForUserId] = useState(null);
  const [calendarError, setCalendarError] = useState("");
  const [calendarMessage, setCalendarMessage] = useState("");
  const [calendarRemovingId, setCalendarRemovingId] = useState(null);
  const [pendingCalendarRemoval, setPendingCalendarRemoval] = useState(null);

  const [favorites, setFavorites] = useState({
    businesses: [],
    events: [],
  });

  const [activity] = useState({
    businessesSupported: 0,
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    location: "",
    eventDate: "",
    startTime: "",
    endTime: "",
  });

  const [eventMessage, setEventMessage] = useState("");

  const calendarUserId = user?.id ?? user?.username ?? null;

  const displayName = user?.username
    ? `${user.username.charAt(0).toUpperCase()}${user.username.slice(1)}`
    : "there";

  useEffect(() => {
    if (!calendarUserId) {
      return undefined;
    }

    let isCurrent = true;

    async function loadCalendar() {
      try {
        const data = await getCalendarEvents();
        const events = Array.isArray(data.events) ? data.events : [];

        if (!isCurrent) {
          return;
        }

        setCalendarError("");
        setCalendarEvents(events);
        setCalendarLoadedForUserId(calendarUserId);

        if (events[0]?.eventDate) {
          const firstEventDate = getEventDate(events[0]);

          if (firstEventDate) {
            setSelectedDate(firstEventDate);
            setCalendarActiveStartDate(
              new Date(
                firstEventDate.getFullYear(),
                firstEventDate.getMonth(),
                1,
              ),
            );
          }
        }
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setCalendarEvents([]);
        setCalendarLoadedForUserId(calendarUserId);
        setCalendarError(
          error instanceof Error
            ? error.message
            : "Unable to load your calendar.",
        );
      }
    }

    loadCalendar();

    return () => {
      isCurrent = false;
    };
  }, [calendarUserId]);

  const showCalendarLoading =
    authLoading ||
    Boolean(
      calendarUserId && calendarLoadedForUserId !== calendarUserId,
    );

  const selectedDateKey = getLocalDateKey(selectedDate);

  const sortedCalendarEvents = useMemo(
    () => sortCalendarEvents(calendarEvents),
    [calendarEvents],
  );

  const upcomingCalendarEvents = useMemo(() => {
    const todayKey = getLocalDateKey(new Date());

    return sortedCalendarEvents.filter(
      (event) => event.eventDate && event.eventDate >= todayKey,
    );
  }, [sortedCalendarEvents]);

  const calendarEventCounts = useMemo(() => {
    const counts = new Map();

    calendarEvents.forEach((event) => {
      if (!event.eventDate) {
        return;
      }

      counts.set(event.eventDate, (counts.get(event.eventDate) ?? 0) + 1);
    });

    return counts;
  }, [calendarEvents]);

  const selectedDateEvents = calendarEvents.filter(
    (event) => event.eventDate === selectedDateKey,
  );

  const handleTabChange = (_event, nextTab) => {
    setActiveTab(nextTab);

    if (nextTab === 0) {
      setSearchParams({}, { replace: true });
      return;
    }

    setSearchParams(
      {
        tab: dashboardTabs[nextTab],
      },
      { replace: true },
    );
  };

  const handleCalendarDateChange = (nextDate) => {
    if (!(nextDate instanceof Date)) {
      return;
    }

    setSelectedDate(nextDate);
  };

  const handleUpcomingEventSelect = (event) => {
    const eventDate = getEventDate(event);

    if (!eventDate) {
      return;
    }

    setSelectedDate(eventDate);
    setCalendarActiveStartDate(
      new Date(eventDate.getFullYear(), eventDate.getMonth(), 1),
    );

    window.requestAnimationFrame(() => {
      selectedDateSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleRemoveCalendarEvent = async (eventId) => {
    const eventToRemove = calendarEvents.find(
      (event) => event.id === eventId,
    );

    if (!eventToRemove) {
      return;
    }

    setCalendarError("");
    setCalendarMessage("");
    setPendingCalendarRemoval(null);
    setCalendarRemovingId(eventId);

    try {
      const result = await removeEventFromCalendar(eventId);

      setCalendarEvents((currentEvents) =>
        currentEvents.filter((event) => event.id !== eventId),
      );

      setPendingCalendarRemoval(eventToRemove);
      setCalendarMessage(
        result.message ?? "Event removed from your calendar.",
      );
    } catch (error) {
      setCalendarError(
        error instanceof Error
          ? error.message
          : "Unable to remove this event.",
      );
    } finally {
      setCalendarRemovingId(null);
    }
  };

  const handleUndoCalendarRemoval = async () => {
    if (!pendingCalendarRemoval) {
      return;
    }

    const eventToRestore = pendingCalendarRemoval;

    setPendingCalendarRemoval(null);
    setCalendarError("");
    setCalendarMessage("");

    try {
      await addEventToCalendar(eventToRestore.id);

      setCalendarEvents((currentEvents) => {
        const alreadyRestored = currentEvents.some(
          (event) => event.id === eventToRestore.id,
        );

        if (alreadyRestored) {
          return currentEvents;
        }

        return sortCalendarEvents([
          ...currentEvents,
          eventToRestore,
        ]);
      });

      setCalendarMessage("Removal undone. Event restored to your calendar.");
    } catch (error) {
      setCalendarError(
        error instanceof Error
          ? error.message
          : "Unable to restore this event.",
      );
    }
  };

  const handleCalendarSnackbarClose = (_event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setCalendarMessage("");
    setPendingCalendarRemoval(null);
  };

  const handleEventChange = (event) => {
    const { name, value } = event.target;

    setEventForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateEvent = async (event) => {
    event.preventDefault();
    setEventMessage("");

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(eventForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create event.");
      }

      setEventMessage("Your event was added to Rooted.");

      setEventForm({
        title: "",
        description: "",
        location: "",
        eventDate: "",
        startTime: "",
        endTime: "",
      });
    } catch (error) {
      setEventMessage(
        error instanceof Error
          ? error.message
          : "Unable to create event.",
      );
    }
  };

  const removeFavorite = async (type, id) => {
    try {
      await fetch(`/api/favorites/${type}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      setFavorites((previous) => ({
        ...previous,
        [type]: previous[type].filter((item) => item.id !== id),
      }));
    } catch (error) {
      console.error("Unable to remove favorite:", error);
    }
  };

  const selectedDateText = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <Header />

      <main className="user-page">
        <section className="user-header">
          <Box>
            <Avatar
              src={user?.avatar_url || ""}
              alt={user?.username || "Profile"}
              className="profile-avatar"
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>

            <Typography className="user-eyebrow">
              YOUR ROOTED PROFILE
            </Typography>

            <Typography variant="h1" className="user-title">
              Welcome back, {displayName}.
            </Typography>

            <Typography className="user-description">
              Keep track of the local places and events that make your community
              special.
            </Typography>
          </Box>
        </section>

        <section className="activity-grid">
          <Card className="activity-card">
            <CardContent>
              <Typography className="activity-number">
                {activity.businessesSupported}
              </Typography>

              <Typography className="activity-label">
                Local businesses supported
              </Typography>
            </CardContent>
          </Card>

          <Card className="activity-card">
            <CardContent>
              <Typography className="activity-number">
                {calendarEvents.length}
              </Typography>

              <Typography className="activity-label">
                Events on your calendar
              </Typography>
            </CardContent>
          </Card>

          <Card className="activity-card">
            <CardContent>
              <Typography className="activity-number">
                {favorites.businesses.length + favorites.events.length}
              </Typography>

              <Typography className="activity-label">
                Favorites saved
              </Typography>
            </CardContent>
          </Card>
        </section>

        <Card className="user-dashboard-card">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            className="rooted-tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Favorites" />
            <Tab label="Calendar" />
            <Tab label="Create Event" />
          </Tabs>

          <Divider />

          <Box className="dashboard-content">
            {activeTab === 0 && (
              <>
                <Typography className="section-eyebrow">
                  SAVED FOR LATER
                </Typography>

                <Typography variant="h2" className="section-title">
                  Your Favorites
                </Typography>

                <Box className="favorite-section-group" sx={{ mb: 6 }}>
                  <Typography
                    variant="h3"
                    className="subsection-title"
                    sx={{ mb: 2 }}
                  >
                    Saved Businesses
                  </Typography>

                  <Box className="favorite-grid">
                    {favorites.businesses.length === 0 ? (
                      <Box className="empty-state">
                        <Typography variant="h4">
                          No saved businesses yet
                        </Typography>

                        <Typography>
                          Explore Rooted and save local businesses you want to
                          support.
                        </Typography>

                        <Button
                          component={Link}
                          to="/discover"
                          variant="contained"
                          className="rooted-button"
                        >
                          Explore Businesses
                        </Button>
                      </Box>
                    ) : (
                      favorites.businesses.map((business) => (
                        <Card className="favorite-card" key={business.id}>
                          <CardContent>
                            <Chip label="Business" className="rooted-chip" />

                            <Typography variant="h3">
                              {business.business_name}
                            </Typography>

                            <Typography>{business.address}</Typography>

                            <Typography>&nbsp;</Typography>

                            <Button
                              onClick={() =>
                                removeFavorite("businesses", business.id)
                              }
                              className="remove-button"
                            >
                              Remove Favorite
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </Box>
                </Box>

                <Box className="favorite-section-group">
                  <Typography
                    variant="h3"
                    className="subsection-title"
                    sx={{ mb: 2 }}
                  >
                    Saved Events
                  </Typography>

                  <Box className="favorite-grid">
                    {favorites.events.length === 0 ? (
                      <Box className="empty-state">
                        <Typography variant="h4">
                          No saved events yet
                        </Typography>

                        <Typography>
                          Explore Rooted and save events you want to attend
                          later.
                        </Typography>

                        <Button
                          component={Link}
                          to="/connect"
                          variant="contained"
                          className="rooted-button"
                        >
                          Explore Events
                        </Button>
                      </Box>
                    ) : (
                      favorites.events.map((event) => (
                        <Card className="favorite-card" key={event.id}>
                          <CardContent>
                            <Chip label="Event" className="rooted-chip" />

                            <Typography variant="h3">{event.title}</Typography>

                            <Typography>{event.location}</Typography>

                            <Typography>{event.event_date}</Typography>

                            <Button
                              onClick={() =>
                                removeFavorite("events", event.id)
                              }
                              className="remove-button"
                            >
                              Remove Favorite
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </Box>
                </Box>
              </>
            )}

            {activeTab === 1 && (
              <>
                <Typography className="section-eyebrow">
                  PLAN YOUR COMMUNITY LIFE
                </Typography>

                <Typography variant="h2" className="section-title">
                  Your Calendar
                </Typography>

                <Typography className="calendar-description">
                  Select a date to see the local events you’ve saved.
                </Typography>

                {calendarError && (
                  <Alert severity="error" className="event-alert">
                    {calendarError}
                  </Alert>
                )}

                <Box className="calendar-overview">
                  <Box className="calendar-wrapper">
                    <Calendar
                      value={selectedDate}
                      activeStartDate={calendarActiveStartDate}
                      onChange={handleCalendarDateChange}
                      onActiveStartDateChange={({ activeStartDate }) => {
                        if (activeStartDate) {
                          setCalendarActiveStartDate(activeStartDate);
                        }
                      }}
                      tileContent={({ date, view }) => {
                        if (view !== "month") {
                          return null;
                        }

                        const eventCount =
                          calendarEventCounts.get(getLocalDateKey(date)) ?? 0;

                        if (eventCount === 0) {
                          return null;
                        }

                        return (
                          <span
                            className="calendar-event-marker"
                            aria-label={`${eventCount} saved ${
                              eventCount === 1 ? "event" : "events"
                            }`}
                          >
                            {eventCount}
                          </span>
                        );
                      }}
                    />
                  </Box>

                  <Box className="upcoming-events-panel">
                    <Typography className="upcoming-events-eyebrow">
                      COMING UP
                    </Typography>

                    <Typography variant="h3" className="upcoming-events-title">
                      Your saved events
                    </Typography>

                    {showCalendarLoading ? (
                      <Typography className="upcoming-events-status">
                        Loading your events…
                      </Typography>
                    ) : upcomingCalendarEvents.length === 0 ? (
                      <Box className="upcoming-events-empty">
                        <Typography>No upcoming events saved.</Typography>

                        <Button component={Link} to="/connect" size="small">
                          Explore Events
                        </Button>
                      </Box>
                    ) : (
                      <Stack spacing={1.25} className="upcoming-events-list">
                        {upcomingCalendarEvents.map((event) => {
                          const eventDate = getEventDate(event);
                          const eventDateLabel = eventDate
                            ? eventDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : event.eventDate;

                          const eventTimeLabel = [
                            event.startTime,
                            event.endTime,
                          ]
                            .filter(Boolean)
                            .join("–");

                          const eventLocation = [
                            event.venue ?? event.address,
                            event.city,
                          ]
                            .filter(Boolean)
                            .join(", ");

                          const isSelected =
                            event.eventDate === selectedDateKey;

                          return (
                            <Button
                              key={event.id}
                              type="button"
                              className={`upcoming-event-button${
                                isSelected ? " is-selected" : ""
                              }`}
                              onClick={() =>
                                handleUpcomingEventSelect(event)
                              }
                            >
                              <Box className="upcoming-event-copy">
                                <Typography className="upcoming-event-date">
                                  {eventDateLabel}
                                  {eventTimeLabel
                                    ? ` · ${eventTimeLabel}`
                                    : ""}
                                </Typography>

                                <Typography className="upcoming-event-name">
                                  {event.title}
                                </Typography>

                                {eventLocation && (
                                  <Typography className="upcoming-event-location">
                                    {eventLocation}
                                  </Typography>
                                )}
                              </Box>
                            </Button>
                          );
                        })}
                      </Stack>
                    )}
                  </Box>
                </Box>

                <Box className="selected-date" ref={selectedDateSectionRef}>
                  <Typography className="selected-date-label">
                    SELECTED DATE
                  </Typography>

                  <Typography variant="h3">{selectedDateText}</Typography>
                </Box>

                {showCalendarLoading ? (
                  <Box className="empty-state">
                    <Typography>Loading your calendar…</Typography>
                  </Box>
                ) : selectedDateEvents.length === 0 ? (
                  <Box className="empty-state">
                    <Typography variant="h4">
                      No events saved for this date
                    </Typography>

                    <Typography>
                      Explore community events and add one to your calendar.
                    </Typography>

                    <Button
                      component={Link}
                      to="/connect"
                      variant="contained"
                      className="rooted-button"
                    >
                      Explore Events
                    </Button>
                  </Box>
                ) : (
                  <Box className="favorite-grid">
                    {selectedDateEvents.map((event) => (
                      <Card className="favorite-card" key={event.id}>
                        <CardContent>
                          <Chip
                            label={
                              event.kind?.replaceAll("_", " ") ?? "Event"
                            }
                            className="rooted-chip"
                          />

                          <Typography variant="h3">
                            {event.title}
                          </Typography>

                          {event.description && (
                            <Typography>{event.description}</Typography>
                          )}

                          <Typography>
                            {event.startTime}
                            {event.endTime ? `–${event.endTime}` : ""}
                          </Typography>

                          <Typography>
                            {event.venue ?? event.address}
                            {event.city ? `, ${event.city}` : ""}
                          </Typography>

                          <Button
                            type="button"
                            variant="outlined"
                            onClick={() => handleRemoveCalendarEvent(event.id)}
                            disabled={calendarRemovingId === event.id}
                            sx={{
                              marginTop: 2,
                              alignSelf: "flex-start",
                              color: "#984f45",
                              backgroundColor: "#fff8f6",
                              borderColor: "#c97868",
                              borderWidth: "2px",
                              fontWeight: 700,
                              textTransform: "none",
                              "&:hover": {
                                color: "#ffffff",
                                backgroundColor: "#984f45",
                                borderColor: "#984f45",
                                borderWidth: "2px",
                              },
                            }}
                          >
                            {calendarRemovingId === event.id
                              ? "Removing…"
                              : "Remove from Calendar"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </>
            )}

            {activeTab === 2 && (
              <>
                <Typography className="section-eyebrow">
                  BRING PEOPLE TOGETHER
                </Typography>

                <Typography variant="h2" className="section-title">
                  Create a Local Event
                </Typography>

                <Typography className="calendar-description">
                  Add an event directly to Rooted so your community can discover
                  it.
                </Typography>

                {eventMessage && (
                  <Alert severity="info" className="event-alert">
                    {eventMessage}
                  </Alert>
                )}

                <Box
                  component="form"
                  className="event-form"
                  onSubmit={handleCreateEvent}
                >
                  <TextField
                    label="Event name"
                    name="title"
                    value={eventForm.title}
                    onChange={handleEventChange}
                    required
                    fullWidth
                  />

                  <TextField
                    label="Description"
                    name="description"
                    value={eventForm.description}
                    onChange={handleEventChange}
                    required
                    multiline
                    rows={4}
                    fullWidth
                  />

                  <TextField
                    label="Location"
                    name="location"
                    value={eventForm.location}
                    onChange={handleEventChange}
                    required
                    fullWidth
                  />

                  <Stack
                    direction={{
                      xs: "column",
                      md: "row",
                    }}
                    spacing={2}
                  >
                    <TextField
                      label="Date"
                      name="eventDate"
                      type="date"
                      value={eventForm.eventDate}
                      onChange={handleEventChange}
                      required
                      fullWidth
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                    />

                    <TextField
                      label="Start time"
                      name="startTime"
                      type="time"
                      value={eventForm.startTime}
                      onChange={handleEventChange}
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
                      value={eventForm.endTime}
                      onChange={handleEventChange}
                      fullWidth
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                    />
                  </Stack>

                  <Button
                    type="submit"
                    variant="contained"
                    className="rooted-button"
                  >
                    Add Event to Rooted
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Card>

        <section className="user-footer" />
      </main>

      <Snackbar
        key={`${pendingCalendarRemoval?.id ?? "calendar"}-${calendarMessage}`}
        open={Boolean(calendarMessage)}
        message={calendarMessage}
        autoHideDuration={pendingCalendarRemoval ? 6000 : 3500}
        onClose={handleCalendarSnackbarClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        action={
          pendingCalendarRemoval ? (
            <Button
              type="button"
              size="small"
              onClick={handleUndoCalendarRemoval}
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
              Undo
            </Button>
          ) : null
        }
        sx={{
          bottom: { xs: 20, sm: 28 },

          "& .MuiSnackbarContent-root": {
            minWidth: {
              xs: "calc(100vw - 32px)",
              sm: "440px",
            },
            padding: "10px 14px",
            color: pendingCalendarRemoval
              ? "var(--rooted-plum)"
              : "var(--rooted-dark-green)",
            backgroundColor: pendingCalendarRemoval
              ? "#f7e7e3"
              : "#e7efe2",
            border: "1px solid",
            borderColor: pendingCalendarRemoval
              ? "#c97868"
              : "var(--rooted-green)",
            borderLeft: "6px solid",
            borderLeftColor: pendingCalendarRemoval
              ? "#c97868"
              : "var(--rooted-green)",
            borderRadius: "10px",
            boxShadow: "0 6px 18px rgba(25, 20, 32, 0.22)",
          },

          "& .MuiSnackbarContent-message": {
            fontSize: "15px",
            fontWeight: 700,
          },
        }}
      />

      <Footer />
    </>
  );
}

export default UserPage;