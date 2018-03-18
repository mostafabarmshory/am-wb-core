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
    .module('am-wb-core', [
        'ngMessages',//
        'ngAnimate',//
        'ngAria',//
        'ngMaterial',//
        'pascalprecht.translate',//
        'mdColorPicker',//
        //'ngMaterialWysiwyg',
        'ui.tinymce', //
        'dndLists',//
        'material.components.expansionPanels',//
        'ngMdIcons', // Material icons
        'ngHandsontable',
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

/**
 * @ngdoc module
 * @name ngDonate
 * @description
 *
 */
angular.module('am-wb-core')
.config(['ngMdIconServiceProvider', function(ngMdIconServiceProvider) {
	ngMdIconServiceProvider
	// Add single icon
	.addShape('standby', '<path d="M13 3.5h-2v10h2v-10z"/><path d="M16.56 5.94l-1.45 1.45C16.84 8.44 18 10.33 18 12.5c0 3.31-2.69 6-6 6s-6-2.69-6-6c0-2.17 1.16-4.06 2.88-5.12L7.44 5.94C5.36 7.38 4 9.78 4 12.5c0 4.42 3.58 8 8 8s8-3.58 8-8c0-2.72-1.36-5.12-3.44-6.56z"/>')
	// Get an existing icon
	.addShape('custom-delete', ngMdIconServiceProvider.getShape('delete'))
	.addShape('vertical', ngMdIconServiceProvider.getShape('view_sequential'))
	// Add multiple icons
	.addShapes({
		'wb-opacity': '<path d="M3.55,18.54L4.96,19.95L6.76,18.16L5.34,16.74M11,22.45C11.32,22.45 13,22.45 13,22.45V19.5H11M12,5.5A6,6 0 0,0 6,11.5A6,6 0 0,0 12,17.5A6,6 0 0,0 18,11.5C18,8.18 15.31,5.5 12,5.5M20,12.5H23V10.5H20M17.24,18.16L19.04,19.95L20.45,18.54L18.66,16.74M20.45,4.46L19.04,3.05L17.24,4.84L18.66,6.26M13,0.55H11V3.5H13M4,10.5H1V12.5H4M6.76,4.84L4.96,3.05L3.55,4.46L5.34,6.26L6.76,4.84Z" />',
		'wb-vertical-boxes': '<path d="M4,21V3H8V21H4M10,21V3H14V21H10M16,21V3H20V21H16Z" />',
		'wb-horizontal-boxes': '<path d="M3,4H21V8H3V4M3,10H21V14H3V10M3,16H21V20H3V16Z" />',
		'wb-horizontal-arrows': '<path d="M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z" />',
		'wb-vertical-arrows': '<path d="M18.17,12L15,8.83L16.41,7.41L21,12L16.41,16.58L15,15.17L18.17,12M5.83,12L9,15.17L7.59,16.59L3,12L7.59,7.42L9,8.83L5.83,12Z" />',
		'wb-direction':'<path d="M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z" />',

		'wb-object-video': ngMdIconServiceProvider.getShape('video_library'),
		'wb-object-audio':  ngMdIconServiceProvider.getShape('audiotrack'),
		'wb-object-data': ngMdIconServiceProvider.getShape('storage'),
		
		'wb-widget-group': ngMdIconServiceProvider.getShape('pages'),
		'wb-widget-html': ngMdIconServiceProvider.getShape('settings_ethernet'),
	});
}]);

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

angular.module('am-wb-core')
/**
 * @ngdoc function
 * @name WbResourceCtrl
 * @description # WbResourceCtrl Controller of the am-wb-core
 */
.controller('WbResourceDataCtrl', function($scope) {
	$scope.$watch('value', function(value) {
		if (angular.isDefined(value)) {
			$scope.$parent.setValue(value);
		} else {
			$scope.$parent.setValue({
				'key' : 'value',
				'values' : [ [ 1, 2 ], [ 1, 2 ] ]
			});
		}
	}, true);
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

angular.module('am-wb-core')
/**
 * @ngdoc function
 * @name WbResourceCtrl
 * @description # WbResourceCtrl Controller of the am-wb-core
 */
.controller('WbResourceUrlCtrl', function($scope) {
	$scope.$watch('value', function(value) {
		$scope.$parent.setValue(value);
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

angular.module('am-wb-core')
/**
 * @ngdoc function
 * @name WbResourceCtrl
 * @description # WbResourceCtrl Controller of the am-wb-core
 */
.controller('WbResourceCtrl', function($scope, $rootScope,  $mdDialog, $document, 
		$wbUtil, $q, $controller, $compile, pages, style, data) {

	var CHILDREN_AUNCHOR = 'wb-select-resource-children';
	$scope.value = angular.copy(data);
	$scope.style = style;
	
	function hide() {
		$mdDialog.hide();
	}

	function cancel() {
		$mdDialog.cancel();
	}

	function answer() {
		$mdDialog.hide($scope.value);
	}
	
	/**
	 * Sets value to the real var
	 * 
	 */
	function setValue(value){
		$scope.value = value;
	}
	
//	$scope.$watch('value', function(value){
//		// Deal with value
//		console.log(value);
//	});
	


	/**
	 * encapsulate template srce with panel widget template.
	 * 
	 * @param page
	 *            setting page config
	 * @param tempateSrc
	 *            setting page html template
	 * @returns encapsulate html template
	 */
	function _encapsulatePanel(page, template) {
		// TODO: maso, 2017: pass all paramter to the setting
		// panel.
		return template;
	}

	/**
	 * تنظیمات را به عنوان تنظیم‌های جاری سیستم لود می‌کند.
	 * 
	 * @returns
	 */
	function loadPage(index) {
		var widget = null;
		var jobs = [];
		var pages2 = [];


		// 1- Find element
		var target = $document.find('#' + CHILDREN_AUNCHOR);

		// 2- Clear childrens
		target.empty();

		// 3- load pages
		var page = pages[index];
		var template = $wbUtil.getTemplateFor(page);
		if (angular.isDefined(template)) {
			jobs.push(template.then(function(templateSrc) {
				templateSrc = _encapsulatePanel(page, templateSrc);
				var element = angular.element(templateSrc);
				var scope = $rootScope.$new(false, $scope);
				scope.page = page;
				scope.value = $scope.value;
				if (angular .isDefined(page.controller)) {
					$controller(page.controller, {
						$scope : scope,
						$element : element,
					});
				}
				$compile(element)(scope);
				pages2.push(element);
			}));
		}

		$q.all(jobs).then(function() {
			angular.forEach(pages2, function(element) {
				target.append(element);
			});
		});
	}
	
	
//	$scope.$watch(function(){
//		return angular.element(document.body).hasClass('md-dialog-is-showing');
//	}, function(value){
//		if(value){
//			loadPages();
//		}
//	});
	$scope.$watch('pageIndex', function(value){
		if(value >= 0){
			loadPage(value);
		}
	});
	
	
	$scope.pages = pages;
	
	$scope.hide = hide;
	$scope.cancel = cancel;
	$scope.answer = answer;
	$scope.setValue = setValue;
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

angular.module('am-wb-core')
/**
 * @ngdoc controller
 * @name WbTemplatesSheetCtrl
 * @description # WbTemplatesSheetCtrl manages templates in sheet
 * 
 */
.controller('WbTemplatesSheetCtrl', function($scope, $mdBottomSheet, $wbUi) {

	function loadTemplate(themplate) {
		$mdBottomSheet.hide(themplate);
	}
	
	function hideTemplates($event){
		$mdBottomSheet.hide();
	}

	// load templates
	$wbUi.templates()
	.then(function(page){
		$scope.templates = page.items;
	});
	
	$scope.hideTemplates = hideTemplates;
	$scope.loadTemplate = loadTemplate;

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

angular.module('am-wb-core')
/**
 * @ngdoc function
 * @name WbBorderSettingCtrl
 * @description # WbBorderSettingCtrl Controller of the am-wb-core
 */
.controller(
	'WbBorderSettingCtrl',
	function($scope) {
	    var scope = $scope;
	    if (!$scope.wbModel.style) {
		$scope.wbModel.style = {

		};
	    }
	    if (!$scope.wbModel.style.borderColor) {
		$scope.wbModel.style.borderColor = {
		    bottom : 'none'
		};
	    }
	    if ($scope.wbModel.style.borderColor.bottom == null
		    || $scope.wbModel.style.borderColor.bottom == undefined) {
		$scope.wbModel.style.borderColor.bottom = 'none';
	    }

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

angular.module('am-wb-core')

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

angular.module('am-wb-core')

/**
 * @ngdoc controller
 * @name WbLayoutWbSettingsCtrl
 * @memberof am-wb-core
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
.module('am-wb-core')

.controller('WbPageLayoutWbSettingsCtrl', function($scope, $settings) {
    var wbModel = $scope.wbModel;
    if (!wbModel.style) {
	wbModel.style = {};
    }
    $scope.flexDirection = [ {
	title : 'row',
	icon : 'wb-vertical-boxes',
	value : 'wb-flex-row'
    }, {
	title : 'column',
	icon : 'wb-horizontal-boxes',
	value : 'wb-flex-column'
    } ];

    $scope.justifyContent = [ {
	title : 'Start',
	icon : 'looks_one',
	value : 'wb-flex-justify-content-start'
    }, {
	title : 'End',
	icon : 'looks_two',
	value : 'wb-flex-justify-content-end'
    }, {
	title : 'Center',
	icon : 'looks_3',
	value : 'wb-flex-justify-content-center'
    }, {
	title : 'Space Around',
	icon : 'looks_4',
	value : 'wb-flex-justify-content-space-around'
    }, {
	title : 'Space Between',
	icon : 'looks_5',
	value : 'wb-flex-justify-content-space-between'
    } ];

    $scope.alignItems = [ {
	title : 'Stretch',
	icon : 'looks_one',
	value : 'wb-flex-align-items-stretch'
    }, {
	title : 'Start',
	icon : 'looks_two',
	value : 'wb-flex-align-items-start'
    }, {
	title : 'End',
	icon : 'looks_3',
	value : 'wb-flex-align-items-end'
    }, {
	title : 'Center',
	icon : 'looks_4',
	value : 'wb-flex-align-items-center'
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
angular

/**
 * Created by mgh on 8/10/2016.
 */
.module('am-wb-core')

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
angular.module('am-wb-core')

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

angular.module('am-wb-core')

/**
 * @ngdoc controller
 * @name WbWidgetSelectCtrl
 * @memberof am-wb-core
 * @description مدیریتی برای انتخاب ویجت‌های جدید
 * 
 * در این کنترل امکاناتی فراهم شده که کاربر بتواند از میان ویجت‌های موجودی یکی
 * را انتخاب کند.
 */
.controller('WbWidgetSelectCtrl',
		function($scope, $widget) {
	var scope = $scope;

	/**
	 * ویجت‌های موجود را لود می‌کند
	 * 
	 * تمام ویجت‌های لود شده در متغیری به نام widgets توی اسکپ بار
	 * می‌شود.
	 * 
	 */
	function loadWidgets() {
		$widget.widgets().then(function(widgets) {
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
		$scope.answer($widget.widgetData(widget));
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

angular.module('am-wb-core')
/**
 * @ngdoc directive
 * @memberof am-wb-core
 * @description Apply background into the element
 */
.directive("wbBackground", function() {
	/**
	 * Sets background attributes into element
	 * 
	 * @param element
	 * @param style
	 * @returns
	 */
	function setBackgroud(element, style){
		if (!style) {
			return;
		}
		var cssValue = {};
		if(style.background){
			cssValue['background'] = style.background;
		}
		if(style.backgroundImage){
			cssValue['background-image'] = 'url(\''+style.backgroundImage+'\')';
		}

		if(style.backgroundColor){
			cssValue['background-color'] = style.backgroundColor;
		}
		if(style.backgroundSize) {
			cssValue['background-size'] = style.backgroundSize;
		}
		if(style.backgroundRepeat) {
			cssValue['background-repeat'] = style.backgroundRepeat;
		}
		if(style.backgroundPosition){
			cssValue['background-position'] = style.backgroundPosition;
		}
		if(style.backgroundAttachment){
			cssValue['background-attachment'] = style.backgroundAttachment;
		}
		if(style.backgroundOrigin){
			cssValue['background-origin'] = style.backgroundOrigin;
		}
		if(style.backgroundClip){
			cssValue['background-clip'] = style.backgroundClip;
		}
		
		// FIXME: maso, 1395: thies are not background parameter
		if(style.color){
			cssValue['color'] = style.color;
		}
		if(style.opacity){
			cssValue['opacity'] = (style.isTransparent) ? style.opacity/100 : 1;
		}
		element.css(cssValue);
	}

	function postLink(scope, element, attributes) {
		return scope.$watch(attributes.wbSize, function(style){
			return setBackgroud(element, style);
		}, true);
	}

	return {
		restrict : 'A',
		link : postLink
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

angular.module('am-wb-core')
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

angular.module('am-wb-core')
/**
 * Apply layout into an element
 * 
 * Group and page are the main goles of this directive. By adding the wbLayout,
 * widget are able to manages it layout automatically.
 * 
 * Note that, in smal screen devices, the colume layout apply as default.
 * 
 * @ngdoc directive
 * @memberof am-wb-core
 * @description Apply layout into an element
 */
.directive("wbLayout", function() {
	/*
	 * FIXME: maso, 2017: replace class with term
	 * 
	 * It is hard to port final design, while it is fulle tied into the
	 * CSS classes. We must replace layout CSS classes with general terms
	 * as soon as posible.
	 */
	/**
	 * Remove layout config from element
	 * 
	 * @param element
	 * @param config
	 * @returns
	 */
	function removeLayout(element, config) {
		// Remove old class
		element.removeClass(config.flexDirection);
		element.removeClass(config.justifyContent);
		element.removeClass(config.alignItems);
	}

	/**
	 * Adds layout config into the element
	 * 
	 * @param element
	 * @param config
	 * @returns
	 */
	function addLayout(element, config) {
		// Add new class
		element.addClass(config.flexDirection);
		element.addClass(config.justifyContent);
		element.addClass(config.alignItems);
	}

	/**
	 * Link view with attributes
	 * 
	 * 
	 * @param scope
	 * @param element
	 * @param attrs
	 * @returns
	 */
	function postLink(scope, element, attrs) {
		return scope.$watch(attrs.wbLayout, function(newValue, oldValue) {
			if (oldValue) {
				removeLayout(element, oldValue);
			}
			if (newValue) {
				addLayout(element, newValue);
			}
		}, true);
	}

	/*
	 * Directive
	 */
	return {
		restrict : 'A',
		link : postLink
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

angular.module('am-wb-core')
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

angular.module('am-wb-core')
/**
 * @description Apply padding into the element
 */
.directive("wbPadding", function() {
	return {
		restrict : 'A',
		link : function(scope, element, attributes) {
			return scope.$watch(attributes.wbPadding, function(style) {
				if(!style || !style.padding){
					return;
				}
				if(style.padding.isUniform){
					element.css({
						'padding': style.padding.uniform
					});
				} else {
					element.css({
						'padding-left':style.padding.left,
						'padding-right':style.padding.right,
						'padding-top':style.padding.top,
						'padding-bottom':style.padding.bottom
					});
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

angular.module('am-wb-core')
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

angular.module('am-wb-core')
/**
 * 
 */
.directive('wbPanel', function($compile, $widget, $controller, $settings, $q) {
	function postLink(scope, element, attrs, ctrls, transclud) {

		/**
		 * Remove panel from parent
		 */
		function remove() {
			return scope.$parent.removeChild(scope.wbModel);
		}

		/**
		 * Empty view
		 * 
		 * Remove all widgets from the view.
		 */
		function cleanView() {
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
				scope.objectId(item);
				compilesJob.push($widget.compile(item, scope)//
						.then(function(element) {
							element.attr('id', scope.objectId(item));
							elements[index] = element;
						}));
			});
			return $q.all(compilesJob)//
			.then(function() {
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

		/**
		 * Insert new model befor selecte model
		 */
		function insertBefore(model, newModel){
			var index = scope.wbModel.contents.indexOf(model);
			if (index > -1) {
				$widget.compile(newModel, scope)//
				.then(function(newElement) {
					var a = element//
					.children(bodyElementSelector)//
					.children(placeholderElementSelector)//
					.children('#'+scope.objectId(model));
					newElement.insertBefore(a);
					scope.wbModel.contents.splice(index, 0, newModel);
				})
			}
		}

		function settings() {
			return $settings.load({
				wbModel : scope.wbModel,
				wbParent : scope.$parent
			}, scope.$parent.settingAnchor());
		}

		/**
		 * Clone current widget
		 */
		function clone() {
			var newObject = angular.copy(scope.wbModel);
			return scope.$parent.insertBefore(scope.wbModel, newObject);
		}

		// Set element ID after compile
		element.attr('id', scope.objectId(scope.wbModel));
		scope.wbModel.name = scope.wbModel.name || 'Panel';

		scope.removeChild = removeChild;
		scope.remove = remove;
		scope.insertBefore = insertBefore;

		scope.settings = settings;
		scope.dropCallback = dropCallback;
		scope.clone = clone;

		if (!angular.isArray(scope.wbModel.contents)) {
			scope.wbModel.contents = [];
			return;
		}
		reloadView();
	}

	return {
		templateUrl : 'views/directives/wb-group.html',
		restrict : 'E',
		replace : true,
		transclude : true,
		link : postLink
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

angular.module('am-wb-core')

/**
 */
.directive('wbIcon', function($interpolate) {
    return {
	restrict : 'E',
	template : '<ng-md-icon style="height: auto;width: auto;" icon="{{iconValue}}"></ng-md-icon>',
	replace : true,
	transclude : true,
	link : postLink
    };

    function postLink(scope, element, attr, ctrl, transclude) {
	// Looking for icon
	var attrName = attr.$normalize(attr.$attr.wbIconName || '');
	var contentValue = null;

	transclude(scope, function(clone) {
	    var text = clone.text();
	    if (text && text.trim()) {
		contentValue = $interpolate(text.trim())(scope);
		scope.iconValue = contentValue;
	    }
	});

	if (attrName) {
	    attr.$observe('wbIconName', iconChange);
	}


	/*
	 * change icon
	 */
	function iconChange() {
	    scope.iconValue = scope.contentValue || attr.wbIconName || '';
	}
    }

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

angular.module('am-wb-core')

/**
 * @ngdoc directive
 * @name wbInfinateScroll
 * @description
 *  # wbInfinateScroll
 */
.directive('wbInfinateScroll', function($q, $timeout) {

	function postLink(scope, elem, attrs) {
		var raw = elem[0];

		/**
		 * 
		 */
		function loadNextPage() {
		  var value = scope.loadPage();
			return $q.when(value)//
			.then(checkScroll);
		}

		function checkScroll(value) {
		  if(value){
  			return $timeout(function(){
  				if(raw.scrollHeight <= raw.offsetHeight){
  					return loadNextPage();
  				}
  			}, 100);
		  }
		}

		function scrollChange(evt) {
			if (!(raw.scrollTop + raw.offsetHeight + 5 >= raw.scrollHeight)) {
				return;
			}
			loadNextPage();
		}

		elem.on('scroll', scrollChange);
		loadNextPage();
	}

	return {
		restrict : 'A',
		scope : {
			loadPage : '=wbInfinateScroll'
		},
		link : postLink
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

angular.module('am-wb-core')
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
.directive('wbContent', function($compile, $widget, $controller, $settings, $q, $mdBottomSheet, $wbUi) {
	var dragClass = 'wb-content-dragenter';
	var bodyElementSelector = 'div#wb-content-body';
	var placeholderElementSelector = 'div#wb-content-placeholder';
	function postLink(scope, element, attrs) {
		// Note that object must be an object or array,
		// NOT a primitive value like string, number, etc.
		// Note: id must be incremental
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
							elem.attr('id', objectId(item));
							elements[index] = elem;
						}));
			});
			return $q.all(compilesJob)//
			.then(function() {
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
				var anchor = getAnchor();
				var a = anchor.children('#'+objectId(model));
				if(a.length > 0){
					a.remove();
					scope.wbModel.contents.splice(index, 1);
				} else {
					console.log('node not found');
				}
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
			}, scope.settingAnchor());
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

		/**
		 * Insert new model befor selecte model
		 */
		function insertBefore(model, newModel){
			var index = scope.wbModel.contents.indexOf(model);
			if (index > -1) {
				$widget.compile(newModel, scope)//
				.then(function(newElement) {
					var a = element//
					.children(bodyElementSelector)//
					.children(placeholderElementSelector)//
					.children('#'+scope.objectId(model));
					newElement.insertBefore(a);
					scope.wbModel.contents.splice(index, 0, newModel);
				})
			}
		}

		function settingAnchor(){
			return attrs['wbSettingAnchor'];
		}

		/*
		 * Watch the model for modification.
		 */
		scope.$watch('wbModel', function() {
			scope.wbModelLoadeding = true;
			if (!scope.wbModel) {
				// XXX: maso, 1395: هنوز مدل تعیین نشده
				return;
			}
			if (!angular.isArray(scope.wbModel.contents)) {
				scope.wbModel.contents = [];
			}
			scope.wbModel.type = 'Page';
			reloadView().then(function(){
				scope.wbModelLoadeding = false;
			});
		});
		
		// Watch editable
		scope.$watch('wbEditable', function(editable){
			if(scope.wbEditable && (!scope.wbModel || !scope.wbModel.contents.length)){
				loadTemplate();
			}
		});
		
		/**
		 * Load a template
		 */
		function loadTemplate(){
			scope.alert = '';
		    return $mdBottomSheet.show({
		      templateUrl: 'views/sheets/wb-themplates.html',
		      controller: 'WbTemplatesSheetCtrl',
		      clickOutsideToClose: false
		    }).then(function(template) {
		    	return $wbUi.loadTemplate(template);
		    })
		    .then(function(newModel){
		    	scope.wbModel = newModel;
		    })
//		    .catch(function(error) {
//		      // User clicked outside or hit escape
//		    });

		}
		scope.loadTemplate = loadTemplate;

		scope.settingAnchor = settingAnchor;
		scope.removeChild = removeChild;
		scope.insertBefore = insertBefore;
		scope.settings = settings;
		scope.dropCallback = dropCallback;
		scope.newWidget = newWidget;
		scope.objectId = objectId;
	}

	return {
		templateUrl : 'views/directives/wb-page.html',
		transclude : true,
		restrict : 'E',
		replace : true,
		scope : {
			wbModel : '=?',
			wbEditable : '=?',
			wbModelLoaded : '='
		},
		link : postLink
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

angular.module('am-wb-core')

/**
 * @ngdoc directive
 * @name wbWidget
 * @memberof am-wb-core
 * @description Widgets container
 * 
 * This is widget containers.
 * 
 * All primary actions of a widget are supported (such as remove and setting).
 */
.directive('wbSettingPanelGroup', function($settings, $widget) {
	
	/**
	 * Init settings
	 */
	function postLink(scope, element, attrs, ctrl, transclude) {
		/**
		 * change current page of setting group
		 */
		function goto(page){
			scope.page = page;
		}
		
		$widget.widgets()//
		.then(function(ws){
			scope.widgets = ws.items;
		});
		
		// init scope
		scope.goto = goto;
		

		scope.page = 'setting';
	}
	
	return {
		restrict : 'E',
		templateUrl: 'views/directives/wb-setting-panel-group.html',
		link : postLink
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

angular.module('am-wb-core')

/**
 * @ngdoc directive
 * @name wbWidget
 * @memberof am-wb-core
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

angular.module('am-wb-core')

    /**
     * @ngdoc directive
     * @name wbWidget
     * @memberof am-wb-core
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

angular.module('am-wb-core')

/**
 * @ngdoc directive
 * @name wbUiSettingAudio
 * @memberof am-wb-core
 * @author maso<mostafa.barmshory@dpq.co.ir>
 * @author hadi<mohammad.hadi.mansouri@dpq.co.ir>
 * @description a setting section to select audio file.
 *
 */
.directive('wbUiSettingAudio', function () {
	return {
		templateUrl: 'views/directives/wb-ui-setting-audio.html',
		restrict: 'E',
		scope: {
			title: '@title',
			value: '=value',
			icon: '@icon'
		},
		controller: function($scope, $resource){
			function selectAudio(){
				return $resource.get('audio', {
					style: {
						title: 'Select Audio',
					},
					data: $scope.value
				})//
				.then(function(value){
					$scope.value = value;
				});
			}
			
			$scope.edit = selectAudio;
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

angular.module('am-wb-core')

/**
 * @ngdoc directive
 * @name wbUiSettingChoose
 * @memberof am-wb-core
 * @description a setting section for choosing values.
 *
 */
.directive('wbUiSettingChoose', function ($mdTheming, $mdUtil) {

    // **********************************************************
    // Private Methods
    // **********************************************************
    function postLink(scope, element, attr, ctrls) {
	scope.xitems = scope.$eval(attr.items);
	attr.$observe('title', function(title){
	    scope.title = title;
	});
	attr.$observe('icon', function(icon){
	    scope.icon = icon;
	});
	var ngModelCtrl = ctrls[0] || $mdUtil.fakeNgModel();
	var unregisterWatch = null;
	$mdTheming(element);

	ngModelCtrl.$render = render;

	scope.$watch('selectedIndex', function () {
	    if(angular.isDefined(scope.selectedIndex)){
		ngModelCtrl.$setViewValue(scope.xitems[scope.selectedIndex].value);
	    }
	});

	function render() {
	    scope.selectedIndex = toIndex(ngModelCtrl.$modelValue);
	    ngModelCtrl.$setViewValue(scope.xitems[scope.selectedIndex].value);
	}
	
	function toIndex (value){
	    for (var index = 0; index < scope.xitems.length; index++) {
		if (scope.xitems[index].value == value){
		    return index;
		}
	    }
	    // TODO: maso, 2017: update default value.
	    return 0;
	}
    }

    /*
     * Directive info
     */
    return {
	templateUrl: 'views/directives/wb-ui-setting-choose.html',
	restrict: 'E',
	scope: true,
	require: ['?ngModel'],
	priority: 210, // Run before ngAria
	link: postLink
    };
});

/**
 * Created by mgh on 2/26/17.
 */
angular.module('am-wb-core')

    /**
     * @ngdoc directive
     * @name wbUiSettingColor
     * @memberof am-wb-core
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

angular.module('am-wb-core')

/**
 * @ngdoc directive
 * @name wbUiSettingData
 * @memberof am-wb-core
 * @author maso<mostafa.barmshory@dpq.co.ir>
 * @author hadi<mohammad.hadi.mansouri@dpq.co.ir>
 * @description a setting section to manage data.
 *
 */
.directive('wbUiSettingData', function() {
	return {
		templateUrl : 'views/directives/wb-ui-setting-data.html',
		restrict : 'E',
		scope : {
			title : '@title',
			value : '=value',
			icon : '@icon'
		},
		controller : function($scope, $resource) {
			function editData(data) {
				return $resource.get('data', {
					style : {
						title : 'Edit data source'
					},
					data : $scope.value
				}) //
				.then(function(data) {
					if(!angular.isDefined($scope.value)){
						$scope.value = {};
					}
					// Just copy data values
					$scope.value.key = data.key;
					$scope.value.values = data.values;
				});
			}
			$scope.edit = editData;
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

angular.module('am-wb-core')

    /**
     * @ngdoc directive
     * @name wbUiSettingDropdown
     * @memberof am-wb-core
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

angular.module('am-wb-core')

/**
 * @ngdoc directive
 * @name wbUiSettingColor
 * @memberof am-wb-core
 * @author maso<mostafa.barmshory@dpq.co.ir>
 * @description a setting section to set color.
 *
 */
.directive('wbUiSettingImage', function () {
	return {
		templateUrl: 'views/directives/wb-ui-setting-image.html',
		restrict: 'E',
		scope: {
			title: '@title',
			value: '=value',
			icon: '@icon'
		},
		controller: function($scope, $resource){
			function selectImage(){
				return $resource.get('image', {
					style: {
						title: 'Select image'
					},
					data: $scope.value
				})//
				.then(function(value){
					$scope.value = value;
				});
			}
			
			$scope.selectImage = selectImage;
		}
	};
});

/**
 * Created by mgh on 2/26/17.
 */
angular.module('am-wb-core')

    /**
     * @ngdoc directive
     * @name wbUiSettingNumber
     * @memberof am-wb-core
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
angular.module('am-wb-core')

    /**
     * @ngdoc directive
     * @name wbUiSettingOnOffSwitch
     * @memberof am-wb-core
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

angular.module('am-wb-core')

/**
 * @ngdoc directive
 * @name wbUiSettingVideo
 * @memberof am-wb-core
 * @author maso<mostafa.barmshory@dpq.co.ir>
 * @author hadi<mohammad.hadi.mansouri@dpq.co.ir>
 * @description a setting section to select audio file.
 *
 */
.directive('wbUiSettingVideo', function () {
	return {
		templateUrl: 'views/directives/wb-ui-setting-video.html',
		restrict: 'E',
		scope: {
			title: '@title',
			value: '=value',
			icon: '@icon'
		},
		controller: function($scope, $resource){
			function selectVideo(){
				return $resource.get('video', {
					style: {
						title: 'Select audio'
					},
					data: $scope.value
				})//
				.then(function(value){
					$scope.value = value;
				});
			}

			$scope.edit = selectVideo;
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

angular.module('am-wb-core')

/**
 * @ngdoc directive
 * @name wbWidget
 * @memberof am-wb-core
 * @description Widgets container
 * 
 * This is widget containers.
 * 
 * All primary actions of a widget are supported (such as remove and setting).
 */
.directive('wbWidget', function() {
	function postLink(scope, element, attrs, ctrl, transclude) {
		// Modify angular transclude function
		// see:
		// http://angular-tips.com/blog/2014/03/transclusion-and-scopes/
		// FIXME: maso, 2017: use regular dom insted of ng-transclude
		transclude(scope, function(clone, scope) {
			var node = element //
			.find('wb-transclude') //
			.append(clone);
		});
	}

	return {
		templateUrl : 'views/directives/wb-widget.html',
		restrict : 'E',
		transclude : true,
		replace : true,
		link : postLink,
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
				}, $scope.$parent.settingAnchor());
			}

			/**
			 * Notify this widget is selected
			 */
			function selected() {
				if (!$scope.wbEditable) {
					return;
				}
				return settings();
			}

			/**
			 * Check if the widget is selected one
			 */
			function isSelected() {
				return $scope.wbEditable && $settings.isCurrentModel($scope.wbModel);
			}
			
			/**
			 * Clone current widget
			 */
			function clone() {
				var newObject = angular.copy($scope.wbModel);
				return $scope.$parent.insertBefore($scope.wbModel, newObject);
			}

			/*
			 * Add to scope
			 */
			$scope.remove = remove;
			$scope.movedCallback = remove;
			$scope.settings = settings;
			$scope.selected = selected;
			// Sets widget id after compile
			element.attr('id', $scope.objectId($scope.wbModel));
			$scope.wbModel.name = $scope.wbModel.name || 'Widget';
			$scope.isSelected = isSelected;
			$scope.clone = clone;
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

angular.module('am-wb-core')

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

angular.module('am-wb-core')

/**
 * Load default resources
 */
.run(function($resource) {
	$resource.newPage({
		type : 'wb-url',
		label : 'URL',
		templateUrl : 'views/resources/wb-url.html',
		controller : 'WbResourceUrlCtrl',
		tags : [ 'image', 'audio', 'video', 'file' ]
	});
	$resource.newPage({
		type : 'wb-sheet',
		label : 'Sheet',
		templateUrl : 'views/resources/wb-sheet.html',
		controller : 'WbResourceDataCtrl',
		tags : [ 'data' ]
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

angular.module('am-wb-core')

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

/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */


angular.module('am-wb-core')

/**
 * Load default resources
 */
.run(function($resource) {

	function imageTool(editor) {

		function insertImage(url){
	          editor.insertContent('<img src="' + url + '" >');
		}
		
		function showDialog(){
			$resource.get('image')//
			.then(function(value){
				insertImage(value);
			});
		}
		
		editor.addButton('image', {
			icon: 'image',
			tooltip: 'Insert/edit image',
			onclick: showDialog,
			stateSelector: 'img:not([data-mce-object],[data-mce-placeholder]),figure.image'
		});

		editor.addMenuItem('image', {
			icon: 'image',
			text: 'Image',
			onclick: showDialog,
			context: 'insert',
			prependToContext: true
		});

		editor.addCommand('mceImage', showDialog);
	}

	tinymce.PluginManager.add('image', imageTool);

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

angular.module('am-wb-core')

/**
 * Load widgets
 */
.run(function($widget) {
	// Page
	$widget.newWidget({
		type: 'Group',
		template : '<wb-panel></wb-panel>',
		label : 'Panel',
		name : 'Panel',
		description : 'Panel contains list of widgets.',
		icon : 'wb-widget-group',
		help : 'http://dpq.co.ir/more-information-link',
	});
	// HTML text
	$widget.newWidget({
		type: 'HtmlText',
		templateUrl : 'views/widgets/wb-html.html',
		label : 'HTML text',
		name : 'HTML text',
		description : 'An HTML block text.',
		icon : 'wb-widget-html',
		help : 'http://dpq.co.ir',
		setting:['text'],
		data : {
			text : '<h2>HTML Text</h2><p>Insert HTML text heare</p>',
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

angular.module('am-wb-core')

/**
 * @ngdoc service
 * @name $widget
 * @memberof am-wb-core
 * @description Resource managment
 * 
 */
.service('$resource', function($wbUi) {

	var resourcePages = {};


	/**
	 * Fetchs a page.
	 * 
	 * @param model
	 * @returns
	 */
	function page(type) {
		var widget = notFound;
		if (type in resourcePages) {
			widget = resourcePages[type];
		}
		return widget;
	}

	/**
	 * Adds new page.
	 * 
	 * @returns
	 */
	function newPage(page) {
		resourcePages[page.type] = page;
	}

	/**
	 * Finds and lists all pages.
	 * 
	 * @returns
	 */
	function pages() {
		// TODO: maso, 1395:
	}

	/**
	 * Get a resource 
	 * 
	 * @param tags
	 * @returns
	 */
	function get(tag, option){
		if(!option){
			option = {};
		}
		var pages = [];
		if(tag){
			angular.forEach(resourcePages, function(page) {
				if(angular.isArray(page.tags) && page.tags.includes(tag)){
					this.push(page);
				}
			}, pages);
		} else {
			pages = resourcePages;
		}

		return $wbUi.openDialog({
			controller : 'WbResourceCtrl',
			templateUrl : 'views/dialogs/wb-select-resource.html',
			parent : angular.element(document.body),
			clickOutsideToClose : true,
			fullscreen : true,
			locals : {
				'pages' : pages,
				'style' : option.style || {
					title: tag
				},
				'data' : option.data
			}
		});
	}


	this.get = get;
	this.newPage = newPage;
	this.page = page;
	this.pages = pages;
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

angular.module('am-wb-core')

/**
 * @ngdoc service
 * @name $widget
 * @memberof am-wb-core
 * @description مدیریت ویجت‌های سیستم
 * 
 * این سرویس تمام ویجت‌های قابل استفاده در سیستم را تعیین می‌کند.
 */
.service('$settings',function($rootScope, $controller, $widget, $q, $sce, $compile,
		$document, $templateRequest, $wbUtil) {
	var WB_SETTING_PANEL_ID = 'WB-SETTING-PANEL';

	/*
	 * Default settings
	 */
	var WB_SETTINGS_PAGE_DEFAULT = ['description', 'border',
		'background', 'pageLayout', 'marginPadding'];
	var WB_SETTINGS_GROUP_DEFAULT = [ 'description', 'border',
		'background', 'pageLayout', 'selfLayout',
		'marginPadding', 'minMaxSize' ];
	var WB_SETTINGS_WIDGET_DEFAULT = [ 'selfLayout', 'border',
		'background', 'marginPadding', 'minMaxSize' ];
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

	/**
	 * Defines default settings for widget
	 * 
	 * @param widget
	 * @returns
	 */
	function getDefaultSettingsFor(widget) {
		if (widget.type === 'Page') {
			return WB_SETTINGS_PAGE_DEFAULT;
		}
		if (widget.type === 'Group') {
			return WB_SETTINGS_GROUP_DEFAULT;
		}
		return WB_SETTINGS_WIDGET_DEFAULT;
	}

	/**
	 * encapsulate template srce with panel widget template.
	 * 
	 * @param page
	 *            setting page config
	 * @param tempateSrc
	 *            setting page html template
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
	 * Check if this is the current model
	 */
	function isLoaded(wbModel) {
    	return oldScope && oldScope.wbModel == wbModel;
    }
	
	/**
	 * تنظیمات را به عنوان تنظیم‌های جاری سیستم لود می‌کند.
	 * 
	 * @returns
	 */
	function loadSetting(models, panelId) {
		var widget = null;
		var jobs = [];
		var pages = [];

		// 0- destroy old resource
		if(isLoaded(models.wbModel)){
			return;
		}
		if (angular.isDefined(oldScope)) {
			oldScope.$destroy();
		}
		var scope = $rootScope.$new(true, $rootScope);
		scope.wbModel = models.wbModel;
		scope.wbParent = models.wbParent;
		oldScope = scope;

		// 1- Find element

		var target;
		if(panelId){
			target = $document.find('#'+panelId).find('#' + WB_SETTING_PANEL_ID);
		} else {
			target = $document.find('#' + WB_SETTING_PANEL_ID);
		}

		// 2- Clear childrens
		target.empty();

		// 3- load pages
		$widget.widget(models.wbModel)//
		.then(function(w) {
			widget = w;
			var widgetSettings = getDefaultSettingsFor(w);
			if (angular.isArray(widget.setting)) {
				widgetSettings = widgetSettings
				.concat(widget.setting);
			}
			angular.forEach(widgetSettings, function(type) {
				var page = notFound;
				if (type in settingPages) {
					page = settingPages[type];
				}
				var template = $wbUtil.getTemplateFor(page);
				if (angular.isDefined(template)) {
					var job = template.then(function(templateSrc) {
						templateSrc = _encapsulateSettingPanel(page, templateSrc);
						var element = angular.element(templateSrc);
						if (angular .isDefined(page.controller)) {
							$controller(page.controller, {
								$scope : scope,
								$element : element,
							});
						}
						$compile(element)(scope);
						element.attr('label',page.lable);
						pages.push(element);
					});
					jobs.push(job);
				}
			});

		})
		//
		.then(function() {
			$q.all(jobs)//
			.then(function() {
				pages.sort(function(a, b) {
					if (a.attr('label') < b.attr('label'))
						return -1;
					if (a.attr('label') > b.attr('label'))
						return 1;
					return 0;
				});
				angular.forEach(pages, function(element) {
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
	this.isCurrentModel = isLoaded;
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

angular.module('am-wb-core')

/**
 * @ngdoc service
 * @name $widget
 * @memberof am-wb-core
 * @description Resource managment
 * 
 */
.service('$wbUi', function($mdDialog, $q, $http) {

	var _templates = [];

	/**
	 * Opens dialog
	 * @returns
	 */
	function openDialog(dialogData){
		return $mdDialog.show(dialogData);
	}

	/**
	 * Get list of registered templates
	 * 
	 * @memberof $wbUi
	 */
	function templates(){
		return $q.when({
			items: _templates
		});
	}
	
	/**
	 * Adds new template
	 * 
	 * @memberof $wbUi
	 */
	function newTemplate(template){
		_templates.push(template);
		return this;
	}
	
	/**
	 * Load a template
	 * 
	 * @memberof $wbUi
	 */
	function loadTemplate(template){
		// TODO: maso, 2018: check if template is a function
		if(angular.isDefined(template.template)){
			return $q.when(JSON.parse(template.template));
		}
		return $http.get(template.templateUrl)
		.then(function(res){
			return res.data;
		});
	}

	this.openDialog = openDialog;
	this.templates = templates;
	this.newTemplate = newTemplate;
	this.loadTemplate = loadTemplate;
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
.module('am-wb-core')

/**
 * @ngdoc service
 * @name $wbUtil
 * @memberof am-wb-core
 * @description کدهای پایه
 * 
 */
.service('$wbUtil',function($rootScope, $controller, $widget, $q, $sce, $compile,
		$document, $templateRequest) {
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

	this.getTemplateFor = getTemplateFor;
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

angular.module('am-wb-core')

/**
 * @ngdoc service
 * @name $widget
 * @memberof am-wb-core
 * @description مدیریت ویجت‌های سیستم
 * 
 * این سرویس تمام ویجت‌های قابل استفاده در سیستم را تعیین می‌کند.
 */
.service('$widget', function(
		$q, $sce, $templateRequest, $compile, $controller, $rootScope,
		$timeout, $mdDialog) {

	var contentElementAsso = [];
	var elementKey = [];
	var notFoundWidget = {
			templateUrl : 'views/widgets/wb-notfound.html',
			label : 'Not found',
			description : 'Element not found',
	};
	var container = {
			type : 'Page',
			label : 'Page',
			description : 'Panel contains list of widgets.',
			image : 'images/wb/content.svg',
	};

	function _widget(model){
		if (model.type in contentElementAsso) {
			return contentElementAsso[model.type];
		}
		if (model.type === 'Page') {
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
			var widgets = {};
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
		// fix widget data
		widget.data = widget.data || {style:{}};
		widget.data.type = widget.type;
		if(widget.name){
			widget.data.name = widget.name; 
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
			if (model.type != 'Group') {
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
	
	/**
	 * Creates new serialized data of widget
	 * @param widget
	 * @returns
	 */
	function widgetData(widget){
		var data = angular.copy(widget.data);
		return data;
	}

	// تعیین سرویس‌ها
	this.newWidget = newWidget;
	this.widget = widget;
	this.widgets = widgets;
	this.widgetData = widgetData;
	this.select = select;
	this.getTemplateFor = getTemplateFor;
	this.compile = compile;
});

angular.module('am-wb-core').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/dialogs/wb-select-resource.html',
    "<md-dialog aria-label=\"edit action dialog\" ng-cloak> <md-toolbar> <div class=md-toolbar-tools> <h2 translate>{{style.title | translate}}</h2> <span flex></span> <md-button class=md-icon-button ng-click=cancel()> <wb-icon aria-label=\"Close dialog\">close</wb-icon> </md-button> <md-button class=md-icon-button ng-click=answer()> <wb-icon aria-label=\"done dialog\">done</wb-icon> </md-button> </div> </md-toolbar> <md-dialog-content> <div class=md-dialog-content layout=column> <md-tabs md-selected=pageIndex> <md-tab ng-repeat=\"page in pages\" label=\"{{page.label | translate}}\"> </md-tab> </md-tabs> <div id=wb-select-resource-children flex> </div> </div> </md-dialog-content> </md-dialog>"
  );


  $templateCache.put('views/dialogs/wb-selectwidget.html',
    "<md-dialog aria-label=\"edit action dialog\" ng-controller=WbWidgetSelectCtrl ng-cloak>  <md-toolbar> <div class=md-toolbar-tools> <h2 translate>Widget list</h2> <span flex></span> <md-button class=md-icon-button ng-click=cancel()> <wb-icon aria-label=\"Close dialog\">close</wb-icon> </md-button> </div> </md-toolbar>    <md-dialog-content> <md-content class=\"md-padding md-dialog-content\" layout-xs=column layout=row layout-wrap>    <md-card ng-repeat=\"widget in widgets.items\" flex-xs flex-gt-xs=45 md-theme-watch> <md-card-title> <md-card-title-text> <span class=md-headline>{{widget.label}}</span> <span class=md-subhead>{{widget.description}}</span> </md-card-title-text> <md-card-title-media> <img ng-show=widget.image src=\"{{widget.image}}\"> <wb-icon ng-show=!widget.image&&widget.icon wb-icon-size=64>{{widget.icon}}</wb-icon> </md-card-title-media> </md-card-title> <md-card-actions layout=row layout-align=\"end center\"> <md-button ng-click=answerWidget(widget)> <wb-icon>add</wb-icon> {{ 'Add' | translate }} </md-button>  </md-card-actions> </md-card> </md-content> </md-dialog-content> </md-dialog>"
  );


  $templateCache.put('views/directives/wb-group.html',
    "<div dnd-disable-if=!wbEditable dnd-draggable=wbModel dnd-type=\"'wb.widget'\" dnd-moved=remove() ng-class=\"{'wb-panel wb-widget-edit': wbEditable}\" name={{wbModel.name}}>  <div ng-if=wbEditable class=wb-panel-header layout=row> <span translate> {{wbModel.name}}</span> <span flex></span>  <md-button ng-disabled=\"wbModel.direction!='rtl'\" ng-click=\"wbModel.direction='ltr'\" class=\"md-icon-button md-mini\"> <md-tooltip> <span translate>Left to right direction</span> </md-tooltip> <wb-icon class=wb-icon-mini>format_textdirection_l_to_r</wb-icon> </md-button> <md-button ng-disabled=\"wbModel.direction=='rtl'\" ng-click=\"wbModel.direction='rtl'\" class=\"md-icon-button md-mini\"> <md-tooltip> <span translate>Right to left direction</span> </md-tooltip> <wb-icon class=wb-icon-mini>format_textdirection_r_to_l</wb-icon> </md-button> <md-divider></md-divider> <md-button ng-click=clone() class=\"md-icon-button md-mini\"> <md-tooltip> <span translate>Clone current group</span> </md-tooltip> <wb-icon class=mde-icon-mini>content_copy</wb-icon> </md-button> <md-button ng-click=settings() class=\"md-icon-button md-mini\"> <md-tooltip> <span translate>Load settings</span> </md-tooltip> <wb-icon class=wb-icon-mini>settings</wb-icon> </md-button> <md-button class=\"md-icon-button md-mini\" ng-mouseenter=\"hoveringDelBtn=true\" ng-mouseleave=\"hoveringDelBtn=false\" ng-click=remove()> <md-tooltip> <span translate>Remove current group</span> </md-tooltip> <wb-icon class=wb-icon-mini>delete</wb-icon> </md-button> </div>  <div class=wb-panel-body id=wb-content-body> <div ng-if=wbEditable&&hoveringDelBtn class=wb-panel-overlay> </div>  <div id=wb-content-placeholder class=wb-panel-container dir={{wbModel.direction}} wb-layout=wbModel.style wb-margin=wbModel.style wb-padding=wbModel.style wb-size=wbModel.style wb-background=wbModel.style wb-border=wbModel.style dnd-external-sources=true dnd-list=wbModel.contents dnd-allowed-types=\"['wb.widget']\" dnd-drop=\"dropCallback(event, index, item, external, type)\"> </div> </div> </div>"
  );


  $templateCache.put('views/directives/wb-page.html',
    "<div class=wb-page dnd-disable-if=!wbEditable ng-class=\"{'wb-page-edit': wbEditable}\">  <div ng-if=wbEditable class=wb-panel-header layout=row> <span translate> Content</span> <span flex></span>  <md-button ng-disabled=\"wbModel.direction!='rtl'\" ng-click=\"wbModel.direction='ltr'\" class=\"md-icon-button md-mini\"> <md-tooltip>Left to right direction</md-tooltip> <wb-icon class=wb-icon-mini>format_textdirection_l_to_r</wb-icon> </md-button> <md-button ng-disabled=\"wbModel.direction=='rtl'\" ng-click=\"wbModel.direction='rtl'\" class=\"md-icon-button md-mini\"> <md-tooltip>Right to left direction</md-tooltip> <wb-icon class=wb-icon-mini>format_textdirection_r_to_l</wb-icon> </md-button> <md-divider></md-divider> <md-button ng-click=settings() class=\"md-icon-button md-mini\"> <wb-icon class=wb-icon-mini>settings</wb-icon> </md-button> <md-button ng-click=loadTemplate() class=\"md-icon-button md-mini\"> <wb-icon class=wb-icon-mini>photo_album</wb-icon> </md-button> </div>  <div class=wb-panel-body id=wb-content-body> <div ng-if=hoveringDelBtn class=wb-panel-overlay> </div>  <div class=wb-panel-container dir={{wbModel.direction}} wb-layout=wbModel.style wb-margin=wbModel.style wb-padding=wbModel.style wb-size=wbModel.style wb-background=wbModel.style wb-border=wbModel.style id=wb-content-placeholder dnd-external-sources=true dnd-list=wbModel.contents dnd-allowed-types=\"['wb.widget']\" dnd-drop=\"dropCallback(event, index, item, external, type)\"> </div> </div> </div>"
  );


  $templateCache.put('views/directives/wb-setting-panel-group.html',
    "<div layout=column> <md-nav-bar md-selected-nav-item=currentNavItem nav-bar-aria-label=\"navigation links\"> <md-nav-item md-nav-click=\"goto('setting')\" name=setting>Settings</md-nav-item> <md-nav-item md-nav-click=\"goto('widget')\" name=widget>Widgets</md-nav-item> </md-nav-bar> <div ng-show=\"page=='widget'\" layout=column> <md-list flex> <md-list-item class=md-2-line ng-repeat=\"widget in widgets\" dnd-draggable=widget.data dnd-type=\"'wb.widget'\" dnd-effect-allowed=copy> <wb-icon wb-icon-name={{widget.icon}}></wb-icon> <div class=md-list-item-text layout=column> <h3>{{ widget.label }}</h3> <p>{{ widget.description }}</p> </div> </md-list-item> </md-list> </div> <div ng-show=\"page=='setting'\" id=WB-SETTING-PANEL>  </div> </div>"
  );


  $templateCache.put('views/directives/wb-setting-panel.html',
    " <md-expansion-panel> <md-expansion-panel-collapsed>  <div class=md-title>{{label}}</div> <div class=md-summary></div> <md-expansion-panel-icon></md-expansion-panel-icon> </md-expansion-panel-collapsed> <md-expansion-panel-expanded> <md-expansion-panel-header> <div class=md-title>{{label}}</div> <div class=md-summary></div> <md-expansion-panel-icon ng-click=$panel.collapse()></md-expansion-panel-icon> </md-expansion-panel-header> <md-expansion-panel-content style=\"padding: 0px\"> <ng-transclude></ng-transclude> </md-expansion-panel-content> </md-expansion-panel-expanded> </md-expansion-panel>"
  );


  $templateCache.put('views/directives/wb-ui-choose.html',
    "<md-tabs class=wb-tab-as-choose-button md-selected=selectedIndex> <md-tab ng-repeat=\"item in items\"> <md-tab-label> <wb-icon>{{item.icon}}</wb-icon> </md-tab-label> </md-tab> </md-tabs>"
  );


  $templateCache.put('views/directives/wb-ui-setting-audio.html',
    "<md-list-item> <md-button class=md-icon-button aria-label=Edit ng-click=edit(value)> <wb-icon>wb-object-audio</wb-icon> </md-button> <md-input-container> <input ng-model=value> </md-input-container> </md-list-item>"
  );


  $templateCache.put('views/directives/wb-ui-setting-choose.html',
    "<md-list-item> <wb-icon ng-hide=\"icon==undefined || icon==null || icon==''\" wb-icon-name={{icon}}> </wb-icon> <p ng-hide=\"title==undefined || title==null || title==''\">{{title}}</p> <md-tabs flex=100 class=wb-tab-as-choose-button md-selected=selectedIndex> <md-tab ng-repeat=\"item in xitems\"> <md-tab-label> <wb-icon>{{item.icon}}</wb-icon> </md-tab-label> </md-tab> </md-tabs> </md-list-item> "
  );


  $templateCache.put('views/directives/wb-ui-setting-color.html',
    "<md-list-item> <wb-icon ng-hide=\"icon==undefined || icon==null || icon=='title'\">{{icon}}</wb-icon> <p ng-hide=\"title==undefined || title==null || title==''\">{{title}}</p> <md-color-picker class=color-picker-hide-textbox md-color-clear-button=false ng-model=value> </md-color-picker> </md-list-item>"
  );


  $templateCache.put('views/directives/wb-ui-setting-data.html',
    "<md-list-item> <md-button class=md-icon-button aria-label=Edit ng-click=edit(value)> <wb-icon>{{icon || 'wb-object-data'}}</wb-icon> </md-button> <md-input-container> <input ng-model=value.key> </md-input-container> </md-list-item>"
  );


  $templateCache.put('views/directives/wb-ui-setting-dropdown.html',
    "<md-list-item> <wb-icon ng-hide=\"icon==undefined || icon==null || icon==''\">{{icon}}</wb-icon> <p ng-hide=\"title==undefined || title==null || title==''\">{{title}}</p> <md-select style=\"margin: 0px\" ng-model=value> <md-option ng-repeat=\"item in items\" value={{item.value}}> {{item.title}} </md-option> </md-select> </md-list-item>"
  );


  $templateCache.put('views/directives/wb-ui-setting-image.html',
    "<div layout=column> <div> <wb-icon ng-hide=\"icon==undefined || icon==null || icon==''\">{{icon}}</wb-icon> <p ng-hide=\"title==undefined || title==null || title==''\">{{title | translate}}</p> </div> <div layout=row> <img ng-click=selectImage() ng-src={{value}} width=24px height=24px class=\"md-avatar-icon\"> <md-input-container flex> <input ng-model=value> </md-input-container> </div> </div>"
  );


  $templateCache.put('views/directives/wb-ui-setting-number.html',
    "<md-list-item ng-show=\"slider==undefined\"> <wb-icon ng-hide=\"icon==undefined || icon==null || icon==''\">{{icon}}</wb-icon> <p ng-hide=\"title==undefined || title==null  || title==''\">{{title}}</p> <md-input-container style=\"margin: 0px\"> <input style=\"width: 50px\" type=number ng-model=value flex> </md-input-container> </md-list-item> <md-list-item ng-show=\"slider!=undefined\"> <wb-icon ng-hide=\"icon==undefined || icon==null || icon=='' || icon=='wb-blank'\">{{icon}}</wb-icon> <div ng-show=\"icon=='wb-blank'\" style=\"display: inline-block; width: 32px; opacity: 0.0\"></div> <p ng-hide=\"title==undefined || title==null || title==''\">{{title}}</p> <md-slider min=0 max=100 ng-model=value flex></md-slider> </md-list-item>"
  );


  $templateCache.put('views/directives/wb-ui-setting-on-off-switch.html',
    "<md-list-item> <wb-icon ng-hide=\"icon==undefined || icon==null || icon==''\">{{icon}}</wb-icon> <p ng-hide=\"title==undefined || title==null || title==''\">{{title}}</p> <md-switch class=md-secondary ng-model=value></md-switch> </md-list-item>"
  );


  $templateCache.put('views/directives/wb-ui-setting-video.html',
    "<md-list-item> <md-button class=md-icon-button aria-label=Edit ng-click=edit(value)> <wb-icon>wb-object-video</wb-icon> </md-button> <md-input-container> <input ng-model=value> </md-input-container> </md-list-item>"
  );


  $templateCache.put('views/directives/wb-widget.html',
    "<div dnd-disable-if=!wbEditable dnd-selected=selected() dnd-draggable=wbModel dnd-type=\"'wb.widget'\" dnd-moved=movedCallback() class=wb-widget ng-class=\"{'wb-widget-edit': wbEditable}\" layout=column name={{wbModel.name}}>  <div ng-show=isSelected() layout=row class=wb-widget-header> <span translate> {{wbModel.name}}</span> <span flex></span>  <md-button class=\"md-icon-button md-mini\" ng-repeat=\"item in extraActions\" ng-hide=item.hide() ng-disabled=item.disable() ng-click=item.action()> <wb-icon class=mde-icon-mini>{{item.icon}}</wb-icon> </md-button> <md-divider></md-divider> <md-button ng-if=add ng-click=add() class=\"md-icon-button md-mini\"> <wb-icon class=mde-icon-mini>add_circle</wb-icon> </md-button> <md-button ng-click=clone() class=\"md-icon-button md-mini\"> <wb-icon class=mde-icon-mini>content_copy</wb-icon> </md-button> <md-button class=\"md-icon-button md-mini\" ng-click=remove() ng-show=remove ng-mouseenter=\"ctrl.hoveringDelBtn=true\" ng-mouseleave=\"ctrl.hoveringDelBtn=false\"> <wb-icon class=mde-icon-mini>delete</wb-icon> </md-button> </div>  <div class=wb-widget-body wb-padding=wbModel.style wb-size=wbModel.style wb-background=wbModel.style wb-border=wbModel.style wb-margin=wbModel.style> <div class=wb-widget-overlay ng-show=ctrl.hoveringDelBtn> </div> <wb-transclude class=wb-widget-container wb-layout=wbModel.style> </wb-transclude> </div> </div>"
  );


  $templateCache.put('views/resources/wb-sheet.html',
    "<div flex layout=column> <hot-table settings=\"{\n" +
    "\t\t \tcolHeaders: true, \n" +
    "\t\t \tcontextMenu: ['row_above', 'row_below', 'remove_row', 'hsep1', 'col_left', 'col_right', 'hsep2', 'remove_row', 'remove_col', 'hsep3', 'undo', 'redo', 'make_read_only', 'alignment', 'borders'], \n" +
    "\t\t \tafterChange: true\n" +
    "\t\t }\" row-headers=true min-spare-rows=minSpareRows datarows=value.values height=300 width=500 flex> </hot-table> </div>"
  );


  $templateCache.put('views/resources/wb-url.html',
    "<div flex layout=column> <p>Fill the following field with the URL.</p> <md-input-container class=\"md-icon-float md-block\"> <label translate>URL</label> <input ng-model=value> </md-input-container> </div>"
  );


  $templateCache.put('views/settings/wb-background.html',
    " <md-list class=wb-setting-panel>  <wb-ui-setting-on-off-switch title=Transparent? icon=blur_on value=wbModel.style.isTransparent> </wb-ui-setting-on-off-switch>  <wb-ui-setting-number ng-show=wbModel.style.isTransparent title=Opacity icon=wb-opacity value=wbModel.style.opacity> </wb-ui-setting-number>  <wb-ui-setting-number ng-show=wbModel.style.isTransparent slider=\"\" icon=wb-blank value=wbModel.style.opacity> </wb-ui-setting-number>  <wb-ui-setting-image title=\"Background image\" value=wbModel.style.backgroundImage> </wb-ui-setting-image> <wb-ui-setting-color title=\"Background Color\" icon=format_color_fill value=wbModel.style.backgroundColor> </wb-ui-setting-color>  <wb-ui-setting-on-off-switch title=\"Advance Background options\" value=_abo> </wb-ui-setting-on-off-switch> <md-input-container ng-show=_abo class=\"md-icon-float md-block\"> <label>Background</label> <input ng-model=wbModel.style.background> </md-input-container> <md-input-container ng-show=_abo class=\"md-icon-float md-block\"> <label>Background size</label> <input ng-model=wbModel.style.backgroundSize> </md-input-container> <md-input-container ng-show=_abo class=\"md-icon-float md-block\"> <label>Background repeat</label> <input ng-model=wbModel.style.backgroundRepeat> </md-input-container> <md-input-container ng-show=_abo class=\"md-icon-float md-block\"> <label>Background position</label> <input ng-model=wbModel.style.backgroundPosition> </md-input-container> <md-input-container ng-show=_abo class=\"md-icon-float md-block\"> <label>Background attachment</label> <input ng-model=wbModel.style.backgroundAttachment> </md-input-container> <md-input-container ng-show=_abo class=\"md-icon-float md-block\"> <label>Background origin</label> <input ng-model=wbModel.style.backgroundOrigin> </md-input-container> </md-list>"
  );


  $templateCache.put('views/settings/wb-border.html',
    " <md-list class=wb-setting-panel>   <md-subheader class=md-no-sticky>Corner Radius</md-subheader>  <wb-ui-setting-on-off-switch title=\"All Equal?\" icon=rounded_corner value=wbModel.style.borderRadius.uniform></wb-ui-setting-on-off-switch>  <wb-ui-setting-number ng-show=wbModel.style.borderRadius.uniform title=Radius icon=rounded_corner value=wbModel.style.borderRadius.all></wb-ui-setting-number>  <wb-ui-setting-number ng-show=wbModel.style.borderRadius.uniform slider=\"\" icon=wb-blank value=wbModel.style.borderRadius.all></wb-ui-setting-number>   <wb-ui-setting-number ng-show=!wbModel.style.borderRadius.uniform title=Top-Left icon=face value=wbModel.style.borderRadius.topLeft></wb-ui-setting-number>  <wb-ui-setting-number ng-show=!wbModel.style.borderRadius.uniform title=Top-Right icon=face value=wbModel.style.borderRadius.topRight></wb-ui-setting-number>  <wb-ui-setting-number ng-show=!wbModel.style.borderRadius.uniform title=Bottom-left icon=face value=wbModel.style.borderRadius.bottomLeft></wb-ui-setting-number>  <wb-ui-setting-number ng-show=!wbModel.style.borderRadius.uniform title=Bottom-Right icon=face value=wbModel.style.borderRadius.bottomRight></wb-ui-setting-number>  <md-divider></md-divider> <md-subheader>Style/Color/Thickness</md-subheader>  <wb-ui-setting-on-off-switch title=\"All Equal?\" title=\"All Eaual?\" icon=border_all value=wbModel.style.borderStyleColorWidth.uniform></wb-ui-setting-on-off-switch>  <wb-ui-setting-dropdown ng-show=wbModel.style.borderStyleColorWidth.uniform title=Border icon=line_style items=styles value=wbModel.style.borderStyle.all></wb-ui-setting-dropdown>  <wb-ui-setting-number ng-show=\"wbModel.style.borderStyleColorWidth.uniform && wbModel.style.borderStyle.all!='none'\" title=Thickness icon=line_weight value=wbModel.style.borderWidth.all></wb-ui-setting-number>  <wb-ui-setting-color ng-show=\"wbModel.style.borderStyleColorWidth.uniform && wbModel.style.borderStyle.all!='none'\" title=Color icon=format_color_fill value=wbModel.style.borderColor.all></wb-ui-setting-color>   <wb-ui-setting-dropdown ng-show=!wbModel.style.borderStyleColorWidth.uniform title=Left-Border icon=border_left items=styles value=wbModel.style.borderStyle.left></wb-ui-setting-dropdown> <wb-ui-setting-number ng-show=\"(!wbModel.style.borderStyleColorWidth.uniform) && wbModel.style.borderStyle.left!='none'\" title=Thickness icon=line_weight value=wbModel.style.borderWidth.left></wb-ui-setting-number> <wb-ui-setting-color ng-show=\"(!wbModel.style.borderStyleColorWidth.uniform) && wbModel.style.borderStyle.left!='none'\" title=Color icon=format_color_fill value=wbModel.style.borderColor.left></wb-ui-setting-color>  <md-divider class=wb-sub-divider ng-show=!wbModel.style.borderStyleColorWidth.uniform></md-divider> <wb-ui-setting-dropdown ng-show=!wbModel.style.borderStyleColorWidth.uniform title=Right-Border icon=border_right items=styles value=wbModel.style.borderStyle.right></wb-ui-setting-dropdown> <wb-ui-setting-number ng-show=\"(!wbModel.style.borderStyleColorWidth.uniform) && wbModel.style.borderStyle.right!='none'\" title=Thickness icon=line_weight value=wbModel.style.borderWidth.right></wb-ui-setting-number> <wb-ui-setting-color ng-show=\"(!wbModel.style.borderStyleColorWidth.uniform) && wbModel.style.borderStyle.right!='none'\" title=Color icon=format_color_fill value=wbModel.style.borderColor.right></wb-ui-setting-color>  <md-divider class=wb-sub-divider ng-show=!wbModel.style.borderStyleColorWidth.uniform></md-divider> <wb-ui-setting-dropdown ng-show=!wbModel.style.borderStyleColorWidth.uniform title=Top-Border icon=border_top items=styles value=wbModel.style.borderStyle.top></wb-ui-setting-dropdown> <wb-ui-setting-number ng-show=\"(!wbModel.style.borderStyleColorWidth.uniform) && wbModel.style.borderStyle.top!='none'\" title=Thickness icon=line_weight value=wbModel.style.borderWidth.top></wb-ui-setting-number> <wb-ui-setting-color ng-show=\"(!wbModel.style.borderStyleColorWidth.uniform) && wbModel.style.borderStyle.top!='none'\" title=Color icon=format_color_fill value=wbModel.style.borderColor.top></wb-ui-setting-color>  <md-divider class=wb-sub-divider ng-show=!wbModel.style.borderStyleColorWidth.uniform></md-divider> <wb-ui-setting-dropdown ng-show=!wbModel.style.borderStyleColorWidth.uniform title=Bottom-Border icon=border_bottom items=styles value=wbModel.style.borderStyle.bottom></wb-ui-setting-dropdown> <wb-ui-setting-number ng-show=\"(!wbModel.style.borderStyleColorWidth.uniform) && wbModel.style.borderStyle.bottom!='none'\" title=Thickness icon=line_weight value=wbModel.style.borderWidth.bottom></wb-ui-setting-number> <wb-ui-setting-color ng-show=\"(!wbModel.style.borderStyleColorWidth.uniform) && wbModel.style.borderStyle.bottom!='none'\" title=Color icon=format_color_fill value=wbModel.style.borderColor.bottom></wb-ui-setting-color> </md-list>"
  );


  $templateCache.put('views/settings/wb-description.html',
    " <div layout=column style=width:100%> <md-input-container> <label translate>Lable</label> <input ng-model=wbModel.label> </md-input-container> <md-input-container> <label translate>Description</label> <input ng-model=wbModel.description> </md-input-container> <md-input-container> <label translate>Keywords</label> <input ng-model=wbModel.keywords> </md-input-container> <wb-ui-setting-image title=Cover value=wbModel.cover> </wb-ui-setting-image> </div>"
  );


  $templateCache.put('views/settings/wb-layout-page.html',
    " <md-list class=wb-setting-panel>  <wb-ui-setting-choose title=Direction icon=wb-direction items=flexDirection ng-model=wbModel.style.flexDirection> </wb-ui-setting-choose>  <wb-ui-setting-choose title=\"{{(wbModel.style.flexDirection=='wb-flex-row')?'Vert.':'Horz.'}}\" icon=\"{{(wbModel.style.flexDirection=='wb-flex-row')?'face':'wb-horizontal-arrows'}}\" items=alignItems ng-model=wbModel.style.alignItems> </wb-ui-setting-choose>  <wb-ui-setting-choose title=\"{{(wbModel.style.flexDirection!='wb-flex-row')?'Vert.':'Horz.'}}\" icon=\"{{(wbModel.style.flexDirection!='wb-flex-row')?'wb-vertical-arrows':'wb-horizontal-arrows'}}\" items=justifyContent ng-model=wbModel.style.justifyContent> </wb-ui-setting-choose> </md-list>"
  );


  $templateCache.put('views/settings/wb-layout-self.html',
    " <md-list class=wb-setting-panel>  <wb-ui-setting-choose title=\"{{(wbModel.style.flexDirection!='wb-flex-row')?'Vert.':'Horz.'}}\" icon=\"{{(wbModel.style.flexDirection!='wb-flex-row')?'swap_vert':'swap_horiz'}}\" items=flexAlignItem ng-model=wbModel.style.flexAlignItem> </wb-ui-setting-choose>   <wb-ui-setting-on-off-switch title=\"Fill Space?\" icon=border_all value=wbModel.style.flexItemGrowEnabled> </wb-ui-setting-on-off-switch>  <wb-ui-setting-number slider=\"\" ng-show=wbModel.style.flexItemGrowEnabled title=Weight icon=face value=wbModel.style.flexItemGrow></wb-ui-setting-number> </md-list>"
  );


  $templateCache.put('views/settings/wb-margin-padding.html',
    " <md-list class=wb-setting-panel>   <md-subheader class=md-no-sticky>Margin</md-subheader>  <wb-ui-setting-on-off-switch title=\"All Equal?\" icon=filter_none value=wbModel.style.margin.isUniform> </wb-ui-setting-on-off-switch>  <md-input-container ng-show=wbModel.style.margin.isUniform class=\"md-icon-float md-block\"> <label>Margin Value</label> <input ng-model=wbModel.style.margin.uniform> </md-input-container>  <wb-ui-setting-number ng-show=wbModel.style.margin.isUniform slider=\"\" icon=wb-blank value=wbModel.style.margin.uniform> </wb-ui-setting-number>  <md-input-container ng-show=!wbModel.style.margin.isUniform class=\"md-icon-float md-block\"> <label>Left Margin</label> <input ng-model=wbModel.style.margin.left> </md-input-container> <md-input-container ng-show=!wbModel.style.margin.isUniform class=\"md-icon-float md-block\"> <label>Right Margin</label> <input ng-model=wbModel.style.margin.right> </md-input-container> <md-input-container ng-show=!wbModel.style.margin.isUniform class=\"md-icon-float md-block\"> <label>Top Margin</label> <input ng-model=wbModel.style.margin.top> </md-input-container> <md-input-container ng-show=!wbModel.style.margin.isUniform class=\"md-icon-float md-block\"> <label>Bottom Margin</label> <input ng-model=wbModel.style.margin.bottom> </md-input-container>   <md-subheader class=md-no-sticky>Padding</md-subheader>  <wb-ui-setting-on-off-switch title=\"All Equal?\" icon=settings_overscan value=wbModel.style.padding.isUniform> </wb-ui-setting-on-off-switch>  <md-input-container ng-show=wbModel.style.padding.isUniform class=\"md-icon-float md-block\"> <label>Padding Value</label> <input ng-model=wbModel.style.padding.uniform> </md-input-container>  <wb-ui-setting-number ng-show=wbModel.style.padding.isUniform slider=\"\" icon=wb-blank value=wbModel.style.padding.uniform> </wb-ui-setting-number>  <md-input-container ng-show=!wbModel.style.padding.isUniform class=\"md-icon-float md-block\"> <label>Left Padding</label> <input ng-model=wbModel.style.padding.left> </md-input-container> <md-input-container ng-show=!wbModel.style.padding.isUniform class=\"md-icon-float md-block\"> <label>Right Padding</label> <input ng-model=wbModel.style.padding.right> </md-input-container> <md-input-container ng-show=!wbModel.style.padding.isUniform class=\"md-icon-float md-block\"> <label>Top Padding</label> <input ng-model=wbModel.style.padding.top> </md-input-container> <md-input-container ng-show=!wbModel.style.padding.isUniform class=\"md-icon-float md-block\"> <label>Bottom Padding</label> <input ng-model=wbModel.style.padding.bottom> </md-input-container> </md-list>"
  );


  $templateCache.put('views/settings/wb-min-max-size.html',
    " <md-list class=wb-setting-panel>  <md-subheader class=md-no-sticky>Min</md-subheader>  <md-input-container class=\"md-icon-float md-block\"> <label>Min Width</label> <input ng-model=wbModel.style.minWidth> </md-input-container>  <md-input-container class=\"md-icon-float md-block\"> <label>Min Height</label> <input ng-model=wbModel.style.minHeight> </md-input-container>  <md-subheader class=md-no-sticky>Max</md-subheader>  <md-input-container class=\"md-icon-float md-block\"> <label>Max Width</label> <input ng-model=wbModel.style.maxWidth> </md-input-container>  <md-input-container class=\"md-icon-float md-block\"> <label>Max Height</label> <input ng-model=wbModel.style.maxHeight> </md-input-container> </md-list>"
  );


  $templateCache.put('views/settings/wb-notfound.html',
    " <wb-icon>bug</wb-icon> <h2>Settings page not found</h2>"
  );


  $templateCache.put('views/settings/wb-text.html',
    " <textarea ui-tinymce=\"{\n" +
    "\t\t plugins : 'directionality contextmenu table link paste hr emoticons advlist autolink link lists advlist charmap print preview code anchor image imagetools visualchars',\n" +
    "\t\t toolbar: [\n" +
    "\t\t \t'undo redo visualchars | styleselect | link image emoticons | hr ',\n" +
    "\t\t \t'alignleft aligncenter alignright | ltr rtl | bold italic | numlist bullist ',\n" +
    "\t\t ],\n" +
    "\t\t contextmenu: 'link image inserttable | cell row column deletetable',\n" +
    "\t\t elementpath: true,\n" +
    "\t\t branding: false,\n" +
    "\t\t image_advtab: false\n" +
    "\t}\" ng-model=wbModel.text flex>\n" +
    "</textarea>"
  );


  $templateCache.put('views/sheets/wb-themplates.html',
    "<md-bottom-sheet class=\"md-list md-has-header\" md-colors=\"{backgroundColor: 'background-900'}\"> <div style=\"padding: 16px\">  <div layout=row layout-align=\"start center\" style=\"padding: 0px 8px; margin: 0px\"> <span translate>Start a new page</span> <span flex></span> <span translate>Template gallery</span> <md-divider></md-divider> <md-button aria-label=\"Hide template sheet\" class=md-icon-button ng-click=hideTemplates($event)> <wb-icon>keyboard_arrow_down </wb-icon></md-button> <md-menu> <md-button aria-label=\"Open them interactions menu\" class=md-icon-button ng-click=$mdMenu.open($event)> <wb-icon>more_vert </wb-icon></md-button> <md-menu-content width=4 md-colors=\"{backgroundColor: 'background'}\"> <md-menu-item> <md-button ng-click=hideTemplates($event)> <span translate>Hide templates</span> </md-button> </md-menu-item> </md-menu-content> </md-menu> </div>  <md-content layout=row md-colors=\"{backgroundColor: 'background-900'}\"> <div layout=column ng-repeat=\"template in templates\" ng-click=loadTemplate(template) layout-padding style=\"cursor: pointer\"> <img width=215px height=152px ng-src={{template.thumbnail}} style=\"border-bottom-width: 1px; border: solid\"> {{template.name}} </div> </md-content> </div> </md-bottom-sheet>"
  );


  $templateCache.put('views/widgets/wb-html.html',
    " <div ng-hide=isSelected() ng-bind-html=\"wbModel.text | wbunsafe\"> </div> <div ui-tinymce=\"{\n" +
    "\t\tselector : 'div.tinymce',\n" +
    "\t\ttheme : 'inlite',\n" +
    "\t\tplugins : 'directionality contextmenu table link paste image imagetools hr textpattern autolink textcolor colorpicker',\n" +
    "\t\tinsert_toolbar : 'quickimage quicktable',\n" +
    "\t\tselection_toolbar : 'bold italic | quicklink h1 h2 h3 blockquote | ltr rtl | forecolor',\n" +
    "\t\tinsert_button_items: 'image link | inserttable | hr',\n" +
    "\t\tinline : true,\n" +
    "\t\tpaste_data_images : true,\n" +
    "\t\tbranding: false,\n" +
    "\t\timagetools_toolbar: 'rotateleft rotateright | flipv fliph | editimage imageoptions'\n" +
    "\t}\" ng-model=wbModel.text ng-show=isSelected() ng-if=wbEditable flex> </div>"
  );


  $templateCache.put('views/widgets/wb-notfound.html',
    "<div ng-show=wbEditable> Unsuported widget?! </div>"
  );

}]);
