# event: Definition and Usage

Events is what the user can define over every widgets. For example the user can define 'onClick' 
event for a widget to do special work when the widget is clicked.

The user could define couple of events. 
In the data model, events are saved in a 'json' object.

## Examples

Here, There is an example shows how the events are stored in model:

    {
        "type": "Group", // or every widget
        "event": {
            "onClick": "write code here",
            "onMouseOut": "write code here"
        } 
    }

## What services the user has access to?

Two services are passed to the user space:

1- '$event' 
2- '$widget' 

The user could use these services in the code.




