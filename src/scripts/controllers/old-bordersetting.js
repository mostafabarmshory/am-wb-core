'use strict';

angular.module('ngMaterialExtension')
/**
 * @ngdoc function
 * @name ngMaterialExtension.controller:BordersettingCtrl
 * @description # BordersettingCtrl Controller of the ngMaterialExtension
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
