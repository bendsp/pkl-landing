# PKL Landing

Marketing/download page for PKL (https://pkl.desprets.net), served by a
dependency-free Node static server on Railway.

- Edit `public/index.html` / `public/styles.css` — no build step.
- Deploys automatically from `main` via Railway.
- Download links point at the app backend's `/api/download/<platform>`
  endpoints, which redirect to the latest GitHub release in
  [pkl-releases](https://github.com/bendsp/pkl-releases).

Run locally: `npm start` then open http://localhost:3000.
