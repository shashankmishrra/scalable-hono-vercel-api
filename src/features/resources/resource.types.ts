import type { z } from "zod";

import type { createResourceSchema, listResourcesSchema, updateResourceSchema } from "./resource.schema";

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ListResourcesParams = z.infer<typeof listResourcesSchema>;

export type { Resource, NewResource } from "@/db/schema/resources";
