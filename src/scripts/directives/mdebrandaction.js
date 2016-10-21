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
