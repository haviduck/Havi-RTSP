# Havi-RTSP

The browser plays an RTSP or HTTP MJPEG stream. The byte host is `dist/havi-rtsp.browser.js` itself under Deno (or the compiled exe), or a Node/Flask host serving the page. H.264 and H.265 are remuxed to fragmented MP4. JPEG/MJPEG is reconstructed and drawn as frames. No ffmpeg in that path. 

If the camera is on digest auth, put user and password in the URL. Transport is interleaved TCP. UDP is not spoken.

Codecs we cannot remux still get a real PLAY attempt. The error comes after that, not from a hardcoded deny list.

## Run the demo

```
npm i
node bin/havi-rtsp.js --url rtsp://user:pass@camera:554/path
```

Then open http://127.0.0.1:8787

The page under `public/` is the demo (controls, stats, the glow behind the video). The library is `src/`. Don't treat the demo chrome as part of the API.

## Use as a library

```js
import { createGateway, RtspClient } from "havi-rtsp";
```

`createGateway()` serves the demo and a WebSocket remux. `RtspClient` is the session if you want to wire your own sink.

## Serverless: stdio remux

`bin/havi-remux.js` is the same remux without the server. Stream in, bytes out. No `ws`, no port, no HTTP. Spawn it from Flask, Go, a shell, whatever can read a pipe.

```
node bin/havi-remux.js --url rtsp://user:pass@camera:554/path > live.mp4
```

- stdout: media. fMP4 for H.264/H.265 (`--format mp4`), multipart JPEG for MJPEG (`--format mjpeg`). `auto` picks one from the stream. `--format framed` gives the exact WebSocket wire payloads with a length prefix (video, audio, JPEG, and JSON control in one pipe).
- stderr: one JSON object per line. The `info` line includes `contentType`, ready to copy into an HTTP header.
- `--timeout 15` exits with code 2 if the stream never opens. `--duration 10` stops after ten seconds.

A slow reader does not grow memory forever: fragments are dropped until the next keyframe once the pipe backs up.

`GET /stream` on the Flask example is this remux-in-process path (still needs Node on PATH). The `/` page does not; it uses the browser script and `examples/flask/tcp.py`.

## One file, both sides: the script is also the host

A browser tab has no raw TCP, so something outside the tab has to copy bytes to the camera. `dist/havi-rtsp.browser.js` is that something too. The same file you put in the `<script>` tag runs as the TCP host under Deno (not Node):

```
deno run --allow-net --allow-read dist/havi-rtsp.browser.js
```

Then open http://127.0.0.1:8787/ (built-in page, `?src=rtsp://…` autoplays), or open your own `file://…html` that loads the script; the page finds the host on `ws://127.0.0.1:8787/tcp` by itself. `--root ./public` serves your own directory instead of the built-in page. `--allow host:port,…` or `--target host:port` is required when binding off localhost.

No Deno for the end user: `npm run build:host` (needs Deno once, `winget install DenoLand.Deno`) compiles it to `dist/havi-rtsp-host.exe`. Double-click, open the page.

## Drop a script in HTML (other hosts)

`dist/havi-rtsp.browser.js` is the RTSP client and remux. The page does DESCRIBE/SETUP/PLAY, depacketizes RTP, and feeds fMP4 to MediaSource. The host does not understand RTSP.

Any other host works if it exposes the four HTTP endpoints below. Flask is the reference. Node is not required.

```
pip install flask
python examples/flask/app.py
```

Then the page is:

```html
<script src="/havi-rtsp.browser.js"></script>
<havi-player src="rtsp://user:pass@camera:554/path" muted controls></havi-player>
```

Or:

```html
<script src="/havi-rtsp.browser.js"></script>
<video id="cam" muted autoplay playsinline></video>
<script>
  HaviRtsp.play("#cam", "rtsp://user:pass@camera:554/path");
</script>
```

Or no extra JS:

```html
<script src="/havi-rtsp.browser.js"></script>
<video muted autoplay playsinline data-havi-src="rtsp://user:pass@camera:554/path"></video>
```

`play()` talks to same-origin `/tcp/open`, `/tcp/read`, `/tcp/write`, `/tcp/close`. Copy `examples/flask/tcp.py` into any other host. Binding off localhost without an allowlist is refused.

Before the HTTP layer, `play()` tries a WebSocket byte pipe at the same base (`ws(s)://host/<base path>/tcp?host=&port=`, binary frames both ways, the same wire as the Node `/tcp` pipe). Hosts without it refuse the upgrade and the HTTP layer is used. Prefer adding the WS route when a page shows more than one player: the HTTP layer holds one long-lived `GET /tcp/read` per player and browsers cap HTTP/1.1 at six connections per origin, so a few players plus an `EventSource` or two starve the last player. Pass `{ preferHttp: true }` to `play()` to keep HTTP first.

The Node demo still has the same HTTP layer (and a WebSocket `/tcp` for older pipes). You do not need it for Flask.

As a module:

```js
import { play } from "havi-rtsp/dist/havi-rtsp.browser.mjs";
const session = play("#cam", "rtsp://user:pass@camera:554/path");
// session.stop();
```

Rebuild after editing `src/` with `npm run build:browser`. HTTP MJPEG in the browser is an `<img>`. Digest auth works (pure JS MD5). WebCodecs fallback for HEVC-on-Chrome is not in the browser player yet.

## License

Proprietary. Copyright Carl Martin Haug. See LICENSE.
