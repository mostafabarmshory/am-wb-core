/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

/**
 * @ngdoc module
 * @name ngDonate
 * @description
 *
 */
angular
    .module('ngMaterialWeburger', [
        'ngMessages',//
        'ngAnimate',//
        'ngAria',//
        'ngMaterial',//
        'pascalprecht.translate',//
        'pluf',//
        'mdColorPicker',//
//        'ngMaterialWysiwyg',
        'ui.tinymce', //
        'dndLists',//
    ]);

/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')
/**
 * @ngdoc function
 * @name WbBorderSettingCtrl
 * @description # WbBorderSettingCtrl Controller of the ngMaterialWeburger
 */
.controller('WbBorderSettingCtrl', function($scope) {
    var scope = $scope;
    var model = $scope.wbModel;

    scope.styles = [ {
	title : 'No Border',
	value : 'none'
    }, {
	title : 'Solid',
	value : 'solid'
    }, {
	title : 'Dotted',
	value : 'dotted'
    }, {
	title : 'Dashed',
	value : 'dashed'
    }, {
	title : 'Double',
	value : 'double'
    }, {
	title : 'Groove',
	value : 'groove'
    }, {
	title : 'Ridge',
	value : 'ridge'
    }, {
	title : 'Inset',
	value : 'inset'
    }, {
	title : 'Outset',
	value : 'outset'
    } ];
});

/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc function
 * @name WbWbDialogsCtrl
 * @description # WbWbDialogsCtrl Controller of the donateMainApp
 */
.controller('WbDialogsCtrl', function($scope, $mdDialog, wbModel, style) {
    function hide() {
	$mdDialog.hide();
    }

    function cancel() {
	$mdDialog.cancel();
    }

    function answer(response) {
	$mdDialog.hide(response);
    }

    $scope.wbModel = wbModel;
    $scope.style = style;
    $scope.hide = hide;
    $scope.cancel = cancel;
    $scope.answer = answer;
});

/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc controller
 * @name WbLayoutWbSettingsCtrl
 * @memberof ngMaterialWeburger
 * @description کنترلر یک عمل برای مدیریت و ویرایش آن ایجاد شده است. این کنترل
 *              در دیالوگ و یا نمایش‌های دیگر کاربرد دارد.
 * 
 * این کنترل علاوه بر امکانات ویرایشی، داده‌های اولیه هم برای نمایش فراهم
 * می‌کند.
 */
.controller('WbLayoutWbSettingsCtrl', function($scope, $settings) {
    var scope = $scope;

    scope.directions = [ {
	title : 'row',
	icon : 'view_column',
	value : 'row'
    }, {
	title : 'column',
	icon : 'view_agenda',
	value : 'column'
    } ];

    scope.directionAlignments = [ {
	title : 'none',
	value : 'none'
    }, {
	title : 'start',
	value : 'start'
    }, {
	title : 'center',
	value : 'center'
    }, {
	title : 'end',
	value : 'end'
    }, {
	title : 'space-around',
	value : 'space-around'
    }, {
	title : 'space-between',
	value : 'space-between'
    } ];

    scope.perpendicularAlignments = [ {
	title : 'none',
	value : 'none'
    }, {
	title : 'start',
	value : 'start'
    }, {
	title : 'center',
	value : 'center'
    }, {
	title : 'end',
	value : 'end'
    }, {
	title : 'stretch',
	value : 'stretch'
    }, ]
});

/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';
angular

/**
 * 
 * @date 2016
 * @author mgh
 */
.module('ngMaterialWeburger')

.controller('WbPageLayoutWbSettingsCtrl', function($scope, $settings) {
    var scope = $scope;

    scope.flexDirection = [ {
	title : 'row',
	icon : 'column',
	value : 'wb-flex-row'
    }, {
	title : 'column',
	icon : 'view_agenda',
	value : 'wb-flex-column'
    } ];

    scope.justifyContent = [ {
	title : 'Start',
	value : 'wb-flex-justify-content-start'
    }, {
	title : 'End',
	value : 'wb-flex-justify-content-end'
    }, {
	title : 'Center',
	value : 'wb-flex-justify-content-center'
    }, {
	title : 'Space Around',
	value : 'wb-flex-justify-content-space-around'
    }, {
	title : 'Space Between',
	value : 'wb-flex-justify-content-space-between'
    } ];

    scope.alignItems = [ {
	title : 'Stretch',
	value : 'wb-flex-align-items-stretch'
    }, {
	title : 'Start',
	value : 'wb-flex-align-items-start'
    }, {
	title : 'End',
	value : 'wb-flex-align-items-end'
    }, {
	title : 'Center',
	value : 'wb-flex-align-items-center'
    } ]
});

/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';
angular

/**
 * Created by mgh on 8/10/2016.
 */
.module('ngMaterialWeburger')

.controller('WbSelfLayoutWbSettingsCtrl', function($scope, $settings) {
    var scope = $scope;

    scope.flexAlignItem = [ {
	title : 'auto',
	value : 'wb-flex-item-auto'
    }, {
	title : 'Start',
	value : 'wb-flex-item-start'
    }, {
	title : 'End',
	value : 'wb-flex-item-end'
    }, {
	title : 'Center',
	value : 'wb-flex-item-center'
    }, {
	title : 'stretch',
	value : 'wb-flex-item-stretch'
    } ];
});

/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';
angular.module('ngMaterialWeburger')

/**
 * Created by mgh on 8/10/2016.
 */
.controller(
	'WbTextSettingsCtrl',
	function($scope) {
	    var scope = $scope;
	    scope.tinymceOptions = {
		    /*
		     * onChange: function(e) { // put logic here for
		     * keypress and cut/paste changes },
		     */
		    /*
		     * selector: 'textarea', inline: false, plugins :
		     * 'advlist autolink link image lists charmap print
		     * preview', skin: 'lightgray', theme : 'modern',
		     * font_formats: 'Arial=arial,helvetica,sans-serif;'
		     */
		    selector : 'textarea',
		    height : 500,
		    theme : 'modern',
		    plugins : [
			'advlist autolink lists link image charmap print preview hr anchor pagebreak',
			'searchreplace wordcount visualblocks visualchars code fullscreen',
			'insertdatetime media nonbreaking save table contextmenu directionality',
			'emoticons template paste textcolor colorpicker textpattern imagetools' ],
			toolbar1 : 'fontselect fontsizeselect | insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
			toolbar2 : 'print preview media | forecolor backcolor emoticons',
			image_advtab : true,
			templates : [ {
			    title : 'Test template 1',
			    content : 'Test 1'
			}, {
			    title : 'Test template 2',
			    content : 'Test 2'
			} ],
			content_css : [
			    '//fast.fonts.net/cssapi/e6dc9b99-64fe-4292-ad98-6974f93cd2a2.css',
			    '//www.tinymce.com/css/codepen.min.css' ]
	    };

	});

/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc controller
 * @name WbWidgetSelectCtrl
 * @memberof ngMaterialWeburger
 * @description مدیریتی برای انتخاب ویجت‌های جدید
 * 
 * در این کنترل امکاناتی فراهم شده که کاربر بتواند از میان ویجت‌های موجودی یکی
 * را انتخاب کند.
 */
.controller('WbWidgetSelectCtrl',
	function($scope, $widget, PaginatorParameter) {
    var scope = $scope;
    var paginatorParameter = new PaginatorParameter();

    /**
     * ویجت‌های موجود را لود می‌کند
     * 
     * تمام ویجت‌های لود شده در متغیری به نام widgets توی اسکپ بار
     * می‌شود.
     * 
     */
    function loadWidgets() {
	$widget.widgets(paginatorParameter).then(function(widgets) {
	    scope.widgets = widgets;
	    selectWidget(widgets.items[0]);
	});
    }

    /**
     * ویجت پیش فرض را تعیین می‌کند
     * 
     * با انتخاب یک ویجت به عنوان ویجت پیش فرض می‌توان نمایش خاصی از آن
     * را در سیستم ایجاد کرد.
     * 
     * @memberof WbWidgetSelectCtrl
     * @param {Widget}
     *                widget ویجت پیش فرض را تعیین می‌کند
     * @returns
     */
    function selectWidget(widget) {
	scope.cwidget = widget;
	// TODO: bind the widget
    }

    /**
     * ویجت را به عنوان ویجت انتخاب شده تعیین می‌کندs
     * 
     * @memberof WbWidgetSelectCtrl
     * @param widget
     * @returns
     */
    function answerWidget(widget) {
	var element = angular.copy(widget.data);
	$scope.answer(element);
    }

    // تعیین خصوصیت‌های اسکوپ
    scope.selectWidget = selectWidget;
    scope.answerWidget = answerWidget;
    loadWidgets();
});

/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')
/**
 * @description Apply background into the element
 */
.directive("wbSize", function() {
    return {
	restrict : 'A',
	link : function(scope, element, attributes) {
	    return scope.$watch(attributes.wbSize, function(style) {
		if (!style) {
		    return;
		}
		element.css({
		    'background-color' : style.backgroundColor,
		    'color' : style.color,
		});
	    }, true);
	}
    };
});
/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')
/**
 * @description Apply border into the element
 */
.directive("wbBorder", function() {
    return {
	restrict : 'A',
	link : function(scope, element, attributes) {
		//TODO: mgh, 1395: for efficiency, don't use ternary-operation in css. use if-condition on "uniform" and assign proper css-attributes.
	    return scope.$watch(attributes.wbBorder, function(style) {
		if(!style){
		    return;
		}
		if(!style.borderRadius){
		    style.borderRadius={};
		}
		if(!style.borderStyleColorWidth){
		    style.borderStyleColorWidth={};
		}
		if(!style.borderStyle){
		    style.borderStyle = {};
		}
		if(!style.borderWidth){
		    style.borderWidth = {};
		}
		if(!style.borderColor){
		    style.borderColor = {};
		}
		element.css({
	            'border-top-left-radius':(style.borderRadius.uniform) ? style.borderRadius.all : style.borderRadius.topLeft,
	            'border-top-right-radius':(style.borderRadius.uniform) ? style.borderRadius.all : style.borderRadius.topRight,
	            'border-bottom-left-radius':(style.borderRadius.uniform) ? style.borderRadius.all : style.borderRadius.bottomLeft,
	            'border-bottom-right-radius':(style.borderRadius.uniform) ? style.borderRadius.all : style.borderRadius.bottomRight,

	            'border-left-style':(style.borderStyleColorWidth.uniform) ? style.borderStyle.all : style.borderStyle.left,
	            'border-right-style':(style.borderStyleColorWidth.uniform) ? style.borderStyle.all : style.borderStyle.right,
	            'border-top-style':(style.borderStyleColorWidth.uniform) ? style.borderStyle.all : style.borderStyle.top,
	            'border-bottom-style':(style.borderStyleColorWidth.uniform) ? style.borderStyle.all : style.borderStyle.bottom,

	            'border-left-width':(style.borderStyleColorWidth.uniform) ? style.borderWidth.all : style.borderWidth.left,
	            'border-right-width':(style.borderStyleColorWidth.uniform) ? style.borderWidth.all : style.borderWidth.right,
	            'border-top-width':(style.borderStyleColorWidth.uniform) ? style.borderWidth.all : style.borderWidth.top,
	            'border-bottom-width':(style.borderStyleColorWidth.uniform) ? style.borderWidth.all : style.borderWidth.bottom,

	            'border-left-color':(style.borderStyleColorWidth.uniform) ? style.borderColor.all : style.borderColor.left,
	            'border-right-color':(style.borderStyleColorWidth.uniform) ? style.borderColor.all : style.borderColor.right,
	            'border-top-color':(style.borderStyleColorWidth.uniform) ? style.borderColor.all : style.borderColor.top,
	            'border-bottom-color':(style.borderStyleColorWidth.uniform) ? style.borderColor.all : style.borderColor.bottom,
	            });
	    }, true);
	}
    };
});
/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')
/**
 * @description Apply layout into the element
 */
.directive("wbLayout", function() {
    return {
	restrict : 'A',
	link : function(scope, element, attributes) {
	    return scope.$watch(attributes.wbLayout, function(newValue, oldValue) {
		if(oldValue){
		    // Remove old class
		    element.removeClass(oldValue.flexDirection);
		    element.removeClass(oldValue.justifyContent);
		    element.removeClass(oldValue.alignItems);
		}
		if(newValue){
		    // Add new class
		    element.addClass(newValue.flexDirection);
		    element.addClass(newValue.justifyContent);
		    element.addClass(newValue.alignItems);
		}
	    }, true);
	}
    };
});
/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')
/**
 * @description Apply margin into the element
 */
.directive("wbMargin", function() {
    return {
	restrict : 'A',
	link : function(scope, element, attributes) {
	    return scope.$watch(attributes.wbMargin, function(style) {
		if(!style){
		    return;
		}
		element.css({
	            'margin-left':style.marginLeft,
	            'margin-right':style.marginRight,
	            'margin-top':style.marginTop,
	            'margin-bottom':style.marginBottom
	            });
	    }, true);
	}
    };
});
/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')
/**
 * @description Apply padding into the element
 */
.directive("wbPadding", function() {
    return {
	restrict : 'A',
	link : function(scope, element, attributes) {
	    return scope.$watch(attributes.wbPadding, function(style) {
		if(!style){
		    return;
		}
		element.css({
	            'padding-left':style.paddingLeft,
	            'padding-right':style.paddingRight,
	            'padding-top':style.paddingTop,
	            'padding-bottom':style.paddingBottom,
	            });
	    }, true);
	}
    };
});
/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')
/**
 * @description Apply margin into the element
 */
.directive("wbSize", function() {
    return {
	restrict : 'A',
	link : function(scope, element, attributes) {
	    return scope.$watch(attributes.wbMargin, function(style) {
		if(!style){
		    return;
		}
		element.css({
	            'min-width':style.minWidth,
	            'min-height':style.minHeight,
	            'max-width':(style.maxWidth==0) ? 'none' : style.maxWidth,
	            'max-height':(style.maxHeight==0)?'none':style.maxHeight,
	            });
	    }, true);
	}
    };
});
/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')
/**
 * @ngdoc directive
 * @name donateMainApp.directive:wbContent
 * @description
 * 
 * A container widget
 * 
 * This is an container widget to list and manage widgets. This is equal to a
 * group or a page of widgets.
 * 
 * Widget data is bind into the wbModel automatically.
 * 
 * هر صفحه یک ساختار داده‌ای را به عنوان ورودی دریافت می‌کند و در صورتی که کاربر
 * مجاز به ویرایش آن باشد، آن را ویرایش و ساختار داده‌ای جدید ایجاد می‌کند.
 * فرآیند ذخیره سازی این ساختار داده‌ای باید به صورت مستقل در کنترل‌هایی انجام
 * شود که این ساختار را فراهم کرده‌اند.
 * 
 */
.directive(
	'wbContent',
	function($compile, $widget) {

	    var dragClass = 'wb-content-dragenter';
	    var bodyElementSelector = 'div#wb-content-body';
	    var placeholderElementSelector = 'div#wb-content-placeholder';

	    return {
		templateUrl : 'views/directives/wb-content.html',
		transclude : true,
		restrict : 'E',
		replace : true,
		scope : {
		    wbModel : '=?',
		    wbEditable : '=?',
		    wbParent : '=?'
		},

		link : function(scope, element, attrs) {
		    // TODO:
		},

		controller : function($scope, $element, $settings, $widget) {
		    var scope = $scope;
		    var element = $element;

		    function isEditable() {
			if (scope.wbParent) {
			    return scope.wbParent.isEditable();
			}
			return scope.wbEditable;
		    }

		    function removeWidgets() {
			$element//
			.children(bodyElementSelector)//
			.children(placeholderElementSelector)//
			.empty();
		    }

		    function removeWidget(model) {
			if (model == scope.wbModel) {
			    // باید از پدر بخواهیم که این کار رو انجام بده
			    scope.wbParent.removeWidget(model);
			}
			var index = scope.wbModel.contents.indexOf(model);
			if (index > -1) {
			    scope.wbModel.contents.splice(index, 1);
			}
			// TODO: maso, 1395: بهتره که المان معادل را پیدا و حذف
			// کنیم.
			removeWidgets();
			scope.wbModel.contents.forEach(addWidget);
		    }

		    /**
		     * یک دریجه محاوره‌ای برای انتخاب و اضافه کردن ویجت باز
		     * می‌کند
		     * 
		     * کاربر با استفاده از دریچه محاوره‌ای ویجت را انتخاب می‌کند
		     * و بعد از آن این ویجت به صورت یک ساختار داده‌ای جدید به
		     * مدل داده‌ای و نمایش اضافه خواهد شد.‌
		     */
		    function newWidget(wbModel) {
			return $widget.select({
			    wbModel : {},
			    style : {}
			})//
			.then(function(model) {
			    wbModel.contents.push(model);
			    addWidget(model);
			});
		    }

		    function createWidget(item) {
			var widget = null;
			var childScope = null;
			var element = null;

			// 0- get widget
			return $widget.widget(item)//
			.then(function(w) {
			    widget = w;
			})

			// 1- create scope
			.then(function() {
			    childScope = $scope.$new(true, $scope);
			    childScope.model = item;
			    childScope.editable = $scope.isEditable;
			    childScope.parent = $scope;
			})

			// 2- create element
			.then(function() {
			    return $widget.getTemplateFor(widget);
			})//
			.then(function(template) {
			    if (item.type != 'Page') {
				template = '<wb-widget>' + template + '</wb-widget>';
			    }
			    element = angular.element(template);
			    element.attr('wb-model', 'model');
			    element.attr('wb-editable', 'editable()');
			    element.attr('wb-parent', 'parent');
			})

			// 3- bind controller
			.then(function() {
			    if (angular.isDefined(widget.controller)) {
				$controller(widget.controller, {
				    $scope : childScope,
				    $element : element,
				    // TODO: maso, 2017: bind wbModel, wbParent, and wbEditable
				});
			    }
			    $compile(element)(childScope);
			})//
			
			// Return value
			.then(function(){
			    return element;
			});
		    }
		    function addWidget(item) {
			createWidget(item)//
			.then(function(element) {
			    $element//
			    .children(bodyElementSelector)//
			    .children(placeholderElementSelector)//
			    .append(element);
			});
		    }

		    /**
		     * Adds dragged widget
		     */
		    function addDraggedWidget(event, index, item, external,
			    type) {
			// insert in model
			scope.wbModel.contents.splice(index, 0, item);

			createWidget(item)//
			// add widget
			createWidget(item)//
			.then(function(element) {
			    var list = $element//
			    .children(bodyElementSelector)//
			    .children(placeholderElementSelector);
			    if (index < list[0].childNodes.length) {
				element.insertBefore(list[0].childNodes[index]);
			    } else {
				list.append(element);
			    }
			});
			return true;
		    }

		    /**
		     * تنظیم‌های کلی صفحه را انجام می‌دهد
		     * 
		     * یک دریچه محاوره‌ای باز می‌شود تا کاربر بتواند تنظیم‌های
		     * متفاوت مربوط به این صفحه را انجام دهد.
		     */
		    function settings() {
			return $settings.load({
			    wbModel : scope.wbModel,
			    wbParent : scope.wbParent
			});
		    }

		    scope.settings = settings;
		    scope.removeWidgets = removeWidgets;
		    scope.removeWidget = removeWidget;
		    scope.newWidget = newWidget;
		    scope.isEditable = isEditable
		    scope.addDraggedWidget = addDraggedWidget;

		    scope.$watch('wbModel', function() {
			removeWidgets();
			if (!scope.wbModel) {
			    // XXX: maso, 1395: هنوز مدل تعیین نشده
			    return;
			}
			if (!angular.isArray(scope.wbModel.contents)) {
			    scope.wbModel.contents = [];
			}
			scope.wbModel.type = 'Page';
			scope.wbModel.contents.forEach(addWidget);
		    });
		}
	    };
	});

/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc directive
 * @name wbInfinateScroll
 * @description
 * 
 *  # wbInfinateScroll
 */
.directive('wbInfinateScroll', function() {
    return {
	restrict : 'A',
	// require : '^ddScroll',
	scope : {
	    loadPage : '=wbInfinateScroll'
	},
	link : function(scope, elem, attrs) {
	    elem.on('scroll', function(evt) {
		var raw = elem[0];
		if (raw.scrollTop + raw.offsetHeight  + 5 >= raw.scrollHeight) {
		    scope.loadPage();
		}
	    });
	}
    };
});

/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc directive
 * @name wbWidget
 * @memberof ngMaterialWeburger
 * @description Widgets container
 * 
 * This is widget containers.
 * 
 * All primary actions of a widget are supported (such as remove and setting).
 */
.directive('wbWidget', function() {
    return {
	templateUrl : 'views/directives/wb-widget.html',
	restrict : 'E',
	transclude : true,
	scope : {
	    wbEditable : '=?',
	    wbModel : '=?',
	    wbParent : '=?'
	},
	link: function(scope, element, attrs, ctrl, transclude) {
	    // Modify angular transclude function
	    // see: http://angular-tips.com/blog/2014/03/transclusion-and-scopes/
	    // FIXME: maso, 2017: use regular dom insted of ng-transclude
	    transclude(scope, function(clone, scope) {
		var node = element//
		.find('ng-transclude')//
		.append(clone);
	    });
	},
	controller : function($scope, $element, $settings, $widget) {
	    var element = $element;
	    /**
	     * Remove widget from parent
	     */
	    function removeWidget() {
		if ($scope.wbParent) {
		    $scope.wbParent.removeWidget($scope.wbModel);
		}
	    }

	    /**
	     * Load widget settings
	     * 
	     */
	    function settings() {
		return $settings.load({
		    wbModel : $scope.wbModel,
		    wbParent : $scope.wbParent,
		});
	    }

	    /*
	     * Add to scope
	     */
	    $scope.removeWidget = removeWidget;
	    $scope.settings = settings;
	}
    };
});

/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc filter
 * @name wbunsafe
 * @function
 * @description # unsafe Filter in the digidociMainApp.
 */
.filter('wbunsafe', function($sce) {
	return function(val) {
		return $sce.trustAsHtml(val);
	};
});

/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * Load widgets
 */
.run(function($settings) {
    $settings.newPage({
	type: 'general',
	label : 'general',
	templateUrl : 'views/settings/wb-general.html'
    });
    $settings.newPage({
	type: 'background',
	label : 'background',
	templateUrl : 'views/settings/wb-background.html'
    });
    $settings.newPage({
	type: 'text',
	label : 'Frontend text',
	controller: 'WbTextSettingsCtrl',
	templateUrl : 'views/settings/wb-text.html'
    });
    $settings.newPage({
	type: 'description',
	label : 'Description',
	templateUrl : 'views/settings/wb-description.html'
    });
    $settings.newPage({
	type: 'layout',
	label : 'Layout',
	controller: 'WbLayoutWbSettingsCtrl',
	templateUrl : 'views/settings/wb-layout.html'
    });
    $settings.newPage({
	type: 'border',
	label : 'Border',
	controller: 'WbBorderSettingCtrl',
	templateUrl : 'views/settings/wb-border.html'
    });
    $settings.newPage({
	type: 'pageLayout',
	label : 'Page Layout',
	controller: 'WbPageLayoutWbSettingsCtrl',
	templateUrl : 'views/settings/wb-layout-page.html'
    });
    $settings.newPage({
	type: 'selfLayout',
	label : 'Self Layout',
	controller: 'WbSelfLayoutWbSettingsCtrl',
	templateUrl : 'views/settings/wb-layout-self.html'
    });
    $settings.newPage({
	type: 'marginPadding',
	label : 'Margin/Padding',
	templateUrl : 'views/settings/wb-margin-padding.html'
    });
    $settings.newPage({
	type: 'minMaxSize',
	label : 'Min/Max',
	templateUrl : 'views/settings/wb-min-max-size.html'
    });
});

/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * Load widgets
 */
.run(
	function($widget) {
	    // Page
	    $widget.newWidget({
		type: 'Page',
		template : '<wb-content></wb-content>',
		label : 'Panel',
		description : 'Panel contains list of widgets.',
		image : 'images/wb/content.svg',
		help : 'http://dpq.co.ir/more-information-link',
		setting: [ 'description', 'border',
			'background', 'pageLayout',
			'selfLayout' ],
		data : {
		    type : 'Page',
		    style : {
			direction : 'column',
		    },
		    contents : []
		}
	    });
	    // HTML text
	    $widget.newWidget({
		type: 'HtmlText',
		templateUrl : 'views/widgets/wb-html.html',
		label : 'HTML text',
		description : 'An HTML block text.',
		image : 'images/wb/html.svg',
		help : 'http://dpq.co.ir',
		setting:['text', 'selfLayout', 'border',
			'background', 'marginPadding',
			'minMaxSize'],
		data : {
		    type : 'HtmlText',
		    body : '<h2>HTML Text</h2><p>Insert HTML text heare</p>',
		    style : {
			marginLeft : 1,
			marginRight : 1,
			marginTop : 1,
			marginBottom : 1,
			paddingLeft : 1,
			paddingRight : 1,
			paddingTop : 1,
			paddingBottom : 1,
			minWidth : 0,
			maxWidth : 0,
			minHeight : 0,
			maxHeight : 0
		    }
		}
	    });
	});

/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc service
 * @name $widget
 * @memberof ngMaterialWeburger
 * @description Resource managment
 * 
 */
.service('$resource', function() {
    // TODO: maso, 1395:
});

/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc service
 * @name $widget
 * @memberof ngMaterialWeburger
 * @description مدیریت ویجت‌های سیستم
 * 
 * این سرویس تمام ویجت‌های قابل استفاده در سیستم را تعیین می‌کند.
 */
.service('$settings', function($rootScope, $controller, $widget, $q, $sce, $compile, $document, $templateRequest) {
    /**
     * Setting page storage
     * 
     */
    var settingPages = {};
    var notFound = {
	    label : 'Settings not found',
	    templateUrl : 'views/settings/wb-notfound.html'
    };

    var oldScope;

    /**
     * Fetchs a setting page.
     * 
     * @param model
     * @returns
     */
    function page(type) {
	var widget = notFound;
	if (type in settingPages) {
	    widget = settingPages[type];
	}
	return widget;
    }

    /**
     * Adds new setting page.
     * 
     * @returns
     */
    function newPage(page) {
	settingPages[page.type] = page;
    }

    /**
     * Finds and lists all setting pages.
     * 
     * @returns
     */
    function pages() {
	// TODO: maso, 1395:
    }

    /*
     * get setting page template
     */
    function getTemplateFor(page) {
	var template, templateUrl;
	if (angular.isDefined(template = page.template)) {
	    if (angular.isFunction(template)) {
		template = template(page.params);
	    }
	} else if (angular.isDefined(templateUrl = page.templateUrl)) {
	    if (angular.isFunction(templateUrl)) {
		templateUrl = templateUrl(page.params);
	    }
	    if (angular.isDefined(templateUrl)) {
		page.loadedTemplateUrl = $sce.valueOf(templateUrl);
		template = $templateRequest(templateUrl);
	    }
	}
	return template;
    }

    /**
     * تنظیمات را به عنوان تنظیم‌های جاری سیستم لود می‌کند.
     * 
     * @returns
     */
    function loadSetting(models) {
	var widget = null;
	var jobs = [];
	var pages = [];

	// 0- destroy old resource
	if(angular.isDefined(oldScope)){
	    oldScope.$destroy();
	}
	var scope = $rootScope.$new(true, $rootScope);
	scope.wbModel = models.wbModel;
	scope.wbParent = models.wbParent;
	oldScope = scope;


	// 1- Find element
	var target = $document.find('#wb-setting-panel');

	// 2- Clear childrens
	target.empty();

	// 3- load pages
	$widget.widget(models.wbModel)//
	.then(function(w){
	    widget = w;
	    if(angular.isArray(widget.setting)){
		angular.forEach(widget.setting, function(type) {
		    var page = notFound;
		    if(type in settingPages){
			page = settingPages[type];
		    }
		    var template = getTemplateFor(page);
		    if (angular.isDefined(template)) {
			var job = template//
			.then(function(templateSrc){
			    var element = angular.element(templateSrc);
			    if (angular.isDefined(page.controller)) {
				$controller(page.controller, {
				    $scope : scope,
				    $element : element,
				});
			    }
			    $compile(element)(scope);			    
			    pages.push(element);
			});
			jobs.push(job);
		    }
		});
	    } else {
		// TODO: maso, 2017: not setting page founnd
	    }
	})//
	.then(function(){
	    $q.all(jobs)//
	    .then(function(){
		angular.forEach(pages, function(element){
		    target.append(element);
		});
	    });
	});
    }
    // تعیین سرویس‌ها
    this.page = page;
    this.load = loadSetting;
    this.newPage = newPage;
});

/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc service
 * @name $widget
 * @memberof ngMaterialWeburger
 * @description مدیریت ویجت‌های سیستم
 * 
 * این سرویس تمام ویجت‌های قابل استفاده در سیستم را تعیین می‌کند.
 */
.service('$widget', function($q, $sce, $templateRequest, $timeout, $mdDialog, PaginatorPage) {

    var contentElementAsso = [];
    var elementKey = [];
    var notFoundWidget = {
	templateUrl : 'views/widgets/wb-notfound.html',
	label : 'Not found',
	description : 'Element not found',
    };
    /**
     * Finds a widget related to the input model.
     * 
     * Widget type is stored in the widget data model. This function get the
     * model type from the input data type and return related widget.
     * 
     * NotFoundElement widget is returned if the widget type is not found.
     * 
     * @param model
     * @returns
     */
    function widget(model) {
	var deferred = $q.defer();
	$timeout(function() {
	    var widget = notFoundWidget;
	    if (model.type in contentElementAsso) {
		widget = contentElementAsso[model.type];
	    }
	    deferred.resolve(widget);
	}, 1);
	return deferred.promise;
    }

    /**
     * Returns list of all registerd widgets.
     * 
     * @returns
     */
    function widgets() {
	var deferred = $q.defer();
	$timeout(function() {
	    var widgets = new PaginatorPage({});
	    // XXX: maso, 1395: تعیین خصوصیت‌ها به صورت دستی است
	    widgets.items = [];
	    elementKey.forEach(function(type) {
		widgets.items.push(contentElementAsso[type]);
	    });
	    deferred.resolve(widgets);
	}, 1);
	return deferred.promise;
    }

    /**
     * Registers new widget
     * 
     * @See the following page for more information:
     * 
     *    https://gitlab.com/weburger/angular-material-weburger/wikis/create-new-widget
     * 
     * @param type
     * @param model
     * @returns
     */
    function newWidget(widget) {
	var deferred = $q.defer();
	$timeout(function() {
	    if (widget.type in contentElementAsso) {
		deferred.reject({
		    data : {
			message : 'Widget with the same type registerd before'
		    }
		});
		return;
	    }
	    contentElementAsso[widget.type] = widget;
	    elementKey.push(widget.type);
	    deferred.resolve(widget);
	}, 1);
	return deferred.promise;
    }

    /**
     * Selects a widgetd
     * 
     * This is an utility method to help a user to select a widget.
     * 
     * @param locals
     * @returns
     */
    function select(locals) {
	// TODO: maso, 1394: just prepare data for view
	return $mdDialog.show({
	    controller : 'WbDialogsCtrl',
	    templateUrl : 'views/dialogs/wb-selectwidget.html',
	    parent : angular.element(document.body),
	    clickOutsideToClose : true,
	    fullscreen : true,
	    locals : locals,
	});
    }
    

    /*
     * get setting page template
     */
    function getTemplateFor(widget) {
	var template, templateUrl;
	if (angular.isDefined(template = widget.template)) {
	    if (angular.isFunction(template)) {
		template = template(widget.params);
	    }
	} else if (angular.isDefined(templateUrl = widget.templateUrl)) {
	    if (angular.isFunction(templateUrl)) {
		templateUrl = templateUrl(widget.params);
	    }
	    if (angular.isDefined(templateUrl)) {
		widget.loadedTemplateUrl = $sce.valueOf(templateUrl);
		template = $templateRequest(templateUrl);
	    }
	}
	return template;
    }

    // تعیین سرویس‌ها
    this.newWidget = newWidget;
    this.widget = widget;
    this.widgets = widgets;
    this.select = select;
    this.getTemplateFor = getTemplateFor;
});

angular.module('ngMaterialWeburger').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/dialogs/wb-selectwidget.html',
    "<md-dialog aria-label=\"edit action dialog\" ng-controller=WbWidgetSelectCtrl ng-cloak>  <md-toolbar> <div class=md-toolbar-tools> <h2 translate>Widget list</h2> <span flex></span> <md-button class=md-icon-button ng-click=cancel()> <md-icon aria-label=\"Close dialog\">close</md-icon> </md-button> </div> </md-toolbar>    <md-dialog-content> <md-content class=\"md-padding md-dialog-content\" layout-xs=column layout=row layout-wrap>    <md-card ng-repeat=\"widget in widgets.items\" flex-xs flex-gt-xs=45 md-theme-watch> <md-card-title> <md-card-title-text> <span class=md-headline>{{widget.label}}</span> <span class=md-subhead>{{widget.description}}</span> </md-card-title-text> <md-card-title-media> <img src=\"{{widget.image}}\"> </md-card-title-media> </md-card-title> <md-card-actions layout=row layout-align=\"end center\"> <md-button ng-click=answerWidget(widget)> <md-icon>add</md-icon> {{ 'Add' | translate }} </md-button>  </md-card-actions> </md-card> </md-content> </md-dialog-content> </md-dialog>"
  );


  $templateCache.put('views/directives/wb-content.html',
    "<div dnd-disable-if=!wbEditable dnd-draggable=wbModel dnd-type=\"'wb.widget'\" dnd-moved=removeWidget(wbModel) ng-class=\"{'wb-panel': wbEditable}\">  <div ng-show=wbEditable class=wb-panel-header layout=row> <span translate> Panel</span> <span flex></span> <md-button ng-click=newWidget(wbModel) class=\"md-icon-button md-mini\"> <md-icon class=wb-icon-mini>add_circle</md-icon> </md-button> <md-button ng-click=settings() class=\"md-icon-button md-mini\"> <md-icon class=wb-icon-mini>settings</md-icon> </md-button> <md-button class=\"md-icon-button md-mini\" ng-mouseenter=\"hoveringDelBtn=true\" ng-mouseleave=\"hoveringDelBtn=false\" ng-click=removeWidget(wbModel) ng-show=wbParent> <md-icon class=wb-icon-mini>delete</md-icon> </md-button> </div>  <div layout=row class=wb-panel-body id=wb-content-body> <div ng-show=hoveringDelBtn class=overlay></div>  <div class=wb-flex wb-layout=wbModel.style wb-margin=wbModel.style wb-padding=wbModel.style wb-size=wbModel.style wb-background=wbModel.style wb-border=wbModel.style id=wb-content-placeholder dnd-list=wbModel.contents dnd-allowed-types=\"['wb.widget']\" dnd-drop=\"addDraggedWidget(event, index, item, external, type)\"> </div>  </div> </div>"
  );


  $templateCache.put('views/directives/wb-widget.html',
    "<div dnd-disable-if=!wbEditable dnd-draggable=wbModel dnd-type=\"'wb.widget'\" dnd-moved=removeWidget() ng-class=\"{'wb-widget': wbEditable}\" layout=column>  <div ng-show=wbEditable layout=row class=wb-widget-header> <span translate> widget</span> <span flex></span> <md-button ng-if=add ng-click=add() class=\"md-icon-button md-mini\"> <md-icon class=mde-icon-mini>add_circle</md-icon> </md-button> <md-button ng-click=settings() class=\"md-icon-button md-mini\"> <md-icon class=mde-icon-mini>settings</md-icon> </md-button> <md-button class=\"md-icon-button md-mini\" ng-click=removeWidget() ng-show=removeWidget ng-mouseenter=\"ctrl.hoveringDelBtn=true\" ng-mouseleave=\"ctrl.hoveringDelBtn=false\"> <md-icon class=mde-icon-mini>delete</md-icon> </md-button> <md-divider></md-divider>  <md-button class=\"md-icon-button md-mini\" ng-repeat=\"item in extraActions\" ng-click=item.action()> <md-icon class=mde-icon-mini>{{item.icon}}</md-icon> </md-button> </div>  <div wb-margin=wbModel.style wb-padding=wbModel.style wb-size=wbModel.style wb-background=wbModel.style wb-border=wbModel.style class=wb-panel-body> <div ng-show=ctrl.hoveringDelBtn class=overlay></div> <ng-transclude wb-layout=wbModel.style></ng-transclude> </div> </div>"
  );


  $templateCache.put('views/settings/wb-background.html',
    " <div layout=column>  <div class=\"preview-box wb-flex-item-stretch\"> <div class=header>Preview</div> <div class=preview-area ng-class=\"[wbParent.wbModel.style.flexDirection,wbModel.style.justifyContent, wbModel.style.alignItems]\" style=\"display: flex\"> <div class=widget style=\"width:100px; height:50px; margin: 20px\" ng-style=\"{\n" +
    "            'opacity':'calc('+wbModel.style.opacity+'/100)',\n" +
    "            'background-color':wbModel.style.backgroundColor,\n" +
    "            }\" layout=row layout-align=\"center center\"> <p>item</p> </div> </div> </div> <div class=setting-panel layout=column layout-gt-sm=row>  <md-list> <md-subheader>Opacity</md-subheader> <md-divider></md-divider> <div layout=row class=wb-flex-align-items-center> <span>Percent</span> <md-slider flex min=0 max=100 ng-model=wbModel.style.opacity> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=wbModel.style.opacity> </md-input-container> </div> </md-list>  <md-list> <md-subheader>Color</md-subheader> <md-divider></md-divider> <div layout=row class=wb-flex-align-items-start> <md-color-picker md-color-clear-button=false label=Color icon=brush ng-model=wbModel.style.backgroundColor> </md-color-picker> </div> </md-list> </div> </div>"
  );


  $templateCache.put('views/settings/wb-border.html',
    " <div layout=column>   <div class=\"preview-box wb-flex-item-stretch\"> <div class=header>Preview</div> <div class=preview-area ng-class=\"[wbParent.wbModel.style.flexDirection,wbParent.wbMode.style.justifyContent, wbParent.wbMode.style.alignItems]\" style=\"display: flex\"> <div class=widget style=\"width:100px; height:50px; margin: 20px\" ng-style=\"{\n" +
    "            'border-top-left-radius':(wbModel.style.borderRadius.uniform) ? wbModel.style.borderRadius.all : wbModel.style.borderRadius.topLeft,\n" +
    "            'border-top-right-radius':(wbModel.style.borderRadius.uniform) ? wbModel.style.borderRadius.all : wbModel.style.borderRadius.topRight,\n" +
    "            'border-bottom-left-radius':(wbModel.style.borderRadius.uniform) ? wbModel.style.borderRadius.all : wbModel.style.borderRadius.bottomLeft,\n" +
    "            'border-bottom-right-radius':(wbModel.style.borderRadius.uniform) ? wbModel.style.borderRadius.all : wbModel.style.borderRadius.bottomRight,\n" +
    "\n" +
    "            'border-left-style':(wbModel.style.borderStyleColorWidth.uniform) ? wbModel.style.borderStyle.all : wbModel.style.borderStyle.left,\n" +
    "            'border-right-style':(wbModel.style.borderStyleColorWidth.uniform) ? wbModel.style.borderStyle.all : wbModel.style.borderStyle.right,\n" +
    "            'border-top-style':(wbModel.style.borderStyleColorWidth.uniform) ? wbModel.style.borderStyle.all : wbModel.style.borderStyle.top,\n" +
    "            'border-bottom-style':(wbModel.style.borderStyleColorWidth.uniform) ? wbModel.style.borderStyle.all : wbModel.style.borderStyle.bottom,\n" +
    "\n" +
    "            'border-left-width':(wbModel.style.borderStyleColorWidth.uniform) ? wbModel.style.borderWidth.all : wbModel.style.borderWidth.left,\n" +
    "            'border-right-width':(wbModel.style.borderStyleColorWidth.uniform) ? wbModel.style.borderWidth.all : wbModel.style.borderWidth.right,\n" +
    "            'border-top-width':(wbModel.style.borderStyleColorWidth.uniform) ? wbModel.style.borderWidth.all : wbModel.style.borderWidth.top,\n" +
    "            'border-bottom-width':(wbModel.style.borderStyleColorWidth.uniform) ? wbModel.style.borderWidth.all : wbModel.style.borderWidth.bottom,\n" +
    "\n" +
    "            'border-left-color':(wbModel.style.borderStyleColorWidth.uniform) ? wbModel.style.borderColor.all : wbModel.style.borderColor.left,\n" +
    "            'border-right-color':(wbModel.style.borderStyleColorWidth.uniform) ? wbModel.style.borderColor.all : wbModel.style.borderColor.right,\n" +
    "            'border-top-color':(wbModel.style.borderStyleColorWidth.uniform) ? wbModel.style.borderColor.all : wbModel.style.borderColor.top,\n" +
    "            'border-bottom-color':(wbModel.style.borderStyleColorWidth.uniform) ? wbModel.style.borderColor.all : wbModel.style.borderColor.bottom,\n" +
    "            }\" layout=row layout-align=\"center center\"> <p>item</p> </div> </div> </div> <div class=setting-panel layout=column layout-gt-sm=row>  <md-list> <md-subheader>Corner Radius</md-subheader> <md-divider></md-divider> <md-checkbox ng-model=wbModel.style.borderRadius.uniform>All equal</md-checkbox> <div layout=row class=wb-flex-align-items-center ng-show=wbModel.style.borderRadius.uniform> <span>Radius</span> <md-slider flex min=0 max=100 ng-model=wbModel.style.borderRadius.all> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=wbModel.style.borderRadius.all> </md-input-container> </div>         <div layout=row class=wb-flex-align-items-center ng-hide=wbModel.style.borderRadius.uniform> <span>Left</span> <md-slider flex min=0 max=100 ng-model=wbModel.style.borderRadius.topLeft> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=wbModel.style.borderRadius.topLeft> </md-input-container> </div> <div layout=row class=wb-flex-align-items-center ng-hide=wbModel.style.borderRadius.uniform> <span>Right</span> <md-slider flex min=0 max=100 ng-model=wbModel.style.borderRadius.topRight> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=wbModel.style.borderRadius.topRight> </md-input-container> </div> <div layout=row class=wb-flex-align-items-center ng-hide=wbModel.style.borderRadius.uniform> <span>Top</span> <md-slider flex min=0 max=100 ng-model=wbModel.style.borderRadius.bottomLeft> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=wbModel.style.borderRadius.bottomLeft> </md-input-container> </div> <div layout=row class=wb-flex-align-items-center ng-hide=wbModel.style.borderRadius.uniform> <span>Bottom</span> <md-slider flex min=0 max=100 ng-model=wbModel.style.borderRadius.bottomRight> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=wbModel.style.borderRadius.bottomRight> </md-input-container> </div> </md-list>  <md-list> <md-subheader>Style/Color/Thickness</md-subheader> <md-divider></md-divider> <md-checkbox ng-model=wbModel.style.borderStyleColorWidth.uniform>All equal</md-checkbox> <div layout=row class=wb-flex-align-items-start ng-show=wbModel.style.borderStyleColorWidth.uniform> <md-input-container flex=1> <label>Style</label> <md-select ng-model=wbModel.style.borderStyle.all> <md-option ng-repeat=\"style in styles\" value={{style.value}}> {{style.title}} </md-option> </md-select> </md-input-container> <md-input-container flex=0 style=\"min-width: 100px\"> <label>Thickness</label> <input flex type=number ng-model=wbModel.style.borderWidth.all> </md-input-container> <md-color-picker class=color-picker-hide-textbox md-color-clear-button=false label=Color icon=brush ng-model=wbModel.style.borderColor.all> </md-color-picker> </div>  <div layout=row class=wb-flex-align-items-start ng-hide=wbModel.style.borderStyleColorWidth.uniform> <span>Left: </span> <md-input-container flex=1> <label>Style</label> <md-select ng-model=wbModel.style.borderStyle.left> <md-option ng-repeat=\"style in styles\" value={{style.value}}> {{style.title}} </md-option> </md-select> </md-input-container> <md-input-container flex=0 style=\"min-width: 100px\"> <label>Thickness</label> <input flex type=number ng-model=wbModel.style.borderWidth.left> </md-input-container> <md-color-picker class=color-picker-hide-textbox md-color-clear-button=false label=Color icon=brush ng-model=wbModel.style.borderColor.left> </md-color-picker> </div>  <div layout=row class=wb-flex-align-items-start ng-hide=wbModel.style.borderStyleColorWidth.uniform> <span>Right: </span> <md-input-container flex=1> <label>Style</label> <md-select ng-model=wbModel.style.borderStyle.right> <md-option ng-repeat=\"style in styles\" value={{style.value}}> {{style.title}} </md-option> </md-select> </md-input-container> <md-input-container flex=0 style=\"min-width: 100px\"> <label>Thickness</label> <input flex type=number ng-model=wbModel.style.borderWidth.right> </md-input-container> <md-color-picker class=color-picker-hide-textbox md-color-clear-button=false label=Color icon=brush ng-model=wbModel.style.borderColor.right> </md-color-picker> </div>  <div layout=row class=wb-flex-align-items-start ng-hide=wbModel.style.borderStyleColorWidth.uniform> <span>Top: </span> <md-input-container flex=1> <label>Style</label> <md-select ng-model=wbModel.style.borderStyle.top> <md-option ng-repeat=\"style in styles\" value={{style.value}}> {{style.title}} </md-option> </md-select> </md-input-container> <md-input-container flex=0 style=\"min-width: 100px\"> <label>Thickness</label> <input flex type=number ng-model=wbModel.style.borderWidth.top> </md-input-container> <md-color-picker class=color-picker-hide-textbox md-color-clear-button=false label=Color icon=brush ng-model=wbModel.style.borderColor.top> </md-color-picker> </div>  <div layout=row class=wb-flex-align-items-start ng-hide=wbModel.style.borderStyleColorWidth.uniform> <span>Down: </span> <md-input-container flex=1> <label>Style</label> <md-select ng-model=wbModel.style.borderStyle.bottom> <md-option ng-repeat=\"style in styles\" value={{style.value}}> {{style.title}} </md-option> </md-select> </md-input-container> <md-input-container flex=0 style=\"min-width: 100px\"> <label>Thickness</label> <input flex type=number ng-model=wbModel.style.borderWidth.bottom> </md-input-container> <md-color-picker class=color-picker-hide-textbox md-color-clear-button=false label=Color icon=brush ng-model=wbModel.style.borderColor.bottom> </md-color-picker> </div> </md-list> </div> </div>"
  );


  $templateCache.put('views/settings/wb-description.html',
    " <div layout=column style=width:100%> <md-input-container> <label translate>Lable</label> <input ng-model=wbModel.label> </md-input-container> <md-input-container> <label translate>Description</label> <input ng-model=wbModel.description> </md-input-container> </div>"
  );


  $templateCache.put('views/settings/wb-general.html',
    "General settings"
  );


  $templateCache.put('views/settings/wb-layout-page.html',
    " <div layout=column>   <div class=\"preview-box wb-flex-item-stretch\"> <div class=header>Preview</div> <div class=\"preview-area wb-flex\" ng-class=\"[wbModel.style.flexDirection,wbModel.style.justifyContent, wbModel.style.alignItems]\"> <div class=widget layout=row layout-align=\"center center\"><p>1</p></div> <div class=widget layout=row layout-align=\"center center\"><p>2</p></div> <div class=widget layout=row layout-align=\"center center\"><p>3</p></div> </div> </div> <div class=setting-panel layout=column layout-gt-sm=row>  <md-list> <md-subheader>Direction</md-subheader> <md-divider style=\"margin-bottom: 1em\"></md-divider> <md-radio-group ng-model=wbModel.style.flexDirection role=radiogroup> <md-list-item ng-repeat=\"direction in flexDirection\"> <md-radio-button value={{direction.value}}> <md-icon>{{direction.icon}}</md-icon> {{direction.title |translate}} </md-radio-button> </md-list-item> </md-radio-group> </md-list>  <md-list> <md-subheader ng-show=\"wbModel.style.flexDirection=='wb-flex-row'\">Vertical Setting</md-subheader> <md-subheader ng-show=\"wbModel.style.flexDirection!='wb-flex-row'\">Horizontal Setting</md-subheader> <md-divider style=\"margin-bottom: 1em\"></md-divider> <md-radio-group ng-model=wbModel.style.alignItems role=radiogroup> <md-list-item ng-repeat=\"align in alignItems\"> <md-radio-button value={{align.value}}> <md-icon>{{direction.icon}}</md-icon> {{align.title |translate}} </md-radio-button> </md-list-item> </md-radio-group> </md-list>  <md-list> <md-subheader ng-show=\"wbModel.style.flexDirection!='wb-flex-row'\">Vertical Setting</md-subheader> <md-subheader ng-show=\"wbModel.style.flexDirection=='wb-flex-row'\">Horizontal Setting</md-subheader> <md-divider style=\"margin-bottom: 1em\"></md-divider> <md-radio-group ng-model=wbModel.style.justifyContent role=radiogroup> <md-list-item ng-repeat=\"align in justifyContent\"> <md-radio-button value={{align.value}}> <md-icon>{{direction.icon}}</md-icon> {{align.title |translate}} </md-radio-button> </md-list-item> </md-radio-group> </md-list> </div> </div>"
  );


  $templateCache.put('views/settings/wb-layout-self.html',
    " <div layout=column>   <div class=\"preview-box wb-flex-item-stretch\"> <div class=header>Preview</div> <div class=preview-area ng-class=\"[wbParent.wbModel.style.flexDirection,wbParent.wbModel.style.justifyContent, wbParent.wbModel.style.alignItems]\" style=\"display: flex\"> <div class=widget layout=row layout-align=\"center center\"><p>before</p></div> <div class=widget ng-class=wbModel.style.flexAlignItem ng-style=\"{'flex-grow':wbModel.style.flexItemGrow,'-webkit-flex-grow':wbModel.style.flexItemGrow}\" layout=row layout-align=\"center center\" style=\"border: 2px dotted\"><p> item</p></div> <div class=widget layout=row layout-align=\"center center\"><p>after</p></div> </div> </div> <div class=setting-panel layout=column layout-align=\"none none\" layout-gt-sm=row layout-align-gt-sm=\"space-around none\">  <md-list> <md-subheader ng-show=\"wbModel.style.flexDirection!='wb-flex-row'\">Vertical Setting</md-subheader> <md-subheader ng-show=\"wbModel.style.flexDirection=='wb-flex-row'\">Horizontal Setting</md-subheader> <md-divider style=\"margin-bottom: 1em\"></md-divider> <md-radio-group ng-model=wbModel.style.flexAlignItem role=radiogroup> <md-list-item ng-repeat=\"direction in flexAlignItem\"> <md-radio-button value={{direction.value}}> <md-icon>{{direction.icon}}</md-icon> {{direction.title |translate}} </md-radio-button> </md-list-item> </md-radio-group> </md-list>  <md-list> <md-subheader>Fill Extra Space</md-subheader> <md-divider style=\"margin-bottom: 1em\"></md-divider> <div layout=column style=\"margin-left: 14px; margin-right: 14px; min-width: 200px\"> <md-checkbox ng-model=wbModel.style.flexItemGrowEnabled style=\"margin-bottom: 2em\">Enabled</md-checkbox> <div layout=row class=wb-flex-align-items-center ng-disabled=!wbModel.style.flexItemGrowEnabled> <span>Weight</span> <md-slider ng-disabled=!wbModel.style.flexItemGrowEnabled flex min=0 max=10 step=1 ng-model=wbModel.style.flexItemGrow> </md-slider> <md-input-container> <input ng-disabled=!wbModel.style.flexItemGrowEnabled style=\"width: 50px\" flex type=number ng-model=wbModel.style.flexItemGrow> </md-input-container> </div> </div> </md-list> </div> </div>"
  );


  $templateCache.put('views/settings/wb-layout.html',
    " <div layout=column ng-style=\"{'width': '100%'}\">  <div class=preview-box> <div class=header>Preview</div> <div class=preview-area layout={{wbModel.style.direction}} layout-align=\"{{wbModel.style.directionAlignment}} {{wbModel.style.perpendicularAlignment}}\"> <div class=widget layout=row layout-align=\"center center\"><p>1</p></div> <div class=widget layout=row layout-align=\"center center\"><p>2</p></div> <div class=widget layout=row layout-align=\"center center\"><p>3</p></div> </div> </div> <div layout=column layout-align=\"none none\" layout-gt-sm=row layout-align-gt-sm=\"space-around none\"> <div> <div>Layout Direction</div> <md-radio-group ng-model=wbModel.style.direction role=radiogroup> <md-radio-button ng-repeat=\"direction in directions\" value={{direction.value}}> <md-icon>{{direction.icon}}</md-icon> {{direction.title |translate}} </md-radio-button> </md-radio-group> </div> <div> <div>Alignment in Layout Direction</div> <md-radio-group ng-model=wbModel.style.directionAlignment role=radiogroup> <md-radio-button ng-repeat=\"align in directionAlignments\" value={{align.value}}> {{align.title}} </md-radio-button> </md-radio-group> </div> <div> <div>Alignment in Perpendicular Direction</div> <md-radio-group ng-model=wbModel.style.perpendicularAlignment role=radiogroup> <md-radio-button ng-repeat=\"align in perpendicularAlignments\" value={{align.value}}> {{align.title}} </md-radio-button> </md-radio-group> </div> </div> </div>"
  );


  $templateCache.put('views/settings/wb-margin-padding.html',
    " <div layout=column>   <div class=\"preview-box wb-flex-item-stretch\"> <div class=header>Preview</div> <div class=preview-area ng-class=\"[wbParent.wbModel.style.flexDirection,wbModel.style.justifyContent, wbModel.style.alignItems]\" style=\"display: flex\"> <div class=widget layout=row layout-align=\"center center\"><p>before</p></div> <div class=widget ng-class=wbModel.style.flexAlignItem ng-style=\"{\n" +
    "                'margin-left':wbModel.style.marginLeft,\n" +
    "                'margin-right':wbModel.style.marginRight,\n" +
    "                'margin-top':wbModel.style.marginTop,\n" +
    "                'margin-bottom':wbModel.style.marginBottom,\n" +
    "\n" +
    "                'padding-left':wbModel.style.paddingLeft,\n" +
    "                'padding-right':wbModel.style.paddingRight,\n" +
    "                'padding-top':wbModel.style.paddingTop,\n" +
    "                'padding-bottom':wbModel.style.paddingBottom,\n" +
    "\n" +
    "                 'flex-grow':wbModel.style.flexItemGrow,\n" +
    "                 '-webkit-flex-grow':wbModel.style.flexItemGrow}\" layout=row layout-align=\"center center\" style=\"border: 2px dotted\"><p> item</p></div> <div class=widget layout=row layout-align=\"center center\"><p>after</p></div> </div> </div> <div class=setting-panel layout=column layout-gt-sm=row> <md-list> <md-subheader>Margin</md-subheader> <md-divider style=\"margin-bottom: 1em\"></md-divider> <div layout=row class=wb-flex-align-items-center> <span>Left</span> <md-slider flex min=0 max=100 ng-model=wbModel.style.marginLeft> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=wbModel.style.marginLeft> </md-input-container> </div> <div layout=row class=wb-flex-align-items-center> <span>Right</span> <md-slider flex min=0 max=100 ng-model=wbModel.style.marginRight> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=wbModel.style.marginRight> </md-input-container> </div> <div layout=row class=wb-flex-align-items-center> <span>Top</span> <md-slider flex min=0 max=100 ng-model=wbModel.style.marginTop> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=wbModel.style.marginTop> </md-input-container> </div> <div layout=row class=wb-flex-align-items-center> <span>Bottom</span> <md-slider flex min=0 max=100 ng-model=wbModel.style.marginBottom> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=wbModel.style.marginBottom> </md-input-container> </div> </md-list> <md-list> <md-subheader>Padding</md-subheader> <md-divider style=\"margin-bottom: 1em\"></md-divider> <div layout=row class=wb-flex-align-items-center> <span>Left</span> <md-slider flex min=0 max=100 ng-model=wbModel.style.paddingLeft> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=wbModel.style.paddingLeft> </md-input-container> </div> <div layout=row class=wb-flex-align-items-center> <span>Right</span> <md-slider flex min=0 max=100 ng-model=wbModel.style.paddingRight> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=wbModel.style.paddingRight> </md-input-container> </div> <div layout=row class=wb-flex-align-items-center> <span>Top</span> <md-slider flex min=0 max=100 ng-model=wbModel.style.paddingTop> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=wbModel.style.paddingTop> </md-input-container> </div> <div layout=row class=wb-flex-align-items-center> <span>Bottom</span> <md-slider flex min=0 max=100 ng-model=wbModel.style.paddingBottom> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=wbModel.style.paddingBottom> </md-input-container> </div> </md-list> </div> </div>"
  );


  $templateCache.put('views/settings/wb-min-max-size.html',
    " <div layout=column>  <div class=\"preview-box wb-flex-item-stretch\"> <div class=header>Preview</div> <div class=\"wb-flex preview-area wb-flex-justify-content-center\"> <div class=\"widget wb-flex-item-center\" ng-class=wbModel.style.flexAlignItem ng-style=\"{\n" +
    "                'min-width':wbModel.style.minWidth,\n" +
    "                'min-height':wbModel.style.minHeight,\n" +
    "                'max-width':(wbModel.style.maxWidth==0) ? 'none' : wbModel.style.maxWidth,\n" +
    "                'max-height':(wbModel.style.maxHeight==0)?'none':wbModel.style.maxHeight}\" layout=row layout-align=\"center center\" style=\"border: 2px dotted\"><p> item</p></div> </div> </div> <div class=setting-panel layout=column layout-gt-sm=row>  <md-list> <md-subheader>MIN</md-subheader> <md-divider style=\"margin-bottom: 1em\"></md-divider> <div layout=row class=wb-flex-align-items-center> <span>Width<md-tooltip>set value \"0\" for ignoring</md-tooltip></span> <md-slider flex min=0 max=100 ng-model=wbModel.style.minWidth> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=wbModel.style.minWidth> </md-input-container> </div> <div layout=row class=wb-flex-align-items-center> <span>Height<md-tooltip>set value \"0\" for ignoring</md-tooltip></span> <md-slider flex min=0 max=100 ng-model=wbModel.style.minHeight> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=wbModel.style.minHeight> </md-input-container> </div> </md-list>  <md-list> <md-subheader>MAX</md-subheader> <md-divider style=\"margin-bottom: 1em\"></md-divider> <div layout=row class=wb-flex-align-items-center> <span>Width<md-tooltip>set value \"0\" for ignoring</md-tooltip></span> <md-slider flex min=0 max=100 ng-model=wbModel.style.maxWidth> </md-slider> <md-input-container> <input style=\"width: 50px\" flex ng-model=wbModel.style.maxWidth> </md-input-container> </div> <div layout=row class=wb-flex-align-items-center> <span>Height<md-tooltip>set value \"0\" for ignoring</md-tooltip></span> <md-slider flex min=0 max=100 ng-model=wbModel.style.maxHeight> </md-slider> <md-input-container> <input style=\"width: 50px\" flex ng-model=wbModel.style.maxHeight> </md-input-container> </div> </md-list> </div> </div>"
  );


  $templateCache.put('views/settings/wb-notfound.html',
    " <md-icon>bug</md-icon> <h2>Settings page not found</h2>"
  );


  $templateCache.put('views/settings/wb-text.html',
    " <textarea ui-tinymce=tinymceOptions ng-model=wbModel.text flex>\n" +
    "</textarea>            "
  );


  $templateCache.put('views/widgets/wb-html.html',
    " <div ng-bind-html=\"wbModel.text | wbunsafe\"> </div>"
  );


  $templateCache.put('views/widgets/wb-notfound.html',
    "<div ng-show=wbEditable> Unsuported widget?! </div>"
  );

}]);
