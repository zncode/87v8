function ContentInfo() {
    this.content_idx = 0;
    this.price = 0;
    this.title = "";
    this.description = "";
    this.version = "";
    this.developer = "";
    this.age_limit = ""
    this.sizeString = "";
    this.upload_date = "";
    this.play_count = 0;
    this.product_id = 0;


    this.DeviceIP = "";

    this.GetThumbURL = function () {
        var url = "http://" + this.DeviceIP + ":8787/thumbnail?idx=" + this.content_idx;
        return url;
    }

    this.GetCoverImageURL = function () {
        var url = "http://" + this.DeviceIP + ":8787/coverimage?idx=" + this.content_idx;
        return url;
    }

    
    this.PlayGame = function (deviceInfo, pay_idx, pay_token, fc_callback) {
        var myObject = this;
        var d = new Date();
        var currentMiliSeconds = parseInt(d.getTime() * 1000) + parseInt(d.getMilliseconds());
        var url = "http://" + deviceInfo.IP_ADDRESS + ":8787/playgame?nonocache=" + currentMiliSeconds;
        url += "&idx=" + this.content_idx;

        //  url += "&man_usr_idx=" + Vercoop.Utils.Storage.LoginInfo.userIDX; //Logined User ID_idx in this app //simple version
        //  url += "&pay_idx=" + pay_idx; //simple version
        //  url += "&pay_token=" + pay_token; //simple version


        content_idex_a = this.content_idx;
        m_GroupLeaderIdx = 0;
        //document.getElementById("running_ct_idx").setAttribute("data-value", this.content_idx);

        Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
            function completed(xmlHttpRequest) {
                try {
                    var result = JSON.parse(xmlHttpRequest.responseText);
                    
                    if (result) {

                        if (result.hasOwnProperty("code") && result.hasOwnProperty("msg")) {
                            if (result["code"] == "000") {
                                //Vercoop.Utils.Utility.showMessageBox("Success To Play");
                                deviceInfo.running_cts_idx = content_idex_a;
                                var newPlayCount = parseInt(result["play_count"]);
                                if (newPlayCount) {
                                    myObject.play_count = newPlayCount;
                                  // simple version  document.getElementById("cts_info_detail_runningtime").innerText = newPlayCount;
                                }
                               
                                fc_callback(0);
                                return;
                            } else if(result["code"] == "311"){
                                Vercoop.Utils.Utility.showMessageBox("Device is Occupied");
                            }else {
                                Vercoop.Utils.Utility.showMessageBox("Failed to Play (" + result["code"] + ":" + result["msg"] + ")");
                            }
                            fc_callback(parseInt(result["code"]));
                            return;
                        }
                    }
                    Vercoop.Utils.Utility.showMessageBox("Failed to Play (JSON)");

                    fc_callback(-1);
                } catch (ex) {
                    Vercoop.Utils.Utility.showMessageBox("Failed to Play (Exception)");

                    fc_callback(-2);
                }

            },
            function error(xmlHttpRequest) {
                fc_callback(-3);
                Vercoop.Utils.Utility.showMessageBox("Failed to Play (HTTP)");
            }
        );
    }
}