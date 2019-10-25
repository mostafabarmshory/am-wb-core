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

/**
 * @ngdoc module
 * @name ngDonate
 * @description
 * 
 */
angular.module('am-wb-coreTest', [ 'am-wb-core', 'jsonFormatter',])//


.controller('MyTestEditorCtrl', function($scope, $http, $widget, $wbUtil,
        // new model
        WbProcessorLocator, WbProcessorSelect, WbProcessorDnd) {
    'use strict';
    
    var locatorProcessor;
    var selectProcessor;
    var dndProcessor;

    /*
     * Set data model
     */
    this.setDocumentPath = function(path){
        var ctrl = this;
        $http.get(path)
        .then(function(res) {
            ctrl.model = $wbUtil.clean(res.data);
        });
    }

    this.toggleEditable = function(){
        this.editable = !this.editable;
        if(this.editable) {
            this.initEditor();
        }
        this.getRootWidget().setEditable(this.editable);
    };

    this.setRootWidget = function(rootWidget){
        this.rootWidget = rootWidget;
    }

    this.getRootWidget = function(){
        return this.rootWidget;
    }

    this.initEditor = function(){
        if(!locatorProcessor){
            locatorProcessor = new WbProcessorLocator();
            $widget.setProcessor('locator', locatorProcessor);
            locatorProcessor.setEnable(true);
        }
        if(!selectProcessor){
            selectProcessor = new WbProcessorSelect();
            $widget.setProcessor('select', selectProcessor);
            var ctrl = this;
            selectProcessor.on('selectionChange', function(){
                ctrl.selectedWidgets = selectProcessor.getSelectedWidgets();
                $scope.$digest();
            });
        }
        
        if(!dndProcessor){
            dndProcessor = new WbProcessorDnd();
            $widget.setProcessor('dnd', dndProcessor);
        }
    }

    this.init = function(){
        var ctrl = this;
        // load widgets
        $widget.widgets()
        .then(function(list){
            ctrl.widgets = list.items;
        });
        
        $scope.actions = [{
            icon: 'delete',
            run: function(){
                var widgets = selectProcessor.getSelectedWidgets();
                for(var i = 0; i < widgets.length; i++){
                    widgets[i].delete();
                }
            }
        },{
            icon: 'edit',
            run: function(){
                ctrl.toggleEditable();
            }
        }];

        
        $scope.$on('$destroy', function(){
            if(locatorProcessor){
                locatorProcessor.setEnable(false);
            }
            if(selectProcessor){
                selectProcessor.setEnable(false);
            }
        });
    };
    
    this.init();
});






/*
 * # Animation
 * 
 * - animation
 * - animation-name
 * - animation-duration
 * - animation-timing-function
 * - animation-delay
 * - animation-iteration-count
 * - animation-direction
 * - animation-fill-mode
 * - animation-play-state
 */

/*
 * ??
 * 
 * - caption-side
 * - backface-visibility
 * - caret-color
 * - hanging-punctuation
 * - table-layout
 */


/*
 * background
 * background-color
 * background-image
 * background-position
 * background-size
 * background-repeat
 * background-origin
 * background-clip
 * background-attachment
 */

/*
 * outline
 * outline-offset
 * outline-width
 * outline-style (required)
 * outline-color
 * 
 * box-decoration-break
 * box-shadow
 * box-sizing

 * - border
 * - border-width
 * - border-style (required)
 * - border-color
 * - border-collapse
 * - border-spacing
 * 
 * - border-radius
 * - border-top-right-radius
 * - border-top-left-radius
 * - border-bottom-left-radius
 * - border-bottom-right-radius
 * 
 * - border-image
 * - border-image-source
 * - border-image-slice
 * - border-image-width
 * - border-image-outset
 * - border-image-repeat
 * 
 * - border-bottom
 * - border-bottom-width
 * - border-bottom-style
 * - border-bottom-color
 *
 * - border-left
 * - border-left-width
 * - border-left-style (required)
 * - border-left-color
 *
 * - border-right
 * - border-right-width
 * - border-right-style (required)
 * - border-right-color
 *
 * - border-top
 * - border-top-width
 * - border-top-style (required)
 * - border-top-color
 */





/*
 * layout
 * 
 * - display
 * - position
 * - order
 * - z-index
 * - clear
 * 
 * - bottom
 * - left
 * - right
 * - top
 * 
 * ## float layout
 * 
 * - float
 * 
 * ## Flex
 * 
 * align-content
 * align-items
 * align-self
 * justify-content
 * flex
 * flex-basis
 * flex-direction
 * flex-grow
 * flex-shrink
 * flex-basis
 * flex-wrap
 * 
 * 
 * ## grid
 * 
 * - grid
 * - grid-area
 * - grid-auto-columns
 * - grid-auto-flow
 * - grid-auto-rows
 * - grid-column
 * - grid-column-end
 * - grid-column-gap
 * - grid-column-start
 * - grid-gap
 * - grid-row
 * - grid-row-end
 * - grid-row-gap
 * - grid-row-start
 * - grid-template
 * - grid-template-areas
 * - grid-template-columns
 * - grid-template-rows
 * 
 * ## overflow
 * 
 * - overflow
 * - overflow-x
 * - overflow-y
 * - scroll-behavior
 * 
 * ## 
 * 
 * - page-break-after
 * - page-break-before
 * - page-break-inside
 * 
 * 
 * ## column view
 *
 * - columns
 * - column-width
 * - column-count
 * - column-span
 * - column-fill
 * - column-gap
 * - column-rule
 * - column-rule-color
 * - column-rule-style
 * - column-rule-width
 */

/*
 * Size
 * 
 * - margin
 * - margin-top
 * - margin-right
 * - margin-bottom
 * - margin-left
 * 
 * - padding
 * - padding-top
 * - padding-right
 * - padding-bottom
 * - padding-left
 * 
 * - resize
 * - height
 * - max-height
 * - min-height
 * - width
 * - max-width
 * - min-width
 */


/*
 * img, video
 * 
 * - clip
 * - clip-path
 * - filter
 * - object-fit
 * - object-position
 */

/*
 * General?
 * 
 * ## view
 * 
 * - opacity
 * - visibility
 * - color
 * - mix-blend-mode
 * - isolation
 * 
 * # mouse
 * 
 * - cursor
 * - pointer-events
 */



/*
 * # Text
 * 
 * - hyphens
 * - letter-spacing
 * - line-height
 * - quotes
 * - tab-size
 * - vertical-align
 * - white-space
 * - word-break
 * - word-spacing
 * - word-wrap
 * - writing-mode
 * - user-select
 * 
 * ## Text
 * 
 * - text-align-last
 * - text-decoration
 * - text-decoration-color
 * - text-decoration-line
 * - text-decoration-style
 * - text-indent
 * - text-justify
 * - text-overflow
 * - text-shadow
 * - text-transform
 * 
 * ## Local
 * 
 * - @charset
 * - direction
 * - unicode-bidi
 * 
 * ## font
 * 
 * - font
 * - font-family
 * - font-kerning
 * - font-size
 * - font-size-adjust
 * - font-stretch
 * - font-style
 * - font-variant
 * - font-weight
 */

/*
 * # list (ul, ol)
 * 
 * - list-style
 * - list-style-type
 * - list-style-position
 * - list-style-image
 * 
 */

/*
 *#  Transformation
 * 
 * - perspective
 * - perspective-origin
 * 
 * - transform
 * - transform-origin
 * - transform-style
 * 
 * - transition
 * - transition-delay
 * - transition-duration
 * - transition-property
 * - transition-timing-function
 */