/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as documents from "../documents.js";
import type * as documents_internal from "../documents_internal.js";
import type * as files from "../files.js";
import type * as internal_migrations from "../internal/migrations.js";
import type * as tasks from "../tasks.js";
import type * as together_ai_embeddings from "../together_ai_embeddings.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  documents: typeof documents;
  documents_internal: typeof documents_internal;
  files: typeof files;
  "internal/migrations": typeof internal_migrations;
  tasks: typeof tasks;
  together_ai_embeddings: typeof together_ai_embeddings;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
