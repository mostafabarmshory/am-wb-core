# $mdeia API Documentation

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

## Usage

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