# Widget

## States&Events

![Widget State](model/widget-state.svg)

Here is list of widget states:

- init: the widget is going to be loaded from data.
- ready: widget is loaded and ready to work.
- edit: widget is going to the edit mode
- deleted: widget is remvoed.

If the state of the widget is going to change then a event of stateChanged will be propagated inot the system. 

## Styles

The style is an specific widget attribute which controll the display of the widget.

### cursor

The cursor property specifies the mouse cursor to be displayed when pointing over an element.

- alias:	The cursor indicates an alias of something is to be created	
- all-scroll:	The cursor indicates that something can be scrolled in any direction	
- auto:	Default. The browser sets a cursor	
- cell:	The cursor indicates that a cell (or set of cells) may be selected	
- context-menu:	The cursor indicates that a context-menu is available	
- col-resize:	The cursor indicates that the column can be resized horizontally	
- copy:	The cursor indicates something is to be copied	
- crosshair:	The cursor render as a crosshair	
- default:	The default cursor	
- e-resize:	The cursor indicates that an edge of a box is to be moved right (east)	
- ew-resize:	Indicates a bidirectional resize cursor	
- grab:	The cursor indicates that something can be grabbed	
- grabbing:	The cursor indicates that something can be grabbed	
- help:	The cursor indicates that help is available	
- move:	The cursor indicates something is to be moved	
- n-resize:	The cursor indicates that an edge of a box is to be moved up (north)	
- ne-resize:	The cursor indicates that an edge of a box is to be moved up and right (north/east)	
- nesw-resize:	Indicates a bidirectional resize cursor	
- ns-resize:	Indicates a bidirectional resize cursor	
- nw-resize:	The cursor indicates that an edge of a box is to be moved up and left (north/west)	
- nwse-resize:	Indicates a bidirectional resize cursor	
- no-drop:	The cursor indicates that the dragged item cannot be dropped here	
- none:	No cursor is rendered for the element	
- not-allowed:	The cursor indicates that the requested action will not be executed	
- pointer:	The cursor is a pointer and indicates a link	
- progress:	The cursor indicates that the program is busy (in progress)	
- row-resize:	The cursor indicates that the row can be resized vertically	
- s-resize:	The cursor indicates that an edge of a box is to be moved down (south)	
- se-resize:	The cursor indicates that an edge of a box is to be moved down and right (south/east)	
- sw-resize:	The cursor indicates that an edge of a box is to be moved down and left (south/west)	
- text:	The cursor indicates text that may be selected	
- URL:	A comma separated list of URLs to custom cursors. Note: Always specify a generic cursor at the end of the list, in case none of the URL-defined cursors can be used	
- vertical-text:	The cursor indicates vertical-text that may be selected	
- w-resize:	The cursor indicates that an edge of a box is to be moved left (west)	
- wait:	The cursor indicates that the program is busy	
- zoom-in:	The cursor indicates that something can be zoomed in	
- zoom-out:	The cursor indicates that something can be zoomed out	
- initial:	Sets this property to its default value. Read about initial	
- inherit:	Inherits this property from its parent element. Read about inherit

## Global Attributes

### accesskey

Specifies a shortcut key to activate/focus an widget.  The accesskey attribute specifies a shortcut key to activate/focus an element.

Note: The way of accessing the shortcut key is varying in different browsers.

However, in most browsers the shortcut can be set to another combination of keys.

Tip: The behavior if more than one element has the same access key differs:

- IE, Firefox: The next element with the pressed access key will be activated
- Chrome, Safari: The last element with the pressed access key will be activated
- Opera: The first element with the pressed access key will be activated

### contenteditable

Specifies whether the content of an element is editable or not

### dir

Specifies the text direction for the content in an element

### draggable

Specifies whether an element is draggable or not

### dropzone

Specifies whether the dragged data is copied, moved, or linked, when dropped

### hidden

Specifies that an element is not yet, or is no longer, relevant
### id

Specifies a unique id for an element
### lang

Specifies the language of the element's content
### spellcheck

Specifies whether the element is to have its spelling and grammar checked or not

### tabindex

Specifies the tabbing order of an element

### title

Specifies extra information about an element

### translate

Specifies whether the content of an element should be translated or not

## Global Event Attributes

HTML has the ability to let events trigger actions in a browser, like starting a JavaScript when a user clicks on an element.

To learn more about programming events, please visit our JavaScript tutorial.

Below are the global event attributes that can be added to HTML elements to define event actions.

### Keyboard Events

#### onkeydown

Fires when a user is pressing a key
#### onkeypress

Fires when a user presses a key
#### onkeyup

Fires when a user releases a key
### Mouse Events
   # 
#### onclick

Fires on a mouse click on the element
#### ondblclick

Fires on a mouse double-click on the element
#### onmousedown

Fires when a mouse button is pressed down on an element
#### onmousemove

Fires when the mouse pointer is moving while it is over an element
#### onmouseout

Fires when the mouse pointer moves out of an element
#### onmouseover

Fires when the mouse pointer moves over an element
#### onmouseup

Fires when a mouse button is released over an element
#### onmousewheel

Deprecated. Use the onwheel attribute instead
#### onwheel

Fires when the mouse wheel rolls up or down over an element

### Drag Events

#### ondrag

Script to be run when an element is dragged

#### ondragend

Script to be run at the end of a drag operation

#### ondragenter

Script to be run when an element has been dragged to a valid drop target

#### ondragleave

Script to be run when an element leaves a valid drop target

#### ondragover

Script to be run when an element is being dragged over a valid drop target

#### ondragstart

Script to be run at the start of a drag operation

#### ondrop

Script to be run when dragged element is being dropped

#### onscroll

Script to be run when an element's scrollbar is being scrolled

### Clipboard Events

#### oncopy

Fires when the user copies the content of an element
#### oncut

Fires when the user cuts the content of an element
#### onpaste

Fires when the user pastes some content in an element

## Media Events

Events triggered by medias like videos, images and audio (applies to all HTML elements, but is most common in media elements, like <audio>, <embed>, <img>, <object>, and <video>).

Tip: Look at our HTML Audio and Video DOM Reference for more information.

### onabort

Script to be run on abort

### oncanplay

Script to be run when a file is ready to start playing (when it has buffered enough to begin)

### oncanplaythrough

Script to be run when a file can be played all the way to the end without pausing for buffering

### oncuechange

Script to be run when the cue changes in a <track> element

### ondurationchange

Script to be run when the length of the media changes

### onemptied

Script to be run when something bad happens and the file is suddenly unavailable (like unexpectedly disconnects)

### onended

Script to be run when the media has reach the end (a useful event for messages like "thanks for listening")

### onerror

Script to be run when an error occurs when the file is being loaded

### onloadeddata

Script to be run when media data is loaded

### onloadedmetadata

Script to be run when meta data (like dimensions and duration) are loaded

### onloadstart

Script to be run just as the file begins to load before anything is actually loaded

### onpause

Script to be run when the media is paused either by the user or programmatically

### onplay

Script to be run when the media is ready to start playing

### onplaying

Script to be run when the media actually has started playing

### onprogress

Script to be run when the browser is in the process of getting the media data

### onratechange

Script to be run each time the playback rate changes (like when a user switches to a slow motion or fast forward mode)

### onseeked

Script to be run when the seeking attribute is set to false indicating that seeking has ended
### onseeking

Script to be run when the seeking attribute is set to true indicating that seeking is active

### onstalled

Script to be run when the browser is unable to fetch the media data for whatever reason

### onsuspend

Script to be run when fetching the media data is stopped before it is completely loaded for whatever reason

### ontimeupdate

Script to be run when the playing position has changed (like when the user fast forwards to a different point in the media)

### onvolumechange

Script to be run each time the volume is changed which (includes setting the volume to "mute")

### onwaiting

Script to be run when the media has paused but is expected to resume (like when the media pauses to buffer more data)