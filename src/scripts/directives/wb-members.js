/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc directive
 * @name digidociMainApp.directive:ddDeviceList
 * @description # ddDeviceList
 */
.directive(
	'wbMembers',
	function() {

	    var bodyElementSelector = 'div#wb-members-body';
	    var placeholderElementSelector = 'div#wb-members-placeholder';

	    return {
		restrict : 'E',
		replace : 'true',
		templateUrl : 'views/directives/wb-members.html',
		require : '^wbModel',
		scope : {
		    wbEditable : '=?',
		    wbModel : '=?'
		},
		controller : function($scope, $usr, $element, $widget,
			$compile, $settings) {
		    var scope = $scope;
		    function isEditable() {
			if (scope.wbParent) {
			    return scope.wbParent.isEditable();
			}
			return scope.wbEditable;
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
			    wbParent : scope.wbParent,
			    style : {
				pages : [ 'description', 'border',
					'background', 'pageLayout',
					'selfLayout' ]
			    }
			});
		    }

		    function removeWidgets() {
			$element//
			.children(bodyElementSelector)//
			.children(placeholderElementSelector)//
			.empty();
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

		    function loadUsers(widget, users) {
			var template = JSON.stringify(scope.wbModel.template);
			var root = $element//
			.children(bodyElementSelector)//
			.children(placeholderElementSelector);
			for (var i = 0; i < users.items.length; i++) {
			    var user = users.items[i];
			    var ft = template.replace(/{{user.id}}/g, user.id);
			    ft = ft.replace(/{{user.login}}/g, user.login);
			    ft = ft.replace(/{{user.first_name}}/g,
				    user.first_name);
			    ft = ft.replace(/{{user.last_name}}/g,
				    user.last_name);
			    var item = JSON.parse(ft);
			    var w = createWidget(widget.dom, $scope, item);
			    root.append(w);
			}
		    }

		    function reload() {
			removeWidgets();
			// TODO: maso, 1395: get user list
			var users = {}
			$usr.role(scope.wbModel.role)//
			.then(function(role) {
			    return role.users();
			})//
			.then(function(ul) {
			    users = ul;
			    return $widget.widget(scope.wbModel.template);
			})//
			.then(function(widget) {
			    loadUsers(widget, users);
			});
		    }

		    function loadRoles() {
			return $usr.roles()//
			.then(function(roles) {
			    scope.roles = roles;
			}, function(error) {
			    alert(error);
			});
		    }

		    scope.loadRoles = loadRoles;
		    scope.settings = settings;
		    scope.isEditable = isEditable

		    scope.$watch('wbEditable', function() {
			if (!scope.wbEditable) {
			    reload();
			} else {
			    removeWidgets();
			}
		    });
		}
	    };
	});
