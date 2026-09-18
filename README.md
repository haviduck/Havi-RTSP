# Havi-RTSP

Node pulls an RTSP or HTTP MJPEG stream. The browser plays it. H.264 and H.265 are remuxed to fragmented MP4. JPEG/MJPEG is reconstructed and drawn as frames. No ffmpeg in that path. 

If the camera is on digest auth, put user and password in the URL. Transport is interleaved TCP. UDP is not spoken.

Codecs we cannot remux still get a real PLAY attempt. The error comes after that, not from a hardcoded deny list.

## Run the demo

```
npm i
node bin/havi-rtsp.js --url rtsp://user:pass@camera:554/path
```

Then open http://127.0.0.1:8787

The page under `public/` is the demo. The library is `src/`. Don't treat the demo chrome as part of the API.

## Use as a library

```js
import { createGateway, RtspClient } from "havi-rtsp";
```

`createGateway()` serves the demo and a WebSocket remux. `RtspClient` is the session if you want to wire your own sink.
