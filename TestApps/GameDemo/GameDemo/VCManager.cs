using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Specialized;
using Newtonsoft.Json.Linq;
using System.IO;
using System.Net;
using System.Web;
using System.Net.Sockets;
using System.Threading;
using System.Diagnostics;

namespace GameDemo
{
    public enum REPLAY_STATUS
    {
        YES, 
        NO, 
        ERROR // Timeout case
    };

    class VCUserInfo
    {
        public string user_name = "";
        public string thumbnail = "";
        public Int64 score = 0;
        public Int64 Rank = 1;

        public override string ToString()
        {
            string res = user_name + ":" + thumbnail + "\n";
            res += "       score:" + score + " Rank:" + Rank ;
            return res;
        }
    }
    class VCManager
    {
        public static REPLAY_STATUS CanReplay()
        {
            long seconds = DateTime.Now.Ticks / TimeSpan.TicksPerSecond;
            string url = "http://127.0.0.1:8080/game/can_replay?nocache=" + seconds;
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
                    if (result["code"] != null)
                    {
                        string code = Convert.ToString(result["code"]);
                        if (code.Equals("000"))
                        {
                            string feedBack = result["confirm"].ToString();
                            if (feedBack.Equals("Y"))
                            {
                                return REPLAY_STATUS.YES;
                            }
                            else if (feedBack.Equals("N"))
                            {
                                return REPLAY_STATUS.NO;
                            }

                        }
                    }
                }
            }
            return REPLAY_STATUS.ERROR;
        }
        public static List<VCUserInfo> GetRankingList(int current_score, int progress)
        {
            if (progress < 0) progress = 0;
            else if (progress > 100) progress = 100;
            long seconds = DateTime.Now.Ticks / TimeSpan.TicksPerSecond;
            string url = "http://127.0.0.1:8080/game/ranking?nocache=" + seconds;
            url += "&score=" + current_score;
            url += "&progress=" + progress;

            
            List<VCUserInfo> arrUsers = new List<VCUserInfo>();
            try
            {
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
                request.Method = "GET";
                HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                if (response.StatusCode == HttpStatusCode.OK)
                {
                    var encoding = ASCIIEncoding.ASCII;
                    using (var reader = new System.IO.StreamReader(response.GetResponseStream(), encoding))
                    {
                        string responseText = reader.ReadToEnd();
                        Console.WriteLine(responseText);
                        JObject result = JObject.Parse(responseText);
                        if (result["code"] != null)
                        {
                            string code = Convert.ToString(result["code"]);
                            if (code.Equals("000"))
                            {
                                foreach (JToken element in result["datas"])
                                {

                                    VCUserInfo user = new VCUserInfo();
                                    user.user_name = element["usr_nm"].ToString();
                                    user.thumbnail = element["thumbnail"].ToString();
                                    user.score = Convert.ToInt64(element["score"].ToString());
                                    user.Rank = Convert.ToInt64(element["ranking"].ToString());

                                    arrUsers.Add(user);
                                }

                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());

            }
            return arrUsers;
            
        }
        public static VCUserInfo GetUserInfo()
        {
            long seconds = DateTime.Now.Ticks / TimeSpan.TicksPerSecond;
            string url = "http://127.0.0.1:8080/game/user?nocache=" + seconds;
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "GET";
            try
            {
                HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                if (response.StatusCode == HttpStatusCode.OK)
                {
                    var encoding = ASCIIEncoding.ASCII;
                    using (var reader = new System.IO.StreamReader(response.GetResponseStream(), encoding))
                    {
                        string responseText = reader.ReadToEnd();
                        JObject result = JObject.Parse(responseText);
                        if (result["code"] != null)
                        {
                            string code = Convert.ToString(result["code"]);
                            if (code.Equals("000"))
                            {
                                VCUserInfo info = new VCUserInfo();
                                info.user_name = result["user_name"].ToString();
                                info.thumbnail = result["thumbnail"].ToString();
                                return info;

                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
 
            return null;
        }
    }
}
