# $dispatcher API documentation
	
## All functions:

### $dispatcher.on(type, callback) 

    Add a new event listener

### $dispatcher.off(type, id) 

    Remove a callback based on its token. 

### $dispatcher.waitFor(type, ids) 

    Waits for the callbacks specified to be invoked before continuing
    execution of the current callback. This method should only be used by a
    callback in response to a dispatched payload.

### $dispatcher.dispatch(type, payload) 

    Dispatches a payload to all registered callbacks.
    Payload contains key and values. You may add extra values to the 
    payload.

### $dispatcher.isDispatching(type) 

    Is this Dispatcher currently dispatching.

