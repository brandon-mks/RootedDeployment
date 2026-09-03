import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import client from "./db/client.js";
import seed from "./db/seed.js";
import router from "./api/index.js";
const app = express();
//body parsing middleware

const allowedOrigins = [
  "http://localhost:5173",
  "https://rooted-portfolio.netlify.app",
  "https://server-o0qo.onrender.com",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

//for deployment only
const __dirname = import.meta.dirname;

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../client/dist/index.html")));
app.use("/assets", express.static(path.join(__dirname, "../client/dist/assets")));

//use api routes
app.use("/api", router);

//express routes catch all
app.use("/{*path}", (req, res, next) => {
  res.status(404).send("Incorrect resource request");
});

//custom error handling route
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message ? err.message : err });
});

const init = async () => {
  const PORT = process.env.PORT || 3000;
  // The Places fixture does not require a database connection.
  // Connect and seed only when a database URL has been configured.
  if (process.env.EXTERNAL_DATABASE || process.env.DATABASE_URL) {
    try {
      await client.connect();
      console.log("connected to database");
      if (process.env.SEED_DATABASE === "true") {
        await seed();
        console.log("database seed completed");
      } else {
        console.log("database seeding skipped");
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    console.log("DATABASE_URL is not configured; starting without database access");
  }

  app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
  });
};

init();
