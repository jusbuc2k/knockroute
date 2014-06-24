/// <reference path="http://code.jquery.com/qunit/qunit-1.14.0.js" />
/// <reference path="http://ajax.aspnetcdn.com/ajax/knockout/knockout-3.0.0.js" />
/// <reference path="../src/knockroute.js" />

QUnit.test('TestNoConflict', function (assert) {
    expect(3);

    assert.ok(kr != null, 'kr should be defined');

    var tmp = kr.noConflict();

    assert.ok(kr == null, 'kr should NOT be defined');
    assert.ok(typeof tmp === 'object' && tmp.Route, 'tmp should be kr');

    window.kr = tmp;
});

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

QUnit.test('ParseRoute', function(assert) {
    expect(8);

    var valueChars = '[\\w\\.\\-\\$\\s\\{\\}\\|\\^\\*\\(\\)\\[\\]]+';
    var suffix = '\\??.*';
    
    var goodRoute = new kr.Route('/{view}');
    assert.strictEqual(goodRoute.regex, '^/(' + valueChars + ')' + suffix);
    assert.strictEqual(goodRoute.elements.length, 1);
        
    var badRoute = new kr.Route('/{view');
    assert.strictEqual(badRoute.regex, null);
    assert.strictEqual(badRoute.elements.length, 0);

    goodRoute = new kr.Route('/{view}/{id}');
    assert.strictEqual(goodRoute.regex, '^/(' + valueChars + ')/(' + valueChars + ')' + suffix);
    assert.strictEqual(goodRoute.elements.length, 2);

    goodRoute = new kr.Route('/{view}/{id}/{bar}');
    assert.strictEqual(goodRoute.regex, '^/(' + valueChars + ')/(' + valueChars + ')/(' + valueChars + ')' + suffix);
    assert.strictEqual(goodRoute.elements.length, 3);
});

QUnit.test('TestRouteMatch', function (assert) {
    expect(12);

    var path = '/Foo/123/Blah';

    var route1 = new kr.Route('/{view}');
    assert.ok(route1.match(path), 'Path should partial match');
    var rv = route1.extractRouteValues(path);
    assert.notEqual(rv, null);
    assert.strictEqual(rv.view,'Foo');
        
    var route2 = new kr.Route('/{view}/{id}');
    assert.ok(route2.match(path), 'Path should partial match');
    rv = route2.extractRouteValues(path);
    assert.notEqual(rv, null);
    assert.strictEqual(rv.view, 'Foo');
    assert.strictEqual(rv.id, '123');

    var route3 = new kr.Route('/{view}/{id}/{bar}');
    assert.ok(route3.match(path), 'Path should exact match');
    rv = route3.extractRouteValues(path);
    assert.notEqual(rv, null);
    assert.strictEqual(rv.view, 'Foo');
    assert.strictEqual(rv.id, '123');
    assert.strictEqual(rv.bar, 'Blah');
});

QUnit.test('TestRouteMatchWithDataTypeParsing', function (assert) {
    expect(3);

    var path = '/123.456/789.123/2a';
    var routeValues = new kr.Route('/{foo:int}/{bar:float}/{baz:hex}').extractRouteValues(path);

    assert.strictEqual(routeValues.foo, 123);
    assert.strictEqual(routeValues.bar, 789.123);
    assert.strictEqual(routeValues.baz, 42);
});

QUnit.test('TestRouteResolvePath', function (assert) {
    expect(1);

    var route = new kr.Route('/{foo}/{bar}')

    var t = route.resolve({ foo: 'blah', bar: 'test' });

    assert.strictEqual(t, '/blah/test');        
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
    var route = new kr.Route('{foo}-{bar}+{baz}&{blah}.{ext}');
    assert.strictEqual(route.match(path), true);
    
    var rv = route.extractRouteValues(path);

    assert.strictEqual(rv.foo, 'a b c');
    assert.strictEqual(rv.bar, 'd*ef');
    assert.strictEqual(rv.baz, '[123]');
    assert.strictEqual(rv.blah, '9{9}9');
    assert.strictEqual(rv.ext, 't$x$t');    
});

QUnit.test('TestRouteWithQueryString', function (assert) {
    expect(3);

    var path = '/Foo/123?id=456&foo=bar';

    var route = new kr.Route('/{view}/{id}');    
    var rv = route.extractRouteValues(path);

    assert.strictEqual(rv.view, 'Foo');
    assert.strictEqual(rv.id, '123');
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