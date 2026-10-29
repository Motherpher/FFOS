import { readFileSync, writeFileSync } from "node:fs";
const url = new URL(process.argv[2] ?? "");
if (
  url.protocol !== "https:" ||
  url.hostname.endsWith(".invalid") ||
  url.username ||
  url.password
)
  throw new Error("Provide the verified HTTPS /mcp endpoint.");
const config = JSON.parse(readFileSync("plugin/mcp.template.json", "utf8"));
config.mcpServers["household-family"].url = url.toString();
writeFileSync("plugin/mcp.json", JSON.stringify(config, null, 2) + "\n");
console.log(
  "Plugin connection metadata written. This does not register or connect a ChatGPT plugin.",
);
