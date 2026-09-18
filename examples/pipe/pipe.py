"""TCP<->WebSocket byte pipe. Same contract as bin/havi-pipe.js:

    ws://127.0.0.1:8788/?host=<camera>&port=<port>

    pip install websockets
    python pipe.py [--host 127.0.0.1] [--port 8788] [--allow cam:554,cam2:7542]

For a single fixed target, websockify does the same job: websockify 8788 camera:554
"""
import argparse
import asyncio
from urllib.parse import parse_qs, urlparse

import websockets


def parse_target(ws):
    path = getattr(getattr(ws, "request", None), "path", None) or getattr(ws, "path", "")
    q = parse_qs(urlparse(path).query)
    host = (q.get("host") or [None])[0]
    port = int((q.get("port") or ["554"])[0])
    return host, port


async def pump_tcp_to_ws(reader, ws):
    while True:
        data = await reader.read(64 * 1024)
        if not data:
            break
        await ws.send(data)


async def pump_ws_to_tcp(ws, writer):
    async for msg in ws:
        writer.write(msg if isinstance(msg, bytes) else msg.encode("latin-1"))
        await writer.drain()


def make_handler(allow):
    async def handler(ws):
        host, port = parse_target(ws)
        if not host:
            await ws.close(1008, "host and port required")
            return
        if allow and f"{host}:{port}" not in allow:
            await ws.close(1008, "target not allowed")
            return
        try:
            reader, writer = await asyncio.open_connection(host, port)
        except OSError as exc:
            await ws.close(1011, str(exc))
            return
        print(f"[pipe] open  {host}:{port}", flush=True)
        try:
            await asyncio.gather(pump_tcp_to_ws(reader, ws), pump_ws_to_tcp(ws, writer))
        except Exception:
            pass
        finally:
            writer.close()
            await ws.close()
            print(f"[pipe] close {host}:{port}", flush=True)

    return handler


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=8788)
    ap.add_argument("--allow", default="")
    args = ap.parse_args()
    allow = {s.strip() for s in args.allow.split(",") if s.strip()} or None
    async with websockets.serve(make_handler(allow), args.host, args.port, max_size=None):
        print(f"[pipe] listening ws://{args.host}:{args.port}/?host={{host}}&port={{port}}", flush=True)
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
