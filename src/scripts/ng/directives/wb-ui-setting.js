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

/*
 * link setting widgets
 */
function wbUiSettingLinkFunction($scope, $element, $attrs, ctrls) {
    var ngModel = ctrls[0];

    $scope.wbActionClean = ! _.isUndefined($attrs.wbActionClean);

    ngModel.$render = function () {
        $scope.value = ngModel.$modelValue;
    };

    $scope.cleanValue = function () {
        setValue(undefined);
    };
    
    $scope.setValue = setValue;

    function setValue(value){
        // TODO: validate and set
        ngModel.$setViewValue(value);
    }
}

/*
 * link function of the number
 */
function wbUiSettingNumberLinkFunction($scope, $element, $attrs, ctrls) {
    wbUiSettingLinkFunction($scope, $element, $attrs, ctrls);
    var ngModel = ctrls[0];

    ngModel.$render = function () {
        pars(ngModel.$modelValue);
    };

    // Add all length by default
    $scope.lengthValues = ['px', 'cm', 'in', '%', 'vh'];
    $scope.extraValues = $scope.extraValues || [];
    var types = $scope.extraValues;
    if (types) { 
        types = types.concat($scope.lengthValues);
        if (types.includes('length')) {
            var index = types.indexOf('length');
            types.splice(index, 1);
        }
    } else {
        types = $scope.lengthValues;
    }

    $scope.types = types;

    function pars(value) {
        if (!value) {
            $scope.internalUnit = types[0];
            $scope.internalValue = 0;
        } else {
            split(value);
        }
    }

    $scope.updateLength = function(unit, value) {
        if ($scope.lengthValues.includes(unit)) {
            ngModel.$setViewValue(value+unit);
        } else {
            ngModel.$setViewValue(unit);
        }
    };

    /*
     * @param {type} val
     * @returns {undefined}
     * decsription  Splite value to 'unit' and 'value'
     */
    function split(val) {
        if ($scope.extraValues.includes(val)) {
            $scope.internalUnit = val;
        } else {
            /*
             * A regex which groups the val into the value and unit(such as 10px -> 10 , px).
             * This regex also support signed float format such as (+10.75%, -100.76em)
             */
            var regex = /^([+-]?\d+\.?\d*)([a-zA-Z%]*)$/;
            var matches = regex.exec(val);
            if(angular.isArray(matches)){
                $scope.internalValue = Number(matches[1]);
                $scope.internalUnit = matches[2];
            }
        }
    }
}

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wb-ui-settingn-boolean
 * @description a setting section for on/off switch.
 *
 */
.directive('wbUiSettingBoolean', function () {
    return {
        templateUrl: 'views/directives/wb-ui-setting-boolean.html',
        restrict: 'E',
        replace: true,
        scope: {
            title: '@wbTitle',
            description: '@wbDescription',
        },
        require: ['ngModel'],
        link: wbUiSettingLinkFunction
    };
})

/**
 * @ngdoc Directives
 * @name wb-ui-setting-text
 * @description Setting for a text
 */
.directive('wbUiSettingText', function () {
    return {
        templateUrl: 'views/directives/wb-ui-setting-text.html',
        restrict: 'E',
        scope: {
            title: '@wbTitle',
            description: '@wbDescription',
        },
        require: ['ngModel'],
        link: wbUiSettingLinkFunction
    };
})


/**
 * @ngdoc Directives
 * @name wbUiSettingSelect
 * @description a setting section for choosing values.
 */
.directive('wbUiSettingSelect', function () {
    return {
        templateUrl: 'views/directives/wb-ui-setting-select.html',
        restrict: 'E',
        scope: {
            title: '@wbTitle',
            description: '@wbDescription',
        },
        require: ['ngModel'],
        link: wbUiSettingLinkFunction
    };
})


/**
 * @ngdoc Directives
 * @name wbUiSettingNumber
 * @description a setting section to set a number.
 *
 */
.directive('wbUiSettingNumber', function () {
    return {
        templateUrl: 'views/directives/wb-ui-setting-number.html',
        restrict: 'E',
        scope: {
            title: '@wbTitle',
            description: '@wbDescription',
        },
        require: ['ngModel'],
        link: wbUiSettingLinkFunction
    };
})


/**
 * @ngdoc Directives
 * @name wbUiSettingLength
 */
.directive('wbUiSettingLength', function () {
    return {
        templateUrl: 'views/directives/wb-ui-setting-length.html',
        restrict: 'E',
        replace: true,
        scope: {
            title: '@wbTitle',
            description: '@wbDescription',
        },
        require: ['ngModel'],
        link: wbUiSettingLinkFunction
    };
})

/**
 * @ngdoc Directives
 * @name wbUiSettingColor
 * @description a setting section to set color.
 *
 */
.directive('wbUiSettingColor', function (){
    return {
        templateUrl: 'views/directives/wb-ui-setting-color.html',
        restrict: 'E',
        scope: {
            title: '@wbTitle',
            description: '@wbDescription',
        },
        require: ['ngModel'],
        link: wbUiSettingLinkFunction,
        /*
         * @ngInject
         */
        controller: function($scope, $element) {
            var preview = $element.find('.preview');
            $scope.$watch('value', function(color){
                preview.css({background: color});
            });
        },
        controllerAs: 'ctrl'
    };
});

