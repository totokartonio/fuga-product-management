import { z } from "zod";
import {
  createProductSchema,
  updateProductSchema,
  productResponseSchema,
  createArtistSchema,
  artistResponseSchema,
} from "@fuga/shared";

const toSchema = (s: z.ZodType) =>
  z.toJSONSchema(s, { target: "openapi-3.0", unrepresentable: "any" });

const errorResponse = {
  description: "Error",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              fields: {
                type: "object",
                additionalProperties: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
};

export const openApiDocument = {
  openapi: "3.0.0",
  info: {
    title: "FUGA Product Catalog API",
    version: "1.0.0",
    description:
      "Product (album) catalog management with cover art upload and multi-artist credits. " +
      "Cross-field rules (an artist cannot be both main and featured; featured artists must be unique) " +
      "are enforced at runtime and not expressed in these schemas.",
  },
  servers: [{ url: "/api" }],
  components: {
    schemas: {
      CreateProduct: toSchema(createProductSchema),
      UpdateProduct: toSchema(updateProductSchema),
      ProductResponse: toSchema(productResponseSchema),
      CreateArtist: toSchema(createArtistSchema),
      ArtistResponse: toSchema(artistResponseSchema),
    },
  },
  paths: {
    "/products": {
      get: {
        summary: "List all products",
        responses: {
          "200": {
            description: "All products, newest first",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ProductResponse" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a product",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/CreateProduct" },
                  {
                    type: "object",
                    properties: {
                      cover: {
                        type: "string",
                        format: "binary",
                        description: "Cover image (JPEG/PNG/WebP, ≤5MB)",
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductResponse" },
              },
            },
          },
          "400": errorResponse,
          "415": errorResponse,
        },
      },
    },
    "/products/{id}": {
      patch: {
        summary: "Update a product",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/UpdateProduct" },
                  {
                    type: "object",
                    properties: {
                      cover: { type: "string", format: "binary" },
                      removeCover: { type: "boolean" },
                    },
                  },
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductResponse" },
              },
            },
          },
          "400": errorResponse,
          "404": errorResponse,
          "415": errorResponse,
        },
      },
      delete: {
        summary: "Delete a product",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": { description: "Deleted" },
          "404": errorResponse,
        },
      },
    },
    "/artists": {
      get: {
        summary: "List or search artists",
        parameters: [
          {
            name: "search",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Case-insensitive substring match on artist name",
          },
        ],
        responses: {
          "200": {
            description: "Matching artists, alphabetical",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ArtistResponse" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create an artist",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateArtist" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ArtistResponse" },
              },
            },
          },
          "400": errorResponse,
        },
      },
    },
  },
};
