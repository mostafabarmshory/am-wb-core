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

/*
 * Load widgets
 */
.run(function ($widget) {

    /**
     * @ngdoc Widgets
     * @name Group
     * @description Parent widget of other widgets
     * 
     * default setting:
     * - margin: '1px'
     */
    $widget.newWidget({
        // widget description
        type: 'Group',
        title: 'Group',
        description: 'Panel contains list of widgets.',
        icon: 'wb-widget-group',
        groups: ['basic'],
        model: {
            style: {
                margin: '1px'
            }
        },
        // functional properties
        templateUrl: 'views/directives/wb-group.html',
        help: 'http://dpq.co.ir/more-information-link',
        helpId: 'wb-widget-group'
    });
    /**
     * @ngdoc Widgets
     * @name Text
     * @description Add rich text to page
     * 
     * This is a RTF to add to a page.
     * 
     */
    $widget.newWidget({
        // widget description
        type: 'HtmlText',
        title: 'Text',
        description: 'An text block.',
        icon: 'wb-widget-html',
        groups: ['basic'],
        model: {
            text: '<h2>Text element</h2><p>Click on the text box to edit.</p>',
            style: {
            	padding: '8px'
            }
        },
        // help id
        help: 'http://dpq.co.ir',
        helpId: 'wb-widget-html',
        // functional properties
        templateUrl: 'views/widgets/wb-html.html',
        controller: function(){
        	this.text = '';
        	this.setText = function(text){
        		this.text = text;
        	};
        	this.initWidget = function(){
        		var ctrl = this;
        		this.on('modelUpdated', function($event){
        			if($event.key === 'text'){
        				ctrl.setText($event.newValue);
        			}
        		});
        		this.setText(this.getModelProperty('text'));
        	};
        },
        controllerAs: 'ctrl'
    });
});
