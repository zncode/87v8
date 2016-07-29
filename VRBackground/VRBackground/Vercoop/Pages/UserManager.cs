using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Specialized;
using System.IO;
using System.Text.RegularExpressions;
using System.Diagnostics;
using Newtonsoft.Json.Linq;
using System.Net;
using System.Web;
using System.Net.Sockets;
using VRBackground.Vercoop.Utils;


namespace VRBackground.Vercoop.Pages
{
    class VCScoreInfo
    {
        public int score_idx = 0;
        public UInt64 score_sum = 0;
        public UInt64 score_max = 0;
        public UInt64 score_current = 0;
        public UInt64 cnt_play = 0;
        public int level_progress = 0;
        public int ranking = 0;

        public VCScoreInfo Colon()
        {
            VCScoreInfo info = new VCScoreInfo(0, 0);
            info.score_idx = this.score_idx;
            info.score_sum = this.score_sum;
            info.score_max = this.score_max;
            info.score_current = this.score_current;
            info.cnt_play = this.cnt_play;
            info.level_progress = this.level_progress;
            info.ranking = this.ranking;
            return info;
        }
        public VCScoreInfo(int score, int progress)
        {
            score_current = (UInt64)score;
            level_progress = progress;

        }
        public VCScoreInfo(JToken token)
        {
            this.score_idx = Convert.ToInt32(token["idx"].ToString());
            this.score_sum = Convert.ToUInt64(token["sum"].ToString());
            this.score_max = Convert.ToUInt64(token["max"].ToString());
            this.score_current = Convert.ToUInt64(token["score"].ToString());
            this.cnt_play = Convert.ToUInt64(token["cnt_play"].ToString());

        }
        public override string ToString()
        {
            string res = Convert.ToString(this.score_idx) + ":" + Convert.ToString(this.cnt_play)
                + ":" + Convert.ToString(this.score_current)
                + "<" + Convert.ToString(this.score_max);
            return res;
        }
    }
    class VCUserInfo
    {
        public string user_name = "";
        public string user_nickname = "";
        public int user_idx = 0;
        public string user_description = "";
        public string thumbnail = "";
        public VCScoreInfo m_scoreInfo = null;
        public VCUserInfo Colon()
        {
            VCUserInfo info = new VCUserInfo();
            info.user_name = this.user_name;
            info.user_nickname = this.user_nickname;
            info.user_idx = this.user_idx;
            info.user_description = this.user_description;
            info.thumbnail = this.thumbnail;
            if (this.m_scoreInfo == null)
            {
                info.m_scoreInfo = null;
            }
            else
            {
                VCScoreInfo score = this.m_scoreInfo.Colon();
                info.m_scoreInfo = score;

            }

            return info;
        }

        public VCUserInfo()
        {
            user_name = "Guest User";
            thumbnail = "http://127.0.0.1:8787/default.png";
            m_scoreInfo = new VCScoreInfo(0, 0);

        }
        public VCUserInfo(JToken token)
        {
            this.user_name = GetValidString(Convert.ToString(token["usr_nm"]));
            this.user_nickname = GetValidString(Convert.ToString(token["usr_nickname"]));
            this.user_idx = Convert.ToInt32(GetValidString(Convert.ToString(token["usr_idx"])));
            this.user_description = GetValidString(Convert.ToString(token["usr_desc"]));
            JArray thumbs = (JArray)token["usr_thumb"];
            int max_width = 0;
            foreach (JToken info in thumbs)
            {
                int width = Convert.ToInt32(info["width"].ToString());
                if (width > max_width)
                {
                    max_width = width;
                    this.thumbnail = Convert.ToString(info["url"]);
                }


            }
        }

        public string GetDisplayUsername()
        {
            if (user_nickname.Length > 0)
            {
                return user_nickname;
            }
            return user_name;
        }

        private string GetValidString(string str)
        {
            if (str == null)
            {
                return "";
            }
            else if (str is string)
            {
                if (str.ToLower().Equals("null"))
                {
                    return "";
                }
                return str;
            }
            return "";
        }
    }
    class UserManager
    {
        private static string myLock = "lockme";
        private static CookieContainer m_currentLoginCookie = null;
        private static VCUserInfo m_CurrentUserInfo = null;
        public static void UserLogoutRequest(Dictionary<string, string> resCollection, NameValueCollection query, Vercoop.HTTP.HttpProcessor p)
        {
            lock (myLock)
            {
                resCollection.Clear();
                m_currentLoginCookie = null;
                if (m_CurrentUserInfo == null)
                {
                    Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_USER_NO_LOGINED_USER);
                }
                else
                {
                    m_CurrentUserInfo = null;
                    Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_OK);
                }
            }
        }
        public static string ConfirmPayment(int content_idx, int payment_idx, string payment_token, int mamanger_user_idx, ref int play_count)
        {
            try
            {
                lock (myLock)
                {
                    long seconds = DateTime.Now.Ticks / TimeSpan.TicksPerSecond;
                    string url = "http://api.87870.com/store/pay_confirm.php?ver=1";
                    url += "&deviceToken=" + Config.DeviceAccessToken;
                    url += "&deviceID=" + Config.DeviceUniqueID;
                    url += "&content_idx=" + content_idx;
                    url += "&pay_idx=" + payment_idx;
                    url += "&pay_token=" + payment_token;
                    url += "&manager_user=" + mamanger_user_idx;

                    url += "&store_param=87870VR";
                    url += "&nonocache=" + seconds;

                    Console.WriteLine(url);
                    Utils.Error.Log("Payment URL: [" + url + "]");
                    HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
                    request.CookieContainer = m_currentLoginCookie;
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
                                string msg = Convert.ToString(message["msg"]);
                                if (code.Equals("000"))
                                {
                                    var cnt = Convert.ToInt32(message["play_count"].ToString());
                                    play_count = cnt;
                                    return null;
                                }
                                else
                                {
                                    return msg;
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Error.Instance().AddError(ex.ToString());
            }
            return "Unkown Error";
        }
        public static void ProcessGameRanking(Dictionary<string, string> resCollection, NameValueCollection query, Vercoop.HTTP.HttpProcessor p)
        {
            int score = 0;
            int progress = 0;
            foreach (string key in query.AllKeys)
            {
                if (key == null) continue;
                if (key.Equals("score"))
                {
                    score = Convert.ToInt32(query[key]);
                }
                else if (key.Equals("progress"))
                {
                    progress = Convert.ToInt32(query[key]);
                }
            }
            if (score > 0 && progress > 0)
            {
                lock (myLock)
                {
                    List<VCUserInfo> arrUserList = GetScoreList(score, progress);
                    string json_string = null;
                    if (arrUserList != null)
                    {
                        for (int i = 0; i < arrUserList.Count; i++)
                        {
                            if (json_string == null)
                            {
                                json_string = "[";
                            }
                            if (i > 0)
                            {
                                json_string += ",";
                            }
                            VCUserInfo user = arrUserList[i];
                            json_string += "{\"usr_idx\":\"" + user.user_idx + "\"";
                            json_string += ",\"usr_nm\":\"" + user.GetDisplayUsername() + "\"";
                            json_string += ",\"thumbnail\":\"" + user.thumbnail + "\"";
                            json_string += ",\"score\":\"" + user.m_scoreInfo.score_current + "\"";
                            json_string += ",\"ranking\":\"" + user.m_scoreInfo.ranking + "\"";
                            json_string += "}";

                        }
                        if (json_string != null)
                        {
                            json_string += "]";
                            Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_OK);
                            resCollection["datas"] = json_string;
                        }
                    }
                }
            }
        }
        public static void cleanUser()
        {
            lock (myLock)
            {
                m_currentLoginCookie = null;
                m_CurrentUserInfo = null;
            }
        }
        
        private static VCScoreInfo AddScoreInfo(string this_device_id, string this_device_token, int game_idx, int score, int progress)
        {
            long seconds = DateTime.Now.Ticks / TimeSpan.TicksPerSecond;
            string url = "http://api.87870.com/store/ranking_set.php?ver=1";
            url += "&deviceToken=" + this_device_token;
            url += "&deviceID=" + this_device_id;
            url += "&game_idx=" + game_idx;
            url += "&score=" + score;
            url += "&progress=" + progress;

            url += "&store_param=87870VR";
            url += "&nonocache=" + seconds;
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.CookieContainer = m_currentLoginCookie;
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
                            string strGameIdx = Convert.ToString(result["center_idx"]);
                            if (result["scoreInfo"] != null)
                            {
                                VCScoreInfo info = new VCScoreInfo(result["scoreInfo"]);
                                return info;
                            }
                        }
                    }
                }
            }
            return null;
        } 
        
        private static List<VCUserInfo> GetScoreList(int score, int progress)
        {
            try
            {
                Utils.Error.trace("Start Score List");
                if (m_CurrentUserInfo != null)
                {
                    VCScoreInfo myScore = AddScoreInfo(Vercoop.Config.DeviceUniqueID, 
                                                    Vercoop.Config.DeviceAccessToken,
                                                    PlayGame.currentContentIdx, score, progress);


                }
                long seconds = DateTime.Now.Ticks / TimeSpan.TicksPerSecond;
                string url = "http://api.87870.com/store/ranking_top.php?ver=1";
                url += "&game_idx=" + PlayGame.currentContentIdx;
                url += "&score=" + score;
                url += "&store_param=87870VR";
                url += "&nonocache=" + seconds;
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
                request.CookieContainer = m_currentLoginCookie;
                request.Method = "GET";
                HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                if (response.StatusCode == HttpStatusCode.OK)
                {
                    var encoding = ASCIIEncoding.ASCII;
                    using (var reader = new System.IO.StreamReader(response.GetResponseStream(), encoding))
                    {
                        string responseText = reader.ReadToEnd();
                        Utils.Error.trace(responseText);
                        JObject result = JObject.Parse(responseText);

                        if (result["result"] != null)
                        {
                            JToken message = result["result"];
                            string code = Convert.ToString(message["code"]);
                            if (code.Equals("000"))
                            {
                                if (result["infos"] != null)
                                {
                                    JToken infos = result["infos"];
                                    VCUserInfo currentUser = null;
                                    if (m_CurrentUserInfo == null)
                                    {
                                        currentUser = new VCUserInfo();

                                    }
                                    else
                                    {
                                        currentUser = m_CurrentUserInfo.Colon();
                                    }
                                    if (currentUser.m_scoreInfo == null)
                                    {
                                        currentUser.m_scoreInfo = new VCScoreInfo(score, progress);
                                    }
                                    currentUser.m_scoreInfo.score_current = Convert.ToUInt64(infos["current_score"].ToString());
                                    currentUser.m_scoreInfo.ranking = Convert.ToInt32(infos["current_rank"].ToString());
                                    List<VCUserInfo> arrUsers = new List<VCUserInfo>();
                                    arrUsers.Add(currentUser);

                                    int rank = 1;
                                    foreach (JToken element in infos["rankings"])
                                    {
                                        VCUserInfo user = new VCUserInfo();
                                        user.user_nickname = element["usr_nm"].ToString();
                                        user.thumbnail = element["thumbnail"].ToString();
                                        user.user_idx = Convert.ToInt32(element["usr_idx"].ToString());
                                        user.m_scoreInfo.score_current = Convert.ToUInt64(element["score"].ToString());
                                        user.m_scoreInfo.ranking = rank;
                                        rank++;
                                        arrUsers.Add(user);

                                    }
                                    return arrUsers;
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Utils.Error.trace(ex.ToString());
            }
            return null;




        }

        public static void UserLoginRequest(Dictionary<string, string> resCollection, NameValueCollection query, Vercoop.HTTP.HttpProcessor p)
        {
            lock(myLock){
                resCollection.Clear();
                int user_idx = 0;
                string access_key = null;

                foreach (string key in query.AllKeys)
                {
                    if (!Vercoop.Utils.Utility.isValidString(key))
                    {
                        continue;
                    }
                    if (key.Equals("user_idx"))
                    {
                        user_idx = Convert.ToInt32(query[key]);
                    }
                    else if (key.Equals("access_key"))
                    {
                        access_key = VRBackground.Vercoop.Utils.VCAES.Base64Decode(query[key]);
                    }
                }
                if (access_key != null && user_idx > 0)
                {

                    if (m_CurrentUserInfo == null)
                    {
                        m_currentLoginCookie = new CookieContainer();
                        m_CurrentUserInfo = user_keyLogin(user_idx, access_key);
                        Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_OK);
                        GetUserInfoJson(resCollection);
                    }
                    else
                    {
                        Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_USER_ALREADY_LOGINED);
                    }
                }
                else
                {
                    Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_USER_INVALID);
                }
            }
        }
        public static void GetUserInfoJson(Dictionary<string, string> resCollection)
        {
            string user_idx = "0";
            string user_name = "Guest User";
            string thumbnail = "http://127.0.0.1:8787/default.png";

            if (m_CurrentUserInfo != null)
            {
                user_idx = Convert.ToString(m_CurrentUserInfo.user_idx);
                user_name = m_CurrentUserInfo.GetDisplayUsername();
                thumbnail = m_CurrentUserInfo.thumbnail;
            }
            resCollection["user_idx"] = user_idx;
            resCollection["user_name"] = user_name;
            resCollection["thumbnail"] = thumbnail;
        }
        private static VCUserInfo user_keyLogin(int user_idx, string access_key){
            long seconds = DateTime.Now.Ticks / TimeSpan.TicksPerSecond;
            string url = "http://api.87870.com/store/usr_key_login.php?ver=1&nonocache=" + seconds;
            url += "&usr_idx=" + Convert.ToString(user_idx);
            url += "&access_key=" + access_key;

            url += "&store_param=87870VR";
            Console.WriteLine(url);
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.CookieContainer = m_currentLoginCookie;
            request.Method = "GET";
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            if (response.StatusCode == HttpStatusCode.OK)
            {
                Utils.Error.trace("Cookie " + m_currentLoginCookie);
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
                            string strGameIdx = Convert.ToString(result["center_idx"]);
                            if (result["usr_info"] != null)
                            {
                                VCUserInfo info = new VCUserInfo(result["usr_info"]);
                                return info;
                            }
                        }
                    }
                }
            }
            return null;
        }
    }
}
