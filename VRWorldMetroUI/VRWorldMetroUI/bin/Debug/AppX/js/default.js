// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509

var Vercoop = new function () {
    this.UI_TEST_MODE = false;
    this.DEVELOPER_TEST_MODE = true;
    this.XHR_TIMEOUT = 15000; // 15 seconds
    this.Utils = new function () {

    }
    this.API = new function () {

    }

};



(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                console.log("new lunched");
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                console.log("become active");
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());
        }
    };
    app.onloaded = function () {
        WinJS.Resources.processAll();
        Vercoop.PAGE.InitializeComponents();
    };
    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    WinJS.Application.onsettings = function (e) {
        "use strict";
        var login_type = document.getElementById("login_type").attributes['data-value'].value;

        var settingsList = new Object();
        settingsList.div_contactInfo = { href: "/pages/settings/index.html", title: WinJS.Resources.getString('STL_SETTINS_CONTACT_US').value };
        settingsList.div_version = { href: "/pages/settings/index.html", title: WinJS.Resources.getString('STL_APP_VERSIONINFO').value };



        if (login_type == 2) {
            settingsList.div_device = { href: "/pages/settings/index.html", title: '设备绑定' };
        }

        e.detail.applicationcommands = settingsList;
        WinJS.UI.SettingsFlyout.populateSettings(e);

        var as = Windows.UI.ApplicationSettings;

        //switch platform, get login type
       
        if (login_type == 1) {
            //device list
            if (1) {
                var title = WinJS.Resources.getString('STL_PAGE_NAME_DEVICE_LIST').value;
                var command = new as.SettingsCommand("cmd_id_main_device_man", title, function () {
                    Vercoop.PAGE.pushNewPage(Vercoop.PAGE.MODE_TYPE.DEVICE_MANAGER, WinJS.Resources.getString('STL_PAGE_NAME_DEVICE_LIST').value);

                });
                e.detail.e.request.applicationCommands.append(command);
            }

            var menu_video = '视频平台';
            var command = new as.SettingsCommand("cmd_id_main_video_platform", menu_video, function () {
                Vercoop.Utils.Utility.showPopupLoginBox(1);
            });
            e.detail.e.request.applicationCommands.append(command);

            var menu_game_review = '游戏浏览平台';
            var command = new as.SettingsCommand("cmd_id_main_game_review_platform", menu_game_review, function () {
                Vercoop.Utils.Utility.showPopupLoginBox(2);
            });
            e.detail.e.request.applicationCommands.append(command);
        }
        if (login_type == 2) {
            //device list
     /*       if (1) {
                var title = WinJS.Resources.getString('STL_PAGE_NAME_DEVICE_LIST').value;
                var command = new as.SettingsCommand("cmd_id_main_device_man", title, function () {
                    Vercoop.PAGE.pushNewPage(Vercoop.PAGE.MODE_TYPE.DEVICE_MANAGER, WinJS.Resources.getString('STL_PAGE_NAME_DEVICE_LIST').value);

                });
                e.detail.e.request.applicationCommands.append(command);
            } */

            var menu_game = '游戏平台';
            var command = new as.SettingsCommand("cmd_id_main_game_platform", menu_game, function () {
                Vercoop.Utils.Utility.showPopupLoginBox(0);
            });
            e.detail.e.request.applicationCommands.append(command);

            var menu_game_review = '游戏浏览平台';
            var command = new as.SettingsCommand("cmd_id_main_game_review_platform", menu_game_review, function () {
                Vercoop.Utils.Utility.showPopupLoginBox(2);
            });
            e.detail.e.request.applicationCommands.append(command);
        }
        if (login_type == 3) {
            var menu_game = '游戏平台';
            var command = new as.SettingsCommand("cmd_id_main_game_platform", menu_game, function () {
                Vercoop.Utils.Utility.showPopupLoginBox(0);
            });
            e.detail.e.request.applicationCommands.append(command);
            var menu_video = '视频平台';
            var command = new as.SettingsCommand("cmd_id_main_video_platform", menu_video, function () {
                Vercoop.Utils.Utility.showPopupLoginBox(1);
            });
            e.detail.e.request.applicationCommands.append(command);
        }

        //device list
        var title = WinJS.Resources.getString('STL_PAGE_NAME_DEVICE_LIST').value;
        var command = new as.SettingsCommand("cmd_id_main_device_man", title, function () {
            Vercoop.PAGE.pushNewPage(Vercoop.PAGE.MODE_TYPE.DEVICE_MANAGER, WinJS.Resources.getString('STL_PAGE_NAME_DEVICE_LIST').value);

        });
        e.detail.e.request.applicationCommands.append(command);

        //logout
      //  if (document.getElementById("group_leader_idx").attributes['data-value'].value != 0) {
            var title = WinJS.Resources.getString('STL_SETTINS_LOGOUT').value;
            var logout_msg = WinJS.Resources.getString('STL_MESSAGE_BOX_LOGOUT').value;
            var button_1 = WinJS.Resources.getString('STL_MESSAGE_BOX_BOTTUN_1').value;
            var button_2 = WinJS.Resources.getString('STL_MESSAGE_BOX_BOTTUN_2').value;

            var command = new as.SettingsCommand("cmd_id_main_logout", title, function () {
                /* if (Vercoop.API.Devices.hasOccupiedDevice()) {
                    Vercoop.Utils.Utility.showMessageBox(WinJS.Resources.getString("STL_ERROR_NOT_LOGOUT_OCCUPIED_DEVICE").value);
                } else if (Vercoop.API.Devices.hasLoginedDevice()) {
                    Vercoop.Utils.Utility.showMessageBox(WinJS.Resources.getString("STL_ERROR_NOT_LOGOUT_LOGINED_DEVICE").value);
                } else {
                    Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.USER_LOGIN, WinJS.Resources.getString('STL_PAGE_NAME_LOGIN').value);
                } */
                Vercoop.PAGE.pageLogoutSettings(logout_msg, 2, button_1, button_2);

            });
            e.detail.e.request.applicationCommands.append(command);
       // }

        if (Vercoop.UI_TEST_MODE || false) {
            if (1) {
                var title = Vercoop.PAGE.GetDebugAreaString();
                var command = new as.SettingsCommand("cmd_id_main_portal", title, function () { });
                e.detail.e.request.applicationCommands.append(command);
            }
            if (1) {
                var title = "Debug: Body (" + document.body.clientWidth + "X" + document.body.clientHeight + ")";
                //var title = "Debug: Document.Body (" +window.innerWidth + "X" + window.innerHeight + ")";
                var command = new as.SettingsCommand("cmd_id_main_portal", title, function () { });
                e.detail.e.request.applicationCommands.append(command);
            }
            if (1) {
                var title = "Shw Hide UI Debug";
                //var title = "Debug: Document.Body (" +window.innerWidth + "X" + window.innerHeight + ")";
                var command = new as.SettingsCommand("cmd_id_main_portal", title, function () {
                    var div = document.getElementById("debug_position_settings");
                    if (div.style.display == "block") {
                        div.style.display = "none";
                        document.getElementById("main_container").style.backgroundColor = "black";
                    } else {
                        div.style.display = "block";
                        document.getElementById("main_container").style.backgroundColor = "green";
                    }
                });
                e.detail.e.request.applicationCommands.append(command);
            }

            
        }
    }
    app.start();
})();
