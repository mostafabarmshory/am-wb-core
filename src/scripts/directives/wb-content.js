/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')
/**
 * @ngdoc directive
 * @name donateMainApp.directive:wbContent
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
.directive(
	'wbContent',
	function($compile, $widget) {

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

		controller : function($scope, $element, $mdDialog) {
		    var scope = $scope;

		    function isEditable() {
			if (scope.wbParent) {
			    return scope.wbParent.isEditable();
			}
			return scope.wbEditable;
		    }

		    function createWidget(widget, parentScope, model) {
			var element = angular.element(widget);
			element.attr('wb-model', 'model');
			element.attr('wb-editable', 'wbEditable()');
			element.attr('wb-parent', 'wbParent');
			var childScope = parentScope.$new(true, parentScope);
			childScope.model = model;
			childScope.wbEditable = scope.isEditable;
			childScope.wbParent = parentScope;
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
			$mdDialog.show({
			    controller : 'DialogsCtrl',
			    templateUrl : 'views/dialogs/wb-selectwidget.html',
			    parent : angular.element(document.body),
			    clickOutsideToClose : true,
			    fullscreen : true,
			    locals : {
				wbModel : {},
				style : {}
			    },
			}).then(function(model) {
			    wbModel.contents.push(model);
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
		     * یک دریچه محاوره‌ای باز می‌شود تا کاربر بتواند تنظیم‌های
		     * متفاوت مربوط به این صفحه را انجام دهد.
		     */
		    function settings() {
			return $mdDialog.show({
			    controller : 'SettingDialogsCtrl',
			    templateUrl : 'views/dialogs/wb-settings.html',
			    parent : angular.element(document.body),
			    clickOutsideToClose : true,
			    fullscreen : true,
			    locals : {
				wbModel : scope.wbModel,
				wbParent : scope.wbParent,
				style : {
				    pages : [ 'description', 'border',
					    'background', 'pageLayout',
					    'selfLayout' ]
				}
			    }
			});
		    }

		    function isArray(model) {
			return (model && model.constructor === Array);
		    }

		    scope.settings = settings;
		    scope.removeWidgets = removeWidgets;
		    scope.removeWidget = removeWidget;
		    scope.newWidget = newWidget;
		    scope.isEditable = isEditable

		    scope.$watch('wbModel', function() {
			removeWidgets();
			if (!scope.wbModel) {
			    // XXX: maso, 1395: هنوز مدل تعیین نشده
			    return;
			}
			if (!isArray(scope.wbModel.contents)) {
			    scope.wbModel.contents = [];
			}
			scope.wbModel.type = 'Page';
			scope.wbModel.contents.forEach(addWidget);
		    });
		}
	    };
	});
