Vercoop.PAGE.UserLogin = new function () {
    this.isAcivated = function () {
        if (document.getElementById(Vercoop.PAGE.MODE_TYPE.USER_LOGIN).style.display == "none") {
            return false;
        }
        return true;
    }
    var m_GroupLeaderIdx = 0;
    this.OnInputKeyPressed = function (obj, event) {
        var value = obj.value;
        if (Vercoop.Utils.Utility.isValidString(value)) {
            event = event || window.event;
            if (event.keyCode == 13) {
                this.ProcessUserLogin();
            }


        }
    }

    this.ProcessUserLogin = function (username, password) {
        Vercoop.PAGE.showMaskLoading();
        Vercoop.Utils.Storage.LoginInfo.userIDX = 0;
        if (username) {
            var user_id = username;
        } else {
            var user_id = document.getElementById("in_user_id").value;
        }
        if (password) {
            var user_password = password;
        } else {
            var user_password = document.getElementById("in_user_password").value;
        }

        if (!Vercoop.Utils.Utility.isValidString(user_id)) {
            Vercoop.Utils.Utility.showMessageBox(WinJS.Resources.getString('STL_MSG_USERID_WANTED').value);
            return;
        }
        if (!Vercoop.Utils.Utility.isValidString(user_password)) {
            Vercoop.Utils.Utility.showMessageBox(WinJS.Resources.getString('STL_MSG_USERPASS_WANTED').value);
            return;
        }
        if (user_id == 'admin' && user_password == 'admin') {
            Vercoop.Utils.Storage.LoginInfo.PrevID = user_id;
            Vercoop.API.Category.load(function () {
                Vercoop.PAGE.hiddenMaskLoading();
                Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.MAIN_PORTAL);
            });
            return;
        }
     /*   Vercoop.PAGE.ShowLoadingStatus(0, 0.9, WinJS.Resources.getString('STL_MSG_LOGGING').value);
        api_groupLogin(function (isSuccess) {
            if (!isSuccess) {
                Vercoop.PAGE.hideLoading();
                Vercoop.Utils.Utility.showMessageBox("Login Failed( by group)");
                return;
            }
            var d = new Date();
            var currentMiliSeconds = parseInt(d.getTime() * 1000) + parseInt(d.getMilliseconds());
            var url = "http://api.87870.com/usr_login?nonocache=" + currentMiliSeconds;
            url += "&ver=7";
            url += "&pass=" + user_password;
            url += "&store_member=true";
            url += "&user=87870|" + user_id;

            Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
                function completed(xmlHttpRequest) {


                    try {
                        var result = JSON.parse(xmlHttpRequest.responseText);
                        if (result) {
                            if (result.hasOwnProperty("result")) {
                                var jResult = result["result"];
                                if (jResult.hasOwnProperty("code") && jResult.hasOwnProperty("msg")) {
                                    if (jResult["code"] == "000") {
                                        Vercoop.Utils.Storage.LoginInfo.PrevID = user_id;
                                        Vercoop.Utils.Storage.LoginInfo.userIDX = parseInt(result["idx"]);
                                        Vercoop.API.Category.load(function () {
                                            Vercoop.PAGE.hideLoading();

                                            //check login type, game=1, video=2, game_review=3
                                            var Obj = document.getElementsByName("login_type");
                                            for (i = 0; i < Obj.length; i++) {
                                                if (Obj[i].checked) {
                                                    var login_type = Obj[i].value;
                                                }
                                            };

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
                                            }

                                            //setup login_type
                                            document.getElementById("login_type").setAttribute("data-value", login_type);

                                        });
                                        var user_idx = parseInt(result["idx"]);
                                        Vercoop.Push.onStart(user_idx,
                                            function () {

                                            },
                                            function (error) {
                                                Vercoop.Push.OnErrorPorcess(error);
                                            });

                                    } else {
                                        Vercoop.PAGE.hideLoading();
                                        switch (parseInt(jResult["code"])) {
                                            case 320:
                                                Vercoop.Utils.Utility.showMessageBox(WinJS.Resources.getString("STL_ERROR_LOGIN_ID_ERROR").value);
                                                break;
                                            case 606: // password not match
                                            case 607: // id is not match
                                            case 608: // Sign Error
                                                Vercoop.Utils.Utility.showMessageBox(WinJS.Resources.getString("STL_ERROR_LOGIN_ID_ERROR").value);
                                                break;
                                            default:
                                                Vercoop.Utils.Utility.showMessageBox("登录失败 (" + jResult["code"] + ":" + jResult["msg"] + ")");
                                        }

                                    }
                                    return;
                                }
                            }
                        }
                        Vercoop.PAGE.hideLoading();
                        Vercoop.Utils.Utility.showMessageBox("登录失败( Unkown )");
                    } catch (ex) {
                        Vercoop.PAGE.hideLoading();
                        Vercoop.Utils.Utility.showMessageBox("登录失败( Exception )");
                    }

                },
                function error(xmlHttpRequest) {
                    Vercoop.PAGE.hideLoading();
                    Vercoop.Utils.Utility.showMessageBox("登录失败( HTTP )");
                }
            );
        }); */
    }

    this.ProcessUserLogin_1 = function (username, password) {
        Vercoop.Utils.Storage.LoginInfo.userIDX = 0;
        if (username)
        {
            var user_id = username;
        } else {
            var user_id = document.getElementById("in_user_id").value;
        }
        if (password)
        {
            var user_password = password;
        } else {
            var user_password = document.getElementById("in_user_password").value;
        }
       
        if (!Vercoop.Utils.Utility.isValidString(user_id)) {
            Vercoop.Utils.Utility.showMessageBox(WinJS.Resources.getString('STL_MSG_USERID_WANTED').value);
            return;
        }
        if (!Vercoop.Utils.Utility.isValidString(user_password)) {
            Vercoop.Utils.Utility.showMessageBox(WinJS.Resources.getString('STL_MSG_USERPASS_WANTED').value);
            return;
        }
        if (Vercoop.UI_TEST_MODE) {
            Vercoop.Utils.Storage.LoginInfo.PrevID = user_id;
            Vercoop.API.Category.load(function () {
                Vercoop.PAGE.hideLoading();
                Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.MAIN_PORTAL);
            });
            return;
        }
        Vercoop.PAGE.ShowLoadingStatus(0, 0.9, WinJS.Resources.getString('STL_MSG_LOGGING').value);
        api_groupLogin(function (isSuccess) {
            if (!isSuccess) {
                Vercoop.PAGE.hideLoading();
                Vercoop.Utils.Utility.showMessageBox("Login Failed( by group)");
                return;
            }
            var d = new Date();
            var currentMiliSeconds = parseInt(d.getTime() * 1000) + parseInt(d.getMilliseconds());
            var url = "http://api.87870.com/usr_login?nonocache=" + currentMiliSeconds;
            url += "&ver=7";
            url += "&pass=" + user_password;
            url += "&store_member=true";
            url += "&user=87870|" + user_id;

            Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
                function completed(xmlHttpRequest) {

                    
                    try {
                        var result = JSON.parse(xmlHttpRequest.responseText);
                        if (result) {
                            if (result.hasOwnProperty("result")) {
                                var jResult = result["result"];
                                if (jResult.hasOwnProperty("code") && jResult.hasOwnProperty("msg")) {
                                    if (jResult["code"] == "000") {
                                        Vercoop.Utils.Storage.LoginInfo.PrevID = user_id;
                                        Vercoop.Utils.Storage.LoginInfo.userIDX = parseInt(result["idx"]);
                                        Vercoop.API.Category.load(function () {
                                            Vercoop.PAGE.hideLoading();

                                            //check login type, game=1, video=2, game_review=3
                                            var Obj = document.getElementsByName("login_type");
                                            for (i = 0; i < Obj.length; i++) {
                                                if (Obj[i].checked) {
                                                  var login_type = Obj[i].value;
                                                }
                                            };

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
                                            }

                                            //setup login_type
                                            document.getElementById("login_type").setAttribute("data-value", login_type);
                                           
                                        });
                                        var user_idx = parseInt(result["idx"]);
                                        Vercoop.Push.onStart(user_idx,
                                            function () {
                                                
                                            },
                                            function (error) {
                                                Vercoop.Push.OnErrorPorcess(error);
                                        });
                                        
                                    } else {
                                        Vercoop.PAGE.hideLoading();
                                        switch (parseInt(jResult["code"])) {
                                            case 320:
                                                Vercoop.Utils.Utility.showMessageBox(WinJS.Resources.getString("STL_ERROR_LOGIN_ID_ERROR").value);
                                                break;
                                            case 606: // password not match
                                            case 607: // id is not match
                                            case 608: // Sign Error
                                                Vercoop.Utils.Utility.showMessageBox(WinJS.Resources.getString("STL_ERROR_LOGIN_ID_ERROR").value);
                                                break;
                                            default:
                                                Vercoop.Utils.Utility.showMessageBox("登录失败 (" + jResult["code"] + ":" + jResult["msg"] + ")");
                                        }
                                        
                                    }
                                    return;
                                }
                            }
                        }
                        Vercoop.PAGE.hideLoading();
                        Vercoop.Utils.Utility.showMessageBox("登录失败( Unkown )");
                    } catch (ex) {
                        Vercoop.PAGE.hideLoading();
                        Vercoop.Utils.Utility.showMessageBox("登录失败( Exception )");
                    }

                },
                function error(xmlHttpRequest) {
                    Vercoop.PAGE.hideLoading();
                    Vercoop.Utils.Utility.showMessageBox("登录失败( HTTP )");
                }
            );
        });
    }



    function api_groupLogin(fc_finished) {
        fc_finished(true);

        var d = new Date();
        var currentMiliSeconds = parseInt(d.getTime() * 1000) + parseInt(d.getMilliseconds());
        var url = "http://api.87870.com/gr_login?nonocache=" + currentMiliSeconds;
        //var url = "http://127.0.0.1:8787/tst_timeout?nonocache=" + currentMiliSeconds;
        url += "&jver=2&ver=2";
        url += "&gr_nm=" + "87870_HappySpace";
        url += "&gr_key=" + "df70a3f120aa1e10e79531d1b313bf94";
        m_GroupLeaderIdx = 0;
        Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
            function completed(xmlHttpRequest) {
                try {
                   var result = JSON.parse(xmlHttpRequest.responseText);
                    if (result) {

                        if (!result.hasOwnProperty("leader_user_idx")) {
                            fc_finished(false);
                        } else {
                            m_GroupLeaderIdx = parseInt(result.leader_user_idx);
                            document.getElementById("group_leader_idx").setAttribute('data-value', m_GroupLeaderIdx);
                            fc_finished(true);
                        }
                        
                    } else {
                        fc_finished(false);
                    }
                } catch (ex) {
                    fc_finished(false);
                }

            },
            function error(xmlHttpRequest) {
                fc_finished(false);
            }
        );
    }
}