
var _no_cacheCnt = 0;
var _deviceGlobalIndex = 0;
function generateDeviceGlobalIndex() {
    _deviceGlobalIndex++;
    if (_deviceGlobalIndex > 10000) {
        _deviceGlobalIndex = 1;
    }
    return _deviceGlobalIndex;
}
function DeviceUserInfo()
{
    this.user_idx = 0;
    this.user_name = "";
    this.user_thumbnail = "";

    this.getUserDisplayName = function () {
        if (Vercoop.Utils.Utility.isValidString(this.user_name)) {
            return this.user_name;
        }
        return "username";
    }
    this.getUserThumbnail = function () {
        if (Vercoop.Utils.Utility.isValidString(this.user_thumbnail)) {
            return this.user_thumbnail;
        }
        return "/images/test_image/user_512x512.png";
    }
}
function DeviceURLNoCache(ip, name) {
    var url = "http://" + ip + ":8787/" + name;
    var d = new Date();
    var currentMiliSeconds = parseInt(d.getTime() * 1000) + parseInt(d.getMilliseconds());
    url += "?nocache=" + (_no_cacheCnt++) + "&no_timeCache=" + currentMiliSeconds;
    return url;
}

Vercoop.API.Devices = new function () {
    var m_Devices = [];
    var mLocalFolder = Windows.Storage.ApplicationData.current.localFolder;

    this.DeviceType = {
        EGG_CHAIR : {name: "_egg_chair", langValue: "STL_DEVICE_TYPE_EGG_CHAIR"}
    }
    this.DEVICE_STATUS = {
        ACTIVE: { name: "_active" , langValue:"STL_DEVICE_STATUS_ACTIVE"},
        RUNNING: { name: "_running", langValue: "STL_DEVICE_STATUS_RUNNING" },
        INVALID: { name: "_invalid", langValue: "STL_DEVICE_STATUS_INVALID" }
    }
    function DeviceInfo() {
        this.IP_ADDRESS = "";
        this.name = "";
        this.type = "";
        this.status = "";
        this.thumb_path = null;
        this.error = null;
        this.callback_changed = null;
        this.isChecking = false;
        this.userInfo = null;
        this.global_index = 0;
        this.server_device_idx = 0;
        this.action_code = 0;
        this.GetDeviceStatusString = function () {
            var res = WinJS.Resources.getString("STL_DEVICE_STATUS_INVALID").value;
            for (var name in Vercoop.API.Devices.DEVICE_STATUS) {
                var item = Vercoop.API.Devices.DEVICE_STATUS[name];
                if (item.name == this.status) {
                    res = WinJS.Resources.getString(item.langValue).value;
                    break;
                }

            }
            return res;
        }
        this.GetDevicetypeString = function () {
            var res = WinJS.Resources.getString("STL_DEVICE_TYPE_EGG_CHAIR").value;
            for (var name in Vercoop.API.Devices.DeviceType) {
                var item = Vercoop.API.Devices.DeviceType[name];
                if (item.name == this.type) {
                    res = WinJS.Resources.getString(item.langValue).value;
                    break;
                }
                
            }
            return res;
        }
        this.isInvalid = function () {
            if (this.status == Vercoop.API.Devices.DEVICE_STATUS.INVALID.name) return true;
            return false;
        }
        this.isReadyToPlay = function () {
            if (this.status == Vercoop.API.Devices.DEVICE_STATUS.ACTIVE.name) return true;
            return false;
        }
        this.isRunning = function () {
            if (this.status == Vercoop.API.Devices.DEVICE_STATUS.ACTIVE.name) return true;
            if (this.status == Vercoop.API.Devices.DEVICE_STATUS.RUNNING.name) return true;
            return false;
        }
        this.isOccuppied= function () {
            if (this.status == Vercoop.API.Devices.DEVICE_STATUS.RUNNING.name) return true;
            return false;
        }
        this.getBGColor = function () {
            if (this.isOccuppied()) {
                //return "#ed1c24";
                //return "#1bb7d5";
                return 'green'
            } else if (this.isRunning()) {
                //return "#1bb7d5";
                return 'green'
            }
            return "#FFCC00";
        }
        this.RequestReplayGame = function (fc_callback) {
            var url = DeviceURLNoCache(this.IP_ADDRESS, "response/replayGame");
            url += "&replay=yes";
            var targetObj = this;
            Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
               function completed(xmlHttpRequest) {
                   var res_txt = xmlHttpRequest.responseText;
                   try {
                       var jsonResponse = JSON.parse(res_txt);
                       if (jsonResponse.hasOwnProperty("code") && jsonResponse.hasOwnProperty("msg")) {
                           if (jsonResponse["code"] == "000") {
                               fc_callback(0);
                               return;
                           } else {
                               fc_callback(parseInt(jsonResponse["code"]));
                               return;
                           }

                       }
                       fc_callback(-1);
                   } catch (ex) {

                       fc_callback(-2);
                   }
               },
               function error(err) {
                   fc_callback(-3);
               }
           );
        }
        this.RequestUserLogout = function (fc_callback) {
            var url = DeviceURLNoCache(this.IP_ADDRESS, "usr_logout");
             var targetObj = this;
            Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
               function completed(xmlHttpRequest) {
                   var res_txt = xmlHttpRequest.responseText;
                   try {
                       var jsonResponse = JSON.parse(res_txt);
                       if (jsonResponse.hasOwnProperty("code") && jsonResponse.hasOwnProperty("msg")) {
                           if (jsonResponse["code"] == "000") {
                               targetObj.userInfo = null;
                               fc_callback(0);
                               return;
                           } else {
                               fc_callback(parseInt(jsonResponse["code"]));
                               return;
                           }

                       }
                       fc_callback(-1);
                   } catch (ex) {

                       fc_callback(-2);
                   }
               },
               function error(err) {
                   fc_callback(-3);
               }
           );
        }
        this.RequestUserLogin = function (user_idx, access_key, fc_callback) {
            var url = DeviceURLNoCache(this.IP_ADDRESS, "usr_login");
            url += "&user_idx=" + user_idx;
            url += "&access_key=" + Base64.encode(access_key);

            var targetObj = this;
            Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
               function completed(xmlHttpRequest) {
                   var res_txt = xmlHttpRequest.responseText;
                   try {
                       var jsonResponse = JSON.parse(res_txt);
                       if (jsonResponse.hasOwnProperty("code") && jsonResponse.hasOwnProperty("msg")) {
                           if (jsonResponse["code"] == "000") {
                               var userInfo = new DeviceUserInfo();
                               userInfo.user_idx = parseInt(jsonResponse["user_idx"]);
                               userInfo.user_name = jsonResponse["user_name"];
                               userInfo.user_thumbnail = jsonResponse["thumbnail"];

                               targetObj.userInfo = userInfo;
                               fc_callback(0);
                               return;
                           } else {
                               fc_callback(parseInt(jsonResponse["code"]));
                               return;
                           }

                       }
                       fc_callback(-1);
                   } catch (ex) {

                       fc_callback(-2);
                   }
               },
               function error(err) {
                   fc_callback(-3);
               }
           );
        }
        this.getThumbURL = function (fc_callback) {
            if (Vercoop.Utils.Utility.isValidString(this.thumb_path)) {
                mLocalFolder.getFileAsync(this.thumb_path).done(
                    function(file){
                        var imgURL = URL.createObjectURL(file, { oneTimeOnly: true });
                        fc_callback(imgURL);
                    },
                    function (error){
                        fc_callback("/images/device/defaul_egg_72x92.png");
                    }
                );
            } else {
                fc_callback("/images/device/defaul_egg_72x92.png");
            }
        }
        this.stopProcess = function (fc_callback) {
            var url = DeviceURLNoCache(this.IP_ADDRESS, "cleanProcess");
            var targetObj = this;
            Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
               function completed(xmlHttpRequest) {
                   var res_txt = xmlHttpRequest.responseText;
                   fc_callback();
                   try {
                       var jsonResponse = JSON.parse(res_txt);
                       if (jsonResponse.hasOwnProperty("code") && jsonResponse.hasOwnProperty("msg")) {
                           if (jsonResponse["code"] == "000") {
                               targetObj.InvokeNewStatus(Vercoop.API.Devices.DEVICE_STATUS.ACTIVE.name);
                               
                               return;
                           }else{
                               Vercoop.Utils.Utility.showMessageBox(jsonResponse["msg"]);
                           }

                       }
                       Vercoop.Utils.Utility.showMessageBox("JSON ERROR [" + res_txt + "]");
                   } catch (ex) {
                       Vercoop.Utils.Utility.showMessageBox(ex.message);
                   }
               },
               function error(err) {
                   fc_callback();
                   Vercoop.Utils.Utility.showMessageBox("HTTP ERROR");
               }
           );
        
        }
        var _isStopResusted = true;
        this.startService = function () {
            _isStopResusted = false;
            var _target = this;
            Vercoop.API.Devices.connectDevice(this.IP_ADDRESS, this.name, false,
               function (deviceInfo) {
                   _checkStatus(_target);
               });


          
           
        }
        this.InvokeNewStatus = function (newStatus) {
            console.log("status update [" + this.global_index + ":" + this.status + ">" + newStatus + "]");
            _isRunning = false;
            setTimeout(_checkStatus, 10, this); //loop request
            var needInvokeCallback = false;
            if (this.status == newStatus) {

            } else {
                this.status = newStatus;
                needInvokeCallback = true;
            }
            if (this.action_code > 0) {
                needInvokeCallback = true;
            }
            if (needInvokeCallback) {
                if (this.callback_changed) {
                    this.callback_changed(this);
                }
            }
        }
        var _isRunning = false;
        function _checkStatus(targetObj) {
            console.log("CHeck Device [" + targetObj.global_index + ":" + targetObj.IP_ADDRESS + "]");
            if (_isStopResusted) return;
            if (_isRunning) return;
            _isRunning = true;
            var url = DeviceURLNoCache(targetObj.IP_ADDRESS, "checkStatus");
            Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
               function completed(xmlHttpRequest) {
                   var res_txt = xmlHttpRequest.responseText;
                   try {
                       var jsonResponse = JSON.parse(res_txt);
                       if (jsonResponse.hasOwnProperty("code") && jsonResponse.hasOwnProperty("msg")) {
                           if (jsonResponse["code"] == "000") {
                               targetObj.server_device_idx = parseInt(jsonResponse["device_idx"]);
                               if (jsonResponse["action_code"]) {
                                   targetObj.action_code = parseInt(jsonResponse["action_code"]);
                               }
                                if (jsonResponse["occupied"] == "YES") {
                                    targetObj.InvokeNewStatus(Vercoop.API.Devices.DEVICE_STATUS.RUNNING.name);
                                } else {
                                    targetObj.InvokeNewStatus(Vercoop.API.Devices.DEVICE_STATUS.ACTIVE.name);
                                }
                               
                               return;
                           }

                       }
                       targetObj.InvokeNewStatus(Vercoop.API.Devices.DEVICE_STATUS.ACTIVE.name);
                    
                   } catch (ex) {
                       targetObj.InvokeNewStatus(Vercoop.API.Devices.DEVICE_STATUS.ACTIVE.name);
                   }
               },
               function error(err) {
                   targetObj.InvokeNewStatus(Vercoop.API.Devices.DEVICE_STATUS.INVALID.name);
               }
           );
        }
        this.stopService = function () {
            _isStopResusted = true;
        }
    }
    
    
    
    this.load = function (on_callback) {
        m_Devices.splice(0, m_Devices.length);
   /*     aFolder = 'C:\\_87VRResources\\13237';
        aFolder.getFileAsync('content.json').done(
           function (file) {
               Windows.Storage.FileIO.readTextAsync(file).done(
                   function (data) {
                      //Todo
                   },
                   function (error) {
                       return;
                   }
                );
           },
           function (error) {
               return;
           }
       ); */

        Vercoop.Utils.Files.ReadText("infodata.json", function (text) {
            if (text != null) {
                try {
                    var jsonResponse = JSON.parse(text);
                    if (Array.isArray(jsonResponse)) {
                        for (var i = 0; i < jsonResponse.length; i++) {
                            var jInfo = jsonResponse[i];
                            if (jInfo.hasOwnProperty("ip") && jInfo.hasOwnProperty("name")) {
                                var dInfo = new DeviceInfo();
                                dInfo.global_index = generateDeviceGlobalIndex();
                                dInfo.IP_ADDRESS = Base64.decode(jInfo["ip"]);
                                dInfo.name = Base64.decode(jInfo["name"]);
                                if (jInfo.hasOwnProperty("thumb")) {
                                    dInfo.thumb_path = Base64.decode(jInfo["thumb"]);
                                }
                                if (jInfo.hasOwnProperty("type")) {
                                    dInfo.type = Base64.decode(jInfo["type"]);
                                } else {
                                    dInfo.type = Vercoop.API.Devices.DeviceType.EGG_CHAIR.name;
                                }
                                dInfo.startService();
                                m_Devices.push(dInfo);

                            }
                        }
                    }
                    on_callback(m_Devices.length);
                } catch (ex) {
                    on_callback(m_Devices.length);
                }
            } else {
                on_callback(m_Devices.length);
            }

        });

    }
    this.hasOccupiedDevice = function () {
        for (var i = 0; i < m_Devices.length; i++) {
            info = m_Devices[i];
            if (info.isOccuppied()) {
                return true;
            }

        }
        return false;
    }
    this.hasLoginedDevice = function () {
        for (var i = 0; i < m_Devices.length; i++) {
            info = m_Devices[i];
            if (info.userInfo != null) {
                return true;
            }

        }
        return false;
    }
    this.getDeviceCount = function () {
        return m_Devices.length;
    }
    this.getDeviceAtIndex = function (index) {
        if (index >= 0 && index < m_Devices.length) {
            return m_Devices[index];
        }
        return null;
    }
    this.UpdateCurrentDevices = function (fc_finished) {
        SaveCurrentDevice(fc_finished);
    }
    this.RemoveDevice = function (deviceInfo, fc_finished) {
        var foundIndex = -1;
        var info = null;
        for (var i = 0; i < m_Devices.length; i++) {
            info = m_Devices[i];
            if (info.IP_ADDRESS == deviceInfo.IP_ADDRESS) {
                foundIndex = i;
                break;
            }

        }
        if (foundIndex == -1) {
            fc_finished(false);
        } else {
            Vercoop.Utils.Files.DeleteFile(info.thumb_path, function (isSuccess) {
                deviceInfo.stopService();
                m_Devices.splice(foundIndex, 1);
                SaveCurrentDevice(fc_finished);
            });
        }
        
    }
    function SaveCurrentDevice(fc_finished)
    {
        var json = "[";
        for (var i = 0; i < m_Devices.length; i++) {
            var info = m_Devices[i];

            
            if (i > 0) {
                json += ",";
            }
            json += "{";
            json += "\"ip\":\"" + Base64.encode(info.IP_ADDRESS) + "\"";
            json += ",\"name\":\"" + Base64.encode(info.name) + "\"";
            if (Vercoop.Utils.Utility.isValidString(info.thumb_path)) {
                json += ",\"thumb\":\"" + Base64.encode(info.thumb_path) + "\"";
            }
            if (Vercoop.Utils.Utility.isValidString(info.type)) {
                json += ",\"type\":\"" + Base64.encode(info.type) + "\"";
            }

            json += "}";
        }
        json += "]";
        Vercoop.Utils.Files.WriteText("infodata.json", json, fc_finished);

    }
    this.isDeviceNameExist = function (name) {
        for (var i = 0; i < m_Devices.length; i++) {
            var device = m_Devices[i];
            if (device.name == name) {
                return true;
            }
        }
        return false;
    }
    this.isIPAddressExist = function (ip_address) {
        for (var i = 0; i < m_Devices.length; i++) {
            var device = m_Devices[i];
            if (device.IP_ADDRESS == ip_address) {
                return true;
            }
        }
        return false;
    }
    this.AddNewDevice = function (info, file, fc_finished) {
        info.thumb_path = null;
        if (file != null) {
            //Save file
            var d = new Date();
            var currentMiliSeconds = parseInt(d.getTime() * 1000) + parseInt(d.getMilliseconds());
            var thumbFileName = "DTHUMB_" + info.IP_ADDRESS + ".dat";
            Vercoop.Utils.Files.CreateFileFromFile(file, thumbFileName, function (isSuccess) {
                if (isSuccess) {
                    info.thumb_path = thumbFileName;
                }
                pushDeviceInfo(info);
            });
            

        } else {
            pushDeviceInfo(info);
        }
        function pushDeviceInfo(info) {
            m_Devices.push(info);
            SaveCurrentDevice(function (isSuccess) {
                fc_finished(isSuccess);
            });
        }
        

    }
    this.GetContentList = function (ip, ca_idx, fc_callback) {
        var url = DeviceURLNoCache(ip, "content_list");
        if (ca_idx > 0) {
            //TODO by server side
            url += "&ca=" + ca_idx;
        }
        Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
          function completed(xmlHttpRequest) {
              var res_txt = xmlHttpRequest.responseText;
              try {
                  var jsonResponse = JSON.parse(res_txt);
                  if (jsonResponse.hasOwnProperty("code") && jsonResponse.hasOwnProperty("msg") && jsonResponse.hasOwnProperty("datas")) {
                      if (jsonResponse["code"] == "000") {
                          var arrDatas = jsonResponse["datas"];
                          if (Array.isArray) {
                              if (arrDatas.length > 0) {
                                  var arrContents = [];
                                  for (var i = 0; i < arrDatas.length; i++) {
                                      var jInfo = arrDatas[i];
                                      var ctsInfo = new ContentInfo();
                                      ctsInfo.content_idx = parseInt(jInfo.ct_idx);
                                      ctsInfo.price = parseInt(jInfo.price);
                                      ctsInfo.title = jInfo.title;
                                      ctsInfo.description = jInfo.description;
                                      ctsInfo.version = jInfo.version;
                                      ctsInfo.play_count = parseInt(jInfo.play_count);
                                      ctsInfo.product_id = parseInt(jInfo.product_id);

                                      ctsInfo.developer = jInfo.developer;
                                      ctsInfo.age_limit = jInfo.age;
                                      ctsInfo.upload_date = jInfo.upload_date;
                                      ctsInfo.sizeString = jInfo.size;

                                      ctsInfo.DeviceIP = ip;
                          
                                      arrContents.push(ctsInfo);
                                  }
                                  fc_callback(arrContents);
                                  return;
                              }
                              
                          }
                          
                      }

                  }
                  fc_callback(null);
              } catch (ex) {
                  fc_callback(null);
              }
          },
          function error(err) {
              fc_callback(null);
          }
      );

    }
   
    this.connectDevice = function (ip, name, isTest, fc_callback) {
        var url = DeviceURLNoCache(ip, "connect");
        url += "&device_id=" + Base64.encode(Vercoop.Utils.Storage.getDeviceID()) + "&name=" + Base64.encode(name);
        if (isTest) {
            url += "&is_test=yes";
        }
        var device = new DeviceInfo();

        device.global_index = generateDeviceGlobalIndex();
        device.IP_ADDRESS = ip;
        device.name = name;
        device.status = Vercoop.API.Devices.DEVICE_STATUS.INVALID.name;
        device.error = "Unknown";
        Vercoop.Utils.Utility.XHR({ url: url, responseType: "GET" },
           function completed(xmlHttpRequest) {
               var res_txt = xmlHttpRequest.responseText;
               device.error = "Parsing Error";
               try {
                   var jsonResponse = JSON.parse(res_txt);
                   if (jsonResponse.hasOwnProperty("code") && jsonResponse.hasOwnProperty("msg")) {
                       device.error = jsonResponse["msg"];
                       if (jsonResponse["code"] == "000") {
                           device.server_device_idx = parseInt(jsonResponse["device_idx"]);
                           device.status = Vercoop.API.Devices.DEVICE_STATUS.ACTIVE.name;
                           if (jsonResponse.hasOwnProperty("status")) {
                               if (jsonResponse["status"] == "occupied") {
                                   device.status = Vercoop.API.Devices.DEVICE_STATUS.RUNNING.name;
                               }
                           }
                           device.error = null;
                           fc_callback(device);
                           return;
                       }
                       
                   }
                   fc_callback(device);
               } catch (ex) {
                   Vercoop.Utils.Log.error("exception error on [" + url + "]");
                   device.error = "Json Exception";
                   fc_callback(device);
               }
           },
           function error(err) {
               
               if (Vercoop.UI_TEST_MODE) {
                   
                   device.error = null;
                   device.status = Vercoop.API.Devices.DEVICE_STATUS.RUNNING.name;
               } else {
                   device.error = "Http Error";
               }
               fc_callback(device);
           }
       );
    }

}
