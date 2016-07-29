Vercoop.Utils.Files = new function () {
    var mLocalFolder = Windows.Storage.ApplicationData.current.localFolder;

    this.ReadText = function (filename, fc_ok) {
        mLocalFolder.getFileAsync(filename).done(
            function (file) {
                Windows.Storage.FileIO.readTextAsync(file).done(
                    function (data) {
                        fc_ok(data);
                    },
                    function (error) {
                        fc_ok(null);
                    }
                 );
            },
            function (error) {
                fc_ok(null);
            }
        );
    }
    this.DeleteFile = function (filename, onFinished) {
        mLocalFolder.getFileAsync(filename).done(
            function (prevFile) {
                prevFile.deleteAsync().done(
                    function (ok) {
                        onFinished(true);
                    },
                    function (err) {
                        onFinished(false);
                    }
                    );

            },
            function (error) {
                onFinished(true);
            }
        );
    }
    this.CreateFileFromFile = function (file, new_filename, fc_ok) {
        mLocalFolder.getFileAsync(new_filename).done(
            function (prevFile) {
                prevFile.deleteAsync().done(
                    function (ok) {
                        _createFileFromFile(file, new_filename, fc_ok);
                    },
                    function (err) {
                        fc_ok(false);
                    }
                    );

            },
            function (error) {
                _createFileFromFile(file, new_filename, fc_ok);
            }
        );
        function _createFileFromFile(file, filename, fc_ok) {
            Windows.Storage.FileIO.readBufferAsync(file).done(
               function (buffer) {
                   var fileHandler = mLocalFolder.createFileAsync(filename);

                   fileHandler.then(
                       function ok(new_file) {
                           Windows.Storage.FileIO.writeBufferAsync(new_file, buffer).done(
                               function (ok) {
                                   fc_ok(true);
                               },
                               function (err) {
                                   fc_ok(false);
                               }
                           );
                       },
                       function (error) {
                           fc_ok(false);
                       }
                   );

               },
               function (error) {
                   fc_ok(false);
               }

           );
        }
    }
    this.WriteText = function (filename, data,  fc_ok) {
        mLocalFolder.getFileAsync(filename).done(
            function (file) {
                _writeDataToFile(file);
            },
            function (error) {
                mLocalFolder.createFileAsync(filename).done(
                    function (file) {
                        _writeDataToFile(file);
                    },
                    function (error) {
                        fc_ok(false);
                    }

                );
            }
        );

        function _writeDataToFile(file) {
            Windows.Storage.FileIO.writeTextAsync(file, data).done(
                function (ok) {
                    fc_ok(true);
                },
                function (err) {
                    fc_ok(false);
                }

                );
        }
    }
}