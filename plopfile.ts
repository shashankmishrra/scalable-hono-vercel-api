import type { NodePlopAPI } from "plop";

function singularize(value: string): string {
  if (value.endsWith("ies")) {
    return `${value.slice(0, -3)}y`;
  }
  if (/(?:s|x|z|ch|sh)es$/.test(value)) {
    return value.slice(0, -2);
  }
  if (value.endsWith("s")) {
    return value.slice(0, -1);
  }
  return value;
}

export default function resourceGenerator(plop: NodePlopAPI) {
  plop.setHelper("singular", (value: string) => singularize(value));

  plop.setGenerator("resource", {
    description: "Scaffold a new resource feature (schema, model, service, controller, router)",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Feature name (plural, e.g. users):",
        validate: (value: string) => (value.trim().length > 0 ? true : "A name is required"),
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/features/{{name}}/{{singular name}}.schema.ts",
        templateFile: "templates/feature/resource/schema.ts.hbs",
      },
      {
        type: "add",
        path: "src/features/{{name}}/{{singular name}}.model.ts",
        templateFile: "templates/feature/resource/model.ts.hbs",
      },
      {
        type: "add",
        path: "src/features/{{name}}/{{singular name}}.service.ts",
        templateFile: "templates/feature/resource/service.ts.hbs",
      },
      {
        type: "add",
        path: "src/features/{{name}}/{{singular name}}.controller.ts",
        templateFile: "templates/feature/resource/controller.ts.hbs",
      },
      {
        type: "add",
        path: "src/features/{{name}}/{{singular name}}.router.ts",
        templateFile: "templates/feature/resource/router.ts.hbs",
      },
    ],
  });
}
