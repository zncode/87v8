using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Specialized;
using System.IO;
using System.Text.RegularExpressions;
using System.Diagnostics;

namespace VRBackground.Vercoop.Pages
{
    class Thumbnail
    {
        public static void ProcCoverData(Dictionary<string, string> resCollection, NameValueCollection query, Vercoop.HTTP.HttpProcessor p)
        {
            resCollection.Clear();
            try
            {
                int cts_idx = 0;
                foreach (string key in query.AllKeys)
                {
                    if (key.Equals("idx"))
                    {
                        cts_idx = Convert.ToInt32(query[key]);
                    }
                }
                if (cts_idx > 0)
                {
                    Content.ContentInfo info = Content.APIManager.GetInstance().GetResolvedContent(cts_idx);
                    if (info != null)
                    {
                        string path = info.GetCoverDataPath();
                        if (File.Exists(path))
                        {
                            string extension = System.IO.Path.GetExtension(path);
                            if (extension == null)
                            {
                                WriteFailer(p, "No Extension [" + cts_idx + "]");
                            }
                            else
                            {
                                extension = extension.ToLower();
                                if(extension.Equals(".png")
                                    || extension.Equals(".jpg"))
                                {
                                   System.IO.Stream fs = System.IO.File.Open(path, FileMode.Open, FileAccess.Read, FileShare.Read);

                                   p.writeSuccess("image/png");
                                   fs.CopyTo(p.outputStream.BaseStream);
                                   p.outputStream.BaseStream.Flush();
                                   fs.Close();
                                }
                                else
                                {
                                    WriteFailer(p, "Not supported extension [" + cts_idx +":" + extension + "]");
                                }
                            }
                            
                        }
                        else
                        {
                            WriteFailer(p, "File does not exist on service [" + cts_idx + "]");
                        }
                    }
                    else
                    {
                        WriteFailer(p, "No content");
                    }
                }
                else
                {
                    WriteFailer(p, "No param of content idx");
                }
            }
            catch (Exception ex)
            {
                Utils.Error.Instance().AddError(ex.ToString());
            }

        }

        public static void Process(Dictionary<string, string> resCollection, NameValueCollection query, Vercoop.HTTP.HttpProcessor p)
        {
            resCollection.Clear();
            try
            {
                int cts_idx = 0;
                foreach (string key in query.AllKeys)
                {
                    if (key.Equals("idx"))
                    {
                        cts_idx = Convert.ToInt32(query[key]);
                    }
                }
                if (cts_idx > 0)
                {
                    Content.ContentInfo info = Content.APIManager.GetInstance().GetResolvedContent(cts_idx);
                    if (info != null)
                    {
                        string path = info.GetThumbnailPath();
                        if (File.Exists(path))
                        {
                            System.IO.Stream fs = System.IO.File.Open(path, FileMode.Open, FileAccess.Read, FileShare.Read);

                            p.writeSuccess("image/png");
                            fs.CopyTo(p.outputStream.BaseStream);
                            p.outputStream.BaseStream.Flush();
                            fs.Close();
                        }
                        else
                        {
                            WriteFailer(p, "File does not exist on service [" + cts_idx + "]");
                        }
                    }
                    else
                    {
                        WriteFailer(p, "No content");
                    }
                }
                else
                {
                    WriteFailer(p, "No param of content idx");
                }
            }
            catch (Exception ex)
            {
                Utils.Error.Instance().AddError(ex.ToString());
            }

        }


        private static void WriteFailer(Vercoop.HTTP.HttpProcessor p, string message)
        {

            p.outputStream.WriteLine("HTTP/1.0 404 File not found");
            // these are the HTTP headers
            p.outputStream.WriteLine("Connection: close");
            // ..add your own headers here

            p.outputStream.WriteLine(""); // this terminates the HTTP headers.
            p.outputStream.WriteLine("404 File not found [" + message + "]");
        }

    }
}
