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
    title: "Find your kind of local.",
    subtitle: "Local businesses",
    action: "Start exploring",
    path: "/discover",
    cardClass: "discover-card",
  },
  {
    heading: "Connect",
    title: "See what’s happening nearby.",
    subtitle: "Events in your area",
    action: "Join an event",
    path: "/connect",
    cardClass: "connect-card",
  },
];

function FeaturedSection() {
  return (
    <Box className="bulletin-board">
      {choices.map((choice) => (
        <Card
          key={choice.heading}
          className={`bulletin-card ${choice.cardClass}`}
        >
          <span className="pushpin" aria-hidden="true" />

          <CardActionArea
            component={Link}
            to={choice.path}
            className="bulletin-card-action"
          >
            <CardContent className="bulletin-card-content">
              <Typography className="bulletin-card-label" component="p">
                {choice.heading}
              </Typography>

              <Typography className="bulletin-card-title" component="h3">
                {choice.title}
              </Typography>

              <Typography className="bulletin-card-subtitle" component="p">
                {choice.subtitle}
              </Typography>

              <Typography className="bulletin-card-link" component="span">
                {choice.action} →
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
}

export default FeaturedSection;