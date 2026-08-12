# Rooted

Rooted is a community discovery application for finding local businesses, restaurants, events, and other nearby experiences.

## Requirements

Install these before starting:

* Node.js and npm
* PostgreSQL
* Git

## 1. Clone and install

From the repository root:

```bash
npm install
cd client
npm install
cd ..
```

## 2. Create the local database

Create a PostgreSQL database named `rooted`:

```bash
createdb rooted
```

Alternatively:

```bash
psql
```

Then inside PostgreSQL:

```sql
CREATE DATABASE rooted;
```

Exit with:

```text
\q
```

## 3. Configure environment variables

Create a `.env` file in the repository root:

```dotenv
PORT=3000
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/rooted
JWT=replace_with_a_local_secret
```

Update the database username and password for your local PostgreSQL installation.

Do not commit `.env`. Each developer needs their own local configuration.

## 4. Start the backend

Open a terminal in the repository root:

```bash
npm run start:dev
```

The Express API should run at:

```text
http://localhost:3000
```

A successful startup should report that the database connected and the server is listening on port `3000`.

Leave this terminal running.

## 5. Start the frontend

Open a second terminal:

```bash
cd client
npm run dev
```

The Vite frontend should run at:

```text
http://localhost:5173
```

Leave this terminal running too.

The frontend proxies `/api` requests to the backend on port `3000`. If the ports do not match, API requests will fail with `ECONNREFUSED`.

## 6. Test the API

With the backend running:

```bash
curl "http://localhost:3000/api/places?category=restaurants&limit=2"
```

The response should contain JSON place records.

## Available place categories

```text
restaurants
museums
hiking_areas
book_stores
farmers_markets
live_music_venues
```

Example:

```text
http://localhost:3000/api/places?category=museums&limit=6
```

## Build the frontend

```bash
cd client
npm run build
```

To inspect the production frontend build locally:

```bash
npm run preview
```

The backend must still be running for API-powered features.

## Deployment

Install dependencies and build the frontend:

```bash
npm install
cd client
npm install
npm run build
```

Start the backend:

```bash
node server/index.js
```

Configure these environment variables in the deployment platform:

```text
PORT
DATABASE_URL
JWT
```

Never commit production credentials or local `.env` files.