
Vercoop.Utils.UIDecorator = new function () {

    var _prevWidth = 0;
    var _prevHeight = 0;
    var _isTransformed = false;

    var _tstTransX = -100;
    var _tstTransY = -100;
    this.testXPlus = function (button) {
        _tstTransX++;
        this.testUpdate();
    }
    this.testXMinus = function (button) {
        _tstTransX--;
        this.testUpdate();
    }
    this.testYPlus = function (button) {
        _tstTransY++;
        this.testUpdate();
    }
    this.testYMinus = function (button) {
        _tstTransY--;
        this.testUpdate();
    }
    this.testUpdate = function () {
        document.getElementById("test_transform_value").innerText = _tstTransX + "/" + _tstTransY;
        this.makeTransform(document.body.clientWidth, document.body.clientHeight, _tstTransX, _tstTransY);
    }
    this.makeTransform = function (fixW, fixH, width, height, transX, transY)
    {
        
        var scalX = width / fixW;
        var scalY = height / fixH;
        //var tranX = parseInt((width - fixW) / 2);
        var scaleValue = Math.min(scalX, scalY);
        var mainDiv = document.getElementById("main_container");
        if (fixW == width && fixH == height) {
            mainDiv.style.transform = "";
        } else {
            //var pTrans = "scale(" + scalX + ", " + scalY + ") translate(" + transX + "px, " + transY + "px)";
            var pTrans = "scale(" + scaleValue + ", " + scaleValue + ") translate(" + transX + "px, " + transY + "px)";
            mainDiv.style.transform = pTrans;
        }
        
    }
    this.testSetNormal = function () {
        document.getElementById("main_container").style.transform = "";
    }
    var gcd = function (a, b) {
        if (!b) {
            return a;
        }

        return gcd(b, a % b);
    };

    this.tunnningSize = function () {
        var width = document.body.clientWidth;
        var height = document.body.clientHeight;
        //var width = document.body.style.width;
        //var height = document.body.style.height;
        
        if (height > 100 && width > 100) {
            if (_prevHeight == height && _prevWidth == width) {

            } else {
                _prevHeight = height;
                _prevWidth = width;

                //Get GCD
                var vGCD = gcd(width, height);
                var _sW = parseInt(width / vGCD);
                var _sH = parseInt(height / vGCD);

                var fixW = 1920.0;
                var fixH = 1080.0;
                if (_sW == 16 && _sH == 9) {
                    document.getElementById("main_container").className = "m16to9";
                } else if (_sW == 8 && _sH == 5) {
                    document.getElementById("main_container").className = "m8to5";
                    fixW = 1680.0;
                    fixH = 1050.0;
                }

                if (_isTransformed == false) {
                    var canBeTransformed = false;
                    var tranX = 0;
                    var tranY = 0;

                    if (width == 1646 && height == 925) {
                        tranX = -158;
                        tranY = -87;
                        canBeTransformed = true;
                    } else if (width == 1542 && height == 867) {
                        tranX = -235;
                        tranY = -131;
                        canBeTransformed = true;
                    } else if (width == 1680 && height == 1050) {
                        tranX = -126;
                        tranY = -15;
                        canBeTransformed = true;
                    } else if (width == 1920 && height == 1080) {
                        //16:9
                        canBeTransformed = true;
                    } else {
                        //Design Test Only
                        canBeTransformed = true;
                    }
                    if (canBeTransformed) {
                        //_isTransformed = true;
                        this.makeTransform(fixW, fixH, width, height, tranX, tranY);
                    }
                }
                
                
            }
        }
        
    }
    this.decorateSimpleLargeDevice = function (deviceInfo, div_id, bg_color, text_color) {
        var divDevice = document.getElementById(div_id);
        
        Vercoop.Utils.UIDecorator.CleanDIV(divDevice);
        var divRightInner = Vercoop.Utils.UIDecorator.AddShape01toDiv(divDevice, bg_color, 24, 24);
        divDevice.appendChild(divRightInner);
        loadImage(divRightInner, deviceInfo);


        function loadImage(div, deviceInfo) {
            deviceInfo.getThumbURL(function (url) {
                Vercoop.Utils.UIDecorator.MainPortalDeviceLarge(div, "", deviceInfo.name, text_color, url);
            });

        }
    }

    this.AddShape01toDiv = function (div, color, radius_x, radius_y) {
        this.CleanDIV(div);
        var width = div.clientWidth;
        var height = div.clientHeight;
        var shape1 = document.createElement("div");
        shape1.style.width = (width - radius_x) + "px";
        shape1.style.height = "0px";
        shape1.style.display = "block";
        shape1.style.position = "relative";
        shape1.style.borderRight = radius_x + "px solid transparent";
        shape1.style.borderBottom = radius_y + "px solid " + color;
        var shape2 = document.createElement("div");
        shape2.style.width = width + "px";
        shape2.style.height = (height - radius_y) + "px";
        //shape2.style.top = "50px";
        shape2.style.marginTop = "0px";
        shape2.style.display = "block";
        shape2.style.position = "relative";
        shape2.style.backgroundColor = color;

        div.appendChild(shape1);
        div.appendChild(shape2);

        var divRightInner = document.createElement("div");
        divRightInner.className = "right-inner";
        divRightInner.style.display = "block";
        divRightInner.style.position = "relative";
        divRightInner.style.marginTop = "-" + height + "px";
        return divRightInner;

    }
    this.AddQRCode = function (div_id, code) {
        var dv = document.getElementById(div_id);
        if (dv) {
            var width = dv.clientWidth;
            var height = dv.clientHeight;
            if (width > 0 && height > 0) {

            } else {
                width = 90;
                height = 90;
            }
            var option = {
                width: width,
                height: height,
                typeNumber: 4,
                colorDark: "#000000",
                colorLight: "#ffffff"
            };
            var qrcode = new QRCode(div_id, option);
            qrcode.makeCode(code);
        }
    }
    this.CreateIconLabel = function (mainDiv, path_image, text, padding, margin, fontSize, imageSize) {
        
        /*
            display: table-cell;
            vertical-align: middle;
            text-align: left;
        */
        //remove all 
        this.CleanDIV(mainDiv);
        var divtWidth = mainDiv.clientWidth;
        var divHeight = mainDiv.clientHeight;
        var txtWidth = Vercoop.Utils.Utility.getWidthOfText(text, "Arial", fontSize) + padding;

        var dvText = document.createElement("div");
        var dvImage = null;
        dvText.style.display = "block";
        dvText.style.lineHeight = divHeight + "px";
        dvText.innerText = text;
        dvText.style.fontSize = fontSize + "px";
        dvText.style.fontWeight = "bold";
        //dvText.style.backgroundColor = "red";
        dvText.style.height = divHeight + "px";

        //하기의 3개의 속성으로 ellipsis를 정의한다.
        dvText.style.textOverflow = "ellipsis";
        dvText.style.whiteSpace = "nowrap";
        dvText.style.overflow = "hidden";
        if (path_image == null || path_image == "") {

            dvText.style.width = divtWidth + "px";
            dvText.style.textAlign = "center";
        } else {
            var realWidth = imageSize + padding + txtWidth;
            var maxWidth = divtWidth - margin * 2;
            if (realWidth > maxWidth) {
                realWidth = maxWidth;
            }
            var x = divtWidth - realWidth;
            x = parseInt(x / 2);

            dvImage = document.createElement("img");
            dvImage.src = path_image;
            dvImage.width = imageSize + "px";
            dvImage.height = imageSize + "px";
            dvImage.style.width = imageSize + "px";
            dvImage.style.height = imageSize + "px";
            dvImage.style.marginTop = parseInt((divHeight - imageSize) / 2) + "px";
            dvImage.style.marginLeft = x + "px";
            dvImage.style.styleFloat = "left";

            //dvImage.style.backgroundColor = "black";

            dvText.style.width = parseInt(divtWidth - x - padding - imageSize - 2) + "px";
            //dvText.style.width = parseInt(txtWidth) + "px";
            dvText.style.textAlign = "left";
            dvText.style.marginLeft = padding + "px";
            dvText.style.styleFloat = "left";
        }
        if (dvImage) {
            mainDiv.appendChild(dvImage);
        }
        mainDiv.appendChild(dvText);
    }
    this.MainPortalDeviceSmall = function (div, path_image, text) {
        var padding = 10;
        var margin = 4;
        var fontSize = 20;
        var imageSize = 24;
        this.CreateIconLabel(div, path_image, text, padding, margin, fontSize, imageSize);
    }
    this.MainPortalDeviceLarge = function (div, path_image, text, text_color, chair_image) {
        var heightSmall = 60;
        var padding = 4;
        var divtWidth = div.clientWidth;
        var divHeight = div.clientHeight;    
        var titleDiv = document.createElement("div");
        titleDiv.style.height = heightSmall + "px";
        titleDiv.style.width = divtWidth + "px";
        titleDiv.style.color = text_color;
        titleDiv.style.lineHeight = divtWidth + "px";
        titleDiv.style.styleFloat = "left";
        div.appendChild(titleDiv);
        this.MainPortalDeviceSmall(titleDiv, path_image, text);

        /*
        <div style="background-color: black; width: 100%; float: left; height: calc(100% - 30px); display: table-cell; vertical-align: middle; text-align: center;">
                                            <img src="/images/icons_header/btn_nav_home.png" />
                                        </div>
        */
        var divThumbnail = document.createElement("div");
        divThumbnail.style.width = divtWidth + "px";
        divThumbnail.style.height = parseInt(divHeight - heightSmall) + "px";
        divThumbnail.style.styleFloat = "left";
        divThumbnail.style.display = "table-cell";
        divThumbnail.style.verticalAlign = "middle";
        divThumbnail.style.textAlign = "center";
        var img = document.createElement("img");
        img.src = chair_image;
        var size = Math.min(divtWidth - padding * 2, divHeight - heightSmall - padding * 2);
        img.style.maxWidth = parseInt(divtWidth - padding * 2) + "px";
        img.style.maxHeight = parseInt(divHeight - heightSmall - padding * 2) + "px";
        //img.style.width = size + "px";
        //img.style.height = size + "px";

        divThumbnail.appendChild(img);
        div.appendChild(divThumbnail);


    }
    this.CleanDIV = function (div) {
        if (div) {
            while (div.hasChildNodes) {
                var lNode = div.firstChild;
                if (lNode) {
                    div.removeChild(lNode);
                } else {
                    break;
                }

            }
        }
    }
}