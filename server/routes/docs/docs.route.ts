import { Hono } from "hono";
import { openApiSpec } from "@/server/lib/openapi";

const router = new Hono();

/**
 * Serve OpenAPI JSON specification
 * GET /api/openapi.json
 */
router.get("/openapi.json", (c) => {
  return c.json(openApiSpec);
});

/**
 * Serve Swagger UI HTML
 * GET /api/docs
 */
router.get("/", (c) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xylvir API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body {
      margin: 0;
      padding: 0;
    }
    .swagger-ui .topbar {
      display: none;
    }
    .swagger-ui .info {
      margin: 30px 0;
    }
    .swagger-ui .info hgroup.main {
      margin: 0 0 20px;
    }
    .swagger-ui .info .title {
      font-size: 32px;
      font-weight: 700;
    }
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      body {
        background: #1a1a2e;
      }
      .swagger-ui {
        filter: invert(88%) hue-rotate(180deg);
      }
      .swagger-ui .model-box,
      .swagger-ui section.models {
        filter: invert(100%) hue-rotate(180deg);
      }
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
      });
    };
  </script>
</body>
</html>
  `.trim();

  return c.html(html);
});

export default router;
