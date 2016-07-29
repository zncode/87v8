using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace GameDemo
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void btnUserInfoGet_Click(object sender, EventArgs e)
        {
            VCUserInfo userInfo = VCManager.GetUserInfo();
            if (userInfo == null)
            {
                MessageBox.Show("Failed to Get User Info");
            }
            else
            {
                txtOutput.Text = "User Name :" + userInfo.user_name + "\nThumbnail: " + userInfo.thumbnail;
            }
        }

        private void btnShowRankingScore_Click(object sender, EventArgs e)
        {
            int score = Convert.ToInt32(txtScore.Text);
            if (score == 0)
            {
                MessageBox.Show("Please input score");
                return;
            }
            List<VCUserInfo> arrInfos = VCManager.GetRankingList(score, 100);
            string log = "Failed to Get Ranking Info";
            if (arrInfos.Count >  0)
            {
                log = "";
                for (int i = 0; i < arrInfos.Count; i++)
                {
                    VCUserInfo user = arrInfos[i];
                    log += user.ToString();
                    log += "\n========================\n";
                }
            }
            txtOutput.Text = log;
        }

        private void btnCanReplay_Click(object sender, EventArgs e)
        {
            if (VCManager.CanReplay() == REPLAY_STATUS.YES)
            {
                MessageBox.Show("Please replay this game");
            }
            else
            {
                MessageBox.Show("Game will be terminated");
                Environment.Exit(0);
            }
        }

        private void btnStopGame_Click(object sender, EventArgs e)
        {
            MessageBox.Show("Game will be terminated");
            Environment.Exit(0);
        }
    }
}
