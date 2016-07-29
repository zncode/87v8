using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using VRBackground.Vercoop.Utils;
using System.IO.Compression;

namespace VRBackground.Vercoop.Content
{
    class DownloadInfo
    {
        public enum FILE_TYPE {
            UNKNOWN,
            DIRECTORY = 101,
            ZIP_FILE = 102,
            IMAGE_FILE = 103,
            VIDEO_FILE = 104,
        }
        public string url = "";
        public string excutePath = "";
        public long size;
        public long created_time;
        public FILE_TYPE data_type;
        
        public DownloadInfo()
        {
            size = 0;
            created_time = 0;
        }
        public long getFileSize(string folder)
        {
            return getRecursiveFileSize(folder + "\\" + this.excutePath);
        }
        private long getRecursiveFileSize(string filename)
        {
            long mySize = 0;
            if (filename != null)
            {
                if (System.IO.File.Exists(filename))
                {
                    System.IO.FileInfo finfo = new System.IO.FileInfo(filename);
                    mySize += finfo.Length;
                }
                else if(System.IO.Directory.Exists(filename))
                {
                    foreach (string file in System.IO.Directory.GetFiles(filename))
                    {
                        mySize += getRecursiveFileSize(file);
                    }
                }
            }
            return mySize;
        }
        public Boolean DeleteData(string folder)
        {
            Boolean res = false;
            if (excutePath.Length > 4)
            {
                string path = folder + "\\" + excutePath;
                if (System.IO.File.Exists(path))
                {
                    System.IO.File.Delete(path);
                    res = true;
                }
                else if (System.IO.Directory.Exists(path))
                {
                    System.IO.Directory.Delete(path, true);
                    res = true;
                }
                else
                {
                    //File Not exist
                    res = true;
                }
            }
            return res;
        }
        public string GetReadableSize(){
            long tmp =size;
            string unit = "Bytes";
            if(tmp > 1024){
                tmp = (tmp - (tmp % 1024)) / 1024;
                unit = "KB";
                if(tmp > 1024){
                    tmp = (tmp - (tmp % 1024)) / 1024;
                    unit = "MB";    
                    
                    if(tmp > 1024){
                        tmp = (tmp - (tmp % 1024)) / 1024;
                        unit = "GB";                
                    }
                }
            }
            return Convert.ToString(tmp) + unit;
        }
        public string GetJsonString(string type)
        {
            string json = "{";

            json += "\"url\":\"" + VCAES.Base64Encode(url) + "\"";
            json += ",\"path\":\"" + VCAES.Base64Encode(excutePath) + "\"";
            json += ",\"size\":\"" + Convert.ToString(size) + "\"";
            json += ",\"data_type\":\"" + Convert.ToString(Convert.ToInt32(data_type)) + "\"";
            json += ",\"created_at\":\"" + Convert.ToString(created_time) + "\"";
            json += ",\"type\":\"" + type + "\"";
            json += "}";
            if (data_type == FILE_TYPE.IMAGE_FILE)
            {
                Console.WriteLine("Break Point");
            }
            return json;
        }
        public bool isFileExist(string folder)
        {
            if (size > 0)
            {
                string path = folder + "\\" + excutePath;
                //Utils.Error.Log("Error Check Step ===001====");
                string filename = Utility.GetExcutivePath(path);
                if (filename == null)
                {
                    return false;
                }
                return true;
            }
            return false;
        }
    }
    class ContentInfo
    {


        private const string DATATYPE_THUMBNAIL = "thumbnail";
        private const string DATATYPE_DATA = "Data";
        private const string DATATYPE_COVER_DATA = "CoverInfo";

        public int m_cts_idx = 0;
        private string m_title = "";

        private string m_developer = "";
        private string m_ageLimit = "";
        private string m_uploadDate = "";
        private string m_contentType = "Game";


        private string m_description = "";
        private int m_productID = 0;
        private int m_play_count = 0;
        public Boolean m_needUpdated = false;
        private string m_version ="";
        public string m_category = "none";
        private int m_price = 0;
        public Dictionary<string, DownloadInfo> m_ThumbnailList = new Dictionary<string, DownloadInfo>();
        public Dictionary<string, DownloadInfo> m_CoverDataList = new Dictionary<string, DownloadInfo>();
        public Dictionary<string, DownloadInfo> m_DataList = new Dictionary<string, DownloadInfo>();
        private bool m_isResolved = false;
        public long m_deletedTime = 0;
        private string m_MainFolder = "";

        public ContentInfo(int content_idx, string title, string description)
        {
            m_cts_idx = content_idx;
            m_price = 1;
            m_title = title;
            m_description = description;
            m_isResolved = true;

            long currentSeconds = Vercoop.Utils.Utility.GetCurrentSecond();
            DownloadInfo dwInfo = new DownloadInfo();
            dwInfo.url = title;
            dwInfo.excutePath = "GameExecute";
            dwInfo.size = 100;
            dwInfo.data_type = DownloadInfo.FILE_TYPE.ZIP_FILE;
            
            dwInfo.created_time = currentSeconds;
            m_DataList.Add(title, dwInfo);

            m_MainFolder = Config.GetDataDirectory() + "\\" + Convert.ToString(m_cts_idx);
            if (System.IO.Directory.Exists(m_MainFolder))
            {
                //Folder Already Exist
            }
            else
            {
                System.IO.Directory.CreateDirectory(m_MainFolder);
            }

        }
        public ContentInfo(JToken token, Boolean isAPI)
        {
            long currentSeconds = Vercoop.Utils.Utility.GetCurrentSecond();


            m_cts_idx = Convert.ToInt32(token["ct_idx"].ToString());

            if (token["price"] != null) {
                string tmp = token["price"].ToString();
                m_price = Convert.ToInt32(tmp); 
            }
            if (token["version"] != null) { m_version = token["version"].ToString(); }
            if (token["category"] != null) { m_category = token["category"].ToString(); }


            if (token["developer"] != null) { m_developer = token["developer"].ToString(); }
            if (token["age"] != null) { m_ageLimit = token["age"].ToString(); }
            if (token["upload_date"] != null) { m_uploadDate = token["upload_date"].ToString(); }
            if (token["ct_type"] != null) {
                m_contentType = token["ct_type"].ToString(); 
                
            }

            m_MainFolder = Config.GetDataDirectory() + "\\" + Convert.ToString(m_cts_idx);
            if (System.IO.Directory.Exists(m_MainFolder))
            {
                //Folder Already Exist
            }
            else
            {
                System.IO.Directory.CreateDirectory(m_MainFolder);
            }

            if (isAPI)
            {
                if (token["description"] != null) { m_description = token["description"].ToString(); }
                if (token["play_cnt"] != null)
                {
                    m_play_count = Convert.ToInt32(token["play_cnt"].ToString());
                }
                if (token["product_id"] != null)
                {
                    m_productID = Convert.ToInt32(token["product_id"].ToString());
                }

                if (token["title"] != null) { m_title = token["title"].ToString(); }
                //Data From API
                if (token["thumb"] != null)
                {
                    DownloadInfo info = new DownloadInfo();
                    info.data_type = DownloadInfo.FILE_TYPE.IMAGE_FILE;
                    string url = token["thumb"].ToString();
                    info.url = url;
                    info.created_time = currentSeconds;
                    m_ThumbnailList.Add(url, info);
                }
                if (token["cover_image"] != null)
                {
                    DownloadInfo info = new DownloadInfo();
                    info.data_type = DownloadInfo.FILE_TYPE.IMAGE_FILE;
                    string url = token["cover_image"].ToString();
                    info.url = url;
                    info.created_time = currentSeconds;
                    m_CoverDataList.Add(url, info);
                }
                if (token["cover_video"] != null)
                {
                    DownloadInfo info = new DownloadInfo();
                    info.data_type = DownloadInfo.FILE_TYPE.VIDEO_FILE;
                    string url = token["cover_video"].ToString();
                    info.url = url;
                    info.created_time = currentSeconds;
                    m_CoverDataList.Add(url, info);
                }
                if (token["download_url"] != null)
                {
                    DownloadInfo info = new DownloadInfo();
                    
                    if (isGameContent())
                    {
                        info.data_type = DownloadInfo.FILE_TYPE.ZIP_FILE;
                    }
                    else
                    {
                        info.data_type = DownloadInfo.FILE_TYPE.VIDEO_FILE;
                    }
                    string url = token["download_url"].ToString();
                    info.url = url;
                    info.created_time = currentSeconds;
                    m_DataList.Add(url, info);
                }
            }
            else
            {
                if (token["description"] != null) { m_description = VCAES.Base64Decode(token["description"].ToString()); }
                if (token["play_cnt"] != null) { m_play_count = Convert.ToInt32(token["play_cnt"].ToString()); }
                if (token["product_id"] != null) { m_productID = Convert.ToInt32(token["product_id"].ToString()); }
                if (token["title"] != null) { m_title = VCAES.Base64Decode(token["title"].ToString()); }
                if (token["deleted_time"] != null)
                {
                    m_deletedTime = Convert.ToInt64(token["deleted_time"].ToString()); 
                }
                if (token["datas"] != null)
                {
                    JArray datas = (JArray)token["datas"];
                    foreach (JToken info in datas)
                    {
                        string url = VCAES.Base64Decode(info["url"].ToString());
                        string path = VCAES.Base64Decode(info["path"].ToString());
                        long size = Convert.ToInt64(info["size"].ToString());
                        long created_at = Convert.ToInt64(info["created_at"].ToString());
                        string type = info["type"].ToString();
                        DownloadInfo.FILE_TYPE dataType = DownloadInfo.FILE_TYPE.UNKNOWN;
                        if (info["data_type"] != null)
                        {
                            dataType = (DownloadInfo.FILE_TYPE)(Convert.ToInt32(info["data_type"].ToString()));
                        }


                        DownloadInfo dwInfo = new DownloadInfo();
                        if (url.Equals("http://images.87870.com/2/CT/d41d8c/5c1d6b245010310dfb2289b8d51318e6banner.png"))
                        {
                            Console.WriteLine("Break Test Here");
                        }
                        dwInfo.url = url;
                        dwInfo.excutePath = path;
                        dwInfo.size = size;
                        dwInfo.created_time = created_at;
                        if (type.Equals(DATATYPE_THUMBNAIL))
                        {
                            m_ThumbnailList.Add(url, dwInfo);
                        }
                        else if (type.Equals(DATATYPE_DATA))
                        {
                            m_DataList.Add(url, dwInfo);
                        }
                        else if (type.Equals(DATATYPE_COVER_DATA))
                        {
                            m_CoverDataList.Add(url, dwInfo);
                        }

                    }
                }
            }

            //Check is Resolved
            checkResolved();


        }
        public void DeleteContentData()
        {
            System.IO.Directory.Delete(m_MainFolder, true);
        }
        public Boolean UpdateWithNewInfo(ContentInfo newInfo)
        {
            Boolean isUPdated = false;
            m_deletedTime = 0;
            if (!newInfo.m_version.Equals(m_version))
            {
                isUPdated = true;
                m_version = newInfo.m_version;
            }
            if (newInfo.m_price != m_price)
            {
                m_price = newInfo.m_price;
                isUPdated = true;
            }
            if (!newInfo.m_title.Equals(m_title))
            {
                isUPdated = true;
                m_title = newInfo.m_title;
            }
            if (!newInfo.m_description.Equals(m_description))
            {
                isUPdated = true;
                m_description = newInfo.m_description;
            }
            if (newInfo.m_play_count != m_play_count)
            {
                isUPdated = true;
                m_play_count = newInfo.m_play_count;
            }
            if (newInfo.m_productID != m_productID)
            {
                isUPdated = true;
                m_productID = newInfo.m_productID;
            }
            if (!newInfo.m_category.Equals(m_category))
            {
                isUPdated = true;
                m_category = newInfo.m_category;
            }


            if (!newInfo.m_category.Equals(m_developer))
            {
                isUPdated = true;
                m_developer = newInfo.m_developer;
            }
            if (!newInfo.m_category.Equals(m_ageLimit))
            {
                isUPdated = true;
                m_ageLimit = newInfo.m_ageLimit;
            }
            if (!newInfo.m_category.Equals(m_uploadDate))
            {
                isUPdated = true;
                m_uploadDate = newInfo.m_uploadDate;
            }
            if (!newInfo.m_contentType.Equals(m_contentType))
            {
                isUPdated = true;
                m_contentType = newInfo.m_contentType;
            }

            DownloadInfo dwInfo = newInfo.GetLastDownloadInfo(newInfo.m_ThumbnailList);
            if (this.addURLToList(m_ThumbnailList, dwInfo))
            {
                isUPdated = true;
            }

            dwInfo = newInfo.GetLastDownloadInfo(newInfo.m_CoverDataList);
            if (this.addURLToList(m_CoverDataList, dwInfo))
            {
                isUPdated = true;
            }

            dwInfo = newInfo.GetLastDownloadInfo(newInfo.m_DataList);
            if (this.addURLToList(m_DataList, dwInfo))
            {
                isUPdated = true;
            }

            return isUPdated;
        
        }
        public Boolean isResolved()
        {
            return m_isResolved;
        }
        private Boolean addURLToList(Dictionary<string, DownloadInfo> list, DownloadInfo info)
        {
            if (info != null)
            {
                if (list.ContainsKey(info.url)) return false;
                long currentSeconds = Vercoop.Utils.Utility.GetCurrentSecond();
                DownloadInfo newInfo = new DownloadInfo();
                
                newInfo.url = info.url;
                newInfo.data_type = info.data_type;
                newInfo.created_time = currentSeconds;
                list.Add(info.url, newInfo);
                return true;
            }
            return false;
        }
        public bool isGameContent()
        {
            if (m_contentType.Equals("Game"))
            {
                return true;
            }
            return false;
        }
        public string GetThumbURL()
        {
            DownloadInfo info = this.GetLastDownloadInfo(m_ThumbnailList, false);
            if (info != null)
            {
                return info.url;
            }
            return null;
        }
        public string GetCoverDataURL()
        {
            DownloadInfo info = this.GetLastDownloadInfo(m_CoverDataList, false);
            if (info != null)
            {
                return info.url;
            }
            return null;
        }
        public string GetDataURL()
        {
            DownloadInfo info = this.GetLastDownloadInfo(m_DataList, false);
            if (info != null)
            {
                return info.url;
            }
            return null;
        }
        public Boolean CleanDownloadInfo()
        {
            Boolean res = false;
            if (this.CleanListDownloadInfo(m_ThumbnailList))
            {
                res = true;
            }
            if (this.CleanListDownloadInfo(m_DataList))
            {
                res = true;
            }
            if (this.CleanListDownloadInfo(m_CoverDataList))
            {
                res = true;
            }

            return res;
        }
        private Boolean CleanListDownloadInfo(Dictionary<string, DownloadInfo> list)
        {
            long currentSeconds = Vercoop.Utils.Utility.GetCurrentSecond();
            Dictionary<string, DownloadInfo> realList = new Dictionary<string, DownloadInfo>();


            if (list.Count < 2)
            {
                return false;
            }
            foreach (var pair in list)
            {
                DownloadInfo info = pair.Value;
                if (info.isFileExist(m_MainFolder))
                {
                    realList.Add(info.url, info);
                }

            }
            if (realList.Count >= 2)
            {
                DownloadInfo oldDownloadInfo = null;
                long oldTime = currentSeconds * 10;
                foreach (var pair in realList)
                {
                    DownloadInfo info = pair.Value;
                    if (info.created_time < oldTime)
                    {

                        oldTime = info.created_time;
                        oldDownloadInfo = info;
                    }

                }
                if (oldDownloadInfo != null)
                {
                    long diff = Math.Abs(currentSeconds - oldDownloadInfo.created_time);
                    if (diff > Vercoop.Config.DELET_CONTENT_INTERVAL)
                    {
                        if (oldDownloadInfo.DeleteData(m_MainFolder))
                        {
                            list.Remove(oldDownloadInfo.url);
                            return true;
                        }
                        
                    }
                }
            }
           
            return false;
        }
        public Boolean SyncAndDownload()
        {
            Boolean res = false;
            long currentSeconds = Vercoop.Utils.Utility.GetCurrentSecond();
            string tmpPath = m_MainFolder + "\\tmp_data.dat";
            if (m_deletedTime == 0)
            {

                
                DownloadInfo info = this.GetLastDownloadInfo(m_ThumbnailList, false);
                if (info.size == 0)
                {
                    //Thumbnail을 다운로드 받는다.
                    try
                    {
                        string path = "THUMB_" + Convert.ToString(currentSeconds) + ".png";

                        long size = VCDownloader.Download(tmpPath, info.url, 0);
                        if (size > 0)
                        {
                            System.IO.File.Move(tmpPath, m_MainFolder + "\\" + path);
                            info.size = size;
                            info.excutePath = path;
                            res = true;
                        }
                        else
                        {
                            System.IO.File.Delete(m_MainFolder + "\\" + path);
                        }
                    }
                    catch (Exception ex)
                    {
                        Error.Log(ex.ToString());
                    }
                    
                }
                info = this.GetLastDownloadInfo(m_CoverDataList, false);
                if (info!= null && (info.size == 0 || info.getFileSize(m_MainFolder) < 100))
                {
                    //Thumbnail을 다운로드 받는다.
                    try
                    {
                        string path = "COVER_" + Convert.ToString(currentSeconds) + ".";
                        if (info.data_type == DownloadInfo.FILE_TYPE.VIDEO_FILE)
                        {
                            path += "mp4";
                        }else if(info.data_type == DownloadInfo.FILE_TYPE.IMAGE_FILE){
                            path += "png";
                        }else{
                            path += "png";
                        }
                        long size = VCDownloader.Download(tmpPath, info.url, 0);
                        if (size > 0)
                        {
                            System.IO.File.Move(tmpPath, m_MainFolder + "\\" + path);
                            info.size = size;
                            info.excutePath = path;
                            res = true;
                        }
                        else
                        {
                            System.IO.File.Delete(m_MainFolder + "\\" + path);
                        }
                    }
                    catch (Exception ex)
                    {
                        Error.Log(ex.ToString());
                    }

                }
                //DOwnload Zip File
                info = this.GetLastDownloadInfo(m_DataList, false);
                if (info != null && info.size == 0)
                {
                    //Thumbnail을 다운로드 받는다.
                    try
                    {
                        string path = "zipfile.zip";
                        string zip_file = m_MainFolder + "\\" + path;
                        if (isGameContent())
                        {

                        }
                        else
                        {
                            path = "VIDEO_" + Convert.ToString(currentSeconds) + ".mp4";
                            zip_file = tmpPath;
                        }
                        long size = VCDownloader.Download(zip_file, info.url, 0);
                        if (isGameContent())
                        {
                            if (size > 0)
                            {
                                //Game downloaded
                                path = "Games_" + currentSeconds;
                                //zip_file = "C:\\Users\\Hak\\Downloads\\jquery-mousewheel-3.1.12.zip";
                                using (ZipArchive archive = ZipFile.OpenRead(zip_file))
                                {
                                    string unzip_folder = m_MainFolder + "\\" + path;
                                    int cnt = 0;
                                    if (System.IO.Directory.Exists(unzip_folder))
                                    {
                                        //Folder Already Exist
                                    }
                                    else
                                    {
                                        System.IO.Directory.CreateDirectory(unzip_folder);
                                    }
                                    foreach (ZipArchiveEntry entry in archive.Entries)
                                    {
                                        try
                                        {
                                            string tmp = System.IO.Path.Combine(unzip_folder, entry.FullName);
                                            if (String.IsNullOrEmpty(entry.Name))
                                            {
                                                System.IO.Directory.CreateDirectory(tmp);
                                            }
                                            else
                                            {
                                                if (!entry.Name.Equals("please dont extract me.txt"))
                                                {
                                                    entry.ExtractToFile(tmp);
                                                }
                                            }
                                            Error.Log(tmp);
                                            cnt++;
                                        }
                                        catch (Exception ex)
                                        {
                                            Error.Log(ex.ToString());
                                        }

                                    }
                                    if (cnt > 0)
                                    {
                                        info.size = size;
                                        info.excutePath = path;
                                        res = true;
                                    }
                                }

                            }
                            System.IO.File.Delete(zip_file);
                        }
                        else
                        {
                            if (size > 0)
                            {
                                System.IO.File.Move(tmpPath, m_MainFolder + "\\" + path);
                                info.size = size;
                                info.excutePath = path;
                                res = true;
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Error.Log(ex.ToString());

                    }
                }
                if (res == true)
                {
                    checkResolved();
                }

            }
            return res;
        }
        public string GetResponseJsonString()
        {
            string json = "{";
            json += "\"ct_idx\":\"" + Convert.ToString(m_cts_idx) + "\"";
            json += ",\"price\":\"" + Convert.ToString(m_price) + "\"";
            json += ",\"version\":\"" + Convert.ToString(m_version) + "\"";
            json += ",\"category\":\"" + Convert.ToString(m_category) + "\"";
            json += ",\"description\":\"" + Convert.ToString(m_description) + "\"";
            json += ",\"play_count\":\"" + Convert.ToString(m_play_count) + "\"";
            json += ",\"product_id\":\"" + Convert.ToString(m_productID) + "\"";
            json += ",\"title\":\"" + Convert.ToString(m_title) + "\"";


            json += ",\"developer\":\"" + Convert.ToString(m_developer) + "\"";
            json += ",\"age\":\"" + Convert.ToString(m_ageLimit) + "\"";
            json += ",\"upload_date\":\"" + Convert.ToString(m_uploadDate) + "\"";
            json += ",\"ct_type\":\"" + Convert.ToString(m_contentType) + "\"";
            json += ",\"size\":\"" + this.GetFileSizeString() + "\"";


            json += "}";

         
            return json;
        }
        public int GetPlayCount() { return m_play_count; }
        public void SetPlayCount(int count)
        {
            if (m_play_count != count)
            {
                m_needUpdated = true;
            }
            m_play_count = count;
        }
        public string GetSaveJsonString()
        {
            string json = "{";
            string datas = "";
            int cnt_data = 0;

            json += "\"ct_idx\":\"" + Convert.ToString(m_cts_idx) + "\"";
            json += ",\"price\":\"" + Convert.ToString(m_price) + "\"";
            json += ",\"version\":\"" + Convert.ToString(m_version) + "\"";
            json += ",\"category\":\"" + Convert.ToString(m_category) + "\"";
            json += ",\"description\":\"" + VCAES.Base64Encode(m_description) + "\"";
            json += ",\"play_count\":\"" + Convert.ToString(m_play_count) + "\"";
            json += ",\"product_id\":\"" + Convert.ToString(m_productID) + "\"";
            json += ",\"title\":\"" + VCAES.Base64Encode(m_title) + "\"";
            json += ",\"deleted_time\":\"" + Convert.ToString(m_deletedTime) + "\"";
            

            json += ",\"developer\":\"" + Convert.ToString(m_developer) + "\"";
            json += ",\"age\":\"" + Convert.ToString(m_ageLimit) + "\"";
            json += ",\"upload_date\":\"" + Convert.ToString(m_uploadDate) + "\"";
            json += ",\"ct_type\":\"" + Convert.ToString(m_contentType) + "\"";


            foreach (var pair in m_DataList)
            {
                DownloadInfo info = pair.Value;
                if (cnt_data > 0) datas += ",";
                datas += info.GetJsonString(DATATYPE_DATA);
                cnt_data++;
            }
            foreach (var pair in m_ThumbnailList)
            {
                DownloadInfo info = pair.Value;
                if (cnt_data > 0) datas += ",";
                datas += info.GetJsonString(DATATYPE_THUMBNAIL);
                cnt_data++;
            }
            foreach (var pair in m_CoverDataList)
            {
                DownloadInfo info = pair.Value;
                if (cnt_data > 0) datas += ",";
                datas += info.GetJsonString(DATATYPE_COVER_DATA);
                cnt_data++;
            }

            json += ",\"datas\":[" + datas + "]";

            json += "}";
            return json;
        }
        private void checkResolved()
        {
            bool isDataResolved = false;
            bool isThumbResolved = false;
            bool isCoverResolved = false;
            foreach (var pair in m_DataList)
            {
                DownloadInfo info = pair.Value;
                if (info.size > 0)
                {
                    if (isGameContent())
                    {
                        if (info.isFileExist(m_MainFolder))
                        {

                            isDataResolved = true;

                            break;
                        }
                    }
                    else
                    {
                        if (info.size == info.getFileSize(m_MainFolder))
                        {
                            isDataResolved = true;
                            break;
                        }
                    }
                    
                }
            }
            foreach (var pair in m_ThumbnailList)
            {
                DownloadInfo info = pair.Value;
                if (info.size > 0) isThumbResolved = true;
                break;
            }
            if (m_CoverDataList.Count > 0)
            {
                foreach (var pair in m_CoverDataList)
                {
                    DownloadInfo info = pair.Value;
                    if (info.size > 0) isCoverResolved = true;
                    break;
                }
            }
            else
            {
                isCoverResolved = true;
            }
            if (isThumbResolved == true
                && isDataResolved == true
                && isCoverResolved == true)
            {
                m_isResolved = true;
            }
            else
            {
                m_isResolved = false;
            }

        }
        //simple version
        public string GetThumbnailPath()
        {
            return m_MainFolder + "\\thumbnail.png";
        }
        public string GetThumbnailPath_1()
        {
            if (Config.LOCAL_DEBUG)
            {
                return m_MainFolder + "\\thumbnail.png";
            }
            DownloadInfo info = GetLastDownloadInfo(m_ThumbnailList, true);
            if (info != null)
            {
                string path = m_MainFolder + "\\" + info.excutePath;
                return path;
            }
            return null;
        }
        //simple version
        public string GetCoverDataPath()
        {
            return m_MainFolder + "\\cover.png";
        }
        public string GetCoverDataPath_1()
        {
            if (Config.LOCAL_DEBUG)
            {
                return m_MainFolder + "\\cover.png";
            }
            DownloadInfo info = GetLastDownloadInfo(m_CoverDataList, true);
            if (info != null)
            {
                string path = m_MainFolder + "\\" + info.excutePath;
                return path;
            }
            return null;
        }
        private string GetFileSizeString()
        {
            DownloadInfo info = GetLastDownloadInfo(m_DataList, true);
            if (info != null)
            {
                return info.GetReadableSize();
            }
            return "0KB";
        }
        //simple version
        public string GetExcutePath()
        {

            string path = m_MainFolder + "\\game";

            Utils.Error.Log("Error Check Step ===002====");
            if (isGameContent())
            {
                return Utility.GetExcutivePath(path);
            }
            return path;
        }
        public string GetExcutePath_1()
        {
            DownloadInfo info = GetLastDownloadInfo(m_DataList, true);
            if (info != null)
            {
                string path = m_MainFolder + "\\" + info.excutePath;

                Utils.Error.Log("Error Check Step ===002====");
                if (isGameContent())
                {
                    return Utility.GetExcutivePath(path);
                }
                return path;

            }
            return null;
        }
        
        public DownloadInfo GetLastDownloadInfo(Dictionary<string, DownloadInfo> list, Boolean onlyResolved = false)
        {
            DownloadInfo newInfo = null;
            int newTime = 0;
            foreach (var pair in list)
            {
                DownloadInfo info = pair.Value;
                if (onlyResolved)
                {
                    if (info.size == 0)
                    {
                        continue;
                    }
                }
                if (info.created_time > newTime)
                {
                    //최신것만 가지고 온다.
                    newInfo = info;
                }

            }
            return newInfo;
        }
        
    }
}
