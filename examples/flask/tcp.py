"""Byte-only TCP layer for the browser bundle. No RTSP, no Node.

POST /tcp/open?host=&port=  -> {"id": "..."}
GET  /tcp/read?id=          -> camera bytes
POST /tcp/write?id=         -> body goes to the camera
POST /tcp/close?id=
"""
import socket
import threading
import uuid


class TcpLayer:
    def __init__(self, bind_host="127.0.0.1", allow=None, target=None):
        self.bind_host = bind_host
        self.allow = _parse_allow(allow)
        self.target = _parse_target(target)
        self.sessions = {}
        self.lock = threading.Lock()

    def open(self, host, port):
        if self.target:
            host, port = self.target
        host = (host or "").strip()
        port = int(port or 554)
        if not host or port <= 0:
            raise ValueError("host and port required")
        self._check(host, port)
        sock = socket.create_connection((host, port), timeout=8)
        sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
        sock.settimeout(None)
        sid = uuid.uuid4().hex
        with self.lock:
            self.sessions[sid] = sock
        return sid

    def has(self, sid):
        with self.lock:
            return sid in self.sessions

    def write(self, sid, data):
        sock = self._get(sid)
        if data:
            sock.sendall(data)

    def read_iter(self, sid, chunk=65536):
        sock = self._get(sid)
        while True:
            try:
                data = sock.recv(chunk)
            except OSError:
                break
            if not data:
                break
            yield data

    def close(self, sid):
        with self.lock:
            sock = self.sessions.pop(sid, None)
        if sock is None:
            return
        try:
            sock.shutdown(socket.SHUT_RDWR)
        except OSError:
            pass
        try:
            sock.close()
        except OSError:
            pass

    def _get(self, sid):
        with self.lock:
            sock = self.sessions.get(sid)
        if sock is None:
            raise KeyError(sid)
        return sock

    def _check(self, host, port):
        if self.allow is None and self.target is None and not _loopback(self.bind_host):
            raise PermissionError("allow list required when not bound to localhost")
        if self.allow is not None and f"{host}:{port}" not in self.allow:
            raise PermissionError("target not allowed")


def _loopback(host):
    return host in ("127.0.0.1", "localhost", "::1")


def _parse_allow(allow):
    if not allow:
        return None
    if isinstance(allow, (set, list, tuple)):
        values = {str(item).strip() for item in allow if str(item).strip()}
    else:
        values = {part.strip() for part in str(allow).split(",") if part.strip()}
    return values or None


def _parse_target(target):
    if not target:
        return None
    host, port = str(target).rsplit(":", 1)
    return host, int(port)
