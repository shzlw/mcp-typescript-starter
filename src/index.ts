import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "my-mcp-server",
  version: "1.0.0",
});

server.registerTool(
  "hello",
  {
    description: "Says hello to a name",
    inputSchema: { name: z.string().describe("Name to greet") },
  },
  async ({ name }) => ({
    content: [{ type: "text", text: `Hello, ${name}!` }],
  })
);

// Tool API call example
server.registerTool(
  "get-users",
  {
    description: "Fetches all users from the API",
    inputSchema: {},
  },
  async () => {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    const users = await response.json();
    return {
      content: [{ type: "text", text: JSON.stringify(users, null, 2) }],
    };
  }
);

// A resource is static/dynamic data the LLM can READ (like a file or DB record)
server.registerResource(
  "config",                          // resource name
  "app://config",                    // URI the LLM uses to refer to it
  {
    description: "Current app configuration",
    mimeType: "application/json",
  },
  async () => ({
    contents: [
      {
        uri: "app://config",
        text: JSON.stringify({ env: "development", version: "1.0.0" }, null, 2),
      },
    ],
  })
);

// A prompt is a reusable message template the LLM can invoke
server.registerPrompt(
  "code-review",                     // prompt name
  {
    description: "Reviews code and suggests improvements",
    argsSchema: { code: z.string().describe("Code to review") },
  },
  async ({ code }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please review this code and suggest improvements:\n\n${code}`,
        },
      },
    ],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);