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
    enum GAME_ACTION_REQUEST
    {
        NONE = 0,
        CAN_REPLAY = 101
    }
    enum GAME_ACTION_RESPONSE
    {
        NONE = 0,
        REQUESTED = 1,
        WAIT_RESPONSE = 2,
        REPLAY_OK = 201,
        REPLAY_NO = 202,
    }

    class PlayGame
    {
        private static Process currentProcess = null;
        public static int currentContentIdx = 0;
        public static string m_ReplayFeedBack = null;
        private static long prevResonseTime = 0;
        private static Boolean isPrevResponseOccupied = false;
        private static GAME_ACTION_REQUEST m_currentActionCode = GAME_ACTION_REQUEST.NONE;
        private static GAME_ACTION_RESPONSE m_currentActionResponse = GAME_ACTION_RESPONSE.NONE;
        private static string myLock = "PlayGame_lock";



        public static void CheckStatus(Dictionary<string, string> resCollection, NameValueCollection query, Vercoop.HTTP.HttpProcessor p)
        {
            Boolean isOccupied = false;
            long currentSeconds = 0;
            for (int i = 0; i < 10; i++)
            {
                currentSeconds = Vercoop.Utils.Utility.GetCurrentSecond();
                long diff = currentSeconds - prevResonseTime;
                if (diff < 0) diff = -diff;

                if (currentProcess == null)
                {
                    isOccupied = false;
                }
                else
                {
                    isOccupied = true;
                }
                if (isOccupied != isPrevResponseOccupied)
                {
                    break;
                }
                if (m_currentActionResponse == GAME_ACTION_RESPONSE.REQUESTED)
                {
                    m_currentActionResponse = GAME_ACTION_RESPONSE.WAIT_RESPONSE;
                    break;
                }


                if (diff > 10)
                {
                    break;
                }
                System.Threading.Thread.Sleep(1000);
            }
            prevResonseTime = currentSeconds;
            Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_OK);
            isPrevResponseOccupied = isOccupied;
            if (isOccupied)
            {
                resCollection["occupied"] = "YES";
            }else{
                resCollection["occupied"] = "NO";
            }
            resCollection["action_code"] = Convert.ToString(Convert.ToInt32(m_currentActionCode));
            
            resCollection["device_idx"] = Convert.ToString(Vercoop.Config.DeviceIDX);
        }
        public static void ResponseReplayGame(Dictionary<string, string> resCollection, NameValueCollection query, Vercoop.HTTP.HttpProcessor p)
        {
            string response = "";
            foreach (string key in query.AllKeys)
            {
                if (key.Equals("replay"))
                {
                    if (query["replay"] != null)
                    {
                        response = query["replay"];
                    }
                }
            }

            Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_OK);
            m_currentActionCode = GAME_ACTION_REQUEST.NONE;
            if (response.Equals("yes") && m_currentActionResponse == GAME_ACTION_RESPONSE.WAIT_RESPONSE)
            {
                m_currentActionResponse = GAME_ACTION_RESPONSE.REPLAY_OK;
            }
            else
            {
                m_currentActionResponse = GAME_ACTION_RESPONSE.REPLAY_NO;
            }

        }
        public static void CanReplayGame(Dictionary<string, string> resCollection, NameValueCollection query, Vercoop.HTTP.HttpProcessor p)
        {
            lock (myLock)
            {
                m_currentActionCode = GAME_ACTION_REQUEST.CAN_REPLAY;
                m_currentActionResponse = GAME_ACTION_RESPONSE.REQUESTED;
                for (int i = 0; i < 100; i++)
                {
                    if (m_currentActionResponse >= GAME_ACTION_RESPONSE.REPLAY_OK)
                    {
                        break;
                    }
                    System.Threading.Thread.Sleep(100);
                }
                Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_OK);
                m_currentActionCode = GAME_ACTION_REQUEST.NONE;
                if (m_currentActionResponse == GAME_ACTION_RESPONSE.REPLAY_OK)
                {
                    resCollection["confirm"] = "Y";
                }
                else
                {
                    resCollection["confirm"] = "N";
                }
            }
        }
        public static void StopProcess(Dictionary<string, string> resCollection, NameValueCollection query, Vercoop.HTTP.HttpProcessor p)
        {
            currentContentIdx = 0;
            resCollection.Clear();
            if (currentProcess != null)
            {
                currentProcess.Kill();
                Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_OK);
            }
            else
            {
                Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_PROCESS_NO_RUNNING);
            }
           
        }
        public static void cleanProcess()
        {
            if (currentProcess != null)
            {
                currentProcess.Kill();
            }
        }
        public static void showVideoFile(Dictionary<string, string> resCollection, NameValueCollection query, Vercoop.HTTP.HttpProcessor p)
        {
            resCollection.Clear();
            try
            {
                int cts_idx = 0;
                int payment_idx = 0;
                string payment_token = null;
                int manager_user_idx = 0;
                foreach (string key in query.AllKeys)
                {
                    if (key.Equals("idx"))
                    {
                        cts_idx = Convert.ToInt32(query[key]);
                    }
                    else if (key.Equals("man_usr_idx"))
                    {
                        manager_user_idx = Convert.ToInt32(query[key]);
                    }
                    else if (key.Equals("pay_idx"))
                    {
                        payment_idx = Convert.ToInt32(query[key]);
                    }
                    else if (key.Equals("pay_token"))
                    {
                        payment_token = Convert.ToString(query[key]);
                    }
                }
                if (cts_idx > 0)
                {
                    currentContentIdx = cts_idx;
                    Content.ContentInfo info = Content.APIManager.GetInstance().GetResolvedContent(cts_idx);
                    if (info != null)
                    {
                        string path = info.GetExcutePath();
                        if (path == null)
                        {
                            Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_NO_FILE_AT_PATH);
                        }
                        else
                        {
                            Vercoop.Utils.MovieService.DownloadLargeFile(path, p);                            
                            return;
                        }

                    }
                    else
                    {
                        Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_NO_CONTENT);
                    }
                }
                else
                {
                    Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_INVALID_PARAM);
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
                    currentContentIdx = cts_idx;
                    Content.ContentInfo info = Content.APIManager.GetInstance().GetResolvedContent(cts_idx);
                    if (info != null)
                    {
                        string path = info.GetExcutePath();
                        if (path == null)
                        {
                            Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_NO_FILE_AT_PATH);
                        }
                        else
                        {
                            currentProcess = System.Diagnostics.Process.Start(path);
                            currentProcess.EnableRaisingEvents = true;
                            currentProcess.Exited += new EventHandler(myProcess_Exited);
  

                            Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_OK);
                            return;
                        }

                    }
                    else
                    {
                        Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_NO_CONTENT);
                    }
                }
                else
                {
                    Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_INVALID_PARAM);
                }
            }
            catch (Exception ex)
            {
                Utils.Error.Instance().AddError(ex.ToString());
            }

        }

        public static void Process_1(Dictionary<string, string> resCollection, NameValueCollection query, Vercoop.HTTP.HttpProcessor p)
        {
            resCollection.Clear();
            try
            {
                int cts_idx = 0;
                int payment_idx = 0;
                string payment_token = null;
                int manager_user_idx = 0;
                foreach (string key in query.AllKeys)
                {
                    if (key.Equals("idx"))
                    {
                        cts_idx = Convert.ToInt32(query[key]);
                    }
                    else if (key.Equals("man_usr_idx"))
                    {
                        manager_user_idx = Convert.ToInt32(query[key]);
                    }
                    else if (key.Equals("pay_idx"))
                    {
                        payment_idx = Convert.ToInt32(query[key]);
                    }
                    else if (key.Equals("pay_token"))
                    {
                        payment_token = Convert.ToString(query[key]);
                    }
                }
                if (cts_idx > 0 && manager_user_idx > 0)
                {
                    currentContentIdx = cts_idx;
                    Content.ContentInfo info = Content.APIManager.GetInstance().GetResolvedContent(cts_idx);
                    if (info != null)
                    {
                        string path = info.GetExcutePath();
                        if (path == null)
                        {
                            Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_NO_FILE_AT_PATH);
                        }
                        else
                        {
                            if (currentProcess == null)
                            {
                                //payment_idx = 5;
                                //payment_token = "0c71bb724dae6d15a028baa1d673a52b";
                                if (payment_idx > 0 && payment_token != null)
                                {

                                }
                                else
                                {
                                    payment_idx = 0; payment_token = "";
                                }
                                int play_count = info.GetPlayCount();
                                if (Config.LOCAL_DEBUG)
                                {

                                }
                                else
                                {
                                    if (true && info.isGameContent())
                                    {
                                        string result = UserManager.ConfirmPayment(cts_idx, payment_idx, payment_token, manager_user_idx, ref play_count);
                                        if (result != null)
                                        {
                                            //Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_PAYMENT_FAILED);
                                            // resCollection["msg"] = result;
                                            //return;
                                        }
                                    }
                                    else
                                    {
                                        play_count++;
                                    }

                                    if (info.isGameContent())
                                    {

                                    }
                                    else
                                    {
                                        if (Utils.Utility.ReUnityWriteText(Vercoop.Config.VideoPlayerConfigFile, path))
                                        {
                                            path = Vercoop.Config.VideoPlayerProcessFile;
                                        }
                                        else
                                        {
                                            Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_NO_VIDEO_FILE);
                                            return;
                                        }
                                        //play_count = info.GetPlayCount();
                                    }

                                }
                                
                                currentProcess = System.Diagnostics.Process.Start(path);
                                currentProcess.EnableRaisingEvents = true;
                                currentProcess.Exited += new EventHandler(myProcess_Exited);
                                info.SetPlayCount(play_count);
                                resCollection["play_count"] = Convert.ToString(play_count);
                                Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_OK);
                                return;
                               
                            }
                            else
                            {
                                Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_PROCESS_IS_ALREADY_RUNNING);
                                return;
                            }
                        }
                        
                    }
                    else
                    {
                        Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_NO_CONTENT);
                    }
                }
                else
                {
                    Navigator.SetErrorInfo(resCollection, Navigator.ERROR_CODE.ERR_INVALID_PARAM);
                }
            }
            catch (Exception ex)
            {
                Utils.Error.Instance().AddError(ex.ToString());
            }

        }

        private static void myProcess_Exited(object sender, System.EventArgs e)
        {
            Utils.Error.trace("Process Exited");
            m_currentActionCode = GAME_ACTION_REQUEST.NONE;
            m_currentActionResponse = GAME_ACTION_RESPONSE.NONE;
            currentProcess = null;
        }
    }
}
