Vercoop.API.CommonAPI = new function () {
    this.playUserLogin = function (user_id, password, fc_finished) {
        var d = new Date();
        var currentMiliSeconds = parseInt(d.getTime() * 1000) + parseInt(d.getMilliseconds());
        var url = "http://api.87870.com/store/st_usr_login.php?nonocache=" + currentMiliSeconds;
        url += "&ver=1";
        url += "&user=" + user_id;
        url += "&pass=" + password;

        Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
            function completed(xmlHttpRequest) {
                try {
                    var result = JSON.parse(xmlHttpRequest.responseText);
                    if (result) {
                        if (result.hasOwnProperty("result")) {
                            var jResult = result["result"];
                            if (jResult.hasOwnProperty("code") && jResult.hasOwnProperty("msg")) {
                                if (jResult["code"] == "000") {
                                    var user_idx = parseInt(result["usr_idx"]);
                                    //var user_key = parseInt(result["key"]);
                                    var user_key = result["key"];
                                    fc_finished(user_idx, user_key);
                                    return;

                                }
                            }
                        }
                    }
                    fc_finished(null, null);
                } catch (ex) {
                    fc_finished(null, null);
                }

            },
            function error(xmlHttpRequest) {
                fc_finished(null, null);
            }
        );
    }

    this.paymentInCache = function (ct_idx, price, fc_finished) {
        var d = new Date();
        var currentMiliSeconds = parseInt(d.getTime() * 1000) + parseInt(d.getMilliseconds());
        var url = "http://api.87870.com/store/pay_cache.php?";
        url += "ver=1";
        url += "&ct_idx=" + ct_idx;
        url += "&price=" + price;
        url += "&nocach=" + currentMiliSeconds;

        content_id = ct_idx;

        Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
            function completed(xmlHttpRequest) {
                try {
                    var result = JSON.parse(xmlHttpRequest.responseText);
                    if (result) {
                        if (result.hasOwnProperty("result")) {
                            var jResult = result["result"];
                            if (jResult.hasOwnProperty("code") && jResult.hasOwnProperty("msg")) {
                                if (jResult["code"] == "000") {
                                    var payment_idx = parseInt(result["payment_idx"]);
                                    var payment_token = result["payment_token"];

                                    fc_finished(payment_idx, payment_token);
                                    return;
                                }
                            }
                        }
                    }
                    fc_finished(null, null);
                } catch (ex) {
                    fc_finished(null, null);
                }

            },
            function error(xmlHttpRequest) {
                fc_finished(null, null);
            }
        );
    }

    this.qrcodeString = function (pid, deviceToken, fc_finished) {
        var d = new Date();
        var currentMiliSeconds = parseInt(d.getTime() * 1000) + parseInt(d.getMilliseconds());
        var url = "http://api.87870.com/store/wxpay/pay_code.php?";
        url += "ver=1";
        url += "&pid=" + pid;
        url += "&device=" + deviceToken;
        url += "&nocach=" + currentMiliSeconds;

        Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
            function completed(xmlHttpRequest) {
                try {
                    var result = JSON.parse(xmlHttpRequest.responseText);
                    if (result) {
                        if (result.hasOwnProperty("result")) {
                            var jResult = result["result"];
                            if (jResult.hasOwnProperty("code") && jResult.hasOwnProperty("msg")) {
                                if (jResult["code"] == "000") {
                                   
                                    var qr_base = result['qr_base'];
                                    var qr_url = result['qr_url'];
                                    fc_finished(qr_url, qr_base);
                                    return;
                                }
                            }
                        }
                    }
                    fc_finished(null,null);
                } catch (ex) {
                    fc_finished(null, null);
                }

            },
            function error(xmlHttpRequest) {
                fc_finished(null, null);
            }
        );
    }

    this.gameCategorys = function (fc_finished) {
        var d = new Date();
        var currentMiliSeconds = parseInt(d.getTime() * 1000) + parseInt(d.getMilliseconds());
        var url = "http://api.87870.com/store/game_category.php?";
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

    this.gameList = function (fc_finished) {
        var d = new Date();
        var currentMiliSeconds = parseInt(d.getTime() * 1000) + parseInt(d.getMilliseconds());
        var url = "http://api.87870.com/store/gamelist.php?";
        url += "ver=2";
        url += "&nocach=" + currentMiliSeconds;

        Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
            function completed(xmlHttpRequest) {
                try {
                    var result = JSON.parse(xmlHttpRequest.responseText);
                    if (result) {
                        if (result.hasOwnProperty("result")) {
                            var jResult = result["result"];
                            if (jResult.hasOwnProperty("code") && jResult.hasOwnProperty("msg")) {
                                if (jResult["code"] == "000") {

                                    var games = result['games']['data'];
                                    fc_finished(games);
                                    return;
                                }
                            }
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