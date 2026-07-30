import json
import os
import sys

from mcp.server.fastmcp import FastMCP
from servicetrade import ServicetradeClient

mcp = FastMCP("servicetrade")


def _client() -> ServicetradeClient:
    client_id = os.environ.get("SERVICETRADE_CLIENT_ID")
    client_secret = os.environ.get("SERVICETRADE_CLIENT_SECRET")
    if not client_id or not client_secret:
        print(
            "SERVICETRADE_CLIENT_ID and SERVICETRADE_CLIENT_SECRET must be set",
            file=sys.stderr,
        )
        sys.exit(1)
    return ServicetradeClient(
        client_id=client_id,
        client_secret=client_secret,
        base_url="https://app.servicetrade.com",
    )


_st = _client()


@mcp.tool()
def st_get(path: str, params: dict | None = None) -> str:
    """Call a ServiceTrade API GET endpoint, e.g. path='/job' or '/customer/123'.

    params is an optional dict of query parameters (e.g. status, locationId, page).
    """
    result = _st.get(path, params=params or {})
    return json.dumps(result, default=str)


@mcp.tool()
def st_post(path: str, data: dict) -> str:
    """Call a ServiceTrade API POST endpoint to create a resource, e.g. path='/job'."""
    result = _st.post(path, data)
    return json.dumps(result, default=str)


@mcp.tool()
def st_put(path: str, data: dict) -> str:
    """Call a ServiceTrade API PUT endpoint to update a resource, e.g. path='/job/123'."""
    result = _st.put(path, data)
    return json.dumps(result, default=str)


@mcp.tool()
def st_delete(path: str) -> str:
    """Call a ServiceTrade API DELETE endpoint, e.g. path='/job/123'."""
    result = _st.delete(path)
    return json.dumps(result, default=str)


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()
