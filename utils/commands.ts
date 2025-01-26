export type Command = {
  prefix: string;
  transform: (input: string) => string;
};

export const COMMANDS: Record<string, Command> = {
  "/task": {
    prefix: "List my current tasks and their status.",
    transform: (input: string) => "", // Empty string since we just want to list tasks
  },
  "/list": {
    prefix: "List all my current tasks. Do not create any new tasks.",
    transform: (input: string) => "", // Empty string since we just want to list tasks
  },
  "/all": {
    prefix: "List all my current tasks. Do not create any new tasks.",
    transform: (input: string) => "", // Empty string since we just want to list tasks
  },
  "/new": {
    prefix: "Create a new task with the following details: ",
    transform: (input: string) => input.replace("/new", "").trim(),
  },
  "/create": {
    prefix: "Create a new task with the following details: ",
    transform: (input: string) => input.replace("/create", "").trim(),
  },
};

export const processCommandInput = (input: string): string => {
  const command = Object.entries(COMMANDS).find(([cmd]) =>
    input.startsWith(cmd),
  );

  if (command) {
    const [_, { prefix, transform }] = command;
    return prefix + transform(input);
  }

  return input;
};
