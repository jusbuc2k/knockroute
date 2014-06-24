/// <reference path="http://ajax.aspnetcdn.com/ajax/knockout/knockout-3.0.0.js" />

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


    
    function Route(route, defaults) {
        /// <param name="route" type="String"/>
        /// <param name="options" type="Object"/>
        var namePattern = '[\\w\\.\\-]+';
        var safeRegex = /[\\\+]/gi;        
        var elementsRegex = /\{([\w:\.\-]+)\}/gi;

        var foo = fromString(route);

        this.route = route;
        this.elements = foo.keys;
        this.regex = foo.regex;        
        this.defaults = defaults || {};

        function fromString(route) {
            /// <param name="route" type="String">route string</param>            
            var r = '^';

            route = route.replace(safeRegex, '\\$&');

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

            if (names.length <= 0) {
                r = null;
            } else {
                r += route.replace(elementsRegex, '(' + namePattern + ')');
                r += '.*';
            }

            return { regex: r, keys: names };
        }
    }

    kr.Route = Route;

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

        return values;
    };

    Route.prototype.resolve = function (routeValues) {
        /// <param name="routeValues" type="Object"/>
        var path = this.route;

        routeValues = kr.utils.defaults(this.defaults, routeValues);

        for (var i = this.elements.length - 1; i >= 0; i--) {
            if (routeValues.hasOwnProperty(this.elements[i].name)) {
                path = path.substr(0, this.elements[i].index) + routeValues[this.elements[i].name] + path.substr(this.elements[i].index + this.elements[i].length);
            }
        }

        return path;
    }

    //#endregion
    
    
    ///#Default Providers

    function HashRouteValuesProvider(options) {
        var self = this;

        self.routeValuesChanged = new ko.subscribable();
                        
        self.setRouteValues = function (routeValues) {
            window.location.hash = '#' + serializeRouteValues(routeValues);
        };

        self.getRouteValues = function () {
            return parseRouteValues(window.location.hash);
        };

        function hashChanged() {
            self.routeValuesChanged.notifySubscribers(parseRouteValues(window.location.hash));
        }

        // subscribe to the hashchange event if useRouteValues
        if (window.addEventListener) {
            window.addEventListener('hashchange', hashChanged, false);
        } else if (window.attachEvent) {
            window.attachEvent('onhashchange', hashChanged);
        } else {
            throw 'No hash change event subscription method available.';
        }

        function parseRouteValues(value) {
            /// <summary>Route values</summary>
            /// <param name="value" type="String">Route values in the form name=value</param>
            var pairs = {};
                        
            var regex = /#?(\/(\w+)\/)?(.*)?/;
            var matches = regex.exec(value);
            var query = '';

            if (matches) {
                pairs.view = matches[2];
                query = matches[3];
            } else {
                query = value;
            }

            if (typeof (query) !== 'undefined' && query) {
                var tokens = (query).split('&');
                var pair;
                for (var i = 0; i < tokens.length; i++) {
                    pair = tokens[i].split("=");
                    if (pair.length === 2) {
                        pairs[pair[0]] = pair[1];
                    }
                }
            }

            return pairs;
        }

        function serializeRouteValues(routeValues) {
            ///<param name="routeValues" type="Object"></param>
            var s = '';
            var first = true;
            var viewKey = 'view';

            if (routeValues[viewKey]) {
                s += '/' + routeValues[viewKey] + '/';
            }

            for (var key in routeValues) {
                if (routeValues.hasOwnProperty(key) && key !== viewKey) {
                    if (this[key] !== null) {
                        if (!first) {
                            s += '&';
                        }
                        s += key + '=' + routeValues[key];
                        first = false;
                    }
                }
            }
            return s;
        }
    }

    function DomTemplateProvider() {
        var self = this;
    }

    DomTemplateProvider.prototype.loadTemplate = function (templateName, callback) {
        ///<summary>Loads an HTML template.</summary>
        ///<param name="templateName" type="String">The id of the script element containing the template contents or reference</param>
        ///<param name="callback" type="Function" optional="true">A callback function to execute when the template is loaded.</param>
        var template = window.document.getElementById(templateName);

        if (!template) {
            throw 'Unable to load template with id ' + templateName;
        }

        var templateSrc = template.getAttribute("data-src");

        if (templateSrc) {
            $.get(templateSrc).done(function (content, status, ctx) {
                var persistent = (template.getAttribute("data-persist") === 'true');
                if (status === 'success') {
                    if (persistent) {
                        template.removeAttribute("data-src");
                    }
                    template.text = content;
                    callback(true, ctx.status, function () {
                        if (!persistent) {
                            template.text = '';
                        }
                    });
                } else {
                    callback(false, ctx.status);
                }
            }).fail(function (ctx, status, statusText) {
                callback(false, ctx.status);
            })
        } else {
            callback(true, 200, function () { });
        }
    };

    ///#endregion
    
    ///#region Template Router
   
    function ViewRouter(options) {
        /// <summary>Used to dynamically bind view models to views based on changes in the browser URL.</summary>
        /// <param name="options" type="Object"></param>
        var self = this;

        var defaults = {
            // Do not trigger first routeChanged() until init() is manually invoked.
            delayInit: true,
            // Indicates whether the router will respond to and set route values
            useRouteValues: true
        };

        var isInitialized = false;
        var currentView = ko.observable({
            data: {},
            name: ''
        });

        function setCurrent(viewName, model, templateName, routeValues) {
            currentView({
                model: model,
                templateName: templateName,
                viewName: viewName,
                routeValues: routeValues
            });
        }
        
        kr.utils.defaults(defaults, options);

        // Hook for unit testing 
        self.routeProvider = options.routeProvider || new HashRouteValuesProvider();

        // Hook for unit testing
        self.templateProvider = options.templateProvider || new DomTemplateProvider();

        // Gets a list of the configured views. Views should be added using addView()
        self.views = [];

        // Gets the current view information (template, model, route values, etc)
        self.view = ko.computed(function() {
            return currentView();
        });

        
        
        // Gets an object that persists view data during route changes.
        self.viewData = {};

        // Gets or sets a flag that indicates if the next route change event should be ignored.
        self.suppressNextRouteChange = false;

        // Initializes the router by triggering the first routeChanged event.
        self.init = function () {
            if (!isInitialized) {
                routeChanged();
                isInitialized = true;
            }
        };

        /// #region Events 

        self.loading = new Event();

        self.loaded = new Event();

        self.routeChanging = new Event();

        /// #endregion

        // event handler for the window hashchange event
        function routeChanged() {
            if (!options.useRouteValues) {
                return false;
            }

            if (self.suppressNextRouteChange) {
                self.suppressNextRouteChange = false;
                return false;
            }

            var routeValues = self.routeProvider.getRouteValues();
            var view = _(self.views).chain().filter(function (x) { return x.viewName === routeValues.view; }).first().value();
            
            if (!view) {
                view = self.views[0];
            }

            if (view == null) {
                throw 'No views are registered.';
            }

            var model;
            if (self.currentViewName() === view.viewName && self.currentTemplate()) {
                model = self.currentTemplate().data;
            } else {
                model = createModel(view, self.viewData, routeValues);
            }

            self.setTemplate(view.templateName, model, true, function (modelInstance) {

                setCurrent(view.viewName, model, view.templateName, routeValues);

                if (view.singleton) {
                    view.modelInstance = modelInstance;
                }
            });
        }

        if (options.useRouteValues) {
            self.routeProvider.onRouteValuesChanged.subscribe(routeChanged)
        }

        // subscribe to the template change (before change), and dipose the old template
        self.currentTemplate.subscribe(function (oldTemplate) {
            if (oldTemplate) {
                if (typeof oldTemplate.dispose === 'function') {
                    oldTemplate.dispose();
                }
            }
        }, null, 'beforeChange');

        // create view entries from the initialization options
        if (options.views && options.views.length) {
            _(options.views).forEach(function (view) {
                self.addView(view.viewName, view.templateName, view.model, view.singleton, view.args);
            });
        }

        // Set the current template and model from the initialization options
        if (options.templateName && options.model) {
            this.setTemplate(options.templateName, options.model);
        }

        // Creates a new instance of the model for a view or returns an existing instance for singletons.
        function createModel(view, viewData, routeValues) {
            var model = viewData.model;

            if (view.modelInstance && !view.modelInstance.disposed) {
                model = view.modelInstance;
            }

            if (model == null) {
                if (view && typeof (view.model) === 'function') {
                    if (typeof (options.dependencyResolver) !== 'undefined' && typeof (options.dependencyResolver.createObject) === 'function') {
                        model = options.dependencyResolver.createObject(view.model, _({ $router: self, $routeValues: routeValues }).extend(view.args));
                    } else {
                        model = {};
                        view.model.apply(model, [self, routeValues]);
                    }
                } else if (view && typeof (view.model) === 'object') {
                    model = view.model;
                }
            }

            return model;
        }
    }

    ViewRouter.prototype.addView = function (viewName, templateName, model, singleton, args) {
        /// <summary>Registers a new view with the router.</summary>
        this.views.push({
            viewName: viewName,
            templateName: templateName,
            model: model,
            singleton: singleton,
            args: args
        });
    };

    ViewRouter.prototype.addViews = function (views) {
        /// <summary>Registers a new view with the router.</summary>
        /// <param name="views" type="Array">An array of views</param>
        var self = this;
        _(views).each(function (v) {
            self.views.push(v);
        });
    };

    ViewRouter.prototype.setTemplate = function (templateName, model, reloadModel, callback) {
        /// <summary>Sets the current template and model, optionally reloading model.</summary>
        /// <param name="templateName" type="String">The element ID of the template which will be bound to the given model.</param>
        /// <param name="model" type="Object">An instance of a View Model to bind the template to.</param>
        /// <param name="reloadModel" type="Boolean" optional="true">Specify true if the model should be reloaded before binding, not specified or false otherwise.</param>
        /// <param name="callback" type="Function" optional="true">Function invoked when loadTemplate and loadModel are complete.</param>

        var self = this;
        var callCount = 0;
        var onDispose;

        if (templateName == null) {
            self.currentTemplate({ name: null, data: null });
        }

        var applyTemplate = function () {
            callCount++;
            if (callCount >= 2) {
                self.currentTemplate({
                    name: templateName,
                    data: model,
                    dispose: function () {
                        if (typeof onDispose === 'function') {
                            onDispose();
                        }
                    }
                });
                self.onLoaded.dispatch(self, [true]);
                if (typeof callback === 'function') {
                    callback(model);
                }
            }
        };

        this.onLoading.dispatch(this);

        if (self.currentTemplate() && templateName === self.currentTemplate().name) {
            onDispose = self.currentTemplate().dispose;
            self.currentTemplate().dispose = function () { };
            applyTemplate();
        } else {
            self.templateProvider.loadTemplate(templateName, function (status, statusCode, disposalFunction) {
                if (status) {
                    applyTemplate();
                    onDispose = disposalFunction;
                } else {
                    self.onLoaded.dispatch(self, [false]);
                    throw 'Failed to load template. The loadTemplate method returned a status code of ' + statusCode + '.';
                }
            });
        }

        if (reloadModel === true) {
            loadModel(model, this.currentRouteValues(), self).done(function () {
                applyTemplate();
            }).fail(function (e) {
                self.onLoaded.dispatch(self, [false]);
                throw 'Failed to load view model.';
            });
        } else {
            applyTemplate();
        }
    };

    ViewRouter.prototype.navigateView = function (view, routeValues, model) {
        /// <summary>Sets the current template by navigating the browser using the URL hash, optionally specifying a view model instance to bind.</summary>
        /// <param name="view" type="String">The name of a view.</param>
        /// <param name="routeValues" type="Object">Name/Value pairs to use as as the hash tag query.</param>
        /// <param name="model" type="Object">If specified, the given model will be stored in viewData and used as the model to bind to the given view name.</param>
        if (model) {
            this.viewData.model = model;
        }

        this.routeProvider.setRouteValues(_(routeValues || {}).extend({ view: view }));
    };

    ViewRouter.prototype.getViewUrl = function (view, routeValues) {
        /// <summary>Gets the URL to the given view, optionally specifying route values.</summary>
        /// <param name="view" type="String">The name of a view.</param>
        /// <param name="routeValues" type="Object">Name/Value pairs to use as as the hash tag query.</param>

        return '#' + serializeRouteValues(_(routeValues || {}).extend({ view: view }));
    };

    ///#endregion
    

})(window, ko);