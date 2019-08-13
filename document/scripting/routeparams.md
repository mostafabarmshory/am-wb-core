# routeParams

The routeParams object is supported by all browser and the user can get access to the route parameters 
using this service.

All global angularJS objects, functions, and variables automatically become members of the routeParams object.

See 'https://docs.angularjs.org/api/ngRoute/service/$routeParams' for a complete details

##Overview

The $routeParams service allows you to retrieve the current set of route parameters.

Requires the ngRoute module to be installed.

The route parameters are a combination of $location's search() and path(). The path parameters are extracted
when the $route path is matched.

In case of parameter name collision, path params take precedence over search params.

The service guarantees that the identity of the $routeParams object will remain unchanged (but its properties
will likely change) even when a route change occurs.

Note that the $routeParams are only updated after a route change completes successfully.
This means that you cannot rely on $routeParams being correct in route resolve functions. Instead you can use $route.current.params to access the new route's parameters.