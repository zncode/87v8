

Vercoop.PAGE.ContentInfo = new function () {
    var _currentPayment_ct_idx = null;
    var _currentDevice = null;
    var _currentDeviceIP = null;

    var playButton = null;
    var stopButton = null;
    var paymentButton = null;
    var logoutButton = null;

    this.setCurrentPayment_ct_idx = function (ct_idx, payment_idx, payment_token) {
        _currentDeviceIP        = _currentDevice.IP_ADDRESS;
        _currentPayment_ct_idx  = _currentDeviceIP + '.' + ct_idx;
        _currentPayment_idx     = payment_idx;
        _currentPayment_token   = payment_token;
    }

    this.isAcivated = function () {
        if (document.getElementById(Vercoop.PAGE.MODE_TYPE.CONTENT_INFO).style.display == "none") {
            return false;
        }
        return true;
    }

    function UpdateUserInfoStatus(deviceInfo) {
        if (deviceInfo.userInfo == null) {
            document.getElementById("content_info_scan_area").style.display         = "";
            document.getElementById("content_info_user_area").style.display         = "none";
            document.getElementById("login_payment_form").style.display             = "";
            document.getElementById("login_after").style.display                    = "none";
        } else {
            document.getElementById("content_info_scan_area").style.display         = "none";
            document.getElementById("content_info_user_area").style.display         = "";
            document.getElementById("content_info_user_thumb").src                  = deviceInfo.userInfo.getUserThumbnail();
            document.getElementById("content_info_user_nicname").innerText          = deviceInfo.userInfo.getUserDisplayName();
            document.getElementById("login_payment_form").style.display             = "none";
            document.getElementById("login_after").style.display                    = "";
            document.getElementById("login_after_user_thumb").src                   = deviceInfo.userInfo.getUserThumbnail();
            document.getElementById("login_after_user_nicname").innerText           = deviceInfo.userInfo.getUserDisplayName();
        }
    }
    var _currentPayment_idx = 0;
    var _currentPayment_token = "";

    function playContent(ctsInfo, deviceInfo) {
        _currentDevice = deviceInfo;
        if (deviceInfo.isReadyToPlay()) {
            Vercoop.PAGE.ShowLoadingStatus(0);
            ctsInfo.PlayGame(deviceInfo, _currentPayment_idx, _currentPayment_token,
                function (code) {
                    Vercoop.PAGE.hideLoading();
                    if (code == 0) {
                        //Success to play. So change device status to occuoed
                        deviceInfo.status = Vercoop.API.Devices.DEVICE_STATUS.RUNNING.name;
                        if (deviceInfo.callback_changed) {
                            deviceInfo.callback_changed(deviceInfo, ctsInfo);
                        }
                    }
                }
            );
        } else if (deviceInfo.isOccuppied()) {
            if (deviceInfo.action_code == 101) {
                Vercoop.PAGE.ShowLoadingStatus(0);
                deviceInfo.RequestReplayGame(
                    function (code) {
                        Vercoop.PAGE.hideLoading();
                        deviceInfo.action_code = 0;
                        if (code == 0) {
                            document.getElementById("cts_detail_btn_play").innerText = WinJS.Resources.getString('STL_DEVICE_STATUS_RUNNING').value;
                        } else {
                            Vercoop.Utils.Utility.showMessageBox("未知错误 (" + code + ")");
                        }
                    }
                );
            }
        }
    }
    this.StopCurrentGame = function(){
        if (_currentDevice != null) {
            if (_currentDevice.isOccuppied()) {
                if (_currentDevice.isRunning()) {
                    //TODO Stop Game
                    Vercoop.Utils.Utility.showMessageBox(
                        '确认停止游戏吗?',
                        2,
                        WinJS.Resources.getString('STL_MESSAGE_BOX_BOTTUN_1').value,
                        function () {
                            Vercoop.PAGE.ShowLoadingStatus(0);
                            _currentDevice.stopProcess(function () {
                                Vercoop.PAGE.hideLoading();

                                //Destory payment_content_id;
                                Vercoop.PAGE.ContentInfo.setCurrentPayment_ct_idx(0, 0, 0);
                            });
                            Vercoop.Utils.Utility.closeMessageBox();

                            Vercoop.Utils.UIDecorator.decorateSimpleLargeDevice(_currentDevice, "content_info_cur_device", 'green', "white");

                           // document.getElementById("content_login_payment_button").removeAttribute('disabled'); //simple version
                            // document.getElementById("content_login_payment_button").style.backgroundColor = '#1bb7d5'; //simple version
                            //  document.getElementById("content_info_user_logout_button").removeAttribute('disabled'); //simple version
                            // document.getElementById("content_info_user_logout_button").style.backgroundColor = 'inherit'; //simple version
                        },
                        WinJS.Resources.getString('STL_MESSAGE_BOX_BOTTUN_2').value
                    );
                }
                else {
                    //TODO Stop Game
                    Vercoop.Utils.Utility.showMessageBox(
                        '确认停止游戏吗?',
                        2,
                        WinJS.Resources.getString('STL_MESSAGE_BOX_BOTTUN_1').value,
                        function () {
                            Vercoop.PAGE.ShowLoadingStatus(0);
                            Vercoop.Utils.Utility.closeMessageBox();
                            Vercoop.Utils.UIDecorator.decorateSimpleLargeDevice(_currentDevice, "content_info_cur_device", 'green', "white");

                        },
                        WinJS.Resources.getString('STL_MESSAGE_BOX_BOTTUN_2').value
                    );
                }

            }
        }
    }
    this.UserLogoutRequest = function () {
        if (_currentDevice) {
            if (_currentDevice.isRunning()) {
                //Request User 
                Vercoop.PAGE.ShowLoadingStatus(0);
                _currentDevice.RequestUserLogout(function (code) {
                    Vercoop.PAGE.hideLoading();
                    if (code == 0) {
                        _currentDevice.userInfo = null;
                        UpdateUserInfoStatus(_currentDevice);
                    } else if (code == 363) {
                        //Not logined
                        Vercoop.Utils.Utility.showMessageBox("用户没有登录.");
                    } else {
                        Vercoop.Utils.Utility.showMessageBox("未知错误 (" + code + ")");
                    }
                });
            } else {
                Vercoop.Utils.Utility.showMessageBox("错误: 设备没有运行");
            }
        } else {
            Vercoop.Utils.Utility.showMessageBox("错误: 没有设备.");
        }
    }
    this.showContentInfo = function (ctsInfo, deviceInfo) {

        playButton = document.getElementById("cts_detail_btn_play");
        stopButton = document.getElementById("cts_detail_btn_stop");
        paymentButton = document.getElementById("content_login_payment_button");
        logoutButton = document.getElementById("content_info_user_logout_button");

        //get payment_content_id
       // _currentPayment_ct_idx = Vercoop.Utils.Storage.paymentCtIdx.id;

        /* logout comfirm message box 1*/
        document.getElementById("content_info_user_logout_button").onclick = function () {
            Vercoop.Utils.Utility.showMessageBox(
                WinJS.Resources.getString('STL_MESSAGE_BOX_LOGOUT').value,
                2, 
               WinJS.Resources.getString('STL_MESSAGE_BOX_BOTTUN_1').value,
                function () {
                    Vercoop.PAGE.ContentInfo.UserLogoutRequest();
                   // Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.USER_LOGIN, WinJS.Resources.getString('STL_PAGE_NAME_LOGIN').value);
                    Vercoop.Utils.Utility.closeMessageBox();
                },
                WinJS.Resources.getString('STL_MESSAGE_BOX_BOTTUN_2').value,
                function () {
                    Vercoop.Utils.Utility.closeMessageBox();
                }
            );
        }

        /* logout comfirm message box 2*/
        document.getElementById("login_after_logout_button").onclick = function () {
            Vercoop.Utils.Utility.showMessageBox(
                WinJS.Resources.getString('STL_MESSAGE_BOX_LOGOUT').value,
                2,
               WinJS.Resources.getString('STL_MESSAGE_BOX_BOTTUN_1').value,
                function () {
                    Vercoop.PAGE.ContentInfo.UserLogoutRequest();
                  //  Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.USER_LOGIN, WinJS.Resources.getString('STL_PAGE_NAME_LOGIN').value);
                    Vercoop.Utils.Utility.closeMessageBox();
                },
                WinJS.Resources.getString('STL_MESSAGE_BOX_BOTTUN_2').value,
                function () {
                    Vercoop.Utils.Utility.closeMessageBox();
                }
            );
        }

        /* user login  */
        document.getElementById("login_payment_submit_1").onclick = function () {
            Vercoop.PAGE.ContentInfo.ProcessGameUserLogin(2);
        }
        document.getElementById("login_payment_submit_2").onclick = function () {
            Vercoop.PAGE.ContentInfo.ProcessGameUserLogin(1);
        }


        if (Vercoop.UI_TEST_MODE) {
            return;
        }

        //Test cash payment
        document.getElementById("login_payment_test_cash_payment_button").onclick = function () {
            var ct_idx = ctsInfo.content_idx;
            var price = ctsInfo.price;
            Vercoop.PAGE.showMaskLoading();

            Vercoop.API.CommonAPI.paymentInCache(ct_idx, price, function (payment_idx, payment_token) {
                Vercoop.PAGE.hiddenMaskLoading();
                if (payment_idx) {
                    Vercoop.Utils.Utility.showMessageBox('支付成功! 支付ID: ' + payment_idx);
                    login_payment.style.display = '';
                    playButton.removeAttribute("disabled");

                    _currentPayment_idx = payment_idx;
                    _currentPayment_token = payment_token;

                    _currentDeviceIP = deviceInfo.IP_ADDRESS;
                    _currentPayment_ct_idx = _currentDeviceIP + '.' + ct_idx;
                }
                else {
                    Vercoop.Utils.Utility.showMessageBox('支付失败!');
                    login_payment.style.display = '';
                }                                      
            });
        };



        /*add wxpay qrcode image */
   /*    (simple version) var deviceToken = Vercoop.Push.getToken();

        Vercoop.API.CommonAPI.qrcodeString(ctsInfo.product_id, deviceToken, function (qr_url, qr_base) {
            if (qr_url)
            {
                var qrcodeDiv = document.getElementById("login_payment_wxpay");
                Vercoop.Utils.UIDecorator.CleanDIV(qrcodeDiv);
                var qrcode = new QRCode(qrcodeDiv, { width: 100, height: 100, correctLevel: QRCode.CorrectLevel.L });
                qrcode.clear();
                qrcode.makeCode(qr_url);
                //  document.getElementById("login_payment_wxpay").src = 'http://dev87v8payment.87870.com/qrcode/payment_qrcode.php?pid=' + ctsInfo.content_idx;
            }
         
        });       */

        _currentDevice = deviceInfo;

        console.log("Content Info [" + deviceInfo.global_index + ":" + deviceInfo.status + "]");
        document.getElementById("cts_detail_title").innerText = ctsInfo.title;
        document.getElementById("cts_detail_image").src = ctsInfo.GetCoverImageURL();
        document.getElementById("cts_detail_price").innerText = ctsInfo.price + "元";
        document.getElementById("cts_detail_description").innerText = ctsInfo.description;
        
   
        document.getElementById("cts_info_detail_developer").innerText = ctsInfo.developer;
        document.getElementById("cts_info_detail_agelimit").innerText = ctsInfo.age_limit;
        document.getElementById("cts_info_detail_filesize").innerText = ctsInfo.sizeString;
        document.getElementById("cts_info_detail_uploadDate").innerText = ctsInfo.upload_date;
        document.getElementById("cts_info_detail_version").innerText = ctsInfo.version;
       //simple version document.getElementById("cts_info_detail_runningtime").innerText = ctsInfo.play_count;

        
        UpdateUserInfoStatus(deviceInfo);

        if (_currentDevice.status == '_running')
        {
            Vercoop.Utils.UIDecorator.decorateSimpleLargeDevice(deviceInfo, "content_info_cur_device", 'red', "white");
        }else if(_currentDevice.status == '_active'){
            Vercoop.Utils.UIDecorator.decorateSimpleLargeDevice(deviceInfo, "content_info_cur_device", 'green', "white");
        } else if (_currentDevice.status == '_invalid') {
            Vercoop.Utils.UIDecorator.decorateSimpleLargeDevice(deviceInfo, "content_info_cur_device", 'yellow', "white");
        }
       

        //check start button
        button_handle(deviceInfo, ctsInfo);

        function button_handle(device, content) {

            if (device.isOccuppied()) {
                /* if current game, hidden start button, show stop button */
                if (device.running_cts_idx == content.content_idx) {

                    /* disable play and stop button */
                    // simple version playButton.innerText = '续费继续';
                    // simple version playButton.setAttribute('disabled');
                    playButton.style.display = "none";
                    stopButton.style.display = "block";

                    _currentPayment_idx = 0;
                    _currentPayment_token = "";

                } else {
                    /* if not, disable start button, hidden stop button */
                    playButton.innerText = '开始';
                    playButton.style.display = "block"; //simple version
                  //  playButton.setAttribute('disabled'); 
                    stopButton.style.display = "none";

                }

                /* diable logout and payment button */
                //   paymentButton.setAttribute('disabled');  //simple version
                //   paymentButton.style.backgroundColor = '#020202';  //simple version
                //   logoutButton.setAttribute('disabled');  //simple version
                //   logoutButton.style.backgroundColor = '#020202';  //simple version
            } else {
                playButton.innerText = "开始";
                playButton.style.display = "block"; //simple version
                stopButton.style.display = "none";

                /* check game is payment or not, device ip + content id */
                var check_currentPayment_ct_idx = device.IP_ADDRESS + '.' + content.content_idx;

                if (_currentPayment_ct_idx == check_currentPayment_ct_idx) {
                    playButton.removeAttribute('disabled');
                } else {
                    //playButton.setAttribute('disabled'); 
                }

                /* enable logout and payment button */
                //paymentButton.removeAttribute('disabled'); //simple version
                //paymentButton.style.backgroundColor = '#1bb7d5';  //simple version
                //logoutButton.removeAttribute('disabled');  //simple version
                //logoutButton.style.backgroundColor = 'inherit';  //simple version
            } 
        }

        /* change device color */
        playButton.onclick = function () {
            Vercoop.Utils.UIDecorator.decorateSimpleLargeDevice(deviceInfo, "content_info_cur_device", 'red', "white");
        }

        deviceInfo.callback_changed = deviceStatusChanged;
        Vercoop.Utils.Utility.NormalMouseUp(playButton,
            function () {               
                playContent(ctsInfo, deviceInfo);
            }
        );
        
        
        var codeString = ctsInfo.content_idx + ":" + deviceInfo.server_device_idx;

        Vercoop.Push.processPlayQRCode(codeString, "id_qrcode_area", 90, 90,
            function paymentConfirm(cts_idx) {
                if (!Vercoop.PAGE.ContentInfo.isAcivated()) {
                    return;
                }
                if (cts_idx > 0) {
                    PaymentSuccessHandle('微信');
                } else {
                    Vercoop.Utils.Utility.showMessageBox(Vercoop.Push.LastErrorMessage());
                }

            },
            function userLogin(user_idx, key) {
                if (!Vercoop.PAGE.ContentInfo.isAcivated()) {
                    return;
                }
                Vercoop.PAGE.ShowLoadingStatus(0, 0.9, WinJS.Resources.getString('STL_MSG_LOGGING').value);
                _currentDevice.RequestUserLogin(user_idx, key,
                    function (errorCode) {
                        Vercoop.PAGE.hideLoading();
                        if (errorCode == 0) {
                            //Success
                            UpdateUserInfoStatus(_currentDevice);

                        } else {
                            Vercoop.Utils.Utility.showMessageBox("登录错误 (" + errorCode + ")");
                        }
                    }
                );
            }
        );

        function deviceStatusChanged(info, ctsInfo) {

            if (info.isOccuppied()) {
                if (info.action_code == 101) {
                    //Can Replay
                    playButton.innerText = WinJS.Resources.getString('STL_DEVICE_MAKE_REPLAY').value;
                } else {
                    // simple version playButton.innerText = '续费继续';
                    //      playButton.setAttribute('disabled');
                    playButton.style.display = "none";
                    stopButton.style.display = "block";

              //      paymentButton.setAttribute('disabled'); //simple version
                    //      paymentButton.style.backgroundColor = '#020202'; //simple version
                    //      logoutButton.setAttribute('disabled'); //simple version
                    //      logoutButton.style.backgroundColor = '#020202'; //simple version

                    _currentPayment_idx = 0;
                    _currentPayment_token = "";

                    
                }               
            } else if (info.isRunning()) {
                playButton.innerText = "开始";
                playButton.style.display = "block"; // simple version
                stopButton.style.display = "none";

                Vercoop.Utils.UIDecorator.decorateSimpleLargeDevice(_currentDevice, "content_info_cur_device", 'green', "white");

             //   playButton.setAttribute('disabled');

                //    paymentButton.removeAttribute('disabled'); //simple version
                //    paymentButton.style.backgroundColor = '#1bb7d5'; //simple version
                //    logoutButton.removeAttribute('disabled'); //simple version
                //    logoutButton.style.backgroundColor = 'inherit'; //simple version

                _currentPayment_idx = 0;
                _currentPayment_token = "";
                Vercoop.PAGE.ContentInfo.setCurrentPayment_ct_idx(0, 0, 0);
            } else {
                //Device is disconnected
                Vercoop.Utils.Utility.showMessageBox(
                    '网络环境较差, 无法连接到设备!',
                    1,
                    '返回首页',
                    function () { 
                        Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.MAIN_PORTAL);
                        Vercoop.Utils.Utility.closeMessageBox();
                        //playButton.setAttribute('disabled'); // simple version
                        //playButton.style.backgroundColor = '#1bb7d5'; // simple version
                        playButton.style.display = "block"; // simple version
                        stopButton.style.display = "none";

                        _currentPayment_idx = 0;
                        _currentPayment_token = "";

                    }
                );
            }
            UpdateUserInfoStatus(info);
        }
    }

    this.ProcessGameUserLogin = function (index) {
        var user_id = document.getElementById("login_payment_in_user_id").value;
        var user_password = document.getElementById("login_payment_in_user_password").value;

        if (!user_id) {
            Vercoop.Utils.Utility.showMessageBox("用户名不能为空");
            return;
        }
        if (!user_password) {
            Vercoop.Utils.Utility.showMessageBox("密码不能为空");
            return;
        }

        Vercoop.PAGE.ShowLoadingStatus(0, 0.9, WinJS.Resources.getString('STL_MSG_LOGGING').value);
        document.getElementById("mask_layer").style.display = 'block';

        Vercoop.API.CommonAPI.playUserLogin(user_id, user_password,
            function (user_idx, user_key) {
                if (user_idx == null || user_key == null) {
                    //TODO show login failed message
                    Vercoop.Utils.Utility.showMessageBox("用户名或密码错误!");
                    close_right_bar = 2;
                    Vercoop.PAGE.hideLoading();
                    return;
                }
               
                _currentDevice.RequestUserLogin(user_idx, user_key,
                    function (errorCode) {
                        Vercoop.PAGE.hideLoading();
                        if (errorCode == 0) {
                            //Success
                            UpdateUserInfoStatus(_currentDevice);
                            if(index == 2)
                            {
                                document.getElementById("login_payment").style.display = 'none';                              
                            }
                            if(index == 1)
                            {
                            }
                            document.getElementById("mask_layer").style.display = 'none';
                        } else {
                            Vercoop.Utils.Utility.showMessageBox("登录错误 (" + errorCode + ")");
                        }
                    }
                );
            }
       );
    }

    function PaymentSuccessHandle(type) {
        Vercoop.Utils.Utility.showMessageBox(type + '支付成功!');
        document.getElementById("login_payment").style.display = 'none';
        document.getElementById("cts_detail_btn_play").removeAttribute("disabled");
    }


}