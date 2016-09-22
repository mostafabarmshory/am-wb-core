/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialExtension')
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
