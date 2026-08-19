import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";

import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import DetailsDialog from "./DetailsDialog.jsx";
import { getPlaces } from "../services/places.js";

//Filter Categories
// The temporary fixture key remains "restaurants", but the collection
// includes restaurants, cafés, and coffee shops.
const categories = [
  { value: "restaurants", label: "Food & Drink" },
  { value: "museums", label: "Museums" },
  { value: "hiking_areas", label: "Hiking" },
  { value: "farmers_markets", label: "Farmers markets" },
  { value: "live_music_venues", label: "Live music" },
];

function DiscoverPage() {
  const [places, setPlaces] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("restaurants");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    async function loadPlaces() {
      setLoading(true);
      setError("");
      try {
        const data = await getPlaces({
          category: selectedCategory,
          limit: 6,
          page,
        });

        setPlaces(data.places);
        setTotalPages(data.totalPages);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadPlaces();
  }, [selectedCategory, page]);

  return (
    <div className="page-layout">
      <Header />

      <main className="page-content">
        <header className="discover-page-heading">
          <p className="hero-eyebrow">Discover your community</p>

          <h1>Find your next favorite spot.</h1>

          <p>
            Browse restaurants, museums, outdoor spaces, markets, and live music
            nearby.
          </p>
        </header>

        <Stack
          direction="row"
          spacing={1}
          className="discover-filters"
          sx={{
            marginBottom: 4,
            overflowX: "auto",
            paddingBottom: 1,
          }}
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category.value;

            return (
              <Button
                key={category.value}
                type="button"
                variant={isSelected ? "contained" : "outlined"}
                onClick={() => {
                  setSelectedCategory(category.value);
                  setPage(1);
                }}
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
                {category.label}
              </Button>
            );
          })}
        </Stack>

        {loading && <CircularProgress aria-label="Loading places" />}

        {error && <Typography color="error">{error}</Typography>}

        {!loading && !error && (
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
              {places.map((place) => (
                <Card key={place.id}>
                  <CardActionArea
                    onClick={() => setSelectedPlace(place)}
                    aria-label={`View details for ${place.name}`}
                    className="discover-card-action"
                  >
                    <CardContent>
                      <Typography variant="h6" component="h2">
                        {place.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ marginTop: 1 }}
                      >
                        {place.address}
                      </Typography>

                      {place.rating != null && (
                        <Typography variant="body2" sx={{ marginTop: 2 }}>
                          Rating: {place.rating}
                        </Typography>
                      )}
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
                onChange={(_event, nextPage) => setPage(nextPage)}
                shape="rounded"
                variant="outlined"
                className="rooted-pagination"
              />
            )}
          </Box>
        )}
      </main>
      <DetailsDialog
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
      />
      <Footer />
    </div>
  );
}

export default DiscoverPage;
