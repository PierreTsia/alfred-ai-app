
export const processCommandInput = (input: string) => {
  const command = input.split(" ")[0];
  const content = input.slice(command.length).trim();

  switch (command) {
    case "/task":
      return {
        type: "task",
        content,
      };
    case "/list":
      return {
        type: "list",
        content,
      };
    default:
      return {
        type: "chat",
        content: input,
      };
  }
}; 