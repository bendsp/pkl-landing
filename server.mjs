import { createReadStream, existsSync, statSync } from "node:fs"
import http from "node:http"
import path from "node:path"

const PORT = Number(process.env.PORT ?? 3000)
const HOST = "0.0.0.0"
const ROOT = path.join(import.meta.dirname, "public")

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
    response.writeHead(200, {
      "content-type": CONTENT_TYPES[extension] ?? "application/octet-stream",
      "cache-control":
        extension === ".html" ? "no-cache" : "public, max-age=3600",
    })
    createReadStream(filePath).pipe(response)
  })
  .listen(PORT, HOST, () => {
    console.log(`pkl-landing listening on ${HOST}:${PORT}`)
  })
