
(function () {
    "use strict";
    WinJS.UI.Pages.define("/pages/settings/index.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            WinJS.Resources.processAll(); // Refetch string resources
            var pkg = Windows.ApplicationModel.Package.current;
            var packageId = pkg.id;
            var strVersion = versionString(packageId.version);
            document.getElementById("sp_version").innerText = strVersion;

            document.getElementById("device_button_add").onclick = function () {
                Vercoop.PAGE.Video.deviceBind();
            }

            var device_ip = Vercoop.Utils.Storage.VideoDevice.IP;
            if (device_ip) {
                document.getElementById("device_add_ip_value").value = device_ip;
            }
        }
    });


    function versionString(version) {
        return "" + version.major + "." + version.minor + "." + version.build + "." + version.revision;
    }
    
})();

