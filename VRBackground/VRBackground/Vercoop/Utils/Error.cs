using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
namespace VRBackground.Vercoop.Utils
{
    class Error
    {
        private static Error gv_error = null;
        private static string myLock = "AA";
        private static bool _isInited = false;
        private Error()
        {

        }
        public static Error Instance()
        {
            if (gv_error == null)
            {
                gv_error = new Error();
            }
            return gv_error;
        }
        public void AddError(string message)
        {
            
            Console.WriteLine(message);
            VRBackground.Vercoop.Utils.Error.trace(message);
        }
        public static void Log(string message)
        {
            Console.WriteLine(message);
            VRBackground.Vercoop.Utils.Error.trace(message);
        }
        public static void trace(string message)
        {
            /*
            lock (myLock)
            {
                StreamWriter logWriter = File.AppendText("log.txt");
                if(_isInited == false){
                    logWriter.WriteLine("====new application session======");
                    _isInited = true;
                }
                
                logWriter.WriteLine(message);
                Console.WriteLine(message);
                logWriter.Close();


            }
             * */
        }
    }
}
