namespace GameDemo
{
    partial class Form1
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.btnUserInfoGet = new System.Windows.Forms.Button();
            this.btnCanReplay = new System.Windows.Forms.Button();
            this.btnShowRankingScore = new System.Windows.Forms.Button();
            this.btnStopGame = new System.Windows.Forms.Button();
            this.txtOutput = new System.Windows.Forms.RichTextBox();
            this.txtScore = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.SuspendLayout();
            // 
            // btnUserInfoGet
            // 
            this.btnUserInfoGet.Location = new System.Drawing.Point(12, 39);
            this.btnUserInfoGet.Name = "btnUserInfoGet";
            this.btnUserInfoGet.Size = new System.Drawing.Size(249, 23);
            this.btnUserInfoGet.TabIndex = 0;
            this.btnUserInfoGet.Text = "Step 1: Get User Information";
            this.btnUserInfoGet.UseVisualStyleBackColor = true;
            this.btnUserInfoGet.Click += new System.EventHandler(this.btnUserInfoGet_Click);
            // 
            // btnCanReplay
            // 
            this.btnCanReplay.Location = new System.Drawing.Point(12, 191);
            this.btnCanReplay.Name = "btnCanReplay";
            this.btnCanReplay.Size = new System.Drawing.Size(249, 23);
            this.btnCanReplay.TabIndex = 1;
            this.btnCanReplay.Text = "Step3: Can Replay?";
            this.btnCanReplay.UseVisualStyleBackColor = true;
            this.btnCanReplay.Click += new System.EventHandler(this.btnCanReplay_Click);
            // 
            // btnShowRankingScore
            // 
            this.btnShowRankingScore.Location = new System.Drawing.Point(12, 125);
            this.btnShowRankingScore.Name = "btnShowRankingScore";
            this.btnShowRankingScore.Size = new System.Drawing.Size(249, 23);
            this.btnShowRankingScore.TabIndex = 2;
            this.btnShowRankingScore.Text = "Step2: Show Ranking Score";
            this.btnShowRankingScore.UseVisualStyleBackColor = true;
            this.btnShowRankingScore.Click += new System.EventHandler(this.btnShowRankingScore_Click);
            // 
            // btnStopGame
            // 
            this.btnStopGame.Location = new System.Drawing.Point(12, 220);
            this.btnStopGame.Name = "btnStopGame";
            this.btnStopGame.Size = new System.Drawing.Size(249, 23);
            this.btnStopGame.TabIndex = 3;
            this.btnStopGame.Text = "Step4: Just Stop Game";
            this.btnStopGame.UseVisualStyleBackColor = true;
            this.btnStopGame.Click += new System.EventHandler(this.btnStopGame_Click);
            // 
            // txtOutput
            // 
            this.txtOutput.Location = new System.Drawing.Point(306, 22);
            this.txtOutput.Name = "txtOutput";
            this.txtOutput.Size = new System.Drawing.Size(336, 243);
            this.txtOutput.TabIndex = 4;
            this.txtOutput.Text = "Output SHoud be here";
            // 
            // txtScore
            // 
            this.txtScore.Location = new System.Drawing.Point(104, 92);
            this.txtScore.Name = "txtScore";
            this.txtScore.Size = new System.Drawing.Size(100, 21);
            this.txtScore.TabIndex = 5;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(22, 101);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(76, 12);
            this.label1.TabIndex = 6;
            this.label1.Text = "Game Score";
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(654, 287);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.txtScore);
            this.Controls.Add(this.txtOutput);
            this.Controls.Add(this.btnStopGame);
            this.Controls.Add(this.btnShowRankingScore);
            this.Controls.Add(this.btnCanReplay);
            this.Controls.Add(this.btnUserInfoGet);
            this.Name = "Form1";
            this.Text = "Form1";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button btnUserInfoGet;
        private System.Windows.Forms.Button btnCanReplay;
        private System.Windows.Forms.Button btnShowRankingScore;
        private System.Windows.Forms.Button btnStopGame;
        private System.Windows.Forms.RichTextBox txtOutput;
        private System.Windows.Forms.TextBox txtScore;
        private System.Windows.Forms.Label label1;
    }
}

