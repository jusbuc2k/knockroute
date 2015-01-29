/// <reference path="http://code.jquery.com/qunit/qunit-1.14.0.js" />
/// <reference path="http://code.jquery.com/jquery-1.11.0.min.js" />
/// <reference path="http://ajax.aspnetcdn.com/ajax/knockout/knockout-3.0.0.js" />
/// <reference path="../src/knockroute.js" />

var orig = window.location.href;

QUnit.done(function () {
    if (window.history.pushState) {
        window.history.pushState({}, '', orig);
    }
});

QUnit.module('Utils');

QUnit.test('Promise', function (assert) {
    expect(2);

    assert.ok(typeof Promise, 'function');
    assert.strictEqual(typeof Promise.all, 'function');
});

QUnit.test('defaults', function (assert) {
    expect(4);

     var defaults = {
        a: 1,
        b: 1,
        c: 1
     };
     var options = {
         a: 9,
         c: 8
     };

     var opts = ko.route.utils.defaults(defaults, options);
     assert.strictEqual(opts, options, 'objects should be ref equivalent');
     assert.strictEqual(options.a, 9);
     assert.strictEqual(options.b, 1);
     assert.strictEqual(options.c, 8);
});

QUnit.test('queryString', function (assert) {
    expect(13);

    var qs;

    assert.ok(qs = ko.route.utils.parseQueryString('foo=bar'));
    assert.strictEqual(qs.foo, 'bar');
    assert.strictEqual(ko.route.utils.serializeQueryString(qs), 'foo=bar');

    assert.ok(qs = ko.route.utils.parseQueryString('?bar=foo'));
    assert.strictEqual(qs.bar, 'foo');
    assert.strictEqual(ko.route.utils.serializeQueryString(qs), 'bar=foo');
    
    assert.ok(qs = ko.route.utils.parseQueryString('/blah/blah?foo=bar'));
    assert.strictEqual(qs.foo, 'bar');
    assert.strictEqual(ko.route.utils.serializeQueryString(qs), 'foo=bar');

    assert.ok(qs = ko.route.utils.parseQueryString('?foo=bar&beer=nuts'));
    assert.strictEqual(qs.foo, 'bar');
    assert.strictEqual(qs.beer, 'nuts');
    assert.strictEqual(ko.route.utils.serializeQueryString(qs), 'foo=bar&beer=nuts');
});

QUnit.test('setTextContent', function (assert) {
    expect(1);

    ko.route.utils.setTextContent($('#qunit-fixture')[0], 'This is a test');

    assert.strictEqual($('#qunit-fixture').text(), 'This is a test');    
});

QUnit.test('events', function (assert) {
    expect(1);

    var btn = document.createElement('button');
    $('#qunit-fixture').append(btn);

    var handler = function(e) {        
        assert.ok(e);
    };
    
    ko.route.utils.attachEvent(btn, 'click', handler);
    btn.click();
    ko.route.utils.detachEvent(btn, 'click', handler);
    btn.click();
});

QUnit.module('Bus');

QUnit.test('TestBus', function (assert) {
    var lastMessage = null;
    var sub = ko.route.Bus.default.subscribe('chan1', 'top1', function (data) {
        lastMessage = data;
    });

    expect(5);

    ko.route.Bus.default.publish('chan1', 'top1', 'Message1');
    assert.strictEqual(lastMessage, 'Message1');    
    ko.route.Bus.default.publish('chan1', 'top1', 'Message2');
    assert.strictEqual(lastMessage, 'Message2');
    
    ko.route.Bus.default.publish('chan1', 'top2', 'FooBar');
    assert.strictEqual(lastMessage, 'Message2');
    ko.route.Bus.default.publish('chan2', 'top1', 'FooBar');
    assert.strictEqual(lastMessage, 'Message2');

    sub.dispose();
    ko.route.Bus.default.publish('chan1', 'top1', 'Message3');
    assert.strictEqual(lastMessage, 'Message2');

    ko.route.Bus.default.dispose();
});

QUnit.module('View');

QUnit.module('Route');

QUnit.test('TestParseRoute', function(assert) {
    expect(7);

    var valueChars = '[\\w\\.\\-\\$\\s\\{\\}\\|\\^\\*\\(\\)\\[\\]]+';
    var suffix = '\\??.*';
    
    var goodRoute = new ko.route.Route('{view}');
    //assert.strictEqual(goodRoute.regex, '^/?(' + valueChars + ')' + suffix);
    assert.strictEqual(goodRoute.segments.length, 1);
    
    assert.throws(function () {
        var badRoute = new ko.route.Route('/{view');        
    });

    goodRoute = new ko.route.Route('{view}/{id}');
    //assert.strictEqual(goodRoute.regex, '^/?(' + valueChars + ')/(' + valueChars + ')' + suffix);
    assert.strictEqual(goodRoute.segments.length, 2);

    goodRoute = new ko.route.Route('{view}/{id}/{bar}');
    //assert.strictEqual(goodRoute.regex, '^/?(' + valueChars + ')/(' + valueChars + ')/(' + valueChars + ')' + suffix);
    assert.strictEqual(goodRoute.segments.length, 3);

    //multi-part route segments are not implemented
    assert.throws(function () {
        var r = new ko.route.Route('{view}/{foo}-{bar}-{baz}/{blah}');
        //assert.strictEqual(r.regex, '^/?(' + valueChars + ')/(' + valueChars + ')/(' + valueChars + ')' + suffix);
        //assert.strictEqual(r.elements.length, 3);
        //assert.strictEqual(r.elements.reduce(function (a, b) {
        //    return a + b.parts.length;
        //}, 0), 5);
    });

    assert.strictEqual(new ko.route.Route('{view}/{id?}').segments.length, 2);

    //multi-part route segments are not implemented
    assert.throws(function () {
        var r = new ko.route.Route('{view?}/{id}');
    });    
});

QUnit.test('TestMatch', function (assert) {
    expect(22);

    var rv;
    var route1 = new ko.route.Route('{view}');
    assert.ok(rv = route1.match('Foo'), 'Path should match');
    assert.strictEqual(rv.view, 'Foo');
    assert.ok(route1.match('foo/bar') == null);
    assert.throws(function () {
        route1.match();
    });
    assert.ok(!route1.match(''));
    assert.ok(route1.match('/foo'));
            
    var route2 = new ko.route.Route('{view}/{id?}');
    assert.ok(rv = route2.match('/Foo/123'), 'Path should match');    
    assert.notEqual(rv, null);
    assert.strictEqual(rv.view, 'Foo');
    assert.strictEqual(rv.id, '123');
    assert.ok(route2.match('foo') != null);
    assert.ok(route2.match('foo/bar/test') == null);

    var route3 = new ko.route.Route('{view}/{id?}/{bar?}');
    assert.ok(rv = route3.match('Foo/123/Blah'), 'Path should match');
    assert.strictEqual(rv.view, 'Foo');
    assert.strictEqual(rv.id, '123');
    assert.strictEqual(rv.bar, 'Blah');
    assert.ok(route3.match('foo') != null);
    assert.ok(route3.match('foo/bar') != null);

    //multi-part route segments are not implemented
    assert.throws(function () {
        var route4 = new ko.route.Route('{view}/{year}-{month}-{day}/');
        //assert.ok(rv = route4.match('/detail/2014-06-27/view'));
        //assert.strictEqual(rv.view, 'detail');
        //assert.strictEqual(rv.year, '2014');
        //assert.strictEqual(rv.month, '06');
        //assert.strictEqual(rv.day, '27');
        //assert.strictEqual(rv.action, 'view');
    });
    
    assert.ok(rv = new ko.route.Route('{channel}/{view}/{id?}').match('', { channel: 'default', view: 'index' }));
    assert.strictEqual(rv.channel, 'default');
    assert.strictEqual(rv.view, 'index');
});

QUnit.test('TestMatchParams', function (assert) {
    expect(15);

    var rv;
    var route1 = new ko.route.Route('{view}/{rest:params}');
    assert.ok(rv = route1.match('foobar'), 'Path should match');
    assert.strictEqual(rv.view, 'foobar');
    assert.strictEqual(rv.rest, undefined);

    assert.ok(rv = route1.match('foobar/a/b/c'), 'Path should match');    
    assert.strictEqual(rv.view, 'foobar');
    assert.strictEqual(rv.rest.length, 3);
    assert.strictEqual(rv.rest[0], 'a');
    assert.strictEqual(rv.rest[1], 'b');
    assert.strictEqual(rv.rest[2], 'c');

    var route2 = new ko.route.Route('{view}/{id?}/{rest:params?}');
    assert.ok(rv = route2.match('foobar'), 'Path should match');
    assert.strictEqual(rv.view, 'foobar');
    assert.ok(rv = route2.match('foobar/123'), 'Path should match');
    assert.strictEqual(rv.id, '123');
    assert.ok(rv = route2.match('foobar/123/a/b/c'), 'Path should match');
    assert.strictEqual(rv.rest.length, 3);

});

QUnit.test('TestResolveParams', function (assert) {
    expect(11);

    var rv;
    var route1 = new ko.route.Route('{view}/{rest:params}');
    assert.ok(rv = route1.match('foobar/a/b/c'), 'Path should match');
    assert.strictEqual(rv.view, 'foobar');
    assert.strictEqual(rv.rest.length, 3);
    assert.strictEqual(rv.rest[0], 'a');
    assert.strictEqual(rv.rest[1], 'b');
    assert.strictEqual(rv.rest[2], 'c');

    
    assert.strictEqual(route1.resolve(rv), 'foobar/a/b/c');
    assert.strictEqual(route1.resolve({ view: 'foobar', rest: [] }), 'foobar');
    assert.strictEqual(route1.resolve({ view: 'foobar', rest: ['a'] }), 'foobar/a');
    assert.strictEqual(route1.resolve({ view: 'foobar', rest: ['a', 'b'] }), 'foobar/a/b');
    assert.strictEqual(route1.resolve({ view: 'foobar', rest: ['a', 'b', 'c'] }), 'foobar/a/b/c');
});

QUnit.test('TestMatchWithContraints', function (assert) {
    expect(7);

    var rv;
    var route1 = new ko.route.Route('{view}/{foo=bar?}');
    assert.ok(rv = route1.match('foobar'), 'Path should match');
    assert.ok(!route1.match('foobar/bax'), 'Path should not match');

    var route2 = new ko.route.Route('{view}/{foo=bar}');
    assert.ok(!route2.match('foobar'), 'Path should not match');
    assert.ok(!route2.match('foobar/bax'), 'Path should not match');
    assert.ok(rv = route2.match('foobar/bar'), 'Path should match');
    assert.strictEqual(rv.view, 'foobar');
    assert.strictEqual(rv.foo, 'bar');    
    
});

QUnit.test('TestMatchWithDataTypeParsing', function (assert) {
    expect(9);
    var rv;

    assert.ok(new ko.route.Route('{bar:int}').match('123d') == null, 'Path should not match');
    assert.ok(new ko.route.Route('{bar:float}').match('123d') == null, 'Path should not match');
    assert.ok(new ko.route.Route('{bar:hex}').match('abg') == null, 'Path should not match');

    assert.ok(rv = new ko.route.Route('{bar:int}').match('123'), 'Path should match');
    assert.strictEqual(rv.bar, 123);
    assert.ok(rv = new ko.route.Route('{bar:float}').match('123.456'), 'Path should match');
    assert.strictEqual(rv.bar, 123.456);
    assert.ok(rv = new ko.route.Route('{bar:hex}').match('0f9ab1'), 'Path should match');
    assert.strictEqual(rv.bar, parseInt('0f9ab1', 16));    
});

QUnit.test('TestOptionalKeys', function (assert) {
    expect(4);

    var path = '/Foo/';
    var route = new ko.route.Route('{view}/{id?}');
    var rv;

    assert.ok(route.match('/Foo'));
    assert.ok(route.match('/Foo/'));

    assert.ok(rv = route.match(path));
    assert.strictEqual(rv.view, 'Foo');                
});

QUnit.test('TestResolvePath', function (assert) {
    expect(8);

    assert.strictEqual(new ko.route.Route('{foo}/{bar}').resolve({ foo: 'blah', bar: 'test' }), 'blah/test');
    assert.strictEqual(new ko.route.Route('{foo}/{bar?}').resolve({ foo: 123, bar: 456 }),'123/456');
    assert.strictEqual(new ko.route.Route('{foo}/{bar?}').resolve({ foo: 123 }), '123');

    assert.ok(new ko.route.Route('*/{foo}/').resolve({ foo: 123 }) == null);
    assert.ok(new ko.route.Route('*/{foo}/').resolve({ foo: 123 }, '') == null);
    assert.strictEqual(new ko.route.Route('*/{foo}/').resolve({ foo: 123 }, 'Beer'), 'Beer/123');
    assert.strictEqual(new ko.route.Route('*/{foo}/').resolve({ foo: 123 }, 'Beer/Blah/'), 'Beer/123');
    assert.strictEqual(new ko.route.Route('*/{foo}/').resolve({ foo: 123 }, '/Beer/Blah/'), 'Beer/123');

});

QUnit.test('TestRouteWithBasePath', function (assert) {
    expect(2);

    var path = '/Foo/Bar/Baz/123';

    var rv = new ko.route.Route('/*/*/{view}/{id:int}').match(path);

    assert.strictEqual(rv.view, 'Baz');
    assert.strictEqual(rv.id, 123);   
});

QUnit.test('TestRouteSpecialCharacters', function (assert) {
    expect(6);

    var path = 'a b c/d*ef/[123]/9{9}9/t$x$t/';
    var route = new ko.route.Route('{foo}/{bar}/{baz}/{blah}/{ext}');
    var rv;
    assert.ok(rv = route.match(path), true);    
    assert.strictEqual(rv.foo, 'a b c');
    assert.strictEqual(rv.bar, 'd*ef');
    assert.strictEqual(rv.baz, '[123]');
    assert.strictEqual(rv.blah, '9{9}9');
    assert.strictEqual(rv.ext, 't$x$t');    
});

QUnit.test('TestRouteWithQueryString', function (assert) {
    expect(3);

    var path = '/Foo/123?id=456&foo=bar';
    var rv;
    var route = new ko.route.Route('/{view}/{id}');    
    
    assert.ok(rv = route.match(path));
    assert.strictEqual(rv.view, 'Foo');
    assert.strictEqual(rv.id, '123');
});

QUnit.test('TestRouteValuesEqual', function (assert) {
    expect(2);

    var rv1 = new ko.route.Route('/*/*/{view}/{id:int}').match('/Foo/Bar/Baz/123');
    var rv2 = new ko.route.Route('/*/*/{view}/{id:int}').match('/Beer/Can/Baz/123');

    assert.strictEqual(JSON.stringify(rv1), JSON.stringify(rv2));

    var rv1 = new ko.route.Route('/{view}/{id}').match('/Foo/Bar/Beer/123');
    var rv2 = new ko.route.Route('/{view}/{id}').match('/Foo/Bar/Cat/456');

    assert.strictEqual(JSON.stringify(rv1), JSON.stringify(rv2));
});

QUnit.module('Providers');

QUnit.asyncTest('TestHashPathStringProvider', function (assert) {
    var psp = new ko.route.HashPathStringProvider();
    expect(10);

    window.location.hash = '#';

    psp.start();

    assert.strictEqual(psp.decorate(''), '#/');
    assert.strictEqual(psp.decorate('foo'), '#/foo');
    assert.strictEqual(psp.decorate('#foo'), '#/foo');
    assert.strictEqual(psp.decorate('/foo'), '#/foo');
    assert.strictEqual(psp.decorate('#/foo'), '#/foo');

    window.setTimeout(function () {
        assert.strictEqual(psp.getPath(), '');
        psp.setPath('foobar');

        window.setTimeout(function () {
            assert.strictEqual(window.location.hash, '#/foobar');
            assert.strictEqual(psp.getPath(), '/foobar');
            psp.setPath('/foo/bar');
            
            window.setTimeout(function () {
                assert.strictEqual(window.location.hash, '#/foo/bar');
                assert.strictEqual(psp.getPath(), '/foo/bar');
                QUnit.start();
            });
        }, 20);
    }, 20);   
});

QUnit.asyncTest('TestHashPathStringProviderEvents', function (assert) {
    var psp = new ko.route.HashPathStringProvider();
    expect(2);

    window.location.hash = '#';
    psp.start();

    var evt = psp.pathChanged.subscribe(function (path) {
        assert.strictEqual(path, 'foobar');
        psp.stop();
        evt.dispose();
        psp.revert();

        window.setTimeout(function () {
            assert.ok(window.location.hash === '#' || window.location.hash === '');
            QUnit.start();
        },20);
    });

    window.location.hash = '#foobar';
});

QUnit.asyncTest('TestHistoryPathStringProvider', function (assert) {
    expect(2);

    var psp = new ko.route.HistoryPathStringProvider({
        basePath: '^/\w+/index.html'
    });

    psp.start();
        
    window.history.pushState({}, '', '/foo/bar');

    window.setTimeout(function () {
        assert.strictEqual(psp.getPath(), '/foo/bar');

        var evt = psp.pathChanged.subscribe(function (path) {
            assert.strictEqual(window.location.pathname, '/blah/baz/');
            evt.dispose();
            psp.stop();

            window.history.pushState({}, '', orig);

            QUnit.start();
        });

        psp.setPath('/blah/baz/');

    }, 20);
});

QUnit.asyncTest('TestAjaxTemplateProvider', function (assert) {
    expect(12);

    var dtp = new ko.route.AjaxTemplateProvider();

    $('#qunit-fixture').append("<script type='text/html' id='template1'>FooBar</script>')");
    $('#qunit-fixture').append("<script type='text/html' id='template2' data-src='template.html'></script>')");
    $('#qunit-fixture').append("<script type='text/html' id='template3' data-src='should-not-exist.html'></script>')");

    assert.throws(function () {
        dtp.unloadTemplate('template5')
    });

    assert.throws(function () {
        dtp.unloadTemplate(document.body);
    });
            
    dtp.loadTemplate({ templateID: 'template1' }).then(function (result) {
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.statusCode, 203);
        assert.strictEqual(result.template.text.indexOf('Bar'), 3);
        dtp.unloadTemplate('template1');
        assert.strictEqual(result.template.text,'FooBar');
                                        
        dtp.loadTemplate({ templateID: 'template2' }).then(function (result) {
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.statusCode, 200);
            assert.ok(result.template.text.indexOf('<h2>It Works</h2>') >= 0);

            dtp.unloadTemplate(result.template);
            assert.strictEqual(result.template.text, '');
                        
            dtp.loadTemplate({ templateID: 'template3' }).then(undefined, function (result) {
                assert.strictEqual(result.success, false);
                assert.strictEqual(result.statusCode, 404);

                QUnit.start();
            });
        });
    });        
});

QUnit.module('Router');

//#region Fakes

function FakePathProvider() {
    var self = this;
    var lastPath = '';
    var _path = '';

    self.pathChanged = new ko.subscribable();

    self.setPath = function (path) {
        _path = path;
        hashChanged();
    };

    self.getPath = function () {
        return _path;
    };

    self.decorate = function (path) {
        return path;
    };

    self.start = function () {
        // subscribe to the hashchange event if useRouteValues
        hashChanged();
    };

    self.stop = function () {
    };

    self.revert = function (callback) {
        self.setPath(lastPath);
        callback();
    };

    function hashChanged() {
        var path = self.getPath();
        self.pathChanged.notifySubscribers(path);
        lastPath = path;
    }

    self.fakeChange = function (path) {        
        if (path !== _path) {
            _path = path;
            hashChanged();
        }
    };
}

function FakeTemplateProvider() {
    var self = this;
}

FakeTemplateProvider.prototype.loadTemplate = function (view) {
    var response = {
        success: false,
        statusCode: 404,
        template: $('#' + view.templateID)[0]
    };

    if (response.template == null) {
        $('#qunit-fixture').append('<script type="text/html" id="' + view.templateID + '" data-src="' + view.templateSrc + '"></script>');
        response.template = $('#' + view.templateID)[0];
    }

    if (response.template.getAttribute("data-src") === 'template.html' || response.template.getAttribute("data-src") == null) {
        response.success = true;
        response.statusCode = 200;
    }

    if (response.statusCode === 200) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(response);
    }    
};

FakeTemplateProvider.prototype.unloadTemplate = function (template) {
    return Promise.resolve(null);
};

function TestModel($router) {
    var self = this;

    self.message = ko.observable('Hello World');

    self.load = function (routeValues) {
        if (routeValues.fail) {
            return false;
        }
        self.message('Hello ' + (routeValues.id || 'World'));
        return true;
    };
};

//#endregion

QUnit.asyncTest('TestInitialize', function(assert) {
    expect(4);

    $('#qunit-fixture').append("<script type='text/html' id='template1'>FooBar</script>");

    var router = new ko.route.ViewRouter({
        templates: [
            { templateID: 'template1' }
        ],
        views: [
            { name: 'home', model: TestModel, templateID: 'template1' },
            { name: 'view1', model: TestModel, templateID: 'template2', templateSrc: 'template.html' },
            { name: 'view2', model: TestModel, templateID: 'template3', templateSrc: 'should-not-exist.html' }
        ],
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider({
            templateContainer: $('#qunit-fixture')[0],
            createTemplates: true
        })        
    });

    router.init();
    window.setTimeout(function () {
        assert.strictEqual(router.view().name, 'home', 'The current view name should be correct');
        assert.strictEqual(router.view().modelInstance.message(), 'Hello World');
        assert.strictEqual($('#qunit-fixture #template2').length, 0, 'template2 should not exist');
        assert.strictEqual($('#qunit-fixture #template3').length, 0, 'template3 should not exist');
        QUnit.start();
    }, 1);
});

QUnit.test('TestResolve', function (assert) {
    expect(2);

    $('#qunit-fixture').append("<script type='text/html' id='template1'>FooBar</script>");

    var router = new ko.route.ViewRouter({
        views: [
            { name: 'default', model: TestModel, templateID: 'template1' },
            { name: 'other', model: TestModel, templateID: 'template1' },
            { name: 'foo', area: 'bean', model: TestModel, templateID: 'template1' },
            { name: 'default', area: 'bean', model: TestModel, templateID: 'template1' }
        ],
        areas: [
            { name: 'bean' },
            { name: 'curd' }
        ],
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider({
            templateContainer: $('#qunit-fixture')[0],
            createTemplates: true
        }),
        routes: [
            {
                template: '{area=bean}/{view}/{action?}/{id?}',
                defaults: { area: 'bean', view: 'default', action: 'index' },
            },
            {
                template: '{area=curd}/{view}/{action?}/{id?}',
                defaults: { area: 'curd', view: 'default', action: 'index' },
            },
            {
                template: '{view}/{action?}/{id?}',
                defaults: { view: 'default', action: 'index' },
            }
        ]
    });

    router.init();
    assert.strictEqual(router.resolve({ view: 'foo', action: 'bar' }), 'foo/bar');

    router.pathProvider.setPath('bean/default');
    assert.strictEqual(router.resolve({ view: 'foo', action: 'bar' }), 'bean/foo/bar');
    
});

QUnit.asyncTest('TestRespondToPathChanges', function (assert) {
    expect(2);
    
    $('#qunit-fixture').append("<script type='text/html' id='template1'>FooBar</script>");
    
    var sub;
    var router = new ko.route.ViewRouter({
        views: [
            { name: 'home', model: TestModel, templateID: 'template1' },
            { name: 'view1', model: TestModel, templateID: 'template2', templateSrc: 'template.html' }
        ],
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider({
            templateContainer: $('#qunit-fixture')[0],
            createTemplates: true
        })        
    });

    router.init();

    router.pathProvider.fakeChange('view1/Justin');
    window.setTimeout(function () {
        assert.strictEqual(router.view().modelInstance.message(), 'Hello Justin');

        router.pathProvider.fakeChange('home/IdForView1');
        window.setTimeout(function () {
            assert.strictEqual(router.view().modelInstance.message(), 'Hello IdForView1');

            QUnit.start();
        }, 1);
    }, 1);    

});

QUnit.asyncTest('TestUpdateAfterLoad', function (assert) {
    expect(7);

    function ViewModel($router) {
        var self = this;
        var loaded = false;

        self.id = null;

        self.load = function (routeValues) {
            loaded = true;
            self.id = routeValues.id;
            return true;
        };

        self.update = function (routeValues) {
            assert.ok(loaded, 'load should be called before update');
            self.id = routeValues.id;
        };

        self.unload = function () {
            assert.ok(loaded, 'load should be called before unload');
        };
    };
    
    var router = new ko.route.ViewRouter({
        views: [
            { name: 'home', model: TestModel, templateID: 'template1', templateSrc: 'template.html' },
            { name: 'foo', model: ViewModel, templateID: 'template2', templateSrc: 'template.html' },
        ],       
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider({
            templateContainer: $('#qunit-fixture')[0],
            createTemplates: true
        })
    });

    router.init();

    router.navigate('foo/abc');
    window.setTimeout(function () {
        var instance = router.view().modelInstance;
        assert.strictEqual(instance.id, 'abc');

        router.navigate('foo/def');
        window.setTimeout(function () {
            assert.strictEqual(instance, router.view().modelInstance, 'should be same instance');
            assert.strictEqual(instance.id, 'def');

            router.navigate('home');
            window.setTimeout(function () {                
                assert.strictEqual(router.view().name, 'home');

                QUnit.start();
                router.dispose();
            }, 1);
        },1)
    },1)
   
});

QUnit.asyncTest('TestListDetailScenario', function (assert) {
    expect(7);

    function ListViewModel($router, $channel) {
        var self = this;
        var loaded = false;

        self.list = ko.observableArray();
        self.dateLoaded = ko.observable();

        self.load = function (routeValues) {
            if (routeValues.action === 'search') {
                if (!loaded) {
                    self.list([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
                    self.dateLoaded(new Date().getTime() * Math.random());
                }
                loaded = true;
            } else {
                self.list.removeAll();
                self.dateLoaded(null);
            }
            return true;
        };

        self.update = function (routeValues) {
            self.load(routeValues);
        };

        self.unload = function (e) {
        };

    };

    function DetailViewModel($router, $channel) {
        var self = this;
        var loaded = false;

        self.item = ko.observable();

        self.load = function (routeValues) {
            self.item(routeValues.id);
            loaded = true;
            return true;
        };
    };

    var router = new ko.route.ViewRouter({
        views: [
            { name: 'home', model: ListViewModel, templateID: 'template1', templateSrc: 'template.html', singleton: true },
            { name: 'detail', model: DetailViewModel, templateID: 'template2', templateSrc: 'template.html' },
        ],
        routes: [
               {
                   template: '{view}/{action?}/{id?}',
                   defaults: { view: 'home', action: 'index' },
               }
        ],
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider({
            templateContainer: $('#qunit-fixture')[0],
            createTemplates: true
        })
    });

    router.init();
    
    window.setTimeout(function () {
        assert.strictEqual(router.view().modelInstance.list().length, 0);

        router.navigate({ view: 'home', action: 'search' });
        window.setTimeout(function () {
            var listLoaded = router.view().modelInstance.dateLoaded();
            assert.ok(listLoaded);
            assert.strictEqual(router.view().modelInstance.list().length, 10);

            router.navigate({ view: 'detail', action: 'view', id: 1 });
            window.setTimeout(function () {
                assert.strictEqual(router.view().modelInstance.item(), '1');

                router.navigate({ view: 'home', action: 'search' });
                window.setTimeout(function () {
                    assert.strictEqual(router.view().modelInstance.dateLoaded(), listLoaded);
                    assert.strictEqual(router.view().modelInstance.list().length, 10);

                    router.navigate({ view: 'home' });
                    window.setTimeout(function () {
                        assert.strictEqual(router.view().modelInstance.list().length, 0);
                        QUnit.start();
                    }, 1);
                }, 1)
            }, 1);
        }, 1);
    }, 1);
});

QUnit.asyncTest('TestAreaRouting', function (assert) {
    expect(13);

    function ViewModel($router) {
        var self = this;
        var loaded = false;

        self.data = null;
        
        self.load = function (routeValues) {
            self.data = routeValues;
            return true;
        };
    };
    
    var router = new ko.route.ViewRouter({
        areas: [
            { name: 'foo' },
            { name: 'bar' }
        ],
        views: [
            { name: 'home', model: ViewModel, templateID: 'template1', templateSrc: 'template.html' },
            { name: 'list', area: 'foo', model: ViewModel, templateID: 'template2', templateSrc: 'template.html' },
            { name: 'detail', area: 'foo', model: ViewModel, templateID: 'template1', templateSrc: 'template.html' },
            { name: 'list', area: 'bar', model: ViewModel, templateID: 'template2', templateSrc: 'template.html' },
            { name: 'detail', area: 'bar', model: ViewModel, templateID: 'template2', templateSrc: 'template.html' },
        ],
        routes: [
               {
                   template: '{view}/{action?}/{id?}',
                   defaults: { view: 'home', action: 'index' },
               }
        ],
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider({
            templateContainer: $('#qunit-fixture')[0],
            createTemplates: true
        })
    });

    router.init();

    window.setTimeout(function () {
        assert.strictEqual(router.view().modelInstance.data.view, 'home');

        assert.strictEqual(router.resolve({ view: 'home' }), 'home/index');
        assert.strictEqual(router.resolve({ view: 'home', id: 123 }), 'home/index/123');
        assert.strictEqual(router.resolve({ view: 'home', id: 123 }), 'home/index/123');

        // foo area
        assert.strictEqual(router.resolve({ view: 'home', area: 'foo' }), 'foo/home/index');
        assert.strictEqual(router.resolve({ view: 'home', area: 'foo', id: 123 }), 'foo/home/index/123');
        assert.strictEqual(router.resolve({ view: 'home', area: 'foo', id: 123 }), 'foo/home/index/123');

        router.pathProvider.fakeChange('foo/list');
        window.setTimeout(function () {

            assert.strictEqual(router.view().modelInstance.data.area, 'foo');
            assert.strictEqual(router.view().modelInstance.data.view, 'list');
            assert.strictEqual(router.view().modelInstance.data.action, 'index');

            router.pathProvider.fakeChange('bar/detail/baz');
            window.setTimeout(function () {
                assert.strictEqual(router.view().modelInstance.data.area, 'bar');
                assert.strictEqual(router.view().modelInstance.data.view, 'detail');
                assert.strictEqual(router.view().modelInstance.data.action, 'baz');

                QUnit.start();
            }, 1);
        }, 1);
    }, 1);
});

QUnit.asyncTest('TestModelOrTemplateLoadFailure', function (assert) {
    expect(2);

    $('#qunit-fixture').append("<script type='text/html' id='template1'>FooBar</script>");
    $('#qunit-fixture').append("<script type='text/html' id='errorTemplate'>Error</script>");

    var sawError = false;

    var router = new ko.route.ViewRouter({
        views: [
            { name: 'home', model: TestModel, templateID: 'template1' },
            { name: 'view1', model: TestModel, templateID: 'template2', templateSrc: 'should-not-exist.html' },
            { name: 'view2', model: TestModel, templateID: 'template1' }
        ],
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider({
            templateContainer: $('#qunit-fixture')[0],
            createTemplates: true
        })
    });

    router.init();
    
    router.pathProvider.fakeChange('/view1/');

    window.setTimeout(function () {
        assert.strictEqual(router.view().content, 'An error occurred while loading the view.');

        router.pathProvider.fakeChange('/view2/?fail=123');
        window.setTimeout(function () {
            assert.ok(true);
            QUnit.start();
        }, 1);        
    }, 1);

//    sub.dispose();
});

QUnit.asyncTest('TestBindingLoadFailure', function (assert) {
    expect(2);

    $('#qunit-fixture').append("<script type='text/html' id='template1'>FooBar</script>");
    $('#qunit-fixture').append("<script type='text/html' id='errorTemplate'>ERROR TEMPLATE CONTENT</script>");
    $('#qunit-fixture').append("<div id='router' data-bind='routeTemplate: $data'></div>");

    var router = new ko.route.ViewRouter({
        views: [
            { name: 'home', model: TestModel, templateID: 'template1' },
            { name: 'view1', model: TestModel, templateID: 'template2', templateSrc: 'should-not-exist.html' },
            { name: 'view2', model: TestModel, templateID: 'template1' }
        ],
        errorTemplateID: 'errorTemplate',
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider({
            templateContainer: $('#qunit-fixture')[0],
            createTemplates: true
        })
    });

    ko.applyBindings(router, $('#router')[0]);
    
    window.setTimeout(function () {
        assert.strictEqual($('#router').text(), 'FooBar');
        router.navigate('/view1');
        window.setTimeout(function () {
            assert.strictEqual($('#router').text(), 'ERROR TEMPLATE CONTENT');
            QUnit.start();
        });
    }, 1);
});

QUnit.asyncTest('TestObservableView', function (assert) {
    expect(5);

    $('#qunit-fixture').append("<script type='text/html' id='template1'>FooBar</script>");

    var router = new ko.route.ViewRouter({
        views: [
            { name: 'home', model: TestModel, templateID: 'template1' },
            { name: 'view1', model: TestModel, templateID: 'template1' },
            { name: 'view2', model: TestModel, templateID: 'template1' }
        ],
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider({
            templateContainer: $('#qunit-fixture')[0]
        })        
    });

    router.init();

    window.setTimeout(function () {
        assert.strictEqual(router.view().name, 'home', 'router should be at home view');

        var lastView;
        router.view.subscribe(function (view) {
            lastView = view;
        });
        assert.equal(lastView, null);

        router.pathProvider.fakeChange('view1');
        window.setTimeout(function () {
            assert.strictEqual(lastView.name, 'view1');

            router.pathProvider.fakeChange('view2');
            window.setTimeout(function () {
                assert.strictEqual(lastView.name, 'view2');
                                
                router.setTemplate('template2');
                window.setTimeout(function () {
                    assert.strictEqual(lastView.activeTemplateID(), 'template2');
                    
                    QUnit.start();
                }, 1);                
            }, 1);
        }, 1);
    }, 1);
});

QUnit.asyncTest('LoadingEvents', function (assert) {
    expect(4);

    $('#qunit-fixture').append("<script type='text/html' id='template1'>FooBar</script>");
    var loadingHits = 0;
    var loadedHits = 0;
    var router = new ko.route.ViewRouter({
        views: [
            { name: 'home', model: TestModel, templateID: 'template1', templateSrc: 'template.html' },
            { name: 'view1', model: TestModel, templateID: 'template2', templateSrc: 'template.html' },            
        ],
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider({
            templateContainer: $('#qunit-fixture')[0]        
        })        
    });

    router.onLoading.subscribe(function () {
        loadingHits++;
    });

    router.onLoaded.subscribe(function () {
        loadedHits++;
    });

    router.init();

    window.setTimeout(function () {
        assert.strictEqual(loadingHits, 1);
        assert.strictEqual(loadedHits, 1)


        router.pathProvider.fakeChange('home/Justin');
        router.pathProvider.fakeChange('view1/Bob');

        window.setTimeout(function () {

            assert.strictEqual(loadingHits, 2);
            assert.strictEqual(loadedHits, 2);

            QUnit.start();
        }, 1);
    }, 1);       
});

QUnit.test('TestAddViews', function (assert) {
    $('#qunit-fixture').append("<script type='text/html' id='template1'>FooBar</script>");

    var router = new ko.route.ViewRouter({
        views: [
            { name: 'home', model: TestModel, templateID: 'template1', templateSrc: 'template.html' },
            { name: 'view1', model: TestModel, templateID: 'template2', templateSrc: 'template.html' },
        ],
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider({
            templateContainer: $('#qunit-fixture')[0]
        })        
    });

    expect(2);

    router.addViews([        
        { name: 'view3', model: TestModel, templateID: 'template2', templateSrc: 'template.html' }
    ]);

    router.init();

    var view3 = router.getView('view3');
    assert.ok(view3);

    router.addViews([
        { name: 'view4', model: TestModel, templateID: 'template2', templateSrc: 'template.html' }
    ]);

    var view4 = router.getView('view4');
    assert.ok(view4);

    //assert.throws(function () {
    //    router.addViews([
    //        { name: 'view4', model: TestModel, templateID: 'template2', templateSrc: 'template.html' }
    //    ]);
    //});
});

QUnit.asyncTest('TestAddRoutes', function (assert) {
    $('#qunit-fixture').append("<script type='text/html' id='template1'>FooBar</script>");

    var router = new ko.route.ViewRouter({
        routes:[],
        views: [
            { name: 'view1', model: TestModel, templateID: 'template2', templateSrc: 'template.html' },
            { name: 'home', model: TestModel, templateID: 'template1', templateSrc: 'template.html' },           
            { name: 'home0', model: TestModel, templateID: 'template1', templateSrc: 'template.html' }            
        ],
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider({
            templateContainer: $('#qunit-fixture')[0]
        })        
    });

    expect(4);
    
    router.addRoutes([
        {
            template: '{view}/{action?}/{id?}',
            defaults: { view: 'home', action: 'index' }
        }
    ]);

    router.init();

    assert.throws(function () {
       router.addRoutes();
    });

    assert.throws(function () {
        router.insertRoutes();
    });

    var router2 = new ko.route.ViewRouter({
        routes:[ 
            {
                template: '{view}/{action?}/{id?}',
                defaults: { view: 'home', action: 'index' }
            }
        ],
        views: [
            { name: 'view1', model: TestModel, templateID: 'template2', templateSrc: 'template.html' },
            { name: 'home', model: TestModel, templateID: 'template1', templateSrc: 'template.html' },
            { name: 'home0', model: TestModel, templateID: 'template1', templateSrc: 'template.html' }           
        ],
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider({
            templateContainer: $('#qunit-fixture')[0]
        })        
    });

    router2.insertRoutes([{
        template: '{view}/{action?}/{id?}',
        defaults: { view: 'home0', action: 'index0' }
    }]);

    router2.init();

    window.setTimeout(function () {
        assert.strictEqual(router.view().name, 'home');
        assert.strictEqual(router2.view().name, 'home0');
        QUnit.start();
    }, 1);
});

QUnit.test('TestInit', function (assert) {
    $('#qunit-fixture').append("<script type='text/html' id='template1'>FooBar</script>");

    var router = new ko.route.ViewRouter({
        views: [
            { name: 'home', model: TestModel, templateID: 'template1', templateSrc: 'template.html' },
            { name: 'about', model: TestModel, templateID: 'template1', templateSrc: 'template.html' }
        ],
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider({
            templateContainer: $('#qunit-fixture')[0]
        })
    });

    expect(2);

    assert.throws(function () {
        router.resolve({ foo: 'home' });
    });

    router.init();
 
    assert.strictEqual( router.resolve({ view: 'home' }), 'home');

});

QUnit.test('TestClearRoutes', function (assert) {
    $('#qunit-fixture').append("<script type='text/html' id='template1'>FooBar</script>");

    var router = new ko.route.ViewRouter({
        views: [
            { name: 'home', model: TestModel, templateID: 'template1', templateSrc: 'template.html' },
            { name: 'about', model: TestModel, templateID: 'template1', templateSrc: 'template.html' }
        ],
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider({
            templateContainer: $('#qunit-fixture')[0]
        })
    });

    expect(2);
        
    router.init();

    assert.strictEqual( router.resolve({ view: 'home' }), 'home');
    router.clearRoutes();
    router.addRoutes([
        {
            template: '{view}/{action?}/{id?}',
            defaults: { view: 'home', action: 'foo' }
        }
    ]);
    assert.strictEqual( router.resolve({ view: 'home' }), 'home/foo');
});

QUnit.asyncTest('TestTemplateLoadUnload', function (assert) {
    expect(3);

    $('#qunit-fixture').append("<script type='text/html' id='template1'>FooBar</script>");

    var currentTemplateID;

    var router = new ko.route.ViewRouter({
        views: [
            { name: 'home', model: TestModel, templateID: 'template1', templateSrc: 'template.html' },
            { name: 'view2', model: TestModel, templateID: 'template2', templateSrc: 'template.html' }
        ],
        pathProvider: new FakePathProvider(),
        templateProvider: {
            loadTemplate: function(view){
                currentTemplateID = view.templateID;
                var response = {
                    success: true,
                    statusCode: 200,
                    template: $('#' + view.templateID)[0]
                };
                
                return new Promise(function (resolve) {
                    resolve(response);
                });
            },
            unloadTemplate: function(template){
                assert.strictEqual(template, 'template1', 'template1 should be unloaded when template2 loads');
            }
        }        
    });

    router.init();

    window.setTimeout(function () {
        assert.strictEqual(currentTemplateID, 'template1', 'template1 should have loaded');

        router.pathProvider.fakeChange('view2');
        window.setTimeout(function () {
            assert.strictEqual(currentTemplateID, 'template2', 'template2 should have loaded');
            QUnit.start();
        }, 1);
    }, 1);    
});

QUnit.asyncTest('TestAbortPrevious', function (assert) {
    var fixture = $('#qunit-fixture');

    fixture.append('<div id="content" data-bind="routeTemplate: router"></div>');
    fixture.append("<script type='text/html' id='homeTemplate'>HomeContent</script>");
    fixture.append("<script type='text/html' id='aboutTemplate'>AboutContent</script>");    

    var contentElement = $('#content')[0];

    expect(3);

    var loadCount = 0;

    var vm = {
        load: function (routeValues) {            
            if (routeValues.view === 'home') {
                var def = new $.Deferred();

                window.setTimeout(function () {                    
                    console.log('TestAbortPrevious: loadComplete for home');
                    def.resolve();
                }, 100);

                return def.promise();
            } else {
                console.log('TestAbortPrevious: loadComplete for about');
                return true;
            }
        }
    };

    var router = new ko.route.ViewRouter({
        views: [
            { name: 'home', model: vm, templateID: 'homeTemplate' },
            { name: 'about', model: vm, templateID: 'aboutTemplate' }
        ],
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider({
            templateContainer: fixture[0]
        })
    });

    router.init();

    window.setTimeout(function(){
        assert.equal(router.view().name, null);

        router.navigate({ view: 'about' });
        window.setTimeout(function () {
            assert.strictEqual(router.view().activeTemplateID(), 'aboutTemplate');
        }, 1);

        window.setTimeout(function () {
            // should be aboutTemplate, because the navigate() above should have cancelled the original request
            // event though the load request for the home model completes after this.
            assert.strictEqual(router.view().activeTemplateID(), 'aboutTemplate');
            QUnit.start();
        }, 200);
    },1);
   
});

QUnit.module('Binding');

QUnit.test('TestBinding', function (assert) {
    var fixture = $('#qunit-fixture');
    expect(5);

    fixture.append('<div id="content" data-bind="routeTemplate: router"></div>');
    fixture.append("<script type='text/html' id='template1'>Template1Content</script>");
    fixture.append("<script type='text/html' id='template2'>Template2Content</script>");
    fixture.append("<script type='text/html' id='template3'>Template3Content</script>");

    var contentElement = $('#content')[0];
    var $content = $('#content');
    var initCalled = false;
    var router = {
        view: ko.observable(new ko.route.View({
            content: 'Default Content'
        })),
        init: function () {
            initCalled = true;
        }
    };
    var bindingContext = {
        createChildContext: function () {
            // fake, do nothing
        }
    };

    function value() {
        return router;
    };

    ko.bindingHandlers.routeTemplate.init($content[0], value, {}, {}, bindingContext);
    assert.strictEqual(initCalled, true);
    assert.strictEqual($content.text(), 'Default Content');

    router.view(new ko.route.View({
        name: 'test',
        activeTemplateID: 'template1',
        modelInstance: {}
    }));
    assert.strictEqual($content.text(), 'Template1Content');

    router.view(new ko.route.View({
        name: 'test',
        activeTemplateID: 'template1',
        modelInstance: { text: 'Hello World!' }
    }));
    assert.strictEqual($content.text(), 'Template1Content');
    router.view().activeTemplateID('template2');
    assert.strictEqual($content.text(), 'Template2Content');
});

QUnit.test('TestAddTemplates', function (assert) {
    var addedView;
    var router = new ko.route.ViewRouter({
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider()
    });

    expect(2);

    assert.equal(router.getView('view1'), null);
    
    router.addViews([
        addedView = { name: 'view1', model: {}, templateID: 'template1' }
    ]);

    assert.strictEqual('view1', router.getView('view1').name);
});

QUnit.asyncTest('TestDefaultPathProvider', function (assert) {
    var router = new ko.route.ViewRouter({
        views: [
            { name: 'home', model: TestModel, templateID: 'template1', templateSrc: 'template.html' }
        ],
        templateProvider: new FakeTemplateProvider()
    });
    var viewChanged = 0;

    expect(3);

    router.view.subscribe(function (view) {
        viewChanged++;

        if (viewChanged === 2) {
            assert.strictEqual(view.templateID, 'template1');
        } else if (viewChanged === 1) {
            assert.strictEqual(view.content, 'Loading...');
        }
    });

    router.init();

    window.setTimeout(function () {
        assert.strictEqual(viewChanged, 2);

        QUnit.start();
    }, 1);    
});