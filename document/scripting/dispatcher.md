# $dispatcher API documentation
	
## All functions:

### $dispatcher.on(type, callback) 

Add a new event listener for the given type

	$dispatcher.on('/app/account', function($event){
		alert('account state is changed');
	});

It will generate a token for the given callback. The token is used ot manage the call back, for example remove callback from the dispatcher.

See data type section for more information about types.

### $dispatcher.off(type, id) 

Remove a callback based on its token. 

### $dispatcher.waitFor(type, ids) 

Waits for the callbacks specified to be invoked before continuing execution of the current callback. This method should only be used by a callback in response to a dispatched payload.

### $dispatcher.dispatch(type, payload) 

Dispatches a payload to all registered callbacks. Payload contains key and values. You may add extra values to the payload.

### $dispatcher.isDispatching(type) 

Is this Dispatcher currently dispatching.

## Types

We suppose the application is organized in a tree data model. The root part of the application is namd as follow:

	/

### Application data type

The app folder is used to address application data such as current user, setting, configurations and etc.

	/app

There are many subfolder in the application:

- /app/configs
- /app/setting

### Account 

The account folder is used to store current account information

	/account

- /account/permissions
- /account/roles
- /account/groups
- /account/messages

### Tenant

The tenant folder contains information about the current site:

	/tenant

- /tenant/configs
- /tenant/settings
- /tenant/modules



