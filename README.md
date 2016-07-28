# KnockRoute

*This is a work in progress*

Simple view model and template router for Knockout.

- Designed to use in the browser.
- Designed to build small or medium sized Single Page Applications.
- Provides routing of a URI to a model and template (HTML) using [onhashchange](https://developer.mozilla.org/en-US/docs/Web/API/Window.onhashchange) or [popstate](https://developer.mozilla.org/en-US/docs/Web/API/Window.onpopstate).
- Provides parsing of route segments into "route values"
 - Supports data type parsing into int, float, hex
 - Supports segment constraints
 - Supports segment data type parsing (int, float, hex)
 - ASP.NET inspired route template syntax
- Area support for grouping views into functional areas (e.g. /person/list/, /person/view/, /widget/list/, etc.)

## Getting Started

First, you need a working understanding of [Knockout](http://knockoutjs.com/), observables, bindings, etc.

### Installation and Basic Use

#### NPM

    npm install knockroute

#### bower

    bower install knockroute

#### Usage in Browser

Add a script reference to knockroute.js, then use the routeTemplate binding. Alternatively, you can use an AMD module loader to load the script, in which case knockroute does *not* attach itself to the ko object.

```html

<div data-bind="routeTemplate: router"></div>

<!-- jQuery only required for the default ajax template provider (uses $.ajax) -->
<script src="//code.jquery.com/jquery-1.11.0.min.js"></script>

<script src="//ajax.aspnetcdn.com/ajax/knockout/knockout-3.0.0.js"></script>
<script src="knockroute.js"></script>

<script>    

    // Define view models here.

    var hostModel = {
        router: new ko.route.ViewRouter({
            views: [
                { name: 'home', model: HomeModel, templateID: 'homeTemplate' },
                { name: 'about', model: ListModel, templateID: 'listTemplate' },
                { name: 'contact', model: DetailModel, templateID: 'detailTemplate' }
            ],
            routes: [
                {
                    template: '{view}/{action?}/{id:int?}',
                    defaults: { view: 'home', action: 'index' },
                }
            ],
            templateProvider: 'ajax'
        })
    };

    ko.applyBindings(hostModel);
</script>

<script id="homeTemplate" type="text/html">
    <h1>Hello World</h1>
    <a href="#/list">List View</a>
</script>
<script id="listTemplate" type="text/html" data-src="ListTemplate.html"></script>
<script id="detailTemplate" type="text/html" data-src="DetailTemplate.html"></script>

```


