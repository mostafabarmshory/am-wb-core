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
        //'ngMaterialWysiwyg',
        'ui.tinymce', //
        'dndLists',//
            'material.components.expansionPanels'
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

	if($scope.wbModel.style.borderColor.bottom==null || $scope.wbModel.style.borderColor.bottom==undefined)
		$scope.wbModel.style.borderColor.bottom='none';

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

    .controller('WbPageLayoutWbSettingsCtrl', function ($scope, $settings) {
        var scope = $scope;

        scope.flexDirection = [{
            title: 'row',
            icon: 'view_column',
            value: 'wb-flex-row'
        }, {
            title: 'column',
            icon: 'view_stream',
            value: 'wb-flex-column'
        }];

        scope.justifyContent = [{
            title: 'Start',
            icon: 'looks_one',
            value: 'wb-flex-justify-content-start'
        }, {
            title: 'End',
            icon:'looks_two',
            value: 'wb-flex-justify-content-end'
        }, {
            title: 'Center',
            icon:'looks_3',
            value: 'wb-flex-justify-content-center'
        }, {
            title: 'Space Around',
            icon:'looks_4',
            value: 'wb-flex-justify-content-space-around'
        }, {
            title: 'Space Between',
            icon:'looks_5',
            value: 'wb-flex-justify-content-space-between'
        }];

        scope.alignItems = [{
            title: 'Stretch',
            icon: 'looks_one',
            value: 'wb-flex-align-items-stretch'
        }, {
            title: 'Start',
            icon: 'looks_two',
            value: 'wb-flex-align-items-start'
        }, {
            title: 'End',
            icon: 'looks_3',
            value: 'wb-flex-align-items-end'
        }, {
            title: 'Center',
            icon: 'looks_4',
            value: 'wb-flex-align-items-center'
        }]
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
	icon: 'looks_one',
	value : 'wb-flex-item-auto'
    }, {
	title : 'Start',
	icon: 'looks_two',
	value : 'wb-flex-item-start'
    }, {
	title : 'End',
		icon: 'looks_3',
	value : 'wb-flex-item-end'
    }, {
	title : 'Center',
		icon: 'looks_4',
	value : 'wb-flex-item-center'
    }, {
	title : 'stretch',
		icon: 'looks_5',
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
			'opacity':(style.isTransparent) ? style.opacity/100 : 1,
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
		if(!style.margin){
		    style.margin ={};
		}
		element.css({
	            'margin-left':(style.margin.isUniform) ? style.margin.uniform : style.margin.left,
	            'margin-right':(style.margin.isUniform) ? style.margin.uniform : style.margin.right,
	            'margin-top':(style.margin.isUniform) ? style.margin.uniform : style.margin.top,
	            'margin-bottom':(style.margin.isUniform) ? style.margin.uniform : style.margin.bottom
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
		if(!style.padding){
		    style.padding ={};
		}
		element.css({
	            'padding-left':(style.padding.isUniform) ? style.padding.uniform : style.padding.left,
	            'padding-right':(style.padding.isUniform) ? style.padding.uniform : style.padding.right,
	            'padding-top':(style.padding.isUniform) ? style.padding.uniform : style.padding.top,
	            'padding-bottom':(style.padding.isUniform) ? style.padding.uniform : style.padding.bottom
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

var dragClass = 'wb-content-dragenter';
var bodyElementSelector = 'div#wb-content-body';
var placeholderElementSelector = 'div#wb-content-placeholder';

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
 */
.directive('wbContent', function($compile, $widget, $controller, $settings, $q) {
    return {
	templateUrl : 'views/directives/wb-content.html',
	transclude : true,
	restrict : 'E',
	replace : true,
	scope : {
	    wbModel : '=?',
	    wbEditable : '=?'
	},
	link : function(scope, element, attrs) {
	    // Note that object must be an object or array,
	    // NOT a primitive value like string, number, etc.
	    var objIdMap=new WeakMap();
	    var objectCount = 0;
	    function objectId(object){
		if (!objIdMap.has(object)) 
		    objIdMap.set(object,++objectCount);
		return objIdMap.get(object);
	    }

	    /**
	     * Find the aunchor
	     * 
	     * The anchor is an element where widgets are added into.
	     * 
	     * @returns element anchor
	     */
	    function getAnchor() {
		return element//
		.children(bodyElementSelector)//
		.children(placeholderElementSelector);
	    }

	    /**
	     * Reload view
	     * 
	     * Removes all widgets and load the view agin.
	     */
	    function reloadView() {
		cleanView();
		var anchor = getAnchor();
		var compilesJob = [];
		var elements = [];
		scope.wbModel.contents.forEach(function(item, index) {
		    compilesJob.push($widget.compile(item, scope)//
			    .then(function(elem) {
				elem.attr('index', index);
				elem.attr('id', objectId(item));
				elements.push(elem);
			    }));
		});
		return $q.all(compilesJob)//
		.then(function() {
		    elements.sort(function(a, b) {
			if (a.attr('index') < b.attr('index'))
			    return -1;
			if (a.attr('index') > b.attr('index'))
			    return 1;
			return 0;
		    });
		    var anchor = getAnchor();
		    elements.forEach(function(item){
			anchor.append(item);
		    });
		});
	    }

	    /**
	     * New widget
	     */
	    function newWidget() {
		return $widget.select({
		    wbModel : {},
		    style : {}
		})//
		.then(function(model) {
		    $widget.compile(model, scope)//
		    .then(function(element) {
			element.attr('index', scope.wbModel.contents.length);
			element.attr('id', objectId(model));
			scope.wbModel.contents.push(model);
			getAnchor().append(element);
		    });
		});
	    }

	    /**
	     * Clean view
	     * 
	     * Remove all widgets from the veiw and clean the tmeplate.
	     * 
	     */
	    function cleanView() {
		element//
		.children(bodyElementSelector)//
		.children(placeholderElementSelector)//
		.empty();
	    }

	    /*
	     * Removes a widget
	     * 
	     * Data model and visual element related to the input model will be
	     * removed.
	     */
	    function removeChild(model) {
		var index = scope.wbModel.contents.indexOf(model);
		if (index > -1) {
		    var a = element//
		    .children(bodyElementSelector)//
		    .children(placeholderElementSelector)
		    .children('#'+objectId(model));
		    a.remove();
		    scope.wbModel.contents.splice(index, 1);
		}
	    }

	    /**
	     * Load container settings
	     * 
	     * Loads settings of the current container.
	     */
	    function settings() {
		return $settings.load({
		    wbModel : scope.wbModel,
		    wbParent : scope.wbParent
		});
	    }

	    /**
	     * Adds dragged widget
	     */
	    function dropCallback(event, index, item, external, type) {
		// add widget
		$widget.compile(item, scope)//
		.then(function(newElement) {
		    var list = element//
		    .children(bodyElementSelector)//
		    .children(placeholderElementSelector);
		    newElement.attr('id', objectId(item));
		    if (index < list[0].childNodes.length) {
			newElement.insertBefore(list[0].childNodes[index]);
		    } else {
			list.append(newElement);
		    }
		    scope.wbModel.contents.splice(index, 0, item);
		    console.log('widget add to list');
		});
		return true;
	    }

	    /*
	     * Watch the model for modification.
	     */
	    scope.$watch('wbModel', function() {
		if (!scope.wbModel) {
		    // XXX: maso, 1395: هنوز مدل تعیین نشده
		    return;
		}
		if (!angular.isArray(scope.wbModel.contents)) {
		    scope.wbModel.contents = [];
		}
		scope.wbModel.type = 'Container';
		reloadView();
	    });

	    scope.removeChild = removeChild;
	    scope.settings = settings;
	    scope.dropCallback = dropCallback;
	    scope.newWidget = newWidget;
	    scope.objectId = objectId;
	}
    };
});//


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
 */
.directive('wbIcon', function() {
    return {
	restrict : 'E',
	template : '<ng-md-icon icon="{{transcluded_content}}"></ng-md-icon>',
	replace : true,
	transclude : true,
	compile : function compile(tElement, tAttrs, transclude) {
	    return {
		pre : function(scope) {
		    transclude(scope, function(clone) {
			scope.transcluded_content = clone[0].textContent;
		    });
		}
	    }
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

var dragClass = 'wb-content-dragenter';
var bodyElementSelector = 'div#wb-content-body';
var placeholderElementSelector = 'div#wb-content-placeholder';

angular.module('ngMaterialWeburger')
/**
 * 
 */
.directive('wbPanel', function($compile, $widget, $controller, $settings, $q) {
    return {
	templateUrl : 'views/directives/wb-panel.html',
	restrict : 'E',
	replace : true,
	transclude : true,
	link : function(scope, element, attrs) {
	    /**
	     * Remove panel from parent
	     */
	    function remove() {
		console.log('panel removed:' + element.attr('id'));
		return scope.$parent.removeChild(scope.wbModel);
	    }

	    /**
	     * Empty view
	     * 
	     * Remove all widgets from the view.
	     */
	    function cleanView() {
		console.log('remove all widgets:' + element.attr('id'));
		element//
		.children(bodyElementSelector)//
		.children(placeholderElementSelector)//
		.empty();
	    }

	    /**
	     * Find aunchor
	     * 
	     * Find and return anchor element.
	     */
	    function getAnchor() {
		return element//
		.children(bodyElementSelector)//
		.children(placeholderElementSelector);
	    }

	    /**
	     * Relaod view
	     */
	    function reloadView() {
		cleanView();
		var anchor = getAnchor();
		var compilesJob = [];
		var elements = [];
		scope.wbModel.contents.forEach(function(item, index) {
		    compilesJob.push($widget.compile(item, scope)//
			    .then(function(element) {
				element.attr('index', index);
				element.attr('id', scope.objectId(item));
				elements.push(element);
			    }));
		});
		return $q.all(compilesJob)//
		.then(function() {
		    elements.sort(function(a, b) {
			if (a.attr('index') < b.attr('index'))
			    return -1;
			if (a.attr('index') > b.attr('index'))
			    return 1;
			return 0;
		    });
		    var anchor = getAnchor();
		    elements.forEach(function(item) {
			anchor.append(item);
		    });
		});
	    }

	    /**
	     * Adds dragged widget
	     */
	    function dropCallback(event, index, item, external, type) {
		// add widget
		$widget.compile(item, scope)//
		.then(function(newElement) {
		    var list = element//
		    .children(bodyElementSelector)//
		    .children(placeholderElementSelector);
		    newElement.attr('id', scope.objectId(item));
		    if (index < list[0].childNodes.length) {
			newElement.insertBefore(list[0].childNodes[index]);
		    } else {
			list.append(newElement);
		    }
		    scope.wbModel.contents.splice(index, 0, item);
		    console.log('widget add to list');
		});
		return true;
	    }

	    /**
	     * Removes a widget
	     * 
	     * Data model and visual element related to the input model will be
	     * removed.
	     */
	    function removeChild(model) {
		var index = scope.wbModel.contents.indexOf(model);
		if (index > -1) {
		    var a = element//
		    .children(bodyElementSelector)//
		    .children(placeholderElementSelector)
		    .children('#'+scope.objectId(model));
		    a.remove();
		    scope.wbModel.contents.splice(index, 1);
		}
	    }

	    function settings() {
		return $settings.load({
		    wbModel : scope.wbModel,
		    wbParent : scope.$parent
		});
	    }

	    /**
	     * Select and add a widget
	     * 
	     * @deprecated
	     */
	    function newWidget() {
		return $widget.select({
		    wbModel : {},
		    style : {}
		})//
		.then(function(model) {
		    $widget.compile(model, scope)//
		    .then(function(elem) {
			elem.attr('index', scope.wbModel.contents.length);
			elem.attr('id', scope.objectId(model));
			scope.wbModel.contents.push(model);
			getAnchor().append(elem);
		    });
		});
	    }

	    element.attr('id', scope.objectId(scope.wbModel));
	    scope.removeChild = removeChild;
	    scope.remove = remove;
	    scope.settings = settings;
	    scope.dropCallback = dropCallback;
	    scope.newWidget = newWidget;

	    if (!angular.isArray(scope.wbModel.contents)) {
		scope.wbModel.contents = [];
		return;
	    }
	    if(!angular.isDefined(scope.wbModel.name)){
		scope.wbModel.name = 'Panel';
	    }
	    reloadView();

	}
    };
});//


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
.directive('wbSettingPanelGroup', function($settings) {
    return {
	restrict : 'E',
	templateUrl: 'views/directives/wb-setting-panel-group.html',
//	link : function(scope, element, attrs, ctrl, transclude) {
//	    element.attr('id', $settings.WB_SETTING_PANEL_ID);
//	},
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
.directive('wbSettingPanel', function($settings) {
    return {
	restrict : 'E',
	transclude : true,
	templateUrl : 'views/directives/wb-setting-panel.html',
	// This create an isolated scope
	scope : {
	    label : '@label',
	    description : '@?',
	    icon : '@?',
	},
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
    .directive('wbUiChoose', function () {
        return {
            templateUrl: 'views/directives/wb-ui-choose.html',
            restrict: 'E',
            scope: {
                items: '=items',
                selected: '=selected'
            },
            link: function (scope, element, attrs, ctrl, transclude) {

            },
            controller: function ($scope, $element, $settings, $widget) {
                $scope.selectedIndex = 0;
                if ($scope.selected != null)
                    for (var item in $scope.items) {
                        if (item.value == $scope.selected)
                            $scope.selectedIndex = $scope.items.indexOf(item);
                    }
                else
                    $scope.selected = $scope.items[0].value;

                // listen to active tab and update selected attribute.
                $scope.$watch('selectedIndex', function (current, old) {
                    $scope.selected = $scope.items[current].value;
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
     * @name wbUiSettingChoose
     * @memberof ngMaterialWeburger
     * @description a setting section for choosing values.
     *
     */
    .directive('wbUiSettingChoose', function () {
        return {
            templateUrl: 'views/directives/wb-ui-setting-choose.html',
            restrict: 'E',
            scope: {
                title: '@title',
                value: '=value',
                icon: '@icon',
                items:'=items'
            }
        };
    });

/**
 * Created by mgh on 2/26/17.
 */
angular.module('ngMaterialWeburger')

    /**
     * @ngdoc directive
     * @name wbUiSettingColor
     * @memberof ngMaterialWeburger
     * @description a setting section to set color.
     *
     */
    .directive('wbUiSettingColor', function () {
        return {
            templateUrl: 'views/directives/wb-ui-setting-color.html',
            restrict: 'E',
            scope: {
                title: '@title',
                value: '=value',
                icon: '@icon'
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
     * @name wbUiSettingDropdown
     * @memberof ngMaterialWeburger
     * @description a setting section for choosing values.
     *
     */
    .directive('wbUiSettingDropdown', function () {
        return {
            templateUrl: 'views/directives/wb-ui-setting-dropdown.html',
            restrict: 'E',
            scope: {
                title: '@title',
                value: '=value',
                icon: '@icon',
                items:'=items'
            }
        };
    });

/**
 * Created by mgh on 2/26/17.
 */
angular.module('ngMaterialWeburger')

    /**
     * @ngdoc directive
     * @name wbUiSettingNumber
     * @memberof ngMaterialWeburger
     * @description a setting section to set a number.
     *
     */
    .directive('wbUiSettingNumber', function () {
        return {
            templateUrl: 'views/directives/wb-ui-setting-number.html',
            restrict: 'E',
            scope: {
                title: '@title',
                value: '=value',
                icon: '@icon',
                slider:'@slider'
            }
        };
    });

/**
 * Created by mgh on 2/26/17.
 */
angular.module('ngMaterialWeburger')

    /**
     * @ngdoc directive
     * @name wbUiSettingOnOffSwitch
     * @memberof ngMaterialWeburger
     * @description a setting section for on/off switch.
     *
     */
    .directive('wbUiSettingOnOffSwitch', function () {
        return {
            templateUrl: 'views/directives/wb-ui-setting-on-off-switch.html',
            restrict: 'E',
            scope: {
                title: '@title',
                value: '=value',
                icon: '@icon'
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
	replace: true,
	link : function(scope, element, attrs, ctrl, transclude) {
	    // Modify angular transclude function
	    // see:
	    // http://angular-tips.com/blog/2014/03/transclusion-and-scopes/
	    // FIXME: maso, 2017: use regular dom insted of ng-transclude
	    transclude(scope, function(clone, scope) {
		var node = element//
		.find('wb-transclude')//
		.append(clone);
	    });
	},
	controller : function($scope, $element, $settings, $widget) {
	    var element = $element;
	    /**
	     * Remove widget from parent
	     */
	    function remove() {
		console.log('widget removed');
		return $scope.$parent.removeChild($scope.wbModel);
	    }

	    /**
	     * Load widget settings
	     * 
	     */
	    function settings() {
		return $settings.load({
		    wbModel : $scope.wbModel,
		    wbParent : $scope.$parent,
		});
	    }

	    /*
	     * Add to scope
	     */
	    $scope.remove = remove;
	    $scope.movedCallback = remove;
	    $scope.settings = settings;
	    element.attr('id', $scope.objectId($scope.wbModel));
	    if(!angular.isDefined($scope.wbModel.name)){
		$scope.wbModel.name = 'Widget';
	    }
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
	label : 'Background',
	icon : 'image',
	description : 'manage',
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
	icon: 'dashboard',
	controller: 'WbLayoutWbSettingsCtrl',
	templateUrl : 'views/settings/wb-layout.html'
    });
    $settings.newPage({
	type: 'border',
	label : 'Border',
	icon: 'border_all',
	controller: 'WbBorderSettingCtrl',
	templateUrl : 'views/settings/wb-border.html'
    });
    $settings.newPage({
	type: 'pageLayout',
	label : 'Page Layout',
	icon: 'dashboard',
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
		template : '<wb-panel></wb-panel>',
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
		controller: function($scope){
//		    $scope.test = 'test string';
//		    $scope.wbModel.text='my text';
		},
		controllerAs: 'Ctrl',
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

angular
.module('ngMaterialWeburger')

/**
 * @ngdoc service
 * @name $widget
 * @memberof ngMaterialWeburger
 * @description مدیریت ویجت‌های سیستم
 * 
 * این سرویس تمام ویجت‌های قابل استفاده در سیستم را تعیین می‌کند.
 */
.service(
	'$settings',
	function($rootScope, $controller, $widget, $q, $sce, $compile,
		$document, $templateRequest) {
	    var WB_SETTING_PANEL_ID = 'WB-SETTING-PANEL';
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
		} else if (angular
			.isDefined(templateUrl = page.templateUrl)) {
		    if (angular.isFunction(templateUrl)) {
			templateUrl = templateUrl(page.params);
		    }
		    if (angular.isDefined(templateUrl)) {
			page.loadedTemplateUrl = $sce
			.valueOf(templateUrl);
			template = $templateRequest(templateUrl);
		    }
		}
		return template;
	    }

	    /**
	     * encapsulate template srce with panel widget template.
	     * 
	     * @param page
	     *                setting page config
	     * @param tempateSrc
	     *                setting page html template
	     * @returns encapsulate html template
	     */
	    function _encapsulateSettingPanel(page, templateSrc) {
		// TODO: maso, 2017: pass all paramter to the setting
		// panel.
		var attr = ' ';
		if (page.label) {
		    attr += ' label=\"' + page.label + '\"';
		}
		if (page.icon) {
		    attr += ' icon=\"' + page.icon + '\"';
		}
		if (page.description) {
		    attr += ' description=\"' + page.description + '\"';
		}
		return '<wb-setting-panel ' + attr + '>' + templateSrc
		+ '</wb-setting-panel>';
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
		if (angular.isDefined(oldScope)) {
		    oldScope.$destroy();
		}
		var scope = $rootScope.$new(true, $rootScope);
		scope.wbModel = models.wbModel;
		scope.wbParent = models.wbParent;
		oldScope = scope;

		// 1- Find element
		var target = $document.find('#' + WB_SETTING_PANEL_ID);

		// 2- Clear childrens
		target.empty();

		// 3- load pages
		$widget
		.widget(models.wbModel)
		//
		.then(
			function(w) {
			    widget = w;
			    if (angular.isArray(widget.setting)) {
				angular
				.forEach(
					widget.setting,
					function(type) {
					    var page = notFound;
					    if (type in settingPages) {
						page = settingPages[type];
					    }
					    var template = getTemplateFor(page);
					    if (angular
						    .isDefined(template)) {
						var job = template
						//
						.then(function(
							templateSrc) {
						    templateSrc = _encapsulateSettingPanel(
							    page,
							    templateSrc);
						    var element = angular
						    .element(templateSrc);
						    if (angular
							    .isDefined(page.controller)) {
							$controller(
								page.controller,
								{
								    $scope : scope,
								    $element : element,
								});
						    }
						    $compile(
							    element)
							    (
								    scope);
						    pages
						    .push(element);
						});
						jobs
						.push(job);
					    }
					});
			    } else {
				// TODO: maso, 2017: not setting
				// page founnd
			    }
			})
			//
			.then(
				function() {
				    $q.all(jobs).then(
					    function() {
						angular
						.forEach(
							pages,
							function(
								element) {
							    target
							    .append(element);
							});
					    });
				});
	    }

	    // تعیین سرویس‌ها
	    this.WB_SETTING_PANEL_ID = WB_SETTING_PANEL_ID;
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
.service('$widget', function(
	$q, $sce, $templateRequest, $compile, $controller, $rootScope,
	$timeout, $mdDialog, PaginatorPage) {

    var contentElementAsso = [];
    var elementKey = [];
    var notFoundWidget = {
	    templateUrl : 'views/widgets/wb-notfound.html',
	    label : 'Not found',
	    description : 'Element not found',
    };
    var container = {
	    type : 'Container',
	    label : 'Panel',
	    description : 'Panel contains list of widgets.',
	    image : 'images/wb/content.svg',
	    setting : [ 'description', 'border', 'background',
		'pageLayout', 'selfLayout' ],
    };

    function _widget(model){
	if (model.type in contentElementAsso) {
	    return contentElementAsso[model.type];
	}
	if (model.type === 'Container') {
	    return container;
	}
	return notFoundWidget;
    }
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
	    deferred.resolve(_widget(model));
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
	if (widget.type in contentElementAsso) {
	    // XXX: maso, throw exception
	    return;
	}
	contentElementAsso[widget.type] = widget;
	elementKey.push(widget.type);
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

    function compile(model, parenScope){
	var widget = _widget(model);
	var childScope = null;
	var element = null;

	// 1- create scope
	childScope = parenScope.$new(false, parenScope);
	childScope.wbModel = model;

	// 2- create element
	return $q.when(getTemplateFor(widget))//
	.then(function(template) {
	    if (model.type != 'Page') {
		template = '<wb-widget>' + template + '</wb-widget>';
	    }
	    element = angular.element(template);

	    // 3- bind controller
	    var link = $compile(element);
	    if (angular.isDefined(widget.controller)) {
		var locals = {
			$scope : childScope,
			$element : element,
			// TODO: maso, 2017: bind wbModel, wbParent,
			// and wbEditable
		};
		var controller = $controller(widget.controller, locals);
		if (widget.controllerAs) {
		    childScope[widget.controllerAs] = controller;
		}
		element.data('$ngControllerController', controller);
	    }
	    link(childScope);
	    return element;
	});
    }

    // تعیین سرویس‌ها
    this.newWidget = newWidget;
    this.widget = widget;
    this.widgets = widgets;
    this.select = select;
    this.getTemplateFor = getTemplateFor;
    this.compile = compile;
});

angular.module('ngMaterialWeburger').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/dialogs/wb-selectwidget.html',
    "<md-dialog aria-label=\"edit action dialog\" ng-controller=WbWidgetSelectCtrl ng-cloak>  <md-toolbar> <div class=md-toolbar-tools> <h2 translate>Widget list</h2> <span flex></span> <md-button class=md-icon-button ng-click=cancel()> <md-icon aria-label=\"Close dialog\">close</md-icon> </md-button> </div> </md-toolbar>    <md-dialog-content> <md-content class=\"md-padding md-dialog-content\" layout-xs=column layout=row layout-wrap>    <md-card ng-repeat=\"widget in widgets.items\" flex-xs flex-gt-xs=45 md-theme-watch> <md-card-title> <md-card-title-text> <span class=md-headline>{{widget.label}}</span> <span class=md-subhead>{{widget.description}}</span> </md-card-title-text> <md-card-title-media> <img src=\"{{widget.image}}\"> </md-card-title-media> </md-card-title> <md-card-actions layout=row layout-align=\"end center\"> <md-button ng-click=answerWidget(widget)> <md-icon>add</md-icon> {{ 'Add' | translate }} </md-button>  </md-card-actions> </md-card> </md-content> </md-dialog-content> </md-dialog>"
  );


  $templateCache.put('views/directives/wb-content.html',
    "<div dnd-disable-if=!wbEditable ng-class=\"{'wb-panel': wbEditable}\">  <div ng-show=wbEditable class=wb-panel-header layout=row> <span translate> Content</span> <span flex></span> <md-button ng-click=newWidget() class=\"wb-icon-button md-mini\"> <wb-icon class=wb-icon-mini>add_circle</wb-icon> </md-button> <md-button ng-click=settings() class=\"wb-icon-button md-mini\"> <wb-icon class=wb-icon-mini>settings</wb-icon> </md-button> </div>  <div class=wb-panel-body id=wb-content-body> <div ng-show=hoveringDelBtn class=wb-panel-overlay> </div>  <div class=wb-panel-container wb-layout=wbModel.style wb-margin=wbModel.style wb-padding=wbModel.style wb-size=wbModel.style wb-background=wbModel.style wb-border=wbModel.style id=wb-content-placeholder dnd-external-sources=true dnd-list=wbModel.contents dnd-allowed-types=\"['wb.widget']\" dnd-drop=\"dropCallback(event, index, item, external, type)\"> </div>  </div> </div>"
  );


  $templateCache.put('views/directives/wb-panel.html',
    "cd <div dnd-disable-if=!wbEditable dnd-draggable=wbModel dnd-type=\"'wb.widget'\" dnd-moved=remove() ng-class=\"{'wb-panel': wbEditable}\" name={{wbModel.name}}>  <div ng-show=wbEditable class=wb-panel-header layout=row> <span translate> {{wbModel.name}}</span> <span flex></span> <md-button ng-click=newWidget(wbModel) class=\"wb-icon-button md-mini\"> <wb-icon class=wb-icon-mini>add_circle</wb-icon> </md-button> <md-button ng-click=settings() class=\"wb-icon-button md-mini\"> <wb-icon class=wb-icon-mini>settings</wb-icon> </md-button> <md-button class=\"wb-icon-button md-mini\" ng-mouseenter=\"hoveringDelBtn=true\" ng-mouseleave=\"hoveringDelBtn=false\" ng-click=remove()> <wb-icon class=wb-icon-mini>delete</wb-icon> </md-button> </div>  <div class=wb-panel-body id=wb-content-body> <div ng-show=hoveringDelBtn class=wb-panel-overlay> </div>  <div class=wb-panel-container wb-layout=wbModel.style wb-margin=wbModel.style wb-padding=wbModel.style wb-size=wbModel.style wb-background=wbModel.style wb-border=wbModel.style id=wb-content-placeholder dnd-external-sources=true dnd-list=wbModel.contents dnd-allowed-types=\"['wb.widget']\" dnd-drop=\"dropCallback(event, index, item, external, type)\"> </div>  </div> </div>"
  );


  $templateCache.put('views/directives/wb-setting-panel-group.html',
    "<div layout=column> <md-toolbar> hi </md-toolbar> <div id=WB-SETTING-PANEL>  </div> </div>"
  );


  $templateCache.put('views/directives/wb-setting-panel.html',
    " <md-expansion-panel> <md-expansion-panel-collapsed>  <div class=md-title>{{label}}</div> <div class=md-summary></div> <md-expansion-panel-icon></md-expansion-panel-icon> </md-expansion-panel-collapsed> <md-expansion-panel-expanded> <md-expansion-panel-header> <div class=md-title>{{label}}</div> <div class=md-summary></div> <md-expansion-panel-icon ng-click=$panel.collapse()></md-expansion-panel-icon> </md-expansion-panel-header> <md-expansion-panel-content style=\"padding: 0px\"> <ng-transclude></ng-transclude> </md-expansion-panel-content> </md-expansion-panel-expanded> </md-expansion-panel>"
  );


  $templateCache.put('views/directives/wb-ui-choose.html',
    "<md-tabs class=wb-tab-as-choose-button md-selected=selectedIndex> <md-tab ng-repeat=\"item in items\"> <md-tab-label> <md-icon>{{item.icon}}</md-icon> </md-tab-label> </md-tab> </md-tabs>"
  );


  $templateCache.put('views/directives/wb-ui-setting-choose.html',
    "<md-list-item> <md-icon ng-hide=\"icon==undefined || icon==null || icon==''\">{{icon}}</md-icon> <p ng-hide=\"title==undefined || title==null || title==''\">{{title}}</p> <wb-ui-choose flex=100 items=items selected></wb-ui-choose> </md-list-item>"
  );


  $templateCache.put('views/directives/wb-ui-setting-color.html',
    "<md-list-item> <md-icon ng-hide=\"icon==undefined || icon==null || icon=='title'\">{{icon}}</md-icon> <p ng-hide=\"title==undefined || title==null || title==''\">{{title}}</p> <md-color-picker class=color-picker-hide-textbox md-color-clear-button=false ng-model=value> </md-color-picker> </md-list-item>"
  );


  $templateCache.put('views/directives/wb-ui-setting-dropdown.html',
    "<md-list-item> <md-icon ng-hide=\"icon==undefined || icon==null || icon==''\">{{icon}}</md-icon> <p ng-hide=\"title==undefined || title==null || title==''\">{{title}}</p> <md-select style=\"margin: 0px\" ng-model=value> <md-option ng-repeat=\"item in items\" value={{item.value}}> {{item.title}} </md-option> </md-select> </md-list-item>"
  );


  $templateCache.put('views/directives/wb-ui-setting-number.html',
    "<md-list-item ng-show=\"slider==undefined\"> <md-icon ng-hide=\"icon==undefined || icon==null || icon==''\">{{icon}}</md-icon> <p ng-hide=\"title==undefined || title==null  || title==''\">{{title}}</p> <md-input-container style=\"margin: 0px\"> <input style=\"width: 50px\" type=number ng-model=value flex> </md-input-container> </md-list-item> <md-list-item ng-show=\"slider!=undefined\"> <md-icon ng-hide=\"icon==undefined || icon==null || icon=='' || icon=='wb-blank'\">{{icon}}</md-icon> <div ng-show=\"icon=='wb-blank'\" style=\"display: inline-block; width: 32px; opacity: 0.0\"></div> <p ng-hide=\"title==undefined || title==null || title==''\">{{title}}</p> <md-slider min=0 max=100 ng-model=value flex></md-slider> </md-list-item>"
  );


  $templateCache.put('views/directives/wb-ui-setting-on-off-switch.html',
    "<md-list-item> <md-icon ng-hide=\"icon==undefined || icon==null || icon==''\">{{icon}}</md-icon> <p ng-hide=\"title==undefined || title==null || title==''\">{{title}}</p> <md-switch class=md-secondary ng-model=value></md-switch> </md-list-item>"
  );


  $templateCache.put('views/directives/wb-widget.html',
    "<div dnd-disable-if=!wbEditable dnd-draggable=wbModel dnd-type=\"'wb.widget'\" dnd-moved=movedCallback() ng-class=\"{'wb-widget': wbEditable}\" layout=column name={{wbModel.name}}>  <div ng-show=wbEditable layout=row class=wb-widget-header> <span translate> {{wbModel.name}}</span> <span flex></span> <md-button ng-if=add ng-click=add() class=\"wb-icon-button md-mini\"> <wb-icon class=mde-icon-mini>add_circle</wb-icon> </md-button> <md-button ng-click=settings() class=\"wb-icon-button md-mini\"> <wb-icon class=mde-icon-mini>settings</wb-icon> </md-button> <md-button class=\"wb-icon-button md-mini\" ng-click=remove() ng-show=remove ng-mouseenter=\"ctrl.hoveringDelBtn=true\" ng-mouseleave=\"ctrl.hoveringDelBtn=false\"> <wb-icon class=mde-icon-mini>delete</wb-icon> </md-button> <md-divider></md-divider>  <md-button class=\"wb-icon-button md-mini\" ng-repeat=\"item in extraActions\" ng-click=item.action()> <wb-icon class=mde-icon-mini>{{item.icon}}</wb-icon> </md-button> </div>  <div wb-margin=wbModel.style wb-padding=wbModel.style wb-size=wbModel.style wb-background=wbModel.style wb-border=wbModel.style class=wb-widget-body> <div ng-show=ctrl.hoveringDelBtn class=wb-widget-overlay></div> <wb-transclude class=wb-widget-container wb-layout=wbModel.style> </wb-transclude> </div> </div>"
  );


  $templateCache.put('views/settings/wb-background.html',
    " <md-list class=wb-setting-panel>  <wb-ui-setting-on-off-switch title=Transparent? icon=blur_on value=wbModel.style.isTransparent></wb-ui-setting-on-off-switch>  <wb-ui-setting-number ng-show=wbModel.style.isTransparent title=Opacity icon=opacity value=wbModel.style.opacity></wb-ui-setting-number>  <wb-ui-setting-number ng-show=wbModel.style.isTransparent slider=\"\" icon=wb-blank value=wbModel.style.opacity></wb-ui-setting-number>  <wb-ui-setting-color title=\"Background Color\" icon=format_color_fill value=wbModel.style.backgroundColor></wb-ui-setting-color> </md-list>"
  );


  $templateCache.put('views/settings/wb-border.html',
    " <md-list class=wb-setting-panel>   <md-subheader class=md-no-sticky>Corner Radius</md-subheader>  <wb-ui-setting-on-off-switch title=\"All Equal?\" icon=rounded_corner value=wbModel.style.borderRadius.uniform></wb-ui-setting-on-off-switch>  <wb-ui-setting-number ng-show=wbModel.style.borderRadius.uniform title=Radius icon=rounded_corner value=wbModel.style.borderRadius.all></wb-ui-setting-number>  <wb-ui-setting-number ng-show=wbModel.style.borderRadius.uniform slider=\"\" icon=wb-blank value=wbModel.style.borderRadius.all></wb-ui-setting-number>   <wb-ui-setting-number ng-show=!wbModel.style.borderRadius.uniform title=Top-Left icon=face value=wbModel.style.borderRadius.topLeft></wb-ui-setting-number>  <wb-ui-setting-number ng-show=!wbModel.style.borderRadius.uniform title=Top-Right icon=face value=wbModel.style.borderRadius.topRight></wb-ui-setting-number>  <wb-ui-setting-number ng-show=!wbModel.style.borderRadius.uniform title=Bottom-left icon=face value=wbModel.style.borderRadius.bottomLeft></wb-ui-setting-number>  <wb-ui-setting-number ng-show=!wbModel.style.borderRadius.uniform title=Bottom-Right icon=face value=wbModel.style.borderRadius.bottomRight></wb-ui-setting-number>  <md-divider></md-divider> <md-subheader>Style/Color/Thickness</md-subheader>  <wb-ui-setting-on-off-switch title=\"All Equal?\" title=\"All Eaual?\" icon=border_all value=wbModel.style.borderStyleColorWidth.uniform></wb-ui-setting-on-off-switch>  <wb-ui-setting-dropdown ng-show=wbModel.style.borderStyleColorWidth.uniform title=Border icon=style items=styles value=wbModel.style.borderStyle.all></wb-ui-setting-dropdown>  <wb-ui-setting-number ng-show=\"wbModel.style.borderStyleColorWidth.uniform && wbModel.style.borderStyle.all!='none'\" title=Thickness icon=thickness value=wbModel.style.borderWidth.all></wb-ui-setting-number>  <wb-ui-setting-color ng-show=\"wbModel.style.borderStyleColorWidth.uniform && wbModel.style.borderStyle.all!='none'\" title=Color icon=format_color_fill value=wbModel.style.borderColor.all></wb-ui-setting-color>   <wb-ui-setting-dropdown ng-show=!wbModel.style.borderStyleColorWidth.uniform title=Left-Border icon=border_left items=styles value=wbModel.style.borderStyle.left></wb-ui-setting-dropdown> <wb-ui-setting-number ng-show=\"(!wbModel.style.borderStyleColorWidth.uniform) && wbModel.style.borderStyle.left!='none'\" title=Thickness icon=thickness value=wbModel.style.borderWidth.left></wb-ui-setting-number> <wb-ui-setting-color ng-show=\"(!wbModel.style.borderStyleColorWidth.uniform) && wbModel.style.borderStyle.left!='none'\" title=Color icon=format_color_fill value=wbModel.style.borderColor.left></wb-ui-setting-color>  <md-divider class=wb-sub-divider ng-show=!wbModel.style.borderStyleColorWidth.uniform></md-divider> <wb-ui-setting-dropdown ng-show=!wbModel.style.borderStyleColorWidth.uniform title=Right-Border icon=border_right items=styles value=wbModel.style.borderStyle.right></wb-ui-setting-dropdown> <wb-ui-setting-number ng-show=\"(!wbModel.style.borderStyleColorWidth.uniform) && wbModel.style.borderStyle.right!='none'\" title=Thickness icon=thickness value=wbModel.style.borderWidth.right></wb-ui-setting-number> <wb-ui-setting-color ng-show=\"(!wbModel.style.borderStyleColorWidth.uniform) && wbModel.style.borderStyle.right!='none'\" title=Color icon=format_color_fill value=wbModel.style.borderColor.right></wb-ui-setting-color>  <md-divider class=wb-sub-divider ng-show=!wbModel.style.borderStyleColorWidth.uniform></md-divider> <wb-ui-setting-dropdown ng-show=!wbModel.style.borderStyleColorWidth.uniform title=Top-Border icon=border_top items=styles value=wbModel.style.borderStyle.top></wb-ui-setting-dropdown> <wb-ui-setting-number ng-show=\"(!wbModel.style.borderStyleColorWidth.uniform) && wbModel.style.borderStyle.top!='none'\" title=Thickness icon=thickness value=wbModel.style.borderWidth.top></wb-ui-setting-number> <wb-ui-setting-color ng-show=\"(!wbModel.style.borderStyleColorWidth.uniform) && wbModel.style.borderStyle.top!='none'\" title=Color icon=format_color_fill value=wbModel.style.borderColor.top></wb-ui-setting-color>  <md-divider class=wb-sub-divider ng-show=!wbModel.style.borderStyleColorWidth.uniform></md-divider> <wb-ui-setting-dropdown ng-show=!wbModel.style.borderStyleColorWidth.uniform title=Bottom-Border icon=border_bottom items=styles value=wbModel.style.borderStyle.bottom></wb-ui-setting-dropdown> <wb-ui-setting-number ng-show=\"(!wbModel.style.borderStyleColorWidth.uniform) && wbModel.style.borderStyle.bottom!='none'\" title=Thickness icon=thickness value=wbModel.style.borderWidth.bottom></wb-ui-setting-number> <wb-ui-setting-color ng-show=\"(!wbModel.style.borderStyleColorWidth.uniform) && wbModel.style.borderStyle.bottom!='none'\" title=Color icon=format_color_fill value=wbModel.style.borderColor.bottom></wb-ui-setting-color> </md-list>"
  );


  $templateCache.put('views/settings/wb-description.html',
    " <div layout=column style=width:100%> <md-input-container> <label translate>Lable</label> <input ng-model=wbModel.label> </md-input-container> <md-input-container> <label translate>Description</label> <input ng-model=wbModel.description> </md-input-container> </div>"
  );


  $templateCache.put('views/settings/wb-layout-page.html',
    " <md-list class=wb-setting-panel>  <wb-ui-setting-choose title=Direction icon=border_all items=flexDirection value=wbModel.style.flexDirection></wb-ui-setting-choose>  <wb-ui-setting-choose title=\"{{(wbModel.style.flexDirection=='wb-flex-row')?'Vert.':'Horz.'}}\" icon=\"{{(wbModel.style.flexDirection=='wb-flex-row')?'swap_vert':'swap_horiz'}}\" items=alignItems value=wbModel.style.alignItems></wb-ui-setting-choose>  <wb-ui-setting-choose title=\"{{(wbModel.style.flexDirection!='wb-flex-row')?'Vert.':'Horz.'}}\" icon=\"{{(wbModel.style.flexDirection!='wb-flex-row')?'swap_vert':'swap_horiz'}}\" items=justifyContent value=wbModel.style.justifyContent></wb-ui-setting-choose> </md-list>"
  );


  $templateCache.put('views/settings/wb-layout-self.html',
    " <md-list class=wb-setting-panel>  <wb-ui-setting-choose title=\"{{(wbModel.style.flexDirection!='wb-flex-row')?'Vert.':'Horz.'}}\" icon=\"{{(wbModel.style.flexDirection!='wb-flex-row')?'swap_vert':'swap_horiz'}}\" items=flexAlignItem value=wbModel.style.flexAlignItem></wb-ui-setting-choose>   <wb-ui-setting-on-off-switch title=\"Fill Space?\" icon=border_all value=wbModel.style.flexItemGrowEnabled></wb-ui-setting-on-off-switch>  <wb-ui-setting-number slider=\"\" ng-show=wbModel.style.flexItemGrowEnabled title=Weight icon=face value=wbModel.style.flexItemGrow></wb-ui-setting-number> </md-list>"
  );


  $templateCache.put('views/settings/wb-margin-padding.html',
    " <md-list class=wb-setting-panel>   <md-subheader class=md-no-sticky>Margin</md-subheader>  <wb-ui-setting-on-off-switch title=\"All Equal?\" icon=rounded_corner value=wbModel.style.margin.isUniform></wb-ui-setting-on-off-switch>  <wb-ui-setting-number ng-show=wbModel.style.margin.isUniform title=Radius icon=rounded_corner value=wbModel.style.margin.uniform></wb-ui-setting-number>  <wb-ui-setting-number ng-show=wbModel.style.margin.isUniform slider=\"\" icon=wb-blank value=wbModel.style.margin.uniform></wb-ui-setting-number>   <wb-ui-setting-number ng-show=!wbModel.style.margin.isUniform title=Radius icon=rounded_corner value=wbModel.style.margin.left></wb-ui-setting-number>  <wb-ui-setting-number ng-show=!wbModel.style.margin.isUniform title=Radius icon=rounded_corner value=wbModel.style.margin.right></wb-ui-setting-number>  <wb-ui-setting-number ng-show=!wbModel.style.margin.isUniform title=Radius icon=rounded_corner value=wbModel.style.margin.top></wb-ui-setting-number>  <wb-ui-setting-number ng-show=!wbModel.style.margin.isUniform title=Radius icon=rounded_corner value=wbModel.style.margin.bottom></wb-ui-setting-number>   <md-subheader class=md-no-sticky>Padding</md-subheader>  <wb-ui-setting-on-off-switch title=\"All Equal?\" icon=rounded_corner value=wbModel.style.padding.isUniform></wb-ui-setting-on-off-switch>  <wb-ui-setting-number ng-show=wbModel.style.padding.isUniform title=Radius icon=rounded_corner value=wbModel.style.padding.uniform></wb-ui-setting-number>  <wb-ui-setting-number ng-show=wbModel.style.padding.isUniform slider=\"\" icon=wb-blank value=wbModel.style.padding.uniform></wb-ui-setting-number>   <wb-ui-setting-number ng-show=!wbModel.style.padding.isUniform title=Left icon=rounded_corner value=wbModel.style.padding.left></wb-ui-setting-number>  <wb-ui-setting-number ng-show=!wbModel.style.padding.isUniform title=Right icon=rounded_corner value=wbModel.style.padding.right></wb-ui-setting-number>  <wb-ui-setting-number ng-show=!wbModel.style.padding.isUniform title=Top icon=rounded_corner value=wbModel.style.padding.top></wb-ui-setting-number>  <wb-ui-setting-number ng-show=!wbModel.style.padding.isUniform title=Down icon=rounded_corner value=wbModel.style.padding.down></wb-ui-setting-number> </md-list>"
  );


  $templateCache.put('views/settings/wb-min-max-size.html',
    " <md-list class=wb-setting-panel>  <md-subheader class=md-no-sticky>Min</md-subheader>  <wb-ui-setting-number title=\"Min Width\" icon=face value=wbModel.style.minWidth></wb-ui-setting-number>  <wb-ui-setting-number title=\"Max Height\" icon=face value=wbModel.style.minHeight></wb-ui-setting-number>  <md-subheader class=md-no-sticky>Max</md-subheader>  <wb-ui-setting-number title=\"Max Width\" icon=face value=wbModel.style.maxWidth></wb-ui-setting-number>  <wb-ui-setting-number title=\"Max Height\" icon=face value=wbModel.style.maxHeight></wb-ui-setting-number> </md-list>"
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
