using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Drawing;
using System.Windows.Forms;
using System.IO;
using System.Net;
using System.Web;
using System.Net.Sockets;
using System.Threading;
using System.Diagnostics;
using System.Collections.Specialized;

namespace VRBackground.Vercoop.HTTP
{
    public abstract class HttpServer
    {

        protected int port;
        TcpListener listener;
        bool is_active = true;

        public HttpServer(int port)
        {
            this.port = port;
        }

        public void listen()
        {

            try
            {
                IPAddress ipAddress = IPAddress.Any;
                listener = new TcpListener(ipAddress, this.port);
                listener.Start();
                while (is_active)
                {
                    TcpClient s = listener.AcceptTcpClient();
                    HttpProcessor processor = new HttpProcessor(s, this);
                    Thread thread = new Thread(new ThreadStart(processor.process));
                    thread.Start();
                    Thread.Sleep(1);
                }
            }
            catch (System.Net.Sockets.SocketException ex)
            {
                Utils.Error.Instance().AddError(ex.ToString());
                MessageBox.Show("TCP socket is already used:" + this.port);
                Environment.Exit(1);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Unknown Exception Error (" + ex.ToString() + ")");
                Environment.Exit(2);
            }

        }

        public abstract void handleGETRequest(HttpProcessor p);
        public abstract void handlePOSTRequest(HttpProcessor p, StreamReader inputData);
    }
    public class HttpProcessor
    {
        public TcpClient socket;
        public HttpServer srv;

        private Stream inputStream;
        public StreamWriter outputStream;

        public String http_method;
        public String http_url;
        public String http_protocol_versionstring;
        public System.Collections.Hashtable httpHeaders = new System.Collections.Hashtable();


        private static int MAX_POST_SIZE = 10 * 1024 * 1024; // 10MB

        public HttpProcessor(TcpClient s, HttpServer srv)
        {
            this.socket = s;
            this.srv = srv;
        }


        private string streamReadLine(Stream inputStream)
        {
            int next_char;
            string data = "";
            while (true)
            {
                next_char = inputStream.ReadByte();
                if (next_char == '\n') { break; }
                if (next_char == '\r') { continue; }
                if (next_char == -1) { Thread.Sleep(1); continue; };
                data += Convert.ToChar(next_char);
            }
            return data;
        }
        public void process()
        {
            // we can't use a StreamReader for input, because it buffers up extra data on us inside it's
            // "processed" view of the world, and we want the data raw after the headers
            inputStream = new BufferedStream(socket.GetStream());

            // we probably shouldn't be using a streamwriter for all output from handlers either
            outputStream = new StreamWriter(new BufferedStream(socket.GetStream()));
            try
            {
                parseRequest();
                readHeaders();
                if (http_method.Equals("GET"))
                {
                    handleGETRequest();
                }
                else if (http_method.Equals("POST"))
                {
                    handlePOSTRequest();
                }
                outputStream.Flush();
                inputStream.Close();
                outputStream.Close();
            }
            catch (Exception e)
            {

                Utils.Error.trace("Exception: " + e.ToString());
                writeFailure();
            }

            // bs.Flush(); // flush any remaining output
            inputStream = null; outputStream = null; // bs = null;            
            socket.Close();
        }

        public void parseRequest()
        {
            String request = streamReadLine(inputStream);
            string[] tokens = request.Split(' ');
            if (tokens.Length != 3)
            {
                throw new Exception("invalid http request line");
            }
            http_method = tokens[0].ToUpper();
            http_url = tokens[1];
            http_protocol_versionstring = tokens[2];

            Utils.Error.trace("starting: " + request);
        }

        public void readHeaders()
        {
            Utils.Error.trace("readHeaders()");
            String line;
            while ((line = streamReadLine(inputStream)) != null)
            {
                if (line.Equals(""))
                {
                    Utils.Error.trace("got headers");
                    return;
                }

                int separator = line.IndexOf(':');
                if (separator == -1)
                {
                    throw new Exception("invalid http header line: " + line);
                }
                String name = line.Substring(0, separator);
                int pos = separator + 1;
                while ((pos < line.Length) && (line[pos] == ' '))
                {
                    pos++; // strip any spaces
                }

                string value = line.Substring(pos, line.Length - pos);
                Utils.Error.trace("header: {" + name + "}:{" + value + "}");
                httpHeaders[name] = value;
            }
        }

        public void handleGETRequest()
        {
            srv.handleGETRequest(this);
        }

        private const int BUF_SIZE = 4096;
        public void handlePOSTRequest()
        {
            // this post data processing just reads everything into a memory stream.
            // this is fine for smallish things, but for large stuff we should really
            // hand an input stream to the request processor. However, the input stream 
            // we hand him needs to let him see the "end of the stream" at this content 
            // length, because otherwise he won't know when he's seen it all! 

            Utils.Error.trace("get post data start");
            int content_len = 0;
            MemoryStream ms = new MemoryStream();
            if (this.httpHeaders.ContainsKey("Content-Length"))
            {
                content_len = Convert.ToInt32(this.httpHeaders["Content-Length"]);
                if (content_len > MAX_POST_SIZE)
                {
                    throw new Exception(
                        String.Format("POST Content-Length({0}) too big for this simple server",
                          content_len));
                }
                byte[] buf = new byte[BUF_SIZE];
                int to_read = content_len;
                while (to_read > 0)
                {
                    Utils.Error.trace("starting Read, to_read={" + to_read + "}");

                    int numread = this.inputStream.Read(buf, 0, Math.Min(BUF_SIZE, to_read));
                    Utils.Error.trace("read finished, numread={" + numread + "}");
                    if (numread == 0)
                    {
                        if (to_read == 0)
                        {
                            break;
                        }
                        else
                        {
                            throw new Exception("client disconnected during post");
                        }
                    }
                    to_read -= numread;
                    ms.Write(buf, 0, numread);
                }
                ms.Seek(0, SeekOrigin.Begin);
            }
            Utils.Error.trace("get post data end");
            srv.handlePOSTRequest(this, new StreamReader(ms));

        }

        public void writeSuccess(string content_type = "text/html")
        {
            // this is the successful HTTP response line
            outputStream.WriteLine("HTTP/1.0 200 OK");
            // these are the HTTP headers...          
            outputStream.WriteLine("Content-Type: " + content_type);
            outputStream.WriteLine("Connection: close");
            // ..add your own headers here if you like

            outputStream.WriteLine(""); // this terminates the HTTP headers.. everything after this is HTTP body..
        }

        public void writeFailure()
        {
            // this is an http 404 failure response
            outputStream.WriteLine("HTTP/1.0 404 File not found");
            // these are the HTTP headers
            outputStream.WriteLine("Connection: close");
            // ..add your own headers here

            outputStream.WriteLine(""); // this terminates the HTTP headers.
        }
    }

    public class MyHttpServer : HttpServer
    {
        public MyHttpServer(int port)
            : base(port)
        {
        }

        public override void handleGETRequest(HttpProcessor p)
        {


            Uri myURI = new Uri("http://localhost" + p.http_url);
            string queryString = myURI.Query;
            NameValueCollection qscoll = HttpUtility.ParseQueryString(queryString);


            
            if (myURI.LocalPath.StartsWith("/hlstest/"))
            {
               
            }
            else
            {
                try
                {
                    Vercoop.Pages.Navigator.ProcRequest(p, myURI.LocalPath, qscoll);
                }
                catch (Exception ex)
                {
                    p.writeSuccess();
                    p.outputStream.Write("Exception:" + ex.ToString());
                }
                
            }



        }
        public override void handlePOSTRequest(HttpProcessor p, StreamReader inputData)
        {
            Utils.Error.trace("POST request: {" + p.http_url + "}");
            string data = inputData.ReadToEnd();

            p.writeSuccess();
            p.outputStream.WriteLine("<html><body><h1>test server</h1>");
            p.outputStream.WriteLine("<a href=/test>return</a><p>");
            p.outputStream.WriteLine("postbody: <pre>{0}</pre>", data);


        }
    }

}
