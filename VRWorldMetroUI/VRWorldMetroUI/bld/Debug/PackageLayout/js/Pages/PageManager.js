
Vercoop.PAGE = new function () {
    function PageElement() {
        this.PageDIV = null;
        this.PageData1 = null;
        this.PageData2 = null;
        this.title = "";
        this.mode = "";
    }
    var m_PageStack = [];
    var m_currentPageInfo = null;
    this.MODE_TYPE = new function () {
        this.USER_LOGIN = "id_page_user_login";
        this.DEVICE_MANAGER = "id_page_device_list";
        this.MAIN_PORTAL = "id_page_main_portal";
        this.WAITING = "id_page_waiting";
        this.CONTENT_INFO = "id_page_cts_detal_info";

        this.VIDEO = "id_page_video";
        this.GAME_REVIEW = "id_page_game_review";


        this.GetModeDiv = function (mode) {
            var index = Vercoop.PAGE.MODE_LIST.indexOf(mode);
            if (index == -1) {
                //no registered mode
                return null;
            }
            var div = document.getElementById(mode);
            return div;

        }
    }
    function updatePage(mode) {
        if (mode == Vercoop.PAGE.MODE_TYPE.DEVICE_MANAGER) {
            Vercoop.PAGE.DeviceManager.ShowDeviceListPage();
        } else if (mode == Vercoop.PAGE.MODE_TYPE.USER_LOGIN) {
            document.getElementById("in_user_id").value = Vercoop.Utils.Storage.LoginInfo.PrevID;
            if (Vercoop.UI_TEST_MODE) {
                document.getElementById("in_user_password").value = "a1234";
            }
        } else if (mode == Vercoop.PAGE.MODE_TYPE.MAIN_PORTAL) {
            if (Vercoop.UI_TEST_MODE == true) {
                /*
                var divDevice = document.getElementById("test_device_small_area");
                Vercoop.Utils.UIDecorator.CleanDIV(divDevice);
                var divRightInner = Vercoop.Utils.UIDecorator.AddShape01toDiv(divDevice, "#FF0000", 24, 24);
                divDevice.appendChild(divRightInner);
                Vercoop.Utils.UIDecorator.MainPortalDeviceLarge(divRightInner, "", "Hello World", "white", "/images/test_image/user_512x512.png");
                */
            } else {
                Vercoop.PAGE.MainPortal.showMainPortalPage();
            }
        } else if (mode == Vercoop.PAGE.MODE_TYPE.CONTENT_INFO) {
            Vercoop.PAGE.ContentInfo.showContentInfo(m_currentPageInfo.PageData1, m_currentPageInfo.PageData2);

            /* add text */
         //   document.getElementById("content_str_qrcode_login").innerText       = WinJS.Resources.getString('STL_OTHER_QRCODE_LOGIN_NOTE').value; //simple version
         //   document.getElementById("content_login_payment_button").innerText   = WinJS.Resources.getString('STL_OTHER_LOGIN_PAYMENT_BUTTON').value; // simple version
        }
    }
    this.ShowPage = function (mode, title, param1, param2) {
        var mainDiv = this.MODE_TYPE.GetModeDiv(mode);
        if (!mainDiv) return;
        if (m_currentPageInfo != null) {
            m_currentPageInfo.PageDIV.style.display = "none";

        }
        mainDiv.style.display = "";
        m_currentPageInfo = new PageElement();
        m_currentPageInfo.PageDIV = mainDiv;
        m_currentPageInfo.PageData1 = param1;
        m_currentPageInfo.PageData2 = param2;
        m_currentPageInfo.title = title;
        m_currentPageInfo.mode = mode;
        //Page Stack을 clear한다.
        m_PageStack = [];
        processBackStatus(null);
        m_PageStack.push(m_currentPageInfo);
        updatePage(mode);
    }
    this.PopPage = function () {
        if (m_PageStack.length > 1 && m_currentPageInfo != null) {
            m_currentPageInfo.PageDIV.style.display = "none";
            m_PageStack.pop();
            m_currentPageInfo = m_PageStack[m_PageStack.length - 1];
            m_currentPageInfo.PageDIV.style.display = "";

            updatePage(m_currentPageInfo.mode);

            var prevPage = null;
            if (m_PageStack.length > 1) {
                prevPage = m_PageStack[m_PageStack.length - 2];
            }
            processBackStatus(prevPage);
        }
    }
    function processBackStatus(prevPageInfo) {
        var backTitle = null;
     /*   if (prevPageInfo != null) {
            if (Vercoop.Utils.Utility.isValidString(prevPageInfo.title)) {
                backTitle = prevPageInfo.title;
            }
        }
        if (backTitle == null) {
            document.getElementById("img_main_logo").style.display = "";
            document.getElementById("header_go_back").style.display = "none";
        } else {
            document.getElementById("img_main_logo").style.display = "none";
            document.getElementById("header_go_back").style.display = "";
            document.getElementById("header_go_back").innerText = backTitle;
        } */
    }
    this.pushNewPage = function (mode, title, param1, param2) {
        var mainDiv = this.MODE_TYPE.GetModeDiv(mode);
        if (!mainDiv) return;
        if (m_currentPageInfo != null) {
            if (m_currentPageInfo.mode == mode) {
                return;
            }
            m_currentPageInfo.PageDIV.style.display = "none";
        }

        mainDiv.style.display = "";
        var newInfo = new PageElement();
        newInfo.PageDIV = mainDiv;
        newInfo.PageData1 = param1;
        newInfo.PageData2 = param2;
        newInfo.title = title;
        newInfo.mode = mode;

        processBackStatus(m_currentPageInfo);
        m_PageStack.push(newInfo);
        m_currentPageInfo = newInfo;
        updatePage(mode);
    }
    this.GetDebugAreaString = function () {
        if (m_currentPageInfo == null) {
            return "Debug: No Active Area";
        }
        var div = m_currentPageInfo.PageDIV;

        var title = "Debug: Main(" + div.offsetWidth + "x" + div.offsetHeight + ")";
        return title;
    }
    this.InitializeComponents = function () {
        document.getElementById("in_user_id").placeholder = WinJS.Resources.getString('STL_PLACEHOLDER_USER_ID').value;
        document.getElementById("in_user_password").placeholder = WinJS.Resources.getString('STL_PLACEHOLDER_USER_PASSWORD').value;
        if (1) {
           
        }
        
        document.body.onresize = function (event) {
            Vercoop.Utils.UIDecorator.tunnningSize();
        }

        Vercoop.Utils.UIDecorator.AddQRCode("id_qrcode_area", "INIT-CODE");
        Vercoop.PAGE.DeviceManager.initialize();
        //Vercoop.PAGE.Video.initialize(); //simple version

        //this.ShowLoadingStatus(0);
        Vercoop.API.Devices.load(
            function (device_count) {
                _onLoadFInished();
            }
        );


        Vercoop.Utils.Utility.NormalMouseUp(document.getElementById("header_go_back"),
            function () {
                //TODO POp
            }
        );
        Vercoop.Utils.Utility.NormalMouseUp(document.getElementById("img_main_logo"),
            function () {
                Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.MAIN_PORTAL);

                //get login type
               /* simple version var login_type = document.getElementById("login_type").attributes['data-value'].value;
                
                if (login_type == 1)
                {
                    Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.MAIN_PORTAL);
                }
                if (login_type == 2) {
                    Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.VIDEO);
                    Vercoop.PAGE.Video.initialize();
                }
                if (login_type == 3) {
                    Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.GAME_REVIEW);
                    Vercoop.PAGE.GameReview.initialize();
                } */
            }
        ); 
    /*    Vercoop.Utils.Utility.NormalMouseUp(document.getElementById("img_go_home"),
            function () {
                //get login type
                var login_type = document.getElementById("login_type").attributes['data-value'].value;
                if (login_type == 1) {
                    Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.MAIN_PORTAL);
                }
                if (login_type == 2) {
                    Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.VIDEO);
                    Vercoop.PAGE.Video.initialize();
                }
                if (login_type == 3) {
                    Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.GAME_REVIEW);
                    Vercoop.PAGE.GameReview.initialize();
                    Vercoop.PAGE.GameReview.pageDetail = 0;
                }
            }
        ); */
        
        function _onLoadFInished() {
            if (Vercoop.UI_TEST_MODE) {
                Vercoop.API.Category.load(function () {
                    //Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.USER_LOGIN, "Login");
                    //Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.MAIN_PORTAL, "MainPortal");
                    Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.CONTENT_INFO, "Content Info");
                    //Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.DEVICE_MANAGER, "Device Manager");
                });
                
                return;
            }
            Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.USER_LOGIN, WinJS.Resources.getString('STL_PAGE_NAME_LOGIN').value);
            //Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.MAIN_PORTAL);

            if (Vercoop.API.Devices.getDeviceCount() == 0) {
                /*
                When there is no binding devices, show device manager first
                But this function is depricated by operation team
                */
                //Vercoop.PAGE.pushNewPage(Vercoop.PAGE.MODE_TYPE.DEVICE_MANAGER, WinJS.Resources.getString('STL_PAGE_NAME_DEVICE_LIST').value);
            }
        }


    }
    this.hideLoading = function () {
        var MainDIV = this.MODE_TYPE.GetModeDiv(Vercoop.PAGE.MODE_TYPE.WAITING);
        MainDIV.style.display = "none";
    }
    this.ShowLoadingStatus = function (limit_seconds, alpha, message) {
        var MainDIV = this.MODE_TYPE.GetModeDiv(Vercoop.PAGE.MODE_TYPE.WAITING);
        MainDIV.style.display = "";
        if (alpha) {
            MainDIV.style.backgroundColor = "rgba(0,0,0," + alpha + ")";
        } else {
            MainDIV.style.backgroundColor = "#000000";
        }
        if (!message) {
            message = "";
        }
        document.getElementById("sp_msg_waiting").innerText = message;
        if (limit_seconds > 0) {
            Vercoop.Utils.Utility.OnTimerEvent(limit_seconds * 1000,
                function () {
                    MainDIV.style.display = "none";
                }
            );
        }

    }

    this.showMaskLoading = function () {
        Vercoop.PAGE.ShowLoadingStatus(0, 0.9, WinJS.Resources.getString('STL_MSG_LOGGING').value);
        document.getElementById("mask_layer").style.display = 'block';
    }

    this.hiddenMaskLoading = function () {
        Vercoop.PAGE.hideLoading();
        document.getElementById("mask_layer").style.display = 'none';
    }

    this.showLoginPayment = function () {
        var strTitle        = WinJS.Resources.getString('STL_LOGINPAYMENT_BOX_TITLE').value;
        var strUsername     = WinJS.Resources.getString('STL_LOGINPAYMENT_BOX_USERNAME').value;
        var strPassword     = WinJS.Resources.getString('STL_LOGINPAYMENT_BOX_PASSWORD').value;
        var strNote         = WinJS.Resources.getString('STL_LOGINPAYMENT_BOX_NOTE').value;
        var strAlipay       = WinJS.Resources.getString('STL_LOGINPAYMENT_BOX_APLIPAY').value;
        var strWxpay        = WinJS.Resources.getString('STL_LOGINPAYMENT_BOX_WXPAY').value;

        var objTitle        = document.getElementById("login_payment_title");
        var objUsername     = document.getElementById("login_payment_form_username_wrapper");
        var objPassword     = document.getElementById("login_payment_form_password_wrapper");
        var objNote         = document.getElementById("login_payment_text");
       // var objAliay        = document.getElementById("login_payment_img_alipay_str");
        var objWxpay        = document.getElementById("login_payment_img_wxpay_str");
        var objAfterTitle   = document.getElementById("login_after_title");

        objTitle.textContent        = strTitle;
        objAfterTitle.textContent   = strTitle;
        objUsername.textContent     = strUsername;
        objPassword.textContent     = strPassword;
        objNote.textContent         = strNote;
      //  objAliay.textContent        = strAlipay;
        objWxpay.textContent        = strWxpay;

        var login_payment = document.getElementById("login_payment");
        login_payment.style.display = 'block';
    //    for (i = 350; i >= 0; i--) {
    //        setInterval(Vercoop.PAGE.move_div_to_left(i), 50);
    //    }

        //close
        document.onclick = function (event) {
            var e = event || window.event;
            var elem = e.srcElement || e.target;
            while (elem){
                var pat = /login_payment|mask_layer/;
                if (elem.id == 'content_login_payment_button') {
                    return;
                }
                if (pat.exec(elem.id) == null) {
                   // login_payment.style.display = 'none';
                    login_payment.style.display = 'none';
                    return;
                } else {
                    //login_payment.style.display = 'block';
                    //login_payment.style.right = '0px';
                    //`("Vercoop.PAGE.move_div_to_left(350,login_payment)", 1);
                    return;
                }
            }
        }

        //test cash payment
        
    }

    this.pageLogoutSettings = function (msg, index, b1_text, b2_text) {
        if (Vercoop.API.Devices.hasOccupiedDevice()) {
            Vercoop.Utils.Utility.showMessageBox(WinJS.Resources.getString("STL_ERROR_NOT_LOGOUT_OCCUPIED_DEVICE").value,1);
        } else if (Vercoop.API.Devices.hasLoginedDevice()) {
            Vercoop.Utils.Utility.showMessageBox(WinJS.Resources.getString("STL_ERROR_NOT_LOGOUT_LOGINED_DEVICE").value,1);
        } else {
            Vercoop.Utils.Utility.showMessageBox(msg, 2, b1_text, 
                function () {
                    if (Vercoop.API.Devices.hasLoginedDevice()) {
                        Vercoop.PAGE.ContentInfo.UserLogoutRequest();
                    }
                    Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.USER_LOGIN, WinJS.Resources.getString('STL_PAGE_NAME_LOGIN').value);
                    Vercoop.Utils.Utility.closeMessageBox();
                    document.getElementById("group_leader_idx").setAttribute('data-value', 0);
                }, b2_text,
                function () {
                    Vercoop.Utils.Utility.closeMessageBox();
                });
        }
    }

    this.move_div_to_left = function (count) {
        var l = document.getElementById('login_payment');
        l.style.right = '-' + count + 'px';
    }

    this.showVideoOverview = function () {

        var overview = window.frames("video_overview").document.getElementById("bd").innerHTML;
        document.getElementById("main_container").innerHTML = overview;
    }
}
Vercoop.PAGE.MODE_LIST = [
    Vercoop.PAGE.MODE_TYPE.USER_LOGIN,
    Vercoop.PAGE.MODE_TYPE.WAITING,
    Vercoop.PAGE.MODE_TYPE.DEVICE_MANAGER,
    Vercoop.PAGE.MODE_TYPE.MAIN_PORTAL,
    Vercoop.PAGE.MODE_TYPE.CONTENT_INFO,
    Vercoop.PAGE.MODE_TYPE.VIDEO,
    Vercoop.PAGE.MODE_TYPE.GAME_REVIEW,

];