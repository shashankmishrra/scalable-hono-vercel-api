import type { Context } from "hono";

import { parse } from "@/lib/validation";

import { createResourceSchema, listResourcesSchema, resourceIdSchema, updateResourceSchema } from "./resource.schema";
import { resourceService } from "./resource.service";

export const resourceController = {
  async create(c: Context) {
    const input = await parse(createResourceSchema, c.req, "json");
    const resource = await resourceService.create(input);
    return c.json({ data: resource }, 201);
  },

  async list(c: Context) {
    const params = await parse(listResourcesSchema, c.req, "query");
    const result = await resourceService.list(params);
    return c.json(result);
  },

  async get(c: Context) {
    const { id } = await parse(resourceIdSchema, c.req, "param");
    const resource = await resourceService.get(id);
    return c.json({ data: resource });
  },

  async update(c: Context) {
    const { id } = await parse(resourceIdSchema, c.req, "param");
    const input = await parse(updateResourceSchema, c.req, "json");
    const resource = await resourceService.update(id, input);
    return c.json({ data: resource });
  },

  async remove(c: Context) {
    const { id } = await parse(resourceIdSchema, c.req, "param");
    const resource = await resourceService.remove(id);
    return c.json({ data: resource });
  },
};
