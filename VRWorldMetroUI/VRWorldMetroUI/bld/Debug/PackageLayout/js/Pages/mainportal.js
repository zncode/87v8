var gv_CA_ALL_INDEX = -99;
Vercoop.PAGE.MainPortal = new function () {
    this.isAcivated = function () {
        if (document.getElementById(Vercoop.PAGE.MODE_TYPE.CONTENT_INFOMAIN_PORTAL).style.display == "none") {
            return false;
        }
        return true;
    }
    var m_CADivs = [];
    var m_DeviceDivs = [];

    var m_selectedCAIdx = 0;
    var m_SelectedDeviceIndex = -1;
    var m_isDeviceListThumb = true;

    function DeviceElement(){
        this.mainDiv = null;
        this.deviceInfo = null;
        this.index = 0;
    }
    function CAElement() {
        this.MainDIV = null;
        this.Category = null;
        this.ThumbImage = null;
    }
    
    this.showMainPortalPage = function () {
        reloadCategories();
        reloadDeviceList();

        reloadCotentList();

        
    }

    function reloadDeviceList() {
        m_DeviceDivs = [];
        var mainDiv = document.getElementById("id_sub_portal_devicelist");
        Vercoop.Utils.UIDecorator.CleanDIV(mainDiv);
        var cnt = Vercoop.API.Devices.getDeviceCount();
        for (var i = 0; i < cnt; i++) {
            var info = Vercoop.API.Devices.getDeviceAtIndex(i);
            var div = document.createElement("div");
            div.className = "device-item";
            mainDiv.appendChild(div);
            var element = new DeviceElement();
            element.mainDiv = div;
            element.deviceInfo = info;
            element.index = i;
            if (m_SelectedDeviceIndex == -1) {
                if (info.isRunning()) {
                    m_SelectedDeviceIndex = i;
                }
            }
            decorateDeviceInfo(element);
            m_DeviceDivs.push(element);


        }
        document.getElementById("device_list_type_thumb").style.display = "none";
        document.getElementById("device_list_type_list").style.display = "none";
        if (m_isDeviceListThumb) {
            document.getElementById("device_list_type_thumb").style.display = "";
            Vercoop.Utils.Utility.NormalMouseUp(document.getElementById("device_list_type_thumb"),
                function () {
                    m_isDeviceListThumb = false;
                    reloadDeviceList();
                }
           );
        } else {
            document.getElementById("device_list_type_list").style.display = "";
            Vercoop.Utils.Utility.NormalMouseUp(document.getElementById("device_list_type_list"),
                function () {
                    m_isDeviceListThumb = true;
                    reloadDeviceList();
                }
           );

        }
    }
    var _isNowLoading = false;
    function reloadCotentList()
    {
        var ca_idx = 0;
        var deviceInfo = null;
        if (_isNowLoading) {
            return;
        }
        var mainDiv = document.getElementById("cts_list_games");
        var errDiv = document.getElementById("cts_list_error_msg");
        mainDiv.style.display = "none";
        errDiv.style.display = "";

        for (var i = 0; i < m_CADivs.length; i++) {
            var ele = m_CADivs[i];
            if (ele.Category.ca_idx == m_selectedCAIdx) {
                ca_idx = m_selectedCAIdx;
                break;
            }
        }
        if (ca_idx == 0) {
            errDiv.innerText = "请先选择设备";
            return;
        }
        for (var i = 0; i < m_DeviceDivs.length; i++) {
            var ele = m_DeviceDivs[i];
            if (ele.index == m_SelectedDeviceIndex) {
                deviceInfo = ele.deviceInfo;
                break;
            }
        }
        if (deviceInfo == null) {
            errDiv.innerText = "请先选择设备";
            return;
        }
        if (deviceInfo.isInvalid()) {
            errDiv.innerText = "设备没有运行";
            return;
        }
        errDiv.innerText = "Loading..";
        Vercoop.Utils.UIDecorator.CleanDIV(mainDiv);
        _isNowLoading = true;
        Vercoop.PAGE.ShowLoadingStatus(0);
        Vercoop.API.Devices.GetContentList(deviceInfo.IP_ADDRESS, ca_idx,
            function (arrContents) {
                Vercoop.PAGE.hideLoading();
                if (arrContents == null) {
                    errDiv.innerText = "没有内容";
                } else {
                    for (var i = 0; i < arrContents.length; i++) {
                        /*
                        <div class="item-game" style="background-color:red;">
                                <img src="/images/test_image/420x170.png" />
                                <div class="title" >Title</div>

                            </div>
                        */
                        var ctsInfo = arrContents[i];
                        var dvContent = document.createElement("div");
                        dvContent.className = "item-game";
                        if (i % 2 == 1) {
                            dvContent.style.marginLeft = "20px";
                        }
                        if (i > 1) {
                            dvContent.style.marginTop = "20px";
                        }
                        var img = document.createElement("img");
                        var src = ctsInfo.GetThumbURL();
                        img.src = src;
                        var dvTitle = document.createElement("div");
                        dvTitle.className = "title";
                        dvTitle.innerText = ctsInfo.title;
                        dvContent.appendChild(img);
                        dvContent.appendChild(dvTitle);
                        
                        mainDiv.appendChild(dvContent);
                        processSelectGame(ctsInfo, dvContent);
                    }
                    mainDiv.style.display = "";
                    errDiv.style.display = "none";
                }
                _isNowLoading = false;
            }
        );


    }
    function processSelectGame(ctsInfo, div) {
        Vercoop.Utils.Utility.NormalMouseUp(div, function () {
            var element = m_DeviceDivs[m_SelectedDeviceIndex];


            Vercoop.PAGE.ShowPage(Vercoop.PAGE.MODE_TYPE.CONTENT_INFO, ctsInfo.title, ctsInfo, element.deviceInfo);
        });
    }
    function decorateDeviceInfo(element) {
        Vercoop.Utils.UIDecorator.CleanDIV(element.mainDiv);
        var innerDIV = document.createElement("div");
        var className = "";
        if (element.index == 0) {
            className = "top ";
        } else {
            className = "middle ";
        }
        if (m_isDeviceListThumb) {
            className += "large";
        } else {
            className += "small";
        }
        innerDIV.className = className;
        element.mainDiv.appendChild(innerDIV);
        _decInnerDiv(innerDIV);
        element.deviceInfo.callback_changed = function (deviceInfo) {
            _decInnerDiv(innerDIV);
        }
        Vercoop.Utils.Utility.NormalMouseUp(innerDIV, function () {
            if (m_SelectedDeviceIndex == element.index) {

            } else {
                if (element.deviceInfo.isInvalid()) {
                    Vercoop.Utils.Utility.showMessageBox("设备没有运行");
                } else {
                    m_SelectedDeviceIndex = element.index;
                    reloadDeviceList();
                    reloadCotentList();
                }
            }
        });
        function _decInnerDiv(div) {
            Vercoop.Utils.UIDecorator.CleanDIV(div);
            var color = element.deviceInfo.getBGColor();
            if (m_SelectedDeviceIndex == element.index) {
                //color = "red";
                color = "#1bb7d5";
            }
            if (element.deviceInfo.status == '_running') {
                color = "red";
            }
            var divRightInner = Vercoop.Utils.UIDecorator.AddShape01toDiv(div, color, 30, 30);
            div.appendChild(divRightInner);

            if (m_isDeviceListThumb) {
                loadImage(divRightInner, element.deviceInfo);
            } else {
                Vercoop.Utils.UIDecorator.MainPortalDeviceSmall(divRightInner, "", element.deviceInfo.name);

            }
            function loadImage(div, deviceInfo) {
                deviceInfo.getThumbURL(function (url) {
                    Vercoop.Utils.UIDecorator.MainPortalDeviceLarge(div, "", deviceInfo.name, "white", url);
                });
            }

        }
        
    }
    function setCurrentCategory(ca_idx) {
        
        for (var i = 0; i < m_CADivs.length; i++) {
            var element = m_CADivs[i];
            if (ca_idx == 0) {
                ca_idx = element.Category.ca_idx;
            }

            

            if (element.Category.ca_idx == ca_idx) {
                element.MainDIV.style.backgroundColor = "#ed1c24";
                element.ThumbImage.src = "/images/category/ca_hot_20x20.png";
            } else {
                if (i == m_CADivs.length - 1) {
                    element.MainDIV.style.backgroundColor = "#1bb7d5";
                    element.ThumbImage.src = "/images/category/ca_all_20x20.png";
                }else if (i == m_CADivs.length - 2) {
                    element.MainDIV.style.backgroundColor = "#8dc63f";
                    element.ThumbImage.src = "/images/category/ca_all_20x20.png";
                } else {

                    element.MainDIV.style.backgroundColor = "#202020";
                    element.ThumbImage.src = "/images/category/ca_normal_20x20.png";
                }
            }
        }
        if (m_selectedCAIdx == ca_idx) {

        } else {
            m_selectedCAIdx = ca_idx;

            reloadCotentList();
        }
    }
    function reloadCategories() {
        var cnt = Vercoop.API.Category.Count();
        var padding = 20;

        m_CADivs = [];
        var mainDiv = document.getElementById("main_portal_category_list");
        Vercoop.Utils.UIDecorator.CleanDIV(mainDiv);
        for (var i = 0; i < cnt; i++) {
            var info = Vercoop.API.Category.CategoryAtIndex(i);
            var element = createCAMainDiv(info);
            if (i > 0) {
                element.MainDIV.style.marginTop = padding + "px";
            }
            mainDiv.appendChild(element.MainDIV);
            m_CADivs.push(element);
        }
        var allInfo = new Vercoop.API.Category.CreateCAInfo("ALL", gv_CA_ALL_INDEX);
        var element = createCAMainDiv(allInfo);
        element.MainDIV.style.marginTop = padding + "px";
        mainDiv.appendChild(element.MainDIV);
        m_CADivs.push(element);

        setCurrentCategory(m_selectedCAIdx);
        function createCAMainDiv(caInfo) {
            var mainDiv = document.createElement("div");
            var thumbDiv = document.createElement("div");
            var thumbImage = document.createElement("img");
            var lblSpan = document.createElement("span");


            mainDiv.className = "item-category";
            thumbDiv.className = "emphasize-area";
            lblSpan.className = "label";
            mainDiv.appendChild(thumbDiv);
            thumbDiv.appendChild(thumbImage);
            mainDiv.appendChild(lblSpan);


            lblSpan.innerText = caInfo.name;

            var element = new CAElement();
            element.MainDIV = mainDiv;
            element.Category = caInfo;
            element.ThumbImage = thumbImage;

            Vercoop.Utils.Utility.NormalMouseUp(mainDiv,
                function () {
                    setCurrentCategory(caInfo.ca_idx);
                }
           );

            return element;

        }
    }

    function reloadCategories_1() {
        var cnt = Vercoop.API.Category.Count();
        var padding = 20;

        m_CADivs = [];
        var mainDiv = document.getElementById("main_portal_category_list");
        Vercoop.Utils.UIDecorator.CleanDIV(mainDiv);
        for (var i = 0; i < cnt; i++) {
            var info = Vercoop.API.Category.CategoryAtIndex(i);
            var element = createCAMainDiv(info);
            if (i > 0) {
                element.MainDIV.style.marginTop = padding + "px";
            }
            mainDiv.appendChild(element.MainDIV);
            m_CADivs.push(element);
        }
        var allInfo = new Vercoop.API.Category.CreateCAInfo("ALL", gv_CA_ALL_INDEX);
        var element = createCAMainDiv(allInfo);
        element.MainDIV.style.marginTop = padding + "px";
        mainDiv.appendChild(element.MainDIV);
        m_CADivs.push(element);

        setCurrentCategory(m_selectedCAIdx);
        function createCAMainDiv(caInfo) {
            var mainDiv = document.createElement("div");
            var thumbDiv = document.createElement("div");
            var thumbImage = document.createElement("img");
            var lblSpan = document.createElement("span");


            mainDiv.className = "item-category";
            thumbDiv.className = "emphasize-area";
            lblSpan.className = "label";
            mainDiv.appendChild(thumbDiv);
            thumbDiv.appendChild(thumbImage);
            mainDiv.appendChild(lblSpan);


            lblSpan.innerText = caInfo.name;

            var element = new CAElement();
            element.MainDIV = mainDiv;
            element.Category = caInfo;
            element.ThumbImage = thumbImage;

            Vercoop.Utils.Utility.NormalMouseUp(mainDiv,
                function () {
                    setCurrentCategory(caInfo.ca_idx);
                }
           );

            return element;

        }
    }
}