using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;


namespace VRBackground.Vercoop.Utils
{
    class Utility
    {
        private static string GetLocalIPv4(NetworkInterfaceType _type)
        {
            string output = "";
            foreach (NetworkInterface item in NetworkInterface.GetAllNetworkInterfaces())
            {
                if (item.NetworkInterfaceType == _type && item.OperationalStatus == OperationalStatus.Up)
                {
                    foreach (UnicastIPAddressInformation ip in item.GetIPProperties().UnicastAddresses)
                    {
                        if (ip.Address.AddressFamily == AddressFamily.InterNetwork)
                        {
                            output = ip.Address.ToString();
                        }
                    }
                }
            }
            return output;
        }
        public static long GetCurrentSecond()
        {
            long seconds = DateTime.Now.Ticks / TimeSpan.TicksPerSecond;
            return seconds;
        }
        public static Boolean ReUnityWriteText(string path, string video_path)
        {
            if (System.IO.File.Exists(path) && System.IO.File.Exists(video_path))
            {
                //PATH=file:///D:/Data/Panorama/mindlight.mp4
                string txt = "PATH=file:///";
                char[] delimiter = {'\\', '/'};

                string[] elements = video_path.Split(delimiter);
                if(elements.Length > 2){
                    txt = txt + elements[0];
                    for (int i = 1; i < elements.Length; i++)
                    {
                        txt = txt + "/" + elements[i];
                    }
                    txt = txt + "\nUSE_SELECTION=FALSE"; 
                    System.IO.File.WriteAllText(path, txt);
                    return true;
                }
                    

                

            }
            return false;
        }
        public static string GetExcutivePath(string path){
            try
            {
                if (System.IO.File.Exists(path) || System.IO.Directory.Exists(path))
                {

                }
                else
                {
                    return null;
                }
                System.IO.FileAttributes attr = System.IO.File.GetAttributes(path);
                //if (attr != null)
                {
                    if (attr == System.IO.FileAttributes.Directory)
                    {
                        string[] excuteFiles = System.IO.Directory.GetFiles(path, "*.*");
                        foreach (string full_path in excuteFiles)
                        {
                            string ext = System.IO.Path.GetExtension(full_path);
                            if (ext.Equals(".exe"))
                            {
                                return full_path;
                            }
                        }
                        excuteFiles = System.IO.Directory.GetDirectories(path);
                        foreach (string full_path in excuteFiles)
                        {

                            
                            string res = GetExcutivePath(full_path);
                            if (res != null)
                            {
                                return res;
                            }
                            else
                            {
                                Utils.Error.Log("Error Check Step ===003====[" + full_path + "]");
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Error.Instance().AddError(ex.ToString());
            }
            
            return null;
        }
        public static Boolean isValidString(string arg){
            if (arg == null) return false;
            if (arg is string)
            {
                if (arg.Length > 0)
                {
                    return true;
                }
            }
            return false;
        }
        public static string GetLocalIPAddress()
        {
            try
            {
                if (!System.Net.NetworkInformation.NetworkInterface.GetIsNetworkAvailable())
                {
                    return "Network Invalid";
                }

                string ip = GetLocalIPv4(NetworkInterfaceType.Ethernet);
                return ip;
            }
            catch (Exception ex)
            {
                Error.Instance().AddError(ex.ToString());
                return ex.Message;
            }
            //return "Unknown IP Address";
        }
    }
}
