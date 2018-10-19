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
 * @ngdoc Directives
 * @name wb-layout
 * @description Apply layout into an element
 * 
 * Group and page are the main goles of this directive. By adding the wbLayout,
 * widget are able to manages it layout automatically.
 * 
 * Note that, in smal screen devices, the colume layout apply as default.
 */
.directive('wbLayout', function($mdMedia) {

    /**
     * Adds layout config into the element
     * 
     * @param element
     * @param layout
     * @returns
     */
    function applyLayout(element, layout) {
        var flexLayout = {};

        /*
         * Group
         * 
         * check if is group apply flex flow
         */
        {
            flexLayout.display = 'flex';
            // row
            if(layout.direction === 'row' && $mdMedia('gt-sm')){
                flexLayout['flex-direction'] =  layout.direction_reverse? 'row-reverse' : 'row'; 
                flexLayout['overflow-x'] = layout.wrap ? 'visible' : 'auto';
                flexLayout['overflow-y'] = 'visible';
            } else {
                flexLayout['flex-direction'] =  layout.direction_reverse? 'column-reverse' : 'column'; 
                flexLayout['overflow-x'] = 'visible';
                flexLayout['overflow-y'] = layout.wrap ? 'visible' : 'auto';
            }
            
            // wrap
            if(layout.wrap){
                flexLayout['flex-wrap'] = layout.wrap_reverse ? 'wrap-reverse' : 'wrap';
                // wrap align
                var alignContent;
                switch(layout.wrap_align){
                case 'start':
                    alignContent = 'flex-start';
                    break;
                case 'end':
                    alignContent = 'flex-end';
                    break;
                case 'center':
                    alignContent = 'center';
                    break;
                case 'space-between':
                    alignContent = 'space-between';
                    break;
                case 'space-around':
                    alignContent = 'space-around';
                    break;
                case 'stretch':
                    alignContent = 'stretch';
                    break;
                default:
                    alignContent = 'stretch';
                }
                flexLayout['align-content']= alignContent;
            } else {
                flexLayout['flex-wrap'] = 'nowrap';
            }
            

            // justify
            var justify;
            switch(layout.justify){
            case 'start':
                justify = 'flex-start';
                break;
            case 'end':
                justify = 'flex-end';
                break;
            case 'center':
                justify = 'center';
                break;
            case 'space-between':
                justify = 'space-between';
                break;
            case 'space-around':
                justify = 'space-around';
                break;
            case 'space-evenly':
                justify = 'space-evenly';
                break;
            default:
                justify = 'flex-start';
            }
            flexLayout['justify-content']= justify;

            // align
            var align;
            switch(layout.align){
            case 'start':
                align = 'flex-start';
                break;
            case 'end':
                align = 'flex-end';
                break;
            case 'center':
                align = 'center';
                break;
            case 'baseline':
                align = 'baseline';
                break;
            case 'stretch':
                align = 'stretch';
                break;
            default:
                align = 'stretch';
            }
            flexLayout['align-items']= align;
        }

        /*
         * Widget
         */
        {
            flexLayout.order = layout.order >= 0? layout.order : 0;
            flexLayout['flex-grow'] = layout.grow >= 0? layout.grow : 0;
            flexLayout['flex-shrink'] = layout.shrink >= 0? layout.shrink : 1;
            // TODO: maso, 2018: compute based on size
            flexLayout['flex-basis'] = 'auto';
            
            // align-self
            // auto | flex-start | flex-end | center | baseline | stretch;
            var alignSelf;
            switch(layout.align_self){
            case 'start':
                alignSelf = 'flex-start';
                break;
            case 'end':
                alignSelf = 'flex-end';
                break;
            case 'center':
                alignSelf = 'center';
                break;
            case 'baseline':
                alignSelf = 'baseline';
                break;
            case 'stretch':
                alignSelf = 'stretch';
                break;
            default:
                alignSelf = 'auto';
            }
            flexLayout['align-self']= alignSelf;
        }
        
        // apply to element
        element.css(flexLayout);
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
    function postLink($scope, $element, $attrs) {
        // Watch for layout
        $scope.$watch($attrs.wbLayout+'.layout', function(layout) {
            if(layout){
                applyLayout($element, layout);
            }
        }, true);
    }

    /*
     * Directive
     */
    return {
        restrict : 'A',
        link : postLink,
        require:[]
    };
});