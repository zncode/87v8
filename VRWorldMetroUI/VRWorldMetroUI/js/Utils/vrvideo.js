Vercoop.Utils.VRVideo = new function () {
    var m_VideoObject = null;
    var m_outputCanvas = null;
    var m_mainDIV = null;

    var m_camera = null;
    var m_scene = null;
    var m_renderer = null;
    var m_cubeCamera = null;
    var m_MoveTexture = null;

    var timer_count = 0;

    var m_ViewWidth = 0;
    var m_ViewHeight = 0;
    var m_VideoWith = 0;
    var m_VideoHeight = 0;


    var m_isMouseDown = false;

    var CONST_FOV = 70;

    this.onCanPlay = null;

    var m_Position = new function () {
        this.lon = 0;
        this.lat = 0;



        this.initialize = function () {
            this.lon = 0;
            this.lat = 0;

        }

    }
    var m_PrevMousePosition = new function () {
        this.x = 0;
        this.y = 0;
        this.multi_touch_count = 0;
        this.prevTouchMiliSecond = 0;
        this.trackingCount = 0;
        this.prevLat = 0;
        this.prevLon = 0;
    }

    var m_FullScreenMan = new function () {
        this.position = "";
        this.top = "";
        this.left = "";
        this.width = "";
        this.height = "";
        this.zIndex = 0;

        this.isFullscreen = false;
        this.MakeFullScreen = function (div) {
            this.position = div.style.position;
            this.top = div.style.top;
            this.left = div.style.left;
            this.width = div.style.width;
            this.height = div.style.height;
            this.zIndex = div.style.zIndex;


            var screenWidth = window.innerWidth;
            var screenHeight = window.innerHeight;

            div.style.position = "absolute";
            div.style.top = "0px";
            div.style.left = "0px";
            div.style.width = screenWidth + "px";
            div.style.height = screenHeight + "px";
            div.style.zIndex = 1000;
            this.isFullscreen = true;
            processPlayViewResize(screenWidth, screenHeight);
        }

        this.BacktoNormal = function (div) {
            div.style.position = this.position;
            div.style.top = this.top;
            div.style.left = this.left;
            div.style.width = this.width;
            div.style.height = this.height;
            div.style.zIndex = this.zIndex;
            this.isFullscreen = false;
        }
    }


    this.InitVideo = function (div_id, video_url, w_video, h_video) {
        this.CloseSession();
        m_mainDIV = document.getElementById(div_id);
        if (!m_mainDIV) {
            return;
        }

        m_ViewWidth = m_mainDIV.clientWidth;
        m_ViewHeight = m_mainDIV.clientHeight;
        m_VideoWith = w_video;
        m_VideoHeight = h_video;

        Vercoop.Utils.UIDecorator.CleanDIV(m_mainDIV);
        m_VideoObject = document.createElement("video");
        m_VideoObject.width = m_VideoWith;
        m_VideoObject.height = m_VideoHeight;
        m_VideoObject.controls = "controls";
    
        m_VideoObject.style.display = "none";
        var vSource = document.createElement("source");
        vSource.type = "video/mp4";
        vSource.src = video_url;
        m_VideoObject.appendChild(vSource);
        m_mainDIV.appendChild(m_VideoObject);

        m_outputCanvas = document.createElement("canvas");
        m_outputCanvas.width = m_VideoWith;
        m_outputCanvas.height = m_VideoHeight;
        m_outputCanvas.style.display = "none";
        m_mainDIV.appendChild(m_outputCanvas);



        m_PrevMousePosition.multi_touch_count = 0;
        m_FullScreenMan.isFullscreen = false;
        var thisObject = this;
        m_VideoObject.oncanplay = function () {
            if (thisObject.onCanPlay != null) {
                Vercoop.Utils.Utility.OnTimerEvent(100, function () {
                    if (isSessionClosed()) {
                        return;
                    } else {

                        thisObject.onCanPlay(m_VideoObject.duration);
                        renderVideo();
                    }
                });
            }
        }

        
        return this;
    }

    function renderVideo() {
        if (isSessionClosed()) {
            return;
        }
        var duration = parseFloat(m_VideoObject.duration);
        if (duration > 1) {
            if (m_MoveTexture == null) {
                m_MoveTexture = new THREE.Texture(m_outputCanvas);
                m_Position.initialize();
                startGLFunction(m_MoveTexture);
                //add timer
                timer_count = 0;
                var timer = document.createElement("div");
                timer.id = 'video_timer';
                m_mainDIV.appendChild(timer);
            }
            (m_outputCanvas.getContext("2d")).drawImage(m_VideoObject, 0, 0, m_VideoWith, m_VideoHeight);
            m_MoveTexture.needsUpdate = true;

            var context = m_outputCanvas.getContext("2d");
            var imgData = context.getImageData(10, 10, 60, 60);
            context.putImageData(imgData, 100, 70);

            var phi = THREE.Math.degToRad(90 - m_Position.lat);
            var theta = THREE.Math.degToRad(m_Position.lon);

            m_camera.position.x = 100 * Math.sin(phi) * Math.cos(theta);
            m_camera.position.y = 100 * Math.cos(phi);
            m_camera.position.z = 100 * Math.sin(phi) * Math.sin(theta);

            m_camera.lookAt(m_scene.position);


            m_cubeCamera.updateCubeMap(m_renderer, m_scene);

            m_renderer.render(m_scene, m_camera);

            

            //handle count timer
            timer_count += 1;
            if (timer_count % 10 == 0) {
                timer_sec = Math.ceil(timer_count / 60);
                var format_sec = Vercoop.Utils.Utility.formatTime(timer_sec);
                var format_duration = Vercoop.Utils.Utility.formatTime(Math.ceil(duration));
                document.getElementById("video_timer").innerHTML = format_sec + '/' + format_duration;
            }
        }



        requestAnimationFrame(renderVideo);

    }
    function startGLFunction(texture)
    {
        m_camera = new THREE.PerspectiveCamera(CONST_FOV, m_ViewWidth / m_ViewHeight, 1, 1000);
        m_scene = new THREE.Scene();
        var mesh = new THREE.Mesh(new THREE.SphereGeometry(500, 60, 40), new THREE.MeshBasicMaterial({ map: texture }));
        mesh.scale.x = -1;
        m_scene.add(mesh);

        m_renderer = new THREE.WebGLRenderer({ antialias: true });
        m_renderer.setSize(m_ViewWidth, m_ViewHeight);

        m_cubeCamera = new THREE.CubeCamera(1, 1000, 256);
        m_cubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
        m_scene.add(m_cubeCamera);

        m_mainDIV.appendChild(m_renderer.domElement);

       
        m_mainDIV.addEventListener("mousedown", onMouseDown);
        m_mainDIV.addEventListener("mouseup", onMouseUp);
        m_mainDIV.addEventListener("mouseleave", onMouseLeave);
        m_mainDIV.addEventListener("mousemove", onMouseMove);
        m_mainDIV.addEventListener("mousewheel", onMouseWheel);


    }


    this.play = function () {
        if (isSessionClosed()) {
            return;
        }
        m_VideoObject.play();
    }
    function isSessionClosed(){
        if (m_VideoObject == null) {
            return true;
        }
        return false
    }
    this.CloseSession = function () {

        if (m_VideoObject != null) {
            m_VideoObject.pause();
            //m_VideoObject.stop();


            m_mainDIV.removeEventListener("mousedown", onMouseDown);
            m_mainDIV.removeEventListener("mouseup", onMouseUp);
            m_mainDIV.removeEventListener("mouseleave", onMouseLeave);
            m_mainDIV.removeEventListener("mousemove", onMouseMove);
            m_mainDIV.removeEventListener("mousewheel", onMouseWheel);


            m_isMouseDown = false;

            m_VideoObject = null;
            m_outputCanvas = null;
            m_mainDIV = null;

            m_camera = null;
            m_scene = null;
            m_renderer = null;
            m_cubeCamera = null;
            m_MoveTexture = null;

            Vercoop.Utils.UIDecorator.CleanDIV(m_mainDIV);
        }

    }
    function onMouseDown(event) {
        m_isMouseDown = true;
        m_PrevMousePosition.trackingCount = 0;
        m_PrevMousePosition.x = event.clientX;
        m_PrevMousePosition.y = event.clientY;
        m_PrevMousePosition.prevLat = m_Position.lat;
        m_PrevMousePosition.prevLon = m_Position.lon;
    }
    function onMouseUp(event) {
        m_isMouseDown = false;
        var d = new Date();
        var currentMiliSeconds = parseInt(d.getTime());

        console.log("current [" + currentMiliSeconds + ":" + m_PrevMousePosition.trackingCount +"]");
        if (m_PrevMousePosition.trackingCount == 0) {
            //TODO Full Screen;
            var diff = currentMiliSeconds - m_PrevMousePosition.prevTouchMiliSecond;
            if (diff < 300) {
                m_PrevMousePosition.multi_touch_count++;
            }
            console.log("diff [" + diff + ":" + m_PrevMousePosition.multi_touch_count +  "]");
            if (m_PrevMousePosition.multi_touch_count > 0) {
                m_PrevMousePosition.multi_touch_count = 0;
                m_PrevMousePosition.prevTouchMiliSecond = 0;

                ToggleFullscreen();
                return;
            }

        } else {
            m_PrevMousePosition.multi_touch_count = 0;
        }
        m_PrevMousePosition.prevTouchMiliSecond = currentMiliSeconds;
    }
    function onMouseLeave(event) {
        m_isMouseDown = false;
    }
    function onMouseMove(event) {
        if (m_isMouseDown) {
            var distanceX = m_PrevMousePosition.x - event.clientX;
            var distanceY = m_PrevMousePosition.y - event.clientY;
            var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            if (distance >= 8) {
                m_PrevMousePosition.trackingCount++;
                m_Position.lon = (event.clientX - m_PrevMousePosition.x) * 0.1 + m_PrevMousePosition.prevLon;
                m_Position.lat = (event.clientY - m_PrevMousePosition.y) * 0.1 + m_PrevMousePosition.prevLat;
            }
        }
    }

    function onMouseWheel(event) {
        if (m_isMouseDown) {
            //TODO Change FOV
        }
    }

    function processPlayViewResize(width, height) {
        if (m_mainDIV != null && m_renderer != null) {
            m_renderer.setSize(width, height);
            m_camera.projectionMatrix.makePerspective(CONST_FOV, width / height, 1, 1100);
        }

    }
    function ToggleFullscreen() {
        if (m_mainDIV) {
            if (m_FullScreenMan.isFullscreen == false) {
                //Go TO Full screen
                m_FullScreenMan.MakeFullScreen(m_mainDIV);


            } else {
                //back to normal
                m_FullScreenMan.BacktoNormal(m_mainDIV);
                processPlayViewResize(m_ViewWidth, m_ViewHeight);
            }


            //change the style

        }
    }

}
