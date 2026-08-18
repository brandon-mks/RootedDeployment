import { useState } from "react";
import { Button, Stack } from "@mui/material";

import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const connectFilters = [
  { value: "all", label: "All" },
  { value: "community_events", label: "Community Events" },
  { value: "volunteer", label: "Volunteer" },
  { value: "live_music_arts", label: "Live Music & Arts" },
  { value: "markets_popups", label: "Markets & Pop-ups" },
  { value: "classes_workshops", label: "Classes & Workshops" },
];

// Replace this empty array with API results later.
const opportunities = [];

function ConnectPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const selectedLabel =
    connectFilters.find((filter) => filter.value === selectedFilter)?.label ??
    "All";

  const visibleOpportunities =
    selectedFilter === "all"
      ? opportunities
      : opportunities.filter(
          (opportunity) => opportunity.kind === selectedFilter,
        );

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

        <Stack
          direction="row"
          spacing={1}
          className="connect-filters"
        >
          {connectFilters.map((filter) => {
            const isSelected = selectedFilter === filter.value;

            return (
              <Button
                key={filter.value}
                type="button"
                variant={isSelected ? "contained" : "outlined"}
                onClick={() => setSelectedFilter(filter.value)}
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

        {visibleOpportunities.length === 0 && (
          <section className="connect-empty-state" aria-live="polite">
            <p className="connect-empty-eyebrow">Listings are taking root</p>
            <h2>{selectedLabel}</h2>
            <p>
              Local opportunities will appear here once event data is
              connected.
            </p>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ConnectPage;