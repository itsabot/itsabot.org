import SimpleHTTPServer, SocketServer, urlparse, os

class Handler( SimpleHTTPServer.SimpleHTTPRequestHandler ):
    def do_GET( self ):
        urlParams = urlparse.urlparse(self.path)
        if os.access( '.' + os.sep + urlParams.path, os.R_OK ):
            SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self);
        else:
            self.send_response(200)
            self.send_header( 'Content-type', 'text/html' )
            self.end_headers()
            self.wfile.write( open('index.html').read() )

httpd = SocketServer.TCPServer( ('127.0.0.1', 8000), Handler )
httpd.serve_forever()
