
Vercoop.API.Video = new function () {
    this.getVideos = function (fc_finished) {
        deviceIP = Vercoop.Utils.Storage.VideoDevice.IP;
        if (deviceIP == null) {
            deviceIP = '127.0.0.1';
        }

        var url = "http://" + deviceIP + ":8787/content_list";

        Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
            function completed(xmlHttpRequest) {
                try {
                    var result = JSON.parse(xmlHttpRequest.responseText);
                    if (result) {                                               
                        if (result.hasOwnProperty("code") && result.hasOwnProperty("msg")) {
                            if (result["code"] == "000") {
                                fc_finished(result["datas"]);
                                return;
                            }
                        }                        
                    }
                } catch (ex) {
                    fc_finished(null);
                }

            },
            function error(xmlHttpRequest) {
                fc_finished(null);
            }
        );
    }

    this.getVideoCategorys = function (fc_finished) {
        var d = new Date();
        var currentMiliSeconds = parseInt(d.getTime() * 1000) + parseInt(d.getMilliseconds());
        var url = "http://api.87870.com/store/video_category.php?";
        url += "ver=1";
        url += "&nocach=" + currentMiliSeconds;

        Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
            function completed(xmlHttpRequest) {
                try {
                    var result = JSON.parse(xmlHttpRequest.responseText);
                    if (result) {
                        if (result.hasOwnProperty("data")) {
                            var categorys = result['data'];
                            fc_finished(categorys);
                            return;
                        }
                    }
                    fc_finished(null);
                } catch (ex) {
                    fc_finished(null);
                }

            },
            function error(xmlHttpRequest) {
                fc_finished(null);
            }
        );
    }
}