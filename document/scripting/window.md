# Window

The window object is supported by all browsers. It represents the browser's window.

All global JavaScript objects, functions, and variables automatically become members of the window object.

Global variables are properties of the window object.

Global functions are methods of the window object.

## Location 

The window.location object contains information about the current location. It is
fully depends on the platform.

Here is list of all attributes

- $window.location.href
- $window.location.hostname
- $window.location.pathname

### href

Returns the href (URL) of the current page.

The host name is supported in web framework.

This may support on natives.

 
### hostname

returns the domain name of the web host.

The host name is supported in web framework.

This may support on natives.

### pathname

returns the path and filename of the current page

The path name is supported in both web and native frameworks.

## Screen

The window.screen object contains information about the user's screen.

Properties:

- $window.screen.width
- $window.screen.height
- $window.screen.availWidth
- $window.screen.availHeight
- $window.screen.colorDepth
- $window.screen.pixelDepth

## Popup alert

JavaScript has three kind of popup boxes: Alert box, Confirm box, and Prompt box.

	$window.alert("sometext");