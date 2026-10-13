import { z } from "zod";

const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and hyphens only");

export const resourceStatusSchema = z.enum(["pending", "completed", "failed"]);

export const createResourceSchema = z.object({
  name: z.string().min(1).max(200),
  slug: slugSchema,
});

export const updateResourceSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    slug: slugSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const resourceIdSchema = z.object({
  id: z.string().uuid(),
});

export const listResourcesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z
    .enum([
      "name:asc",
      "name:desc",
      "slug:asc",
      "slug:desc",
      "status:asc",
      "status:desc",
      "created_at:asc",
      "created_at:desc",
    ])
    .optional(),
  status: resourceStatusSchema.optional(),
  q: z.string().max(200).optional(),
});
