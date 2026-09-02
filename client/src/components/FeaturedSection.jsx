import { Box, Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { Link } from "react-router";

import discoverImage from "../assets/discover.jpg";
import connectImage from "../assets/connect.jpg";
import communityFlyer from "../assets/community-flyer.png";
import orangePushpin from "../assets/pushpin-orange.png";

const choices = [
  {
    heading: "Discover",
    title: "Find your kind of local.",
    subtitle: "Local businesses",
    action: "Start exploring",
    path: "/discover",
    cardClass: "discover-card",
    image: discoverImage,
    imageAlt: "A map, coffee, and a traveler planning where to explore",
  },
  {
    heading: "Connect",
    title: "See what’s happening nearby.",
    subtitle: "Events in your area",
    action: "Join an event",
    path: "/connect",
    cardClass: "connect-card",
    image: connectImage,
    imageAlt: "Community members joining their hands together",
  },
];

function FeaturedSection() {
  return (
    <Box className="bulletin-board">
      {choices.map((choice) => (
        <Card key={choice.heading} className={`bulletin-card ${choice.cardClass}`}>
          <span className="pushpin" aria-hidden="true" />

          <CardActionArea component={Link} to={choice.path} className="bulletin-card-action">
            <img
              src={choice.image}
              alt={choice.imageAlt}
              className="bulletin-card-image"
              draggable="false"
            />

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

      <Link
        to="/register"
        className="community-flyer-link"
        aria-label="Create a Rooted account. Save favorites, create events, and connect locally."
      >
        <img
          src={orangePushpin}
          alt=""
          aria-hidden="true"
          className="community-flyer-pushpin"
          draggable="false"
        />
        <img
          src={communityFlyer}
          alt=""
          aria-hidden="true"
          className="community-flyer-image"
          draggable="false"
        />
      </Link>
    </Box>
  );
}

export default FeaturedSection;
