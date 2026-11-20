from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class SpaHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = Path(self.translate_path(self.path))
        if path.exists() and path.is_file():
            return super().send_head()

        self.path = "/index.html"
        return super().send_head()


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 3100), SpaHandler).serve_forever()
