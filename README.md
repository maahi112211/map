# OpenOne Map — Next.js

The map feature from your app designs: **stories, chits, hashtag chats, friends and places** on one map, plus search, filters, place pages, story/chit viewers and the report flow. Map, places and routing are free and need **no API key**.

| What | Source | Key? |
|---|---|---|
| Map tiles | CARTO Voyager (default), OpenStreetMap, Esri satellite — via Leaflet | No |
| Nearby places, place details, hours | OpenStreetMap Overpass | No |
| Place text search | OpenStreetMap Nominatim | No |
| Route + ETA | OSRM (routing.openstreetmap.de) | No |
| Stories, chits, hashtags, people, ratings, place photos, "friends visited" | **Your app** (sample data now → your backend later) | — |

If a free service is unreachable, the app falls back to sample places / straight-line ETAs so screens keep working.

## Run

```bash
npm install
cp .env.example .env.local   # set OSM_USER_AGENT to your app name + contact email
npm run dev                  # http://localhost:3000
```

Location only works on **https or localhost**. For a phone test, deploy (Vercel: import the repo → Deploy) and open the `https://…vercel.app` link.

## Screens (numbering follows your design file)

| # | Screen | Route |
|---|---|---|
| 01 | Location permission | `/` |
| 03 | Discovery map — Story (Peoples / #Hashtags toggle), Chits, Chats, Friends, Places modes; map style sheet; locate | `/map` |
| — | Hashtag card (#topkapi museum: Join / View) | `/map` → Chats → tap |
| — | Profile card (Follow / Message / View Full Profile) | `/map` → Friends → tap |
| — | Place card on map (hours, Save / View) | `/map` → Places → tap |
| 04 | Search entry (Recent, Trending nearby) | `/search` |
| 05 | Active search (Top matches: category, place, hashtag, person) | `/search` while typing |
| 06 | Grouped results + Places / People / Chits / Hashtags lists | `/search/results?q=cafe` |
| 07 | Results map (rating pins, Open now / Top rated / Under 2 km) | `…&view=map` |
| 08 | Categories & filters (category, distance, rating, open now/late, popular with friends) | `/search/filters` |
| 11 | Place result — "Coffee nearby" | `/search/results?q=Coffee&cat=coffee&view=map` |
| 12 | Place detail | `/place/[id]` |
| — | Story viewer | `/story/[id]` |
| 16 | Story actions (Report / Mute / Unfollow) | story → ••• |
| 17 | Report confirmation | story → ••• → Report |
| — | Chit viewer (reel style, swipe up for next) | `/chit/[id]` |
| — | Hashtag page | `/tag/[tag]` |
| — | Full profile | `/u/[username]` |
| 18 | No results | results with nothing found |
| 19 | Recoverable error (Try again / Continue with saved results) | results when the network fails |
| — | Directions | `/directions?to=lat,lng` |

Bottom-nav tabs other than **#** (Home, Chats, Notifications, Profile) open a placeholder at `/tab/*` — those live in your main app.

## Connecting your backend

Everything app-side goes through **`lib/data/app-data.ts`**. Set `APP_API_URL` in `.env.local`; responses must match `lib/types.ts`:

```
GET  /feed?lat&lng                      -> { stories, chits, people, hashtags }
GET  /stories/:id                       -> Story & { next: string[] }
GET  /chits/:id                         -> Chit & { next: string[], more: Chit[] }
GET  /hashtags/:tag?lat&lng             -> { hashtag, chits, stories }
GET  /users/:username                   -> { user, chits }
GET  /search?q&lat&lng                  -> { people, hashtags, chits }
POST /places/community { ids }          -> { [placeId]: { rating, reviews, photos, friendsVisited } }
POST /reports { type, id, reason }      -> { ok: true }
```

Backend tips:
- Save `lat/lng` (and the `placeId` the user tagged) on every story/chit. Use a geo index (PostGIS `ST_DWithin` or MongoDB `2dsphere`) for "near me".
- Ratings, reviews, photos and "friends visited" are your community's data — OSM has none of these.
- Only return people who **opted in** to sharing location, and only to people they allow.
- Media: send real `mediaUrl` / `avatarUrl`. The sample data uses picsum.photos and DiceBear placeholders.

## Before launch — free service limits

- **Tiles**: CARTO/OSM/Esri free tiles have fair-use limits. For real traffic use a tile plan (MapTiler, Stadia, CARTO) or self-host; change URLs in `lib/mapStyles.ts`.
- **Nominatim**: max 1 req/s with a real User-Agent. Search is debounced; self-host or use a hosted geocoder at scale.
- **Overpass**: shared server; results are cached 10 min per area in `lib/data/places.ts`.
- **OSRM demo**: not for heavy production use.
- Keep the map attribution visible (already shown).
- Want Google Places later? Re-implement `getNearbyPlaces`, `searchPlaces`, `getPlace` in `lib/data/places.ts` — nothing else changes.

## Layout

```
app/                    screens (see table) + api/* route handlers
components/             MapCanvas (Leaflet), sheets, ResultRows, ReportFlow, SearchBar, ui
lib/data/app-data.ts    ← your backend goes here
lib/data/places.ts      ← OSM places (or Google later)
lib/data/mock.ts        sample users, stories, chits, hashtags, places
lib/markers.ts          map marker HTML + clustering
lib/hours.ts            opening_hours parser (Open now / Closes 11 PM / Open late)
lib/filters.ts          filter <-> URL params
lib/useApi.ts           fetch + "last saved results" cache
lib/useLocation.ts      permission + live location
```
