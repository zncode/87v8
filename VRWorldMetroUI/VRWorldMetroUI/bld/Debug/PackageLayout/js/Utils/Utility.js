var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/\r\n/g, "\n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }


Vercoop.Utils.Utility = new function () {
    this.isValidString = function (str) {
        if (str == null || str == undefined) return false;
        if (typeof str != 'string') return false;
        if (str.length == 0) return false;
        if (str == "Unkown type[object]") return false;
        return true;
    }
    this.NormalMouseUp = function (div, fc_up) {
        this.RegisterMouseUpEvent(div,
            function up() {
                div.style.opacity = 1.0;
                fc_up();
            },
            function over() {
                div.style.opacity = 0.9;
            },
            function down() {
                div.style.opacity = 0.5;
            },
            function normal() {
                div.style.opacity = 1.0;
            }

        );
    }
    this.RegisterMouseUpEvent = function (div, fc_up, fc_over, fc_down, fc_normal) {
        try {
            if (!div.hasOwnProperty("ci_mouse_st")) {
                Object.defineProperty(div, "ci_mouse_st", { value: "out", writable: true, configurable: true });
            } else {
                div.ci_mouse_st = "out";
            }
        } catch (ex) {
            Vercoop.Utils.Log.error("Exception-021:");
        }

        /*
            out: 마우스가 밖에 있는 상태: normal상태로 한다.
            in-clicked: 내부에서 클릭 되여있는 상태
            in-noclick: 내부에서 클릭 되여있지 않는 상태 
        */
        div.onmouseover = function () {
            if (this.ci_mouse_st == "out") {
                try {
                    if (fc_over) {
                        fc_over();
                    }
                } catch (ex) {
                    Vercoop.Utils.Log.error("Exception-022:");
                }
                this.ci_mouse_st = "in-noclick";
            }


        };
        div.onmouseleave = function () {

            this.ci_mouse_st = "out";
            if (fc_normal) {

                fc_normal();
            }
        };
        div.onmouseup = function () {

            if (this.ci_mouse_st == "in-clicked") {
                try {
                    if (fc_up) {
                        fc_up();

                    }
                    //this.ci_mouse_st = "out";
                    this.ci_mouse_st = "in-noclick";
                } catch (ex) {
                    Vercoop.Utils.Log.error("Exception-023:");
                }
            }
        };
        div.onmousedown = function () {
            if (this.ci_mouse_st == "in-noclick") {
                try {
                    if (fc_down) {
                        fc_down();

                     }
                    this.ci_mouse_st = "in-clicked";
                } catch (ex) {
                    Vercoop.Utils.Log.error("Exception-024:");
                }
            }
        }
    }
    this.OnTimerEvent = function (miliseconds, fc_callback) {
        setTimeout(onTimer, miliseconds);
        function onTimer() {
            fc_callback();
        }
    }
    this.showConfirmBox = function (message, yes, no, fc_onOK) {
        var box = new Windows.UI.Popups.MessageDialog(message);
        var cmd = new Windows.UI.Popups.UICommand(no);
        cmd.id = 1;
        box.commands.append(cmd);

        cmd = new Windows.UI.Popups.UICommand(yes);
        cmd.id = 2;
        box.commands.append(cmd);

        box.showAsync().then(function (command) {
            if (command) {
                if (command.id == 2) {
                    if (fc_onOK == undefined || fc_onOK == null) {

                    } else {
                        fc_onOK();
                    }
                    return true;
                }
            }
        });
    }

    this.showMessageBox = function (msg, index) {
        var title                   = WinJS.Resources.getString('STL_MESSAGE_BOX_TITLE').value;
        var message_box             = document.getElementById("message_box");
        var message_box_title       = document.getElementById("message_box_title");
        var message_box_msg         = document.getElementById("message_box_msg");
        var mask_layer              = document.getElementById("mask_layer");
        var index                   = arguments[1] ? arguments[1] : 1;
       
        message_box.style.display               = 'block';
        mask_layer.style.display                = 'block';
        message_box_msg.textContent             = msg;
        message_box_title.textContent           = title;

        if (index == 1) {
            document.getElementById("message_box_button_wrapper_1").style.display = 'block';
            var b1_text = arguments[2] ? arguments[2] : null;
            var f1_name = arguments[3] ? arguments[3] : null;

            if (b1_text)
            {
                document.getElementById("message_box_button_1_1").textContent = b1_text;
            }
            else {
                document.getElementById("message_box_button_1_1").textContent = WinJS.Resources.getString('STL_MESSAGE_BOX_BOTTUN_1').value;
            }

            if (f1_name) {
                document.getElementById("message_box_button_1_1").onclick = function () { f1_name(); }
            }
            else {
                document.getElementById("message_box_button_1_1").onclick = function () {
                    Vercoop.Utils.Utility.closeMessageBox();
                }
            }
        }
        if (index == 2) {
            document.getElementById("message_box_button_wrapper_2").style.display = 'block';
            var b1_text = arguments[2] ? arguments[2] : null;
            var f1_name = arguments[3] ? arguments[3] : null;
            var b2_text = arguments[4] ? arguments[4] : null;
            var f2_name = arguments[5] ? arguments[5] : null;

            if (b1_text) {
                document.getElementById("message_box_button_2_1").textContent = b1_text;
            }
            else
            {
                document.getElementById("message_box_button_2_1").textContent = WinJS.Resources.getString('STL_MESSAGE_BOX_BOTTUN_1').value;
            }

            if (b2_text) {
                document.getElementById("message_box_button_2_2").textContent = b2_text;
            }
            else
            {
                document.getElementById("message_box_button_2_2").textContent = WinJS.Resources.getString('STL_MESSAGE_BOX_BOTTUN_2').value;
            }

            document.getElementById("message_box_button_2_1").onclick = function () { f1_name(); }

            if (f2_name) {
                document.getElementById("message_box_button_2_2").onclick = function () { f2_name(); }
            }
            else {
                document.getElementById("message_box_button_2_2").onclick = function () {
                    Vercoop.Utils.Utility.closeMessageBox();
                }
            }
        }
    }

    this.closeMessageBox = function (msg, index) {
        document.getElementById("message_box").style.display = 'none';
        document.getElementById("mask_layer").style.display = 'none';
        document.getElementById("message_box_button_wrapper_1").style.display = 'none';
        document.getElementById("message_box_button_wrapper_2").style.display = 'none';
    }

    this.showPopupLoginBox = function (login_type) {
        document.getElementById("popup_login_box").style.display = 'block';
        document.getElementById("mask_layer").style.display = 'block';
        document.getElementById("popup_login_box_title").textContent = '请输入密码';

        document.getElementById("popup_login_box_button_wrapper").style.display = 'block';

        document.getElementById("popup_login_box_button_1").textContent = '确定';
        document.getElementById("popup_login_box_button_2").textContent = '取消';

        document.getElementById("popup_login_box_button_1").onclick = function () {
            var username = document.getElementById("popup_login_box_username").value;
            var password = document.getElementById("popup_login_box_password").value;

            if (!Vercoop.Utils.Utility.isValidString(username)) {
                Vercoop.Utils.Utility.showMessageBox(WinJS.Resources.getString('STL_MSG_USERID_WANTED').value);
                Vercoop.Utils.Utility.closePopupLoginBox();
                return;
            }
            if (!Vercoop.Utils.Utility.isValidString(password)) {
                Vercoop.Utils.Utility.showMessageBox(WinJS.Resources.getString('STL_MSG_USERPASS_WANTED').value);
                Vercoop.Utils.Utility.closePopupLoginBox();
                return;
            }

            //set  document.getElementsByName("login_type");
            var Obj = document.getElementsByName("login_type");
            Obj[login_type].checked = 'checked';

            document.getElementById("login_type").setAttribute('data-value', login_type);


            Vercoop.PAGE.UserLogin.ProcessUserLogin(username, password);
            if (login_type == 0) {
                
            }
            if (login_type == 1)
            {
                Vercoop.PAGE.Video.initialize();
            }
            if (login_type == 2)
            {
              //  Vercoop.PAGE.Gamereview.initialize();
            }
            Vercoop.Utils.Utility.closePopupLoginBox();
        }
        document.getElementById("popup_login_box_button_2").onclick = function () {
            Vercoop.Utils.Utility.closePopupLoginBox();
        } 
        
    }

    this.closePopupLoginBox = function (msg) {
        document.getElementById("popup_login_box").style.display = 'none';
        document.getElementById("mask_layer").style.display = 'none';
        document.getElementById("popup_login_box_button_wrapper").style.display = 'none';
    }

    this.showMessageBox1 = function (message, fc_onOK) {
        var box = new Windows.UI.Popups.MessageDialog(message);
        var cmd = new Windows.UI.Popups.UICommand(WinJS.Resources.getString('STL_LBL_BTN_CLOSE').value);
        cmd.id = 1;
        box.commands.append(cmd);

        try {
            box.showAsync().done(
            function ok(command) {
                if (fc_onOK == undefined || fc_onOK == null) {

                } else {
                    fc_onOK();
                }
            },
            null, null
        );
        } catch (ex) {
            Vercoop.Utils.Log.log("Exception-028:");
        }
    }

    this.getWidthOfText = function (txt, fontname, fontsize) {
        // Create a dummy canvas (render invisible with css)
        var c = document.createElement('canvas');
        // Get the context of the dummy canvas
        var ctx = c.getContext('2d');
        // Set the context.font to the font that you are using
        ctx.font = fontsize + 'px' + fontname;
        // Measure the string 
        // !!! <CRUCIAL>  !!!
        var length = ctx.measureText(txt).width;
        // !!! </CRUCIAL> !!!
        // Return width
        return length;
    }

    this.isValidIPAddress = function (address) {
        if (this.isValidString(address)) {
            var ips = address.split(".");
            if (ips.length == 4) {
                for (var i = 0; i < ips.length; i++) {
                    var value = parseInt(ips[i]);
                    if (value >= 0 && value < 256) {
                        if (value == 0 && i == 0) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }
    
    this.XHR = function (param, fc_completed, fc_error, fc_progress) {
        WinJS.Promise.timeout(Vercoop.XHR_TIMEOUT, WinJS.xhr(param)
            .then(function complete(result) {
                if (fc_completed) {
                    fc_completed(result);
                }
            },
            function error(error) {
                if (fc_error) {
                    fc_error(error);
                }
            },
            function progress(result) {
                if (fc_progress) {
                    fc_progress(result);
                }
            }));
    }

    this.formatTime = function (totalSeconds) {
        if (totalSeconds < 86400) {
            var dt = new Date("01/01/2000 0:00");

            dt.setSeconds(totalSeconds);
            var h = dt.getHours(),
                m = dt.getMinutes(),
                s = dt.getSeconds(),
                r = "";
            if (h > 0) {
                r += (h > 9 ? h.toString() : "0" + h.toString()) + ":";
            }
            r += (m > 9 ? m.toString() : "0" + m.toString()) + ":"
            r += (s > 9 ? s.toString() : "0" + s.toString());
            return r;
        } else {
            return null;
        }
    }
}