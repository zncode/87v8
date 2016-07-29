using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

using System.Threading;
using Microsoft.Win32;



namespace VRBackground
{
    public partial class FrmMain : Form


    {
        private NotifyIcon myTrayIcon = null;
        private ContextMenu myTrayMenu = null;

        public FrmMain()
        {
            //registFirstLunch();
            InitializeComponent();
            VRBackground.Vercoop.Utils.Error.trace("Main Frame====001=");
            ProcessAfterInitializeUI();

            
        }
        private void registFirstLunch()
        {
            string subKey = "SOFTWARE\\Mircrosoft\\Windows\\CurrentVersion\\Run";
            string appName = "87VR_BACKEND";
            RegistryKey rk = Registry.CurrentUser.OpenSubKey(subKey, true);
            if (rk == null)
            {
                rk = Registry.CurrentUser.CreateSubKey(subKey);
            }
            if (rk != null)
            {
                string path = Application.ExecutablePath.ToString();
                var value = rk.GetValue(appName);
                if (value != null)
                {
                    if (path.Equals(value.ToString()))
                    {
                        //No Need to set again
                    }
                    else
                    {
                        value = null;
                    }
                }
                if (value == null)
                {
                    rk.SetValue(appName, path);
                }

            }
            else
            {
                MessageBox.Show("Failed to Register to Sub Key");
            }
        }
        private void ProcessAfterInitializeUI()
        {
            Vercoop.Config.LoadConfig();
         /*   if (!Vercoop.Config.isValidConfig())
            {
                if (Vercoop.Config.DeviceIDX == 0)
                {

                    MessageBox.Show("Device ID is not registered");
                }
                else if (Vercoop.Config.StoreIDX == 0)
                {
                    MessageBox.Show("Device [" + Vercoop.Config.DeviceIDX + "] does not assigned store.");
                }
                else
                {
                    MessageBox.Show("Device Token is not registered");
                }
                OnExit(null, null);
                return;
            } */ //simple version

            this.Text = Vercoop.Config.ApplicationName;
            IntPtr Hicon = VRBackground.Properties.Resources.icon_600.GetHicon();
            this.Icon = Icon.FromHandle(Hicon);
            myTrayIcon = new NotifyIcon();
            myTrayIcon.Text = Vercoop.Config.ApplicationName;
            myTrayIcon.Icon = Icon.FromHandle(Hicon);

            myTrayMenu = new ContextMenu();
            myTrayMenu.MenuItems.Add("Re-Sync Content", OnForceToResync);
            myTrayMenu.MenuItems.Add("Show Status", OnShowStatusView);
            myTrayMenu.MenuItems.Add("Exit", OnExit);

            myTrayIcon.ContextMenu = myTrayMenu;
            myTrayIcon.Visible = true;


            Vercoop.HTTP.HttpServer httpServer;
            httpServer = new Vercoop.HTTP.MyHttpServer(Vercoop.Config.HTTP_PORT);
            Thread thread = new Thread(new ThreadStart(httpServer.listen));
            thread.Start();

            VRBackground.Vercoop.Utils.Error.trace("Main Frame====002=");

            Vercoop.Content.APIManager.GetInstance().startService();
            System.Windows.Forms.Timer tmStatus = new System.Windows.Forms.Timer();
            tmStatus.Interval = 10 * 1000; // 10 seconds
            tmStatus.Tick += new EventHandler(OnTimer_StatusUpdate);
            tmStatus.Start();

            System.Windows.Forms.Timer tmUpdate = new System.Windows.Forms.Timer();
            tmUpdate.Interval = Vercoop.Config.ContentSynInterval * 1000; 
            tmUpdate.Tick += new EventHandler(OnTimer_ResyncAPI);
            tmUpdate.Start();
            OnTimer_StatusUpdate(null, null);
            OnTimer_ResyncAPI(null, null);

            VRBackground.Vercoop.Utils.Error.trace("Main Frame====003=");

            
        }

        private void FrmMain_FormClosing(object sender, FormClosingEventArgs e)
        {
            if (e.CloseReason == CloseReason.UserClosing)
            {
                this.Visible = false;
                this.ShowInTaskbar = false;
                e.Cancel = true;
            }
        }
        private void OnForceToResync(object sender, EventArgs e)
        {
            Vercoop.Content.APIManager.GetInstance().resyncRequest();
        }
        private void OnShowStatusView(object sender, EventArgs e)
        {
            this.Visible = true;
            this.ShowInTaskbar = true;
        }
        private void OnExit(object sender, EventArgs e)
        {

            VRBackground.Vercoop.Utils.Error.trace("Main Frame====004=");
            if (myTrayIcon != null)
            {

                myTrayIcon.Visible = false;
            }
            Environment.Exit(0);
        }
        private void OnTimer_StatusUpdate(object sender, EventArgs e)
        {

            VRBackground.Vercoop.Utils.Error.trace("Main Frame====006=");
            Vercoop.StatusInfo.LoadStatusInfo();
            m_lblIPAddress.Text = Vercoop.StatusInfo.IP_ADDRESS;
            m_lblGameCountInfo.Text = Vercoop.StatusInfo.GAME_COUNT_INFO;
            m_lblDeviceName.Text = Vercoop.StatusInfo.CURRENT_DEVICE_NAME;
            m_lblDeviceID.Text = Vercoop.Config.DeviceIDX + ":" + Vercoop.Config.DeviceUniqueID;
            m_lblDeviceToken.Text = Vercoop.Config.DeviceAccessToken;
            if (Vercoop.Config.isGameBackend())
            {
                lblBackendType.Text = "Game Backend";
                btnChangeType.Text = "Change to Video Backend";
            }
            else
            {
                lblBackendType.Text = "Video Backend";
                btnChangeType.Text = "Change to Game Backend";
            }
            VRBackground.Vercoop.Utils.Error.trace("Main Frame====005=");
            
        }
        private void OnTimer_ResyncAPI(object sender, EventArgs e)
        {
            Vercoop.Content.APIManager.GetInstance().resyncRequest();
        }

        private void btnChangeType_Click(object sender, EventArgs e)
        {
            if (System.Windows.Forms.MessageBox.Show("It will restart") == System.Windows.Forms.DialogResult.OK)
            {

                Vercoop.Config.ToggleBackendType();
                OnExit(null, null);
            }

        }
        
    }
}
