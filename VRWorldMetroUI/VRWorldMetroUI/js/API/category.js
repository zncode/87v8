Vercoop.API.Category = new function () {
    var m_Categories = [];
    function CateoryInfo(_name, _ca_idx) {
        this.name = "";
        this.ca_idx = 0;
        if(_name) this.name = _name;
        if(_ca_idx) this.ca_idx = _ca_idx;
    }
    this.load = function (on_callback) {
        m_Categories.splice(0, m_Categories.length);
        if (Vercoop.UI_TEST_MODE) {
            Vercoop.Utils.Utility.OnTimerEvent(1000, function () {
                var info = new CateoryInfo("HOT", 1);
                m_Categories.push(info);
                info = new CateoryInfo("CA1", 2);
                m_Categories.push(info);
                info = new CateoryInfo("CA2", 3);
                m_Categories.push(info);
                info = new CateoryInfo("CA5", 4);
                m_Categories.push(info);
                on_callback(m_Categories.length);
            });
        } else {
            //TODO API Request
            api_Category(function (isSuccess) {
                on_callback(m_Categories.length);
            });
        }
    }
    this.CreateCAInfo = function (name, idx) {
        var info = new CateoryInfo(name, idx);
        return info;
    }
    this.Count = function () {
        return m_Categories.length;
    }
    this.CategoryAtIndex = function (index) {
        return m_Categories[index];
    }

    function api_Category(on_callback) {

         var arrData = [] ;
         arrData.push({ 'idx': 1, 'name': '冒险' }, { 'idx': 2, 'name': '休闲' }, { 'idx': 3, 'name': '星际' });
        if (Array.isArray(arrData)) {
            for (var i = 0; i < arrData.length; i++) {
                var jInfo = arrData[i];
                if (jInfo.hasOwnProperty("idx") && jInfo.hasOwnProperty("name")) {
                    var newInfo = new CateoryInfo(jInfo["name"], parseInt(jInfo["idx"]));
                    m_Categories.push(newInfo);

                }
            }
            on_callback(true);
            return;
        }
    }

    function api_Category_1(on_callback) {

        var d = new Date();
        var currentMiliSeconds = parseInt(d.getTime() * 1000) + parseInt(d.getMilliseconds());
        var url = "http://api.87870.com/store/game_category.php?ver=1";
        url += "&nonocache=" + currentMiliSeconds;
        Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
            function completed(xmlHttpRequest) {
                try {
                    var result = JSON.parse(xmlHttpRequest.responseText);
                    if (result) {
                        if (result.hasOwnProperty("count") && result.hasOwnProperty("data")) {
                            var cnt = parseInt(result["count"]);
                            if (cnt > 0) {
                                var arrData = result["data"];         
                               // var arrData = [] ;
                              //  arrData.push({ 'idx': 1, 'name': '目录1' }, { 'idx': 2, 'name': '目录2' }, { 'idx': 3, 'name': '目录3' });
                                if (Array.isArray(arrData)) {
                                    for (var i = 0; i < arrData.length; i++) {
                                        var jInfo = arrData[i];
                                        if (jInfo.hasOwnProperty("idx") && jInfo.hasOwnProperty("name")) {
                                            var newInfo = new CateoryInfo(jInfo["name"], parseInt(jInfo["idx"]));
                                            m_Categories.push(newInfo);

                                        }
                                    }
                                    on_callback(true);
                                    return;
                                }
                            }
                        }

                    } 
                    on_callback(false);
                } catch (ex) {
                    on_callback(false);
                }

            },
            function error(xmlHttpRequest) {
                on_callback(false);
            }
        );
    }
}
