/**
 * knockroute - Router & lazy template loader for Knockout
 * @version v0.9.9-alpha1
 * @link https://github.com/jusbuc2k/knockroute
 * @license MIT
 */
// Includes Array map polyfill from http://es5.github.io/#x15.4.4.19 
// Includes es6-promise polyfill from https://github.com/jakearchibald/es6-promise 
/*
 * overview es6-promise - a tiny implementation of Promises/A+.
 * copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * version   2.0.0
 */
(function () {
    function r(a, b) { n[l] = a; n[l + 1] = b; l += 2; 2 === l && A() } function s(a) { return "function" === typeof a } function F() { return function () { process.nextTick(t) } } function G() { var a = 0, b = new B(t), c = document.createTextNode(""); b.observe(c, { characterData: !0 }); return function () { c.data = a = ++a % 2 } } function H() { var a = new MessageChannel; a.port1.onmessage = t; return function () { a.port2.postMessage(0) } } function I() { return function () { setTimeout(t, 1) } } function t() {
        for (var a = 0; a < l; a += 2) (0, n[a])(n[a + 1]), n[a] = void 0, n[a + 1] = void 0;
        l = 0
    } function p() { } function J(a, b, c, d) { try { a.call(b, c, d) } catch (e) { return e } } function K(a, b, c) { r(function (a) { var e = !1, f = J(c, b, function (c) { e || (e = !0, b !== c ? q(a, c) : m(a, c)) }, function (b) { e || (e = !0, g(a, b)) }); !e && f && (e = !0, g(a, f)) }, a) } function L(a, b) { 1 === b.a ? m(a, b.b) : 2 === a.a ? g(a, b.b) : u(b, void 0, function (b) { q(a, b) }, function (b) { g(a, b) }) } function q(a, b) {
        if (a === b) g(a, new TypeError("You cannot resolve a promise with itself")); else if ("function" === typeof b || "object" === typeof b && null !== b) if (b.constructor === a.constructor) L(a,
        b); else { var c; try { c = b.then } catch (d) { v.error = d, c = v } c === v ? g(a, v.error) : void 0 === c ? m(a, b) : s(c) ? K(a, b, c) : m(a, b) } else m(a, b)
    } function M(a) { a.f && a.f(a.b); x(a) } function m(a, b) { void 0 === a.a && (a.b = b, a.a = 1, 0 !== a.e.length && r(x, a)) } function g(a, b) { void 0 === a.a && (a.a = 2, a.b = b, r(M, a)) } function u(a, b, c, d) { var e = a.e, f = e.length; a.f = null; e[f] = b; e[f + 1] = c; e[f + 2] = d; 0 === f && a.a && r(x, a) } function x(a) { var b = a.e, c = a.a; if (0 !== b.length) { for (var d, e, f = a.b, g = 0; g < b.length; g += 3) d = b[g], e = b[g + c], d ? C(c, d, e, f) : e(f); a.e.length = 0 } } function D() {
        this.error =
        null
    } function C(a, b, c, d) { var e = s(c), f, k, h, l; if (e) { try { f = c(d) } catch (n) { y.error = n, f = y } f === y ? (l = !0, k = f.error, f = null) : h = !0; if (b === f) { g(b, new TypeError("A promises callback cannot return that same promise.")); return } } else f = d, h = !0; void 0 === b.a && (e && h ? q(b, f) : l ? g(b, k) : 1 === a ? m(b, f) : 2 === a && g(b, f)) } function N(a, b) { try { b(function (b) { q(a, b) }, function (b) { g(a, b) }) } catch (c) { g(a, c) } } function k(a, b, c, d) {
        this.n = a; this.c = new a(p, d); this.i = c; this.o(b) ? (this.m = b, this.d = this.length = b.length, this.l(), 0 === this.length ? m(this.c,
        this.b) : (this.length = this.length || 0, this.k(), 0 === this.d && m(this.c, this.b))) : g(this.c, this.p())
    } function h(a) { O++; this.b = this.a = void 0; this.e = []; if (p !== a) { if (!s(a)) throw new TypeError("You must pass a resolver function as the first argument to the promise constructor"); if (!(this instanceof h)) throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function."); N(this, a) } } var E = Array.isArray ? Array.isArray : function (a) {
        return "[object Array]" ===
        Object.prototype.toString.call(a)
    }, l = 0, w = "undefined" !== typeof window ? window : {}, B = w.MutationObserver || w.WebKitMutationObserver, w = "undefined" !== typeof Uint8ClampedArray && "undefined" !== typeof importScripts && "undefined" !== typeof MessageChannel, n = Array(1E3), A; A = "undefined" !== typeof process && "[object process]" === {}.toString.call(process) ? F() : B ? G() : w ? H() : I(); var v = new D, y = new D; k.prototype.o = function (a) { return E(a) }; k.prototype.p = function () { return Error("Array Methods must be provided an Array") }; k.prototype.l =
    function () { this.b = Array(this.length) }; k.prototype.k = function () { for (var a = this.length, b = this.c, c = this.m, d = 0; void 0 === b.a && d < a; d++) this.j(c[d], d) }; k.prototype.j = function (a, b) { var c = this.n; "object" === typeof a && null !== a ? a.constructor === c && void 0 !== a.a ? (a.f = null, this.g(a.a, b, a.b)) : this.q(c.resolve(a), b) : (this.d--, this.b[b] = this.h(a)) }; k.prototype.g = function (a, b, c) { var d = this.c; void 0 === d.a && (this.d--, this.i && 2 === a ? g(d, c) : this.b[b] = this.h(c)); 0 === this.d && m(d, this.b) }; k.prototype.h = function (a) { return a };
    k.prototype.q = function (a, b) { var c = this; u(a, void 0, function (a) { c.g(1, b, a) }, function (a) { c.g(2, b, a) }) }; var O = 0; h.all = function (a, b) { return (new k(this, a, !0, b)).c }; h.race = function (a, b) { function c(a) { q(e, a) } function d(a) { g(e, a) } var e = new this(p, b); if (!E(a)) return (g(e, new TypeError("You must pass an array to race.")), e); for (var f = a.length, h = 0; void 0 === e.a && h < f; h++) u(this.resolve(a[h]), void 0, c, d); return e }; h.resolve = function (a, b) {
        if (a && "object" === typeof a && a.constructor === this) return a; var c = new this(p, b);
        q(c, a); return c
    }; h.reject = function (a, b) { var c = new this(p, b); g(c, a); return c }; h.prototype = { constructor: h, then: function (a, b) { var c = this.a; if (1 === c && !a || 2 === c && !b) return this; var d = new this.constructor(p), e = this.b; if (c) { var f = arguments[c - 1]; r(function () { C(c, d, f, e) }) } else u(this, d, a, b); return d }, "catch": function (a) { return this.then(null, a) } }; var z = {
        Promise: h, polyfill: function () {
            var a; a = "undefined" !== typeof global ? global : "undefined" !== typeof window && window.document ? window : self; "Promise" in a && "resolve" in
            a.Promise && "reject" in a.Promise && "all" in a.Promise && "race" in a.Promise && function () { var b; new a.Promise(function (a) { b = a }); return s(b) }() || (a.Promise = h)
        }
    }; "function" === typeof define && define.amd ? define(function () { return z }) : "undefined" !== typeof module && module.exports ? module.exports = z : "undefined" !== typeof this && (this.ES6Promise = z)
}).call(this);
// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {

    Array.prototype.map = function (callback, thisArg) {

        var T, A, k;

        if (this == null) {
            throw new TypeError(' this is null or not defined');
        }

        // 1. Let O be the result of calling ToObject passing the |this| 
        //    value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal 
        //    method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
            T = thisArg;
        }

        // 6. Let A be a new array created as if by the expression new Array(len) 
        //    where Array is the standard built-in constructor with that name and 
        //    len is the value of len.
        A = new Array(len);

        // 7. Let k be 0
        k = 0;

        // 8. Repeat, while k < len
        while (k < len) {

            var kValue, mappedValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal 
            //    method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal 
                //    method of O with argument Pk.
                kValue = O[k];

                // ii. Let mappedValue be the result of calling the Call internal 
                //     method of callback with T as the this value and argument 
                //     list containing kValue, k, and O.
                mappedValue = callback.call(T, kValue, k, O);

                // iii. Call the DefineOwnProperty internal method of A with arguments
                // Pk, Property Descriptor
                // { Value: mappedValue,
                //   Writable: true,
                //   Enumerable: true,
                //   Configurable: true },
                // and false.

                // In browsers that support Object.defineProperty, use the following:
                // Object.defineProperty(A, k, {
                //   value: mappedValue,
                //   writable: true,
                //   enumerable: true,
                //   configurable: true
                // });

                // For best browser support, use the following:
                A[k] = mappedValue;
            }
            // d. Increase k by 1.
            k++;
        }

        // 9. return A
        return A;
    };
};

; (function (global, ko) {
    "use strict";

    //#region Dependencies

    var Promise = global.Promise || global.ES6Promise.Promise;

    //#endregion

    // Object that will be exported
    var kr = {
        version: '0.9.12-alpha1'
    };

    // Export everthing attached to kr into ko.route
    function extendKo() {
        ko.route = kr;
        ko.bindingHandlers['routeTemplate'] = routerBinding;
    }

    //#region Constants

    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    var elementPattern = '\\{(\\w+)([=:]\\w+)?(\\??)\\}';
    var literalRegex = /^[\w\+\.\-\~]+$/i;
    var queryMarker = '?';

    //#endregion

    //#region Private Utils

    function trim(s) {
        return s.replace(rtrim, '');
    }

    function isTrue(element, attribute) {
        return trim((element.getAttribute(attribute) || '').toLowerCase()) === 'true';
    }

    function isArray(obj) {
        return (typeof obj === 'object' && typeof obj.length === 'number');
    }

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

    function defaultViewResolver(routerContext, routeValues) {
        if (routeValues[routerContext.areaRouteKey]) {
            return routerContext.router.getView(routeValues[routerContext.viewRouteKey], routeValues[routerContext.areaRouteKey]);
        } else {
            return routerContext.router.getView(routeValues[routerContext.viewRouteKey]);
        }
    }

    kr.defaultViewResolver = defaultViewResolver;

    //#endregion

    //#region Public Utils

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
                    pairs[pair[0]] = decodeURIComponent(pair[1]);
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

    kr.utils.setTextContent = function (element, textContent) {
        if (element && typeof element.innerHTML !== 'undefined') {
            element.innerHTML = textContent;
        } else if (element && typeof element.textContent !== 'undefined') {
            element.textContent = textContent;
        } else if (element && typeof element.innerText !== 'undefined') {
            element.innerText = textContent;
        }
    };

    //#endregion

    //#region Disposable

    // Creates an instance of an object that calls the disposalCallback when the dispose method is invoked.
    function Disposable(disposalCallback) {
        this.isDisposed = false;
        this.disposalCallback = disposalCallback;
    };

    // Invokes the disposalCallback.
    Disposable.prototype.dispose = function () {
        if (!this.isDisposed) {
            this.disposalCallback();
            this.isDisposed = true;
        }
    };

    //#endregion

    //#region Route

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

    // Static: Parses a route segment value into the given data type
    Route.parseSegmentValue = function (value, type) {
        value = decodeURIComponent(value);
        switch (type) {
            case 'float': return parseFloat(value);
            case 'int': return parseInt(value, 10);
            case 'hex': return parseInt(value, 16);
            default: return value;
        }
    };

    // Static: Parses the given route template string into an array of route segment objects.
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

    // Returns the extracted route values from a given path string if the route matches the path
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

                    routeValues[part.name] = pathSegments.slice(i).map(decodeURIComponent);

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

    // Resolves the given route values object to a string path
    Route.prototype.resolve = function (routeValues, currentPath) {
        /// <param name="routeValues" type="Object"/>
        /// <param name="defaultValues" type="Object" optional="true"/>
        /// <param name="currentPath" type="String" optional="true"/>
        var pathParts = [];

        var currentPathSegements;
        var currentSegment;
        var routeSegment;
        var routePart;
        var encodeBefore = Number.MAX_VALUE;
        var ignoreCurrentPath = false;

        if (typeof currentPath === 'string' && currentPath.length > 0) {
            if (currentPath[0] === this.options.pathSeperator) {
                currentPath = currentPath.slice(1);
            }
            currentPathSegements = currentPath.split(this.options.pathSeperator);
        }

        for (var i = 0; i < this.segments.length; i++) {
            routeSegment = this.segments[i];
            currentSegment = (currentPathSegements && currentPathSegements[i]) ? decodeURI(currentPathSegements[i]) : null;

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
                        ignoreCurrentPath = true;

                        if ((routePart.constraint == null || routePart.constraint(routeValues[routePart.name]))) {
                            pathParts.push(routeValues[routePart.name]);
                        } else {
                            return null;
                        }
                    } else if (!ignoreCurrentPath && currentSegment && currentSegment.length > 0) {
                        // the current segment value is not given in route values, but rather given by the current path
                        // this handles the case where an area is not given on routeValues, but the current path
                        // includes the area, so that you can write router.resolve({view:'foo'}) instead of having 
                        // to write router.resolve({area:'bar',view:'foo'})
                        // when the current URL already includes the area

                        if ((routePart.constraint == null || routePart.constraint(currentSegment))) {
                            pathParts.push(currentSegment);
                        } else {
                            return null;
                        }
                    } else if (routePart.optional) {

                    } else {
                        return null;
                    }
                } else if (routePart.type === 'params' && i == this.segments.length - 1) {
                    var params = routeValues[routePart.name];
                    if (params) {
                        params = params.map(encodeURIComponent).join(this.options.pathSeperator);
                        if (params.length) {
                            encodeBefore = pathParts.length;
                            pathParts.push(params);
                        }
                    }
                }
            } else {
                throw 'Multi-part route segments are not supported.';
            }
        }

        var requiredCount = 0;
        ko.utils.arrayForEach(this.segments, function (cur) {
            if (!cur.parts[0].optional) {
                requiredCount++;
            }
        });

        if (pathParts.length < requiredCount) {
            return null;
        }

        return pathParts.map(function (item, index) {
            if (index < encodeBefore) {
                return encodeURIComponent(item);
            } else {
                return item;
            }
        }).join(this.options.pathSeperator);
    };

    // Returns true if the given key is defined in a route segment of this route, false otherwise.
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

    // A path provider that persists the path value to the hash (#) portion of the URL.
    function HashPathStringProvider() {
        var self = this;
        var lastPath = '';

        // Fires whenever the path value changes
        self.pathChanged = new ko.subscribable();

        // Sets the current path value
        self.setPath = function (path) {
            if (path) {
                window.location.hash = self.decorate(path);
            } else {
                window.location.hash = '';
            }
        };

        // Gets the current path value
        self.getPath = function () {
            return window.location.hash.slice(1);
        };

        // Decorates the path value with provider specific formatting (e.g. # prefix)
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

        // Starts monitoring changes to the path persistence medium
        self.start = function () {
            // subscribe to the hashchange event if useRouteValues
            kr.utils.attachEvent(window, 'hashchange', hashChanged);
            hashChanged();
        };

        // Stops monitoring changes to the path
        self.stop = function () {
            // subscribe to the hashchange event if useRouteValues
            kr.utils.detachEvent(window, 'hashchange', hashChanged);
        };

        // Sets the path value to the previous value.
        self.revert = function (callback) {
            //TODO: Should this just to window.history.back()? Pros/cons if so?
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

        // Fires whenever the path value changes
        self.pathChanged = new ko.subscribable();

        // Sets the current path value
        self.setPath = function (path) {
            window.history.pushState({}, '', extractBase(window.location.pathname) + path);
            self.pathChanged.notifySubscribers(path);
        };

        // Gets the current path value
        self.getPath = function () {
            return stripBase(window.location.pathname);
        };

        // Decorates the path value with any URL specific formatting
        self.decorate = function (path) {
            return path;
        };

        // Starts monitoring changes to the path persistence medium
        self.start = function () {
            // subscribe to the hashchange event if useRouteValues
            kr.utils.attachEvent(window, 'popstate', handlePopState);
            handlePopState();
        };

        // Stops monitoring changes to the path
        self.stop = function () {
            // subscribe to the hashchange event if useRouteValues
            kr.utils.detachEvent(window, 'popstate', handlePopState);
        };

        // Sets the path value to the previous value.
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

    // The model factory is responsible for creating instances of constructor function models
    function DefaultModelFactory() {
        var self = this;
    }

    // Creates an instance of an object using the given constructor.
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

    // The template provider is responsible for loading an unloading HTML templates.
    function DefaultTemplateProvider() {
        var self = this;
    }

    DefaultTemplateProvider.prototype.loadTemplate = function (view) {
        ///<summary>Loads the given template, and returns a promise that will resolve when the template is loaded.</summary>
        ///<param name="view" type="kr.View">A view object with template information or a template object</param>

        // The default template provider doesn't do anything but return the given template by ID
        var template = window.document.getElementById(view.templateID);

        if (!template) {
            throw 'There is no element with id ' + view.templateID + '.';
        }

        if (template.tagName.toLowerCase() !== 'script') {
            throw 'The element with id ' + view.templateID + ' must be a <script> tag in order to use it as a template.';
        }

        return Promise.resolve({
            success: true,
            statusCode: 203,
            template: template
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
        ///<summary>Using jQuery AJAX, loads the contents of an HTML template defined as a &lt;script&gt; block from a remote source; returns a promise that resolves when the template is loaded.</summary>
        ///<param name="view" type="kr.View">The view or template object with the necessary properties to load the template.</param>
        ///<remarks>Uses the jQuery $.ajax function.</remarks>
        var template = window.document.getElementById(view.templateID);
        var templateContainer = this.options.templateContainer || window.document.body;
        var self = this;

        if (this.options.createTemplates && !template && view.templateSrc) {
            template = window.document.createElement("script");
            template.type = "text/html";
            template.id = view.templateID;
            if (!this.options.cache) {
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
					response.statusText = ctx.statusText;
                    resolve(response);
                }).fail(function (ctx, status, statusText) {
                    response.success = false;
                    response.statusCode = ctx.status;
					response.statusText = ctx.statusText;					
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
        // or if the template does not have a source attribute (it's a static template)
        if (isTrue(template, 'data-persist') || template.getAttribute('data-src') == null) {
            return;
        }

        template.setAttribute("data-loaded", "false");
        template.text = '';
    };

    if (typeof jQuery !== 'undefined') {
        kr.AjaxTemplateProvider = AjaxTemplateProvider;
    }

    function WindowScrollProvider() {

    }

    WindowScrollProvider.prototype.resetScroll = function () {
        window.scrollTo(0, 0);
    };

    kr.WindowScrollProvider = WindowScrollProvider;

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
            content: null,
            scope: null,
            resetScroll: true,
            onModelCreating: null,
            onModelUnloading: null,
            handler: null // If handler is defined, routeValues are passed to the handler, and the view is not displayed.
        };

        ko.utils.extend(self, kr.utils.defaults(defaultProps, attributes || {}));
        self.activeTemplateID = ko.observable(self.activeTemplateID);
    }

    kr.View = View;

    //#endregion

    //#region Message Bus

    function Bus() {
        var self = this;
        this._channels = {};
        this._subs = [];
    };

    Bus.prototype.publish = function (channel, topic, message) {
        if (this._channels[channel]) {
            this._channels[channel].notifySubscribers(message, topic);
        }
    };

    Bus.prototype.subscribe = function (channel, topic, callback) {
        var self = this;

        this._channels[channel] = this._channels[channel] || new ko.subscribable();

        var sub = self._channels[channel].subscribe(callback, self, topic);
        var disposable = new Disposable(function () {
            sub.dispose();
            ko.utils.arrayRemoveItem(self._subs, disposable);
            if (self._channels[channel] && self._channels[channel].getSubscriptionsCount() <= 0) {
                self._channels[channel] = null;
            }
        });

        this._subs.push(disposable);

        return disposable;
    };

    Bus.prototype.dispose = function () {
        while (this._subs.length > 0) {
            this._subs.pop().dispose();
        }
    };

    // global shared instance
    Bus.default = new Bus();

    kr.Bus = Bus;

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
                    defaults: {
                        view: 'home'
                    }
                }
            ],
            areas: [],
            views: [],
            templates: [],
            viewRouteKey: 'view',
            areaRouteKey: 'area',
            loadMethodName: 'load',
            updateMethodName: 'update',
            pathProvider: 'hash',
            templateProvider: 'default',
            scrollProvider: 'window',
            defaultContent: 'Loading...', // Content to display before init
            defaultTemplateID: '',
            errorTemplateID: '',
            notFoundTemplateID: '',
            viewResolver: defaultViewResolver
        };

        var initialized = false;
        var templates = [];
        var routes = [];
        var areaRoutes = [];
        var areas = [];
        var views = [];
        var pathChangedEvent;
        var aborter = null;
        var defaultView;

        options = kr.utils.defaults(defaultOptions, options || {});

        defaultView = new kr.View({
            name: null,
            templateID: options.defaultTemplateID,
            content: options.defaultContent
        });

        //#region Privates

        // Gets or sets the current view
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

            // The template can only be set in the syncronus code of the 
            // model action method (e.g. load or update), that is, before the method returns
            // a promise or a value.
            canSetTemplate = false;

            newTemplate = self.getTemplate(newTemplateID, view);

            //if (newTemplate == null && newTemplateID === view.templateID) {
            //    newTemplate = view;
            //} else if (newTemplate == null) {
            //    return Promise.reject('The template with id ' + newTemplateID + ' does not exist');
            //}

            return Promise.all([p,
                self.templateProvider.loadTemplate(newTemplate).then(function (response) {
                    view.activeTemplateID(newTemplateID);
                })
            ]);
        }

        function executeModelUnload(view, navigationContext) {

            self.onUnload.notifySubscribers({
                context: this,
                routeValues: navigationContext.routeValues,
                navigation: navigationContext
            });

            if (navigationContext.isCancelled) {
                return;
            }

            // invoke the view's onModelCreating callback
            if (typeof view.onModelUnloading === 'function') {
                view.onModelUnloading.apply(view, [navigationContext.routeValues, view.modelInstance, navigationContext]);
            }

            if (navigationContext.isCancelled) {
                return;
            }

            if (view.modelInstance != null && typeof view.modelInstance.unload === 'function') {
                if (view.modelInstance.unload.apply(view.modelInstance, [navigationContext.routeValues, navigationContext]) === false) {
                    navigationContext.cancel();
                };
            }
        }

        function executeModelDispose(view) {
            if (view.singleton === true) {
                return;
            }

            if (view.modelInstance != null) {
                if (typeof view.modelInstance.dispose === 'function') {
                    view.modelInstance.dispose.apply(view.modelInstance);
                }
            }
        }

        function disposeScope(newView) {
            var i;
            for (i = 0; i < views.length; i++) {
                if (views[i] !== newView && views[i].modelInstance != null && views[i].scope != null && views[i].scope !== newView.scope) {
                    executeModelDispose(views[i], newView);
                }
            }
        }

        function setCurrent(view, routeValues, navigationContext) {
            var model;
            var waits = [];
            var oldView = currentView();
            var thereWasAlreadyAnError = false;

            if (aborter) {
                aborter.abort('abort');
            }

            aborter = kr.utils.abortable(function () {
                currentView(view);
                aborter = null;

                if (!(view.resetScroll === false)) {
                    self.scrollProvider.resetScroll();
                }

                self.onLoaded.notifySubscribers({
                    routeValues: routeValues,
                    navigation: navigationContext,
                    context: this
                });
            });

            // invoke the view's onModelCreating callback
            if (typeof view.onModelCreating === 'function') {
                view.onModelCreating.apply(view, [routeValues, navigationContext]);
            }

            // If the modelInstance property is set, use the saved model instance
            // Otherwise use the model property, otherwise use an empty object as the model
            model = view.modelInstance || view.model || {};

            self.onLoading.notifySubscribers({
                routeValues: routeValues,
                navigation: navigationContext,
                context: this
            });

            // If the model is a constructor function, create a new instance
            if (typeof model === 'function') {
                view.modelInstance = self.modelFactory.createModel(model, [self, routeValues]);
                // otherwise the model is an object instance, which should be used as the model
            } else {
                view.modelInstance = model;
            }

            try {
                if (!navigationContext.isPreventDisposeSet) {
                    executeModelDispose(oldView);
                    disposeScope(view);
                }

                if (!oldView.singleton && !navigationContext.isPersistModelSet) {
                    oldView.modelInstance = null;
                }

                // unload the old template if it is not the same as the new one
                if (oldView.activeTemplateID() && oldView.activeTemplateID() !== view.templateID) {
                    self.templateProvider.unloadTemplate(oldView.activeTemplateID());
                }

                waits.push(executeModelAction(view, options.loadMethodName, routeValues).then(function () {
                    return executeModelAction(view, options.updateMethodName, routeValues);
                }));
            } catch (e) {
                handleError('Error', options.errorTemplateID, e, routeValues);
                return Promise.reject(e);
            }

            return Promise.all(waits)
                .then(aborter)
                ['catch'](function (reason) {
                    aborter = null;
                    if (reason !== 'abort' && !thereWasAlreadyAnError) {
                        thereWasAlreadyAnError = true;
                        handleError('Error', options.errorTemplateID, reason, routeValues)
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

        function findFirstMatchingRoute(path, routes) {
            var i;
            var view;
            var rv;

            // search least specific to most specific
            for (i = 0; i < routes.length; i++) {
                if (rv = routes[i].route.match(path, routes[i].defaults)) {
                    view = options.viewResolver.call(null, {
                        areaRouteKey: options.areaRouteKey,
                        viewRouteKey: options.viewRouteKey,
                        router: self
                    }, rv);

                    if (view == null) {
                        continue;
                    }

                    return {
                        view: view,
                        routeValues: rv,
                        route: routes[i]
                    };
                }
            }

            return null;
        }

        function findFirstResolvingRoute(routeValues, path, routes) {
            var i;
            var tmp;
            var route;
            var defaults;

            // search most specific to least specific
            for (i = routes.length - 1; i >= 0 ; i--) {
                if (tmp = routes[i].route.resolve(routeValues, path)) {
                    route = routes[i].route;
                    defaults = routes[i].defaults;

                    //TODO: REMOVE THIS STUFF
                    //if (routeValues[options.areaRouteKey] && (!defaults[options.areaRouteKey] || !self.getArea(defaults[options.areaRouteKey]))) {
                    //    continue;
                    //}

                    return {
                        route: route,
                        defaults: defaults
                    };
                }
            }

            return null;
        }

        function getMatchingViewAndRouteValues(path) {
            var rv;
            var qs;
            var match;

            match = findFirstMatchingRoute(path, areaRoutes);

            if (match == null) {
                match = findFirstMatchingRoute(path, routes);
            }

            if (match == null || match.routeValues == null || match.view == null) {
                return null;
            }

            return {
                view: match.view,
                route: match.route,
                routeValues: ko.utils.extend(match.routeValues, kr.utils.parseQueryString(path))
            };
        }

        function handleError(name, errorTemplateID, reason, routeValues) {
            var errorTemplate;
            var errorArgs = {
                routeValues: routeValues,
                context: this,
                error: reason,
                errorHandled: false
            };
            var errorView = new kr.View({
                name: name,
                modelInstance: {
                    name: name,
                    routeValues: routeValues,
                    error: reason
                },
                content: null
            });

            self.onLoadError.notifySubscribers(errorArgs);

            if (!errorArgs.errorHandled && errorTemplateID) {
                errorTemplate = self.getTemplate(errorTemplateID, {
                    templateID: errorTemplateID
                });

                if (typeof options.errorModel === 'function') {
                    errorView.modelInstance = new options.errorModel(routeValues, reason);
                }

                loadTemplate(errorTemplate).then(function () {
                    errorView.activeTemplateID(errorTemplate.templateID);
                    currentView(errorView);
                }, function (reason) {
                    errorView.content = 'Failed to load the error template.';
                    currentView(errorView);
                    //throw 'Failed to load the error template. ' + reason;
                });
            } else if (!errorArgs.errorHandled) {
                errorView.content = 'An error occurred while loading the view.';
                currentView(errorView);
            }
        }

        function onPathChanged(path) {
            /// <param name="path" type="String"></param>
            var viewMatch = getMatchingViewAndRouteValues(path);

            var ctx = {
                path: path,
                // Cancel the navigation
                isCancelled: false,
                cancel: function () {
                    this.isCancelled = true;
                    self.pathProvider.stop();
                    self.pathProvider.revert(function () {
                        self.pathProvider.start();
                    });
                },
                // Persist the existing model when navigating to the new view
                isPersistModelSet: false,
                persistModel: function () {
                    this.isPersistModelSet = true;
                },
                isPreventDisposeSet: false,
                preventDispose: function () {
                    this.isPreventDisposeSet = true;
                }
            };

            if (viewMatch == null) {
                ctx.routeValues = null;
            } else {
                ctx.routeValues = viewMatch.routeValues;
                ctx.view = viewMatch.view;
            }

            if (viewMatch != null && viewMatch.view === currentView()) {
                executeModelAction(viewMatch.view, options.updateMethodName, viewMatch.routeValues)['catch'](function (reason) {
                    handleError('Error', options.errorTemplateID, reason, ctx.routeValues);
                });
            } else {
                // If the view is changing, we need to invoke unload on the existing model, 
                executeModelUnload(currentView(), ctx);

                if (ctx.isCancelled) {
                    // If the unload method cancelled the navigation then revert to the previous path
                    return;
                } else if (viewMatch == null) {
                    // else if the new path doesn't match any defined route or view, show an error
                    handleError('NotFound', options.notFoundTemplateID, 'Path not found');
                    return;
                } else {
                    // else set the new view as the current view
                    setCurrent(viewMatch.view, viewMatch.routeValues, ctx);
                }
            }
        }

        function setPathProvider(newProvider) {
            if (pathChangedEvent) {
                pathChangedEvent.dispose();
                pathChangedEvent = null;
            }

            if (self.pathProvider) {
                self.pathProvider.stop();
            }

            self.pathProvider = newProvider;

            pathChangedEvent = self.pathProvider.pathChanged.subscribe(onPathChanged);

            if (initialized) {
                self.pathProvider.start();
            }
        }

        function init() {
            if (initialized) {
                return;
            }

            currentView(defaultView);

            self.pathProvider.start();

            initialized = true;
        }

        function triggerPathChanged() {
            onPathChanged(self.path.getPath());
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
        }

        //#endregion

        //#region public properties

        // Gets or sets the path provider
        self.pathProvider = null;

        setPathProvider(new kr.HashPathStringProvider());

        self.templateProvider = new kr.DefaultTemplateProvider();

        self.modelFactory = new DefaultModelFactory();

        self.scrollProvider = new WindowScrollProvider();

        self.bus = new kr.Bus();

        //#endregion

        //#region Public Methods.

        // Clears all existing templates.
        self.clearTemplates = function () {
            kr.utils.clearArray(templates);
        };

        // Clears all existing route table entries.
        self.clearRoutes = function () {
            kr.utils.clearArray(routes);
            kr.utils.clearArray(areaRoutes);
        };

        // Clears all existing views and areas.
        self.clearViews = function () {
            kr.utils.clearArray(areas);
            kr.utils.clearArray(areaRoutes);
            kr.utils.clearArray(views);
        };

        // Adds templates.
        self.addTemplates = function (newTemplates) {
            if (newTemplates && newTemplates.forEach) {
                newTemplates.forEach(function (tmpl) {
                    templates.push(tmpl);
                });
            }
        };

        // Adds areas
        self.addAreas = function (newAreas) {
            if (newAreas && newAreas.forEach) {
                newAreas.forEach(function (area) {
                    areas.push(new kr.Area(area));

                    //TODO: area prop name here should be options.areaRouteKey

                    //area: area.name

                    if (isArray(area.routes)) {
                        area.routes.forEach(function (route) {
                            areaRoutes.push({
                                route: new kr.Route('{area=' + area.name + '}/' + route.template),
                                defaults: ko.utils.extend({}, route.defaults)
                            });
                        });
                    } else {
                        areaRoutes.push({
                            route: new kr.Route('{area=' + area.name + '}/' + routes[0].route.routeTemplate),
                            defaults: ko.utils.extend({}, routes[0].defaults)
                        });
                    }
                });
            } else {
                throw new TypeError('newAreas must be an array.');
            }
        };

        // Adds views
        self.addViews = function (newViews) {
            /// <summary>Adds one or more views specified in the given array to the views collection</summary>
            /// <param name="newViews" type="Array">A collection of views</param>            
            if (newViews && newViews.forEach) {
                newViews.forEach(function (view) {
                    addView(view);
                });
            } else {
                throw new TypeError('addedViews must be an array.');
            }
        };

        // Inserts routes at the beginning of the route table.
        self.insertRoutes = function (newRoutes) {
            /// <summary>Adds one or more routes specified in the given array to the beginning of the route table</summary>
            /// <param name="newRoutes" type="Array">A collection of routes</param>  
            var i;

            if (newRoutes && newRoutes.length) {
                for (i = newRoutes.length - 1; i >= 0 ; i--) {
                    routes.splice(0, 0, {
                        route: new kr.Route(newRoutes[i].template),
                        defaults: newRoutes[i].defaults
                    });
                }
            } else {
                throw new TypeError('insertedRoutes must be an array.');
            }
        };

        // Adds routes at the end of the route table.
        self.addRoutes = function (newRoutes) {
            /// <summary>Adds one or more routes specified in the given array to the end of the route table</summary>
            /// <param name="newRoutes" type="Array">A collection of routes</param>
            if (newRoutes && newRoutes.forEach) {
                newRoutes.forEach(function (route) {
                    routes.push({
                        route: new kr.Route(route.template),
                        defaults: route.defaults
                    });
                });
            } else {
                throw new TypeError('addedRoutes must be an array.');
            }
        };

        // Gets an area by name.
        self.getArea = function (name) {
            /// <summary>Gets an area by name.</summary>
            /// <param name="name" type="String">The area name</param>
            /// <returns type="kr.Area" />
            return ko.utils.arrayFirst(areas, function (area) {
                return area.name === name;
            });
        };

        // Gets a view by name and/or area name.
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

        // Gets a template, or if the template cannot be located, returns the given defaultValue
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

        // Sets the given router options
        self.setOptions = function (newOptions) {
            if (newOptions == null) {
                throw new TypeError('newOptions must be an object.');
            }

            ko.utils.extend(options, newOptions);

            if (isArray(newOptions.templates)) {
                self.clearTemplates();
                self.addTemplates(newOptions.templates);
            }

            if (isArray(newOptions.routes)) {
                self.clearRoutes();
                self.addRoutes(newOptions.routes);
            }

            if (isArray(newOptions.areas) && isArray(newOptions.views)) {
                self.clearViews();
                self.addAreas(newOptions.areas);
                self.addViews(newOptions.views);
            } else if (isArray(newOptions.areas)) {
                self.clearViews();
                self.addAreas(newOptions.areas);
            } else if (isArray(newOptions.views)) {
                self.clearViews();
                self.addViews(newOptions.views);
            }

            // Support fakes for testing mostly
            // (Or other template storage/fetching mechanisms I guess)
            if (typeof newOptions.templateProvider === 'object') {
                self.templateProvider = newOptions.templateProvider;
            } else if (newOptions.templateProvider === 'ajax') {
                self.templateProvider = new kr.AjaxTemplateProvider();
            }

            // Support the popstate path provider, and fakes for testing mostly
            // (there's only so may ways you are going to persist the path)
            if (typeof newOptions.pathProvider === 'object') {
                setPathProvider(newOptions.pathProvider);
            } else if (newOptions.pathProvider === 'history') {
                setPathProvider(new kr.HistoryPathStringProvider(newOptions.basePath));
            }

            if (typeof newOptions.scrollProvider === 'object') {
                self.scrollProvider = newOptions.scrollProvider;
            } else if (newOptions.scrollProvider === 'window') {
                self.scrollProvider = new kr.WindowScrollProvider();
            }
        };

        // Resolves a given set of route values to a string path
        self.resolve = function (routeValues, ignoreCurrent) {
            var currentPath;
            var path = '';
            var nvc = {};
            var hasQuery = false;
            var match;
            var currentRouteValues;

            if (!ignoreCurrent) {
                currentPath = self.pathProvider.getPath();
            }

            match = findFirstResolvingRoute(routeValues, currentPath, areaRoutes);

            if (match == null) {
                match = findFirstResolvingRoute(routeValues, currentPath, routes);
            }

            if (match == null) {
                throw 'No matching route for given path';
            }

            //if (!ignoreCurrent) {
            //    currentRouteValues = match.route.match(currentPath) || {};
            //    ko.utils.extend(currentRouteValues, kr.utils.parseQueryString(currentPath));
            //    routeValues = ko.utils.extend(currentRouteValues, routeValues);
            //}

            for (var key in routeValues) {
                if (routeValues.hasOwnProperty(key) && !match.route.hasKey(key) && nvc[key] !== undefined) {
                    nvc[key] = routeValues[key];
                    hasQuery = true;
                }
            }

            path += match.route.resolve(routeValues, currentPath);

            if (hasQuery) {
                path += (queryMarker + kr.utils.serializeQueryString(nvc));
            }

            return this.pathProvider.decorate(path);
        }

        self.navigate = function (routeValues, ignoreCurrent) {
            /// <signature>
            /// <summary>Navigates to a path represented by the given route values.</summary>
            /// <param name="routeValues" type="Object">A collection of route values.</param>
            /// <param name="ignoreCurrent" type="Boolean">Don't include route values for current path.</param>
            /// </signature>
            /// <signature>
            /// <summary>Navigates to the given path.</summary>
            /// <param name="path" type="String">A path string to navigate to.</param>       
            /// </signature>            
            var path;

            if (typeof routeValues === 'string' && arguments.length === 1) {
                path = routeValues;
            } else {
                path = self.resolve(routeValues, ignoreCurrent);
            }

            if (path != null) {
                self.pathProvider.setPath(path);
            } else {
                //TODO: Handle this along with the virtual-404 type stuff
                //needed in onPathChanged
                throw 'No matching route or path exists.';
            }
        };

        // Sets the active templateID on the current view. This is the same as calling view().activeTemplateID(...)
        self.setTemplate = function (templateID) {
            currentView().activeTemplateID(templateID);
        };

        // Disposes the router and all related resources, or at least, in theory it does.
        self.dispose = function () {
            self.pathProvider.stop();
            var currentViewDisposed = false;

            if (pathChangedEvent) {
                pathChangedEvent.dispose();
                pathChangedEvent = null;
            }

            for (var i = 0; i < views.length; i++) {
                executeModelDispose(views[i]);
                if (views[i] === currentView()) {
                    currentViewDisposed = true;
                }
            }

            if (!currentViewDisposed) {
                executeModelUnload(currentView());
                executeModelDispose(currentView());
            }

            currentView(null);
        };

        // Initializes the router. This method can only be called once, and if called again it will do nothing.
        self.init = init;

        //#endregion

        //#region Public observables

        self.view = ko.computed(function () {
            return currentView();
        });

        self.onLoading = new ko.subscribable();

        self.onLoaded = new ko.subscribable();

        self.onUnload = new ko.subscribable();

        self.onLoadError = new ko.subscribable();

        //#endregion

        //#region Init

        this.setOptions(options);

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

            ko.computed(function () {
                var updatedView = router.view();
                var tmpl;
                var bindingValue = function () {
                    return tmpl;
                };

                if (!updatedView) {
                    kr.utils.setTextContent(element, '<h2>Error</h2><p>Something went wrong when trying to display content.</p>');
                    return;
                } else if (updatedView.content && updatedView.modelInstance && updatedView.modelInstance.error) {
                    kr.utils.setTextContent(element, '<h2>Error</h2><p>' + updatedView.content + '</p><p>' + (updatedView.modelInstance.error.stack ? updatedView.modelInstance.error.stack : '') + '</p>');
                    return;
                } else if (updatedView.content) {
                    kr.utils.setTextContent(element, updatedView.content);
                    return;
                }

                tmpl = {
                    data: updatedView.modelInstance,
                    name: ko.unwrap(updatedView.activeTemplateID) || updatedView.templateID
                };

                if (tmpl.data && tmpl.name) {
                    ko.bindingHandlers.template.update(element, bindingValue, allBindings, viewModel, bindingContext);
                } else {
                    throw 'Failed to load view';
                }
            }, this, {
                disposeWhenNodeIsRemoved: element
            }).extend({ rateLimit: 10 });

            router.init();

            return result;
        },
        'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            // Nothing to do here I don't think
        }
    };

    //#endregion

    extendKo();

})(window, ko);
