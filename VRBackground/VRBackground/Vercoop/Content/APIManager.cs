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
using VRBackground.Vercoop.Utils;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

namespace VRBackground.Vercoop.Content
{
    class APIStatus
    {
        public int m_cntGamesTotal = 0;
        public int m_cntGamesResolved = 0;
        public int m_cntGamesDownloading = 0;
        
    }
    class APIManager
    {
        private static APIManager gv_Instance = null;
        private const string API_FILENAME = "info.json";
        private bool m_isStartAPISync = false;
        private Dictionary<int, ContentInfo> m_ContentList = new Dictionary<int, ContentInfo>();
        public static APIManager GetInstance()
        {
            if (APIManager.gv_Instance == null)
            {
                APIManager.gv_Instance = new APIManager();
            }
            return APIManager.gv_Instance;
        }
        public APIManager()
        {
            try
            {
                VRBackground.Vercoop.Utils.Error.trace("APIManager====001=");
                if (System.IO.Directory.Exists(Vercoop.Config.GetDataDirectory()))
                {
                    //Folder Already Exist
                }
                else
                {
                    System.IO.Directory.CreateDirectory(Vercoop.Config.GetDataDirectory());
                }
                VRBackground.Vercoop.Utils.Error.trace("APIManager====002=");
                LoadLocalContentInfo();
                VRBackground.Vercoop.Utils.Error.trace("APIManager====003=");
            }
            catch (Exception ex)
            {
                
                Error.Instance().AddError(ex.ToString());
            }
            
        }
        public static string GetDeviceToken()
        {
            long seconds = DateTime.Now.Ticks / TimeSpan.TicksPerSecond;
            string url = "http://api.87870.com/store/device_game_regist.php?ver=1";
            url += "&deviceID=" + Vercoop.Config.DeviceUniqueID;
            url += "&store_param=87870VR";
            url += "&nonocache=" + seconds;
            Vercoop.Utils.Error.Log(url);
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "GET";
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            if (response.StatusCode == HttpStatusCode.OK)
            {
                var encoding = ASCIIEncoding.ASCII;
                using (var reader = new System.IO.StreamReader(response.GetResponseStream(), encoding))
                {
                    string responseText = reader.ReadToEnd();
                    JObject result = JObject.Parse(responseText);
                    if (result["result"] != null)
                    {
                        JToken message = result["result"];
                        string code = Convert.ToString(message["code"]);
                        if (code.Equals("000"))
                        {
                            string token = result["token"].ToString();
                            Vercoop.Config.DeviceAccessToken = token;
                            Vercoop.Config.DeviceIDX = Convert.ToInt32(result["idx"].ToString());
                            Vercoop.Config.StoreIDX = Convert.ToInt32(result["store_idx"].ToString());
                            return token;
                        }
                    }
                }
            }
            return null;
        }
        public APIStatus GetStatus()
        {
            APIStatus info = new APIStatus();
            VRBackground.Vercoop.Utils.Error.trace("APIManager====004=");
            foreach (var pair in m_ContentList)
            {
                ContentInfo ctsInfo = pair.Value;
                info.m_cntGamesTotal++;
                if (ctsInfo.m_deletedTime == 0)
                {
                    if (ctsInfo.isResolved())
                    {
                        info.m_cntGamesResolved++;
                    }
                    else
                    {
                        info.m_cntGamesDownloading++;
                    }
                }
            }

            return info;

        }
        private void SaveCurrentStatus()
        {
            try
            {
                VRBackground.Vercoop.Utils.Error.trace("APIManager====005=");
                string filename = Vercoop.Config.GetDataDirectory() + System.IO.Path.DirectorySeparatorChar + API_FILENAME;
                Error.Log(filename);
                VCJsonFile jsonFile = new VCJsonFile(filename, true);
                string jsonString = "{\"DATA\":[";
                int cnt = 0;
                foreach (var pair in m_ContentList)
                {
                    ContentInfo info = pair.Value;
                    info.m_needUpdated = false;
                    if (cnt > 0)
                    {
                        jsonString += ",";
                    }
                    jsonString += info.GetSaveJsonString();
                    cnt++;
                }
                jsonString += "]}";
                jsonFile.SaveData(jsonString);
                VRBackground.Vercoop.Utils.Error.trace("APIManager====006=");
            }
            catch (Exception ex)
            {
                Error.Instance().AddError(ex.ToString());
            }
        }
        //simple version
        private void LoadLocalContentInfo()
        {
            string filename = Vercoop.Config.GetDataDirectory() + System.IO.Path.DirectorySeparatorChar + "content.json";
            String jsonp = System.IO.File.ReadAllText(filename);
            var datas = JsonConvert.DeserializeObject(jsonp);
            var datasArray = (JArray)datas;
            foreach (JToken token in datasArray)
            {
                string ct_idx = token["ct_idx"].ToString();
                int idx = Int32.Parse(ct_idx);
                string title = token["title"].ToString();
                string description = token["description"].ToString();


                ContentInfo info = new ContentInfo(idx, title, description);
                m_ContentList.Add(info.m_cts_idx, info);
            } 
            
        }
        private void LoadLocalContentInfo_1()
        {
            try
            {
                if (Config.LOCAL_DEBUG)
                {
                    ContentInfo info1 = new ContentInfo(1, "Test 1", "Description Test1");
                    ContentInfo info2 = new ContentInfo(2, "Test 2", "Description Test2");
                    ContentInfo info3 = new ContentInfo(3, "Test 3", "Description Test3");

                    m_ContentList.Add(info1.m_cts_idx, info1);
                    m_ContentList.Add(info2.m_cts_idx, info2);
                    m_ContentList.Add(info3.m_cts_idx, info3);
                }
                else
                {
                    VRBackground.Vercoop.Utils.Error.trace("APIManager====007=");
                    string filename = Vercoop.Config.GetDataDirectory() + System.IO.Path.DirectorySeparatorChar + API_FILENAME;
                    Error.Log(filename);
                    VCJsonFile jsonFile = new VCJsonFile(filename, true);
                    String jsonString = jsonFile.GetValue();
                    if (jsonString.Length > 10)
                    {
                        JObject result = JObject.Parse(jsonString);
                        if (result != null)
                        {
                            if (result["DATA"] != null)
                            {
                                JArray datas = (JArray)result["DATA"];
                                foreach (JToken token in datas)
                                {
                                    ContentInfo info = new ContentInfo(token, false);
                                    m_ContentList.Add(info.m_cts_idx, info);
                                }
                            }
                        }
                    }
                    VRBackground.Vercoop.Utils.Error.trace("APIManager====008=");
                }

            }
            catch (Exception ex)
            {
                Error.Instance().AddError(ex.ToString());
            }


        }
        public ContentInfo GetResolvedContent(int cts_idx)
        {
            if (m_ContentList.ContainsKey(cts_idx))
            {
                ContentInfo info = m_ContentList[cts_idx];
                if (info.isResolved())
                {
                    return info;
                }
            }
            return null;
        }
        public void GetContentList(Dictionary<int, Content.ContentInfo> list, string category)
        {
            VRBackground.Vercoop.Utils.Error.trace("APIManager====010=");
            foreach (var pair in m_ContentList)
            {
                ContentInfo info = pair.Value;
                if (info.m_deletedTime == 0)
                {
                    if (info.isResolved())
                    {
                        if (category != null)
                        {
                            if (category.Length > 0)
                            {
                                if (info.m_category.Equals(category))
                                {

                                }
                                else
                                {
                                    //Categroy is Different
                                    continue;
                                }
                            }
                        }
                        list.Add(info.m_cts_idx, info);
                    }
                }
            }
            VRBackground.Vercoop.Utils.Error.trace("APIManager====009=");
        }
        public void resyncRequest()
        {
            m_isStartAPISync = true;
        }
        public void startService()
        {
            if (Config.LOCAL_DEBUG)
            {

            }
            else
            {
                VRBackground.Vercoop.Utils.Error.trace("APIManager====011=");
                m_isStartAPISync = true;
                Thread thread = new Thread(new ThreadStart(run));
                thread.Start();
                Thread.Sleep(1);
            }
            
        }
        private void run()
        {
         /*   while (true)
            {
                if (m_isStartAPISync)
                {
                    bool isErrorOccured = true;
                    try
                    {
                        long currentSeconds = Vercoop.Utils.Utility.GetCurrentSecond() ;
                        string url = Vercoop.Config.APIURL_GAMELIST + "&nonoCache=" + currentSeconds;
                        url += "&deviceToken=" + Vercoop.Config.DeviceAccessToken;
                        url += "&deviceID=" + Vercoop.Config.DeviceUniqueID;
                        if (Vercoop.Config.isGameBackend())
                        {

                        }
                        else
                        {
                            url = Vercoop.Config.APIURL_VIDEOLIST + "&nonoCache=" + currentSeconds;
                        }
                        WebRequest request = WebRequest.Create(url);
                        request.Method = "GET";
                        HttpWebResponse response = (HttpWebResponse)request.GetResponse ();
                        VRBackground.Vercoop.Utils.Error.trace("APIManager====012=");
                        if (response.StatusCode == HttpStatusCode.OK)
                        {
                            var encoding = ASCIIEncoding.ASCII;
                            using (var reader = new System.IO.StreamReader(response.GetResponseStream(), encoding))
                            {
                                string responseText = reader.ReadToEnd();
                                JObject result = JObject.Parse(responseText);
                                string resCode = null;
                                if (result["result"] != null)
                                {
                                    resCode = (result["result"])["code"].ToString();
                                }
                                if (resCode == null)
                                {
                                    Error.Log("Game List API Failed [" + responseText + "]");
                                    continue;
                                }
                                else if (resCode.Equals("000"))
                                {
                                    //Success
                                }
                                else if (resCode.Equals("602"))
                                {
                                    //Access Token is not valid
                                    Vercoop.Config.DeviceAccessToken = GetDeviceToken();
                                    Vercoop.Config.SaveConfigData();
                                    isErrorOccured = false;
                                    continue;
                                }
                                else
                                {
                                    Error.Log("Error Game List [" + resCode + "]");
                                    continue;
                                }
                                JToken dGameInfo = result["games"];
                                if (dGameInfo["count"] != null && dGameInfo["data"] != null)
                                {
                                    int totalCount = Int32.Parse(dGameInfo["count"].ToString());
                                    if (totalCount > 0)
                                    {
                                        JArray datas = (JArray)dGameInfo["data"];
                                        if (datas.Count == totalCount)
                                        {
                                            foreach (var pair in m_ContentList)
                                            {
                                                ContentInfo oldInfo = pair.Value;
                                                if (oldInfo.m_deletedTime == 0)
                                                {
                                                    oldInfo.m_deletedTime = currentSeconds;
                                                }
                                            }
                                            foreach (JToken token in datas)
                                            {
                                                ContentInfo newInfo = new ContentInfo(token, true);
                                                if (newInfo.m_cts_idx > 0)
                                                {
                                                    if (m_ContentList.ContainsKey(newInfo.m_cts_idx))
                                                    {
                                                        ContentInfo oldInfo = m_ContentList[newInfo.m_cts_idx];
                                                        oldInfo.UpdateWithNewInfo(newInfo);
                                                    }
                                                    else
                                                    {
                                                        m_ContentList.Add(newInfo.m_cts_idx, newInfo);
                                                    }
                                                    
                                                }// if(newInfo.m_cts_idx > 0){

                                            }// foreach (JToken token in datas)
                                            isErrorOccured = false;
                                        } // if (datas.Count == totalCount)
                                    } // if (totalCount > 0)
                                }
                            }
                        }
                        VRBackground.Vercoop.Utils.Error.trace("APIManager====013= [" + m_ContentList.Count + "]");
                    }
                    catch (Exception ex)
                    {
                        Error.Instance().AddError(ex.ToString());
                    }
                    finally
                    {
                        if (isErrorOccured)
                        {
                            m_isStartAPISync = true;
                            //If Error Occured sleep 10 seconds and try again
                            Thread.Sleep(10 * 1000);
                        }
                        else
                        {
                            m_isStartAPISync = false;
                        }
                        VRBackground.Vercoop.Utils.Error.trace("APIManager====015=");

                    }// try

                }//if (m_isStartAPISync)


                //Download And Check 
                try
                {
                    
                    while (true)
                    {
                        ContentInfo delContentInfo = null;
                        long currentSeconds = Vercoop.Utils.Utility.GetCurrentSecond();
                        foreach (var pair in m_ContentList)
                        {
                            ContentInfo tmpInfo = pair.Value;
                            if (tmpInfo.m_deletedTime > 0)
                            {
                                long diff = Math.Abs(currentSeconds - tmpInfo.m_deletedTime);
                                if (diff > Vercoop.Config.DELET_CONTENT_INTERVAL)
                                {
                                    delContentInfo = tmpInfo;
                                    break;
                                }
                            }
                            
                        }
                        if (delContentInfo == null)
                        {
                            break;
                        }
                        delContentInfo.DeleteContentData();
                        m_ContentList.Remove(delContentInfo.m_cts_idx);
                        SaveCurrentStatus();
                    }

                    foreach (var pair in m_ContentList)
                    {
                        ContentInfo info = pair.Value;
                        if (info.CleanDownloadInfo())
                        {
                            SaveCurrentStatus();
                        }
                        if (info.SyncAndDownload())
                        {
                            SaveCurrentStatus();
                        }
                        if (info.m_needUpdated)
                        {
                            SaveCurrentStatus();
                        }
                        //VRBackground.Vercoop.Utils.Error.trace("APIManager====016=");
                    }

                }
                catch (Exception ex)
                {
                    Error.Instance().AddError(ex.ToString());
                }
                
            }//while (true) */
        }//private void run()
        
        
    }
}
