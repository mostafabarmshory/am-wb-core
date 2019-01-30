# api

Three services are passed to the user space and the user has access to:

## $event

### event: Definition and Usage

Events is what the user can define over every widgets. For example the user can define 'onClick' 
event for a widget to do special work when the widget is clicked.

The user could define couple of events. 
In the data model, events are saved in a 'json' object.

Here, There is an example shows how the events are stored in model:

    {
        "type": "Group", // or every widget
        "event": {
            "click": "write code here",
            "mouseout": "write code here",
            "mouseover": "write code here"
        } 
    }


### What events are supported?

The following events are supported and available to the user.

- click : The event occurs when the user clicks on an element.
- mouseout : The event occurs when a user moves the mouse pointer out of an element, or out of one of its children.
- mouseover: The event occurs when the pointer is moved onto an element, or onto one of its children.

## $widget

$widget provides some methods to the user. Depends on what type the widget is, the user can use them.
$widget methods are listed below:


### getType()

All widgets have this method. 
The user can get the type of widget using getType() method.


### isRoot()

All widgets have this method.
The user can checks the widget to see if it is root using isRoot() method.


### getParent()

All widgets have this method.
The user can get the parent of a widget using getParent() method.


### getChildren()

If the type is 'Group' then the widget has this method.
The user can get all its children using getChildren() method.


### getChildById(id)

If the type is 'Group' then the widget has this method.
The user can get a special child using getChildById(id).
'id' is an attribute of the all widgets which the user chooses it.


### getValue()

If the type is for example 'Input' or 'Textarea' the widget has this method.
The user can get the value using getValue().

### getEvent()

Returns the event of a widget. If the event is not defined then return an empty object {}.

### style()

style method is provided to the user to define dynamic styles. In this case the user can define some styles
on events. 

Example:

            "event": {
                "click": "alert('Wow!! Click event');",
                "mouseover": "$widget.style({\"background\": {\"color\": \"red\"}});",
                "mouseout": "$widget.style({\"background\": {\"color\": null}});"
            }

Note: 
Now, if the user change the style and then want to come back to the old style it needs to define 
a new style and set the corresponding attributes to the null. It's shown on the example above.



## $http

'$http' now has one method named post.


### post

'post' is used to send information to the server.
Ex. $http.post(url,object);

## $mdeia API Documentation

$media is used to evaluate whether a given media query is true or false given the current device's screen/window size. 
The media query will be re-evaluated on resize, allowing you to register a watch on widget and check if the size of the window is changed.

$media also has pre-programmed support for media queries that match the layout breakpoints:

| Breakpoint | 	mediaQuery                                |
| ---------- | ------------------------------------------ |
| xs	     | (max-width: 599px)                         |
| gt-xs	     | (min-width: 600px)                         |
| sm	     | (min-width: 600px) and (max-width: 959px)  |
| gt-sm	     | (min-width: 960px)                         |
| md	     | (min-width: 960px) and (max-width: 1279px) |
| gt-md	     | (min-width: 1280px)                        |
| lg	     | (min-width: 1280px) and (max-width: 1919px)|
| gt-lg	     | (min-width: 1920px)                        |
| xl	     | (min-width: 1920px)                        |
| landscape	 | landscape                                  |
| portrait	 | portrait                                   |
| print	     | print                                      |

See [Material Design's Layout - Adaptive UI](https://material.google.com/layout/responsive-ui.html) for more details.

### Usage

put this pice of the code in the resize event and then check if the layout change:

	if($media('gt-sm')){
		widget.style('layout.direction', 'row');
	} else {
		widget.style('layout.direction', 'column');
	}


	if($media('gt-sm')){
		$widget.style('background', 'red');
	} else {
		$widget.style('background', 'blue');
	}
