/// <reference path="http://ajax.aspnetcdn.com/ajax/knockout/knockout-3.0.0.js" />
/// <reference path="http://code.jquery.com/jquery-1.11.0.min.js" />

; (function (global, ko) {
    
    var _kr = global.kr;
    var kr = global.kr = global.kr || {};

    kr.noConflict = function () {
        global.kr = _kr;
        return kr;
    };

    kr.utils = kr.utils || {};

    kr.utils.defaults = function (defaults, options) {
        for (var key in defaults) {
            if (!options.hasOwnProperty(key) && typeof options[key] === 'undefined' && typeof defaults[key] !== 'undefined') {
                options[key] = defaults[key];
            }
        }
        return options;
    };

    kr.utils.parseQueryString = function (path) {
        var pairs = {};

        var idx = (path || '').indexOf('?');
        var count = 0;
        if (idx > 0) {
            path = path.substr(idx + 1);
        } else {
            return null;
        }       

        if (typeof (path) !== 'undefined') {
            var tokens = path.split('&');
            var pair;
            for (var i = 0; i < tokens.length; i++) {
                pair = tokens[i].split("=");
                if (pair.length === 2) {
                    pairs[pair[0]] = pair[1];
                    count++;
                }
            }
        }

        if (count > 0) {
            return pairs;
        } else {
            return null;
        }
    }

    kr.utils.serializeQueryString = function (hashTable) {
        var pairs = [];
        for (var key in hashTable) {
            if (hashTable.hasOwnProperty(key)) {
                pairs.push(key + '=' + hashTable[key]);
            }
        }
        return '?'+pairs.join('&');
    }

    kr.utils.nowOrThen = function(result, success, fail) {
        if (typeof result === 'boolean') {
            if (result) {
                success();
            } else {
                fail();
            }
        } else if (typeof result === 'object' && typeof result.done === 'function') {
            result.done(success).fail(fail);
        } else if (typeof result === 'object' && typeof result.then === 'function') {
            result.then(success, fail);
        } else {
            fail();
        }
    };

    kr.utils.attachEvent = function (element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + event, handler);
        } else {
            throw 'No event subscription method available.';
        }
    }

    kr.utils.detachEvent = function (element, event, handler) {
        if (element.removeEventListener) {
            element.removeEventListener(event, handler, false);
        } else if (element.detachEvent) {
            element.detachEvent('on' + event, handler);
        } else {
            throw 'No event subscription method available.';
        }
    }
        
    function Route(route, defaults, options) {
        /// <param name="route" type="String"/>
        /// <param name="options" type="Object"/>

        var defaultOptions = {
            parseQueryString: true
        };

        this.options = kr.utils.defaults(defaultOptions, options || {});

        var keyValuePattern = '[\\w\\.\\-\\$\\s\\{\\}\\|\\^\\*\\(\\)\\[\\]]+';
        var safeRegex = /[\\\+\.]/gi;
        var elementsRegex = /\{([\w:]+)\}/gi;

        var foo = fromString(route);

        this.route = route;
        this.elements = foo.keys;
        this.regex = foo.regex;        
        this.defaults = defaults || {};
               
        function fromString(route) {
            /// <param name="route" type="String">route string</param>            
            var r = '^';

            var names = [];
            var res;
            var parts;
            while ((res = elementsRegex.exec(route)) !== null) {
                parts = res[1].split(':');
                if (parts.length === 2) {
                    names.push({
                        name: parts[0],
                        type: parts[1],
                        index: res.index,
                        length: res[0].length
                    });
                } else {
                    names.push({
                        name: res[1],
                        type: 'string',
                        index: res.index,
                        length: res[0].length
                    });
                }
            }

            route = route.replace(safeRegex, '\\$&');
            route = route.replace(/\*/gi, '.*');

            if (names.length <= 0) {
                r = null;
            } else {
                r += route.replace(elementsRegex, '(' + keyValuePattern + ')');
                r += '\\??.*';
            }

            return { regex: r, keys: names };
        }
    }


    //#region Statics

    Route.parseKeyValue = function (value, type) {
        switch (type) {
            case 'float': return parseFloat(value);
            case 'int': return parseInt(value, 10);
            case 'hex': return parseInt(value, 16);
            default: return value;
        }
    }

    //#endregion

    //#region Instance Methods

    Route.prototype.match = function (path) {
        return new RegExp(this.regex, 'gi').test(path);
    };

    Route.prototype.matchKeys = function (routeValues) {
        var count = 0;      

        for (var i = 0; i < this.elements.length; i++) {
            if (routeValues.hasOwnProperty(this.elements[i].name)) {
                count++;
            }
        }

        return count;
    };

    Route.prototype.extractRouteValues = function (path) {
        var values = {};
        var res;
        var idx = 0;
        var regex = new RegExp(this.regex, 'gi');

        var res = regex.exec(path);

        if (res != null) {
            for (var i = 1; i < res.length; i++) {
                values[this.elements[idx].name] = Route.parseKeyValue(res[i], this.elements[idx].type);
                idx++;
            }
        }

        if (this.options.parseQueryString) {
            var qs = kr.utils.parseQueryString(path);
            if (qs) {
                kr.utils.defaults(qs, values);
            }
        }

        return values;
    };

    Route.prototype.resolve = function (routeValues) {
        /// <param name="routeValues" type="Object"/>
        var path = this.route;

        var keys = [];
        var used = [];

        routeValues = kr.utils.defaults(this.defaults, routeValues);

        for (var key in routeValues) {
            if (routeValues.hasOwnProperty(key)) {
                keys.push(key);
            }
        }

        for (var i = this.elements.length - 1; i >= 0; i--) {
            if (routeValues.hasOwnProperty(this.elements[i].name)) {
                path = path.substr(0, this.elements[i].index) + routeValues[this.elements[i].name] + path.substr(this.elements[i].index + this.elements[i].length);
                used.push(this.elements[i].name);
            }
        }
        
        if (this.options.parseQueryString && used.length < keys.length){
            var queryString = {};

            for (var key in routeValues) {
                if (routeValues.hasOwnProperty(key) && used.indexOf(key) < 0) {
                    queryString[key] = routeValues[key];
                }
            }

            path += kr.utils.serializeQueryString(queryString);
        }

        return path;
    }

    kr.Route = Route;

    //#endregion
        
    //#Default Providers

    function HashPathStringProvider() {
        var self = this;
        var lastPath = '';

        self.pathChanged = new ko.subscribable();
                        
        self.setPath = function (path) {            
            window.location.hash = '#' + path;
        };

        self.getPath = function () {
            return window.location.hash.slice(1);
        };

        self.start = function () {
            // subscribe to the hashchange event if useRouteValues
            kr.utils.attachEvent(window, 'hashchange', hashChanged);            
            hashChanged();
        };

        self.stop = function () {
            // subscribe to the hashchange event if useRouteValues
            kr.utils.detachEvent(window, 'hashchange', hashChanged);
        };

        self.revert = function (callback) {
            self.setPath(lastPath);
            window.setTimeout(callback, 20);
        };
               
        function hashChanged() {
            path = self.getPath();
            self.pathChanged.notifySubscribers(path);
            lastPath = path;
        }
    }

    kr.HashPathStringProvider = HashPathStringProvider;


    function HistoryPathStringProvider(options) {
        var self = this;
        var lastPath = '';

        var defaultOptions = {
            basePath: '^'
        };

        options = kr.utils.defaults(defaultOptions, options || {});

        self.pathChanged = new ko.subscribable();

        self.setPath = function (path) {
            window.history.pushState({}, '', extractBase(window.location.pathname) + path);
            self.pathChanged.notifySubscribers(path);
        };

        self.getPath = function () {
            return stripBase(window.location.pathname);
        };

        self.start = function () {
            // subscribe to the hashchange event if useRouteValues
            kr.utils.attachEvent(window, 'popstate', handlePopState);
            handlePopState();
        };

        self.stop = function () {
            // subscribe to the hashchange event if useRouteValues
            kr.utils.detachEvent(window, 'popstate', handlePopState);            
        };

        self.revert = function (callback) {
            self.setPath(lastPath);
            window.setTimeout(callback, 20);
        };

        function extractBase(path) {
            var regex = new RegExp(options.basePath, 'gi');
            var res;
            if (res = regex.exec(path)) {
                return res[0];
            } else {
                return '';
            }            
        }

        function stripBase(path) {
            var regex = new RegExp(options.basePath, 'gi');
            var res;
            if (res = regex.exec(path)) {
                return path.substr(res[0].length);
            } else {
                return path;
            }
        }
               
        function handlePopState() {
            var path = self.getPath();
            self.pathChanged.notifySubscribers(path);
            lastPath = path;
        }
    };

    kr.HistoryPathStringProvider = HistoryPathStringProvider;

    function DefaultModelFactory() {
        var self = this;
    };

    DefaultModelFactory.prototype.createModel = function (constructor, args) {        
        if (typeof constructor === 'function') {
            function Wrapper() {
                return constructor.apply(this, args);
            };

            Wrapper.prototype = constructor.prototype;

            return new Wrapper();
        } else {
            throw 'constructor must be a valid constructor function.'
        }
    };  

    function jQueryTemplateProvider() {
        var self = this;

        if (typeof jQuery === 'undefined') {
            throw 'jQuery is required to use the DomTemplateProvider';
        }
    }

    jQueryTemplateProvider.prototype.loadTemplate = function (templateID, completeCallback) {
        ///<summary>Loads the contents of an HTML template defined as a &lt;script&gt; block from a remote source.</summary>
        ///<param name="templateID" type="String">The id of the &lt;script&gt; element containing the template contents or reference</param>
        ///<param name="completeCallback" type="Function" optional="true">A callback function to execute when the template is loaded.</param>
        var template = window.document.getElementById(templateID);

        if (!template) {
            throw 'There is no element with id ' + templateID + '.';
        }

        if (template.tagName.toLowerCase() !== 'script'){
            throw 'The element with id ' + templateID + ' must be a <script> tag in order to use it as a template.';
        }

        var dataSrc = template.getAttribute("data-src");
        var dataLoaded = template.getAttribute("data-loaded");

        // As it turns out, this isn't the business of the loader at all.
        //var dataPersist = (dataSrc == null || (template.getAttribute("data-persist")||'').toLowerCase().trim() === 'true');

        var response = {
            success: false,
            statusCode: 0,
            template: template            
        };

        if (dataSrc && !dataLoaded) {
            jQuery.get(dataSrc).done(function (content, status, ctx) {
                template.text = content;
                template.setAttribute("data-loaded", "true");
                response.success = true;
                response.statusCode = ctx.status
                completeCallback(response);
            }).fail(function (ctx, status, statusText) {
                response.success = false;
                response.statusCode = ctx.status;
                completeCallback(response);
            });
        } else {
            response.success = true;
            response.statusCode = 203;
            completeCallback(response);
        }
    };

    jQueryTemplateProvider.prototype.unloadTemplate = function (template) {
        /// <signature>
        /// <summary>Unloads a template with the given ID.</summary>
        /// <param name="template" type="String"></param>
        /// </signature>
        /// <signature>
        /// <summary>Unloads a template specified by the given HTML element.</summary>
        /// <param name="template" type="HTMLScriptElement">A string.</param>       
        /// </signature>
                
        if (typeof template === 'string') {
            template = window.document.getElementById(template);
        }

        if (!(template instanceof HTMLScriptElement)) {
            throw 'The \'template\' parameter must be an element ID or an HTMLScriptElement';
        }

        template.text = '';
    };

    if (typeof jQuery !== 'undefined') {
        kr.jQueryTemplateProvider = jQueryTemplateProvider;
    }

    function View(name, model, templateID, singleton) {
        var self = this;
        self.name = name;
        self.model = model;
        self.modelInstance = null;
        self.templateID = templateID;
        self.singleton = singleton;
    }

    View.prototype.loadModel = function (routeValues, callback) {
        var self = this;
        if (typeof this.modelInstance === 'object' && typeof this.modelInstance.load === 'function') {
            kr.utils.nowOrThen(this.modelInstance.load(routeValues), function () {
                callback(true);
            }, function () {
                callback(false);
            });
        } else {
            callback(true);
        }
    };

    View.prototype.unloadModel = function (force, callback) {
        var self = this;

        function done(status) {
            if ((model.singleton && force) || status) {
                if (typeof self.modelInstance.dispose === 'function') {
                    self.modelInstance.dispose();
                }
                self.modelInstance = null;
                callback(true);
            } else {
                callback(false);
            }            
        }

        if (this.modelInstance != null && typeof this.modelInstance.unload === 'function') {           
            kr.utils.nowOrThen(this.modelInstance.unload(), function () {
                done(true);
            }, function () {
                done(false);
            });
        } else if (force) {
            self.modelInstance = null;
            callback(true);
        } else {
            callback(true);
        }
    };
        
    kr.View = View;
    
    //#endregion
    
    //#region View Router
   
    function ViewRouter(options) {
        /// <summary>Used to dynamically bind view models to views based on changes in the browser URL.</summary>
        /// <param name="options" type="Object"></param>
        var self = this;

        var defaultOptions = {            
            defaultRoute: '/{view}/{id}',
            defaultRouteValues: {
                view: 'index'                
            },
            viewRouteKey: 'view',
            pathProvider: 'hash',
            templateProvider: 'jQuery'
        };

        var defaultView = new kr.View('',{}, '', null, false);            

        kr.utils.defaults(defaultOptions, options);

        //#region Privates

        var currentView = ko.observable(defaultView);

        function setCurrent(view, routeValues, cancel) {
            var hit = 0;
            var model = view.modelInstance || view.model || {};

            if (view !== currentView()) {
                currentView().unloadModel(false, function (status) {
                    if (!status) {
                        cancel();
                    }
                });
            }

            if (typeof model === 'function') {
                view.modelInstance = self.modelFactory.createModel(model, [self, routeValues]);
            }
            
            function apply() {
                hit++;
                if (hit == 2) {
                    currentView(view);
                }
            }            

            view.loadModel(routeValues, function (status) {
                if (status) {
                    apply();
                } else {
                    throw "The model for view '" + view.name + "' failed to load.";
                }
            });
            
            self.templateProvider.loadTemplate(view.templateID, function (response) {
                if (response.success) {
                    apply();
                } else {
                    throw "The template for view '" + view.name + "' failed to load with status: " + response.statusCode;
                }
            });            
        }

        function getFirstMatchingRoute(path) {
            for (var i = 0; i < self.routes.length; i++) {
                if (self.routes[i].match(path)) {
                    return self.routes[i];
                }
            }
            return self.routes[-1];
        }

        function getFirstMatchingView(viewName) {
            for (var i = 0; i < self.views.length; i++) {
                if (self.views[i].name === viewName) {
                    return self.views[i];
                }
            }
            return null;
        }

        function onPathChanged(path) {
            /// <param name="path" type="String"></param>
            var route = getFirstMatchingRoute(path);
            var routeValues;

            if (route) {
                routeValues = route.extractRouteValues(path);
            } else {
                routeValues = options.defaultRouteValues;
            }

            var view = getFirstMatchingView(routeValues[options.viewRouteKey]);
                        
            if (view == null) {
                //TODO: make this not suck
                throw 'No view available.'
            }
                                   
            setCurrent(view, routeValues, function () {
                self.pathProvider.stop();
                self.pathProvider.revert(function () {
                    self.pathProvider.start();
                });                
            });
        }

        //#endregion

        //#region Properties

        self.routes = [
            new kr.Route(options.defaultRoute, options.defaultRouteValues)
        ];

        // Gets or sets the list of views
        self.views = [];

        self.view = ko.computed(function () {
            return currentView();
        });

        if (options.views && options.views.length) {
            self.views = self.views.concat(options.views);
        }
        
        self.routeValues = ko.computed(function () {
            return currentView().routeValues;
        });

        if (typeof options.pathProvider === 'object') {
            self.pathProvider = options.pathProvider;
        } else if (options.pathProvider === 'history') {
            self.pathProvider = new kr.HistoryPathStringProvider(options.basePath);
        } else {
            self.pathProvider = new kr.HashPathStringProvider();
        }
        
        if (typeof options.templateProvider === 'object') {
            self.templateProvider = options.templateProvider;
        } else {
            self.templateProvider = new kr.jQueryTemplateProvider();
        }
       
        self.modelFactory = new DefaultModelFactory();

        self.dispose = function () {
            self.pathProvider.stop();
            for (var i = 0; i < self.views.length; i++) {
                self.views[i].unloadModel(true);
            }
            pathChangedEvent.dispose();
        };
                
        //#endregion

        //#region Init

        onPathChanged(self.pathProvider.getPath());

        // begin watching for path changes

        var pathChangedEvent = self.pathProvider.pathChanged.subscribe(onPathChanged);
        self.pathProvider.start();

        //#endregion
    }

    kr.ViewRouter = ViewRouter;

    //#endregion    

})(window, ko);