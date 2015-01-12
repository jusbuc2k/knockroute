; (function (global, ko) {
    "use strict";

    var kr = {};

    function extendKo() {
        ko.route = kr;
        ko.bindingHandlers['routeTemplate'] = routerBinding;
    }

    function isTrue(element, attribute) {
        return ((element.getAttribute(attribute) || '').toLowerCase().trim() === 'true');
    }

    //#region Utils

    kr.utils = kr.utils || {};

    kr.utils.clearArray = function (array) {
        while (array.length > 0) {
            array.pop();
        }
    };

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

    kr.utils.nowOrThen = function (result) {
        return new Promise(function (resolve, reject) {
            if (typeof result === 'boolean') {
                if (result) {
                    resolve(result);
                } else {
                    reject(result)
                }
            } else if (result != null && typeof result.done === 'function') {
                result.done(function () {
                    resolve(arguments);
                }).fail(function () {
                    reject(arguments);
                });
            } else if (result != null && typeof result.then === 'function') {
                result.then(resolve, reject);
            } else if (result != null) {
                resolve(result);
            } else {
                resolve();
            }
        });       
    };

    kr.utils.attachEvent = function (element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + event, handler);
        } else {
            throw 'No event subscription method available.';
        }
    };

    kr.utils.detachEvent = function (element, event, handler) {
        if (element.removeEventListener) {
            element.removeEventListener(event, handler, false);
        } else if (element.detachEvent) {
            element.detachEvent('on' + event, handler);
        } else {
            throw 'No event subscription method available.';
        }
    };

    kr.utils.abortable = function (fn) {
        var aborted = null;

        function abortable() {
            if (aborted) {
                return Promise.reject(aborted);
            } else {
                return Promise.resolve(fn.apply(this, arguments));
            }
        }

        abortable.abort = function (reason) {
            aborted = reason;
        };

        return abortable;
    };

    var routeConstraints = {
        equals: function (test) {
            return function (value) {
                return test === value;
            };
        },
        dataType: function (dataType) {
            var regex = /.*/;

            if (dataType === 'float') {
                regex = /^[-+]?\d*\.?\d*$/i;
            } else if (dataType === 'int') {
                regex = /^[-+]?\d*$/i
            } else if (dataType === 'hex') {
                regex = /^[a-fA-F0-9]*$/i;
            }

            return function (value) {
                return regex.test(value);
            }
        }
    };

    function createConstraint(constraintExpression) {
        if (constraintExpression == null) {
            return null;
        }
        else if (constraintExpression[0] === ':') {
            return routeConstraints.dataType(constraintExpression.slice(1));
        } else if (constraintExpression[0] === '=') {
            return routeConstraints.equals(constraintExpression.slice(1));
        } else {
            return null;
        }
    }

    // Sort of like a promise, but requires that hit() be called N number of times before then callbacks are fired.
    function HitCounter(requiredCount, context) {
        this.requiredCount = requiredCount;
        this.hitCount = 0;
        this.callbacks = [];
        this.state = 'pending';
        this.context = context;
    }

    HitCounter.prototype.hit = function () {
        var i;
        this.hitCount++;
        if (this.hitCount >= this.requiredCount && this.state === 'pending') {
            this.state = 'resolved';
            for (i = 0; i < this.callbacks.length; i++) {
                if (typeof this.callbacks[i][0] === 'function') {
                    this.callbacks[i][0].call(this.context);
                }
            }
        }
    };

    HitCounter.prototype.reject = function () {
        var i;
        for (i = 0; i < this.callbacks.length; i++) {
            if (typeof this.callbacks[i][1] === 'function') {
                this.callbacks[i][1].call(this.context);
            }
        }
    };

    HitCounter.prototype.then = function (successCallback, failCallback) {
        if (this.state === 'pending') {
            this.callbacks.push([successCallback, failCallback]);
        } else if (this.state === 'resolved' && typeof successCallback === 'function') {
            successCallback.call(this.context);
        } else if (this.state === 'rejected' && typeof failCallback === 'function') {
            failCallback.call(this.context);
        }
    };

    HitCounter.prototype.abort = function () {
        this.state = 'aborted';
    };

    //#endregion

    //#region pseudo-constants

    //var keyValuePattern = '[\\w\\.\\-\\$\\s\\{\\}\\|\\^\\*\\(\\)\\[\\]]+';
    var elementPattern = '\\{(\\w+)([=:]\\w+)?(\\??)\\}';
    var literalRegex = /^[\w\+\.\-\~]+$/i;
    var queryMarker = '?';

    //#endregion

    //#region Route

    Route.parseSegmentValue = function (value, type) {
        switch (type) {
            case 'float': return parseFloat(value);
            case 'int': return parseInt(value, 10);
            case 'hex': return parseInt(value, 16);
            default: return value;
        }
    };

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

                    var dataType = (segParts[0][2] && segParts[0][2][0] === ':' ? segParts[0][2].slice(1) : 'string');

                    if (dataType === 'params') {
                        routeSegments.push({
                            value: templateSegments[i],
                            parts: [{
                                name: segParts[0][1],
                                optional: true,
                                type: 'params',
                                dataType: 'string'
                            }]
                        });
                        optional = true;
                    } else {
                        routeSegments.push({
                            value: templateSegments[i],
                            parts: [{
                                name: segParts[0][1],
                                optional: optional = (segParts[0][3] === '?'),
                                type: 'parameter',
                                constraint: createConstraint(segParts[0][2]),
                                dataType: dataType
                            }]
                        });
                    }

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
                            { name: templateSegments[i], optional: false, type: 'literal' }
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
        this.segments = Route.parseTemplate(routeTemplate, options.pathSeperator);
    }

    Route.prototype.match = function (path, defaultValues) {
        /// <param name="path" type="String"/>
        /// <param name="defaultValues" type="Object"/>     

        // This code is inspired by ASP.NET Routing from
        // https://github.com/aspnet/Routing/blob/dev/src/Microsoft.AspNet.Routing/Template/TemplateMatcher.cs

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
            routeSegment = this.segments.length > i ? this.segments[i] : null;

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
                    // nothing to do if the wildcard is not the last position
                } else if (part.type === 'parameter' && pathSegment.length > 0) {
                    if (part.constraint == null || part.constraint(pathSegment)) {
                        routeValues[part.name] = Route.parseSegmentValue(pathSegment, part.dataType);
                    } else {
                        return null;
                    }
                } else if (part.type === 'parameter') {
                    var defaultValue;
                    if (defaultValues && (defaultValue = defaultValues[part.name])) {
                        routeValues[part.name] = defaultValue;
                    } else if (part.optional) {
                        // nothing to do since it's optional
                    } else {
                        return null;
                    }
                } else if (part.type === 'params' && this.segments.length - 1 == i) {
                    // if the params is in the last position, we parse combine all remaining path segments into an array

                    routeValues[part.name] = pathSegments.slice(i);

                    // we are done processing segments
                    break;
                } else {
                    // invalid route segment part
                    return null;
                }
            } else {
                throw 'Multi-part route segments are not implemented';
            }
        }

        // We've matched the request path so far, but still have remaining route segments. These need
        // to be all single-part parameter segments with default values or else they won't match
        // because the path has no remaining segments
        for (var i = pathSegments.length; i < this.segments.length; i++) {
            routeSegment = this.segments[i];
            if (routeSegment.parts.length > 1) {
                // If it has more than one part it must contain literals, so it can't match.
                return null;
            }

            var part = routeSegment.parts[0];
            // again, a literal can't match, s
            if (part.type === 'literal') {
                return null;
            }

            // It's ok for a catch-all to produce a null value
            var defaultValue;
            if ((defaultValues && (defaultValue = defaultValues[part.name])) || part.type === 'wildcard') {
                routeValues[part.name] = defaultValue;
            }
            else if (part.optional) {
                // This is optional (with no default value) - there's nothing to capture here, so just move on.
            }
            else {
                // There's no default for this (non-catch-all) parameter so it can't match.
                return null;
            }
        }

        // Copy all remaining default values to the route data
        if (defaultValues != null) {
            for (var key in defaultValues) {
                if (defaultValues.hasOwnProperty(key) && !routeValues.hasOwnProperty(key)) {
                    routeValues[key] = defaultValues[key];
                }
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

        for (var i = 0; i < this.segments.length; i++) {
            routeSegment = this.segments[i];
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
                } else if (routePart.type === 'parameter') {
                    if (routeValues.hasOwnProperty(routePart.name)) {
                        pathParts.push(routeValues[routePart.name]);
                    } else if (currentSegment && currentSegment.length > 0 && (routePart.constraint == null || routePart.constraint(currentSegment))) {
                        // the current segment value is not given in route values, but rather given by the current path
                        // this handles the case where an area is not given on routeValues, but the current path
                        // includes the area, so that you can write router.resolve({view:'foo'}) instead of having 
                        // to write router.resolve({area:'bar',view:'foo'})
                        // when the current URL already includes the area
                        pathParts.push(currentSegment);
                    } else if (routePart.optional) {

                    } else {
                        return null;
                    }
                } else if (routePart.type === 'params' && i == this.segments.length - 1) {
                    var params = routeValues[routePart.name];
                    if (params) {
                        params = params.join(this.options.pathSeperator);
                        if (params.length) {
                            pathParts.push(params);
                        }
                    }
                }
            } else {
                throw 'Multi-part route segments are not supported.';
            }
        }

        var requiredCount = this.segments.reduce(function (prev, cur) {
            if (!cur.parts[0].optional) {
                return prev + 1;
            } else {
                return prev;
            }
        }, 0);

        if (pathParts.length < requiredCount) {
            return null;
        }

        //for (var i = this.segments.length - 1; i >= 0; i--) {
        //    for (var y = 0; y < this.segments[i].parts.length; y++) {
        //        if (routeValues.hasOwnProperty(this.segments[i].parts[y].name)) {
        //            path = path.replace('{' + this.segments[i].parts[y].name + '}', routeValues[this.segments[i].parts[y].name]);
        //            used.push(this.segments[i].parts[y].name);
        //        }
        //    }
        //}

        return pathParts.join(this.options.pathSeperator);
    };

    Route.prototype.hasKey = function (key) {
        for (var x = 0; x < this.segments.length; x++) {
            for (var y = 0; y < this.segments[x].parts.length; y++) {
                if (this.segments[x].parts[y].name === key) {
                    return true;
                }
            }
        }
        return false;
    };

    kr.Route = Route;

    //#endregion

    //#region Default Providers

    function HashPathStringProvider() {
        var self = this;
        var lastPath = '';

        self.pathChanged = new ko.subscribable();

        self.setPath = function (path) {
            if (path) {
                window.location.hash = self.decorate(path);
            } else {
                window.location.hash = '';
            }
        };

        self.getPath = function () {
            return window.location.hash.slice(1);
        };

        self.decorate = function (path) {
            if (path.indexOf('#/') === 0) {
                return path;
            } else if (path[0] === '/') {
                return '#' + path;
            } else if (path[0] === '#') {
                return '#/' + path.slice(1);
            } else {
                return '#/' + path;
            }
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

        self.decorate = function (path) {
            return path;
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
    }

    kr.HistoryPathStringProvider = HistoryPathStringProvider;

    function DefaultModelFactory() {
        var self = this;
    }

    DefaultModelFactory.prototype.createModel = function (constructor, args) {
        function ViewModelWrapper() {
            return constructor.apply(this, args);
        }

        if (typeof constructor === 'function') {
            ViewModelWrapper.prototype = constructor.prototype;

            return new ViewModelWrapper();
        } else {
            throw 'constructor must be a valid constructor function.';
        }
    };

    kr.HistoryPathStringProvider = HistoryPathStringProvider;

    function DefaultTemplateProvider() {
        var self = this;
    }

    DefaultTemplateProvider.prototype.loadTemplate = function (view) {
        ///<summary>Loads the contents of an HTML template defined as a &lt;script&gt; block.</summary>
        ///<param name="view" type="kr.View">The View object</param>        
        ///<param name="completeCallback" type="Function" optional="true">A callback function to execute when the template is loaded.</param>        
        var template = window.document.getElementById(view.templateID);

        if (!template) {
            throw 'There is no element with id ' + view.templateID + '.';
        }

        if (template.tagName.toLowerCase() !== 'script') {
            throw 'The element with id ' + view.templateID + ' must be a <script> tag in order to use it as a template.';
        }

        return new Promise(function (resolve, reject) {
            resolve({
                success: true,
                statusCode: 203,
                template: template
            });
        });
    };

    DefaultTemplateProvider.prototype.unloadTemplate = function (template) {
        /// <signature>
        /// <summary>Unloads a template with the given ID.</summary>
        /// <param name="templateID" type="String"></param>
        /// </signature>
        /// <signature>
        /// <summary>Unloads a template specified by the given HTML element.</summary>
        /// <param name="template" type="HTMLScriptElement">A string.</param>       
        /// </signature>

        //TODO: Should this do something? Should the DefaultTemplateProvider exist, or should it be none?
    };


    kr.DefaultTemplateProvider = DefaultTemplateProvider;

    function AjaxTemplateProvider(options) {

        var self = this;

        var defaultOptions = {
            createTemplates: true,
            templateContainer: null,
            cache: true
        };

        this.options = kr.utils.defaults(defaultOptions, options || {});

        //TODO: support a default base path for templates.
        // where do we put that? a property of this object, or a param to the load and getOrCreate method, or
        // is that even the job of the tmpl provider?

        if (typeof jQuery === 'undefined') {
            throw 'jQuery is required to use the DomTemplateProvider';
        }
    }

    AjaxTemplateProvider.prototype.loadTemplate = function (view) {
        ///<summary>Loads the contents of an HTML template defined as a &lt;script&gt; block from a remote source.</summary>
        ///<param name="view" type="kr.View">The View object</param>
        ///<param name="completeCallback" type="Function" optional="true">A callback function to execute when the template is loaded.</param>
        var template = window.document.getElementById(view.templateID);
        var templateContainer = this.options.templateContainer || window.document.body;
        var self = this;

        if (this.options.createTemplates && !template && view.templateSrc) {
            template = window.document.createElement("script");
            template.type = "text/html";
            template.id = view.templateID;
            if (this.options.cache) {
                template.setAttribute("data-src", view.templateSrc + '?v=' + new Date().getTime().toString());
            } else {
                template.setAttribute("data-src", view.templateSrc);
            }
            if (view.templatePersist) {
                template.setAttribute('data-persist', 'true');
            }
            templateContainer.appendChild(template);
        } else if (!template) {
            throw "There is no template defined with id '" + view.templateID + "'";
        }

        if (template.tagName.toLowerCase() !== 'script') {
            throw 'The element with id ' + view.templateID + ' must be a <script> tag in order to use it as a template.';
        }

        var contentSrc = view.templateSrc || template.getAttribute("data-src");
        var contentLoaded = isTrue(template, "data-loaded");

        // As it turns out, this isn't the business of the loader at all I don't think
        // Q: WHY IS IT NOT THE BUSINESS? WHAT WERE YOU THINKING? ARG....
        // A: I think it's the business of the router to call the unload method...
        // var dataPersist = (dataSrc == null || (template.getAttribute("data-persist")||'').toLowerCase().trim() === 'true');

        var response = {
            success: false,
            statusCode: 0,
            template: template
        };

        return new Promise(function (resolve, reject) {
            if (contentSrc && !contentLoaded) {
                if (!self.options.cache) {
                    contentSrc += '?v=' + new Date().getTime().toString();
                }
                jQuery.get(contentSrc).done(function (content, status, ctx) {
                    template.text = content;
                    template.setAttribute("data-loaded", "true");
                    response.success = true;
                    response.statusCode = ctx.status;
                    resolve(response);
                }).fail(function (ctx, status, statusText) {
                    response.success = false;
                    response.statusCode = ctx.status;
                    reject(response);
                });
            } else {
                response.success = true;
                response.statusCode = 203;
                resolve(response);
            }
        });
    };

    AjaxTemplateProvider.prototype.unloadTemplate = function (template) {
        /// <signature>
        /// <summary>Unloads a template with the given ID.</summary>
        /// <param name="templateID" type="String"></param>
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

        // if the template is marked as persistent (data-persist), don't actually unload it.
        if (isTrue(template, 'data-persist')) {
            return;
        }

        template.setAttribute("data-loaded", "false");
        template.text = '';
    };

    if (typeof jQuery !== 'undefined') {
        kr.AjaxTemplateProvider = AjaxTemplateProvider;
    }

    //#endregion

    //#region Channel

    function Channel(name) {
        var self = this;

        this.name = name;
        this.bus = ko.subscribable();
    }

    kr.Channel = Channel;

    //#endregion

    //#region Area

    function Area(attributes) {
        /// <signature>
        /// <summary>Initializes a new instance of the Area object with the given attributes.</summary>
        /// <param name="attributes" type="Object"></param>
        /// </signature>
        var self = this;
        var defaultProps = {
            name: null,
            views: []
        };

        ko.utils.extend(self, kr.utils.defaults(defaultProps, attributes || {}));
    }

    Area.prototype.getView = function (name) {
        return ko.utils.arrayFirst(this.views, function (view) {
            return view.name === name;
        });
    };

    Area.prototype.addView = function (view) {
        this.views.push(view);
    };

    Area.prototype.clearViews = function () {
        kr.utils.clearArray(this.views);
    };

    kr.Area = Area;

    //#endregion

    //#region View

    function View(attributes) {
        /// <signature>
        /// <summary>Initializes a new instance of the View object with the given attributes.</summary>
        /// <param name="attributes" type="Object"></param>
        /// </signature>
        var self = this;
        var defaultProps = {
            name: null,
            area: null,
            model: null,
            modelInstance: null,
            templateID: null,
            activeTemplateID: null,
            templateSrc: null,
            templatePersist: false,
            singleton: false,
            errorContent: null
        };

        ko.utils.extend(self, kr.utils.defaults(defaultProps, attributes || {}));
    }

    kr.View = View;

    //#endregion

    //#region View Router

    function ViewRouter(options) {
        /// <summary>Used to dynamically bind view models to views based on changes in the browser URL.</summary>
        /// <param name="options" type="Object">A set of options.</param>
        /// <field name='view' type='kr.View'>Gets the current view.</field>
        /// <field name='pathProvider'>Gets or sets the path provider, which is responsible for watching, getting, and setting the current path portion of the URL.</field>
        /// <field name='templateProvider'>Gets or sets the template provider, which is responsible for loading and unloading templates.</field>
        /// <field name='modelFactory'>Gets or sets the model factory which is responsible for creating instances of view models.</field>        

        var self = this;

        var defaultOptions = {
            routes: [
                {
                    template: '{view}/{id?}',
                    defaults: { view: 'home' }
                }
            ],
            viewRouteKey: 'view',
            areaRouteKey: 'area',
            loadMethodName: 'load',
            updateMethodName: 'update',
            areas: [],
            views: [],
            templates: [],
            pathProvider: 'hash',
            templateProvider: 'default',
            errorTemplateID: '',
            notFoundTemplateID: '',
            errorModel: null
        };

        options = kr.utils.defaults(defaultOptions, options || {});

        var initialized = false;
        var routesInitialized = false;
        var defaultView = new kr.View('', null, '', null, false);
        
        var routes = [];
        var areas = [];
        var views = [];
        var templates = [];
        var pathChangedEvent;
        var aborter = null;

        //#region Privates

        var currentView = ko.observable(defaultView);
       
        function executeModelAction(view, actionName, routeValues) {
            var p;
            var newTemplateID = view.templateID;
            var newTemplate;
            var canSetTemplate = true;

            var actionContext = {
                cancel: function () {

                },
                setTemplate: function (templateID) {
                    if (canSetTemplate) {
                        newTemplateID = templateID;
                    } else {
                        throw 'Template cannot be set at this time.';
                    }
                }
            };

            if (view.modelInstance && typeof view.modelInstance[actionName] === 'function') {
                p = Promise.resolve(view.modelInstance[actionName].apply(view.modelInstance, [routeValues, actionContext]));                
            } else {
                p = Promise.resolve(null);
            }
                        
            canSetTemplate = false;
            newTemplate = self.getTemplate(newTemplateID, view);

            //if (newTemplate == null && newTemplateID === view.templateID) {
            //    newTemplate = view;
            //} else if (newTemplate == null) {
            //    return Promise.reject('The template with id ' + newTemplateID + ' does not exist');
            //}

            return Promise.all([p,
                self.templateProvider.loadTemplate(newTemplate).then(function (response) {
                    view.activeTemplateID = newTemplateID;
                })
            ]);
        }

        function executeModelUnload(view, force) {
            function dispose() {
                if (force || !view.singleton) {
                    if (view.modelInstance != null && typeof view.modelInstance.dispose === 'function') {
                        view.modelInstance.dispose.apply(view.modelInstance);
                    }
                    view.modelInstance = null;
                }
            }

            if (view.modelInstance != null && typeof view.modelInstance.unload === 'function') {
                return Promise.resolve(view.modelInstance.unload.apply(view.modelInstance, [force])).then(dispose);
            } else {
                dispose();
                return Promise.resolve(true);
            }
        }

        function setCurrent(view, routeValues, cancel) {
            var model;
            var waits = [];

            if (aborter) {
                aborter.abort('abort');
            }
            
            aborter = kr.utils.abortable(function () {
                currentView(view);
                aborter = null;
                self.onLoaded.notifySubscribers({ routeValues: routeValues, context: this });
            });

            model = view.modelInstance || view.model || {};

            self.onLoading.notifySubscribers({ routeValues: routeValues, context: this });

            if (typeof model === 'function') {
                view.modelInstance = self.modelFactory.createModel(model, [self, routeValues]);
            } else {
                view.modelInstance = model;
            }

            // If the view is changing, we need to unload the existing model, unload the existing template, and load the new template
            waits.push(executeModelUnload(currentView(), false).then(function (result) {
                if (result === false) {
                    cancel();
                }
                if (currentView().activeTemplateID && currentView().activeTemplateID !== view.templateID) {
                    self.templateProvider.unloadTemplate(currentView().activeTemplateID);
                    currentView().activeTemplateID = null;
                }
            }));

            waits.push(executeModelAction(view, options.loadMethodName, routeValues).then(function (result) {
                executeModelAction(view, options.updateMethodName, routeValues);
            }));

            return Promise.all(waits)
                .then(aborter)
                .catch(function (reason) {
                    aborter = null;                    
                    if (reason !== 'abort') {                        
                        handleError('Error', options.errorTemplateID, reason, routeValues);
                    }
                }
            );
        }

        function loadTemplate(templateOrView) {
            var tmpl;

            if (typeof templateOrView === 'string') {
                tmpl = self.getTemplate(templateOrView);
            } else {
                tmpl = templateOrView;
            }

            return self.templateProvider.loadTemplate(tmpl);
        }

        function getMatchingViewAndRouteValues(path) {
            var rv;
            var qs;
            var result = {
                area: null,
                view: null,
                routeValues: null
            };

            for (var i = 0; i < routes.length; i++) {
                if (rv = routes[i].route.match(path, routes[i].defaults)) {
                    var area;
                    var view;

                    if (rv[options.areaRouteKey]) {
                        view = self.getView(rv[options.viewRouteKey], rv[options.areaRouteKey]);
                    } else {
                        view = self.getView(rv[options.viewRouteKey]);
                    }

                    if (view == null) {
                        continue;
                    }

                    //if (rv[options.areaRouteKey]) {
                    //    area = self.getArea(rv[options.areaRouteKey]);
                    //    if (area && !(area = area.getView(rv[options.viewRouteKey]))) {
                    //        continue;
                    //    }
                    //}
                    //else {
                    //    if (rv[options.viewRouteKey] && !(view = self.getView(rv[options.viewRouteKey]))) {
                    //        continue;
                    //    }
                    //}

                    result.area = area;
                    result.view = view;
                    break;
                }
            }

            if (rv == null || result.view == null) {
                return null;
            }

            qs = kr.utils.parseQueryString(path);
            rv = kr.utils.defaults(qs, rv);

            result.routeValues = rv;

            return result;
        }

        function handleError(name, errorTemplateID, reason, routeValues) {
            var errorView = {
                name: name,
                modelInstance: {
                    routeValues: routeValues,
                    error: reason
                },
                errorContent: null
            };
            var errorTemplate;            
            var errorArgs = { routeValues: routeValues, context: this, error: reason, errorHandled: false };

            self.onLoadError.notifySubscribers(errorArgs);
                        
            if (!errorArgs.errorHandled && errorTemplateID) {
                errorTemplate = self.getTemplate(errorTemplateID, {
                    templateID: errorTemplateID
                });

                if (typeof options.errorModel === 'function') {
                    errorView.modelInstance = new options.errorModel(routeValues, reason);
                }

                loadTemplate(errorTemplate).then(function () {
                    errorView.activeTemplateID = errorTemplate.templateID;
                    currentView(errorView);
                }, function (reason) {
                    errorView.errorContent = 'Failed to load the error template.';
                    currentView(errorView);
                    //throw 'Failed to load the error template. ' + reason;
                });
            } else if (!errorArgs.errorHandled) {
                errorView.errorContent = 'An error occurred while loading the view.';
                currentView(errorView);
            }
        }

        function onPathChanged(path) {
            /// <param name="path" type="String"></param>
            var ctx = getMatchingViewAndRouteValues(path);
            var view;

            if (ctx == null) {
                if (options.notFoundTemplateID) {
                    handleError('NotFound', options.notFoundTemplateID, 'Path not found');
                } else {
                    throw 'Path not found';
                }
            }

            if (ctx.view == null) {
                if (options.notFoundTemplateID) {
                    handleError('ViewNotFound', options.notFoundTemplateID, 'View not found', ctx.routeValues);
                } else {
                    throw 'View not found';
                }
            }

            if (ctx.view === currentView()) {
                executeModelAction(ctx.view, options.updateMethodName, ctx.routeValues);                
            } else {
                setCurrent(ctx.view, ctx.routeValues, function () {
                    self.pathProvider.stop();
                    self.pathProvider.revert(function () {
                        self.pathProvider.start();
                    });
                });
            }
        }

        //TODO: Premature optmization here, see if we need it later
        //
        //function buildIndex() {
        //    //channelIndex = {};
        //    viewIndex = {};
        //    var i;

        //    //for (i = 0; i < channels.length; i++) {
        //    //    channelIndex[channels[i].name] = channels[i];
        //    //}

        //    for (i = 0; i < views.length; i++) {
        //        viewIndex[views[i].name] = views[i];
        //    }            
        //}

        //#endregion

        //#region public properties

        self.pathProvider = new kr.HashPathStringProvider();

        self.templateProvider = new kr.DefaultTemplateProvider();

        self.modelFactory = new DefaultModelFactory();

        self.dispose = function () {
            self.pathProvider.stop();
            for (var i = 0; i < self.views.length; i++) {
                self.views[i].unloadModel(true);
            }
            if (pathChangedEvent) {
                pathChangedEvent.dispose();
                pathChangedEvent = null;
            }
        };

        //#endregion

        //#region Public Methods.

        self.getArea = function (name) {
            /// <summary>Gets an area by name.</summary>
            /// <param name="name" type="String">The area name</param>
            /// <returns type="kr.Area" />
            return ko.utils.arrayFirst(areas, function (area) {
                return area.name === name;
            });
        };

        self.getView = function (name, areaName) {
            /// <signature>
            /// <summary>Gets a view in the default area by name.</summary>
            /// <param name="name" type="String">The view name</param>
            /// <returns type="kr.View" />
            /// </signature>
            /// <signature>
            /// <summary>Gets a view in the given area by name.</summary>
            /// <param name="name" type="String">The view name</param>
            /// <param name="areaName" type="String">The area name</param>
            /// <returns type="kr.View" />
            /// </signature>

            var area;

            if (arguments.length === 1) {
                return ko.utils.arrayFirst(views, function (view) {
                    return view.name === name;
                });
            } else if (arguments.length === 2) {
                area = self.getArea(areaName);
                if (area == null) {
                    return null
                }
                return area.getView(name);
            } else {
                return null;
            }
        };

        self.getTemplate = function (templateID, defaultValue) {
            var tmpl = ko.utils.arrayFirst(templates, function (template) {
                return template.templateID === templateID;
            });
            if (tmpl) {
                return tmpl;
            } else {
                return defaultValue;
            }
        };

        self.resolve = function (routeValues) {
            var currentPath = self.pathProvider.getPath();
            var path = '';
            var nvc = {};
            var hasQuery = false;
            var tmp;
            var route;
            var defaults;

            for (var i = 0; i < routes.length; i++) {
                if (tmp = routes[i].route.resolve(routeValues, currentPath)) {
                    route = routes[i].route;
                    defaults = routes[i].defaults;

                    if (routeValues[options.areaRouteKey] && (!defaults[options.areaRouteKey] || !self.getArea(defaults[options.areaRouteKey]))) {
                        continue;
                    }

                    break;
                }
            }

            if (route == null) {
                throw 'No matching route for current path.';
            }

            for (var key in routeValues) {
                //TODO: if you don't want to apply optional defaults, 
                // ignore them here by adding a getKey instead of hasKey and checking type
                // then get rid of the kr.utils.defaults below
                if (routeValues.hasOwnProperty(key) && !route.hasKey(key)) {
                    nvc[key] = routeValues[key];
                    hasQuery = true;
                }
            }

            kr.utils.defaults(defaults, routeValues);

            path += route.resolve(routeValues, currentPath);

            if (hasQuery) {
                path += (queryMarker + kr.utils.serializeQueryString(nvc));
            }

            return this.pathProvider.decorate(path);
        }

        self.navigate = function (routeValues) {
            /// <signature>
            /// <summary>Navigates to a path represented by the given route values.</summary>
            /// <param name="routeValues" type="Object">A collection of route values.</param>
            /// </signature>
            /// <signature>
            /// <summary>Navigates to the given path.</summary>
            /// <param name="path" type="String">A path string to navigate to.</param>       
            /// </signature>            
            var path;

            if (typeof routeValues === 'string') {
                path = routeValues;
            } else {
                path = self.resolve(routeValues)
            }

            if (path != null) {
                self.pathProvider.setPath(path);
            } else {
                //TODO: Handle this along with the virtual-404 type stuff
                //needed in onPathChanged
                throw 'No matching route or path exists.';
            }
        }

        self.setTemplate = function (templateID) {
            if (typeof redirectSetTemplate === 'function') {
                redirectSetTemplate(templateID);
            } else {
                currentView().activeTemplateID = templateID;
                currentView.valueWillMutate();
                currentView.valueHasMutated();
            }
        };

        self.addViews = function (addedViews) {
            /// <summary>Adds one or more views specified in the given array to the views collection</summary>
            /// <param name="addedViews" type="Array">A collection of views</param>            
            var i;

            if (initialized) {
                throw 'Views cannot be added once the router is initalized';
            }

            if (addedViews && addedViews.length) {
                for (i = 0; i < addedViews.length; i++) {
                    options.views.push(addedViews[i]);
                }
            }
        };

        self.insertRoutes = function (insertedRoutes) {
            /// <summary>Adds one or more routes specified in the given array to the beginning of the route table</summary>
            /// <param name="addedRoutes" type="Array">A collection of routes</param>  
            if (routesInitialized) {
                throw 'Routes cannot be added once the router is initalized';
            }
            var i;
            if (insertedRoutes && insertedRoutes.length) {
                for (i = 0; i < insertedRoutes.length; i++) {
                    options.routes.splice(0, 0, insertedRoutes[i]);
                }
            }
        };

        self.addRoutes = function (addedRoutes) {
            /// <summary>Adds one or more routes specified in the given array to the end of the route table</summary>
            /// <param name="addedRoutes" type="Array">A collection of routes</param>  
            if (initialized) {
                throw 'Routes cannot be added once the router is initalized';
            }
            var i;
            if (addedRoutes && addedRoutes.length) {
                for (i = 0; i < addedRoutes.length; i++) {
                    options.routes.push(addedRoutes[i]);
                }
            }
        };

        self.insertRoutes = function (insertedRoutes) {
            /// <summary>Adds one or more routes specified in the given array to the beginning of the route table</summary>
            /// <param name="addedRoutes" type="Array">A collection of routes</param>  
            if (initialized) {
                throw 'Routes cannot be added once the router is initalized';
            }
            var i;
            if (insertedRoutes && insertedRoutes.length) {
                for (i = 0; i < insertedRoutes.length; i++) {
                    options.routes.splice(0, 0, insertedRoutes[i]);
                }
            }
        };

        self.clearRoutes = function () {
            /// <summary>Removes all existing routes from the route table.</summary>
            if (initialized) {
                throw 'Routes cannot be modified once the router is initalized';
            }

            kr.utils.clearArray(options.routes);
        };

        self.destroy = function () {
            self.pathProvider.stop();            
            kr.utils.clearArray(routes);
            kr.utils.clearArray(areas);
            kr.utils.clearArray(views);
            kr.utils.clearArray(templates);
            currentView(defaultView);
        };

        self.init = init;

        self.initRoutes = initRoutes;

        //#endregion

        //#region Public observables

        self.view = ko.computed(function () {
            return currentView();
        });

        self.onLoading = new ko.subscribable();

        self.onLoaded = new ko.subscribable();

        self.onLoadError = new ko.subscribable();

        //#endregion

        //#region Init

        function initRoutes() {
            if (initialized) {
                return;
            }

            kr.utils.clearArray(routes);
            // add all the routes from the constructor
            for (i = 0; i < options.routes.length; i++) {
                routes.push({
                    route: new kr.Route(options.routes[i].template),
                    defaults: options.routes[i].defaults
                });
            };

            // add all the areas used in the constructor
            if (options.areas && options.areas.length) {
                kr.utils.clearArray(areas);
                var area;
                var areaRoutes = [];

                for (var i = 0; i < options.areas.length; i++) {
                    area = new kr.Area(options.areas[i]);
                    areas.push(area);

                    // duplicate the default routes for each area
                    for (var x = 0; x < routes.length; x++) {
                        areaRoutes.push({
                            template: '{area=' + area.name + '}/' + routes[x].route.routeTemplate,
                            //TODO: area prop name here should be options.areaRouteKey
                            defaults: ko.utils.extend({ area: area.name }, routes[x].defaults)
                        });
                    }
                }

                // put area routes at the end of the route table so they aren't tried first
                for (var i = 0; i < areaRoutes.length; i++) {
                    routes.push({
                        route: new kr.Route(areaRoutes[i].template),
                        defaults: areaRoutes[i].defaults
                    });
                }
            }

            routesInitialized = true;
        }

        function init() {
            if (initialized) {
                return;
            }
            var v;
            var area;
            var i;

            self.pathProvider.stop();

            initRoutes();

            // add all the views used in the constructor
            if (options.views && options.views.length) {
                kr.utils.clearArray(views);            
                for (i = 0; i < options.views.length; i++) {
                    addView(options.views[i]);
                }
            } else {
                throw 'ViewRouter could not be initialized because no views are defined.';
            }

            if (options.templates && options.templates.length) {
                kr.utils.clearArray(templates);
                for (i = 0; i < options.templates.length; i++) {
                    templates.push(options.templates[i]);
                }
            }

            // begin watching for path changes
            if (!pathChangedEvent) {
                pathChangedEvent = self.pathProvider.pathChanged.subscribe(onPathChanged);
                self.pathProvider.start();
            }
            initialized = true;
        }

        function addView(view) {
            var v;
            var area;

            //TODO: Is there really a use case for passing in a kr.View() vs. an anonymous obj?                    
            if (view instanceof kr.View) {
                v = view;
            } else {
                v = new kr.View(view);
            }

            if (v.area == null) {
                views.push(v);
            } else {
                area = self.getArea(v.area);

                if (area == null) {
                    throw 'Invalid area name on view';
                }

                area.addView(v);
            }

            // See comment on buildIndex()
            //buildIndex();
        }

        // Support fakes for testing mostly
        // (Or other template storage/fetching mechanisms I guess)
        if (typeof options.templateProvider === 'object') {
            self.templateProvider = options.templateProvider;
        } else if (options.templateProvider === 'ajax') {
            self.templateProvider = new kr.AjaxTemplateProvider();
        }

        // Support the popstate path provider, and fakes for testing mostly
        // (there's only so may ways you are going to persist the path)
        if (typeof options.pathProvider === 'object') {
            self.pathProvider = options.pathProvider;
        } else if (options.pathProvider === 'history') {
            self.pathProvider = new kr.HistoryPathStringProvider(options.basePath);
        }

        //#endregion
    }

    kr.ViewRouter = ViewRouter;

    //#endregion

    //#region ko Binding
    var routerBinding = {
        'init': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var result = ko.bindingHandlers.template.init(element, function () {
                return '';
            });
            var router = ko.utils.unwrapObservable(valueAccessor());

            var computed = ko.computed(function () {
                var updatedView = router.view();
                var tmpl;
                var bindingValue = function () {
                    return tmpl;
                };

                if (!updatedView) {
                    ko.utils.setHtml(element, '<h2>Error</h2><p>Something went wrong when trying to display content.</p>');
                    return;
                } else if (updatedView.errorContent) {
                    ko.utils.setHtml(element, '<h2>Error</h2><p>' + updatedView.errorContent + '</p>');
                    return;
                }

                tmpl = {
                    data: updatedView.modelInstance,
                    name: updatedView.activeTemplateID || updatedView.templateID
                };

                ko.bindingHandlers.template.update(element, bindingValue, allBindings, viewModel, bindingContext);
            });

            router.init();

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                computed.dispose();
            });

            return result;
        },
        'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {

        }
    };
    //#endregion

    extendKo();

})(window, ko);
