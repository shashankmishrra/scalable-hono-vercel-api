import { isUniqueViolation } from "@/db/errors";
import { ConflictError, NotFoundError } from "@/lib/errors/app-error";

import { resourceCrud } from "./resource.crud";
import { resourceModel } from "./resource.model";
import type { CreateResourceInput, ListResourcesParams, Resource, UpdateResourceInput } from "./resource.types";

export const resourceService = {
  async create(input: CreateResourceInput): Promise<Resource> {
    try {
      return await resourceCrud.create(input);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictError("RESOURCE_SLUG_EXISTS", "A resource with this slug already exists");
      }
      throw error;
    }
  },

  async list(params: ListResourcesParams) {
    return resourceCrud.list({
      page: params.page,
      pageSize: params.pageSize,
      sort: params.sort,
      where: resourceModel.buildListWhere(params),
    });
  },

  async get(id: string): Promise<Resource> {
    const resource = await resourceCrud.get(id);
    if (!resource) {
      throw new NotFoundError("RESOURCE_NOT_FOUND", "Resource not found");
    }
    return resource;
  },

  async update(id: string, input: UpdateResourceInput): Promise<Resource> {
    const existing = await resourceCrud.get(id);
    if (!existing) {
      throw new NotFoundError("RESOURCE_NOT_FOUND", "Resource not found");
    }
    try {
      const updated = await resourceCrud.update(id, input);
      if (!updated) {
        throw new NotFoundError("RESOURCE_NOT_FOUND", "Resource not found");
      }
      return updated;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictError("RESOURCE_SLUG_EXISTS", "A resource with this slug already exists");
      }
      throw error;
    }
  },

  async remove(id: string): Promise<Resource> {
    const resource = await resourceCrud.remove(id);
    if (!resource) {
      throw new NotFoundError("RESOURCE_NOT_FOUND", "Resource not found");
    }
    return resource;
  },

  async findBySlug(slug: string): Promise<Resource> {
    const resource = await resourceModel.findBySlug(slug);
    if (!resource) {
      throw new NotFoundError("RESOURCE_NOT_FOUND", "Resource not found");
    }
    return resource;
  },
};
