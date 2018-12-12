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
            "onClick": "write code here",
            "onMouseOut": "write code here"
        } 
    }


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


## 3- $http

'$http' now has one method named post.


### post

'post' is used to send information to the server.
Ex. $http.post(url,object);



