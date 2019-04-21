# Widget size

	{
		style: {
			size: {
				width: length|initial|inherit,
				minWidth: length|initial|inherit,
				maxWidth: length|initial|inherit,
				
				height: length|initial|inherit,
				minHeight: length|initial|inherit,
				maxHeight:length|initial|inherit
			}
		}
	}
	
## Width

The width property sets the width of a widget.

The width of a widget does not include padding, borders, or margins!

Note: The minWidth and maxWidth properties override the width property.

The syntax of the property is:

	width: auto | length | initial | inherit

- auto	: The browser calculates the width(Default value)
- length	: Defines the width in px, cm, etc.
- %	: Defines the width in percent of the containing block	
- initial	: Sets this property to its default value.	
- inherit	: Inherits this property from its parent element.

### minWidth

The minWidth property defines the minimum width of a widget.

If the widget is smaller than the minimum width, the minimum width will be applied.

If the widget is larger than the minimum width, the minWidth property has no effect.

Note: This prevents the value of the width property from becoming smaller than minWidth.

The syntax of the property is:

	minWidth: length | initial | inherit

- length  : Default value is 0. Defines the minimum width in px, cm, etc.
- %	      : Defines the minimum width in percent of the containing block
- initial : Sets this property to its default value. Read about initial	
- inherit : Inherits this property from its parent element. Read about inherit

The default value is 0.

The max-width property defines the maximum width of an element.

If the content is larger than the maximum width, it will automatically change the height of the element.

If the content is smaller than the maximum width, the max-width property has no effect.

Note: This prevents the value of the width property from becoming larger than max-width. The value of the max-width property overrides the width property.

### maxWidth

The maxWidth property defines the maximum width of a widget.

If the widget is larger than the maximum width, it will automatically change the height of the widget.

If the widget is smaller than the maximum width, the maxWidth property has no effect.

Note: This prevents the value of the width property from becoming larger than maxWidth. The value of the maxWidth property overrides the width property.

The syntax of the property is:

	maxWidth: none | length | initial | inherit

- none	: No maximum width. This is default	
- length	: Defines the maximum width in px, cm, etc.
- %	Defines : the maximum width in percent of the containing group	
- initial	: Sets this property to its default value.
- inherit	: Inherits this property from its parent group.

## Height

The height property sets the height of a widget.

The height of an widget does not include padding, borders, or margins!

If height: auto; the element will automatically adjust its height to allow its content to be displayed correctly.

If height is set to a numeric value (like pixels, (r)em, percentages) then if the widget does not fit within the specified height, it will overflow. How the container will handle the overflowing widget is defined by the overflow property.

Note: The minHeight and maxHeight properties override the height property.

The syntax of the property is:

	height: auto | length | initial | inherit

- auto	: The browser calculates the height (This is default).	
- length	: Defines the height in px, cm, etc.	
- %	Defines : the height in percent of the containing block	
- initial	: Sets this property to its default value. Read about initial	
- inherit	: Inherits this property from its parent element. Read about inherit

### minHeight

The minHeight property defines the minimum height of a widget.

If the widget is smaller than the minimum height, the minimum height will be applied.

If the widget is larger than the minimum height, the minHeight property has no effect.

Note: This prevents the value of the height property from becoming smaller than minHeight.

The syntax of the property is:

	minHeight: length | initial | inherit

- length	: Default value is 0. Defines the minimum height in px, cm, etc.
- %	Defines : the minimum height in percent of the containing group	
- initial	: Sets this property to its default value.
- inherit	: Inherits this property from its parent group.

The default value is 0.

### maxHeight

The maxHeight property defines the maximum height of a widget.

If the content is larger than the maximum height, it will overflow. How the container will handle the overflowing content is defined by the overflow property.

If the content is smaller than the maximum height, the maxHeight property has no effect.

Note: This prevents the value of the height property from becoming larger than maxHeight. The value of the maxHeight property overrides the height property.

The syntax of the property is:

	maxHeight: none | length | initial | inherit

- none	: No maximum height(This is default)	
- length	: Defines the maximum height in px, cm, etc.	
- %	Defines : the maximum height in percent of the containing block	
- initial	: Sets this property to its default value.
- inherit	: Inherits this property from its parent element.


