using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Specialized;
using System.IO;
using System.Text.RegularExpressions;

namespace VRBackground.Vercoop.Utils
{
    class MovieService
    {
        private static Dictionary<string, string> myEtag = new Dictionary<string, string>();
        private static string GetEtag(String filename)
        {
            lock (myEtag)
            {
                if (myEtag.ContainsKey(filename))
                {
                    return myEtag[filename];
                }
                string newTag = filename + DateTime.UtcNow.ToString();
                newTag = VCAES.MD5(newTag);
                myEtag.Add(filename, newTag);
                return newTag;
            }

        }
        private static void WriteSocketLine(Vercoop.HTTP.HttpProcessor p, string message)
        {
            Utils.Error.trace("=====[" + message + "]====");
            byte[] b2 = System.Text.Encoding.ASCII.GetBytes(message + "\r\n");

            p.outputStream.BaseStream.Write(b2, 0, b2.Length);

            //p.outputStream.Write(message + "\r\n");


        }


        public static void DownloadLargeFile(String filename, Vercoop.HTTP.HttpProcessor p, string content_type = "video/mp4")
        {
            //filename = @"C:\wamp\www\file\test.mp4";

            FileInfo fInfo = new FileInfo(filename);
            string currentEtag = GetEtag(filename);
            Stream fs = File.Open(filename, FileMode.Open, FileAccess.Read, FileShare.Read);
            try
            {
                long lrange = 0;
                //var fileSize = 1024 * 1000;// fInfo.Length;
                long fileSize = fInfo.Length;
                long size = fileSize;
                bool usingPartical = false;
                long urange = (long)fileSize - 1;
                if (p.httpHeaders["Range"] != null)
                {

                    string param = Convert.ToString(p.httpHeaders["Range"]);
                    if (param.StartsWith("bytes="))
                    {
                        var range = param.Replace("bytes=", "").Split('-');
                        if (range.Length == 2 && long.TryParse(range[0], out lrange) &&
                            long.TryParse(range[1], out urange))
                        {
                            usingPartical = true;
                        }

                        if ((range.Length == 2 && long.TryParse(range[0], out lrange) &&
                             string.IsNullOrWhiteSpace(range[1])) ||
                            (range.Length == 1 && long.TryParse(range[0], out lrange)))
                        {
                            urange = (int)fileSize;
                            if (lrange > 0)
                            {
                                urange -= 1;
                            }
                            else
                            {
                                urange -= 1;
                            }
                            usingPartical = true;
                        }

                        if (range.Length == 2 && string.IsNullOrWhiteSpace(range[0]) &&
                            long.TryParse(range[1], out urange))
                        {
                            lrange = (int)fileSize - urange;
                            urange = (int)fileSize - 1;
                            usingPartical = true;
                        }

                    }


                }




                if (lrange == 0)
                {
                    if (urange > 10240)
                    {
                        //urange = 10240;
                    }
                }
                if (usingPartical)
                {
                    size = (urange - lrange);
                    size += 1;
                    WriteSocketLine(p, "HTTP/1.0 206 Partial Content");
                }
                else
                {
                    WriteSocketLine(p, "HTTP/1.0 200 OK");
                    //WriteSocketLine(p, "HTTP/1.0 206 Partial Content");

                    //큰 파일일 경우 무조건 206으로 리턴한다.
                    //WriteSocketLine(p, "HTTP/1.0 206 Partial Content");
                }
                WriteSocketLine(p, "Server: 87870Service (" + Vercoop.Config.ApplicationName + ")");
                //Wamp Server의 response규칙을 따른것이다.
                //Check On https://msdn.microsoft.com/en-us/library/az4se3k1(v=vs.110).aspx

                WriteSocketLine(p, "Date: " + DateTime.UtcNow.ToString("R"));
                WriteSocketLine(p, "Last-Modified: " + System.IO.File.GetLastWriteTimeUtc(filename).ToString("R"));
                //TODO ETag: "15788912-52d20e8daf742"

                if (p.httpHeaders["If-Range"] != null)
                {
                    if (p.httpHeaders["If-Range"].Equals(currentEtag))
                    {

                    }
                }
                WriteSocketLine(p, "ETag: " + currentEtag);
                WriteSocketLine(p, "Accept-Ranges: bytes");
                if (urange > lrange)
                {
                    WriteSocketLine(p, "Content-Length:" + size);
                }
                else
                {
                    WriteSocketLine(p, "Content-Length:" + size);
                }

                if (p.httpHeaders["Connection"].Equals("keep-alive"))
                {
                    WriteSocketLine(p, "Keep-Alive:timeout=5, max=100");
                    WriteSocketLine(p, "Connection: Keep-Alive");
                }
                else
                {
                    //WriteSocketLine(p, "Connection: close");
                    //usingPartical = false;
                    WriteSocketLine(p, "Keep-Alive:timeout=5, max=100");
                    WriteSocketLine(p, "Connection: Keep-Alive");

                }
                WriteSocketLine(p, "Content-Type: " + content_type);
                if (usingPartical)
                {
                    WriteSocketLine(p, "Content-Range: bytes " + lrange + "-" + urange + "/" + fileSize);
                }










                //WriteSocketLine(p, "Content-Disposition: attachment; filename=87870Video.mp4");
                //
                //WriteSocketLine(p, "Content-Transfer-Encoding: binary");

                //WriteSocketLine(p, "");
                //usingPartical = false;
                p.outputStream.Flush();
                //if (usingPartical)
                {
                    WriteSocketLine(p, "");
                    long lRes = fs.Seek(lrange, SeekOrigin.Begin);
                    long current = lrange;
                    long read_size = 0;
                    const int BUFFER_SIZE = 16 * 1024;
                    var buffer = new byte[BUFFER_SIZE];
                    //end = 1024 * 26; // Test case only
                    Utils.Error.trace("Start to read and write [" + current + "][" + urange + "]");
                    //Utils.Error.trace("Read must be  [" + (urange - current) + "][" + lRes + "]");
                    urange++; //실제 크기는 보다 1이 크므로 여기서 이것을 처리해 준다.
                    while (current < urange)
                    {
                        // Utils.Error.trace("Check Here [" + current + "][" + urange + "]");
                        int read_len = (int)Math.Min(BUFFER_SIZE, urange - current);

                        //Utils.Error.trace("start read [" + read_len + "]");
                        int res = fs.Read(buffer, 0, read_len);
                        // Utils.Error.trace("end read [" + res + "]");
                        read_size += res;
                        p.outputStream.BaseStream.Write(buffer, 0, res);
                        //Utils.Error.trace("Socket Write FInished");
                        current += res;
                        //System.Threading.Thread.Sleep(100);
                        //Utils.Error.trace("Write File [" + current + "][" + (urange - current) + "]");
                        if (res < read_len)
                        {
                            break;
                        }
                    }
                    Utils.Error.trace("read size [" + read_size + "] plan size [" + size + "]");
                }

                p.outputStream.BaseStream.Flush();
            }
            catch (Exception ex)
            {
                Utils.Error.trace("Exception [" + ex.ToString() + "]");
            }
            finally
            {
                fs.Close();
            }



        }
    }
}
