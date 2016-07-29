using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VRBackground.Vercoop.Utils;

using Newtonsoft.Json.Linq;

namespace VRBackground.Vercoop
{
    class Config
    {
        public const string ApplicationName = "VRBackground ( 0.10.02 )";
        public const string VideoPlayerProcessFile = "C:\\Vr_VideoPlayer\\Test.exe";
        public const string VideoPlayerConfigFile = "C:\\Vr_VideoPlayer\\Test_Data\\Cmd.txt";

        public static Boolean LOCAL_DEBUG = true;
        public const int ContentSynInterval = 3600; // 60 * 60 1 housr
        
        public const string APIURL_GAMELIST = "http://api.87870.com/store/gamelist.php?ver=2&store_param=87870VR";
        public const string APIURL_VIDEOLIST = "http://api.87870.com/store/videolist.php?ver=1&store_param=87870VR";
        public const int HTTP_PORT = 8787;
        public const int DELET_CONTENT_INTERVAL = 86400 * 2;


        public static string DeviceAccessToken = null;
        public static int DeviceIDX = 0;
        public static int StoreIDX = 0;
        public static string DeviceUniqueID = "TODO";
        private static string filename_config = "Config.data";


        private static string mBackendType = "GameContents";

        public static Boolean isValidConfig()
        {
            if (Config.LOCAL_DEBUG)
            {
                return true;
            }
            if (DeviceAccessToken == null)
            {
                return false;
            }
            if (DeviceIDX == 0)
            {
                return false;
            }
            if (StoreIDX == 0)
            {
                return false;
            }
            return true;
        }
        public static Boolean isGameBackend()
        {
            if (mBackendType.Equals("VideoContents"))
            {
                return false;
            }
            return true;
        }
        public static string GetDataDirectory()
        {
            if (mBackendType.Equals("VideoContents"))
            {
                return "C:\\_87VRVideos";
            }

        //    return "C:\\_87VRResources"; //simple version
            return "C:\\_87V8Games";
        }
        public static void ToggleBackendType()
        {
            if (mBackendType.Equals("VideoContents"))
            {
                mBackendType = "GameContents";
            }
            else
            {
                mBackendType = "VideoContents";
            }
            SaveConfigData();
            
            
        }
        public static void LoadConfig()
        {
            

            try
            {              
                if (Config.LOCAL_DEBUG)
                {
                    return;
                }
                VCJsonFile jsonFile = new VCJsonFile(filename_config, true);
                String jsonString = jsonFile.GetValue();
                if (jsonString.Length > 10)
                {
                    JObject result = JObject.Parse(jsonString);
                    if (result != null)
                    {
                        if (result["DATA"] != null)
                        {
                            JToken jData = result["DATA"];
                            if (jData["access_token"] != null)
                            {
                                DeviceAccessToken = jData["access_token"].ToString();
                            }
                            if (jData["deviceID"] != null)
                            {
                                DeviceUniqueID = jData["deviceID"].ToString();
                            }
                            if (jData["backendType"] != null)
                            {
                                mBackendType = jData["backendType"].ToString();
                            }
                            if (jData["device_idx"] != null)
                            {
                                DeviceIDX = Convert.ToInt32(jData["device_idx"].ToString());
                            }
                            if (jData["store_idx"] != null)
                            {
                                StoreIDX = Convert.ToInt32(jData["store_idx"].ToString());
                            }
                        }
                    }
                }
                Boolean willUPdateConfig = false;
                string deviceID = Vercoop.Utils.ThumbPrint.GetUniqueID();
                if (deviceID.Equals(DeviceUniqueID))
                {

                }
                else
                {
                    DeviceUniqueID = deviceID;
                    willUPdateConfig = true;
                }

                if (DeviceAccessToken == null || DeviceIDX == 0 || StoreIDX == 0)
                {
                    Vercoop.Content.APIManager.GetDeviceToken();
                    if (DeviceAccessToken != null && DeviceIDX > 0)
                    {
                        willUPdateConfig = true;
                    }
                }
                
                if (willUPdateConfig)
                {
                    SaveConfigData();
                }
            }
            catch (Exception ex)
            {
                Error.Log(ex.ToString());
            }
            
        }
        public static void SaveConfigData()
        {
            VCJsonFile jsonFile = new VCJsonFile(filename_config, true);
            string jsonString = "{\"DATA\":{\"none\":\"1\"";
            if (DeviceAccessToken != null)
            {
                jsonString += ",\"access_token\":\"" + DeviceAccessToken + "\"";

            }
            jsonString += ",\"deviceID\":\"" + DeviceUniqueID + "\"";
            jsonString += ",\"device_idx\":\"" + DeviceIDX + "\"";
            jsonString += ",\"store_idx\":\"" + StoreIDX + "\"";
            jsonString += ",\"backendType\":\"" + mBackendType + "\"";
            jsonString += "}}";

            jsonFile.SaveData(jsonString);
        }
        
    }
}
