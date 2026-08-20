import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import { useAuth } from "../context/AuthContext.jsx";

function UserPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [favoriteTab, setFavoriteTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [favorites, setFavorites] = useState({
    businesses: [],
    events: [],
  });

  const [reviews] = useState({
    businesses: [],
    events: [],
  });

  const [activity] = useState({
    businessesSupported: 0,
    eventsAttended: 0,
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

  const handleLogout = async () => {
    await logout();
    navigate("/");
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
      setEventMessage(error.message);
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
        {/* Header */}
        <section className="user-header">
          <Box>
            <Typography className="user-eyebrow">
              YOUR ROOTED PROFILE
            </Typography>

            <Typography variant="h1" className="user-title">
              Welcome back, {user?.username || "there"}.
            </Typography>

            <Typography className="user-description">
              Keep track of the local places and events that make your community
              special.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            className="rooted-outline-button"
            onClick={handleLogout}
          >
            Log out
          </Button>
        </section>

        {/* Activity badges */}
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
                {activity.eventsAttended}
              </Typography>

              <Typography className="activity-label">
                Local events attended
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

        {/* Main tabs */}
        <Card className="user-dashboard-card">
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            className="rooted-tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Favorites" />
            <Tab label="Reviews" />
            <Tab label="Calendar" />
            <Tab label="Create Event" />
          </Tabs>

          <Divider />

          <Box className="dashboard-content">
            {/* FAVORITES */}
            {activeTab === 0 && (
              <>
                <Typography className="section-eyebrow">
                  SAVED FOR LATER
                </Typography>

                <Typography variant="h2" className="section-title">
                  Your Favorites
                </Typography>

                <Tabs
                  value={favoriteTab}
                  onChange={(_, newValue) => setFavoriteTab(newValue)}
                  className="favorite-tabs"
                >
                  <Tab label="Businesses" />
                  <Tab label="Events" />
                </Tabs>

                {favoriteTab === 0 && (
                  <Box className="favorite-grid">
                    {favorites.businesses.length === 0 ? (
                      <Box className="empty-state">
                        <Typography variant="h3">
                          No saved businesses yet
                        </Typography>

                        <Typography>
                          Explore Rooted and save local businesses you want to
                          support.
                        </Typography>

                        <Button
                          component={Link}
                          to="/connect"
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
                )}

                {favoriteTab === 1 && (
                  <Box className="favorite-grid">
                    {favorites.events.length === 0 ? (
                      <Box className="empty-state">
                        <Typography variant="h3">
                          No saved events yet
                        </Typography>

                        <Typography>
                          Save events you want to attend later.
                        </Typography>
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
                              onClick={() => removeFavorite("events", event.id)}
                              className="remove-button"
                            >
                              Remove Favorite
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </Box>
                )}
              </>
            )}

            {/* REVIEWS */}
            {activeTab === 1 && (
              <>
                <Typography className="section-eyebrow">
                  YOUR COMMUNITY VOICE
                </Typography>

                <Typography variant="h2" className="section-title">
                  Your Reviews
                </Typography>

                <Box className="reviews-grid">
                  <Card className="review-section-card">
                    <CardContent>
                      <Typography variant="h3">Business Reviews</Typography>

                      {reviews.businesses.length === 0 ? (
                        <Typography>
                          You haven't reviewed a business yet.
                        </Typography>
                      ) : (
                        reviews.businesses.map((review) => (
                          <Box className="review-card" key={review.id}>
                            <Typography variant="h4">
                              {review.business_name}
                            </Typography>

                            <Typography className="review-stars">
                              {"★".repeat(review.rating)}
                              {"☆".repeat(5 - review.rating)}
                            </Typography>

                            <Typography>{review.review_text}</Typography>
                          </Box>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card className="review-section-card">
                    <CardContent>
                      <Typography variant="h3">Event Reviews</Typography>

                      {reviews.events.length === 0 ? (
                        <Typography>
                          You haven't reviewed an event yet.
                        </Typography>
                      ) : (
                        reviews.events.map((review) => (
                          <Box className="review-card" key={review.id}>
                            <Typography variant="h4">{review.title}</Typography>

                            <Typography className="review-stars">
                              {"★".repeat(review.rating)}
                              {"☆".repeat(5 - review.rating)}
                            </Typography>

                            <Typography>{review.review_text}</Typography>
                          </Box>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </Box>
              </>
            )}

            {/* CALENDAR */}
            {activeTab === 2 && (
              <>
                <Typography className="section-eyebrow">
                  PLAN YOUR COMMUNITY LIFE
                </Typography>

                <Typography variant="h2" className="section-title">
                  Your Calendar
                </Typography>

                <Typography className="calendar-description">
                  Select a date to keep track of local events.
                </Typography>

                <Box className="calendar-wrapper">
                  <Calendar value={selectedDate} onChange={setSelectedDate} />
                </Box>

                <Box className="selected-date">
                  <Typography className="selected-date-label">
                    SELECTED DATE
                  </Typography>

                  <Typography variant="h3">{selectedDateText}</Typography>
                </Box>
              </>
            )}

            {/* CREATE EVENT */}
            {activeTab === 3 && (
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

        {/* Footer */}
        <section className="user-footer">
          <Box>
            <Typography className="section-eyebrow">KEEP EXPLORING</Typography>

            <Typography variant="h2">Find your next local favorite.</Typography>
          </Box>

          <Button
            component={Link}
            to="/chat"
            variant="contained"
            className="rooted-button"
          >
            Ask Rooted
          </Button>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default UserPage;
