SEE: https://animejs.com/documentation/

Animations are added to a widget vi the events and javascript code.

To add an animation to a widget:

	var animation = $widget.animate({..});

Where the $widget is pointer to the current widget. 

## Animation parameters

- direction
- loop
- autoplay
- delay
- endDelay
- easing

### Direction

Defines the direction of the animation.

- 'normal': Animation progress goes from 0 to 100%
- 'reverse': Animation progress goes from 100% to 0%
- 'alternate': Animation progress goes from 0% to 100% then goes back to 0%


	$widget.animate({
		..
		direction: 'normal'
	});

### Loop

Defines the number of iterations of your animation.

- Number: The number of iterations
- true: Loop indefinitely

Apply animation 2 times:

	$widget.animate({
		..
		loop: 2
	});

Apply animation for ever:

	$widget.animate({
		..
		loop: true
	});

### Autoplay

Defines if the animation should automatically starts or not.

- true: Automatically starts the animation
- false: Animation is paused by default

Default value is true.

	$widget.animate({
		..
		autoplay: true
	});

### Delay

Defines the delay in milliseconds of the animation.


### End delay

Adds some extra time in milliseconds at the end of the animation.

### easing

Defines the timing function of the animation.

#### linear

Does not apply any easing timing to your animation.

Usefull for opacity and colors transitions.

#### cubicBezier

Use your own custom cubic Bézier curves cubicBezier(x1, y1, x2, y2).

	easing: 'cubicBezier(.5, .05, .1, .3)'

#### spring

Spring physics based easing.

	easing: 'spring(mass, stiffness, damping, velocity)'

#### elastic

Elastic easing.

	easing: 'easeOutElastic(amplitude, period)'

#### steps

Defines the number of jumps an animation takes to arrive at its end value.

	easing: 'steps(numberOfSteps)'


## Properties

To change a property just add the property in the animation parameters:

	$widget.animate({
		'style.color': {..}
	});

NOTE: if you do not set the property at initialization, then the model property is used as the initial value.

## Values

There are several way to set new value to a widget

### Direct value

If the original value has a unit, it will be automatically added to the animated value.

	$widget.animate({
		'style.size.width': 30
	});
	
### From to

Forces the animation to start at a specified value.

	$widget.animate({
		'style.size.width': [30, 500]
	});


### Value with specific animation parameters


	$widget.animate({
		'style.color': {
			value: '#ff0000',
			duration: 1800,
			easing: 'easeInOutExpo'
		}
	});

### Multiple value


	$widget.animate({
		'style.color': [
			{
				value: '#ff0000',
				duration: 1800,
	  			easing: 'easeInOutExpo'
			},{
				value: '#00ff00',
				duration: 1800,
	  			easing: 'easeInOutExpo'
			},{
				value: '#0000ff',
				duration: 1800,
	  			easing: 'easeInOutExpo'
			}
		]
	});

### Relative values

Adds, substracts or multiplies the original value.

- '+=': Add	(example: '+=100')
- '-=': Substract (example: '-=2turn')
- '*=': Multiply (example: '*=10')

	$widget.animate({
		'style.size.width': '+=10px'
	});


### Colors

anime.js accepts and converts Haxadecimal, RGB, RGBA, HSL, and HSLA color values.

NOTE: CSS color codes ( e.g. : 'red', 'yellow', 'aqua' ) are not supported.

- Haxadecimal	'#FFF' or '#FFFFFF'
- RGB	'rgb(255, 255, 255)'
- RGBA	'rgba(255, 255, 255, .2)'
- HSL	'hsl(0, 100%, 100%)'
- HSLA	'hsla(0, 100%, 100%, .2)'


## Examples

### Change background color

To change background color on click:

	var color = '#ff0000';
	if($widget.getProperty('style.background.color') === color){
		color = '#0000ff';
	}
	$widget.animate({
		'style.background.color': color,
		duration: 3000
	});

So if you click on the widget color changed.