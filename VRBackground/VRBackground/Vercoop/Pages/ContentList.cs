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
    class ContentList
    {
        public static void Process(Dictionary<string, string> resCollection, NameValueCollection query, Vercoop.HTTP.HttpProcessor p)
        {
            resCollection["code"] = "000";
            resCollection["msg"] = "Success";

      /*      string json = "[";
            json += "{";
            json += "\"ct_idx\":\"13237\"";
            json += ",\"price\":\"10\"";
            json += ",\"version\":\"1\"";
            json += ",\"category\":\"99\"";
            json += ",\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaa\"";
            json += ",\"play_count\":\"1\"";
            json += ",\"product_id\":\"1\"";
            json += ",\"title\":\"bbbbbb\"";
            json += ",\"developer\":\"fk\"";
            json += ",\"age\":\"20\"";
            json += ",\"upload_date\":\"2016\"";
            json += ",\"ct_type\":\"AAA\"";
            json += ",\"size\":\"223MB\"";
            json += "}";

            json += ",";

            json += "{";
            json += "\"ct_idx\":\"33607\"";
            json += ",\"price\":\"10\"";
            json += ",\"version\":\"1\"";
            json += ",\"category\":\"99\"";
            json += ",\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaa\"";
            json += ",\"play_count\":\"1\"";
            json += ",\"product_id\":\"1\"";
            json += ",\"title\":\"bbbbbb\"";
            json += ",\"developer\":\"fk\"";
            json += ",\"age\":\"20\"";
            json += ",\"upload_date\":\"2016\"";
            json += ",\"ct_type\":\"AAA\"";
            json += ",\"size\":\"223MB\"";
            json += "}";

            json += "]"; */

            string filename = Vercoop.Config.GetDataDirectory() + System.IO.Path.DirectorySeparatorChar + "content.json";
            String jsonp = System.IO.File.ReadAllText(filename);
            resCollection["count"] = "0";

            resCollection["datas"] = jsonp;

        }

        public static void Processa(Dictionary<string, string> resCollection, NameValueCollection query, Vercoop.HTTP.HttpProcessor p)
        {
            resCollection["code"] = "000";
            resCollection["msg"] = "Success";

            string category = "";
            foreach (string key in query.AllKeys)
            {
                if (key.Equals("ca"))
                {
                    category = query[key];
                }
            }
            Dictionary<int, Content.ContentInfo> contents = new Dictionary<int, Content.ContentInfo>();
            Content.APIManager.GetInstance().GetContentList(contents, category);
            int len = contents.Count;
            resCollection["count"] = Convert.ToString(len);
            if (len > 0)
            {
                int index = 0;
                var json = "[";
                foreach (var pair in contents)
                {
                    Content.ContentInfo info = pair.Value;
                    if (index > 0)
                    {
                        json += ",";
                    }
                    json += info.GetResponseJsonString();
                    index++;
                }
                json += "]";
                resCollection["datas"] = json;
            }

        }
    }
}
