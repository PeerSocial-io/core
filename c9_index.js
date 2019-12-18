function previewHelper(options, imports, register) {
    var fs = imports.fs;
    var tabs = imports.tabManager;
    if (typeof BroadcastChannel !== "function")
        return register();
    var bc = new BroadcastChannel("livePreview");
    bc.onmessage = function(e) {
        var data = e.data;
        var action = data && data.action;
        if (action == "getFile") {
            var path = data.path;
            var tab = tabs.findTab(path);
            var value = tab && tab.document.value;
            if (value) return done(null, value);
            fs.readFile(path, function(e, value) {
                if (e) return done(e);
                done(null, value);
            });
        }

        function done(error, value) {
            bc.postMessage({
                action: "callback",
                id: data.id,
                value: value,
                error: error && error.code,
            });
        }
    };
    register();
}

function offlineConfig(plugins) {
    var excludes = [
        "plugins/c9.ide.immediate/evaluators/debugnode",
        "plugins/c9.ide.test.mocha/mocha",
        "plugins/c9.ide.find/find.nak",
        "plugins/c9.ide.terminal/terminal",
        "plugins/c9.ide.test/all",
        "plugins/c9.ide.find/find",
        "plugins/c9.ide.terminal/link_handler",
        "plugins/c9.ide.test/coverage",
        "plugins/c9.ide.test/results",
        "plugins/c9.ide.test/testrunner",

        "plugins/c9.ide.find.infiles/findinfiles",
        "plugins/c9.ide.language.codeintel/codeintel",
        "plugins/c9.ide.language.go/go",
        "plugins/c9.ide.language.python/python",
        "plugins/c9.ide.test/coverageview",
        "plugins/c9.cli.bridge/bridge_commands",
    ];
    plugins = plugins.filter(function(p) {
        var packagePath = typeof p == "string" ? p : p.packagePath;
        if (/\/c9.ide.run/.test(packagePath)) return false;
        if (/\/c9.ide.collab/.test(packagePath)) return false;
        if (/\/c9.ide.installer/.test(packagePath)) return false;
        if (/\/c9.vfs.client/.test(packagePath)) return false;
        if (/\/c9.ide.scm/.test(packagePath)) return false;
        if (excludes.indexOf(packagePath) != -1) return false;

        if (packagePath == "plugins/c9.fs/fs")
            p.cli = true;
        if (packagePath == "plugins/c9.core/settings")
        ; // place to modify settings

        if (packagePath == "plugins/c9.ide.console/console")
            p.defaultState = { type: "pane", nodes: [] }; // prevent console from opening terminal

        return true;
    });
    plugins.push("plugins/c9.vfs.client/vfs_client_mock");
    plugins.push({
        provides: ["find", "installer"],
        consumes: [],
        setup: function(options, imports, register) {
            function noop() {}
            register(null, {
                find: { on: noop, once: noop, getFileList: noop },
                installer: {},
            });
        }
    });
    plugins.push({
        provides: [],
        consumes: ["fs", "tabManager"],
        setup: previewHelper
    });
    return plugins;
}

var start = Date.now();
/*
        var href = "/static";
*/

var href = location.href.split(/[#&]/)[0].replace(/[^\/]*$/, "");
require.MODULE_LOAD_URL = href + "build/standalone/modules";
require.config({
    paths: {
        configs: href + "configs",
        lib: href + "build/static/lib",
    }
});

var plugins;
require(["lib/architect/architect", "configs/ide/default"], function(architect, defaultConfig) {
    plugins = defaultConfig({
        staticPrefix: href,
        workspaceDir: "/",
        workspaceId: "/",
        workspaceName: "/",
        home: "/",
        platform: "linux",
        installPath: "/",
        manifest: {},
        project: {},
        user: {},
        standalone: true,
        previewUrl: "./offline.preview/index.html?u=",
        dashboardUrl: "",
        defaultTheme: "dark",
        /*
                themePrefix: "/static/standalone/skin/default",
*/

        themePrefix: href + "build/standalone/skin/default",
        CORSWorkerPrefix: href + "build/standalone/worker",

    });
    plugins = offlineConfig(plugins);

    plugins.push({
        consumes: [],
        provides: ["auth.bootstrap"],
        setup: function(options, imports, register) {
            register(null, {
                "auth.bootstrap": {
                    login: function(callback) { callback(); }
                }
            });
        }
    });

    architect.resolveConfig(plugins, function(err, config) {
        if (err) throw err;

        var errored;
        var app = architect.createApp(config, function(err, app) {
            if (err) {
                errored = true;
                console.error(err.stack);
                alert(err);
            }
        });

        app.on("error", function(err) {
            console.error(err.stack);
            if (!errored)
                alert(err);
        });

        app.on("service", function(name, plugin, options) {
            if (!plugin.name)
                plugin.name = name;
        });

        app.on("ready", function() {
            window.app = app.services;
            window.app.__defineGetter__("_ace", function() {
                return this.tabManager.focussedTab.editor.ace;
            });
            Object.keys(window.app).forEach(function(n) {
                if (/[^\w]/.test(n))
                    window.app[n.replace(/[^\w]/, "_") + "_"] = window.app[n];
            });

            done();
        });

        // For Development only
        function done() {
            var vfs = app.services.vfs;
            var c9 = app.services.c9;
            var settings = app.services.settings;

            c9.ready();
            c9.totalLoadTime = Date.now() - start;

            console.warn("Total Load Time: ", Date.now() - start);

            if (window.hideLoader) {
                var waitVfs = function(fn) {
                    vfs.connected ? fn() : vfs.once("connect", fn);
                };
                var waitSettings = function(fn) {
                    settings.inited ? fn() : settings.once("read", fn);
                };

                var waitTheme = function(fn) {
                    var layout = app.services.layout;
                    if (!layout || layout.hasTheme) return fn();
                    layout.once("eachTheme", fn);
                };
                waitSettings(waitTheme.bind(null, window.hideLoader));
            }
        }
    }, function loadError(mod) {
        if (mod.id === "plugins/c9.ide.clipboard/html5")
            return alert("Unable to load html5.js.\n\nThis may be caused by a false positive in your virus scanner. Please try reloading with ?packed=1 added to the URL.");
    });
});