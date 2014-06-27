/// <reference path="http://code.jquery.com/qunit/qunit-1.14.0.js" />
/// <reference path="http://code.jquery.com/jquery-1.11.0.min.js" />
/// <reference path="http://ajax.aspnetcdn.com/ajax/knockout/knockout-3.0.0.js" />
/// <reference path="../src/knockroute.js" />

var orig = window.location.href;

QUnit.done(function () {
    window.history.pushState({}, '', orig);
});

//QUnit.test('Experiment', function () {

//    var route = '/beer/{bar:int}/{baz}.{ext?}';

//    var regex = new RegExp('\\{(\\w+)(:\\w+)?(\\?)?\\}', 'gi');
//    var res;

//    while (res = regex.exec(route)) {
//        console.log(res);
//    }

//});

QUnit.test('TestNoConflict', function (assert) {
    expect(3);

    assert.ok(kr != null, 'kr should be defined');

    var tmp = kr.noConflict();

    assert.ok(kr == null, 'kr should NOT be defined');
    assert.ok(typeof tmp === 'object' && tmp.Route, 'tmp should be kr');

    window.kr = tmp;
});

QUnit.module('Route');

QUnit.test('TestParseQueryString', function (assert) {
    expect(5);

    var qs = kr.utils.parseQueryString('/foo/bar/?test=123&foo=bar');

    assert.strictEqual(qs.test, '123');
    assert.strictEqual(qs.foo, 'bar');

    qs = kr.utils.parseQueryString('/foo/bar/test=123&foo=bar');   
    assert.ok(qs == null);

    qs = kr.utils.parseQueryString(null);        
    assert.ok(qs == null);

    qs = kr.utils.parseQueryString('');
    assert.ok(qs == null);
});

QUnit.test('TestParseRoute', function(assert) {
    expect(4);

    var valueChars = '[\\w\\.\\-\\$\\s\\{\\}\\|\\^\\*\\(\\)\\[\\]]+';
    var suffix = '\\??.*';
    
    var goodRoute = new kr.Route('/{view}');
    //assert.strictEqual(goodRoute.regex, '^/?(' + valueChars + ')' + suffix);
    assert.strictEqual(goodRoute.elements.length, 1);
    
    assert.throws(function () {
        var badRoute = new kr.Route('/{view');        
    });

    goodRoute = new kr.Route('/{view}/{id}');
    //assert.strictEqual(goodRoute.regex, '^/?(' + valueChars + ')/(' + valueChars + ')' + suffix);
    assert.strictEqual(goodRoute.elements.length, 2);

    goodRoute = new kr.Route('/{view}/{id}/{bar}');
    //assert.strictEqual(goodRoute.regex, '^/?(' + valueChars + ')/(' + valueChars + ')/(' + valueChars + ')' + suffix);
    assert.strictEqual(goodRoute.elements.length, 3);
});

QUnit.test('TestMatch', function (assert) {
    expect(16);

    var rv;
    var route1 = new kr.Route('/{view}');    
    assert.ok(rv = route1.match('Foo'), 'Path should match');
    assert.strictEqual(rv.view, 'Foo');
    assert.ok(route1.match('foo/bar') == null);
        
    var route2 = new kr.Route('/{view}/{id}');
    assert.ok(rv = route2.match('/Foo/123'), 'Path should match');
    assert.notEqual(rv, null);
    assert.strictEqual(rv.view, 'Foo');
    assert.strictEqual(rv.id, '123');
    assert.ok(route2.match('foo') != null);
    assert.ok(route2.match('foo/bar/test') == null);

    var route3 = new kr.Route('/{view}/{id}/{bar}');
    assert.ok(rv = route3.match('Foo/123/Blah'), 'Path should match');
    assert.notEqual(rv, null);
    assert.strictEqual(rv.view, 'Foo');
    assert.strictEqual(rv.id, '123');
    assert.strictEqual(rv.bar, 'Blah');
    assert.ok(route3.match('foo') != null);
    assert.ok(route3.match('foo/bar') != null);    
});

QUnit.test('TestOptionalKeys', function (assert) {
    expect(5);

    var path = '/Foo/?bar=123';
    var route = new kr.Route('/{view}/{id?}');
    var rv = route.extractRouteValues(path);
           
    assert.strictEqual(route.match(path), true);
    assert.strictEqual(route.match('/Foo'), true);
    assert.strictEqual(route.match('/Foo/'), true);
    assert.strictEqual(rv.view, 'Foo');
    assert.strictEqual(rv.bar, '123');
                
});

QUnit.test('TestMatchWithDataTypeParsing', function (assert) {
    expect(3);

    var path = '/123.456/789.123/2a';
    var routeValues = new kr.Route('/{foo:int}/{bar:float}/{baz:hex}').extractRouteValues(path);

    assert.strictEqual(routeValues.foo, 123);
    assert.strictEqual(routeValues.bar, 789.123);
    assert.strictEqual(routeValues.baz, 42);
});

QUnit.test('TestResolvePath', function (assert) {
    expect(1);

    var route = new kr.Route('/{foo}/{bar}')

    var t = route.resolve({ foo: 'blah', bar: 'test' });

    assert.strictEqual(t, '/blah/test');        
});

QUnit.test('TestResolvePathWithQueryString', function (assert) {
    expect(2);

    var t1 = new kr.Route('/{foo}/{bar}').resolve({ foo: 'blah', bar: 'test', baz: 123, bean: 'curd' });    
    assert.strictEqual(t1, '/blah/test?baz=123&bean=curd');

    var t2 = new kr.Route('/{foo}/{bar}').resolve({ foo: 'blah', bar: 'test', bean: 'curd' });
    assert.strictEqual(t2, '/blah/test?bean=curd');
});

QUnit.test('TestRouteWithBasePath', function (assert) {
    expect(3);

    var path = '/Foo/Bar/Baz/123';

    var route1 = new kr.Route('/*/*/{view}/{id:int}');
    var rv = route1.extractRouteValues(path);

    assert.strictEqual(route1.match(path), true);
    assert.strictEqual(rv.view, 'Baz');
    assert.strictEqual(rv.id, 123);   
});

QUnit.test('TestRouteSpecialCharacters', function (assert) {
    expect(6);

    var path = 'a b c-d*ef+[123]&9{9}9.t$x$t?foo=bar&test=bill';
    var route = new kr.Route('{foo}-{bar}-{baz}-{blah}-{ext}');
    assert.strictEqual(route.match(path), true);
    
    var rv = route.extractRouteValues(path);

    assert.strictEqual(rv.foo, 'a b c');
    assert.strictEqual(rv.bar, 'd*ef');
    assert.strictEqual(rv.baz, '[123]');
    assert.strictEqual(rv.blah, '9{9}9');
    assert.strictEqual(rv.ext, 't$x$t');    
});

QUnit.test('TestRouteWithQueryString', function (assert) {
    expect(7);

    var path = '/Foo/123?id=456&foo=bar';

    var route = new kr.Route('/{view}/{id}');    
    var rv = route.extractRouteValues(path);

    assert.strictEqual(rv.view, 'Foo');
    assert.strictEqual(rv.id, '123');
    assert.strictEqual(rv.foo, 'bar');

    rv = route.extractRouteValues('/Foo/123/?bean=curd&foo=bar');
    assert.strictEqual(rv.view, 'Foo');
    assert.strictEqual(rv.id, '123');
    assert.strictEqual(rv.bean, 'curd');
    assert.strictEqual(rv.foo, 'bar');
});

QUnit.test('TestRouteValuesEqual', function (assert) {
    expect(2);

    var rv1 = new kr.Route('/*/*/{view}/{id:int}').extractRouteValues('/Foo/Bar/Baz/123');
    var rv2 = new kr.Route('/*/*/{view}/{id:int}').extractRouteValues('/Beer/Can/Baz/123');

    assert.strictEqual(JSON.stringify(rv1), JSON.stringify(rv2));

    var rv1 = new kr.Route('/{view}/{id}').extractRouteValues('/Foo/Bar/Beer/123');
    var rv2 = new kr.Route('/{view}/{id}').extractRouteValues('/Foo/Bar/Cat/456');

    assert.strictEqual(JSON.stringify(rv1), JSON.stringify(rv2));
});

QUnit.module('Providers');

QUnit.asyncTest('TestHashPathStringProvider', function (assert) {
    var psp = new kr.HashPathStringProvider();
    expect(5);

    window.location.hash = '#';

    psp.start();
       
    window.setTimeout(function () {
        assert.strictEqual(psp.getPath(), '');
        psp.setPath('foobar');

        window.setTimeout(function () {
            assert.strictEqual(window.location.hash, '#foobar');
            assert.strictEqual(psp.getPath(), 'foobar');
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
    var psp = new kr.HashPathStringProvider();
    expect(2);

    window.location.hash = '#';
    psp.start();

    var evt = psp.pathChanged.subscribe(function (path) {
        assert.strictEqual(path, 'foobar');
        psp.stop();
        evt.dispose();
        psp.revert();

        window.setTimeout(function () {
            assert.strictEqual(window.location.hash, '');
            QUnit.start();
        },20);
    });

    window.location.hash = '#foobar';
});

QUnit.asyncTest('TestHistoryPathStringProvider', function (assert) {
    expect(2);

    var psp = new kr.HistoryPathStringProvider({
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

QUnit.asyncTest('TestjQueryTemplateProvider', function (assert) {
    expect(12);

    var dtp = new kr.jQueryTemplateProvider();

    $('#qunit-fixture').append("<script type='text/html' id='template1'>FooBar</script>')");
    $('#qunit-fixture').append("<script type='text/html' id='template2' data-src='template.html'></script>')");
    $('#qunit-fixture').append("<script type='text/html' id='template3' data-src='should-not-exist.html'></script>')");

    assert.throws(function () {
        dtp.unloadTemplate('template5')
    });

    assert.throws(function () {
        dtp.unloadTemplate(document.body);
    });
            
    dtp.loadTemplate('template1', function (result) {
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.statusCode, 203);
        assert.strictEqual(result.template.text.indexOf('Bar'), 3);
        dtp.unloadTemplate('template1');
        assert.strictEqual(result.template.text,'');
                                        
        dtp.loadTemplate('template2', function (result) {
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.statusCode, 200);
            assert.ok(result.template.text.indexOf('<h2>It Works</h2>') >= 0);

            dtp.unloadTemplate(result.template);
            assert.strictEqual(result.template.text, '');
                        
            dtp.loadTemplate('template3', function (result) {
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
    };

    self.getPath = function () {
        return _path;
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
        path = self.getPath();
        self.pathChanged.notifySubscribers(path);
        lastPath = path;
    }

    self.fakeChange = function (path) {
        _path = path;
        hashChanged();
    };
}

function FakeTemplateProvider() {
    var self = this;
}

FakeTemplateProvider.prototype.loadTemplate = function (templateID, completeCallback) {
    var response = {
        success: false,
        statusCode: 404,
        template: $('#' + templateID)[0]
    };

    if (response.template.getAttribute("data-src") === 'template.html' || response.template.getAttribute("data-src") == null) {
        response.success = true;
        response.statusCode = 200;
    }

    completeCallback(response);
};

FakeTemplateProvider.prototype.unloadTemplate = function (template) {

};

FakeTemplateProvider.prototype.getOrCreateTemplate = function (templateID, templateSrc, container) {
    var template = $('#'+templateID)[0];

    if (template == null) {
        return $('#qunit-fixture').append('<script type="text/html" id="' + templateID + '" data-src="' + templateSrc + '"></script>')[0];
    } else {
        return template;
    }
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

QUnit.test('TestInitialize', function(assert) {
    expect(4);

    $('#qunit-fixture').append("<script type='text/html' id='template1'>FooBar</script>");

    var router = new kr.ViewRouter({
        views: [
            { name: 'index', model: TestModel, templateID: 'template1' },
            { name: 'view1', model: TestModel, templateID: 'template2', templateSrc: 'template.html' },
            { name: 'view2', model: TestModel, templateID: 'template3', templateSrc: 'should-not-exist.html' }
        ],
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider(),
        templateContainer: $('#qunit-fixture')[0],
        createTemplates: true
    });
                
    assert.strictEqual($('#qunit-fixture #template2').length, 1);
    assert.strictEqual($('#qunit-fixture #template3').length, 1);
        
    assert.strictEqual(router.view().name, 'index');
    assert.strictEqual(router.view().modelInstance.message(), 'Hello World');
});

QUnit.test('TestRespondToPathChanges', function (assert) {
    expect(3);

    $('#qunit-fixture').append("<script type='text/html' id='template1'>FooBar</script>");

    var router = new kr.ViewRouter({
        views: [
            { name: 'index', model: TestModel, templateID: 'template1' },
            { name: 'view1', model: TestModel, templateID: 'template2', templateSrc: 'template.html' },
            { name: 'view2', model: TestModel, templateID: 'template3', templateSrc: 'should-not-exist.html' }
        ],
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider(),
        templateContainer: $('#qunit-fixture')[0],
        createTemplates: true
    });

    router.pathProvider.fakeChange('/index/Justin');
    assert.strictEqual(router.view().modelInstance.message(), 'Hello Justin');

    router.pathProvider.fakeChange('/view1/IdForView1');
    assert.strictEqual(router.view().modelInstance.message(), 'Hello IdForView1');

    assert.throws(function () {
        router.pathProvider.fakeChange('/view2/IdForView2');
    });    
});

QUnit.test('TestFailedLoad', function (assert) {
    expect(2);

    $('#qunit-fixture').append("<script type='text/html' id='template1'>FooBar</script>");

    var router = new kr.ViewRouter({
        views: [
            { name: 'index', model: TestModel, templateID: 'template1' },
            { name: 'view1', model: TestModel, templateID: 'template2', templateSrc: 'should-not-exist.html' },
            { name: 'view2', model: TestModel, templateID: 'template1' }
        ],
        pathProvider: new FakePathProvider(),
        templateProvider: new FakeTemplateProvider(),
        templateContainer: $('#qunit-fixture')[0],
        createTemplates: true
    });

    router.routes.push(new kr.Route('/{view}/'));
        
    assert.throws(function () {
        router.pathProvider.fakeChange('/view1/');
    });

    assert.throws(function () {
        router.pathProvider.fakeChange('/view2/?fail=123');        
    });
});