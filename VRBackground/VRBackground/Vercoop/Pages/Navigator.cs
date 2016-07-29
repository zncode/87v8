using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Specialized;
using System.IO;

namespace VRBackground.Vercoop.Pages
{
    class Navigator
    {
        public enum ERROR_CODE
        {
            ERR_OK = 0,
            ERR_INVALID_ACCESS = 404,

            ERR_INVALID_PARAM = 301,
            ERR_INVALID_PATH_PARAM = 302,

            ERR_NO_FILE_AT_PATH = 310,
            ERR_PROCESS_IS_ALREADY_RUNNING = 311,
            ERR_PAYMENT_FAILED = 312,

            ERR_NO_CONTENT = 351,
            ERR_NOW_RESOLVING = 352,
            ERR_DOWNLOAD_FAILED = 353,
            ERR_NO_VIDEO_FILE = 354,

            ERR_USER_INVALID = 361,
            ERR_USER_ALREADY_LOGINED = 362,
            ERR_USER_NO_LOGINED_USER = 363,



            ERR_PROCESS_NO_RUNNING = 371,
            ERR_PROCESS_EXIT_FAILED = 372

            

        }
        public static void SetErrorInfo(Dictionary<string, string> resCollection, ERROR_CODE code)
        {
            int error_code = Convert.ToInt32(code);
            resCollection["code"] = error_code.ToString("000");
            switch (code)
            {
                case ERROR_CODE.ERR_OK:
                    resCollection["msg"] = "Success";
                    break;
                case ERROR_CODE.ERR_INVALID_ACCESS:
                    resCollection["msg"] = "Invalid Access";
                    break;
                case ERROR_CODE.ERR_INVALID_PARAM:
                    resCollection["msg"] = "Invalid Parameters";
                    break;
                case ERROR_CODE.ERR_NO_CONTENT:
                    resCollection["msg"] = "No Content";
                    break;
                case ERROR_CODE.ERR_NOW_RESOLVING:
                    resCollection["msg"] = "current resolving";
                    break;
                case ERROR_CODE.ERR_INVALID_PATH_PARAM:
                    resCollection["msg"] = "path is empty";
                    break;
                case ERROR_CODE.ERR_PROCESS_IS_ALREADY_RUNNING:
                    resCollection["msg"] = "Process is already running";
                    break;

                case ERROR_CODE.ERR_PROCESS_NO_RUNNING:
                    resCollection["msg"] = "There is no running process";
                    break;

                case ERROR_CODE.ERR_PROCESS_EXIT_FAILED:
                    resCollection["msg"] = "process exit failed";
                    break;

                case ERROR_CODE.ERR_USER_INVALID:
                    resCollection["msg"] = "Invalid User Information";
                    break;
                case ERROR_CODE.ERR_USER_ALREADY_LOGINED:
                    resCollection["msg"] = "User Already Logined";
                    break;
                case ERROR_CODE.ERR_USER_NO_LOGINED_USER:
                    resCollection["msg"] = "No logined User";
                    break;
                case ERROR_CODE.ERR_NO_VIDEO_FILE:
                    resCollection["msg"] = "No Video File";
                    break;

                default:
                    resCollection["msg"] = "Unknown Error";
                    break;
            }
        }
        public static void ProcRequest(Vercoop.HTTP.HttpProcessor p, String path, NameValueCollection query)
        {
            
            Dictionary<string, string> resCollection = new Dictionary<string, string>();

            resCollection.Add("code", "404");
            resCollection.Add("msg", "Invalid Access");
            VRBackground.Vercoop.Utils.Error.trace("Navigator====001=");
            if (path.Equals("/favicon.ico") || path.Equals("/default.png"))
            {
                resCollection.Clear();
                string iconFile = "app_icon.png";
                if (File.Exists(iconFile))
                {
                    System.IO.Stream fs = System.IO.File.Open(iconFile, FileMode.Open, FileAccess.Read, FileShare.Read);
                    p.writeSuccess("image/png");
                    fs.CopyTo(p.outputStream.BaseStream);
                    p.outputStream.BaseStream.Flush();
                    fs.Close();
                }
                else
                {
                    p.writeFailure();
                }
            }
            else if (path.Equals("/content_list"))
            {
                ContentList.Process(resCollection, query, p);
            }
            else if (path.Equals("/connect"))
            {
                SetErrorInfo(resCollection, ERROR_CODE.ERR_INVALID_PARAM);
                Boolean isTestCase = false;
                if (query["is_test"] != null)
                {
                    if (query["is_test"].Equals("yes"))
                    {
                        isTestCase = true;
                    }
                }
                if (query["device_id"] != null && query["name"] != null)
                {
                    string device_id = query["device_id"];
                    string device_name = query["name"];
                    if (device_id.Length > 10 && device_name.Length > 0)
                    {
                        StatusInfo.CONNECTED_DEVICE_ID = Utils.VCAES.Base64Decode(device_id);
                        StatusInfo.CURRENT_DEVICE_NAME = Utils.VCAES.Base64Decode(device_name);

                        resCollection["device_idx"] = Convert.ToString(Vercoop.Config.DeviceIDX);
                        SetErrorInfo(resCollection, ERROR_CODE.ERR_OK);
                    }
                    if (isTestCase)
                    {

                    }
                    else
                    {

                        PlayGame.cleanProcess();
                        UserManager.cleanUser();
                    }
                }
            }
            else if (path.Equals("/thumbnail"))
            {
                Thumbnail.Process(resCollection, query, p);
            }
            else if (path.Equals("/coverimage"))
            {
                Thumbnail.ProcCoverData(resCollection, query, p);
            }
            else if (path.Equals("/game/user"))
            {
                Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_OK);
                UserManager.GetUserInfoJson(resCollection);
            }
            else if (path.Equals("/game/ranking")) {
                UserManager.ProcessGameRanking(resCollection, query, p);
            }
            else if (path.Equals("/game/can_replay"))
            {
                PlayGame.CanReplayGame(resCollection, query, p);
            }
            else if (path.Equals("/response/replayGame"))
            {
                PlayGame.ResponseReplayGame(resCollection, query, p);
            
            }
            else if (path.Equals("/playgame") || path.Equals("/playvideo"))
            {

                PlayGame.Process(resCollection, query, p);
            }
            else if (path.Equals("/videofile"))
            {
                //Test Case
                PlayGame.showVideoFile(resCollection, query, p);
            }
            else if (path.Equals("/cleanProcess"))
            {
                PlayGame.StopProcess(resCollection, query, p);
            }
            else if (path.Equals("/checkStatus"))
            {
                PlayGame.CheckStatus(resCollection, query, p);
            }
            else if (path.Equals("/usr_login"))
            {
                UserManager.UserLoginRequest(resCollection, query, p);
            }
            else if (path.Equals("/usr_logout"))
            {
                UserManager.UserLogoutRequest(resCollection, query, p);
            }
            else if (path.Equals("/tst_timeout"))
            {
                System.Threading.Thread.Sleep(10000);
            }
            if (resCollection.Count > 1)
            {
                p.writeSuccess(/*"text/json" */);
                string json = "{";
                int count = 0;
                foreach (var pair in resCollection)
                {

                    if (count > 0) json += ",";
                    json += "\"" + pair.Key + "\":";
                    if (pair.Key.Equals("object") || pair.Key.Equals("datas"))
                    {
                        json += pair.Value;
                    }
                    else
                    {
                        json += "\"" + pair.Value + "\"";
                    }
                    count++;
                }
                json += "}";
                p.outputStream.Write(json);
            }

            VRBackground.Vercoop.Utils.Error.trace("Navigator====002=");
        }
    }
}
