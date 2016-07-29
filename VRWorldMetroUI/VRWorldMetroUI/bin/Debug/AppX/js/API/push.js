Vercoop.Push = new function () {
    var _currentToken = null;
    var _nocache_index = 1;
    var _isAlive = false;
    var _lastErrorMessage = "Server does not working";
    var _currentUserIdx = 0;
    var _callbackPlayContent = null;
    var _callbackUserLogin = null;



    function GetNoCacheParam() {
        _nocache_index++;
        return "nocache=" + _nocache_index;
    }
    this.LastErrorMessage = function () {
        return _lastErrorMessage;
    }
    this.getToken = function () {
        return _currentToken;
    }
    this.processPlayQRCode = function (codeString, div_id, width, height, callback_payment, callback_login) {
        var container = document.getElementById(div_id);
        while (container.hasChildNodes) {
            var lNode = container.firstChild;
            if (lNode) {
                container.removeChild(lNode);
            } else {
                break;
            }

        }
        var codeData = "INVALID-TOKEN";
        if (_isAlive) {
            codeData = _currentToken + ":" + codeString;
            
        }
        codeData = Base64.encode(codeData);
        var option = {
            width: width,
            height: height,
            typeNumber: 4,
            colorDark: "#000000",
            colorLight: "#ffffff"
        };
        var qrcode = new QRCode(div_id, option);
        qrcode.makeCode(codeData);
        _callbackPlayContent = callback_payment;
        _callbackUserLogin = callback_login;
        return true;

    }
    this.OnErrorPorcess = function (err) {
        processError(err);
    }
    this.onStart = function (user_idx, on_success, on_failed) {
        var url = "http://media.87870.com:9091/register?" + GetNoCacheParam();
        _currentUserIdx = user_idx;
        url += "&user_idx=" + user_idx;
        url += "&device=" + Vercoop.Utils.Storage.getDeviceID();
        Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
            function completed(xmlHttpRequest) {
                var res_txt = xmlHttpRequest.responseText;
                try {
                    var jsonResponse = JSON.parse(res_txt);
                    if (jsonResponse.hasOwnProperty("result")) {
                        var result = jsonResponse.result;
                        if (result.hasOwnProperty("code")) {
                            if (result.code == "000") {
                                _currentToken = result.token;
                                _isAlive = true;
                                on_success();
                                onCheckPushMessage();
                            } else {
                                on_failed("code:" + result.code + "[" + result.msg + "]");
                            }
                            return;
                        }
                    }
                    on_failed("Internal Server Output Error (" + res_txt + ")");
                } catch (e) {
                    on_failed("Catch Error[" + res_txt + "]");

                    Vercoop.ui.LOG.addLog("Exception-002:" + res_txt);
                }

            },
            function error(err) {
                on_failed(url + "[HTTP ERROR]");
            }
        );

    }

    var isProcingonCheckPushMessage = false;
    function onCheckPushMessage() {
        if (_isAlive == false) return;
        if (isProcingonCheckPushMessage) {
            return;
        }
        isProcingonCheckPushMessage = true;
        var url = "http://media.87870.com:9091/checkNewMessage?" + GetNoCacheParam();
        url += "&token=" + _currentToken;
        url += "&device=" + Vercoop.Utils.Storage.getDeviceID();
        Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
            function completed(xmlHttpRequest) {
                isProcingonCheckPushMessage = false;
                var res_txt = xmlHttpRequest.responseText;
                console.log(res_txt);
                try {
                    if (_isAlive == false) return;
                    var jsonResponse = JSON.parse(res_txt);
                    if (jsonResponse.hasOwnProperty("result")) {
                        var result = jsonResponse.result;
                        if (result.hasOwnProperty("code")) {
                            if (result.code == "201") {
                                //timeout
                                onCheckPushMessage();
                                return;
                            } else if (result.code == "000") {
                                if (result.hasOwnProperty("data")) {
                                    processPushResult(result.data, res_txt);
                                    onCheckPushMessage();
                                    return;
                                }
                            }
                        }
                    }

                    processError("Internal Server Output Error (" + res_txt + ")");
                } catch (e) {
                    processError("Catch Error[" + res_txt + "]");
                }

            },
            function error(err) {
                isProcingonCheckPushMessage = false;
                processError(url + "[HTTP ERROR]");
            }
        );
    }
    var _isErrorProcing = false;
    function processError(message) {
        if (_isErrorProcing) {
            return;
        }
        _isErrorProcing = true;
        _isAlive = false;
        if (message) {
            _lastErrorMessage = message;
        }

        //재시작을 진행한다.
        Vercoop.Push.onStart(_currentUserIdx,
            function success() {
                //Nothing to do
                _isErrorProcing = false;
            },
            function failed(message) {
                //2초후에 다시 시작한다.
                setTimeout(processError, 2000);
                _isErrorProcing = false;
            });
    }
    function processPushResult(data, response_text) {
        if (data.hasOwnProperty("type")) {
            if (data.type == "001") {
                //Test Content Updated

            } else if (data.type == "002") {
                //payment confirmed
                var cts_idx = parseInt(data.cts_idx);
                if (_callbackPlayContent) {
                    _callbackPlayContent(cts_idx);
                }
            } else if (data.type == "003") {
                //Login Request
                var user_idx = parseInt(data.user_idx);
                var key = data.key;
                if (_callbackUserLogin) {
                    _callbackUserLogin(user_idx, key);
                }
            } else if (data.type == '004') {
                var cts_idx = parseInt(data.cts_idx);
                var payment_idx = parseInt(data.payment_idx);
                var payment_token = data.payment_token;

                if (payment_idx && payment_token) {
                    Vercoop.Utils.Utility.showMessageBox('支付成功!! 支付ID: ' + payment_idx);
                    login_payment.style.display = '';
                    document.getElementById("cts_detail_btn_play").removeAttribute("disabled");

                    //save payment_content_id
                    Vercoop.PAGE.ContentInfo.setCurrentPayment_ct_idx(cts_idx, payment_idx, payment_token);
                    //Vercoop.Utils.Storage.paymentCtIdx.id = cts_idx;

                }
                else {
                    Vercoop.Utils.Utility.showMessageBox('支付失败!');
                    login_payment.style.display = '';
                } 
            }
            else {
                //other types todo

            }
            return;
        }
        processError("Push format error:[" + response_text + "]");

    }

}