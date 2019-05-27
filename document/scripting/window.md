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

The $window service has three kind of popup boxes: Alert box, Confirm box, and Prompt box.

Here is an example of alert:

	$window.alert("sometext");

### Alert

TODO: 

### Confirm

TODO: 

### Prompt

TODO: 

## Preferences

TODO: 

### Title

TODO: 

Setting the title:

	$window.setTitle('{title}');

Getting the title:

	var title = $window.getTitle();

### Description

TODO: 

Setting the title:

	$window.setDescription('{title}');

Getting the title:

	var description = $window.getDescription();


### Icon

TODO: 

Setting the icon:

	$window.setIcon('{icon/url}');

Getting the title:

	var iconUrl = $window.getIcon();


### Titlebar

TODO: 

Setting the title bar visible:

	$window.setTitlebarVisible(true);

Getting the title:

	var titlebarVisible = $window.isTitlebarVisible();

### Fullscreen


TODO: 


Setting the full screen mode:

	$window.setFullscreen(true);

Getting the full screen mode:

	var toolbarVisible = $window.isFullscreen();


## Management

### Open

The open() method opens a new window, a new tab, or a dialog depending on your browser settings.

Tip: Use the close() method to close the window.

Syntax

	$window.open(URL, name, specs, replace)

For example suppose you are about to open a page in internal window:

	$window.open('http://localhost', 'internal view', {
		internal: true,
		size: {
			width: 200,
			height: 300
		},
		position: {
			x: 0,
			y: 0
		}
	});

Following properties are used for internal window:

- position.x
- position.y
- size.width
- size.height
- closeOnEscape
- language
- showTitle



#### URL	

Optional. 

Specifies the URL of the page to open. If no URL is specified, a new window/tab with about:blank is opened

#### name	

Optional. 

Specifies the target attribute or the name of the window. The following values are supported:

- _blank - URL is loaded into a new window, or tab. This is default
- _parent - URL is loaded into the parent frame
- _self - URL replaces the current page
- _top - URL replaces any framesets that may be loaded
- name - The name of the window (Note: the name does not specify the title of the new window)

#### specs	

Optional. 

An object list of items. The following values are supported:

- channelmode=false|true|1|0 : Whether or not to display the window in theater mode. Default is no. IE only
- directories=true|false|1|0	Obsolete. Whether or not to add directory buttons. Default is yes. IE only
- fullscreen=true|false|1|0	Whether or not to display the browser in full-screen mode. Default is no. A window in full-screen mode must also be in theater mode. IE only
- height=pixels	The height of the window. Min. value is 100
- left=pixels	The left position of the window. Negative values not allowed
- location=true|false|1|0	Whether or not to display the address field. Opera only
- menubar=true|false|1|0	Whether or not to display the menu bar
- resizable=true|false|1|0	Whether or not the window is resizable. IE only
- scrollbars=true|false|1|0	Whether or not to display scroll bars. IE, Firefox & Opera only
- status=yes|no|1|0	Whether or not to add a status bar
- titlebar=yes|no|1|0	Whether or not to display the title bar. Ignored unless the calling application is an HTML Application or a trusted dialog box
- toolbar=yes|no|1|0	Whether or not to display the browser toolbar. IE and Firefox only
- top=pixels	The top position of the window. Negative values not allowed
- width=pixels	The width of the window. Min. value is 100

Here is an example 

	$window.open('/api/v2/cms/contents/home#footer', 
		'footer preview',
		{
			titlebar: false,
			menubar: false,
			status: false,
			top: 0,
			left: 0
		},
		false);

### Close



