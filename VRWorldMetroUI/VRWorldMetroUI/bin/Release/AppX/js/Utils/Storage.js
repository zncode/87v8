Vercoop.Utils.Storage = new function () {

    var m_localSettings = Windows.Storage.ApplicationData.current.localSettings;
    function setStringValueInLocal(name, value) {
        var type = typeof value;
        if (type == 'string') {

        } else if (type == 'number') {
            value = value.toString();
        } else {
            value = "Unkown type[" + type + "]";
        }
        //if (!VCUtils.isValidString(value)) return;
        var prev = m_localSettings.values[name];
        if (Vercoop.Utils.Utility.isValidString(prev)) {
            if (prev == value) {
                // no need to update
                return;
            }
        }
        m_localSettings.values[name] = value;
    }
    this.getDeviceID = function () {
        if (Vercoop.Utils.Utility.isValidString(m_localSettings.values['Device_Unique_ID'])) {
            return m_localSettings.values['Device_Unique_ID'];
        }

        var deviceID = "";
        var packageSpecificToken = Windows.System.Profile.HardwareIdentification.getPackageSpecificToken(null);
        var hardwareID = packageSpecificToken.id;
        var dataReader = Windows.Storage.Streams.DataReader.fromBuffer(hardwareID);
        var array = new Array(hardwareID.length);
        dataReader.readBytes(array);
        for (var i = 0; i < array.length; i++) {
            deviceID += array[i].toString();
        }
        m_localSettings.values['Device_Unique_ID'] = deviceID;
    }

    this.LoginInfo = {
        get PrevID() {
            var str = m_localSettings.values['prev_logined_user_id'];
            if (str) {
                return str;
            }
            return "";
        },
        set PrevID(str) {
            setStringValueInLocal('prev_logined_user_id', str);
        },

        get userIDX() {
            var str = m_localSettings.values['current_logined_user_idx'];
            if (str) {
                return parseInt(str);
            }
            return 0;
        },
        set userIDX(str) {
            setStringValueInLocal('current_logined_user_idx', "" + str);
        }

    }
    
    this.VideoDevice = {
        get IP() {
            var str = m_localSettings.values['video_device_ip_addr'];
            if (str) {
                return str;
            }
            return "";
        },
        set IP(str) {
            setStringValueInLocal('video_device_ip_addr', "" + str);
        }
    }

    this.paymentCtIdx = {
        get id() {
            var str = m_localSettings.values['payment_content_id'];
            if (str) {
                return str;
            }
            return "";
        },
        set id(str) {
            setStringValueInLocal('payment_content_id', "" + str);
        }
    }
}