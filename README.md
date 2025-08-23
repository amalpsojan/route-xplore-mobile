## 🌍 RouteXplore — Mobile (Expo) Frontend

Discover tourist spots along your journey.

This is the React Native (Expo) frontend for RouteXplore. It pairs with the RouteXplore backend to let you paste a Google Maps route link, discover attractions along the way using open data, select what you like, and generate a shareable route link with waypoints.

### ✨ What this app does
- **Paste a Google Maps route link**
- **Query attractions** along your route via the backend (Overpass API / Google Places as configured server‑side)
- **Select places** you want to visit
- **Generate** a Google Maps link with those places as waypoints
- **Share or open** the route instantly in Google Maps

### 🧱 Tech stack (Frontend)
- **Expo 53** + **React Native 0.79**
- **Expo Router** for file‑based navigation (`app/`)
- **react-native-maps** with **OpenStreetMap tiles** (no Apple/Google basemap)
- **@tanstack/react-query** for data fetching and caching
- **axios** for HTTP requests

### 📁 Project structure
- `app/` — screens using Expo Router
  - `_layout.tsx` — navigation stack
  - `index.tsx` — map screen (OpenStreetMap via `UrlTile`)
- `app.json` — Expo config

### 🚀 Getting started
1) Prerequisites
- Node.js 18+
- Yarn
- Xcode (for iOS) / Android Studio (for Android)
- Expo Go app (optional for device testing)

2) Install dependencies
```bash
yarn install
```

3) Configure environment
- Set the backend base URL so the app can call the API. Use Expo public env vars (available at runtime):
```bash
# .env (loaded by Expo), or your shell env
EXPO_PUBLIC_API_BASE_URL=https://your-backend.example.com
```

Alternatively, add to `app.json` under `expo.extra`:
```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_BASE_URL": "https://your-backend.example.com"
    }
  }
}
```

4) Run the app
```bash
yarn start        # choose a platform in the Expo UI
yarn ios          # iOS simulator
yarn android      # Android emulator
yarn web          # Web preview (map support is limited)
```

### 🗺 Maps: OpenStreetMap only
- The app uses `react-native-maps` with `mapType="none"` and an `UrlTile` pointing to OSM: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`.
- **Attribution** is shown on-screen: “© OpenStreetMap contributors”. This is required by the ODbL license.
- Production note: OSM’s public tile servers have a [Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/). For non‑trivial traffic you should use a commercial provider (e.g., MapTiler, Mapbox raster OSM) or host tiles yourself.

### 🔌 Backend integration
The mobile app expects a backend that provides the following endpoints (paths may vary by deployment):
- `GET /health` — Health check
- `POST /api/parse-link` — Extract start, end, and optional waypoints from a Google Maps URL
- `GET /api/places?start=...&end=...` — Fetch attractions between two points
- `POST /api/generate-route` — Create a Google Maps link with optional waypoints

Configure the base URL via `EXPO_PUBLIC_API_BASE_URL`. Typical flow in the app:
1) User pastes a Google Maps link → call `/api/parse-link`
2) Use parsed start/end to call `/api/places`
3) User selects places → call `/api/generate-route`
4) Present a shareable/openable Google Maps URL

### ⚙️ Permissions
- Location permissions are optional for browsing but recommended for a better UX (e.g., centering map). Expo handles the request flow; enable device location to test.
- Android network access permission is required (enabled by default in Expo builds).

### 🧪 Development tips
- If tiles don’t render, ensure the device/emulator has internet access and the URL uses HTTPS.
- Web support in `react-native-maps` is limited; prefer iOS/Android for map testing.
- If OSM tiles load slowly, consider switching to a dedicated tile provider.

### 🗺 Roadmap (Frontend)
- Paste-link screen and validation
- Attractions preview along the route with map markers
- Selection UI and saved choices
- Generate and share route link
- Polishing: loading states, errors, offline hints

### 🤝 Contributing
1) Fork the repo
2) Create a feature branch: `git checkout -b feature/new-feature`
3) Commit: `git commit -m "Add new feature"`
4) Push: `git push origin feature/new-feature`
5) Open a Pull Request

### 📜 License
This project is licensed under the PolyForm Noncommercial License 1.0.0.

- Non-commercial use: permitted under the license.
- Commercial use: requires a commercial license. See `COMMERCIAL-LICENSE.md`.

See `LICENSE` for the full text. Learn more on the PolyForm site: [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/)

