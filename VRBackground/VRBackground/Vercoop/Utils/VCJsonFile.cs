using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRBackground.Vercoop.Utils
{
    class VCJsonFile
    {
        private bool m_isFileExist = false;

        private String m_currentJsonString = "";
        private String m_filename = null;
        public VCJsonFile(string filename, bool forceToCreate)
        {
            try
            {
                VRBackground.Vercoop.Utils.Error.trace("VCJsonFile====001=" + filename);
                if (System.IO.File.Exists(filename))
                {
                    String text = System.IO.File.ReadAllText(filename);
                    if (text != null)
                    {
                        if (text.Length > 20)
                        {
                            m_currentJsonString = VCAES.Decrypt(text);
                        }
                    }
                    m_isFileExist = true;
                }
                else
                {
                    if (forceToCreate)
                    {
                        System.IO.FileStream stream = System.IO.File.Create(filename);
                        m_isFileExist = true;
                        stream.Close();
                    }

                }
                VRBackground.Vercoop.Utils.Error.trace("VCJsonFile====002=" + filename);
                m_filename = filename;
            }
            catch (Exception ex)
            {
                Utils.Error.trace(ex.ToString());
            }

        }
        public bool isValid() { return m_isFileExist; }
        public String GetValue() { return m_currentJsonString; }
        public bool SaveData(String jsonString)
        {
            try
            {
                if (m_isFileExist)
                {
                    if (jsonString != null)
                    {
                        if (m_currentJsonString != null)
                        {
                            if (m_currentJsonString.Equals(jsonString))
                            {
                                //do not need to save data
                                return true;
                            }
                        }
                        m_currentJsonString = jsonString;
                        String value = VCAES.Encrypt(m_currentJsonString);
                        Utils.Error.trace(jsonString);
                        VRBackground.Vercoop.Utils.Error.trace("VCJsonFile====003=" + m_filename);
                        System.IO.File.WriteAllText(m_filename, value);
                        VRBackground.Vercoop.Utils.Error.trace("VCJsonFile====004=" + m_filename);


                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                Error.Instance().AddError(ex.ToString());
            }
            
            return false;
        }
    }
}
