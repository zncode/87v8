Vercoop.PAGE.Video = new function () {
    var videos = new Array();
    var _currentVideo = null;
    var _videoId = null;
    var categorys = new Array();
    var __currentCtIdx = null;

    var videoDevice = null;
    var m_currentFile = null;
    var deviceIP = null;

    this.initialize = function () {
        this.categoryInnerHtml();
        this.videoInnerHtml();
        this.videoStop();
    }

    this.getCetgorys = function () {

        Vercoop.API.Video.getVideoCategorys(function (categoryData) {
            categorys = categoryData;
        });

      /*  categorys = [
            { id: '1', name: 'Hot' },
            { id: '2', name: '目录1' },
            { id: '3', name: '目录2' },
            { id: '4', name: '目录3' },
            { id: '5', name: 'ALL' },
        ]; */

        var categoryHtml = null;
        categoryHtml = '<ul id="page_video_navigation_ul">';

        for (var i in categorys) {
            categoryHtml += '<li><a data-category-id="' + categorys[i].idx + '" href="#">' + categorys[i].name + '</a></li>';
        }
        categoryHtml += '</ul>';
        return categoryHtml;
    }

    this.getVideoData = function () {
 
        Vercoop.API.Video.getVideos(function (datas) {
            deviceIP = Vercoop.Utils.Storage.VideoDevice.IP;
            if (deviceIP == null) {
                deviceIP = '127.0.0.1';
            }
            for (i in datas) {
                ct_idx = datas[i].ct_idx;

                videos[i] = { id: ct_idx, img: 'http://' + deviceIP + ':8787/thumbnail?idx=' + ct_idx, description: datas[i].description, title: datas[i].title, category: datas[i].category}
            }
        });

     /*   videos = [
            { id: '1', img: 'images/video/1.jpg', description: 'This is Video 1 content.', title:'标题111'},
            { id: '2', img: 'images/video/2.jpg', description: 'This is Video 2 content.', title: '标题2' },
            { id: '3', img: 'images/video/3.jpg', description: 'This is Video 3 content.', title: '标题3' },
            { id: '4', img: 'images/video/4.jpg', description: 'This is Video 4 content.', title: '标题4' },
            { id: '5', img: 'images/video/5.jpg', description: 'This is Video 5 content.', title: '标题5' },
            { id: '6', img: 'images/video/6.jpg', description: 'This is Video 6 content.', title: '标题6' },
            { id: '7', img: 'images/video/7.jpg', description: 'This is Video 7 content.', title: '标题7' },
            { id: '8', img: 'images/video/8.jpg', description: 'This is Video 8 content.', title: '标题8' },
            { id: '9', img: 'images/video/9.jpg', description: 'This is Video 9 content.', title: '标题9' },
            { id: '10', img: 'images/video/10.jpg', description: 'This is Video 10 content.', title: '标题10' },
            { id: '11', img: 'images/video/11.jpg', description: 'This is Video 11 content.', title: '标题11' },
            { id: '12', img: 'images/video/12.jpg', description: 'This is Video 12 content.', title: '标题12' },
            { id: '13', img: 'images/video/13.jpg', description: 'This is Video 13 content.', title: '标题13' },
            { id: '14', img: 'images/video/14.jpg', description: 'This is Video 14 content.', title: '标题14' },
            { id: '15', img: 'images/video/15.jpg', description: 'This is Video 15 content.', title: '标题15' },
        ]; */

    }

    this.getVideoByCid = function () {
        var videoCid = new Array();
        this.getVideoData();

        if (__currentCtIdx) {
            for (var i in videos) {
                if (__currentCtIdx == videos[i].category) {
                    videoCid[i] = videos[i];
                }
            }
        }
        else {
            videoCid = videos;
        }


        return videoCid;
    }
    
    this.getVideoByVid = function (vid) {
        var videoContent = null;
        this.getVideoData();
        var videoData = videos;

        for (var i in videoData) {
            if (vid == videoData[i].id) {
                videoContent = videoData[i];
            }
        }

        return videoContent;
    }

    this.categoryInnerHtml = function () {
        document.getElementById("page_video_navigation_wrapper").innerHTML = this.getCetgorys();

        //click
        var li = document.getElementById("page_video_navigation_ul").getElementsByTagName("a");
        for (var i = 0; i < li.length; i++) {
            li[i].onclick = function () {
                __currentCtIdx = this.attributes["data-category-id"].value;
               Vercoop.PAGE.Video.videoInnerHtml();
               Vercoop.PAGE.Video.videoStop();
            }
        }
    }

    this.videoInnerHtml = function() {
        var videoData = this.getVideoByCid();
        var videoHtml = null;
        videoHtml = '<ul id="page_video_content_ul">';

        for (var i in videoData) {
            videoHtml += '<li><a href="#" data-video-id="' + videoData[i].id + '" ><img width="600" height="300" src="' + videoData[i].img + '" /></a></li>';
        }
        videoHtml += '</ul>';

        document.getElementById("page_video_content_wrapper").innerHTML = videoHtml;

        //click
        var a = document.getElementById("page_video_content_ul").getElementsByTagName("a");
        for (var i = 0; i < a.length; i++) {
            a[i].onclick = function () {
                var vid = this.attributes["data-video-id"].value;
                Vercoop.PAGE.Video.videoInnerHtmlContent(vid);
            }
        }
    }

    this.videoInnerHtmlContent = function (vid) {

        var url = 'http://' + deviceIP + ':8787/videofile?idx=' + vid;
        var videoContent = this.getVideoByVid(vid);
        var videoContentHtml = '';
        var videoContainer = '<div id="videoContainer" style="width: 1250px; height:800px; display:none;"></div>';
        var videoTag = '<div id="video_tag_wrapper"><video height="800px" width="1250px"><source src="' + url + '" type="video/mp4" /></video></div>';
        videoContentHtml = '<div id="page_video_content_detail_wrapper">';
        videoContentHtml += '<div id="page_video_content_detail_left">' + videoTag + videoContainer + '</div>';
       
        videoContentHtml += '<div id="page_video_content_detail_right">';
        videoContentHtml += '<div id="page_video_content_detail_right_title">' + videoContent.title + '</div>';
        videoContentHtml += '<div id="page_video_content_detail_right_button"><button id="video_play">播放</button><button id="video_stop">停止</button></div>';
        videoContentHtml += '<div id="page_video_content_detail_right_description">' + videoContent.description + '</div>';
        videoContentHtml += '</div>';
        videoContentHtml += '</div>';

        document.getElementById("page_video_content_wrapper").innerHTML = videoContentHtml;
       
        //click
        document.getElementById("video_play").onclick = function () {
            this.style.display = 'none';
            document.getElementById("video_stop").style.display = 'block';
            document.getElementById("video_tag_wrapper").style.display = 'none';
            document.getElementById("videoContainer").style.display = 'block';
            Vercoop.PAGE.Video.videoPlay(vid);
        }
        document.getElementById("video_stop").onclick = function () {
            this.style.display = 'none';
            document.getElementById("video_play").style.display = 'block';
            document.getElementById("video_tag_wrapper").style.display = 'block';
            document.getElementById("videoContainer").style.display = 'none';
            Vercoop.PAGE.Video.videoStop();
        }
    }

    //device handle
    this.deviceBind = function () {
        var device_ip = document.getElementById("device_add_ip_value").value;
        if (!Vercoop.Utils.Utility.isValidString(device_ip)) {
            this.setErrorMessage('device_add_ip_error', "请填写IP地址");
            return;
        }
        Vercoop.PAGE.ShowLoadingStatus(0, 0.9);
        Vercoop.API.Devices.connectDevice(device_ip,'video',false,
            function (deviceInfo) {
                Vercoop.Utils.Utility.OnTimerEvent(1000, function () {
                    //Vercoop.PAGE.hideLoading();
                    if (deviceInfo.error == null) {
                        Vercoop.PAGE.hideLoading();
                        //Bind IP
                        Vercoop.Utils.Storage.VideoDevice.IP = device_ip;
                        Vercoop.PAGE.Video.setErrorMessage('device_add_ip_error', "绑定成功!");
                        Vercoop.PAGE.Video.initialize();
                    } else {
                        Vercoop.PAGE.hideLoading();
                        Vercoop.PAGE.Video.setErrorMessage('device_add_ip_error', "绑定失败!");
                      //  Vercoop.Utils.Utility.showMessageBox("Device could not found");
                    }
                });
            });
    }

    this.setErrorMessage = function (id, message) {
        var dvError = document.getElementById(id);
        if (dvError) {
            dvError.style.display = 'block';
            dvError.innerText = message;
        }
    }

    this.videoPlay = function (idx) {
        this.callVideoPlayer(deviceIP, idx, 
            function callback(rescode) {
                if (rescode == 0) {
                    var url = "http://" + deviceIP + ":8787/videofile?idx=" + idx;
                    Vercoop.Utils.VRVideo.InitVideo("videoContainer", url, 2048, 2048);
                    Vercoop.Utils.VRVideo.onCanPlay = function (duration) {
                        Vercoop.Utils.VRVideo.play();
                    }
                }
            }
        );
              
    }

    this.videoStop = function () {
        this.stopVideoPlayer(deviceIP, function () {
            Vercoop.Utils.VRVideo.CloseSession();
        });
       
    }

    this.stopVideoPlayer = function (ip_address, fc_callback) {
        var d = new Date();
        var currentMiliSeconds = parseInt(d.getTime() * 1000) + parseInt(d.getMilliseconds());
        var url = "http://" + ip_address + ":8787/cleanProcess?nonocache=" + currentMiliSeconds;


        Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
           function completed(xmlHttpRequest) {
               var res_txt = xmlHttpRequest.responseText;
               fc_callback();
               try {
                   var jsonResponse = JSON.parse(res_txt);
                   if (jsonResponse.hasOwnProperty("code") && jsonResponse.hasOwnProperty("msg")) {
                       if (jsonResponse["code"] == "000") {
                           

                           return;
                       } else {
                           //Vercoop.Utils.Utility.showMessageBox(jsonResponse["msg"]);
                       }

                   }
                   //Vercoop.Utils.Utility.showMessageBox("JSON ERROR [" + res_txt + "]");
               } catch (ex) {
                   //Vercoop.Utils.Utility.showMessageBox(ex.message);
               }
           },
           function error(err) {
               fc_callback();
               //Vercoop.Utils.Utility.showMessageBox("HTTP ERROR");
           }
       );
    }
    this.callVideoPlayer = function (ip_address, content_idx, fc_callback) {
        var d = new Date();
        var currentMiliSeconds = parseInt(d.getTime() * 1000) + parseInt(d.getMilliseconds());
        var url = "http://" + ip_address + ":8787/playvideo?nonocache=" + currentMiliSeconds;
        url += "&idx=" + content_idx;
        url += "&man_usr_idx=" + Vercoop.Utils.Storage.LoginInfo.userIDX; //Logined User ID_idx in this app
        Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
            function completed(xmlHttpRequest) {
                try {
                    var result = JSON.parse(xmlHttpRequest.responseText);

                    if (result) {

                        if (result.hasOwnProperty("code") && result.hasOwnProperty("msg")) {
                            if (result["code"] == "000") {
                                //Vercoop.Utils.Utility.showMessageBox("Success To Play");

                                fc_callback(0);
                                return;
                            } else if (result["code"] == "311") {
                                Vercoop.Utils.Utility.showMessageBox("Device is Occupied");
                            } else {
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