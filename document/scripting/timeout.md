# $timeout API documentation

AngularJS's wrapper for window.setTimeout. The fn function is wrapped into a try/catch block and delegates any exceptions to $exceptionHandler service.

The return value of calling $timeout is a promise, which will be resolved when the delay has passed and the timeout function, if provided, is executed.

To cancel a timeout request, call $timeout.cancel(promise).

In tests you can use $timeout.flush() to synchronously flush the queue of deferred functions.

If you only want a promise that will be resolved after some specified delay then you can call $timeout without the fn function.                                   |

See [more details](https://github.com/angular/angular.js/blob/master/src/ng/timeout.js#L13).

## Usage

Example: 

Define a timeout:

  var pull = $timeout($scope.loadPosts, 5000); // pull every 5 seconds. $scope.loadPosts is a function in scope.

To cancel timeout:

  $timeout.cancel(pull);