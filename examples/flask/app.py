"""Flask host for the browser player. Serves the script and the TCP byte layer.

    pip install flask
    python app.py

No Node. The page remuxes RTSP itself. Flask only dials the camera.
The old remux-in-Node path is still at /stream if you want it.
"""
import json
import os
import shutil
import subprocess
import threading

from flask import Flask, Response, abort, jsonify, render_template, request, send_from_directory

from tcp import TcpLayer

HERE = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.path.join(HERE, "..", "..", "dist"))
REMUX = os.environ.get("HAVI_REMUX", os.path.join(HERE, "..", "..", "bin", "havi-remux.js"))
NODE = os.environ.get("HAVI_NODE") or shutil.which("node") or "node"
INFO_TIMEOUT_S = 15
BIND = os.environ.get("HAVI_BIND", "127.0.0.1")

app = Flask(__name__)
layer = TcpLayer(
    bind_host=BIND,
    allow=os.environ.get("HAVI_TCP_ALLOW"),
    target=os.environ.get("HAVI_TCP_TARGET"),
)


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/havi-rtsp.browser.js")
def bundle():
    return send_from_directory(DIST, "havi-rtsp.browser.js")


@app.get("/havi-rtsp.browser.js.map")
def bundle_map():
    return send_from_directory(DIST, "havi-rtsp.browser.js.map")


@app.post("/tcp/open")
def tcp_open():
    try:
        sid = layer.open(request.args.get("host"), request.args.get("port"))
    except PermissionError as exc:
        abort(403, str(exc))
    except ValueError as exc:
        abort(400, str(exc))
    except OSError as exc:
        abort(502, str(exc))
    return jsonify({"id": sid})


@app.get("/tcp/read")
def tcp_read():
    sid = request.args.get("id")
    if not layer.has(sid):
        abort(404, "unknown session")

    def body():
        try:
            yield from layer.read_iter(sid)
        finally:
            layer.close(sid)

    return Response(
        body(),
        mimetype="application/octet-stream",
        headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
    )


@app.post("/tcp/write")
def tcp_write():
    sid = request.args.get("id")
    try:
        layer.write(sid, request.get_data())
    except KeyError:
        abort(404, "unknown session")
    except OSError as exc:
        abort(502, str(exc))
    return ("", 204)


@app.post("/tcp/close")
def tcp_close():
    layer.close(request.args.get("id"))
    return ("", 204)


@app.get("/stream")
def stream():
    url = request.args.get("url", "").strip()
    if not url:
        abort(400, "url query parameter required")

    proc = subprocess.Popen(
        [NODE, REMUX, "--url", url, "--timeout", str(INFO_TIMEOUT_S)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    info = _wait_for_info(proc)
    if not info:
        _kill(proc)
        abort(502, "stream did not open")

    threading.Thread(target=_drain, args=(proc.stderr,), daemon=True).start()

    def body():
        try:
            while True:
                chunk = proc.stdout.read1(64 * 1024)
                if not chunk:
                    break
                yield chunk
        finally:
            _kill(proc)

    headers = {
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
        "X-Havi-Codec": info.get("codec", ""),
    }
    return Response(body(), mimetype=None, content_type=info["contentType"], headers=headers)


def _wait_for_info(proc):
    for raw in proc.stderr:
        try:
            msg = json.loads(raw)
        except ValueError:
            continue
        if msg.get("type") == "info":
            return msg
        if msg.get("type") == "unsupported" or msg.get("fatal"):
            return None
    return None


def _drain(pipe):
    for _ in pipe:
        pass


def _kill(proc):
    if proc.poll() is None:
        proc.kill()


if __name__ == "__main__":
    app.run(host=BIND, port=int(os.environ.get("HAVI_PORT", "5000")), threaded=True)
