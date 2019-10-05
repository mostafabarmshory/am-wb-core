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

angular.module('am-wb-core')//

/**
 * @ngdoc Factories
 * @name WidgetEditor
 * @description Editor of a widget
 * 
 * 
 * ## Events
 * 
 * - Click    native  Fires when the editor is clicked.
 * - DblClick    native  Fires when the editor is double-clicked.
 * - MouseDown   native  Fires when the mouse button is pressed down inside the editor.
 * - MouseUp native  Fires when a mouse button is released inside the editor.
 * - MouseMove   native  Fires when the mouse is moved within the editor.
 * - MouseOver   native  Fires when a new element is being hovered within the editor.
 * - MouseOut    native  Fires when an element is no longer being hovered within the editor.
 * - MouseEnter  native  Fires when the mouse enters the editor.
 * - MouseLeave  native  Fires when the mouse leaves the editor.
 * - KeyDown native  Fires when a key is pressed within the editor.
 * - KeyPress    native  Fires when a key is pressed within the editor.
 * - KeyUp   native  Fires when a key is released within the editor.
 * - ContextMenu native  Fires when the context menu is invoked within the editor.
 * - Paste   native  Fires when a paste is done within the editor.
 * - Init    core    Fires when the editor is initialized.
 * - Focus   core    Fires when the editor is focused.
 * - Blur    core    Fires when the editor is blurred.
 * - BeforeSetContent    core    Fires before the content is set to the editor.
 * - SetContent  core    Fires after the content is set to the editor.
 * - GetContent  core    Fires after the content is extracted from the editor.
 * - PreProcess  core    Fires when the contents in the editor are being serialized.
 * - PostProcess core    Fires when the contents in the editor are being serialized.
 * - NodeChange  core    Fires when selection inside the editor is changed.
 * - Undo    core    Fires when the contents have been reverted to a previous state.
 * - Redo    core    Fires to revert the effects of an Undo event.
 * - Change  core    Fires when undo level is added to the editor.
 * - Dirty   core    Fires when editor contents are being considered dirty.
 * - Remove  core    Fires when the editor is removed.
 * - ExecCommand core    Fires after a command has been executed.
 * - PastePreProcess paste   Fires when contents are pasted into the editor.
 * - PastePostProcess    paste   Fires when contents are pasted into the editor.
 */



.factory('WidgetEditor', function () {

    /**
     * Creates new instace of an editor
     */
    function widgetEditor(widget, options) {
        this.callbacks = [];
        this.widget = widget;
        this.options = options;
    }

    /**
     * Remove all resources
     * 
     * @mrmberof WidgetEditor
     */
    widgetEditor.prototype.destroy = function(){
        this.callbacks = [];
        delete this.widget;
        delete this.options;
    };

    /**
     * Get the widget of the editor
     * 
     * @mrmberof WidgetEditor
     */
    widgetEditor.prototype.getWidget = function(){
        return this.widget;
    };

    /**
     * Set the widget as dirty widget
     * 
     * @mrmberof WidgetEditor
     */
    widgetEditor.prototype.setDirty = function(dirty){
        if(typeof(dirty) !== 'undefined'){
            this.dirty = dirty;
        } else {
            this.dirty = true;
        }
    };

    /**
     * Check if the widget is dirty
     * 
     * @mrmberof WidgetEditor
     */
    widgetEditor.prototype.isDirty = function(){
        return this.dirty;
    };

    /**
     * Remove callbak from specific type
     * 
     * @param type {string} the event name
     * @param callback {function} the function
     * @mrmberof WidgetEditor
     */
    widgetEditor.prototype.off = function(type, callback){
        if (!angular.isArray(this.callbacks[type])) {
            return;
        }
        var callbacks = this.callbacks[type];
        var index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    };

    /**
     * Add a callback function to the editor
     * 
     * @param type {string} the event name
     * @param callback {function} the function
     * @mrmberof WidgetEditor
     */
    widgetEditor.prototype.on = function(type, callback){
        if (!angular.isArray(this.callbacks[type])) {
            this.callbacks[type] = [];
        }
        if(!_.includes(this.callbacks[type], callback)){
            this.callbacks[type].push(callback);
        }
    };

    /**
     * Fire the event
     * 
     * @param type {string} the event name
     * @param param {object} event params
     * @mrmberof WidgetEditor
     */
    widgetEditor.prototype.fire = function(type, params){
        // TODO: maso, 2018: create event object
        var event = _.merge({
            source: this,
            type: type
        }, params || {});

        // fire
        var callbacks = this.callbacks[type] || [];
        for(var i = 0; i < callbacks.length; i++){
            // TODO: maso, 2018: check if the event is stopped to propagate
            try {
                callbacks[i](event);
            } catch (error) {
                // NOTE: remove on release
                console.log(error);
            }
        }
    }; // internal





    widgetEditor.prototype.setActive = function(){}; // focus|skipFocuse
    widgetEditor.prototype.isActive = function(){};
    widgetEditor.prototype.save = function(){};
    widgetEditor.prototype.hide = function(){};
    widgetEditor.prototype.show = function(){};
    widgetEditor.prototype.isHidden = function(){};

    // the editor type
    return widgetEditor;
});
