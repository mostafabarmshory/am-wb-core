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

### ??

- caption-side
- backface-visibility
- caret-color
- hanging-punctuation
- table-layout

### Animation

- animation
- animation-name
- animation-duration
- animation-timing-function
- animation-delay
- animation-iteration-count
- animation-direction
- animation-fill-mode
- animation-play-state

### Background

- background
- background-color
- background-image
- background-position
- background-size
- background-repeat
- background-origin
- background-clip
- background-attachment

### Boarder & Autline

#### Outline

- outline
- outline-offset
- outline-width
- outline-style (required)
- outline-color

#### Box

- box-decoration-break
- box-shadow
- box-sizing

#### Border

- border
- border-width
- border-style (required)
- border-color
- border-collapse
- border-spacing

- borderBottom
- borderBottom-width
- borderBottom-style
- borderBottom-color

- borderLeft
- borderLeft-width
- borderLeft-style (required)
- borderLeft-color

- borderRight
- borderRight-width
- borderRight-style (required)
- borderRight-color

- borderTop
- borderTop-width
- borderTop-style (required)
- borderTop-color

##### Radius

- borderRadius
- borderTopRightRadius
- borderTopLeftRadius
- borderBottomLeftRadius
- borderBottomRightRadius

##### Image

- borderImage
- borderImageSource
- borderImageSlice
- borderImageWidth
- borderImageOutset
- borderImageRepeat


### layout

#### Layout

- display
- order
- zIndex
- clear
- float

##### zIndex

The zIndex property specifies the stack order of an widget.

An widget with greater stack order is always in front of an widget with a lower stack order.

Note: z-index only works on positioned widget (position: absolute, position: relative, position: fixed, or position: sticky).

#### Position

- position
- bottom
- left
- right
- top

##### Position

The position property specifies the type of positioning method used for an widget (static, relative, absolute, fixed, or sticky).

- Default value:	static
- Inherited:	no
- Animatable:	no

- static	Widget render in order, as they appear in the document flow	
- absolute	The widget is positioned relative to its first positioned (not static) ancestor element	
- fixed	The widget is positioned relative to the browser window	
- relative	The widget is positioned relative to its normal position, so "left:20px" adds 20 pixels to the widget`s LEFT position
- sticky	The widget is positioned based on the user's scroll position
- initial	Sets this property to its default value. Read about initial	
- inherit	Inherits this property from its parent element

A sticky widget toggles between relative and fixed, depending on the scroll position. It is positioned relative until a given offset position is met in the viewport - then it "sticks" in place (like position:fixed).

Note: Sticky not supported in IE/Edge 15 or earlier. Supported in Safari from version 6.1.	
 
#### overflow

- overflow
- overflowX
- overflowY
- scrollBehavior
 
#### Print

- pageBreakAfter
- pageBreakBefore
- pageBreakInside
 

#### Flex

- alignContent
- alignItems
- alignSelf
- justifyContent
- flex
- flexBasis
- flexDirection
- flexGrow
- flexShrink
- flexWrap


#### grid

- grid
- gridArea
- gridAutoColumns
- gridAutoFlow
- gridAutoRows
- gridColumn
- gridColumnEnd
- gridColumnGap
- gridColumnStart
- gridGap
- gridRow
- gridRowEnd
- gridRowGap
- gridRowStart
- gridTemplate
- gridTemplateAreas
- gridTemplateColumns
- gridTemplateRows


#### column view

- columns
- columnWidth
- columnCount
- columnSpan
- columnFill
- columnGap
- columnRule
- columnRuleColor
- columnRuleStyle
- columnRuleWidth



### Size
 
 - margin
 - marginTop
 - marginRight
 - marginBottom
 - marginLeft
 
 - padding
 - paddingTop
 - paddingRight
 - paddingBottom
 - paddingLeft
 
 - resize
 - height
 - maxHeight
 - minHeight
 - width
 - maxWidth
 - minWidth
 
### multimedia

 - clip
 - clipPath
 - filter
 - objectFit
 - objectPosition

### General?

#### view

- opacity
- visibility
- color
- mixBlendMode
- isolation

#### mouse

- cursor
- pointerEvents




### Text

#### writing

hyphens
letterSpacing
lineHeight
quotes
tabSize
verticalAlign
whiteSpace
wordBreak
wordSpacing
wordWrap
writingMode
userSelect

#### Text

textAlign-last
textDecoration
textDecorationColor
textDecorationLine
textDecorationStyle
textIndent
textJustify
textOverflow
textShadow
textTransform

#### Local

direction
unicodeBidi

 
#### font

font
fontFamily
fontKerning
fontSize
fontSizeAdjust
fontStretch
fontStyle
fontVariant
fontWeight


### list (ul, ol)

list-style
list-style-type
list-style-position
list-style-image


###  Transformation

perspective
perspective-origin

transform
transform-origin
transform-style

transition
transition-delay
transition-duration
transition-property
transition-timing-function


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

### Error

Script to be run when an error occurs when the file is being loaded

In script

	$widget.on('error', function(){});

In model

	{
		type: 'img',
		event:{
			error: 'alert("error of loading img");'
		}
	}

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