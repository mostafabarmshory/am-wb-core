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

class Wb{
    
    /**
     * Create a new root item
     */
    init(selector){
        // toto
    }
    
    /**
     * Get root Item
     */
    getItems(){
        
    }
    
    getItem(){}
}
class WbWidgetModel{}
class WbWidgetEventHandler{}
class WbWidgetContext{}
class WbWdiget{
    constructor()
    {
        this.state = 'init';
    }
    
    state(stateValue){
        if(typeof(stateValue === 'undefined')){
            return this.state;
        }
        var oldState = this.state;
        this.state = stateValue;
        fire('state', this.state, oldState);
    }
    
    fire(eventKey, value, oldValue){
        // TODO:
    }
}
class WbGroup extends WbWdiget{}
class WbEditor{}


angular.module('am-wb-core', [
	'ngMessages',
	'ngAnimate',
	'ngAria',
	'ngMaterial',
	'ngSanitize',
	'ngRoute', 

	'pascalprecht.translate',
	'mdColorPicker',
	'ui.tinymce',
	'dndLists',
	'material.components.expansionPanels',
	'ngMdIcons',
	'ngHandsontable',
	'ngStorage' // https://github.com/gsklee/ngStorage
]);
