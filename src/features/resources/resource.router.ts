import { Hono } from "hono";

import { resourceController } from "./resource.controller";

export const resourceRouter = new Hono()
  .get("/", resourceController.list)
  .post("/", resourceController.create)
  .get("/:id", resourceController.get)
  .patch("/:id", resourceController.update)
  .delete("/:id", resourceController.remove);
