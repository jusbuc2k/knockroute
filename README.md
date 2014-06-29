# KnockRoute

Simple view model and template router for Knockout.

*This is a work in progress*

- Designed to use in the browser.
- Designed to build small or medium sized Single Page Applications.
- Provides routing of a URI to a model and template (HTML) using [onhashchange](https://developer.mozilla.org/en-US/docs/Web/API/Window.onhashchange) or [popState](https://developer.mozilla.org/en-US/docs/Web/API/Window.onpopstate).
- Provides parsing of route segmennts into "route values"
 - Supports data type parsing into int, float, hex
 - Supports segment constraints
 - Supports segment data type parsing (int, float, hex)

## Getting Started

First, you need a working understanding of [Knockout](http://knockoutjs.com/), observables, bindings, etc.

### Installation

Add a script reference to knockroute.js

```html

<div data-bind="router: router"></div>

<script src="http://ajax.aspnetcdn.com/ajax/knockout/knockout-3.0.0.js"></script>
<script src="knockroute.js"></script>

```

Blah blah blah more stuff here blah blah blah
