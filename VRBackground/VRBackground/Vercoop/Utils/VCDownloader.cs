using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Net;
using VRBackground.Vercoop;


namespace VRBackground.Vercoop.Utils
{
    class VCDownloader
    {
        public static long currentFileSize = 0;
        public static long currenDownloadedSize = 0;
        public static string currentDownloadURL = "";
        public const String TMP_FILENAME = "temp.downloading";
        private static List<long> mySpeedList = new List<long>();
        private const int SPEED_SAMPLE_COUNT = 100;

        public static void Move(String dst)
        {
            try
            {

                VRBackground.Vercoop.Utils.Error.trace("VCDownloader====001=");
                string outputFilePath = Config.GetDataDirectory() + "\\" + TMP_FILENAME;
                if (System.IO.File.Exists(dst))
                {
                    System.IO.File.Delete(dst);
                }
                File.Move(outputFilePath, dst);
                VRBackground.Vercoop.Utils.Error.trace("VCDownloader====002=");
            }
            catch (Exception ex)
            {
                VRBackground.Vercoop.Utils.Error.Instance().AddError(ex.ToString());
                Utils.Error.trace(ex.ToString());
            }


        }
        public static long GetDownloadSpeed()
        {
            long resVal = 0;
            lock (mySpeedList)
            {

                if (mySpeedList.Count > 0)
                {
                    foreach (long speed in mySpeedList)
                    {
                        resVal += speed;
                    }
                    resVal = resVal / mySpeedList.Count;
                }
            }
            return resVal;
        }

        public static bool DownloadHLS(String url, String folder)
        {

            FileStream fsM3u8 = null;
            FileStream fsSegment = null;
            StreamWriter swM3u8 = null;
            try
            {

                const int BUFFER_SIZE = 16 * 1024;
                Uri myUri = new Uri(url);
                if (myUri.Segments.Length > 2)
                {
                    String filename = myUri.Segments[myUri.Segments.Length - 1];
                    String m3u8Filename = folder + "\\" + filename;
                    String url_prefix = myUri.Scheme + "://" + myUri.Host;
                    double ts_time = 0;
                    if (myUri.Port != 80)
                    {
                        url_prefix += ":" + myUri.Port;
                    }
                    for (int i = 0; i < myUri.Segments.Length - 1; i++)
                    {
                        url_prefix += myUri.Segments[i];
                    }
                    WebRequest request = WebRequest.Create(url);
                    request.Method = "GET";
                    HttpWebResponse responseHLS = (HttpWebResponse)request.GetResponse();
                    if (responseHLS.StatusCode == HttpStatusCode.OK)
                    {
                        var encoding = ASCIIEncoding.ASCII;
                        using (var reader = new System.IO.StreamReader(responseHLS.GetResponseStream(), encoding))
                        {
                            if (File.Exists(m3u8Filename)) File.Delete(m3u8Filename);
                            fsM3u8 = File.Create(m3u8Filename);
                            swM3u8 = new StreamWriter(fsM3u8);
                            List<string> mySegemtns = new List<string>();

                            while (!reader.EndOfStream)
                            {
                                string responseText = reader.ReadLine();
                                swM3u8.WriteLine(responseText);
                                if (responseText.StartsWith("#EXTINF:"))
                                {
                                    responseText = responseText.Replace("#EXTINF:", "");
                                    responseText = responseText.Replace(",", "");
                                    responseText = responseText.Replace(" ", "");
                                    ts_time = Convert.ToDouble(responseText);
                                }
                                else
                                {
                                    if (ts_time > 0.01)
                                    {
                                        if (responseText.EndsWith(".ts"))
                                        {
                                            mySegemtns.Add(responseText);
                                        }
                                        ts_time = 0;
                                    }
                                }
                            }
                            swM3u8.WriteLine("\n");
                            reader.Close();
                            int segment_count = 0;
                            foreach (string ts_filename in mySegemtns)
                            {
                                string ts_url = url_prefix + ts_filename;
                                string ts_path = folder + "\\" + ts_filename;
                                if (File.Exists(ts_path))
                                {
                                    File.Delete(ts_path);
                                }

                                using (var outputFileStream = File.Create(ts_path, BUFFER_SIZE))
                                {
                                    var req = WebRequest.Create(ts_url);
                                    using (var response = req.GetResponse())
                                    {
                                        using (var responseStream = response.GetResponseStream())
                                        {
                                            var buffer = new byte[BUFFER_SIZE];
                                            long bytesRead;
                                            do
                                            {
                                                long milliseconds_start = DateTime.Now.Ticks / TimeSpan.TicksPerMillisecond;
                                                bytesRead = responseStream.Read(buffer, 0, BUFFER_SIZE);
                                                currenDownloadedSize += bytesRead;
                                                outputFileStream.Write(buffer, 0, (int)bytesRead);
                                                long milliseconds_end = DateTime.Now.Ticks / TimeSpan.TicksPerMillisecond;
                                                long diff = milliseconds_end - milliseconds_start;
                                                if (diff > 0 && bytesRead > 0)
                                                {
                                                    lock (mySpeedList)
                                                    {
                                                        long speed = bytesRead * 1000 / diff;
                                                        while (mySpeedList.Count >= SPEED_SAMPLE_COUNT)
                                                        {
                                                            mySpeedList.RemoveAt(0);
                                                        }
                                                        mySpeedList.Add(speed);
                                                    }


                                                }
                                            } while (bytesRead > 0);
                                            responseStream.Close();
                                            segment_count++;
                                        }
                                    }
                                    outputFileStream.Close();
                                }

                            }
                            if (segment_count > 0)
                            {
                                return true;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Utils.Error.trace(ex.ToString());
            }
            finally
            {
                if (fsM3u8 != null) fsM3u8.Close();
                if (fsSegment != null) fsSegment.Close();
                if (swM3u8 != null)
                {
                    //swM3u8.Close();
                }

            }

            return false;
        }
        public static long Download(String outputFilePath, String url, long size)
        {
            long _curDOwnloaedSize = 0;
            try
            {

                VRBackground.Vercoop.Utils.Error.trace("VCDownloader====002=" + outputFilePath + ":" + url);
                if (System.IO.File.Exists(outputFilePath))
                {
                    System.IO.File.Delete(outputFilePath);
                }
                currentFileSize = size;
                currenDownloadedSize = 0;
                //const int BUFFER_SIZE = 16 * 1024;
                const int BUFFER_SIZE = 16 * 1024;
                currentDownloadURL = url;
                using (var outputFileStream = File.Create(outputFilePath, BUFFER_SIZE))
                {
                    var req = WebRequest.Create(url);
                    using (var response = req.GetResponse())
                    {
                        using (var responseStream = response.GetResponseStream())
                        {
                            var buffer = new byte[BUFFER_SIZE];
                            long bytesRead;
                            do
                            {
                                long milliseconds_start = DateTime.Now.Ticks / TimeSpan.TicksPerMillisecond;
                                bytesRead = responseStream.Read(buffer, 0, BUFFER_SIZE);
                                currenDownloadedSize += bytesRead;
                                _curDOwnloaedSize += bytesRead;
                                Utils.Error.trace("current downloaded [" + _curDOwnloaedSize + "]");
                                outputFileStream.Write(buffer, 0, (int)bytesRead);
                                long milliseconds_end = DateTime.Now.Ticks / TimeSpan.TicksPerMillisecond;
                                long diff = milliseconds_end - milliseconds_start;
                                if (diff > 0 && bytesRead > 0)
                                {
                                    lock (mySpeedList)
                                    {
                                        long speed = bytesRead * 1000 / diff;
                                        while (mySpeedList.Count >= SPEED_SAMPLE_COUNT)
                                        {
                                            mySpeedList.RemoveAt(0);
                                        }
                                        mySpeedList.Add(speed);
                                    }


                                }
                            } while (bytesRead > 0);
                            responseStream.Close();
                        }
                    }
                    outputFileStream.Close();
                }
                return _curDOwnloaedSize;
            }
            catch (Exception ex)
            {
                VRBackground.Vercoop.Utils.Error.Instance().AddError(ex.ToString());
                Utils.Error.trace(ex.ToString());
            }
            return 0;
        }
    }
}
