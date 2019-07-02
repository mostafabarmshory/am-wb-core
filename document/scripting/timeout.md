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

## Where $timeout is written?

Now, $timeout should be written through initialization of a widget. When a widget is loaded at first, it's init 
function is called. During this function all timeout functions are defined. 
Also, on this init function it is needing to set destroy for each timeout function. 
When a widget is destroyed it fires a 'destroy' event. On init function it is a listener on 'destroy' event and 
destroys all timeouts are set on widget.
timeouts also can define over each of events. List of supported events are as follow:
    - init:
    - click 
    - dbclick
    - mouseout
    - mouseover
    - mouseenter
    - mouseleave
    - mousedown
    - mouseup
    - resize
    - intersection

###Example: 

Define and destroy timeout on a widget:

    var to1, to2;
    to1 = $timeout(f1(), 1000);

    $widget.on('click', function () {
        to2 = $timeout(f2(), 1000);
    });

    $widget.on('destroy', function () {
        $timeout.cancel(to1);
        $timeout.cancel(to2);
    });

