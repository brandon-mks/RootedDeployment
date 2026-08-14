import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
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

  useEffect(() => {
    async function loadPlaces() {
      setLoading(true);
      setError("");
      try {
        const data = await getPlaces({
          category: selectedCategory,
          limit: 6,
        });

        setPlaces(data.places);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadPlaces();
  }, [selectedCategory]);

  return (
    <div className="page-layout">
      <Header />

      <main className="page-content">
        <Typography variant="h3" component="h1" gutterBottom>
          Discover
        </Typography>

        <Typography variant="body1" sx={{ marginBottom: 4 }}>
          Find your next favorite spot in your community. Browse restaurants,
          museums, and more.
        </Typography>

        <Stack
          direction="row"
          spacing={1}
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
                onClick={() => setSelectedCategory(category.value)}
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
          <Box
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

                  {place.rating && (
                    <Typography variant="body2" sx={{ marginTop: 2 }}>
                      Rating: {place.rating}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default DiscoverPage;
