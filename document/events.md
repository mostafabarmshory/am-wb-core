# event

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


## Type of events

### events for the users

The following events are supported and available to the user.

- click : The event occurs when the user clicks on an element.
- mouseout : The event occurs when a user moves the mouse pointer out of an element, or out of one of its children.
- mouseover: The event occurs when the pointer is moved onto an element, or onto one of its children.

### events for the developers

The following events are supported and available to the developer. These events just work in editing mode.

- select: The event occurs when a widget is selected.
- unselect: The event occurs when a widget goes out from selected state.
- delete: The event occurs when a widget is deleted.
- newchild: The event occurs when a widget is added to a group.