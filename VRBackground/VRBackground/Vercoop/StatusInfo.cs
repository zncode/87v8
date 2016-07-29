using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRBackground.Vercoop
{
    
    class StatusInfo
    {
        public static string IP_ADDRESS = "";
        public static string GAME_COUNT_INFO = "0/0/0";
        public static string CONNECTED_DEVICE_ID = "";
        public static string CURRENT_DEVICE_NAME = "";
        private static string myLock = "lock";


        public static void LoadStatusInfo()
        {
            lock (myLock)
            {
                //GET IP Address
                IP_ADDRESS = Vercoop.Utils.Utility.GetLocalIPAddress();
                Vercoop.Content.APIStatus apiInfo = Vercoop.Content.APIManager.GetInstance().GetStatus();
                GAME_COUNT_INFO = Convert.ToString(apiInfo.m_cntGamesResolved) + " + " + Convert.ToString(apiInfo.m_cntGamesDownloading) + "=" + Convert.ToString(apiInfo.m_cntGamesTotal);

            }
        }
    }
}
