# ServiceTrade MCP Server

A minimal MCP server that exposes the ServiceTrade REST API to Claude, built
on the official [`servicetrade`](https://pypi.org/project/servicetrade/)
Python SDK. It authenticates with an OAuth2 client_id/client_secret and
exposes four generic tools (`st_get`, `st_post`, `st_put`, `st_delete`) that
take a ServiceTrade API path, mirroring the SDK's own `get/post/put/delete`
methods so any endpoint in their API is reachable without hardcoding a
wrapper per resource.

## Setup

1. Install dependencies:

   ```
   pip install -e .
   ```

2. Set credentials as environment variables (never commit these):

   ```
   cp .env.example .env
   # edit .env and fill in your real client id/secret
   ```

3. Register the server with Claude Code:

   ```
   claude mcp add servicetrade \
     --env SERVICETRADE_CLIENT_ID=your-client-id \
     --env SERVICETRADE_CLIENT_SECRET=your-client-secret \
     -- python -m servicetrade_mcp.server
   ```

   Or, for Claude Desktop, add to `claude_desktop_config.json`:

   ```json
   {
     "mcpServers": {
       "servicetrade": {
         "command": "python",
         "args": ["-m", "servicetrade_mcp.server"],
         "env": {
           "SERVICETRADE_CLIENT_ID": "your-client-id",
           "SERVICETRADE_CLIENT_SECRET": "your-client-secret"
         }
       }
     }
   }
   ```

## Usage

Once connected, ask Claude things like "list open jobs in ServiceTrade" or
"get customer 456" — it will call `st_get("/job", {...})` /
`st_get("/customer/456")` etc. under the hood.

## Notes

- Credentials are read only from environment variables; they are never
  logged or written to disk by this server.
- The tools are intentionally generic (path-based) rather than one wrapper
  per ServiceTrade resource, matching how the underlying SDK works.
