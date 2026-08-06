import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Typography,
} from "@mui/material";

function FeaturedSection({ items = [], loading = false }) {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2].map((placeholder) => (
          <Grid key={placeholder} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <Skeleton variant="rectangular" height={160} />

              <CardContent>
                <Skeleton width="30%" />
                <Skeleton width="75%" height={36} />
                <Skeleton width="100%" />
                <Skeleton width="60%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {items.map((item) => (
        <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            {item.imageUrl && (
              <Box
                component="img"
                src={item.imageUrl}
                alt=""
                sx={{
                  display: "block",
                  width: "100%",
                  height: 160,
                  objectFit: "cover",
                }}
              />
            )}

            <CardContent>
              <Chip label={item.type} size="small" />

              <Typography variant="h6" component="h2" sx={{ mt: 1 }}>
                {item.name}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>

              <Typography variant="caption">
                {item.location}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default FeaturedSection;