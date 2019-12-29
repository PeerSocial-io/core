/*global localStorage*/
define(function(require, exports, module) {
    "use strict";

    var HOME_DIR = "/.c9/home";

    var base64 = {
        encode: window.btoa.bind(window),
        decode: window.atob.bind(window)
    }

    Gun.log = function(a, b, c, d, e, f, g, h, i) {
        //console.log(a, b, c, d, e, f, g, h, i)
    };
    Gun.log.once = Gun.log;

    var EventEmitter = require("events").EventEmitter;
    // var gun = require("gun")();
    function GunFS(dbRoot) {
        this.dbRoot = () => { return dbRoot };
        this.root = this.dbRoot().get("root");
        this.root.on(()=>{});
        this.notify = this.dbRoot().get("notify");
        var _self = this;
        var initTime = Date.now();
        var fired = {};
        this.notify.on((a, b, c, d) => {
            if (a && a.t > initTime) {
                initTime = a.t;
                var event = {
                    path: a.path,
                    to: a.to,
                    t: a.t,
                    event: a.event
                };
                
                fired[a.path] = a.t;
                _self._emit(a.path, event);
                _self._emit("*", event);
            }
        });
    }
    GunFS.prototype = new EventEmitter();
    GunFS.prototype._emit = GunFS.prototype.emit;
    delete GunFS.prototype.emit;
    GunFS.prototype.stat = async function(path, options, callback) {
        if (typeof options == "function") callback = options;
        var _self = this;
        var doPromise = false;
        if (!callback) doPromise = true;

        function run() {
            var $_path = path;

            if ($_path == "/") {
                return callback(null, {
                    name: "",
                    size: 1,
                    mtime: 0,
                    ctime: 0,
                    mime: "folder"
                });
            }

            if (typeof path == "string") {
                if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
                path = path.split("/");
                var lookupCallback = function(err, list, item, contence) {
                    if (err) return callback(err);
                    path.shift();
                    var $path = path[0];
                    if (!$path || $path == "") {
                        return callback(null, list, $_path, item, contence);
                    }
                    var exist = null;
                    for (var i in list) {
                        if (list[i].name == $path) {
                            list[i].uid = i;
                            exist = list[i];
                            break;
                        }
                    }
                    if (exist && path.length == 1) {
                        var stat = {
                            name: exist.name,
                            size: exist.size || 1,
                            mtime: exist.mt || 0,
                            ctime: exist.ct || 0,
                            mime: exist.type == "folder" ? "folder" : ""
                        };
                        return callback(null, stat);
                    }
                    if (!exist) return callback(404, null, $_path, item, contence);
                    else {
                        var chain = item.get(exist.id);
                        getSet(chain, chain.get("contence"), lookupCallback);
                    }
                };
                getSet(_self.root, _self.root.get("contence"), lookupCallback);
            }
            else {
                if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
            }
        }
        if (doPromise) return new Promise((resolve) => {
            callback = function(err, results) {
                resolve(err || results);
            };
            run();
        });
        else run();
    };
    GunFS.prototype.readfile = async function(path, options, callback) {
        if (typeof options == "function") callback = options;
        var _self = this;
        var doPromise = false;
        if (!callback) doPromise = true;

        function run() {
            var $_path = path;
            // var _self = this;
            if (typeof path == "string") {
                if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
                path = path.split("/");
                var lookupCallback = function(err, list, item, contence) {
                    if (err) return callback(err);
                    path.shift();
                    var $path = path[0];
                    if (!$path || $path == "") {
                        return callback(null, list, $_path, item, contence);
                    }
                    var exist = null;
                    for (var i in list) {
                        if (list[i].name == $path) {
                            list[i].uid = i;
                            exist = list[i];
                            break;
                        }
                    }
                    if (exist && ( exist.value || exist.value == "")) 
                        return _self._decode(exist.value, (value) => {
                            callback(null, value);
                        });
                    if (!exist) return callback(404, null, $_path, item, contence);
                    else {
                        var chain = item.get(exist.id);
                        getSet(chain, chain.get("contence"), lookupCallback);
                    }
                };
                getSet(_self.root, _self.root.get("contence"), lookupCallback);
            }
            else {
                if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
            }
        }
        if (doPromise) return new Promise((resolve) => {
            callback = function(err, results) {
                resolve(err || results);
            };
            run();
        });
        else run();
    };
    GunFS.prototype.readdir = async function(path, options, callback) {
        if (typeof options == "function") callback = options;
        var _self = this;
        var doPromise = false;
        if (!callback) doPromise = true;

        function run() {
            var $_path = path;
            if (typeof path == "string") {
                if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
                path = path.split("/");
                var lookupCallback = function(err, list, item, contence) {
                    if (err) return callback(err);
                    path.shift();
                    var $path = path[0];
                    if (!$path || $path == "") {
                        return callback(null, list, $_path, item, contence);
                    }
                    var exist = null;
                    for (var i in list) {
                        if (list[i].name == $path) {
                            list[i].uid = i;
                            exist = list[i];
                            break;
                        }
                    }
                    if (exist && exist.value) return callback("path is a file");
                    if (!exist) return callback(404, null, $_path, item, contence);
                    else {
                        var chain = item.get(exist.id);
                        getSet(chain, chain.get("contence"), lookupCallback);
                    }
                };
                getSet(_self.root, _self.root.get("contence"), lookupCallback);
            }
            else {
                if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
            }
        }
        if (doPromise) return new Promise((resolve) => {
            callback = function(err, results) {
                resolve(err || results);
            };
            run();
        });
        else run();
    };
    GunFS.prototype.mkfile = async function(path, options, callback) {
        var _self = this;

        var doPromise = false;
        if (!callback) doPromise = true;

        function getValue(cb) {
            var v = "";
            if (typeof options == "object" && options.stream) {
                options.stream.on("data", function(e) {
                    if (e) v += e;
                });
                options.stream.on("end", function(e) {
                    if (e) v += e;
                    cb(v);
                });
            }
            else if (typeof options == "string") {
                v = options;
                cb(v);
            }
        }

        function run() {
            var parentDir = path.split("/");
            var file_name = parentDir.pop();
            parentDir = parentDir.join("/");
            if (parentDir == "") parentDir = "/";
            _self.readdir(parentDir, (err, list, name, item, contence) => {
                var exist = false;
                if (err == 404) return callback("parent dir not found");
                for (var i in list) {
                    if (list[i].name == file_name) {
                        list[i].uid = i;
                        exist = list[i];
                        break;
                    }
                }
                var $contence;
                var newFile;
                if (!exist) {
                    var pathID = _self.dbRoot()._.gun.opt()._.opt.uuid();
                    $contence = item.get(pathID);
                    newFile = {
                        name: file_name,
                        //value: value,
                        id: pathID,
                        ct: Date.now(),
                        mt: Date.now(),
                        type: ""
                    };
                }
                else {
                    $contence = contence.get(exist.uid);
                    newFile = {
                        mt: Date.now()
                    };
                }
                getValue((value) => {
                    _self._encode(value, (value) => {
                        newFile.value = value;
                        newFile.size = lengthInUtf8Bytes(value);
                        $contence.put(newFile, function() {
                            _self.notify.put({ path: path, to: null, t: Date.now(), event: "change", type: "file" });
                            if (!exist) contence.set($contence, (res) => {
                                callback(null);
                            });
                            else callback(null);
                        });
                    });
                });
            });
        }
        if (doPromise) return new Promise((resolve) => {
            callback = function(err, results) {
                resolve(err || results);
            };
            run();
        });
        else run();
    };
    GunFS.prototype.mkdir = async function(path, options, callback) {
        if (typeof options == "function") callback = options;
        var _self = this;
        var doPromise = false;
        if (!callback) doPromise = true;

        function run() {
            var parentDir = path.split("/")
            var folder_name = parentDir.pop();
            parentDir = parentDir.join("/")
            if (parentDir == "") parentDir = "/";
            _self.readdir(parentDir, (err, list, name, item, contence) => {
                if (err == 404) return callback("parent dir not found");
                for (var i in list) {
                    if (list[i].name == folder_name) return callback("dir already exist");
                }
                var pathID = _self.dbRoot()._.gun.opt()._.opt.uuid();
                var dir = item.get(pathID);
                dir.put({ name: folder_name, id: pathID, ct: Date.now(), mt: Date.now(), type: "folder" }, () => {
                    _self.notify.put({ path: path, to: null, t: Date.now(), event: "change", type: "folder" });
                    contence.set(dir, (res) => {
                        callback(null);
                    });
                });
            });
        }
        if (doPromise) return new Promise((resolve) => {
            callback = function(err, results) {
                resolve(err || results);
            };
            run();
        });
        else run();
    };
    GunFS.prototype.rmfile = async function(path, options, callback) {
        return await this.rmdir(path, options, callback);
    };
    GunFS.prototype.rmdir = async function(path, options, callback) {
        if (typeof options == "function") callback = options;
        var _self = this;
        var doPromise = false;
        if (!callback) doPromise = true;

        function run() {
            var parentDir = path.split("/");
            var folder_name = parentDir.pop();
            parentDir = parentDir.join("/");
            if (parentDir == "") parentDir = "/";
            _self.readdir(parentDir, (err, list, name, item, contence) => {
                var exist = false;
                if (err == 404) return callback("parent path not found");
                for (var i in list) {
                    if (list[i].name == folder_name) {
                        list[i].uid = i;
                        exist = list[i];
                        break;
                    }
                }
                if (exist) {
                    // var pathID = exist.uid;
                    // var dir = item.get(exist.id);
                    var $contence = contence.get(exist.uid);
                    //$contence.put(null,(res)=>{   //<---  should we create a trash bin?
                    contence.unset($contence);
                    _self.notify.put({ path: path, to: null, t: Date.now(), event: "delete" });
                    callback(null);
                    //})
                }
                else callback("path not found");
            });
        }
        if (doPromise) return new Promise((resolve) => {
            callback = function(err, results) {
                resolve(err || results);
            };
            run();
        });
        else run();
    };
    GunFS.prototype.rename = async function(pathFrom, options, done) {
        var _self = this;
        var pathTo = options.to;
        var doPromise = false;
        if (!done) doPromise = true;

        function run() {
            getTo((err, to_list, to_name, to_item, to_contence, parentDir, $name) => {
                if (err) return done(err);
                getFrom((err, from_parentDir, dir, contence, uid) => {
                    if (err) return done(err);
                    var $contence = contence.get(uid);
                    if (parentDir != from_parentDir) {
                        contence.unset(dir);
                        to_contence.set(dir);
                    }
                    $contence.put({ name: $name }, (res) => {
                        _self.notify.put({ path: pathFrom, to: parentDir + "/" + $name, t: Date.now(), event: "rename" });
                        done(null);
                    });
                });
            });
        }

        function getTo(callback) {
            var parentDir = pathTo.split("/");
            var $name = parentDir.pop();
            parentDir = parentDir.join("/");
            if (parentDir == "") parentDir = "/";
            _self.readdir(parentDir, (err, list, name, item, contence) => {
                if (err == 404) return callback("parent path not found");
                for (var i in list) {
                    if (list[i].name == $name) return callback("path already exist");
                }
                callback(err, list, name, item, contence, parentDir, $name);
            });
        }

        function getFrom(callback) {
            var parentDir = pathFrom.split("/");
            var $name = parentDir.pop();
            parentDir = parentDir.join("/");
            if (parentDir == "") parentDir = "/";
            _self.readdir(parentDir, (err, list, name, item, contence) => {
                var exist = false;
                if (err == 404) return callback("parent path not found");
                for (var i in list) {
                    if (list[i].name == $name) {
                        list[i].uid = i;
                        exist = list[i];
                        break;
                    }
                }
                if (exist) {
                    var dir = item.get(exist.id);
                    callback(null, parentDir, dir, contence, exist.uid);
                }
                else callback("file not found");
            });
        }
        if (doPromise) return new Promise((resolve) => {
            done = function(err, results) {
                resolve(err || results);
            };
            run();
        });
        else run();
    };
    GunFS.prototype._encode = function(value, cb) {
        cb(base64.encode(value));
    };
    GunFS.prototype._decode = function(value, cb) {
        cb(base64.decode(value));
    };

    async function getSet(listSet, contence, callback) {
        var ended = false;
        var list = [];
        var count = 0;
        contence.once(function(a, b, c, d) {
            if (ended) return;
            for (var i in a) {
                if (i.indexOf("_") == 0) continue;
                count += 1;
            }
            if (count == 0) {
                ended = true;
                return callback(null, listArrToObj(list), listSet, contence);
            }
        }).map(function(item) {
            return !!item ? item : null;
        }).once(function(a, b, c, d) {
            if (ended) return;
            if (a == null) count -= 1;
            if (a) list.push({ a: a, b: b });
            if (count == list.length) {
                ended = true;
                return callback(null, listArrToObj(list), listSet, contence);
            }
        });

        function listArrToObj(arr) {
            var obj = {};
            for (var i in arr) {
                obj[arr[i].b] = arr[i].a;
            }
            return obj;
        }
    }

    function lengthInUtf8Bytes(str) {
        // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
        var m = encodeURIComponent(str).match(/%[89ABab]/g);
        return str.length + (m ? m.length : 0);
    }


    main.consumes = ["Plugin"];
    main.provides = ["vfs", "vfs.ping", "vfs.log", "vfs.endpoint"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var plugin = new Plugin("Ajax.org", main.consumes);

        var id;
        var vfsBaseUrl;
        var serviceUrl;

        var fsData = {};

        var gunfs;

        var pathLib = require("path");
        var Stream = require("stream").Stream;
        var basename = require("path").basename;
        var noop = function() { console.error("not implemented"); };
        var silent = function() {};
        var connection = {};

        /*global gun*/

        var myID = Math.floor(100000000 + Math.random() * 900000000);
        var loaded = false;
        //var sitekey = "peersocial.c9-test-10";
        var dbroot = "pstest4";

        var vfsEvents = new EventEmitter();

        function load() {

            var loading_act = {};

            gunfs = new GunFS(gun.get(dbroot));
            
            gunfs.on("*", function(event){
                if(event.path)
                    watcher.addChange(event.path);
                    
                console.log(event)
            });

            loading_act.start = function() {
                loading_act.a();
            };
            var initC9= false;
            loading_act.a = function() {
                gunfs.stat("/.c9", function(err, stats) {
                    if (err == 404){
                        gunfs.mkdir("/.c9", loading_act.b);
                        initC9 = true;
                    }else loading_act.b()
                    

                    //loading_act.z();
                });
            };
            
            loading_act.b = function() {
                gunfs.stat(HOME_DIR, function(err, stats) {
                    if (err == 404)
                        gunfs.mkdir(HOME_DIR, loading_act.c);
                    else loading_act.c()
                    //loading_act.b();
                });
            };

            loading_act.c = function() {
                gunfs.stat(HOME_DIR + "/.c9", function(err, stats) {
                    if (err == 404)
                        gunfs.mkdir(HOME_DIR + "/.c9", loading_act.z);
                    else loading_act.z()
                    //loading_act.c();
                });
            };


            loading_act.z = function() {
                gunfs.stat("/README.md", function(err, stats) {
                    if (err && initC9) {
                        var data = [
                            "# Welcome to Cloud9 offline demo!",
                            "",
                            "This is a demo of Cloud9 ui, with a mock vfs server working with localStorage",
                            "Some features that need a real server have been disabled",
                            "So be sure to try the real thing at https://c9.io! "
                        ].join("\n");
                        gunfs.mkfile("/README.md", data);
                    }
                    loading_act.done();
                });
            };


            loading_act.done = function() {
                loaded = true;
                vfsEvents.emit("connect");
            };

            loading_act.start();

            // gunfs.exist("/README.md", (e, exist) => {
            //     if (!exist) {
            //         var data = [
            //             "# Welcome to Cloud9 offline demo!",
            //             "",
            //             "This is a demo of Cloud9 ui, with a mock vfs server working with localStorage",
            //             "Some features that need a real server have been disabled",
            //             "So be sure to try the real thing at https://c9.io! "
            //         ].join("\n")
            //         gunfs.write("/README.md", data, () => {})

            //     }


            //     loaded = true;
            //     vfsEvents.emit("connect");
            // })



            // initialize mock fsData
            // await findNodeAsync("/README.md", true, [
            //     "# Welcome to Cloud9 offline demo!",
            //     "",
            //     "This is a demo of Cloud9 ui, with a mock vfs server working with localStorage",
            //     "Some features that need a real server have been disabled",
            //     "So be sure to try the real thing at https://c9.io! "
            // ].join("\n"));

            //await findNodeAsync("~", true);



            if (options.storage != false) {

                // Try loading data from localStorage
                /*try {
                    
                    gun.get(dbroot).get(sitekey).once(function(data){
                        //console.log(data)
                        if(data && !data.err && data.value){
                            fsData = JSON.parse(data.value);
                        }
                        setTimeout(()=>{
                            loaded = true;
                            vfsEvents.emit("connect");
                        },20);
                        
                    });
                } catch (e) {}
                try {
                    gun.get(dbroot).get(sitekey+"-watcher").on(function(data){
                        if(!loaded) return;
                        if(data.myID == myID) return;
                        if(data && !data.err){
                            // if(data.fsData)
                            //     fsData = JSON.parse(data.fsData);
                            data = JSON.parse(data.value);
                            watcher.emit(data.path, data.event, data.filename, data.stat, data.files || null);
                        }
                    });
                    //fsData = JSON.parse(localStorage.fsData);
                } catch (e) {}
                window.addEventListener("beforeunload", function(e) {
                    gun.get(dbroot).get(sitekey).put({value: JSON.stringify(fsData) });
                    console.log("saved data");
                    localStorage.fsData = JSON.stringify(fsData);
                    return "";
                });*/
            }
        }

        function unload() {
            fsData = {};
        }


        // async function findNodeAsync(path, create, val) {
        //     console.log(path,val)
        //     return new Promise((resolve, reject) => {
        //         if(!gunfs) return reject();
        //             if (val != null) {
        //                 gunfs.write(path, val,  function(err, fileData) {
        //                     resolve(val);
        //                 })
        //             }else{
        //                 gunfs.read(path, function(err, fileData) {
        //                     resolve(fileData || "{}");
        //                 })
        //             }

        //         }

        /*return new Promise(resolve => {
            
             try {
                gun.get(dbroot).get(sitekey).once(function(data){
                    //console.log(data)
                    if(data && !data.err && data.value){
                        var gunfsData = JSON.parse(data.value);
                        var fileData = findNode(path, create, val, gunfsData);
                        gun.get(dbroot).get(sitekey).put({ 
                            value:JSON.stringify(gunfsData) 
                        },function(){
                            
                            resolve(fileData);
                        })
                    }
                });
            } catch (e) {}
            
        }*/
        //    );
        //}


        // function findNode(path, create, val, dataStore) {
        //     console.log("path", path)
        //     if (!path) path = "/";
        //     var parts = path.split("/");
        //     if (!parts[parts.length - 1])
        //         parts.pop();
        //     var data = dataStore; // || fsData;
        //     var prev = null;
        //     for (var i = 0; i < parts.length; i++) {
        //         prev = data;
        //         data = data["!" + parts[i]];
        //         if (data == null) {
        //             if (create && !isFile(prev))
        //                 data = prev["!" + parts[i]] = {};
        //             else
        //                 return;
        //         }
        //     }
        //     if (val != null)
        //         data = prev["!" + parts[parts.length - 1]] = { v: val, t: Date.now() };

        //     return data;
        // }

        function ENOENT() {
            var err = new Error("ENOENT");
            err.code = "ENOENT";
            return err;
        }

        function isFile(node) {
            return typeof node == "string" || node && node.v != null;
        }

        function fileConets(node) {
            return typeof node == "string" ? node : node && node.v;
        }

        function sendStream(data, callback) {
            var stream = new Stream();
            stream.readable = true;
            callback(null, { stream: stream });
            if (Array.isArray(data)) {
                data.forEach(function(x) {
                    stream.emit("data", x);
                });
            }
            else {
                stream.emit("data", data);
            }
            stream.emit("end");
        }

        function readStream(callback) {
            return function(err, meta) {
                if (err) return callback(err);
                var buffer = [];
                meta.stream.on("data", function(data) {
                    if (typeof data == "string")
                        buffer += data;
                    else
                        buffer = buffer.concat(data);
                });
                meta.stream.on("end", function() {
                    callback(null, buffer);
                });
            };
        }

        function readBlob(blob, callback) {
            var reader = new FileReader();
            reader.onload = function() {
                callback(null, reader.result);
            };
            reader.onerror = function(e) {
                callback(e);
            };
            reader.readAsText(blob);
        }

        var watcher = new EventEmitter();
        watcher.addChange = function(path) {
            plugin.stat(path, {}, function(err, stat) {
                var dir = pathLib.dirname(path);
                var name = pathLib.basename(path);
                if(stat.mime == "folder")
                    plugin.readdir(dir, {}, readStream(function(e, stats) {
                        watcher.emit(dir, "directory", name, stat, stats);
                    }));
                else
                    watcher.emit(path, err ? "delete" : "change", name, stat);
            });
        };
        
        watcher.watch = function(path, options, callback) {
            if (!callback) callback = options;
            setTimeout(function() {
                var w = new EventEmitter();
                var sendEvent = function(event, filename, stat, files) {
                    w.emit("change", event, filename, stat, files);
                };
                watcher.on(path, sendEvent);
                w.close = function() {
                    watcher.off(path, sendEvent);
                };
                callback(null, { watcher: w });
            });
        };
        watcher.unwatch = function(path, options, callback) {
            if (!callback) callback = options;
            watcher.removeAllListeners(path);
        };


        plugin.on("load", load);
        plugin.on("unload", unload);


        plugin.freezePublicAPI({
            on: vfsEvents.on.bind(vfsEvents),
            once: vfsEvents.once.bind(vfsEvents),

            get connection() { return connection; },
            get connecting() { return false; },
            get connected() { return loaded },

            get previewUrl() { throw new Error("gone"); },
            get serviceUrl() { return serviceUrl; },
            get id() { return id; },
            get baseUrl() { return vfsBaseUrl; },
            get region() { return ""; },

            rest: async function(path, options, callback) {
                // if (options.method == "PUT") {
                //     if (typeof options.body == "object") {
                //         return readBlob(options.body, function(e, value) {
                //             if (e) return callback(e);
                //             plugin.rest(path, {
                //                 method: "PUT",
                //                 body: value,
                //             }, callback);
                //         });
                //     }
                //     sendStream(options.body, function(err, stream) {
                //         if (err) return callback(err);
                //         plugin.mkfile(path, stream, callback);
                //     });
                // }
                // else if (options.method == "GET") {
                //     var result = await findNodeAsync(path);
                //     setTimeout(function() {
                //         callback(null, result);
                //     }, 20);
                // }
                callback({});
            },
            download: async function(path, filename, isfile) {
                // TODO use jszip for folders
                // if (Array.isArray(path) && path.length > 1) {
                //     return path.map(function(x) {
                //         plugin.download(x);
                //     });
                // }
                // var data = await findNodeAsync(path);
                // if (!isFile(data))
                //     return console.error("not implemented");
                // var a = document.createElement('a');
                // a.href = URL.createObjectURL(new Blob([fileConets(data)], { type: "text/plain" }));
                // a.download = filename || basename(path);

                // document.body.appendChild(a);
                // a.click();
                // document.body.removeChild(a);
            },
            url: noop,
            reconnect: noop,

            vfsUrl: noop,

            // File management
            resolve: noop,
            stat: async function(path, options, callback) {
                console.log("stat", path, options);
                if (path.indexOf("~") == 0) {
                    path = HOME_DIR + path.substring(1);
                }
                gunfs.stat(path, (err, $stats) => {
                    path = path;
                    if (err == 404) {
                        return callback(ENOENT());
                    }
                    // var stats = [];
                    // for (var i in $stats) {
                    //     stats.push({ name: $stats[i].name, size: $stats[i].size || 1, mtime: $stats[i].mt, ctime: $stats[i].ct, mime: $stats[i].type });
                    // }
                    callback(err, $stats);
                });
                // gunfs.stats(path, (err, stats) => {
                //     if (!err) {
                //         var name = path.split("/");
                //         name = name[name.length - 1];

                //         var isFolder = false;
                //         if (name == "." || name == "")
                //             isFolder = true;


                //         var stat = {
                //             name: name,
                //             size: 1,
                //             mtime: stats.mt || 0,
                //             ctime: stats.ct || 0,
                //             mime: !isFolder ? "" : "folder"
                //         };

                //         console.log("stat", path, stat)
                //         callback(null, stat);
                //     }
                //     else {
                //         return callback(ENOENT());
                //     }
                // })

                // var data = await findNodeAsync(path);
                // var name = path.split("/").pop();
                // setTimeout(function() {
                //     if (data == null)
                //         return callback(ENOENT());
                //     var value = fileConets(data);
                //     var isFileNode = value != null;
                //     var stat = {
                //         name: name,
                //         size: isFileNode ? value.length : 1,
                //         mtime: data.t || 0,
                //         ctime: data.ct || data.t || 0,
                //         mime: isFileNode ? "" : "folder"
                //     };
                //     callback(null, stat);
                // }, 20);
            },
            readfile: async function(path, options, callback) {
                console.log("read", path, options);

                if (path.indexOf("~") == 0) {
                    path = HOME_DIR + path.substring(1);
                }

                gunfs.readfile(path, (err, value) => {
                    if (value == null)
                        return callback(ENOENT());
                    sendStream(value, callback);
                });


                // gunfs.read(path, (err, value) => {
                //     if (value == null)
                //         return callback(ENOENT());
                //     sendStream(value, callback);
                // });

                // var data = await findNodeAsync(path);
                // setTimeout(function() {
                //     var value = fileConets(data);
                //     if (value == null)
                //         return callback(ENOENT());
                //     sendStream(value, callback);
                // }, 20);
            },
            readdir: async function(path, options, callback) {
                console.log("readdir", path, options)

                gunfs.readdir(path, (err, list) => {
                    // gunfs.list(path, (err, list) => {
                    /*[0: {name: ".c9", size: 1, mtime: 0, ctime: undefined, mime: "folder"}
                    1: {name: "helloworld.html", size: 1513, mtime: 1576638752999, ctime: 1576638752999, mime: ""}
                    2: {name: "yaya.html", size: 0, mtime: 1576638219586, ctime: 1576638219586, mime: ""}
                    3: {name: "test", size: 1, mtime: 0, ctime: undefined, mime: "folder"}]*/
                    var stats = [];
                    var folders = {}
                    for (var i in list) {
                        //console.log(list);//{path: "/README.md", value: "", id: "", ct: 1576903230530, mt: 1576903455506}
                        // var itemPath = list[i].path.replace(path, "");
                        // var $path = itemPath.split("/");
                        // if ($path[0] == "") $path.shift();

                        // if (itemPath.indexOf("/") > 0) {
                        //     var folderName = $path[0]
                        //     folders[folderName] = true;
                        // }
                        // else

                        stats.push({ name: list[i].name, size: list[i].size || 1, mtime: list[i].mt, ctime: list[i].ct, mime: list[i].type })
                    }
                    // for (var i in folders) {
                    //     stats.push({ name: i, size: 1, mtime: 0, ctime: 0, mime: "folder" })
                    // }

                    console.log(path, stats);
                    sendStream(stats, callback);
                });


                /*var data = await findNodeAsync(path);
                setTimeout(function() {
                    if (!data || isFile(data))
                        return callback(ENOENT());
                    var stats = Object.keys(data).map(function(n) {
                        var value = fileConets(data[n]);
                        var isFile = value != null;
                        return {
                            name: n.substr(1),
                            size: isFile ? value.length : 1,
                            mtime: data[n].t || 0,
                            ctime: data[n].ct || data[n].t,
                            mime: isFile ? "" : "folder"
                        };
                    });
                    sendStream(stats, callback);
                });*/
            },
            mkfile: function(path, options, callback) {
                if (path.indexOf("~") == 0) {
                    path = HOME_DIR + path.substring(1);
                }

                var val = "";
                options.stream.on("data", function(e) {
                    if (e) val += e;
                });
                options.stream.on("end", function(e) {
                    if (e) val += e;

                    console.log("mkfile", path, val);
                    gunfs.mkfile(path, val, callback);
                });
                /*var parts = path.split("/");
                var name = "!" + parts.pop();
                var val = "";
                options.stream.on("data", function(e) {
                    if (e) val += e;
                });
                options.stream.on("end", function(e) {
                    if (e) val += e;
                    setTimeout(async function() {
                        var parent = await findNodeAsync(parts.join("/"), true);
                        if (!parent)
                            return callback(ENOENT());
                        if (parent[name] && !isFile(parent[name]))
                            return callback(new Error("EISDIR"));

                        //parent[name] = { v: val, t: Date.now() };
                        await findNodeAsync(parts.join("/"), true, val);
                        watcher.addChange(path);
                        callback(null);
                    });
                });*/
            },
            mkdir: async function(path, options, callback) {
                console.log("mkdir", path)
                /*var data = await findNodeAsync(path, true);
                setTimeout(function() {
                    if (!data)
                        return callback(ENOENT());
                    watcher.addChange(path);
                    callback();
                });*/
            },
            mkdirP: async function(path, options, callback) {
                console.log("mkdirp", path)
                /*var data = await findNodeAsync(path, true);
                setTimeout(function() {
                    if (!data)
                        return callback(ENOENT());
                    watcher.addChange(path);
                    callback();
                });*/
            },
            appendfile: noop,
            rmfile: function(path, options, callback) {
                console.log("rmfile", path)
                gunfs.rmfile(path, callback)
                /*var parts = path.split("/");
                var name = "!" + parts.pop();
                setTimeout(async function() {
                    var parent = await findNodeAsync(parts.join("/"));
                    if (!parent || !parent[name])
                        return callback(ENOENT());
                    if (!isFile(parent[name]))
                        return callback(new Error("EISDIR"));
                    delete parent[name];
                    watcher.addChange(path);
                    callback();
                });*/
            },
            rmdir: function(path, options, callback) {
                console.log("rmdir", path)
                gunfs.rmdir(path, callback)
                /*var parts = path.split("/");
                var name = "!" + parts.pop();
                setTimeout(async function() {
                    var parent = await findNodeAsync(parts.join("/"));
                    if (!parent || !parent[name])
                        return callback(ENOENT());
                    if (isFile(parent[name]))
                        return callback(new Error("EISFILE"));
                    delete parent[name];
                    watcher.addChange(path);
                    callback();
                });*/
            },
            rename: function(to, options, callback) {
                console.log("rename", to, options)
                var from = options.from;
                var overwrite = options.overwrite;

                gunfs.rename(from, { to: to, overwrite: overwrite }, callback);


                /*setTimeout(async function() {
                    var from = options.from;
                    var overwrite = options.overwrite;

                    var parts = to.split("/");
                    var toName = "!" + parts.pop();
                    var toParent = await findNodeAsync(parts.join("/"), true);

                    parts = from.split("/");
                    var fromName = "!" + parts.pop();
                    var fromParent = await findNodeAsync(parts.join("/"));
                    if (toParent[toName] != null && !overwrite)
                        return callback(ENOENT());

                    toParent[toName] = fromParent[fromName];
                    delete fromParent[fromName];
                    watcher.addChange(from);
                    watcher.addChange(to);
                    callback(null);
                });*/
            },
            copy: function(from, options, callback) {
                console.log("copy", from, options)
                /*setTimeout(async function() {
                    var to = options.to;
                    var overwrite = options.overwrite;

                    var toParts = to.split("/");
                    var toName = "!" + toParts.pop();
                    var toParent = await findNodeAsync(toParts.join("/"));

                    var parts = from.split("/");
                    var fromName = "!" + parts.pop();
                    var fromParent = await findNodeAsync(parts.join("/"));
                    var counter = 0;
                    var name = toName;
                    while (toParent[toName] != null && !options.overwrite)
                        toName = name + "." + (++counter);

                    toParent[toName] = fromParent[fromName];
                    toParts.push(toName.substr(1));
                    watcher.addChange(to);
                    callback(null, { to: toParts.join("/") });
                });*/
            },
            chmod: noop,
            symlink: noop,

            // Save and retrieve Metadata
            metadata: async function(path, value, sync, callback) {
                console.log("metadata" + (sync ? "-sync-" : "") + (value ? "-value-" : ""), path, value)

                gunfs.mkfile("/.c9/metadata-" + window.btoa(path), JSON.stringify(value), (err) => {
                    callback()
                })

                /*var parts = ("/.c9/metadata" + path).split("/");
                var name = "!" + parts.pop();
                var parent = await findNodeAsync(parts.join("/"), true);
                if (sync) {
                    parent[name] = JSON.stringify(value);
                    return callback();
                }
                setTimeout(function() {
                    parent[name] = JSON.stringify(value);
                    callback();
                });*/
            },
            readFileWithMetadata: async function(path, options, callback) {
                console.log("readFileWithMetadata", path)
                gunfs.readfile("/.c9/metadata-" + window.btoa(path), (err, metadata) => {
                    gunfs.readfile(path, (err, value) => {
                        if (value == null)
                            return callback(ENOENT());

                        callback(null, value, metadata);
                    });
                });

                return { abort: function() {} };

                // var data = await findNodeAsync(path);
                // var metadata = await findNodeAsync("/.c9/metadata" + path);
                // var timer = setTimeout(function() {
                //     if (!isFile(data))
                //         return callback(ENOENT());
                //     callback(null, fileConets(data), fileConets(metadata));
                // });
                // return { abort: function() { clearTimeout(timer); } };
            },

            // Wrapper around fs.watch or fs.watchFile
            watch: watcher.watch,
            unwatch: watcher.unwatch,

            // Network connection
            connect: noop,

            // Process Management
            spawn: silent,
            pty: silent,
            tmux: silent,
            execFile: silent,
            killtree: silent,

            // Extending the API
            use: silent,
            extend: silent,
            unextend: silent,

            isIdle: function() { return true },
        });

        register(null, {
            "vfs": plugin,
            "vfs.ping": {},
            "vfs.log": {
                log: function() {}
            },
            "vfs.endpoint": {
                clearCache: function() {}
            }
        });
    }
});
