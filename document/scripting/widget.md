
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


