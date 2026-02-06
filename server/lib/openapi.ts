import type { OpenAPIV3 } from "openapi-types";

/**
 * OpenAPI specification for the Xylvir API
 * This is automatically served at /api/docs and /api/openapi.json
 */
export const openApiSpec: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "Xylvir API",
    version: "0.1.0",
    description: "REST API documentation for Xylvir application",
    contact: {
      name: "API Support",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "/api",
      description: "API Base URL",
    },
  ],
  tags: [
    {
      name: "Auth",
      description: "Authentication endpoints (Better Auth)",
    },
    {
      name: "Health",
      description: "Health check endpoints",
    },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description: "Returns the health status of the API",
        operationId: "healthCheck",
        responses: {
          "200": {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    timestamp: { type: "string", format: "date-time" },
                    uptime: { type: "number", description: "Server uptime in seconds" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/sign-up/email": {
      post: {
        tags: ["Auth"],
        summary: "Sign up with email",
        description: "Create a new user account with email and password",
        operationId: "signUpEmail",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  name: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "User created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/auth/sign-in/email": {
      post: {
        tags: ["Auth"],
        summary: "Sign in with email",
        description: "Authenticate a user with email and password",
        operationId: "signInEmail",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Authentication successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/auth/sign-out": {
      post: {
        tags: ["Auth"],
        summary: "Sign out",
        description: "Sign out the current user and invalidate the session",
        operationId: "signOut",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Successfully signed out",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/session": {
      get: {
        tags: ["Auth"],
        summary: "Get current session",
        description: "Returns the current user session if authenticated",
        operationId: "getSession",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Session found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Session" },
              },
            },
          },
          "401": {
            description: "Not authenticated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "better-auth.session_token",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          image: { type: "string", nullable: true },
          emailVerified: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Session: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          session: {
            type: "object",
            properties: {
              id: { type: "string" },
              userId: { type: "string" },
              expiresAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          session: {
            type: "object",
            properties: {
              id: { type: "string" },
              token: { type: "string" },
              expiresAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
          status: { type: "integer" },
          details: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },
  },
};

/**
 * Helper to add new paths to the OpenAPI spec dynamically
 * Use this when registering new routes
 */
export function addOpenApiPath(path: string, pathItem: OpenAPIV3.PathItemObject): void {
  openApiSpec.paths[path] = pathItem;
}

/**
 * Helper to add new schemas to the OpenAPI spec dynamically
 */
export function addOpenApiSchema(name: string, schema: OpenAPIV3.SchemaObject): void {
  if (!openApiSpec.components) {
    openApiSpec.components = { schemas: {} };
  }
  if (!openApiSpec.components.schemas) {
    openApiSpec.components.schemas = {};
  }
  openApiSpec.components.schemas[name] = schema;
}
