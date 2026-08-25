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
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import MyEventsPanel from "../components/MyEventsPanel.jsx";
import EventModerationPanel from "../components/EventModerationPanel.jsx";

import { useAuth } from "../context/AuthContext.jsx";

import {
  addEventToCalendar,
  createEvent,
  getCalendarEvents,
  removeEventFromCalendar,
} from "../services/events.js";

import {
  addFavorite as addFavoriteRequest,
  getFavorites,
  removeFavorite as removeFavoriteRequest,
} from "../services/favorites.js";

import { getVisited, toggleVisited } from "../services/visited.js";

const dashboardTabs = [
  "favorites",
  "calendar",
  "visited",
  "my-events",
  "create-event",
  "event-review",
];

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

async function getBusinessDetails(businessId) {
  const response = await fetch(
    `/api/businesses/${encodeURIComponent(businessId)}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.business ?? null;
}

function formatFavoriteEventDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

function UserPage() {
  const { user, loading: authLoading, fetchMe } = useAuth();
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

  const [favoriteData, setFavoriteData] = useState({
    userId: null,
    businesses: [],
    events: [],
    error: "",
  });

  const [visitedData, setVisitedData] = useState({
    userId: null,
    businesses: [],
    error: "",
  });

  const [favoriteRemovingKey, setFavoriteRemovingKey] = useState(null);
  const [favoriteNotice, setFavoriteNotice] = useState({
    message: "",
    removal: null,
  });
  const [visitedRemovingId, setVisitedRemovingId] = useState(null);
  const [visitedNotice, setVisitedNotice] = useState({
    message: "",
    removal: null,
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

  const [settingsDraft, setSettingsDraft] = useState(null);
  const [settingsMessage, setSettingsMessage] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const settingsRequested = searchParams.get("settings") === "open";
  const settingsOpen = Boolean(user && settingsRequested);

  const settingsForm = settingsDraft ?? {
    username: user?.username ?? "",
    email: user?.email ?? "",
    avatarUrl: user?.avatar_url ?? "",
  };

  const currentUserId = user?.id ?? user?.username ?? null;

  const favorites =
    favoriteData.userId === currentUserId
      ? favoriteData
      : { businesses: [], events: [], error: "" };

  const visitedBusinesses =
    visitedData.userId === currentUserId ? visitedData.businesses : [];

  const favoritesLoading =
    authLoading ||
    Boolean(currentUserId && favoriteData.userId !== currentUserId);

  const visitedLoading =
    authLoading ||
    Boolean(currentUserId && visitedData.userId !== currentUserId);

  const displayName = user?.username
    ? `${user.username.charAt(0).toUpperCase()}${user.username.slice(1)}`
    : "there";

  useEffect(() => {
    if (!currentUserId) {
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
        setCalendarLoadedForUserId(currentUserId);

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
        setCalendarLoadedForUserId(currentUserId);
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
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) {
      return undefined;
    }

    let isCurrent = true;

    async function loadFavorites() {
      try {
        const data = await getFavorites();

        if (!isCurrent) {
          return;
        }

        setFavoriteData({
          userId: currentUserId,
          businesses: Array.isArray(data.businesses) ? data.businesses : [],
          events: Array.isArray(data.events) ? data.events : [],
          error: "",
        });
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setFavoriteData({
          userId: currentUserId,
          businesses: [],
          events: [],
          error:
            error instanceof Error
              ? error.message
              : "Unable to load your favorites.",
        });
      }
    }

    loadFavorites();

    return () => {
      isCurrent = false;
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) {
      return undefined;
    }

    let isCurrent = true;

    async function loadVisitedBusinesses() {
      try {
        const data = await getVisited();
        const businessIds = Array.isArray(data.businesses)
          ? data.businesses
          : [];

        const businessDetails = (
          await Promise.all(businessIds.map(getBusinessDetails))
        ).filter(Boolean);

        if (!isCurrent) {
          return;
        }

        setVisitedData({
          userId: currentUserId,
          businesses: businessDetails,
          error: "",
        });
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setVisitedData({
          userId: currentUserId,
          businesses: [],
          error:
            error instanceof Error
              ? error.message
              : "Unable to load your visited businesses.",
        });
      }
    }

    loadVisitedBusinesses();

    return () => {
      isCurrent = false;
    };
  }, [currentUserId]);

  const showCalendarLoading =
    authLoading ||
    Boolean(currentUserId && calendarLoadedForUserId !== currentUserId);

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
    const eventToRemove = calendarEvents.find((event) => event.id === eventId);

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
      setCalendarMessage(result.message ?? "Event removed from your calendar.");
    } catch (error) {
      setCalendarError(
        error instanceof Error ? error.message : "Unable to remove this event.",
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

        return sortCalendarEvents([...currentEvents, eventToRestore]);
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
      const data = await createEvent(eventForm);

      setEventMessage(data.message ?? "Your event was submitted for review.");

      setEventForm({
        title: "",
        description: "",
        location: "",
        eventDate: "",
        startTime: "",
        endTime: "",
      });

      handleTabChange(null, 3);
    } catch (error) {
      setEventMessage(
        error instanceof Error ? error.message : "Unable to submit this event.",
      );
    }
  };

  const handleRemoveFavorite = async (type, item) => {
    const itemId =
      type === "business" ? (item.business_id ?? item.id) : item.id;
    const itemKey = `${type}:${itemId}`;
    const collection = type === "business" ? "businesses" : "events";
    const originalIndex = favorites[collection].findIndex(
      (candidate) => candidate.id === item.id,
    );
    const itemName = type === "business" ? item.business_name : item.title;

    setFavoriteRemovingKey(itemKey);
    setFavoriteNotice({
      message: "",
      removal: null,
    });

    try {
      await removeFavoriteRequest(type, itemId);

      setFavoriteData((previous) => {
        if (previous.userId !== currentUserId) {
          return previous;
        }

        return {
          ...previous,
          [collection]: previous[collection].filter(
            (candidate) => candidate.id !== item.id,
          ),
          error: "",
        };
      });

      setFavoriteNotice({
        message: `${itemName || "Favorite"} removed from your favorites.`,
        removal: {
          type,
          item,
          itemId,
          collection,
          originalIndex,
        },
      });
    } catch (error) {
      setFavoriteData((previous) => ({
        ...previous,
        error:
          error instanceof Error
            ? error.message
            : "Unable to remove this favorite.",
      }));
    } finally {
      setFavoriteRemovingKey(null);
    }
  };

  const handleUndoFavoriteRemoval = async () => {
    const removal = favoriteNotice.removal;

    if (!removal) {
      return;
    }

    const { type, item, itemId, collection, originalIndex } = removal;
    const itemKey = `${type}:${itemId}`;

    setFavoriteNotice({
      message: "",
      removal: null,
    });
    setFavoriteRemovingKey(itemKey);

    try {
      await addFavoriteRequest(type, itemId);

      setFavoriteData((previous) => {
        if (previous.userId !== currentUserId) {
          return previous;
        }

        if (
          previous[collection].some((candidate) => candidate.id === item.id)
        ) {
          return {
            ...previous,
            error: "",
          };
        }

        const restoredItems = [...previous[collection]];
        const insertionIndex = Math.min(
          Math.max(originalIndex, 0),
          restoredItems.length,
        );

        restoredItems.splice(insertionIndex, 0, item);

        return {
          ...previous,
          [collection]: restoredItems,
          error: "",
        };
      });

      setFavoriteNotice({
        message: "Favorite restored.",
        removal: null,
      });
    } catch (error) {
      setFavoriteData((previous) => ({
        ...previous,
        error:
          error instanceof Error
            ? error.message
            : "Unable to restore this favorite.",
      }));
    } finally {
      setFavoriteRemovingKey(null);
    }
  };

  const handleFavoriteSnackbarClose = (_event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setFavoriteNotice({
      message: "",
      removal: null,
    });
  };

  const handleRemoveVisitedBusiness = async (business) => {
    const businessId = business.business_id ?? business.id;
    const originalIndex = visitedBusinesses.findIndex(
      (candidate) => (candidate.business_id ?? candidate.id) === businessId,
    );

    setVisitedRemovingId(businessId);
    setVisitedNotice({
      message: "",
      removal: null,
    });

    try {
      const result = await toggleVisited(businessId, "business");

      if (!result.visited) {
        setVisitedData((previous) => {
          if (previous.userId !== currentUserId) {
            return previous;
          }

          return {
            ...previous,
            businesses: previous.businesses.filter(
              (candidate) =>
                (candidate.business_id ?? candidate.id) !== businessId,
            ),
            error: "",
          };
        });

        setVisitedNotice({
          message: `${
            business.business_name || "Business"
          } removed from your visited places.`,
          removal: {
            business,
            businessId,
            originalIndex,
          },
        });
      }
    } catch (error) {
      setVisitedData((previous) => ({
        ...previous,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update this visited business.",
      }));
    } finally {
      setVisitedRemovingId(null);
    }
  };

  const handleUndoVisitedRemoval = async () => {
    const removal = visitedNotice.removal;

    if (!removal) {
      return;
    }

    const { business, businessId, originalIndex } = removal;

    setVisitedNotice({
      message: "",
      removal: null,
    });
    setVisitedRemovingId(businessId);

    try {
      const result = await toggleVisited(businessId, "business");

      if (!result.visited) {
        throw new Error("Unable to restore this visited business.");
      }

      setVisitedData((previous) => {
        if (previous.userId !== currentUserId) {
          return previous;
        }

        if (
          previous.businesses.some(
            (candidate) =>
              (candidate.business_id ?? candidate.id) === businessId,
          )
        ) {
          return {
            ...previous,
            error: "",
          };
        }

        const restoredBusinesses = [...previous.businesses];
        const insertionIndex = Math.min(
          Math.max(originalIndex, 0),
          restoredBusinesses.length,
        );

        restoredBusinesses.splice(insertionIndex, 0, business);

        return {
          ...previous,
          businesses: restoredBusinesses,
          error: "",
        };
      });

      setVisitedNotice({
        message: "Visited business restored.",
        removal: null,
      });
    } catch (error) {
      setVisitedData((previous) => ({
        ...previous,
        error:
          error instanceof Error
            ? error.message
            : "Unable to restore this visited business.",
      }));
    } finally {
      setVisitedRemovingId(null);
    }
  };

  const handleVisitedSnackbarClose = (_event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setVisitedNotice({
      message: "",
      removal: null,
    });
  };

  const handleCloseSettings = () => {
    if (savingSettings) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("settings");

    setSettingsDraft(null);
    setSettingsMessage(null);
    setSearchParams(nextSearchParams, { replace: true });
  };

  const handleSettingsChange = (event) => {
    const { name, value } = event.target;

    setSettingsDraft((previous) => ({
      ...(previous ?? {
        username: user?.username ?? "",
        email: user?.email ?? "",
        avatarUrl: user?.avatar_url ?? "",
      }),
      [name]: value,
    }));
  };

  const handleSaveSettings = async (event) => {
    event.preventDefault();
    setSettingsMessage(null);
    setSavingSettings(true);

    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: settingsForm.username.trim(),
          email: settingsForm.email.trim(),
          avatar_url: settingsForm.avatarUrl.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save settings.");
      }

      await fetchMe();
      setSettingsMessage({
        severity: "success",
        text: "Profile settings saved.",
      });
    } catch (error) {
      setSettingsMessage({
        severity: "error",
        text:
          error instanceof Error ? error.message : "Unable to save settings.",
      });
    } finally {
      setSavingSettings(false);
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
          <Box className="user-header-profile">
            <Avatar
              src={user?.avatar_url || undefined}
              alt={`${displayName}'s profile`}
              className="profile-avatar"
            >
              {displayName.charAt(0)}
            </Avatar>

            <Box className="user-header-copy">
              <Typography className="user-eyebrow">
                YOUR ROOTED PROFILE
              </Typography>

              <Typography variant="h1" className="user-title">
                Welcome back, {displayName}.
              </Typography>

              <Typography className="user-description">
                Keep track of the local places and events that make your
                community special.
              </Typography>
            </Box>
          </Box>
        </section>

        <section className="activity-grid">
          <Card className="activity-card">
            <CardActionArea
              type="button"
              onClick={() => handleTabChange(null, 2)}
              aria-label="View visited businesses"
            >
              <CardContent>
                <Typography className="activity-number">
                  {visitedLoading ? "—" : visitedBusinesses.length}
                </Typography>

                <Typography className="activity-label">
                  Local businesses visited
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          <Card className="activity-card">
            <CardActionArea
              type="button"
              onClick={() => handleTabChange(null, 1)}
              aria-label="View your calendar"
            >
              <CardContent>
                <Typography className="activity-number">
                  {showCalendarLoading ? "—" : calendarEvents.length}
                </Typography>

                <Typography className="activity-label">
                  Events on your calendar
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          <Card className="activity-card">
            <CardActionArea
              type="button"
              onClick={() => handleTabChange(null, 0)}
              aria-label="View your favorites"
            >
              <CardContent>
                <Typography className="activity-number">
                  {favoritesLoading
                    ? "—"
                    : favorites.businesses.length + favorites.events.length}
                </Typography>

                <Typography className="activity-label">
                  Favorites saved
                </Typography>
              </CardContent>
            </CardActionArea>
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
            <Tab label="Visited" />
            <Tab label="My Events" />
            <Tab label="Create Event" />

            {user?.role === "admin" && <Tab label="Event Review" value={5} />}
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

                {favoriteData.userId === currentUserId &&
                  favoriteData.error && (
                    <Alert severity="error" className="event-alert">
                      {favoriteData.error}
                    </Alert>
                  )}

                <Box className="favorite-section-group" sx={{ mb: 6 }}>
                  <Typography
                    variant="h3"
                    className="subsection-title"
                    sx={{ mb: 2 }}
                  >
                    Saved Businesses
                  </Typography>

                  <Box className="favorite-grid">
                    {favoritesLoading ? (
                      <Box className="empty-state">
                        <Typography>Loading saved businesses…</Typography>
                      </Box>
                    ) : favorites.businesses.length === 0 ? (
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
                              type="button"
                              onClick={() =>
                                handleRemoveFavorite("business", business)
                              }
                              disabled={
                                favoriteRemovingKey ===
                                `business:${
                                  business.business_id ?? business.id
                                }`
                              }
                              className="remove-button"
                            >
                              {favoriteRemovingKey ===
                              `business:${business.business_id ?? business.id}`
                                ? "Removing…"
                                : "Remove Favorite"}
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
                    {favoritesLoading ? (
                      <Box className="empty-state">
                        <Typography>Loading saved events…</Typography>
                      </Box>
                    ) : favorites.events.length === 0 ? (
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

                            <Typography>
                              {event.venue ?? event.location}
                              {event.city ? `, ${event.city}` : ""}
                            </Typography>

                            <Typography>
                              {formatFavoriteEventDate(event.event_date)}
                              {event.start_time ? ` · ${event.start_time}` : ""}
                            </Typography>

                            <Button
                              type="button"
                              onClick={() =>
                                handleRemoveFavorite("event", event)
                              }
                              disabled={
                                favoriteRemovingKey === `event:${event.id}`
                              }
                              className="remove-button"
                            >
                              {favoriteRemovingKey === `event:${event.id}`
                                ? "Removing…"
                                : "Remove Favorite"}
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
                              onClick={() => handleUpcomingEventSelect(event)}
                            >
                              <Box className="upcoming-event-copy">
                                <Typography className="upcoming-event-date">
                                  {eventDateLabel}
                                  {eventTimeLabel ? ` · ${eventTimeLabel}` : ""}
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
                            label={event.kind?.replaceAll("_", " ") ?? "Event"}
                            className="rooted-chip"
                          />

                          <Typography variant="h3">{event.title}</Typography>

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
                            onClick={() => handleRemoveCalendarEvent(event.id)}
                            disabled={calendarRemovingId === event.id}
                            className="remove-button"
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
                  YOUR LOCAL HISTORY
                </Typography>

                <Typography variant="h2" className="section-title">
                  Visited Businesses
                </Typography>

                <Typography className="calendar-description">
                  A record of the local places you’ve marked as visited.
                </Typography>

                {visitedData.userId === currentUserId && visitedData.error && (
                  <Alert severity="error" className="event-alert">
                    {visitedData.error}
                  </Alert>
                )}

                {visitedLoading ? (
                  <Box className="empty-state">
                    <Typography>Loading visited businesses…</Typography>
                  </Box>
                ) : visitedBusinesses.length === 0 ? (
                  <Box className="empty-state">
                    <Typography variant="h4">
                      No visited businesses yet
                    </Typography>

                    <Typography>
                      Open a business in Discover and mark it as visited to
                      build your local history.
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
                  <Box className="favorite-grid">
                    {visitedBusinesses.map((business) => {
                      const businessId = business.business_id ?? business.id;

                      return (
                        <Card className="favorite-card" key={businessId}>
                          <CardContent>
                            <Chip label="Visited" className="rooted-chip" />

                            <Typography variant="h3">
                              {business.business_name}
                            </Typography>

                            {business.address && (
                              <Typography>{business.address}</Typography>
                            )}

                            {business.rating != null && (
                              <Typography>
                                Rating: {business.rating} out of 5
                              </Typography>
                            )}

                            <Button
                              type="button"
                              onClick={() =>
                                handleRemoveVisitedBusiness(business)
                              }
                              disabled={visitedRemovingId === businessId}
                              className="remove-button"
                            >
                              {visitedRemovingId === businessId
                                ? "Removing…"
                                : "Remove from Visited"}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                )}
              </>
            )}

            {activeTab === 3 && (
              <MyEventsPanel
                submissionMessage={eventMessage}
                onCreateEvent={() => {
                  setEventMessage("");
                  handleTabChange(null, 4);
                }}
              />
            )}

            {activeTab === 4 && (
              <>
                <Typography className="section-eyebrow">
                  BRING PEOPLE TOGETHER
                </Typography>

                <Typography variant="h2" className="section-title">
                  Create a Local Event
                </Typography>

                <Typography className="calendar-description">
                  Submit a local event for review. Approved events will appear
                  publicly in Connect.
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
                    Submit Event for Review
                  </Button>
                </Box>
              </>
            )}

            {activeTab === 5 && user?.role === "admin" && (
              <EventModerationPanel />
            )}
          </Box>
        </Card>

        <section className="user-footer" />
      </main>

      <Dialog
        open={settingsOpen}
        onClose={handleCloseSettings}
        fullWidth
        maxWidth="sm"
        className="settings-dialog"
      >
        <DialogTitle className="settings-dialog-title">
          <Box>
            <Typography className="section-eyebrow">YOUR ACCOUNT</Typography>

            <Typography variant="h2" className="settings-dialog-heading">
              Profile Settings
            </Typography>
          </Box>

          <IconButton
            type="button"
            aria-label="Close settings"
            onClick={handleCloseSettings}
            className="settings-close-button"
            disabled={savingSettings}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent className="settings-dialog-content" dividers>
          {settingsMessage && (
            <Alert
              severity={settingsMessage.severity}
              className="settings-alert"
            >
              {settingsMessage.text}
            </Alert>
          )}

          <Box
            component="form"
            id="settings-form"
            className="settings-form"
            onSubmit={handleSaveSettings}
          >
            <Box className="settings-profile-summary">
              <Avatar
                src={settingsForm.avatarUrl || undefined}
                alt="Profile preview"
                className="settings-preview-avatar"
              >
                {settingsForm.username.trim().charAt(0).toUpperCase() ||
                  displayName.charAt(0)}
              </Avatar>

              <Box>
                <Typography className="settings-profile-summary-title">
                  Profile preview
                </Typography>

                <Typography className="settings-profile-summary-description">
                  This is how your name and avatar will appear throughout
                  Rooted.
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h3" className="subsection-title">
                Account details
              </Typography>

              <Stack spacing={2.5} sx={{ marginTop: 2 }}>
                <TextField
                  label="Username"
                  name="username"
                  value={settingsForm.username}
                  onChange={handleSettingsChange}
                  required
                  fullWidth
                  autoComplete="username"
                />

                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={settingsForm.email}
                  onChange={handleSettingsChange}
                  required
                  fullWidth
                  autoComplete="email"
                />

                <TextField
                  label="Avatar URL"
                  name="avatarUrl"
                  type="url"
                  value={settingsForm.avatarUrl}
                  onChange={handleSettingsChange}
                  fullWidth
                  helperText="Paste a direct image URL for your profile picture."
                />
              </Stack>
            </Box>
          </Box>
        </DialogContent>

        <Box className="settings-dialog-actions">
          <Button
            type="button"
            onClick={handleCloseSettings}
            className="rooted-outline-button"
            variant="outlined"
            disabled={savingSettings}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="settings-form"
            variant="contained"
            className="rooted-button"
            disabled={savingSettings}
          >
            {savingSettings ? "Saving…" : "Save Settings"}
          </Button>
        </Box>
      </Dialog>

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
            backgroundColor: pendingCalendarRemoval ? "#f7e7e3" : "#e7efe2",
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

      <Snackbar
        key={`${favoriteNotice.removal?.itemId ?? "favorite"}-${
          favoriteNotice.message
        }`}
        open={Boolean(favoriteNotice.message)}
        message={favoriteNotice.message}
        autoHideDuration={favoriteNotice.removal ? 6000 : 3500}
        onClose={handleFavoriteSnackbarClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        action={
          favoriteNotice.removal ? (
            <Button
              type="button"
              size="small"
              onClick={handleUndoFavoriteRemoval}
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
            color: favoriteNotice.removal
              ? "var(--rooted-plum)"
              : "var(--rooted-dark-green)",
            backgroundColor: favoriteNotice.removal ? "#f7e7e3" : "#e7efe2",
            border: "1px solid",
            borderColor: favoriteNotice.removal
              ? "#c97868"
              : "var(--rooted-green)",
            borderLeft: "6px solid",
            borderLeftColor: favoriteNotice.removal
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

      <Snackbar
        key={`${visitedNotice.removal?.businessId ?? "visited"}-${
          visitedNotice.message
        }`}
        open={Boolean(visitedNotice.message)}
        message={visitedNotice.message}
        autoHideDuration={visitedNotice.removal ? 6000 : 3500}
        onClose={handleVisitedSnackbarClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        action={
          visitedNotice.removal ? (
            <Button
              type="button"
              size="small"
              onClick={handleUndoVisitedRemoval}
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
            color: visitedNotice.removal
              ? "var(--rooted-plum)"
              : "var(--rooted-dark-green)",
            backgroundColor: visitedNotice.removal ? "#f7e7e3" : "#e7efe2",
            border: "1px solid",
            borderColor: visitedNotice.removal
              ? "#c97868"
              : "var(--rooted-green)",
            borderLeft: "6px solid",
            borderLeftColor: visitedNotice.removal
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
