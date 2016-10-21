/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
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
        'xeditable',//
        'pluf',//
        'ngMaterialWysiwyg',
        'ui.tinymce'
    ]);

/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';
//
//angular.module('donateMainApp')
///*
// * 
// */
//.config(function($translateProvider) {
//  	$translateProvider.translations('fa', {
//  		'donate' : 'دونیت',
//
//  		'language' : 'زبان',
//  		'sign in' : 'ورود',
//  		'sign out': 'خروج',
//  		'email':'رایانامه',
//  		'home': 'خانه',
//  		'close': 'بستن',
//  		'cancel': 'انصراف',
//  		'ok': 'تایید',
//  		'user login': 'ورود کاربر',
//  		'user name': 'نام کاربری',
//  		'password': 'گذرواژه',
//  		'submit':'ثبت',
//  		'about us': 'در مورد ما',
//  		'contact us': 'تماس با ما',
//
//  		'name is required': 'فیلد نام را باید تعیین کنید',
//  		'name must be between 5 and 50 characters long': 'نام باید رشته‌ای به طول ۵ تا ۵۰ حرف باشد',
//  		'email is required': 'آدرس رایانامه را باید وارد کنید',
//  		'email address is not correct': 'آدرس رایانامه صحیح نیست',
//  		'phone is required': 'فیلد شماره تماس را باید تعیین کنید',
//  		'phone is not correct': 'شماره وارد شده صحیح نمی‌باشد.',
//
//  		'app.update.title': 'به روز رسانی',
//  		'app.update.message': 'نسخه  سایت در دسترس است، لطفا دوباره صفحه را باز کنید.',
//
//  		'dialog.submit.email.message': 'دونیت در حال ساخت است. در صورت تمایل رایانامه خود را برای دریافت رویدادهای دونیت ثبت کنید.'
//  	});
//  	$translateProvider.preferredLanguage('fa');
//  });
/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc controller
 * @name ActionCtrl
 * @memberof ngMaterialWeburger
 * @description کنترلر یک عمل برای مدیریت و ویرایش آن ایجاد شده است. این کنترل
 *              در دیالوگ و یا نمایش‌های دیگر کاربرد دارد.
 * 
 * این کنترل علاوه بر امکانات ویرایشی، داده‌های اولیه هم برای نمایش فراهم
 * می‌کند.
 */
.controller('ActionCtrl', function($scope) {
	var types = [ {
		icon : 'link',
		label : 'Link internal or external',
		key : 'link'
	}, {
		icon : 'action',
		label : 'State change',
		key : 'state'
	} ];
	$scope.types = types;
});

'use strict';

angular.module('ngMaterialWeburger')
/**
 * @ngdoc function
 * @name ngMaterialWeburger.controller:BordersettingCtrl
 * @description # BordersettingCtrl Controller of the ngMaterialWeburger
 */
.controller(
		'BorderSettingCtrl',
		function($scope) {
			var scope = $scope;
			var model = $scope.mdeModel;


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
			}
			];

            //
			//scope.radiuses=[
			//	{
			//		title:'Top-Left: ',
			//		model:$scope.mdeModel.style.borderRadius.topLeft
			//	},
			//	{
			//		title:'Top-Left: ',
			//		model:$scope.mdeModel.style.borderRadius.topRight
			//	},
			//	{
			//		title:'Top-Left: ',
			//		model:$scope.mdeModel.style.borderRadius.bottomLeft
			//	},
			//	{
			//		title:'Top-Left: ',
			//		model:$scope.mdeModel.style.borderRadius.bottomRight
			//	}
			//];

		});

'use strict';

angular.module('ngMaterialWeburger')
/**
 * @ngdoc function
 * @name ngMaterialWeburger.controller:BordersettingCtrl
 * @description # BordersettingCtrl Controller of the ngMaterialWeburger
 */
.controller(
		'BorderSettingCtrl',
		function($scope) {
			var scope = $scope;
			var model = $scope.mdeModel;


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
			}
			];

            //
			//scope.radiuses=[
			//	{
			//		title:'Top-Left: ',
			//		model:$scope.mdeModel.style.borderRadius.topLeft
			//	},
			//	{
			//		title:'Top-Left: ',
			//		model:$scope.mdeModel.style.borderRadius.topRight
			//	},
			//	{
			//		title:'Top-Left: ',
			//		model:$scope.mdeModel.style.borderRadius.bottomLeft
			//	},
			//	{
			//		title:'Top-Left: ',
			//		model:$scope.mdeModel.style.borderRadius.bottomRight
			//	}
			//];

		});

/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')
/**
 * @memberof ngMaterialWeburger
 * @ngdoc controller
 * @name MdeCmsCtrl
 * @description # MdeCmsCtrl Controller of the donateMainApp
 * 
 * Manages contents
 */
.controller('MdeCmsCtrl', function($scope, $rootScope, $http, $cms, PaginatorParameter) {
	/*
	 * از این متغیر برای صفحه بندی و جستجوی محتوی‌ها استفاده می‌شود.‌
	 */
	var paginatorParameter = new PaginatorParameter();

	/*
	 * آخرین نتیچه‌ها در این متغیر نگهداری می‌شود.
	 */
	var requests = null;

	/*
	 * حالت اجرا را تعیین می‌کند. در صورتی که در حال بارگزاری باشیم این مقدار
	 * درستی است.
	 */
	var status = {
		working : false
	};

	/*
	 * جستجوی درخواست‌ها
	 */
	function _find() {
		status.working = true;
		$cms.contents(paginatorParameter)//
		.then(function(items) {
			requests = items;
			$scope.contents = $scope.contents.concat(requests.items);
			status.working = false;
		}, function() {
			status.working = false;
		});
	}

	function _clear() {
		$scope.concats.length = 0;
	}

	function search(text) {
		paginatorParameter//
		.setQuery(text)//
		.setPage(0);
		_clear();
		_find();
	}

	function date(dateTiem) {
		_clear();
		_find();
	}

	function mimetype(type) {
		_clear();
		_find();
	}

	/**
	 * یک فایل جدید به عنوان محتوی به سرور لود می‌شود.
	 * 
	 * @param file
	 * @returns
	 */
	function upload(file) {
		var content = null;
		// 1- create new content
		return $cms.newContent({
			title : 'no name',
			description : ''
		})//
		.then(function(newContent) {
			// 2- upload file
			content = newContent;
			return content.upload(file);
		}).then(function() {
			// 3- push in current result
			$scope.contents.push(content);
			return content;
		});
	}

	/**
	 * محتوی را به روز می‌کند.
	 * 
	 * @param content
	 * @returns
	 */
	function update(content) {
		return content.update();
	}

	/**
	 * انتخاب یک محتوی
	 * 
	 * @param content
	 * @returns
	 */
	function select(content) {
		$scope.content = content;
	}

	/**
	 * حذف محتوی
	 * 
	 * @param content
	 * @returns
	 */
	function remove(content) {
		return content.remove()//
		.then(function() {
			var index = $scope.contents.indexOf(request);
			if (index > -1) {
				$scope.contents.splice(index, 1);
			}
		});
	}

	/**
	 * صفحه بعد را بار گزاری می‌کند.
	 */
	function next() {
		// XXX: maso, 1395: check end page
		if (status.working || !requests.hasMore()) {
			return;
		}
		paginatorParameter.setPage(requests.next());
		_find();
	}

	// Parameters
	$scope.status = status; // loading state
	$scope.contents = []; // contents
	// functions
	$scope.search = search;
	$scope.date = date;
	$scope.mimetype = mimetype;
	$scope.upload = upload;
	$scope.select = select;
	$scope.remove = remove;
	$scope.next = next;

	// init
	_find();
});

/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc controller
 * @name ContentCtrl
 * @memberof ngMaterialWeburger
 * @description مدیریتی برای انتخاب ویجت‌های جدید
 * 
 * در این کنترل امکاناتی فراهم شده که کاربر بتواند از میان ویجت‌های موجودی یکی
 * را انتخاب کند.
 */
.controller('ContentSelectCtrl', function($scope, $widget, PaginatorParameter) {
	var scope = $scope;
	var paginatorParameter = new PaginatorParameter();

	/**
	 * ویجت‌های موجود را لود می‌کند
	 * 
	 * تمام ویجت‌های لود شده در متغیری به نام widgets توی اسکپ بار می‌شود.
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
	 * با انتخاب یک ویجت به عنوان ویجت پیش فرض می‌توان نمایش خاصی از آن را در
	 * سیستم ایجاد کرد.
	 * 
	 * @memberof ContentSelectCtrl
	 * @param {Widget}
	 *            widget ویجت پیش فرض را تعیین می‌کند
	 * @returns
	 */
	function selectWidget(widget) {
		scope.cwidget = widget;
		// TODO: bind the widget
	}

	/**
	 * ویجت را به عنوان ویجت انتخاب شده تعیین می‌کندs 
	 * 
	 * @memberof ContentSelectCtrl
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

/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc function
 * @name donateMainApp.controller:DialogsCtrl
 * @description # DialogsCtrl Controller of the donateMainApp
 */
    .controller('DialogsCtrl', function ($scope, $mdDialog, mdeModel, style) {
        function hide() {
            $mdDialog.hide();
        }

        function cancel() {
            $mdDialog.cancel();
        }

        function answer(response) {
            $mdDialog.hide(response);
        }

        $scope.mdeModel = mdeModel;
        $scope.style = style;
        $scope.hide = hide;
        $scope.cancel = cancel;
        $scope.answer = answer;
    })
    /**
     * @ngdoc function
     * @name donateMainApp.controller:DialogsCtrl
     * @description # DialogsCtrl Controller of the donateMainApp
     */
    .controller('SettingDialogsCtrl', function ($scope, $mdDialog, mdeModel, mdeParent, style) {
        function hide() {
            $mdDialog.hide();
        }

        function cancel() {
            $mdDialog.cancel();
        }

        function answer(response) {
            $mdDialog.hide(response);
        }

        $scope.mdeModel = mdeModel;
        $scope.mdeParent = mdeParent;
        $scope.style = style;
        $scope.hide = hide;
        $scope.cancel = cancel;
        $scope.answer = answer;
    });

/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc controller
 * @name ActionCtrl
 * @memberof ngMaterialWeburger
 * @description کنترلر یک عمل برای مدیریت و ویرایش آن ایجاد شده است. این کنترل
 *              در دیالوگ و یا نمایش‌های دیگر کاربرد دارد.
 * 
 * این کنترل علاوه بر امکانات ویرایشی، داده‌های اولیه هم برای نمایش فراهم
 * می‌کند.
 */
.controller('LayoutSettingsCtrl', function($scope, $settings) {
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

'use strict';

angular.module('ngMaterialWeburger')
/**
 * @ngdoc function
 * @name ngMaterialWeburger.controller:BordersettingCtrl
 * @description # BordersettingCtrl Controller of the ngMaterialWeburger
 */
.controller(
		'OldBackgroundSettingCtrl',
		function($scope) {
			var scope = $scope;
			var model = $scope.mdeModel;


			scope.types = [ {
				title : 'None',
				value : 'none'
			}, {
				title : 'Color',
				value : 'color'
			}];

		});

'use strict';

angular.module('ngMaterialWeburger')
/**
 * @ngdoc function
 * @name ngMaterialWeburger.controller:BordersettingCtrl
 * @description # BordersettingCtrl Controller of the ngMaterialWeburger
 */
.controller(
		'OldBorderSettingCtrl',
		function($scope) {
			var scope = $scope;
			var model = $scope.mdeModel;

			function update() {
				var style = scope.mdeModel.style;
				var meta = scope.mdeModel.style.borderMeta;
				if (meta.type === 'line') {
					style.borderRadius = meta.ctl + '% ' + meta.ctr + '% '
							+ meta.cbl + '% ' + meta.cbr + '%';
					style.border = meta.w + 'px ' + meta.s + ' ' + meta.c;
					return;
				}
				// none
				meta.type = style.borderRadius = style.border = 'none';
			}

			scope.$watch('mdeModel.style.borderMeta', function(newValue,
					oldValue) {
				var meta = model.style.borderMeta;
				if (oldValue.ca && oldValue.ca !== newValue.ca) {
					meta.ctl = meta.ca;
					meta.ctr = meta.ca;
					meta.cbl = meta.ca;
					meta.cbr = meta.ca;
				}
				update();
			}, true);

			scope.styles = [ {
				title : 'Solid',
				value : 'solid'
			}, {
				title : 'Dotted',
				value : 'dotted'
			}, {
				title : 'Dashed',
				value : 'dashed'
			} ];

			if (!scope.mdeModel.style) {
				scope.mdeModel.style = {};
			}
			if (!scope.mdeModel.style.borderMeta) {
				scope.mdeModel.style.borderMeta = {};
			}
			update();
		});

/**
 * Created by mgh on 8/4/16.
 */

/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */

'use strict';
angular.module('ngMaterialWeburger')

.controller('PageLayoutSettingsCtrl', function($scope, $settings) {
	var scope = $scope;

	scope.flexDirection = [ {
		title : 'row',
		icon : 'column',
		value : 'mde-flex-row'
	}, {
		title : 'column',
		icon : 'view_agenda',
		value : 'mde-flex-column'
	} ];

	scope.justifyContent = [ {
		title : 'Start',
		value : 'mde-flex-justify-content-start'
	}, {
		title : 'End',
		value : 'mde-flex-justify-content-end'
	}, {
		title : 'Center',
		value : 'mde-flex-justify-content-center'
	}, {
		title : 'Space Around',
		value : 'mde-flex-justify-content-space-around'
	}, {
		title : 'Space Between',
		value : 'mde-flex-justify-content-space-between'
	}];

	scope.alignItems = [{
		title : 'Stretch',
		value : 'mde-flex-align-items-stretch'
	}, {
		title : 'Start',
		value : 'mde-flex-align-items-start'
	}, {
		title : 'End',
		value : 'mde-flex-align-items-end'
	}, {
		title : 'Center',
		value : 'mde-flex-align-items-center'
	}]
});


/**
 * Created by mgh on 8/10/2016.
 */


/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */

'use strict';
angular.module('ngMaterialWeburger')

    .controller('SelfLayoutSettingsCtrl', function($scope, $settings) {
        var scope = $scope;

        scope.flexAlignItem = [
            {
            title : 'auto',
            value : 'mde-flex-item-auto'
        },  {
            title : 'Start',
            value : 'mde-flex-item-start'
        }, {
            title : 'End',
            value : 'mde-flex-item-end'
        }, {
            title : 'Center',
            value : 'mde-flex-item-center'
        }, {
            title : 'stretch',
            value : 'mde-flex-item-stretch'
        }];
    });


/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc controller
 * @name ActionCtrl
 * @memberof ngMaterialWeburger
 * @description کنترلر یک عمل برای مدیریت و ویرایش آن ایجاد شده است. این کنترل
 *              در دیالوگ و یا نمایش‌های دیگر کاربرد دارد.
 * 
 * این کنترل علاوه بر امکانات ویرایشی، داده‌های اولیه هم برای نمایش فراهم
 * می‌کند.
 */
.controller('SettingsCtrl', function($scope, $settings) {
	var scope = $scope;

	function loadPages() {
		var keys = scope.style.pages;
		var settings = [];
		for (var i = 0; i < keys.length; i++) {
			settings.push($settings.page(keys[i]));
		}
		scope.settings = settings;
	}

	loadPages();
});

/**
 * Created by mgh on 8/10/2016.
 */


/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */

'use strict';
angular.module('ngMaterialWeburger')

    .controller('TextSettingsCtrl', function($scope) {
        var scope = $scope;
        scope.tinymceOptions = {
            /*onChange: function(e) {
                // put logic here for keypress and cut/paste changes
            },*/
/*            selector: 'textarea',
            inline: false,
            plugins : 'advlist autolink link image lists charmap print preview',
            skin: 'lightgray',
            theme : 'modern',
            font_formats: 'Arial=arial,helvetica,sans-serif;'*/
            selector: 'textarea',
            height: 500,
            theme: 'modern',
            plugins: ['advlist autolink lists link image charmap print preview hr anchor pagebreak',
                'searchreplace wordcount visualblocks visualchars code fullscreen',
                'insertdatetime media nonbreaking save table contextmenu directionality',
                'emoticons template paste textcolor colorpicker textpattern imagetools'
            ],
            toolbar1: 'fontselect fontsizeselect | insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
            toolbar2: 'print preview media | forecolor backcolor emoticons',
            image_advtab: true,
            templates: [
                { title: 'Test template 1', content: 'Test 1' },
                { title: 'Test template 2', content: 'Test 2' }
            ],
            content_css: ['//fast.fonts.net/cssapi/e6dc9b99-64fe-4292-ad98-6974f93cd2a2.css',
                '//www.tinymce.com/css/codepen.min.css'
            ]
        };

    });


/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc directive
 * @name donateMainApp.directive:mdeBrandAction
 * @description
 * 
 * نمایش یک برند به همراه عملیات کاربر
 * 
 * در بسیاری از سایت‌ها نیاز داریم که یک صفحه ساده نشون بدیم که یک متن ساده روش
 * نوشته شده و گاهی هم یه فهرست از عمل‌ها توش وجود داره و کاربر می‌تونه آنها را
 * تعیین کند.
 * 
 * محتوی ورودی به این موجودیت توسط خودش قابل ویرایش هست ولی قابلیت ویرایش اون
 * باید توسط کنتر تعیین بشه.
 * 
 * داده‌های ورودی هم باید توی یه ساختار داده‌ای ارائه بشه و ذخیره بازیابیش باید
 * تو خود کنترلی باشه که داره این ساختار رو استفاده می‌کنه.
 * 
 */
.directive('mdeBrandAction', function() {
	return {
		restrict : 'E',
		replace : 'true',
		templateUrl : 'views/directives/mdebrandaction.html',
		scope : {
			mdeModel : '=?',
			mdeEditable : '=?',
			mdeParent : '=?'
		},
		controller : function($scope, $mdDialog, $act) {
			var scope = $scope;
			var model = $scope.mdeModel;
			var originatorEv;

			/**
			 * یک عمل جدید به برند اضافه می‌کنیم
			 * 
			 * تعداد عمل‌هایی که روی برند وجود داره، متغییر هست و کاربر می‌تونه
			 * با استفاده از این فراخوانی یک عمل جدید رو به فهرست عمل‌ها اضافه
			 * کنه
			 */
			function newAction() {
				return editAction({}).then(function(newModel) {
					if (!model.actions) {
						model.actions = [];
					}
					model.actions.push(newModel);
				});
			}

			/**
			 * یک عمل را ویرایش می‌کند
			 * 
			 * هر عملی که به نمایش اضافه می‌شود، به صورت مستقل قابل ویرایش است.
			 * این فراخوانی برای ویرایش عمل در نظر گرفته شده است.
			 */
			function editAction(action) {
				return $mdDialog.show({
					controller : 'DialogsCtrl',
					templateUrl : 'views/dialogs/mdeaction.html',
					parent : angular.element(document.body),
					clickOutsideToClose : true,
					fullscreen : true,
					locals : {
						mdeModel : action,
						style : {
							title : 'service'
						}
					}
				});
			}

			/**
			 * عمل تعیین شده را از فهرست عمل‌ها حذف می‌کند
			 * 
			 * از این فراخوانی برای حذف عمل‌ها استفاده می‌شود. این تغییرها به
			 * صورت مستقیم در مدل داده‌ای اعمال می‌شود.
			 */
			function removeAction(action) {
				var index = model.actions.indexOf(action);
				if (index > -1) {
					model.actions.splice(index, 1);
				}
			}

			/**
			 * یک عمل را اجرا می‌کند
			 * 
			 */
			function runAction(action) {
				$act.execute(action);
			}

			function removeWidget() {
				if (scope.mdeParent) {
					scope.mdeParent.removeWidget(scope.mdeModel);
				}
			}

			function settings() {
				return $mdDialog.show({
					controller : 'DialogsCtrl',
					templateUrl : 'views/dialogs/mdesettings.html',
					parent : angular.element(document.body),
					clickOutsideToClose : true,
					fullscreen : true,
					locals : {
						mdeModel : model,
						style : {
							pages : [ 'text' ]
						}
					}
				});
			}

			function openMenu($mdOpenMenu, ev) {
				originatorEv = ev;
				$mdOpenMenu(ev);
			}

			scope.add = newAction;
			scope.edit = editAction;
			scope.remove = removeAction;
			scope.runAction = runAction;

			scope.removeWidget = removeWidget;
			scope.settings = settings;
			scope.openMenu = openMenu;
		}
	};
});

/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc directive
 * @name donateMainApp.directive:MdeCollapsibleItemList
 * @description # MdeCollapsibleItemList
 */

.directive('mdeCollapsibleItemList', function() {
	return {
		templateUrl : 'views/directives/mdecollapsibleitemlist.html',
		restrict : 'E',
		replase : true,
		scope : {
			mdeEditable : '=?',
			mdeModel : '=?'
		}
	};
});

/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')
/**
 * @ngdoc directive
 * @name donateMainApp.directive:mdeContent
 * @description
 * 
 * نمایش یک محتوی
 * 
 * از این ساختار برای ایجاد یک محتوی استفاده می‌شود. هر محتوی معال با یک صفحه
 * معادل است که تمام موجودیت‌های خود را به صورت سطری و یا سطونی نمایش می‌دهد.
 * 
 * هر صفحه یک ساختار داده‌ای را به عنوان ورودی دریافت می‌کند و در صورتی که کاربر
 * مجاز به ویرایش آن باشد، آن را ویرایش و ساختار داده‌ای جدید ایجاد می‌کند.
 * فرآیند ذخیره سازی این ساختار داده‌ای باید به صورت مستقل در کنترل‌هایی انجام
 * شود که این ساختار را فراهم کرده‌اند.
 * 
 */
.directive('mdeContent', function($compile, $widget) {

	var bodyElementSelector = 'div#mde-content-body';
	var placeholderElementSelector = 'div#mde-content-placeholder';

	return {
		templateUrl : 'views/directives/mdecontent.html',
		transclude : true,
		restrict : 'E',
		replace : true,
		scope : {
			mdeModel : '=?',
			mdeEditable : '=?',
			mdeParent : '=?'
		},

		controller : function($scope, $element, $mdDialog) {
			var scope = $scope;

			function isEditable() {
				if (scope.mdeParent) {
					return scope.mdeParent.isEditable();
				}
				return scope.mdeEditable;
			}

			function createWidget(widget, parentScope, model) {
				var element = angular.element(widget);
				element.attr('mde-model', 'model');
				element.attr('mde-editable', 'mdeEditable()');
				element.attr('mde-parent', 'mdeParent');
				var childScope = parentScope.$new(true, parentScope);
				childScope.model = model;
				childScope.mdeEditable = scope.isEditable;
				childScope.mdeParent = parentScope;
				// TODO: maso, 1395: این موجودیت باید ایجاد شود
				return $compile(element)(childScope);
			}

			function removeWidgets() {
				$element//
				.children(bodyElementSelector)//
				.children(placeholderElementSelector)//
				.empty();
			}

			function removeWidget(model) {
				if (model == scope.mdeModel) {
					// باید از پدر بخواهیم که این کار رو انجام بده
					scope.mdeParent.removeWidget(model);
				}
				var index = scope.mdeModel.contents.indexOf(model);
				if (index > -1) {
					scope.mdeModel.contents.splice(index, 1);
				}
				// TODO: maso, 1395: بهتره که المان معادل را پیدا و حذف کنیم.
				removeWidgets();
				scope.mdeModel.contents.forEach(addWidget);
			}

			/**
			 * یک دریجه محاوره‌ای برای انتخاب و اضافه کردن ویجت باز می‌کند
			 * 
			 * کاربر با استفاده از دریچه محاوره‌ای ویجت را انتخاب می‌کند و بعد
			 * از آن این ویجت به صورت یک ساختار داده‌ای جدید به مدل داده‌ای و
			 * نمایش اضافه خواهد شد.‌
			 */
			function newWidget(mdeModel) {
				$mdDialog.show({
					controller : 'DialogsCtrl',
					templateUrl : 'views/dialogs/mdeselectwidget.html',
					parent : angular.element(document.body),
					clickOutsideToClose : true,
					fullscreen : true,
					locals : {
						mdeModel : {},
						style : {}
					},
				}).then(function(model) {
					mdeModel.contents.push(model);
					addWidget(model);
				});
			}

			function addWidget(item) {
				$widget.widget(item).then(function(widget) {
					$element//
					.children(bodyElementSelector)//
					.children(placeholderElementSelector)//
					.append(createWidget(widget.dom, $scope, item));
				});
			}

			/**
			 * تنظیم‌های کلی صفحه را انجام می‌دهد
			 * 
			 * یک دریچه محاوره‌ای باز می‌شود تا کاربر بتواند تنظیم‌های متفاوت
			 * مربوط به این صفحه را انجام دهد.
			 */
			function settings() {
				return $mdDialog.show({
					controller : 'SettingDialogsCtrl',
					templateUrl : 'views/dialogs/mdesettings.html',
					parent : angular.element(document.body),
					clickOutsideToClose : true,
					fullscreen : true,
					locals : {
						mdeModel : scope.mdeModel,
						mdeParent:scope.mdeParent,
						style : {
							pages : [ 'description', 'border', 'background','pageLayout','selfLayout' ]
						}
					}
				});
			}

			function isArray(model){
				return (model && model.constructor === Array);
			}
			
			scope.settings = settings;
			scope.removeWidgets = removeWidgets;
			scope.removeWidget = removeWidget;
			scope.newWidget = newWidget;
			scope.isEditable = isEditable

			scope.$watch('mdeModel', function() {
				removeWidgets();
				if (!scope.mdeModel) {
					// XXX: maso, 1395: هنوز مدل تعیین نشده
					return;
				}
				if(!isArray(scope.mdeModel.contents)){
					scope.mdeModel.contents = [];
				}
				scope.mdeModel.type = 'Page';
				scope.mdeModel.contents.forEach(addWidget);
			});
		}
	};
});

/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc directive
 * @name donateMainApp.directive:mdeCopyright
 * @description # mdeCopyright
 */
.directive('mdeCopyright', function() {
	return {
		restrict : 'E',
		replace : true,
		templateUrl : 'views/directives/mdecopyright.html',
		scope : {
			mdeEditable : '=?',
			mdeModel : '=?',
			mdeParent: '=?'
		},
		controller : function($scope, $mdDialog, $act) {
			var scope = $scope;
			var model = $scope.mdeModel;

			function removeWidget() {
				if (scope.mdeParent) {
					scope.mdeParent.removeWidget(model);
				}
			}

			function settings() {
				return $mdDialog.show({
					controller : 'DialogsCtrl',
					templateUrl : 'views/dialogs/mdesettings.html',
					parent : angular.element(document.body),
					clickOutsideToClose : true,
					fullscreen : true,
					locals : {
						mdeModel : model,
						style : {
							pages : [ 'text' ]
						}
					}
				});
			}

			scope.removeWidget = removeWidget;
			scope.settings = settings;
		}
	};
});

/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')
/**
 * @ngdoc directive
 * @name donateMainApp.directive:mdeFeatureList
 * @description # mdeFeatureList
 */
.directive('mdeFeatureList', function() {
	return {
		restrict : 'E',
		replace : true,
		templateUrl : 'views/directives/mdefeaturelist.html',
		scope : {
			mdeEditable : '=?',
			mdeModel : '=?',
			mdeParent : '=?'
		},
		controller : function($scope, $mdDialog) {
			var scope = $scope;
			var model = $scope.mdeModel;
			var originatorEv;

			function addFeature() {
				return editFeature({}).then(function(feature) {
					if (!model.features) {
						model.features = [];
					}
					model.features.push(feature);
					return feature;
				});
			}

			function editFeature(feature) {
				return $mdDialog.show({
					controller : 'DialogsCtrl',
					templateUrl : 'views/dialogs/mdeticket.html',
					parent : angular.element(document.body),
					clickOutsideToClose : true,
					fullscreen : true,
					locals : {
						mdeModel : feature,
						style : {}
					}
				});
			}

			function removeFeature(feature) {
				var index = model.features.indexOf(feature);
				if (index > -1) {
					model.features.splice(index, 1);
				}
			}

			function removeWidget() {
				if (scope.mdeParent) {
					scope.mdeParent.removeWidget(scope.mdeModel);
				}
			}

			function settings() {
				return $mdDialog.show({
					controller : 'DialogsCtrl',
					templateUrl : 'views/dialogs/mdesettings.html',
					parent : angular.element(document.body),
					clickOutsideToClose : true,
					fullscreen: true,
					locals : {
						mdeModel : model,
						style : {
							pages : [ 'text','background' ]
						}
					}
				});
			}

			scope.add = addFeature;
			scope.remove = removeFeature;
			scope.edit = editFeature;
			scope.removeWidget = removeWidget;
			scope.settings = settings;
			// $scope.update();
			// $scope.$watch('mdeModel', function() {
			// $scope.update();
			// });
		}
	};
});

'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc directive
 * @name donateMainApp.directive:MdeHtml
 * @description # MdeHtml
 */
    .directive('mdeHtml', function () {
        return {
            templateUrl: 'views/directives/mdehtml.html',
            restrict: 'E',
            replase: true,
            scope: {
                mdeEditable: '=?',
                mdeModel: '=?',
                mdeParent: '=?'
            },
            link: function (scope, elem, attrs) {
                scope.$watch('mdeModel.style.flexAlignItem', function (newValue, oldValue) {
                    elem.removeClass(oldValue);
                    elem.addClass(newValue);
                });
                scope.$watch('mdeModel.style.flexItemGrow', function (newValue, oldValue) {
                    elem.css('flex-grow', newValue);
                });
            },
            controller: function ($scope, $element, $mdDialog) {
                var scope = $scope;
                var model = $scope.mdeModel;
                var parentModel = $scope.mdeParent;


                function removeWidget() {
                    if (scope.mdeParent) {
                        scope.mdeParent.removeWidget(scope.mdeModel);
                    }
                }

                function settings() {
                    return $mdDialog.show({
                        controller: 'SettingDialogsCtrl',
                        templateUrl: 'views/dialogs/mdesettings.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        fullscreen: true,
                        locals: {
                            mdeModel: model,
                            mdeParent: parentModel,
                            style: {
                                pages: ['text', 'selfLayout','border', 'background', 'marginPadding','minMaxSize']
                            }
                        }
                    });
                }

                scope.removeWidget = removeWidget;
                scope.settings = settings;
            }
        };
    });

/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')


/**
 * @ngdoc directive
 * @name ngMaterialWeburger.directive:mdeIconfontChoise
 * @description # mdeIconfontChoise
 */
.directive(
		'mdeIconfontChoise',
		function() {
			return {
				restrict : 'E',
				replace : 'true',
				templateUrl : 'views/directives/mdeiconfontchoise.html',
				require : '^mdeModel',
				scope : {
					mdeModel : '=',
					mdeFontSet : '@?',
					mdeListUrl : '@?'
				},
				controller : function($scope, $http, $q, $timeout, $log) {
					var self = $scope;
					self.mdeList = [];
					/**
					 * Search for icon... use $timeout to simulate remote
					 * dataservice call.
					 */
					function querySearch(query) {
						var deferred = $q.defer();
						$timeout(function() {
							var results = query ? self.mdeList
									.filter(createFilterFor(query))
									: self.mdeList;
							deferred.resolve(results);
						}, Math.random() * 100, false);
						return deferred.promise;
					}

					function searchTextChange(text) {
						$log.info('Text changed to ' + text);
					}

					function selectedItemChange(item) {
						$log.info('Item changed to ' + JSON.stringify(item));
						$scope.mdeModel = item;
					}
					
					/**
					 * Build `states` list of key/value pairs
					 */
					function loadAll() {
						$scope.state = 'loading';
						return $http.get($scope.mdeListUrl).then(function(res) {
							$scope.mdeList = res.data;
							$scope.state = 'normal';
						});
					}
					/**
					 * Create filter function for a query string
					 */
					function createFilterFor(query) {
						var lowercaseQuery = angular.lowercase(query);
						return function filterFn(state) {
							return (state.indexOf(lowercaseQuery) === 0);
						};
					}

					// list of `state` value/display objects
					loadAll();
					self.querySearch = querySearch;
					self.selectedItemChange = selectedItemChange;
					self.searchTextChange = searchTextChange;
				}
			};
		});

/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')
/**
 * @ngdoc directive
 * @name donateMainApp.directive:mdeLinkList
 * @description # mdeLinkList
 */
.directive('mdeLinkList', function() {
	return {
		restrict : 'E',
		replace : 'true',
		templateUrl : 'views/directives/mdelinklist.html',
		require : '^mdeModel',
		scope : {
			mdeEditable : '=?',
			mdeModel : '=?'
		},
	};
});

/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')
/**
 * @ngdoc directive
 * @name donateMainApp.directive:mdeNotfoundElement
 * @description # mdeNotfoundElement
 */
.directive('mdeNotfoundElement', function() {
	return {
		templateUrl : 'views/directives/mdenotfoundelement.html',
		restrict : 'E',
		link : function postLink(/* scope, element, attrs */) {
//			element.text('this is the mdeNotfoundElement directive');
		}
	};
});

/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc directive
 * @name donateMainApp.directive:mdeSocialList
 * @description فهرستی از شبکه‌های اجتمائی
 * 
 * یک فهرست از شبکه‌های اجتمائی نمایش داده می‌شود تا بتونیم به سادگی لیک
 * شبکه‌های رو بین کاربران به اشتراک بزاریم.
 */
.directive('mdeSocialList', function() {
	return {
		restrict : 'E',
		replace : true,
		templateUrl : 'views/directives/mdesociallist.html',
		scope : {
			mdeEditable: '=?',
			mdeModel: '=?',
			mdeParent: '=?'
		},
		controller : function($scope, $mdDialog, $act) {

			var scope = $scope;
		    var originatorEv;
			
			/**
			 * یک شبکه اجتمائی جدید به فهرست اضافه می‌کند
			 * 
			 * برای این کار یک درچه محاوره‌ای باز می‌شود و اطلاعات مورد نیاز از
			 * کاربر دریافت می‌شود.
			 */
			function addSocial(){
				return editSocial({}).then(function(model) {
					if (!scope.mdeModel.socials) {
						scope.mdeModel.socials = [];
					}
					scope.mdeModel.socials.push(model);
					return model;
				});
			}
			
			/**
			 * شبکه اجتمائی تعیین شده ویرایش می‌شود
			 * 
			 * شبکه اجمائی با یک دریچه محاوره‌ای به کاربر نمایش داده می‌شود تا
			 * اطلاعات جدید را در آن وارد کند. تغییرات بعد از تایید کاربر اعمال
			 * خواهد شد.
			 */
			function editSocial(social){
				return $mdDialog.show({
					controller : 'DialogsCtrl',
					templateUrl : 'views/dialogs/mdesocial.html',
					parent : angular.element(document.body),
					clickOutsideToClose : true,
					locals : {
						mdeModel : social,
						style : {
							title : 'social'
						}
					}
				});
			}
			
			/**
			 * شبکه تعیین شده حذف خواهد شد.
			 * 
			 */
			function removeSocial(social) {
				var index = scope.mdeModel.socials.indexOf(social);
				if (index > -1) {
					scope.mdeModel.socials.splice(social, 1);
				}
			}
			
			/**
			 * عمل لود کردن شبکه اجتمائی
			 * 
			 * این فراخوانی عمل تعیین شده برای شبکه اجتمائی را اجرا می‌کند.
			 */
			function gotoSocial(social){
				if(scope.mdeEditable){
					return editSocial(social);
				}
				$act.execute(social.action);
			}
			
			function removeWidget() {
				if (scope.mdeParent) {
					scope.mdeParent.removeWidget(scope.mdeModel);
				}
			}
			
			function openMenu($mdOpenMenu, ev) {
				originatorEv = ev;
				$mdOpenMenu(ev);
			}
			
			function settings (){
				return $mdDialog.show({
					controller : 'DialogsCtrl',
					templateUrl : 'views/dialogs/mdesettings.html',
					parent : angular.element(document.body),
					clickOutsideToClose : true,
					locals : {
						mdeModel : scope.mdeModel,
						style : {
							pages : ['general', 'background']
						}
					}
				});
			}
			// مقداردهی اسکوپ
			scope.add = addSocial;
			scope.edit = editSocial;
			scope.delete = removeSocial;
			scope.gotoSocial = gotoSocial;
			scope.removeWidget = removeWidget;
			
			scope.settings = settings;
			scope.openMenu = openMenu;
			
		}
	};
});

/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc filter
 * @name digidociMainApp.filter:unsafe
 * @function
 * @description # unsafe Filter in the digidociMainApp.
 */
.filter('unsafe', function($sce) {
	return function(val) {
		return $sce.trustAsHtml(val);
	};
});

///* jslint todo: true */
///* jslint xxx: true */
///* jshint -W100 */
//'use strict';
//
//angular.module('ngMaterialWeburger')
//
///**
// * 
// */
//.run(function(editableOptions, editableThemes) {
//	editableThemes['angular-material'] = {
//			formTpl:      '<form class="editable-wrap"></form>',
//			noformTpl:    '<span class="editable-wrap"></span>',
//			controlsTpl:  '<md-input-container class="editable-controls" ng-class="{\'md-input-invalid\': $error}"></md-input-container>',
//			inputTpl:     '',
//			errorTpl:     '<div ng-messages="{message: $error}"><div class="editable-error" ng-message="message">{{$error}}</div></div>',
//			buttonsTpl:   '<span class="editable-buttons"></span>',
//			submitTpl:    '<md-button type="submit" class="md-primary">save</md-button>',
//			cancelTpl:    '<md-button type="button" class="md-warn" ng-click="$form.$cancel()">cancel</md-button>'
//	};
//
//	editableOptions.theme = 'angular-material';
//});
/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
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
.service('$settings', function() {

	var settingPages = {
		notFound : {
			label : 'Settings not found',
			page : 'views/settings/notfound.html'
		},
		general : {
			label : 'general',
			page : 'views/settings/general.html'
		},
		background : {
			label : 'background',
			page : 'views/settings/background.html'
		},
		text : {
			label : 'Frontend text',
			page : 'views/settings/text.html'
		},
		description : {
			label : 'Description',
			page : 'views/settings/description.html'
		},
		layout : {
			label : 'Layout',
			page : 'views/settings/layout.html'
		},
		border : {
			label : 'Border',
			page : 'views/settings/border.html'
		},
		pageLayout : {
			label : 'Page Layout',
			page : 'views/settings/page-layout.html'
		},
		selfLayout : {
			label : 'Self Layout',
			page : 'views/settings/self-layout.html'
		},
		marginPadding : {
			label: 'Margin/Padding',
			page: 'views/settings/margin-padding.html'
		},
		minMaxSize: {
			label : 'Min/Max',
			page : 'views/settings/min-max-size.html'
		}
	};

	/**
	 * توصیف ویجت معادل با مدل داده‌ای را تعیین می‌کند
	 * 
	 * این کار بر اساس خصوصیت نوع در مدل داده‌ای تعیین می‌شود و در صورتیکه ویجتی
	 * برای آو موجود نباشد، ویجت پیشفرض به عنوان نتیجه برگردانده می‌وشد.
	 * 
	 * @param model
	 * @returns
	 */
	function page(settingId) {
		var widget = settingPages.notFound;
		if (settingId in settingPages) {
			widget = settingPages[settingId];
		}
		return widget;
	}

	/**
	 * فهرست تمام ویجت‌ها را تعیین می‌کند.
	 * 
	 * @returns
	 */
	function addPage(settingId, page) {
		settingPages[settingId] = page;
	}
	// تعیین سرویس‌ها
	this.page = page;
	this.newPage = addPage;
});

/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
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
.service('$widget', function($q, $timeout, PaginatorPage) {

	var contentElementAsso = {
		Page : {
			dom : '<mde-content></mde-content>',
			label : 'Panel',
			description : 'Panel contains list of widgets.',
			image : 'images/mde/mdecontent.svg',
			link : 'http://dpq.co.ir/more-information-link',
			data : {
				type : 'Page',
				style : {
					direction : 'column',
				},
				contents : []
			}
		},
		BrandAction : {
			dom : '<mde-brand-action></mde-brand-action>',
			label : 'Brand with action',
			description : 'A brand image with action list',
			image : 'images/mde/mdebrandaction.svg',
			link : 'http://dpq.co.ir',
			data : {
				type : 'BrandAction',
				style : {},
			}
		},
		Copyright : {
			dom : '<mde-copyright></mde-copyright>',
			label : 'Copyright',
			description : 'Copyright text',
			image : 'images/mde/mdecopyright.svg',
			link : 'http://dpq.co.ir',
			data : {
				type : 'Copyright',
				title : 'copyright example',
				text : 'This is a simple copy right text.',
				style : {
					width : '100%',
					color : '#000000',
					backgroundColor : '#00000000'
				}
			}
		},
		FeatureList : {
			dom : '<mde-feature-list></mde-feature-list>',
			label : 'Features list',
			description : 'List of features',
			image : 'images/mde/mdefeaturelist.svg',
			link : 'http://dpq.co.ir',
			data : {
				type : 'FeatureList',
				style : {},
			}
		},
		SocialList : {
			dom : '<mde-social-list></mde-social-list>',
			label : 'Socials link',
			description : 'Social link list',
			image : 'images/mde/mdesociallist.svg',
			link : 'http://dpq.co.ir',
			data : {
				type : 'SocialList',
				style : {},
			}
		},
		LinkList : {
			dom : '<mde-link-list></mde-link-list>',
			label : 'Link list',
			description : 'List of links and ticktes',
			image : 'images/mde/mdelinklist.svg',
			link : 'link',
			data : {
				type : 'LinkList',
				style : {},
			}
		},
		NotfoundElement : {
			dom : '<mde-notfound-element></mde-notfound-element>',
			label : 'Not found',
			image : 'images/mde/mdenotfoundelement.svg',
			link : 'link',
		},
		HtmlText : {
			dom : '<mde-html ng-class="[mdeModel.style.flexAlignItem]" ></mde-html>',
			label : 'HTML text',
			description : 'An HTML block text.',
			image : 'images/mde/mdehtml.svg',
			link : 'http://dpq.co.ir',
			data : {
				type : 'HtmlText',
				body : '<h2>HTML Text</h2><p>Insert HTML text heare</p>',
				style : {
					marginLeft:1,marginRight:1,marginTop:1,marginBottom:1,
					paddingLeft:1,paddingRight:1,paddingTop:1,paddingBottom:1,
					minWidth:0,maxWidth:0,minHeight:0,maxHeight:0}
			}
		},
		CollapsibleItemList : {
			dom : '<mde-collapsible-item-list></mde-collapsible-item-list>',
			label : 'Collapsible item list',
			description : 'List of item with a collapsiblity',
			image : 'images/mde/mdenotfoundelement.svg',
			link : 'http://dpq.co.ir',
			data : {
				type : 'CollapsibleItemList',
				style : {},
			}
		}
	};

	/**
	 * توصیف ویجت معادل با مدل داده‌ای را تعیین می‌کند
	 * 
	 * این کار بر اساس خصوصیت نوع در مدل داده‌ای تعیین می‌شود و در صورتیکه ویجتی
	 * برای آو موجود نباشد، ویجت پیشفرض به عنوان نتیجه برگردانده می‌وشد.
	 * 
	 * @param model
	 * @returns
	 */
	function widget(model) {
		var deferred = $q.defer();
		$timeout(function() {
			var widget = contentElementAsso.mdeNotfoundElement;
			if (model.type in contentElementAsso) {
				widget = contentElementAsso[model.type];
			}
			deferred.resolve(widget);
		}, 1);
		return deferred.promise;
	}

	/**
	 * فهرست تمام ویجت‌ها را تعیین می‌کند.
	 * 
	 * @returns
	 */
	function widgets() {
		var deferred = $q.defer();
		$timeout(function() {
			var widgets = new PaginatorPage({});
			// XXX: maso, 1395: تعیین خصوصیت‌ها به صورت دستی است
			widgets.items = [];
			widgets.items.push(contentElementAsso.Page);
			widgets.items.push(contentElementAsso.BrandAction);
			widgets.items.push(contentElementAsso.Copyright);
			widgets.items.push(contentElementAsso.FeatureList);
			widgets.items.push(contentElementAsso.SocialList);
			widgets.items.push(contentElementAsso.LinkList);
			widgets.items.push(contentElementAsso.HtmlText);
//			widgets.items.push(contentElementAsso.CollapsibleItemList);
			deferred.resolve(widgets);
		}, 1);
		return deferred.promise;
	}
	// تعیین سرویس‌ها
	this.widget = widget;
	this.widgets = widgets;
});

angular.module('ngMaterialWeburger').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/dialogs/mdeaction.html',
    "<md-dialog ng-controller=ActionCtrl aria-label=\"edit action dialog\" ng-cloak>  <md-toolbar> <div class=md-toolbar-tools> <h2 translate>Action</h2> <span flex></span> <md-button class=md-icon-button ng-click=answer(mdeModel)> <md-icon aria-label=\"Close dialog\">done</md-icon> </md-button> <md-button class=md-icon-button ng-click=cancel()> <md-icon aria-label=\"Close dialog\">close</md-icon> </md-button> </div> </md-toolbar>    <md-dialog-content> <div layout=column class=md-dialog-content> <mde-iconfont-choise mde-model=model.icon mde-list-url=styles/fonts/codepoints.json mde-font-set=material-icons> </mde-iconfont-choise> <md-input-container> <label translate>Label</label> <input ng-model=mdeModel.label> </md-input-container> <md-input-container> <label translate>Text</label> <input ng-model=mdeModel.text> </md-input-container>  <md-input-container> <label>Module type</label> <md-select ng-model=mdeModel.type> <md-option ng-repeat=\"type in types\" value={{type.key}}> <md-icon>{{type.icon}}</md-icon> {{type.label}} </md-option> </md-select> </md-input-container> <md-input-container> <label translate>Value</label> <input ng-model=mdeModel.value> </md-input-container> <md-checkbox ng-model=mdeModel.primary aria-label=primary> Primary action </md-checkbox> <md-checkbox ng-model=mdeModel.accent aria-label=accent> Accent action </md-checkbox> </div> </md-dialog-content> </md-dialog>"
  );


  $templateCache.put('views/dialogs/mdealert.html',
    "<md-dialog ng-cloak> <md-toolbar> <div class=md-toolbar-tools> <md-icon ng-if=style.icon>{{mdeModel.style.icon}}</md-icon> <h2 translate>{{mdeModel.title}}</h2> <span flex></span> <md-button class=md-icon-button ng-click=cancel()> <md-icon aria-label=\"Close dialog\">close</md-icon> </md-button> </div> </md-toolbar> <md-dialog-content ng-style=\"{\n" +
    "      'direction' : style.direction,\n" +
    "      'text-align': style.textAlign\n" +
    "    }\"> <div class=md-dialog-content> <md-dialog-content translate>{{mdeModel.text}}</md-dialog-content> </div> <div layout=row> <md-button ng-click=cancel()> {{mdeModel.label | translate}} </md-button> </div> </md-dialog-content> </md-dialog>"
  );


  $templateCache.put('views/dialogs/mdedirectivesettings.html',
    "<md-dialog ng-cloak>  <md-toolbar> <div class=md-toolbar-tools> <md-icon ng-if=style.icon>{{style.icon}}</md-icon> <h2 translate>{{mdeModel.title}}</h2> <span flex></span> <md-button class=md-icon-button ng-click=cancel()> <md-icon aria-label=\"Close dialog\">close</md-icon> </md-button> </div> </md-toolbar>  <md-dialog-content>  <md-tabs md-dynamic-height md-border-bottom> <md-tab label=Context> <md-content layout=column layout-padding> <md-input-container> <label translate>title</label> <input ng-model=model.title> </md-input-container> <md-input-container> <label translate>text</label> <input ng-model=model.text> </md-input-container> </md-content> </md-tab> <md-tab label=Style> <md-content layout=column layout-padding> <md-color-picker label=\"Background color\" icon=brush ng-model=model.style.backgroundColor> </md-color-picker> <md-color-picker label=Color icon=brush ng-model=model.style.color> </md-color-picker> <md-input-container> <label translate>Font</label> <input ng-model=model.style.font> </md-input-container> <md-input-container> <label translate>Padding</label> <input ng-model=model.style.padding> </md-input-container> <md-input-container> <label translate>Width</label> <input ng-model=model.style.width> </md-input-container> <md-input-container> <label translate>Height</label> <input ng-model=model.style.height> </md-input-container> <md-checkbox ng-model=model.style.rtl aria-label=\"Right to left\"> Right to left </md-checkbox> </md-content> </md-tab> </md-tabs> </md-dialog-content> </md-dialog>"
  );


  $templateCache.put('views/dialogs/mdelogin.html',
    " <md-dialog aria-label=\"Submit for DigiDoci News\" ng-cloak> <form ng-submit=answer(credentioal)> <md-toolbar> <div class=md-toolbar-tools> <h2 translate>user login</h2> <span flex></span> <md-button class=md-icon-button ng-click=cancel()> <md-icon aria-label=\"Close dialog\">close</md-icon> </md-button> </div> </md-toolbar> <md-dialog-content> <div class=md-dialog-content layout=column>  <md-input-container> <label translate>user name</label> <input ng-model=credentioal.login> </md-input-container> <md-input-container> <label translate>password</label> <input type=password ng-model=credentioal.password> </md-input-container> <input type=submit hidden> <div layout=row> <md-button ng-click=answer(credentioal) class=\"md-raised md-primary\"> {{ 'ok' | translate }} </md-button> <md-button ng-click=cancel()> {{ 'cancel' | translate }} </md-button> </div> </div> </md-dialog-content> </form> </md-dialog>"
  );


  $templateCache.put('views/dialogs/mdeselectcontent.html',
    " <md-dialog aria-label=\"Select media\" ng-controller=MdeCmsCtrl ng-cloak> <form ng-submit=answer(content)>  <md-toolbar> <div class=md-toolbar-tools> <h2 translate>Media select</h2> <span flex></span> <md-button class=md-icon-button ng-click=answer(content)> <md-icon aria-label=\"Close dialog\">done</md-icon> </md-button> <md-button class=md-icon-button ng-click=cancel()> <md-icon aria-label=\"Close dialog\">close</md-icon> </md-button> </div> </md-toolbar> <md-dialog-content> <div class=md-dialog-content layout=column>  <div ng-include=\"'views/partials/mdecontentexplorer.html'\"></div> </div> </md-dialog-content> </form> </md-dialog>"
  );


  $templateCache.put('views/dialogs/mdeselectwidget.html',
    "<md-dialog aria-label=\"edit action dialog\" ng-controller=ContentSelectCtrl ng-cloak>  <md-toolbar> <div class=md-toolbar-tools> <h2 translate>Widget list</h2> <span flex></span> <md-button class=md-icon-button ng-click=cancel()> <md-icon aria-label=\"Close dialog\">close</md-icon> </md-button> </div> </md-toolbar>    <md-dialog-content> <md-content class=\"md-padding md-dialog-content\" layout-xs=column layout=row layout-wrap>    <md-card ng-repeat=\"widget in widgets.items\" flex-xs flex-gt-xs=45 md-theme-watch> <md-card-title> <md-card-title-text> <span class=md-headline>{{widget.label}}</span> <span class=md-subhead>{{widget.description}}</span> </md-card-title-text> <md-card-title-media> <img src=\"{{widget.image}}\"> </md-card-title-media> </md-card-title> <md-card-actions layout=row layout-align=\"end center\"> <md-button ng-click=answerWidget(widget)> <md-icon>add</md-icon> {{ 'Add' | translate }} </md-button>  </md-card-actions> </md-card> </md-content> </md-dialog-content> </md-dialog>"
  );


  $templateCache.put('views/dialogs/mdesettings.html',
    " <md-dialog ng-controller=SettingsCtrl aria-label=\"Setting dialog\" ng-cloak> <md-toolbar> <div class=md-toolbar-tools> <h2 translate>Settings</h2> <span flex></span> <md-button class=md-icon-button ng-click=answer()> <md-icon aria-label=\"Close dialog\">close</md-icon> </md-button> </div> </md-toolbar> <md-dialog-content> <md-content class=md-dialog-content> <md-tabs md-dynamic-height md-border-bottom> <md-tab ng-repeat=\"setting in settings\" label=\"{{setting.label | translate}}\"> <md-content layout=row flex ng-include=setting.page class=md-padding> </md-content> </md-tab> </md-tabs> </md-content> </md-dialog-content> </md-dialog>"
  );


  $templateCache.put('views/dialogs/mdesocial.html',
    "<md-dialog aria-label=\"edit action dialog\" ng-cloak> <form ng-submit=answer(mdeModel)>  <md-toolbar> <div class=md-toolbar-tools> <h2 translate>Social</h2> <span flex></span> <md-button class=md-icon-button ng-click=cancel()> <md-icon aria-label=\"Close dialog\">close</md-icon> </md-button> </div> </md-toolbar>    <md-dialog-content> <div ng-controller=ActionCtrl layout=column class=md-dialog-content> <mde-iconfont-choise mde-model=mdeModel.icon mde-list-url=styles/fonts/social-codepoints.json mde-font-set=mono-social-icons> </mde-iconfont-choise>              <md-input-container> <label translate>Link</label> <input ng-model=mdeModel.action.value> </md-input-container> </div> </md-dialog-content> <input type=submit hidden> </form> </md-dialog>"
  );


  $templateCache.put('views/dialogs/mdesubmit.html',
    " <md-dialog ng-class=\"{'mde-rtl':mdeModel.style.rtl}\" aria-label=\"Submit for Donate News\" ng-cloak> <form ng-submit=answer(address)> <md-toolbar> <div class=md-toolbar-tools>  <img src=images/logo.svg width=64> <h2>{{mdeModel.title}}</h2> <span flex></span> <md-button class=md-icon-button ng-click=cancel()> <md-icon aria-label=\"Close dialog\">close</md-icon> </md-button> </div> </md-toolbar> <md-dialog-content> <div class=md-dialog-content layout=column>  <p>{{mdeModel.message}}</p>  <md-input-container> <label translate>email</label> <input ng-model=address> </md-input-container> <div layout=row> <md-button class=\"md-raised md-primary\" ng-click=answer(address)> {{'submit'|translate}} </md-button> <md-button ng-click=cancel()> {{'cancel'|translate}} </md-button> </div> </div> </md-dialog-content> </form> </md-dialog>"
  );


  $templateCache.put('views/dialogs/mdeticket.html',
    "<md-dialog aria-label=\"edit action dialog\" ng-cloak> <form ng-submit=answer(mdeModel)>  <md-toolbar> <div class=md-toolbar-tools> <h2 translate>Ticket</h2> <span flex></span> <md-button class=md-icon-button ng-click=answer(mdeModel)> <md-icon aria-label=\"Close dialog\">done</md-icon> </md-button> <md-button class=md-icon-button ng-click=cancel()> <md-icon aria-label=\"Close dialog\">close</md-icon> </md-button> </div> </md-toolbar>  <md-dialog-content> <div layout=column class=md-dialog-content> <mde-iconfont-choise mde-model=mdeModel.icon mde-list-url=styles/fonts/codepoints.json mde-font-set=material-icons> </mde-iconfont-choise> <md-input-container> <label translate>Title</label> <input ng-model=mdeModel.title> </md-input-container> <md-wysiwyg textarea-id=question textarea-class=form-control textarea-height=100px textarea-name=textareaQuestion textarea-required ng-model=mdeModel.text enable-bootstrap-title=true textarea-menu=yourModel.customMenu></md-wysiwyg> </div> </md-dialog-content> <input type=submit hidden> </form> </md-dialog>"
  );


  $templateCache.put('views/directives/mdebrandaction.html',
    "<div ng-class=\"{'mde-widget': mdeEditable, 'fill':mdeModel.style.fill}\">  <div ng-show=mdeEditable layout=row class=mde-widget-header ng-include=\"'views/partials/mdewidgetheaderactions.html'\"> </div> <div ng-show=mdeModel ng-style=\"{ 'background-image': 'url('+mdeModel.style.backgroundImage+')', 'background-size': mdeModel.style.backgroundSize, 'color': mdeModel.style.color, 'width': mdeModel.style.width, 'height': mdeModel.style.height}\" layout=column layout-align=\"space-between center\"> <div ng-style=\"{'width': '100%'}\" layout=column layout-align=\"center center\"> <h1 class=md-display-3 ng-style=\"{'color': mdeModel.style.color}\" ng-class=\"{'mde-rtl':mdeModel.style.rtl}\">{{ mdeModel.title }}</h1> <div ng-style=\"{'color': mdeModel.style.color}\" ng-class=\"{'mde-rtl':mdeModel.style.rtl}\" ng-bind-html=\"mdeModel.text | unsafe\" hide show-gt-xs></div> <div layout=column layout-gt-xs=row layout-align-gt-xs=\"center center\"> <md-button ng-if=!mdeEditable ng-repeat=\"action in mdeModel.actions\" ng-style=\"{'color': mdeModel.style.color, 'font-size': '20px'}\" class=md-raised ng-class=\"{'md-primary': action.primary, 'md-accent': action.accent}\" ng-click=runAction(action)>{{ action.label }} </md-button> <md-menu ng-if=mdeEditable ng-repeat=\"action in mdeModel.actions\"> <md-button ng-class=\"{'md-primary': action.primary, 'md-accent': action.accent}\" class=md-raised aria-label=\"Open phone interactions menu\" ng-click=\"openMenu($mdOpenMenu, $event)\"> <md-icon ng-style=\"{ 'color': mdeModel.style.color }\" class=md-48 md-font-set=social> {{action.icon}} </md-icon> {{ action.label }} </md-button> <md-menu-content width=4> <md-menu-item> <md-button ng-click=\"edit(action, $event)\"> <md-icon>edit</md-icon> {{ 'Edit' | translate }} </md-button> </md-menu-item> <md-menu-item> <md-button ng-click=\"remove(action, $event)\"> <md-icon>delete</md-icon> {{ 'Delete' | translate }} </md-button> </md-menu-item> </md-menu-content> </md-menu> <md-button ng-if=mdeEditable ng-click=add()> <md-icon>add</md-icon> </md-button> </div> </div> </div> </div>"
  );


  $templateCache.put('views/directives/mdecollapsibleitemlist.html',
    "<div ng-class=\"{'mde-widget': mdeEditable, 'fill':mdeModel.style.fill}\">  <div ng-show=mdeEditable layout=row class=mde-widget-header ng-include=\"'views/partials/mdewidgetheaderactions.html'\"> </div> <div ng-style=\"{'background-color': mdeModel.style.backgroundColor,\n" +
    "    'color': mdeModel.style.color,\n" +
    "    'width': mdeModel.style.width,\n" +
    "    'height': mdeModel.style.height}\" ng-html-bind=mdeModel.body|unsafe ng-class=\"{'mde-rtl':mdeModel.style.rtl}\"> <ul> <li ng-repeat=\"item in mdeModel.list\"> <md-icon>{{item.icon}}</md-icon> {{item.title}} <p ng-bind-html=\"item.text | unsafe\"></p> </li> </ul> </div> </div>"
  );


  $templateCache.put('views/directives/mdecontent.html',
    "<div ng-class=\"{'mde-panel': mdeEditable}\">  <div ng-show=mdeEditable class=mde-panel-header layout=row> <span translate> Panel</span> <span flex></span> <md-button ng-click=newWidget(mdeModel) class=\"md-icon-button md-mini\"> <md-icon class=mde-icon-mini>add_circle</md-icon> </md-button> <md-button ng-click=settings() class=\"md-icon-button md-mini\"> <md-icon class=mde-icon-mini>settings</md-icon> </md-button> <md-button class=\"md-icon-button md-mini\" ng-mouseenter=\"hoveringDelBtn=true\" ng-mouseleave=\"hoveringDelBtn=false\" ng-click=removeWidget(mdeModel) ng-show=mdeParent> <md-icon class=mde-icon-mini>delete</md-icon> </md-button> </div>  <div class=mde-panel-body id=mde-content-body> <div ng-show=hoveringDelBtn class=overlay></div>  <div class=flex ng-class=\"[mdeModel.style.flexDirection,mdeModel.style.justifyContent, mdeModel.style.alignItems]\" id=mde-content-placeholder ng-style=\"{ 'background': mdeModel.style.background,'border-radius': mdeModel.style.borderRadius, 'border': mdeModel.style.border }\"> </div>  </div> </div>"
  );


  $templateCache.put('views/directives/mdecopyright.html',
    "<div ng-class=\"{'mde-widget': mdeEditable, 'fill':mdeModel.style.fill}\">  <div ng-show=mdeEditable layout=row class=mde-widget-header ng-include=\"'views/partials/mdewidgetheaderactions.html'\"> </div> <div layout=column layout-align=\"start center\" ng-style=\"{ 'color': mdeModel.style.color, 'background-color': mdeModel.style.backgroundColor,\n" +
    "      'width': mdeModel.style.width, 'font-family': mdeModel.style.font, 'padding': mdeModel.style.padding }\"> <div ng-style=\"{'width': '80%', 'margin-top': '3em', 'border-bottom': '1px solid #fff' }\"> </div> <div layout=column layout-align=\"start center\" ng-class=\"{'mde-rtl':mdeModel.style.rtl}\"> <h3>{{mdeModel.title}}</h3> <div ng-bind-html=mdeModel.text|unsafe></div> </div> </div> </div>"
  );


  $templateCache.put('views/directives/mdefeaturelist.html',
    "<div ng-class=\"{'mde-widget': mdeEditable, 'fill':mdeModel.style.fill}\">  <div ng-show=mdeEditable layout=row class=mde-widget-header ng-include=\"'views/partials/mdewidgetheaderactions.html'\"> </div> <div ng-style=\"{ 'background': mdeModel.style.background,'border-radius': mdeModel.style.borderRadius, 'border': mdeModel.style.border }\" layout=column>  <h1 style=\"text-align: center\">{{mdeModel.title}}</h1> <div ng-style=\"{'width': '100%'}\" ng-bind-html=\"mdeModel.text | unsafe\"> </div> <div ng-class=\"{'mde-rtl':mdeModel.style.rtl}\" layout=column layout-align=\"center center\" layout-gt-sm=row layout-align-gt-sm=\"space-around center\" ng-style=\"{'width': '100%'}\"> <div layout=column flex=100 flex-gt-sm=none layout-align=\"center center\" layout-padding ng-repeat=\"feature in mdeModel.features\"> <md-icon ng-style=\"{ 'font-size': '64px', 'color': mdeModel.style.color}\">{{feature.icon}}</md-icon> <h3 ng-style=\"{'color': mdeModel.style.color}\" ng-class=\"{'mde-rtl':mdeModel.style.rtl}\"> {{feature.title}} <div ng-if=mdeEditable> <md-button class=md-icon-button ng-click=edit(feature)> <md-icon ng-style=\"{ 'color': mdeModel.style.color }\">edit</md-icon> </md-button> <md-button class=md-icon-button ng-click=remove(feature)> <md-icon ng-style=\"{ 'color': mdeModel.style.color }\">delete</md-icon> </md-button> </div> </h3> <div ng-style=\"{'color': mdeModel.style.color}\" ng-class=\"{'mde-rtl':mdeModel.style.rtl}\" ng-bind-html=\"feature.text | unsafe\"></div> </div> </div> </div> </div>"
  );


  $templateCache.put('views/directives/mdehtml.html',
    "<div ng-class=\"{'mde-widget': mdeEditable, 'fill':mdeModel.style.fill}\">  <div ng-show=mdeEditable layout=row class=mde-widget-header ng-include=\"'views/partials/mdewidgetheaderactions.html'\"> </div>  <div ng-bind-html=\"mdeModel.text | unsafe\" ng-style=\"{\n" +
    "            'margin-left':mdeModel.style.marginLeft,\n" +
    "            'margin-right':mdeModel.style.marginRight,\n" +
    "            'margin-top':mdeModel.style.marginTop,\n" +
    "            'margin-bottom':mdeModel.style.marginBottom,\n" +
    "\n" +
    "            'padding-left':mdeModel.style.paddingLeft,\n" +
    "            'padding-right':mdeModel.style.paddingRight,\n" +
    "            'padding-top':mdeModel.style.paddingTop,\n" +
    "            'padding-bottom':mdeModel.style.paddingBottom,\n" +
    "\n" +
    "            'background-color': mdeModel.style.backgroundColor,\n" +
    "            'color': mdeModel.style.color,\n" +
    "\n" +
    "            'min-width':mdeModel.style.minWidth,\n" +
    "            'min-height':mdeModel.style.minHeight,\n" +
    "            'max-width':(mdeModel.style.maxWidth==0) ? 'none' : mdeModel.style.maxWidth,\n" +
    "            'max-height':(mdeModel.style.maxHeight==0)?'none':mdeModel.style.maxHeight,\n" +
    "\n" +
    "            'border-top-left-radius':(mdeModel.style.borderRadius.uniform) ? mdeModel.style.borderRadius.all : mdeModel.style.borderRadius.topLeft,\n" +
    "            'border-top-right-radius':(mdeModel.style.borderRadius.uniform) ? mdeModel.style.borderRadius.all : mdeModel.style.borderRadius.topRight,\n" +
    "            'border-bottom-left-radius':(mdeModel.style.borderRadius.uniform) ? mdeModel.style.borderRadius.all : mdeModel.style.borderRadius.bottomLeft,\n" +
    "            'border-bottom-right-radius':(mdeModel.style.borderRadius.uniform) ? mdeModel.style.borderRadius.all : mdeModel.style.borderRadius.bottomRight,\n" +
    "\n" +
    "            'border-left-style':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderStyle.all : mdeModel.style.borderStyle.left,\n" +
    "            'border-right-style':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderStyle.all : mdeModel.style.borderStyle.right,\n" +
    "            'border-top-style':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderStyle.all : mdeModel.style.borderStyle.top,\n" +
    "            'border-bottom-style':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderStyle.all : mdeModel.style.borderStyle.bottom,\n" +
    "\n" +
    "            'border-left-width':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderWidth.all : mdeModel.style.borderWidth.left,\n" +
    "            'border-right-width':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderWidth.all : mdeModel.style.borderWidth.right,\n" +
    "            'border-top-width':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderWidth.all : mdeModel.style.borderWidth.top,\n" +
    "            'border-bottom-width':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderWidth.all : mdeModel.style.borderWidth.bottom,\n" +
    "\n" +
    "            'border-left-color':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderColor.all : mdeModel.style.borderColor.left,\n" +
    "            'border-right-color':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderColor.all : mdeModel.style.borderColor.right,\n" +
    "            'border-top-color':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderColor.all : mdeModel.style.borderColor.top,\n" +
    "            'border-bottom-color':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderColor.all : mdeModel.style.borderColor.bottom,\n" +
    "            }\"> </div> </div>"
  );


  $templateCache.put('views/directives/mdeiconfontchoise.html',
    "<div> <md-autocomplete ng-disabled=false md-no-cache=false md-selected-item=mdeModel md-search-text-change=searchTextChange(searchText) md-search-text=searchText md-selected-item-change=selectedItemChange(item) md-items=\"item in querySearch(searchText)\" md-item-text=item md-min-length=0 placeholder=\"What is your iconfont symbol?\"> <md-item-template> <md-icon md-font-set={{mdeFontSet}}>{{item}}</md-icon> <span md-highlight-text=searchText md-highlight-flags=^i>{{item}}</span> </md-item-template> <md-not-found> No iconfont matching \"{{searchText}}\" were found. </md-not-found> </md-autocomplete> </div>"
  );


  $templateCache.put('views/directives/mdelinklist.html',
    "<div ng-class=\"{'mde-widget': mdeEditable, 'fill':mdeModel.style.fill}\">  <div ng-show=mdeEditable layout=row class=mde-widget-header ng-include=\"'views/partials/mdewidgetheaderactions.html'\"> </div> <div layout=column ng-class=\"{'mde-rtl':mdeModel.style.rtl}\" ng-style=\"{'color': mdeModel.style.color,'background-color': mdeModel.style.backgroundColor,\n" +
    "\t   'width': mdeModel.style.width,'font-family': mdeModel.style.font,'padding': mdeModel.style.padding }\"> <div ng-if=mdeEditable> <md-button aria-label=settings ng-click=settings(mdeModel)> <md-icon ng-style=\"{ 'color': mdeModel.style.color }\">settings</md-icon> </md-button> <md-button ng-if=ngContent aria-label=save ng-click=save()> <md-icon ng-style=\"{ 'color': mdeModel.style.color }\">save</md-icon> </md-button> </div> <div layout-gt-sm=row layout=column layout-padding>  <div layout=column flex=none flex-gt-sm=30> <div ng-repeat=\"link in mdeModel.links\"> <md-button class=md-primary ng-click=runAction(link.action)> <md-icon ng-if=link.action.icon>{{link.action.icon}}</md-icon> {{link.title}} </md-button> <md-button ng-if=mdeEditable class=md-icon-button ng-click=editLink(link)> <md-icon ng-style=\"{ 'color': mdeModel.style.color }\">edit</md-icon> </md-button> <md-button ng-if=mdeEditable class=md-icon-button ng-click=deleteLink(link)> <md-icon ng-style=\"{ 'color': mdeModel.style.color }\">delete</md-icon> </md-button> </div> <div> <md-button ng-if=mdeEditable aria-label=\"add social\" ng-click=addLink(mdeModel)> <md-icon ng-style=\"{ 'color': mdeModel.style.color }\">add</md-icon> </md-button> </div> </div>  <div layout=row flex=none flex-gt-sm=70 layout-wrap layout-padding> <div layout=column layout-align=\"center start\" flex=100 flex-gt-md=50 ng-repeat=\"tile in mdeModel.tiles\"> <h3>{{tile.title}}</h3> <div ng-if=mdeEditable> <md-button class=md-icon-button ng-click=editTicket(tile)> <md-icon ng-style=\"{ 'color': mdeModel.style.color }\">edit</md-icon> </md-button> <md-button class=md-icon-button ng-click=deleteTicket(tile)> <md-icon ng-style=\"{ 'color': mdeModel.style.color }\">delete</md-icon> </md-button> </div> <p class=md-body-1>{{tile.description}}</p> <md-button class=md-primary ng-click=runAction(tile.action)> <md-icon ng-if=tile.action.icon>{{tile.action.icon}}</md-icon> {{tile.action.title}} </md-button> </div> <md-button ng-if=mdeEditable aria-label=\"add social\" ng-click=addTicket(mdeModel)> <md-icon ng-style=\"{ 'color': mdeModel.style.color }\">add</md-icon> </md-button> </div> </div> </div> </div>"
  );


  $templateCache.put('views/directives/mdenotfoundelement.html',
    "<div ng-class=\"{'mde-widget': mdeEditable, 'fill':mdeModel.style.fill}\">  <div ng-show=mdeEditable layout=row class=mde-widget-header ng-include=\"'views/partials/mdewidgetheaderactions.html'\"> </div> <div ng-show=mdeEditable> Unsuported widget?! </div> </div>"
  );


  $templateCache.put('views/directives/mdesociallist.html',
    "<div ng-class=\"{'mde-widget': mdeEditable, 'fill':mdeModel.style.fill}\">  <div ng-show=mdeEditable layout=row class=mde-widget-header ng-include=\"'views/partials/mdewidgetheaderactions.html'\"> </div> <div layout=row layout-align=\"start start\" layout-wrap ng-class=\"{'mde-rtl':mdeModel.style.rtl}\" ng-style=\"{ 'color': mdeModel.style.color, 'background-color': mdeModel.style.backgroundColor, 'width': mdeModel.style.width, 'font-family': mdeModel.style.font, 'padding': mdeModel.style.padding }\">   <md-button ng-if=!mdeEditable ng-repeat=\"social in mdeModel.socials\" ng-click=gotoSocial(social)> <md-icon ng-style=\"{ 'color': mdeModel.style.color }\" class=md-48 md-font-set=social>{{social.icon}} </md-icon> </md-button> <md-menu ng-if=mdeEditable ng-repeat=\"social in mdeModel.socials\"> <md-button aria-label=\"Open phone interactions menu\" class=md-icon-button ng-click=\"openMenu($mdOpenMenu, $event)\"> <md-icon ng-style=\"{ 'color': mdeModel.style.color }\" class=md-48 md-font-set=social> {{social.icon}} </md-icon> </md-button> <md-menu-content width=4> <md-menu-item> <md-button ng-click=\"edit(social, $event)\"> <md-icon>edit</md-icon> {{ 'Edit' | translate }} </md-button> </md-menu-item> <md-menu-item> <md-button ng-click=\"delete(social, $event)\"> <md-icon>delete</md-icon> {{ 'Delete' | translate }} </md-button> </md-menu-item> </md-menu-content> </md-menu> </div> </div>"
  );


  $templateCache.put('views/partials/mdecontentexplorer.html',
    "<div layout=row> <div layout=column flex> <div ng-repeat=\"content in contents\" ng-click=select(content) layout-padding> {{content.id}}: {{content.title}} </div> </div> <div flex=40> <div> {{content.id}}:{{content.title}} <img alt=\"No priview\" src={{content.link}} width=500> </div> </div> <div> <input onchange=angular.element(this).scope().upload(this.files[0]) type=\"file\"> </div> </div>"
  );


  $templateCache.put('views/partials/mdewidgetheaderactions.html',
    "<span translate> widget</span> <span flex></span> <md-button ng-if=add ng-click=add() class=\"md-icon-button md-mini\"> <md-icon class=mde-icon-mini>add_circle</md-icon> </md-button> <md-button ng-click=settings() class=\"md-icon-button md-mini\"> <md-icon class=mde-icon-mini>settings</md-icon> </md-button> <md-button class=\"md-icon-button md-mini\" ng-click=removeWidget() ng-show=mdeParent&&removeWidget> <md-icon class=mde-icon-mini>delete</md-icon> </md-button>"
  );


  $templateCache.put('views/settings/background.html',
    " <div layout=column>  <div class=\"preview-box mde-flex-item-stretch\"> <div class=header>Preview</div> <div class=preview-area ng-class=\"[mdeParent.mdeModel.style.flexDirection,mdeModel.style.justifyContent, mdeModel.style.alignItems]\" style=\"display: flex\"> <div class=widget style=\"width:100px; height:50px; margin: 20px\" ng-style=\"{\n" +
    "            'opacity':'calc('+mdeModel.style.opacity+'/100)',\n" +
    "            'background-color':mdeModel.style.backgroundColor,\n" +
    "            }\" layout=row layout-align=\"center center\"> <p>item</p> </div> </div> </div> <div class=setting-panel layout=column layout-gt-sm=row>  <md-list> <md-subheader>Opacity</md-subheader> <md-divider></md-divider> <div layout=row class=mde-flex-align-items-center> <span>Percent</span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.opacity> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=mdeModel.style.opacity> </md-input-container> </div> </md-list>  <md-list> <md-subheader>Color</md-subheader> <md-divider></md-divider> <div layout=row class=mde-flex-align-items-start> <md-color-picker md-color-clear-button=false label=Color icon=brush ng-model=mdeModel.style.backgroundColor> </md-color-picker> </div> </md-list> </div> </div>"
  );


  $templateCache.put('views/settings/border.html',
    " <div layout=column>   <div class=\"preview-box mde-flex-item-stretch\"> <div class=header>Preview</div> <div class=preview-area ng-class=\"[mdeParent.mdeModel.style.flexDirection,mdeModel.style.justifyContent, mdeModel.style.alignItems]\" style=\"display: flex\"> <div class=widget style=\"width:100px; height:50px; margin: 20px\" ng-style=\"{\n" +
    "            'border-top-left-radius':(mdeModel.style.borderRadius.uniform) ? mdeModel.style.borderRadius.all : mdeModel.style.borderRadius.topLeft,\n" +
    "            'border-top-right-radius':(mdeModel.style.borderRadius.uniform) ? mdeModel.style.borderRadius.all : mdeModel.style.borderRadius.topRight,\n" +
    "            'border-bottom-left-radius':(mdeModel.style.borderRadius.uniform) ? mdeModel.style.borderRadius.all : mdeModel.style.borderRadius.bottomLeft,\n" +
    "            'border-bottom-right-radius':(mdeModel.style.borderRadius.uniform) ? mdeModel.style.borderRadius.all : mdeModel.style.borderRadius.bottomRight,\n" +
    "\n" +
    "            'border-left-style':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderStyle.all : mdeModel.style.borderStyle.left,\n" +
    "            'border-right-style':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderStyle.all : mdeModel.style.borderStyle.right,\n" +
    "            'border-top-style':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderStyle.all : mdeModel.style.borderStyle.top,\n" +
    "            'border-bottom-style':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderStyle.all : mdeModel.style.borderStyle.bottom,\n" +
    "\n" +
    "            'border-left-width':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderWidth.all : mdeModel.style.borderWidth.left,\n" +
    "            'border-right-width':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderWidth.all : mdeModel.style.borderWidth.right,\n" +
    "            'border-top-width':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderWidth.all : mdeModel.style.borderWidth.top,\n" +
    "            'border-bottom-width':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderWidth.all : mdeModel.style.borderWidth.bottom,\n" +
    "\n" +
    "            'border-left-color':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderColor.all : mdeModel.style.borderColor.left,\n" +
    "            'border-right-color':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderColor.all : mdeModel.style.borderColor.right,\n" +
    "            'border-top-color':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderColor.all : mdeModel.style.borderColor.top,\n" +
    "            'border-bottom-color':(mdeModel.style.borderStyleColorWidth.uniform) ? mdeModel.style.borderColor.all : mdeModel.style.borderColor.bottom,\n" +
    "            }\" layout=row layout-align=\"center center\"> <p>item</p> </div> </div> </div> <div ng-controller=BorderSettingCtrl class=setting-panel layout=column layout-gt-sm=row>  <md-list> <md-subheader>Corner Radius</md-subheader> <md-divider></md-divider> <md-checkbox ng-model=mdeModel.style.borderRadius.uniform>All equal</md-checkbox> <div layout=row class=mde-flex-align-items-center ng-show=mdeModel.style.borderRadius.uniform> <span>Radius</span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.borderRadius.all> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=mdeModel.style.borderRadius.all> </md-input-container> </div>         <div layout=row class=mde-flex-align-items-center ng-hide=mdeModel.style.borderRadius.uniform> <span>Left</span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.borderRadius.topLeft> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=mdeModel.style.borderRadius.topLeft> </md-input-container> </div> <div layout=row class=mde-flex-align-items-center ng-hide=mdeModel.style.borderRadius.uniform> <span>Right</span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.borderRadius.topRight> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=mdeModel.style.borderRadius.topRight> </md-input-container> </div> <div layout=row class=mde-flex-align-items-center ng-hide=mdeModel.style.borderRadius.uniform> <span>Top</span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.borderRadius.bottomLeft> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=mdeModel.style.borderRadius.bottomLeft> </md-input-container> </div> <div layout=row class=mde-flex-align-items-center ng-hide=mdeModel.style.borderRadius.uniform> <span>Bottom</span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.borderRadius.bottomRight> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=mdeModel.style.borderRadius.bottomRight> </md-input-container> </div> </md-list>  <md-list> <md-subheader>Style/Color/Thickness</md-subheader> <md-divider></md-divider> <md-checkbox ng-model=mdeModel.style.borderStyleColorWidth.uniform>All equal</md-checkbox> <div layout=row class=mde-flex-align-items-start ng-show=mdeModel.style.borderStyleColorWidth.uniform> <md-input-container flex=1> <label>Style</label> <md-select ng-model=mdeModel.style.borderStyle.all> <md-option ng-repeat=\"style in styles\" value={{style.value}}> {{style.title}} </md-option> </md-select> </md-input-container> <md-input-container flex=0 style=\"min-width: 100px\"> <label>Thickness</label> <input flex type=number ng-model=mdeModel.style.borderWidth.all> </md-input-container> <md-color-picker class=color-picker-hide-textbox md-color-clear-button=false label=Color icon=brush ng-model=mdeModel.style.borderColor.all> </md-color-picker> </div>  <div layout=row class=mde-flex-align-items-start ng-hide=mdeModel.style.borderStyleColorWidth.uniform> <span>Left: </span> <md-input-container flex=1> <label>Style</label> <md-select ng-model=mdeModel.style.borderStyle.left> <md-option ng-repeat=\"style in styles\" value={{style.value}}> {{style.title}} </md-option> </md-select> </md-input-container> <md-input-container flex=0 style=\"min-width: 100px\"> <label>Thickness</label> <input flex type=number ng-model=mdeModel.style.borderWidth.left> </md-input-container> <md-color-picker class=color-picker-hide-textbox md-color-clear-button=false label=Color icon=brush ng-model=mdeModel.style.borderColor.left> </md-color-picker> </div>  <div layout=row class=mde-flex-align-items-start ng-hide=mdeModel.style.borderStyleColorWidth.uniform> <span>Right: </span> <md-input-container flex=1> <label>Style</label> <md-select ng-model=mdeModel.style.borderStyle.right> <md-option ng-repeat=\"style in styles\" value={{style.value}}> {{style.title}} </md-option> </md-select> </md-input-container> <md-input-container flex=0 style=\"min-width: 100px\"> <label>Thickness</label> <input flex type=number ng-model=mdeModel.style.borderWidth.right> </md-input-container> <md-color-picker class=color-picker-hide-textbox md-color-clear-button=false label=Color icon=brush ng-model=mdeModel.style.borderColor.right> </md-color-picker> </div>  <div layout=row class=mde-flex-align-items-start ng-hide=mdeModel.style.borderStyleColorWidth.uniform> <span>Top: </span> <md-input-container flex=1> <label>Style</label> <md-select ng-model=mdeModel.style.borderStyle.top> <md-option ng-repeat=\"style in styles\" value={{style.value}}> {{style.title}} </md-option> </md-select> </md-input-container> <md-input-container flex=0 style=\"min-width: 100px\"> <label>Thickness</label> <input flex type=number ng-model=mdeModel.style.borderWidth.top> </md-input-container> <md-color-picker class=color-picker-hide-textbox md-color-clear-button=false label=Color icon=brush ng-model=mdeModel.style.borderColor.top> </md-color-picker> </div>  <div layout=row class=mde-flex-align-items-start ng-hide=mdeModel.style.borderStyleColorWidth.uniform> <span>Down: </span> <md-input-container flex=1> <label>Style</label> <md-select ng-model=mdeModel.style.borderStyle.bottom> <md-option ng-repeat=\"style in styles\" value={{style.value}}> {{style.title}} </md-option> </md-select> </md-input-container> <md-input-container flex=0 style=\"min-width: 100px\"> <label>Thickness</label> <input flex type=number ng-model=mdeModel.style.borderWidth.bottom> </md-input-container> <md-color-picker class=color-picker-hide-textbox md-color-clear-button=false label=Color icon=brush ng-model=mdeModel.style.borderColor.bottom> </md-color-picker> </div> </md-list> </div> </div>"
  );


  $templateCache.put('views/settings/description.html',
    " <div layout=column style=width:100%> <md-input-container> <label translate>Lable</label> <input ng-model=mdeModel.label> </md-input-container> <md-input-container> <label translate>Description</label> <input ng-model=mdeModel.description> </md-input-container> </div>"
  );


  $templateCache.put('views/settings/general.html',
    "General settings"
  );


  $templateCache.put('views/settings/layout.html',
    " <div layout=column ng-style=\"{'width': '100%'}\">  <div class=preview-box> <div class=header>Preview</div> <div class=preview-area layout={{mdeModel.style.direction}} layout-align=\"{{mdeModel.style.directionAlignment}} {{mdeModel.style.perpendicularAlignment}}\"> <div class=widget layout=row layout-align=\"center center\"><p>1</p></div> <div class=widget layout=row layout-align=\"center center\"><p>2</p></div> <div class=widget layout=row layout-align=\"center center\"><p>3</p></div> </div> </div> <div layout=column layout-align=\"none none\" layout-gt-sm=row layout-align-gt-sm=\"space-around none\" ng-controller=LayoutSettingsCtrl> <div> <div>Layout Direction</div> <md-radio-group ng-model=mdeModel.style.direction role=radiogroup> <md-radio-button ng-repeat=\"direction in directions\" value={{direction.value}}> <md-icon>{{direction.icon}}</md-icon> {{direction.title |translate}} </md-radio-button> </md-radio-group> </div> <div> <div>Alignment in Layout Direction</div> <md-radio-group ng-model=mdeModel.style.directionAlignment role=radiogroup> <md-radio-button ng-repeat=\"align in directionAlignments\" value={{align.value}}> {{align.title}} </md-radio-button> </md-radio-group> </div> <div> <div>Alignment in Perpendicular Direction</div> <md-radio-group ng-model=mdeModel.style.perpendicularAlignment role=radiogroup> <md-radio-button ng-repeat=\"align in perpendicularAlignments\" value={{align.value}}> {{align.title}} </md-radio-button> </md-radio-group> </div> </div> </div>"
  );


  $templateCache.put('views/settings/margin-padding.html',
    " <div layout=column>   <div class=\"preview-box mde-flex-item-stretch\"> <div class=header>Preview</div> <div class=preview-area ng-class=\"[mdeParent.mdeModel.style.flexDirection,mdeModel.style.justifyContent, mdeModel.style.alignItems]\" style=\"display: flex\"> <div class=widget layout=row layout-align=\"center center\"><p>before</p></div> <div class=widget ng-class=mdeModel.style.flexAlignItem ng-style=\"{\n" +
    "                'margin-left':mdeModel.style.marginLeft,\n" +
    "                'margin-right':mdeModel.style.marginRight,\n" +
    "                'margin-top':mdeModel.style.marginTop,\n" +
    "                'margin-bottom':mdeModel.style.marginBottom,\n" +
    "\n" +
    "                'padding-left':mdeModel.style.paddingLeft,\n" +
    "                'padding-right':mdeModel.style.paddingRight,\n" +
    "                'padding-top':mdeModel.style.paddingTop,\n" +
    "                'padding-bottom':mdeModel.style.paddingBottom,\n" +
    "\n" +
    "                 'flex-grow':mdeModel.style.flexItemGrow,\n" +
    "                 '-webkit-flex-grow':mdeModel.style.flexItemGrow}\" layout=row layout-align=\"center center\" style=\"border: 2px dotted\"><p> item</p></div> <div class=widget layout=row layout-align=\"center center\"><p>after</p></div> </div> </div> <div class=setting-panel layout=column layout-gt-sm=row> <md-list> <md-subheader>Margin</md-subheader> <md-divider style=\"margin-bottom: 1em\"></md-divider> <div layout=row class=mde-flex-align-items-center> <span>Left</span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.marginLeft> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=mdeModel.style.marginLeft> </md-input-container> </div> <div layout=row class=mde-flex-align-items-center> <span>Right</span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.marginRight> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=mdeModel.style.marginRight> </md-input-container> </div> <div layout=row class=mde-flex-align-items-center> <span>Top</span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.marginTop> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=mdeModel.style.marginTop> </md-input-container> </div> <div layout=row class=mde-flex-align-items-center> <span>Bottom</span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.marginBottom> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=mdeModel.style.marginBottom> </md-input-container> </div> </md-list> <md-list> <md-subheader>Padding</md-subheader> <md-divider style=\"margin-bottom: 1em\"></md-divider> <div layout=row class=mde-flex-align-items-center> <span>Left</span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.paddingLeft> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=mdeModel.style.paddingLeft> </md-input-container> </div> <div layout=row class=mde-flex-align-items-center> <span>Right</span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.paddingRight> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=mdeModel.style.paddingRight> </md-input-container> </div> <div layout=row class=mde-flex-align-items-center> <span>Top</span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.paddingTop> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=mdeModel.style.paddingTop> </md-input-container> </div> <div layout=row class=mde-flex-align-items-center> <span>Bottom</span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.paddingBottom> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=mdeModel.style.paddingBottom> </md-input-container> </div> </md-list> </div> </div>"
  );


  $templateCache.put('views/settings/min-max-size.html',
    " <div layout=column>  <div class=\"preview-box mde-flex-item-stretch\"> <div class=header>Preview</div> <div class=\"mde-flex preview-area mde-flex-justify-content-center\"> <div class=\"widget mde-flex-item-center\" ng-class=mdeModel.style.flexAlignItem ng-style=\"{\n" +
    "                'min-width':mdeModel.style.minWidth,\n" +
    "                'min-height':mdeModel.style.minHeight,\n" +
    "                'max-width':(mdeModel.style.maxWidth==0) ? 'none' : mdeModel.style.maxWidth,\n" +
    "                'max-height':(mdeModel.style.maxHeight==0)?'none':mdeModel.style.maxHeight}\" layout=row layout-align=\"center center\" style=\"border: 2px dotted\"><p> item</p></div> </div> </div> <div class=setting-panel layout=column layout-gt-sm=row>  <md-list> <md-subheader>MIN</md-subheader> <md-divider style=\"margin-bottom: 1em\"></md-divider> <div layout=row class=mde-flex-align-items-center> <span>Width<md-tooltip>set value \"0\" for ignoring</md-tooltip></span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.minWidth> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=mdeModel.style.minWidth> </md-input-container> </div> <div layout=row class=mde-flex-align-items-center> <span>Height<md-tooltip>set value \"0\" for ignoring</md-tooltip></span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.minHeight> </md-slider> <md-input-container> <input style=\"width: 50px\" flex type=number ng-model=mdeModel.style.minHeight> </md-input-container> </div> </md-list>  <md-list> <md-subheader>MAX</md-subheader> <md-divider style=\"margin-bottom: 1em\"></md-divider> <div layout=row class=mde-flex-align-items-center> <span>Width<md-tooltip>set value \"0\" for ignoring</md-tooltip></span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.maxWidth> </md-slider> <md-input-container> <input style=\"width: 50px\" flex ng-model=mdeModel.style.maxWidth> </md-input-container> </div> <div layout=row class=mde-flex-align-items-center> <span>Height<md-tooltip>set value \"0\" for ignoring</md-tooltip></span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.maxHeight> </md-slider> <md-input-container> <input style=\"width: 50px\" flex ng-model=mdeModel.style.maxHeight> </md-input-container> </div> </md-list> </div> </div>"
  );


  $templateCache.put('views/settings/notfound.html',
    " <md-icon>bug</md-icon> <h2>Settings page not found</h2>"
  );


  $templateCache.put('views/settings/old-background.html',
    " <div ng-controller=BackgroundSettingCtrl layout=column style=width:100%>  <div> <md-radio-group ng-model=mdeModel.style.backgroundMeta.type> <md-radio-button ng-repeat=\"type in types\" value={{type.value}}> {{type.title}} </md-radio-button> </md-radio-group> </div> <div ng-show=\"mdeModel.style.backgroundMeta.type!=='none'\" layout=row style=width:100%> <div data-ng-show=\"mdeModel.style.backgroundMeta.type==='color'\" flex>  <md-container flex=\"\"> <md-color-picker label=Color icon=brush ng-model=mdeModel.style.backgroundMeta.c> </md-color-picker> </md-container> </div> <div data-ng-show=\"mdeModel.style.backgroundMeta.type==='pattern'\" flex></div> <div data-ng-show=\"mdeModel.style.backgroundMeta.type==='image'\" flex></div>  <div class=preview-box flex=40> <div class=header>Preview</div> <div> <div class=preview-area layout=row layout-align=\"center center\"> <div class=widget ng-style=\"{\n" +
    "\t\t\t\t\t\t 'background': mdeModel.style.background,\n" +
    "\t\t\t\t\t\t 'height': '50%',\n" +
    "\t\t\t\t\t\t 'width': '50%'\n" +
    "\t\t\t\t\t }\"> <p>widget</p> </div> </div> </div> </div> </div> </div>"
  );


  $templateCache.put('views/settings/old-border.html',
    " <div ng-controller=BorderSettingCtrl layout=column style=width:100%>  <div> <md-radio-group ng-model=mdeModel.style.borderMeta.type> <md-radio-button value=none>None</md-radio-button> <md-radio-button value=line>Line</md-radio-button> </md-radio-group> </div> <div data-ng-show=\"mdeModel.style.borderMeta.type==='line'\" layout=row style=width:100% id=borderLine>  <md-container flex=\"\"> <md-slider-container> <span>All corners</span> <md-slider flex min=0 max=200 ng-model=mdeModel.style.borderMeta.ca aria-label=\"All corner\" id=corner-all-slider> </md-slider> </md-slider-container> <md-divider></md-divider> <md-slider-container> <span>Top left</span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.borderMeta.ctl aria-label=\"top left corner\" id=corner-all-slider> </md-slider> </md-slider-container> <md-slider-container> <span>Top right</span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.borderMeta.ctr aria-label=\"top right corner\" id=corner-all-slider> </md-slider> </md-slider-container> <md-slider-container> <span>Bottom left</span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.borderMeta.cbl aria-label=\"bottom left corner\" id=corner-all-slider> </md-slider> </md-slider-container> <md-slider-container> <span>Bottom right</span> <md-slider flex min=0 max=100 ng-model=mdeModel.style.borderMeta.cbr aria-label=\"bottom right corner\" id=corner-all-slider> </md-slider> </md-slider-container> <md-divider></md-divider> <md-slider-container> <span>Line width</span> <md-slider flex min=0 max=20 ng-model=mdeModel.style.borderMeta.w aria-label=\"line width\" id=corner-all-slider> </md-slider> </md-slider-container> <md-input-container> <label>State</label> <md-select ng-model=mdeModel.style.borderMeta.s> <md-option ng-repeat=\"style in styles\" value={{style.value}}> {{style.title}} </md-option> </md-select> </md-input-container> <md-color-picker label=Color icon=brush ng-model=mdeModel.style.borderMeta.c> </md-color-picker> </md-container>  <div> </div>  <div class=preview-box flex=40> <div class=header>Preview</div> <div> <div class=preview-area layout=row layout-align=\"center center\"> <div class=widget ng-style=\"{\n" +
    "\t\t\t\t\t 'background-color': 'red',\n" +
    "\t\t\t\t\t 'height': '50%',\n" +
    "\t\t\t\t\t 'width': '50%',\n" +
    "\t\t\t\t\t 'border-radius': mdeModel.style.borderRadius,\n" +
    "\t\t\t\t\t 'border': mdeModel.style.border\n" +
    "\t\t\t\t }\"> <p>widget</p> </div> </div> </div> </div> </div> </div>"
  );


  $templateCache.put('views/settings/old-text.html',
    " <div layout=column> <md-input-container> <label translate>title</label> <input ng-model=mdeModel.title> </md-input-container> <md-wysiwyg textarea-id=question textarea-class=form-control textarea-height=100px textarea-name=textareaQuestion textarea-required ng-model=mdeModel.text enable-bootstrap-title=true textarea-menu=yourModel.customMenu></md-wysiwyg> </div>"
  );


  $templateCache.put('views/settings/page-layout.html',
    " <div layout=column>   <div class=\"preview-box mde-flex-item-stretch\"> <div class=header>Preview</div> <div class=\"preview-area mde-flex\" ng-class=\"[mdeModel.style.flexDirection,mdeModel.style.justifyContent, mdeModel.style.alignItems]\"> <div class=widget layout=row layout-align=\"center center\"><p>1</p></div> <div class=widget layout=row layout-align=\"center center\"><p>2</p></div> <div class=widget layout=row layout-align=\"center center\"><p>3</p></div> </div> </div> <div class=setting-panel layout=column layout-gt-sm=row ng-controller=PageLayoutSettingsCtrl>  <md-list> <md-subheader>Direction</md-subheader> <md-divider style=\"margin-bottom: 1em\"></md-divider> <md-radio-group ng-model=mdeModel.style.flexDirection role=radiogroup> <md-list-item ng-repeat=\"direction in flexDirection\"> <md-radio-button value={{direction.value}}> <md-icon>{{direction.icon}}</md-icon> {{direction.title |translate}} </md-radio-button> </md-list-item> </md-radio-group> </md-list>  <md-list> <md-subheader ng-show=\"mdeModel.style.flexDirection=='mde-flex-row'\">Vertical Setting</md-subheader> <md-subheader ng-show=\"mdeModel.style.flexDirection!='mde-flex-row'\">Horizontal Setting</md-subheader> <md-divider style=\"margin-bottom: 1em\"></md-divider> <md-radio-group ng-model=mdeModel.style.alignItems role=radiogroup> <md-list-item ng-repeat=\"align in alignItems\"> <md-radio-button value={{align.value}}> <md-icon>{{direction.icon}}</md-icon> {{align.title |translate}} </md-radio-button> </md-list-item> </md-radio-group> </md-list>  <md-list> <md-subheader ng-show=\"mdeModel.style.flexDirection!='mde-flex-row'\">Vertical Setting</md-subheader> <md-subheader ng-show=\"mdeModel.style.flexDirection=='mde-flex-row'\">Horizontal Setting</md-subheader> <md-divider style=\"margin-bottom: 1em\"></md-divider> <md-radio-group ng-model=mdeModel.style.justifyContent role=radiogroup> <md-list-item ng-repeat=\"align in justifyContent\"> <md-radio-button value={{align.value}}> <md-icon>{{direction.icon}}</md-icon> {{align.title |translate}} </md-radio-button> </md-list-item> </md-radio-group> </md-list> </div> </div>"
  );


  $templateCache.put('views/settings/self-layout.html',
    " <div layout=column>   <div class=\"preview-box mde-flex-item-stretch\"> <div class=header>Preview</div> <div class=preview-area ng-class=\"[mdeParent.mdeModel.style.flexDirection,mdeModel.style.justifyContent, mdeModel.style.alignItems]\" style=\"display: flex\"> <div class=widget layout=row layout-align=\"center center\"><p>before</p></div> <div class=widget ng-class=mdeModel.style.flexAlignItem ng-style=\"{'flex-grow':mdeModel.style.flexItemGrow,'-webkit-flex-grow':mdeModel.style.flexItemGrow}\" layout=row layout-align=\"center center\" style=\"border: 2px dotted\"><p> item</p></div> <div class=widget layout=row layout-align=\"center center\"><p>after</p></div> </div> </div> <div class=setting-panel layout=column layout-align=\"none none\" layout-gt-sm=row layout-align-gt-sm=\"space-around none\" ng-controller=SelfLayoutSettingsCtrl>  <md-list> <md-subheader ng-show=\"mdeModel.style.flexDirection!='mde-flex-row'\">Vertical Setting</md-subheader> <md-subheader ng-show=\"mdeModel.style.flexDirection=='mde-flex-row'\">Horizontal Setting</md-subheader> <md-divider style=\"margin-bottom: 1em\"></md-divider> <md-radio-group ng-model=mdeModel.style.flexAlignItem role=radiogroup> <md-list-item ng-repeat=\"direction in flexAlignItem\"> <md-radio-button value={{direction.value}}> <md-icon>{{direction.icon}}</md-icon> {{direction.title |translate}} </md-radio-button> </md-list-item> </md-radio-group> </md-list>  <md-list> <md-subheader>Fill Extra Space</md-subheader> <md-divider style=\"margin-bottom: 1em\"></md-divider> <div layout=column style=\"margin-left: 14px; margin-right: 14px; min-width: 200px\"> <md-checkbox ng-model=mdeModel.style.flexItemGrowEnabled style=\"margin-bottom: 2em\">Enabled</md-checkbox> <div layout=row class=mde-flex-align-items-center ng-disabled=!mdeModel.style.flexItemGrowEnabled> <span>Weight</span> <md-slider ng-disabled=!mdeModel.style.flexItemGrowEnabled flex min=0 max=10 step=1 ng-model=mdeModel.style.flexItemGrow> </md-slider> <md-input-container> <input ng-disabled=!mdeModel.style.flexItemGrowEnabled style=\"width: 50px\" flex type=number ng-model=mdeModel.style.flexItemGrow> </md-input-container> </div> </div> </md-list> </div> </div>"
  );


  $templateCache.put('views/settings/text.html',
    " <div ng-controller=TextSettingsCtrl layout=column>  <textarea ui-tinymce=tinymceOptions ng-model=mdeModel.text style=\"width: 100%\">\n" +
    "\t</textarea> </div>"
  );

}]);
