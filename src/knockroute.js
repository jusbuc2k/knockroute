/// <reference path="http://ajax.aspnetcdn.com/ajax/knockout/knockout-3.0.0.js" />
/// <reference path="http://code.jquery.com/jquery-1.11.0.min.js" />

; (function (global, ko) {
    
    var _kr = global.kr;
    var kr = global.kr = global.kr || {};

    kr.noConflict = function () {
        global.kr = _kr;
        return kr;
    };

    //#region Defaults

    kr.utils = kr.utils || {};

    kr.utils.defaults = function (defaults, options) {
        for (var key in defaults) {
            if (!options.hasOwnProperty(key) && typeof options[key] === 'undefined' && typeof defaults[key] !== 'undefined') {
                options[key] = defaults[key];
            }
        }
        return options;
    };

    kr.utils.parseQueryString = function (query) {
        var pairs = {};

        var idx = (query || '').indexOf('?');
        var count = 0;
        if (idx >= 0) {
            query = query.slice(idx + 1);
        }      

        if (typeof (query) !== 'undefined') {
            var tokens = query.split('&');
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

    kr.utils.serializeQueryString = function (nvc) {        
        var pairs = [];
        for (var key in nvc) {
            if (nvc.hasOwnProperty(key)) {
                pairs.push(key + '=' + nvc[key]);
            }
        }
        return pairs.join('&');
    }

    kr.utils.nowOrThen = function(result, success, fail) {
        if (typeof result === 'boolean') {
            if (result) {
                success();
            } else {
                fail();
            }
        } else if (result != null && typeof result.done === 'function') {
            result.done(success).fail(fail);
        } else if (result != null && typeof result.then === 'function') {
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

    //#endregion

    //#region pseudo-constants

    var keyValuePattern = '[\\w\\.\\-\\$\\s\\{\\}\\|\\^\\*\\(\\)\\[\\]]+';
    var safeRegex = /[\\\+\.]/gi;
    var elementPattern = '\\{(\\w+)(:\\w+)?(\\??)\\}';
    var literalRegex = /[\\w\\+\\.\\-]+'/i;

    //#endregion

    //#region Route

    Route.parseKeyValue = function (value, type) {
        switch (type) {
            case 'float': return parseFloat(value);
            case 'int': return parseInt(value, 10);
            case 'hex': return parseInt(value, 16);
            default: return value;
        }
    }

    Route.parseTemplate = function (routeTemplate, pathSeperator) {
        /// <param name="route" type="String">route string</param>            
        var routeSegments = [];
        var templateSegments;
        var hasOptional = false;

        if (routeTemplate.indexOf(pathSeperator) === 0) {
            routeTemplate = routeTemplate.slice(pathSeperator.length);
        }

        templateSegments = routeTemplate.split(pathSeperator);

        for (var i = 0; i < templateSegments.length; i++) {
            if (templateSegments[i]) {
                var tmp;
                var segParts = [];
                var reg = new RegExp(elementPattern, 'gi');

                while (tmp = reg.exec(templateSegments[i])) {
                    segParts.push(tmp);
                }

                if (segParts.length === 1) {
                    var optional = false;
                    routeSegments.push({
                        value: templateSegments[i],
                        parts: [{
                            name: segParts[0][1],
                            optional: optional = (segParts[0][3] === '?'),
                            type: 'variable',
                            dataType: (segParts[0][2] || ':string').slice(1)
                        }]
                    });
                    if (hasOptional && !optional) {
                        throw 'Invalid route template: A required segment cannot follow an optional one.';
                    }
                    hasOptional = hasOptional || optional;
                } else if (segParts.length > 1) {
                    throw 'Invalid route template: Multi-part route segments are not implemented';
                } else if (literalRegex.test(templateSegments[i])) {
                    routeSegments.push({
                        value: templateSegments[i],
                        parts: [
                            { name: templateSegments[i], optional: false, type: 'literal', dataType: 'string' }
                        ]
                    });
                } else if (templateSegments[i] === '*') {                    
                    routeSegments.push({
                        value: templateSegments[i],
                        parts: [
                            { name: templateSegments[i], optional: false, type: 'wildcard', dataType: 'string' }
                        ]
                    });
                } else {
                    throw "Invalid route template: The segment value '" + templateSegments[i] + "' is invalid.";
                }
            }
        }

        return routeSegments;
    };
        
    function Route(routeTemplate, options) {
        /// <param name="route" type="String"/>
        /// <param name="options" type="Object"/>
        var self = this;
        var defaultOptions = {
            pathSeperator: '/'
        };

        options = this.options = kr.utils.defaults(defaultOptions, options || {});
               
        this.routeTemplate = routeTemplate;
        this.elements = Route.parseTemplate(routeTemplate, options.pathSeperator);
    }
       
    Route.prototype.match = function (path, defaultValues) {
        /// <param name="path" type="String"/>
        /// <param name="defaultValues" type="Object"/>               
        var pathSegments;
        var pathSegment;
        var routeSegment;
        var routeValues = {};

        if (path == null) {
            throw 'A value for path must be specified.';
        }

        if (path.indexOf(this.options.pathSeperator) === 0) {
            path = path.slice(this.options.pathSeperator.length);
        }

        var queryIndex = -1;
        if ((queryIndex = path.indexOf('?')) >= 0) {
            path = path.slice(0, queryIndex);
        }

        pathSegments = path.split(this.options.pathSeperator);
                                        
        for (var i = 0; i < pathSegments.length; i++) {
            pathSegment = pathSegments[i];
            routeSegment = this.elements.length > i ? this.elements[i] : null;

            if (routeSegment == null) {
                // we are out of route segments, so there is nothing left to match, so give up.
                if (pathSegment.length > 0) {
                    return null;
                }
            } else if (routeSegment.parts.length === 1) {
                var part = routeSegment.parts[0];
                if (part.type === 'literal') {
                    if (part.name !== pathSegment) {
                        return null;
                    }
                } else if (part.type === 'wildcard') {
                    // nothing to do
                } else if (part.type === 'variable' && pathSegment.length > 0) {
                    routeValues[part.name] = Route.parseKeyValue(pathSegment, part.dataType);
                } else if (part.type === 'variable') {
                    var defaultValue;
                    if (defaultValues && (defaultValue = defaultValues[part.name])) {
                        routeValues[part.name] = defaultValue;
                    } else if (part.optional) {
                        // nothing to do since it's optional
                    } else {
                        return null;
                    }
                } else {
                    // invalid route segment part
                    return null;
                }
            } else {
                throw 'Multi-part route segments are not implemented';
            }
        }

        return routeValues;
    };

    Route.prototype.resolve = function (routeValues, currentPath) {
        /// <param name="routeValues" type="Object"/>
        /// <param name="defaultValues" type="Object" optional="true"/>
        /// <param name="currentPath" type="String" optional="true"/>
        var pathParts = [];

        var currentPathSegements;
        var currentSegment;
        var routeSegment;
        var routePart;

        if (currentPath != null) {
            if (currentPath[0] === this.options.pathSeperator) {
                currentPath = currentPath.slice(1);
            }
            currentPathSegements = currentPath.split(this.options.pathSeperator);
        }

        for (var i = 0; i < this.elements.length; i++) {
            routeSegment = this.elements[i];
            currentSegment = currentPathSegements ? currentPathSegements[i] : null;

            if (routeSegment.parts.length === 1) {
                routePart = routeSegment.parts[0];
                if (routePart.type === 'wildcard') {
                    if (currentSegment && currentSegment.length > 0) {
                        pathParts.push(currentSegment);
                    } else {
                        return null;
                    }
                } else if (routePart.type === 'literal') {
                    pathParts.push(routePart.name);
                } else if (routePart.type === 'variable') {
                    if (routeValues.hasOwnProperty(routePart.name)) {
                        pathParts.push(routeValues[routePart.name]);
                    } else if (routePart.optional) {

                    } else {
                        return null;
                    }
                }
            } else {
                throw 'Multi-part route segments are not supported.';
            }
        }
        //for (var i = this.elements.length - 1; i >= 0; i--) {
        //    for (var y = 0; y < this.elements[i].parts.length; y++) {
        //        if (routeValues.hasOwnProperty(this.elements[i].parts[y].name)) {
        //            path = path.replace('{' + this.elements[i].parts[y].name + '}', routeValues[this.elements[i].parts[y].name]);
        //            used.push(this.elements[i].parts[y].name);
        //        }
        //    }
        //}

        return pathParts.join(this.options.pathSeperator);
    }

    kr.Route = Route;

    //#endregion
        
    //#region Default Providers

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
            if (typeof callback === 'function') {
                window.setTimeout(callback, 20);
            }
        };
               
        function hashChanged() {
            var path = self.getPath();
            self.pathChanged.notifySubscribers(path);
            lastPath = path;
        }
    }
    
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

    jQueryTemplateProvider.prototype.getOrCreateTemplate = function (templateID, dataSrc, container) {
        var template = window.document.getElementById(templateID);

        container = container || window.document.body;

        if (template){
            return template;
        }

        template = window.document.createElement("script");
        template.type = "text/html";
        template.id = templateID;
        template.setAttribute("data-src", dataSrc);

        container.appendChild(template);
        
        return template;        
    }

    kr.HashPathStringProvider = HashPathStringProvider;
    kr.HistoryPathStringProvider = HistoryPathStringProvider;
    if (typeof jQuery !== 'undefined') {
        kr.jQueryTemplateProvider = jQueryTemplateProvider;
    }

    //#endregion

    //#region View

    function View(name, model, templateID, singleton) {
        /// <signature>
        /// <summary>Initializes a new instance of the View object with the given attributes.</summary>
        /// <param name="name" type="String">A unique name for the view that will typically show up in the URL.</param>
        /// <param name="model" type="Object">A constructor function or instance used as the view model.</param>
        /// <param name="templateID" type="String">The element id of the HTML template that will be bound to the view model.</param>
        /// <param name="singleton" type="Boolean" optional="true">True if a single instance of the view model should be maintained, false otherwise.</param>
        /// </signature>
        /// <signature>
        /// <summary>Initializes a new instance of the View object with the given attributes.</summary>
        /// <param name="attributes" type="Object"></param>
        /// </signature>
        var self = this;
        var props;
        var defaultProps = {
            singleton: false,
            templateSrc: null
        };        

        if (arguments.length === 1 && typeof name === 'object') {
            props = kr.utils.defaults(defaultProps, name);
        } else {
            props = kr.utils.defaults(defaultProps, {
                name: name,
                model: model,
                templateID: templateID,
                singleton: singleton
            });
        }       
                
        self.name = props.name;
        self.model = props.model;
        self.modelInstance = null;
        self.templateID = props.templateID;
        self.singleton = props.singleton;
        self.templateSrc = props.templateSrc;
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
            views: [],
            pathProvider: 'hash',
            templateProvider: 'jQuery',
            createTemplates: false,
            templateContainer: null
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

        function getRouteValues(path) {
            var rv;
            var qs;

            for (var i = 0; i < self.routes.length; i++) {
                if (rv = self.routes[i].match(path, options.defaultRouteValues)) {
                    break;
                }
            }

            if (rv == null) {
                return null;
            }

            qs = kr.utils.parseQueryString(path);
            rv = kr.utils.defaults(qs, rv);
                        
            return rv;
        }

        function resolve(routeValues) {

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
            var routeValues = getRouteValues(path);

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
            for (var i = 0; i < options.views.length; i++) {
                if (options.views[i] instanceof kr.View) {
                    self.views.push(options.views[i]);
                } else {
                    self.views.push(new kr.View(options.views[i]));
                }
            }
        }

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

        if (options.createTemplates) {
            for (var i = 0 ; i < self.views.length; i++) {
                if (self.views[i].templateSrc) {
                    self.templateProvider.getOrCreateTemplate(
                        self.views[i].templateID,
                        self.views[i].templateSrc,
                        options.templateContainer
                    );
                }
            }
        }

        //#endregion
    }

    kr.ViewRouter = ViewRouter;

    //#endregion    

})(window, ko);