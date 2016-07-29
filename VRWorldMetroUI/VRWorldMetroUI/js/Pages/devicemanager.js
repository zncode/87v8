Vercoop.PAGE.DeviceManager = new function () {
    this.isAcivated = function () {
        if (document.getElementById(Vercoop.PAGE.MODE_TYPE.DEVICE_MANAGER).style.display == "none") {
            return false;
        }
        return true;
    }
    var m_PreviewThumbDIV = null;
    var m_ButtonTest = null;
    var m_ButtonBind = null;
    var m_ButtonUnBind = null;

    var m_currentFile = null;
    var m_currentTitle = "No Name";

    this.TYPE_INPUT_DEVICE_IP = "device_input_ip";
    this.TYPE_INPUT_NAME = "device_input_name";
    this.TYPE_INPUT_TYPE = "device_input_type";
    this.TYPE_INPUT_STATUS = "device_input_status";


    
    this.initialize = function () {
        m_PreviewThumbDIV = document.getElementById("device_manager_preview_thumb");
        m_PreviewAreaTitle = document.getElementById("device_manager_preview_title");
        m_ButtonTest = document.getElementById("device_action_test");
        m_ButtonBind = document.getElementById("device_action_bind");
        m_ButtonUnBind = document.getElementById("device_action_unbind");
        document.getElementById("device_input_ip_value").placeholder = "192.168.0.101";

        
        
        
        Vercoop.Utils.Utility.NormalMouseUp(m_PreviewThumbDIV,
            function () {
                return;
                //Change Image
                var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
                openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
                openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
                // Users expect to have a filtered view of their folders depending on the scenario.
                // show file types that are accepted by your service 
                openPicker.fileTypeFilter.replaceAll([".gif", ".jpg", ".jpeg", ".png"]);
                openPicker.pickSingleFileAsync().done(
                    function (file) {
                        if (file) {

                            m_currentFile = file;
                            var imgURL = URL.createObjectURL(file, { oneTimeOnly: true });
                            Vercoop.PAGE.DeviceManager.decoratePreviewThumb(m_currentTitle, imgURL);
                        }
                    }
                );
            }
       );
    }
    function reloadDeviceList() {
        var divContainer = document.getElementById("device_list_devices");
        divContainer.style.display = "";
        document.getElementById("device_list_detail_info").style.display = "none";
        Vercoop.Utils.UIDecorator.CleanDIV(divContainer);
        var cnt = Vercoop.API.Devices.getDeviceCount();
        for (var i = 0; i < cnt; i++) {
            var info = Vercoop.API.Devices.getDeviceAtIndex(i);
            var divItem = document.createElement("div");
            divItem.id = "device_list_item_" + info.IP_ADDRESS;
            divItem.className = "device-item";
            if (i % 2 == 1) {
                divItem.style.marginLeft = "10px";
            }
            if (i >= 2) {
                divItem.style.marginTop = "10px";
            }
            divContainer.appendChild(divItem);
            var divRightInner = Vercoop.Utils.UIDecorator.AddShape01toDiv(divItem, info.getBGColor(), 24, 24);
            divItem.appendChild(divRightInner);
            loadImage(divRightInner, info);
            info.callback_changed = onStatusChanged;
            processUpEventDevice(divItem, info);

        }
        function onStatusChanged(deviceInfo) {
            var divItem = document.getElementById("device_list_item_" + deviceInfo.IP_ADDRESS);
            if (divItem) {
                Vercoop.Utils.UIDecorator.CleanDIV(divItem);
                var divRightInner = Vercoop.Utils.UIDecorator.AddShape01toDiv(divItem, deviceInfo.getBGColor(), 24, 24);
                divItem.appendChild(divRightInner);
                loadImage(divRightInner, deviceInfo);

            }
        }
        function loadImage(div, deviceInfo) {
            deviceInfo.getThumbURL(function(url){
                Vercoop.Utils.UIDecorator.MainPortalDeviceLarge(div, "", deviceInfo.name, "white", url);
            });
            
        }
        function processUpEventDevice(div, info) {
            Vercoop.Utils.Utility.NormalMouseUp(div,
                function () {
                    m_PreviewThumbDIV.innerText = "Update Device";

                    document.getElementById("device_list_devices").style.display = "none";
                    m_ButtonUnBind.style.display = "";
                    document.getElementById("device_list_detail_info").style.display = "";
                    document.getElementById("sp_device_info_name").innerText = info.name;
                    document.getElementById("sp_device_info_type").innerText = info.GetDevicetypeString();
                    document.getElementById("sp_device_info_status").innerText = info.GetDeviceStatusString();
                    document.getElementById("sp_device_info_ip").innerText = info.IP_ADDRESS;
                    
                    Vercoop.PAGE.DeviceManager.setInputValue(false, Vercoop.PAGE.DeviceManager.TYPE_INPUT_DEVICE_IP, info.IP_ADDRESS);
                    Vercoop.PAGE.DeviceManager.setInputValue(true, Vercoop.PAGE.DeviceManager.TYPE_INPUT_NAME, info.name);
                    Vercoop.PAGE.DeviceManager.setInputValue(true, Vercoop.PAGE.DeviceManager.TYPE_INPUT_TYPE, info.type);


                    var dvChair = document.getElementById("device_detail_info_item_chair");
                    var divRightInner = Vercoop.Utils.UIDecorator.AddShape01toDiv(dvChair, info.getBGColor(), 24, 24);
                    dvChair.appendChild(divRightInner);
                    loadImage(divRightInner, info);
                    info.callback_changed = null;


                    m_ButtonBind.innerText = "更新";
                    m_ButtonUnBind.innerText = "解绑";

                    Vercoop.Utils.Utility.NormalMouseUp(m_ButtonBind, function () {
                        //UPdate

                        var device_name = document.getElementById(Vercoop.PAGE.DeviceManager.TYPE_INPUT_NAME + "_value").value;
                        if (!Vercoop.Utils.Utility.isValidString(device_name)) {
                            this.setErrorMessage(Vercoop.PAGE.DeviceManager.TYPE_INPUT_NAME, "Please input Device Name");
                            return;
                        }
                        if (Vercoop.API.Devices.isDeviceNameExist(device_name)) {
                            this.setErrorMessage(Vercoop.PAGE.DeviceManager.TYPE_INPUT_NAME, "Device Name is already exist");
                            return;
                        }
                        if (info.name == device_name) {
                            Vercoop.PAGE.DeviceManager.ShowDeviceListPage();
                        } else {
                            info.name = device_name;
                            Vercoop.API.Devices.UpdateCurrentDevices(
                                function (isSuccess) {
                                    Vercoop.Utils.Utility.showMessageBox(
                                        WinJS.Resources.getString('STL_DEVICE_UPDATE_TITLE').value,
                                        2,
                                        WinJS.Resources.getString('STL_DEVICE_UPDATE_BUTTON_1').value,
                                        function () { 
                                            Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.MAIN_PORTAL);
                                            Vercoop.Utils.Utility.closeMessageBox();
                                        },
                                        WinJS.Resources.getString('STL_DEVICE_UPDATE_BUTTON_2').value,
                                        function () {
                                            Vercoop.PAGE.DeviceManager.ShowDeviceListPage();
                                            Vercoop.Utils.Utility.closeMessageBox();
                                        });
                                    
                                }
                             );
                        }
                        
                    });

                    Vercoop.Utils.Utility.NormalMouseUp(m_ButtonUnBind, function () {
                        if (info.isOccuppied()) {
                            Vercoop.Utils.Utility.showMessageBox("设备不能解绑. 因为游戏正在运行!");
                        } else if (info.userInfo != null) {
                            Vercoop.Utils.Utility.showMessageBox("设备不能解绑. 用户已经登录这个设备!");
                        } else {
                            Vercoop.Utils.Utility.showMessageBox("你确定要绑定这个设备吗?", 2,
                                WinJS.Resources.getString('STL_YES').value,
                                function () {
                                    Vercoop.API.Devices.RemoveDevice(info, function (isSuccess) {
                                        Vercoop.PAGE.DeviceManager.ShowDeviceListPage();
                                        Vercoop.Utils.Utility.closeMessageBox();
                                    });
                                },
                                WinJS.Resources.getString('STL_NO').value
                            );
                        }
                        
                    });


                }
            );
        }
    }
    this.ShowDeviceListPage = function () {
        m_currentFile = null;
        this.setInputValue(true, this.TYPE_INPUT_DEVICE_IP);
        this.setInputValue(true, this.TYPE_INPUT_NAME);
        this.setInputValue(true, this.TYPE_INPUT_TYPE);
        this.setInputValue(false, this.TYPE_INPUT_STATUS);

        m_ButtonUnBind.style.display = "none";
        if (Vercoop.UI_TEST_MODE) {
            this.setInputValue(true, this.TYPE_INPUT_DEVICE_IP, "127.0.0.1");
            this.setInputValue(true, this.TYPE_INPUT_NAME, "Device 001");
        } else {
            this.setInputValue(true, this.TYPE_INPUT_DEVICE_IP);
            this.setInputValue(true, this.TYPE_INPUT_NAME);
        }
        m_ButtonTest.innerText = WinJS.Resources.getString('STL_LBL_DEVICE_TEST').value;
        m_ButtonBind.innerText = WinJS.Resources.getString('STL_LBL_DEVICE_BIND').value;
        
        Vercoop.Utils.Utility.NormalMouseUp(m_ButtonTest, function () {
            Vercoop.PAGE.DeviceManager.testDevice(false);
        });
        Vercoop.Utils.Utility.NormalMouseUp(m_ButtonBind, function () {
            Vercoop.PAGE.DeviceManager.testDevice(true);
        });
        document.getElementById(this.TYPE_INPUT_NAME + "_value").onkeyup = function (event) {
            var text = event.target.value;
            Vercoop.PAGE.DeviceManager.UpdateTitlePrevThumb(text);
        }
        reloadDeviceList();
        m_PreviewAreaTitle.innerText = "添加设备";
        this.decoratePreviewThumb("", "");
    }

    this.testDevice = function (withBind) {
        this.ClearErrorMessage();
        var device_ip = document.getElementById(this.TYPE_INPUT_DEVICE_IP + "_value").value;
        var device_name = document.getElementById(this.TYPE_INPUT_NAME + "_value").value;
        if (!Vercoop.Utils.Utility.isValidString(device_ip)) {
            this.setErrorMessage(this.TYPE_INPUT_DEVICE_IP, "请填写IP地址");
            return;
        }
        if (!Vercoop.Utils.Utility.isValidIPAddress(device_ip)) {
            this.setErrorMessage(this.TYPE_INPUT_DEVICE_IP, "请填写合法的IP地址");
            return;
        }
        if (Vercoop.API.Devices.isIPAddressExist(device_ip) && withBind == true) {
            this.setErrorMessage(this.TYPE_INPUT_DEVICE_IP, "IP地址已经存在");
            return;
        }
        if (!Vercoop.Utils.Utility.isValidString(device_name)) {
            this.setErrorMessage(this.TYPE_INPUT_NAME, "请填写设备名称");
            return;
        }
        if (Vercoop.API.Devices.isDeviceNameExist(device_name) && withBind == true) {
            this.setErrorMessage(this.TYPE_INPUT_NAME, "设备名称已经存在");
            return;
        }
        Vercoop.PAGE.ShowLoadingStatus(0);
        var isTestOnly = true;
        if(withBind){
            isTestOnly = false;
        }
        Vercoop.API.Devices.connectDevice(device_ip, device_name, isTestOnly,
            function (deviceInfo) {
                Vercoop.Utils.Utility.OnTimerEvent(1000, function () {
                    Vercoop.PAGE.hideLoading();
                    if (deviceInfo.error == null) {
                        if (withBind == true) {
                            //TODO Bind
                            Vercoop.API.Devices.AddNewDevice(deviceInfo, m_currentFile,
                                function (isSuccess) {
                                    if (isSuccess) {
                                        m_currentFile = null;
                                        //TODO refresh list view
                                        reloadDeviceList();
                                        Vercoop.Utils.Utility.showMessageBox(
                                            WinJS.Resources.getString('STL_DEVICE_ADD_TITLE').value,
                                            2,
                                            WinJS.Resources.getString('STL_DEVICE_UPDATE_BUTTON_1').value,
                                            function () {
                                                Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.MAIN_PORTAL);
                                                Vercoop.Utils.Utility.closeMessageBox();
                                            },
                                            WinJS.Resources.getString('STL_DEVICE_UPDATE_BUTTON_2').value,
                                            function () {
                                                Vercoop.PAGE.DeviceManager.ShowDeviceListPage();
                                                Vercoop.Utils.Utility.closeMessageBox();
                                            }
                                        );
                                    } else {
                                        Vercoop.Utils.Utility.showMessageBox("Device Add failed");
                                    }
                                });
                            
                        } else {
                            Vercoop.Utils.Utility.showMessageBox("设备已经探测到!");
                        }
                    } else {
                        if (Vercoop.UI_TEST_MODE) {
                            Vercoop.Utils.Utility.showMessageBox("找不到设备 [" + deviceInfo.error + "]");
                        } else {
                            Vercoop.Utils.Utility.showMessageBox("找不到设备");
                        }

                    }

                });
                
                
            });
    }
    this.ClearErrorMessage = function () {
        this.setErrorMessage(this.TYPE_INPUT_DEVICE_IP, "");
        this.setErrorMessage(this.TYPE_INPUT_NAME, "");
        this.setErrorMessage(this.TYPE_INPUT_TYPE, "");
        this.setErrorMessage(this.TYPE_INPUT_STATUS, "");
    }
    this.setErrorMessage = function (type, message) {
        var dvError = document.getElementById(type + "_error");
        if (dvError) {
            dvError.innerText = message;
        }
    }
    this.setInputValue = function (doShow, type,  value, label) {
        var display = "none";
        var _v = "";
        var _l = "";
   
        if(type == this.TYPE_INPUT_DEVICE_IP){
            _l = WinJS.Resources.getString('STL_LBL_DEVICE_IP').value;
        }else if(type == this.TYPE_INPUT_NAME){
            _l = WinJS.Resources.getString('STL_LBL_DEVICE_NAME').value;
        } else if (type == this.TYPE_INPUT_TYPE) {
            _l = WinJS.Resources.getString('STL_LBL_DEVICE_TYPE').value;
        } else if (type == this.TYPE_INPUT_STATUS) {
            _l = WinJS.Resources.getString('STL_LBL_DEVICE_STATUS').value;
        }
        if (Vercoop.Utils.Utility.isValidString(value)) _v = value;
        if (Vercoop.Utils.Utility.isValidString(label)) _l = label;
        
        if (doShow) {
            display = "";
        }
        var dvContainer = document.getElementById(type + "_container");
        var dvLabel = document.getElementById(type + "_label");
        var dvValue = document.getElementById(type + "_value");
        var dvError = document.getElementById(type + "_error");
        if (dvError && dvValue && dvLabel && dvContainer) {
            dvContainer.style.display = display;
            dvLabel.innerText = _l;
            dvError.innerText = "";
            if (type == this.TYPE_INPUT_DEVICE_IP) {
                dvValue.value = _v;
                
            } else if (type == this.TYPE_INPUT_NAME) {
                dvValue.value = _v;
                if (Vercoop.Utils.Utility.isValidString(value)) {
                    m_currentTitle = value;
                    this.UpdateTitlePrevThumb(value);
                }
                
            } else if (type == this.TYPE_INPUT_TYPE) {
                Vercoop.Utils.UIDecorator.CleanDIV(dvValue);
                var selected = null;
                for (var v in Vercoop.API.Devices.DeviceType) {
                    var option = document.createElement("option");
                    var obj = Vercoop.API.Devices.DeviceType[v];
                    option.value = obj.name;
                    option.innerText = WinJS.Resources.getString(obj.langValue).value;
                    if (selected == null) {
                        selected = option;
                    } else {
                        if (obj.name == _v) {
                            selected = option;
                        }
                    }
                    dvValue.appendChild(option);
                }
                selected.selected = true;


            } else if (type == this.TYPE_INPUT_STATUS) {
                Vercoop.Utils.UIDecorator.CleanDIV(dvValue);
                var selected = null;
                for (var v in Vercoop.API.Devices.DEVICE_STATUS) {
                    var option = document.createElement("option");
                    var obj = Vercoop.API.Devices.DEVICE_STATUS[v];
                    option.value = obj.name;
                    option.innerText = WinJS.Resources.getString(obj.langValue).value;
                    if (selected == null) {
                        selected = option;
                    } else {
                        if (obj.name == _v) {
                            selected = option;
                        }
                    }
                    dvValue.appendChild(option);
                }
                selected.selected = true;


            }
        }

    }

    var _currentChairPath = "";
    this.decoratePreviewThumb = function (title, chair_path) {
        var mainDiv = m_PreviewThumbDIV;
        if (!Vercoop.Utils.Utility.isValidString(chair_path)) {
            chair_path = "/images/device/defaul_egg_72x92.png";
        }
        _currentChairPath = chair_path;
        Vercoop.Utils.UIDecorator.CleanDIV(mainDiv);
        
        var divRightInner = Vercoop.Utils.UIDecorator.AddShape01toDiv(mainDiv, "#1bb7d5", 24, 24);
        mainDiv.appendChild(divRightInner);
        Vercoop.Utils.UIDecorator.MainPortalDeviceLarge(divRightInner, "", title, "white", chair_path);

    }
    this.UpdateTitlePrevThumb = function (title) {
        this.decoratePreviewThumb(title, _currentChairPath);
    }


}