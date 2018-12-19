# api

Three services are passed to the user space and the user has access to:

## 1- $event

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

## 2- $widget

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



## 3- $http

'$http' now has one method named post.


### post

'post' is used to send information to the server.
Ex. $http.post(url,object);



