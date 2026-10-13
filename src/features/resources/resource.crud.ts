import { resources } from "@/db/schema/resources";
import { createCrud } from "@/lib/crud/create-crud";

import { resourceModel } from "./resource.model";
import { createResourceSchema, updateResourceSchema } from "./resource.schema";

export const resourceCrud = createCrud({
  model: resourceModel,
  schema: { create: createResourceSchema, update: updateResourceSchema },
  sortable: {
    name: resources.name,
    slug: resources.slug,
    status: resources.status,
    created_at: resources.created_at,
  },
  defaultSort: { field: "created_at", direction: "desc" },
  defaultPageSize: 20,
  maxPageSize: 100,
});
