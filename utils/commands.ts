export type Command = {
  prefix: string;
  transform: (input: string) => string;
};

export const COMMANDS: Record<string, Command> = {
  "/task": {
    prefix: "I want to create a new task: ",
    transform: (input: string) => input.replace("/task", "").trim(),
  },
  "/list": {
    prefix:
      "Make a list of all my tasks, starting with the ones that have priority",
    transform: (input: string) => "", // We don't need any additional text for this command
  },
  "/all": {
    prefix:
      "Make a list of all my tasks, starting with the ones that have priority",
    transform: (input: string) => "", // We don't need any additional text for this command
  },
  "/new": {
    prefix: "I want to create a new task: ",
    transform: (input: string) => input.replace("/new", "").trim(),
  },
  "/create": {
    prefix: "I want to create a new task: ",
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
