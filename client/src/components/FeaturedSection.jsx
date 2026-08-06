import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from "@mui/material";
import { Link } from "react-router";

const choices = [
  {
    heading: "Discover",
    subtitle: "Local businesses",
    path: "/discover",
    background: "#7aa664",
  },
  {
    heading: "Connect",
    subtitle: "Events in your area",
    path: "/connect",
    background: "#f2a840",
  },
];

function FeaturedSection() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 340px)",
          sm: "repeat(2, minmax(0, 320px))",
        },
        justifyContent: "center",
        gap: 3,
        width: "100%",
        margin: "0 auto",
      }}
    >
      {choices.map((choice) => (
        <Card
          key={choice.heading}
          sx={{
            width: "100%",
            borderRadius: 3,
            backgroundColor: choice.background,
            color: "#3c3546",
            boxShadow: "0 5px 14px rgba(60, 53, 70, 0.14)",
          }}
        >
          <CardActionArea
            component={Link}
            to={choice.path}
            sx={{
              minHeight: 210,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <CardContent>
              <Typography variant="h4" component="h2" fontWeight={700}>
                {choice.heading}
              </Typography>

              <Typography variant="body1" sx={{ marginTop: 1 }}>
                {choice.subtitle}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
}

export default FeaturedSection;