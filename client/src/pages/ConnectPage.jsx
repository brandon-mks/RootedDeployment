import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";

import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import DetailsDialog from "../components/DetailsDialog.jsx";
import { getEvents } from "../services/events.js";

const opportunitiesPerPage = 6;

const connectFilters = [
  { value: "all", label: "All" },
  { value: "community_events", label: "Community Events" },
  { value: "volunteer", label: "Volunteer" },
  { value: "live_music_arts", label: "Live Music & Arts" },
  { value: "markets_popups", label: "Markets & Pop-ups" },
  { value: "classes_workshops", label: "Classes & Workshops" },
];

function getFilterLabel(value) {
  return (
    connectFilters.find((filter) => filter.value === value)?.label ??
    "Community opportunity"
  );
}

function formatEventDate(value) {
  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

function ConnectPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedLabel = getFilterLabel(selectedFilter);

  const visibleOpportunities =
    selectedFilter === "all"
      ? opportunities
      : opportunities.filter(
          (opportunity) => opportunity.kind === selectedFilter,
        );

  const totalPages = Math.max(
    Math.ceil(visibleOpportunities.length / opportunitiesPerPage),
    1,
  );

  const firstOpportunityIndex = (page - 1) * opportunitiesPerPage;

  const pageOpportunities = visibleOpportunities.slice(
    firstOpportunityIndex,
    firstOpportunityIndex + opportunitiesPerPage,
  );

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getEvents();
        setOpportunities(data.events);
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to load community opportunities.";

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <div className="page-layout">
      <Header />

      <main className="page-content connect-page">
        <header className="connect-page-heading">
          <p className="hero-eyebrow">Connect with your community</p>

          <h1>See what’s happening nearby.</h1>

          <p>
            Find community events and volunteer opportunities around you.
          </p>
        </header>

        <Stack direction="row" spacing={1} className="connect-filters">
          {connectFilters.map((filter) => {
            const isSelected = selectedFilter === filter.value;

            return (
              <Button
                key={filter.value}
                type="button"
                variant={isSelected ? "contained" : "outlined"}
                onClick={() => {
                  setSelectedFilter(filter.value);
                  setPage(1);
                  setSelectedOpportunity(null);
                }}
                className="connect-filter-button"
                sx={{
                  flexShrink: 0,
                  borderColor: "var(--rooted-green)",
                  color: isSelected ? "white" : "var(--rooted-plum)",
                  backgroundColor: isSelected
                    ? "var(--rooted-green)"
                    : "transparent",
                  "&:hover": {
                    borderColor: "var(--rooted-green)",
                    backgroundColor: isSelected
                      ? "var(--rooted-dark-green)"
                      : "rgba(122, 166, 100, 0.1)",
                  },
                }}
              >
                {filter.label}
              </Button>
            );
          })}
        </Stack>

        {loading && (
          <Box className="connect-status" aria-live="polite">
            <Typography>Loading community opportunities…</Typography>
          </Box>
        )}

        {!loading && error && (
          <Box className="connect-status connect-error" role="alert">
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {!loading && !error && pageOpportunities.length > 0 && (
          <Box>
            <Box
              className="discover-results-grid"
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 3,
              }}
            >
              {pageOpportunities.map((opportunity) => (
                <Card key={opportunity.id}>
                  <CardActionArea
                    onClick={() => setSelectedOpportunity(opportunity)}
                    aria-label={`View details for ${opportunity.title}`}
                    className="discover-card-action"
                  >
                    <CardContent>
                      <Typography
                        variant="overline"
                        component="p"
                        sx={{
                          color: "var(--rooted-green)",
                          fontWeight: 700,
                          lineHeight: 1.2,
                          marginBottom: 1,
                        }}
                      >
                        {opportunity.city} ·{" "}
                        {getFilterLabel(opportunity.kind)}
                      </Typography>

                      <Typography variant="h6" component="h2">
                        {opportunity.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ marginTop: 1 }}
                      >
                        {formatEventDate(opportunity.eventDate)} ·{" "}
                        {opportunity.startTime}–{opportunity.endTime}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ marginTop: 2 }}
                      >
                        {opportunity.venue}, {opportunity.city}
                      </Typography>

                      <Typography
                        variant="button"
                        component="span"
                        className="discover-details-link"
                      >
                        View details
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>

            {totalPages > 1 && (
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_event, nextPage) => {
                  setPage(nextPage);
                  setSelectedOpportunity(null);
                }}
                shape="rounded"
                variant="outlined"
                className="rooted-pagination"
              />
            )}
          </Box>
        )}

        {!loading && !error && visibleOpportunities.length === 0 && (
          <section className="connect-empty-state" aria-live="polite">
            <p className="connect-empty-eyebrow">
              Listings are taking root
            </p>

            <h2>{selectedLabel}</h2>

            <p>
              Local opportunities will appear here once event data is
              connected.
            </p>
          </section>
        )}
      </main>

      <DetailsDialog
        place={selectedOpportunity}
        places={pageOpportunities}
        onPlaceChange={setSelectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />

      <Footer />
    </div>
  );
}

export default ConnectPage;