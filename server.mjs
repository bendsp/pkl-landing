import { createReadStream, existsSync, readFileSync, statSync } from "node:fs"
import http from "node:http"
import path from "node:path"

const PORT = Number(process.env.PORT ?? 3000)
const HOST = "0.0.0.0"
const ROOT = path.join(import.meta.dirname, "public")
const ASSET_VERSION = (
  process.env.RAILWAY_GIT_COMMIT_SHA ??
  process.env.RAILWAY_DEPLOYMENT_ID ??
  statSync(path.join(ROOT, "styles.css")).mtimeMs.toString(36)
).slice(0, 16)

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
}

http
  .createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost")
    let filePath = path.normalize(
      path.join(ROOT, decodeURIComponent(url.pathname))
    )

    if (!filePath.startsWith(ROOT)) {
      response.writeHead(403).end()
      return
    }

    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html")
    }

    if (!existsSync(filePath)) {
      // Extensionless paths fall back to the single page; asset typos 404.
      if (path.extname(filePath)) {
        response.writeHead(404, { "content-type": "text/plain" }).end("Not found")
        return
      }
      filePath = path.join(ROOT, "index.html")
    }

    const extension = path.extname(filePath)

    if (extension === ".html") {
      const html = readFileSync(filePath, "utf8").replaceAll(
        "__ASSET_VERSION__",
        ASSET_VERSION
      )
      response.writeHead(200, {
        "content-type": CONTENT_TYPES[extension],
        "cache-control": "no-store, no-cache, must-revalidate",
        "cdn-cache-control": "no-store",
      })
      response.end(html)
      return
    }

    response.writeHead(200, {
      "content-type": CONTENT_TYPES[extension] ?? "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    })
    createReadStream(filePath).pipe(response)
  })
  .listen(PORT, HOST, () => {
    console.log(`pkl-landing listening on ${HOST}:${PORT}`)
  })
