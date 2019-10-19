/*
 * Copyright (c) 2015-2025 Phoinex Scholars Co. http://dpq.co.ir
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

angular.module('am-wb-core')//

/**
 * @ngdoc Processor
 * @name WbProcessorStyle
 * @description Widget processor
 * 
 */
.factory('WbProcessorStyle', function (WbProcessorAbstract, $widget) {
    'use strict';

    // In standard-compliant browsers we use a custom mime type and also encode the dnd-type in it.
    // However, IE and Edge only support a limited number of mime types. The workarounds are described
    // in https://github.com/marceljuenemann/angular-drag-and-drop-lists/wiki/Data-Transfer-Design
    var MIME_TYPE = 'application/x-dnd';
    var EDGE_MIME_TYPE = 'application/json';
    var MSIE_MIME_TYPE = 'Text';

    // All valid HTML5 drop effects, in the order in which we prefer to use them.
    var ALL_EFFECTS = ['move', 'copy', 'link'];

    function dragstart(widget, event) {
        // 1 - load state, data and etc.
        event = event.originalEvent || event;
//        widget.$$dndState = widget.$$dndState || {};

        // Initialize global state.
//        widget.$$dndState.isDragging = true;
//        widget.$$dndState.itemType = widget.getType();

        // Set the allowed drop effects. See below for special IE handling.
//        widget.$$dndState.dropEffect = "none";
//        widget.$$dndState.effectAllowed = dndEffectAllowed || ALL_EFFECTS[0];

        // 2 - convert and put data
        event.dataTransfer.effectAllowed = widget.$$dndState.effectAllowed;

        var convertors = $widget.getConvertors();
        angular.forEach(convertors, function(convertor){
            try {
            event.dataTransfer.setData(convertor.getMimetype(), convertor.convert(widget));
            } catch (e) {
                // TODO: maso, 2019: log errors
            }
        });
        // Internet Explorer and Microsoft Edge don't support custom mime types, see design doc:
        // https://github.com/marceljuenemann/angular-drag-and-drop-lists/wiki/Data-Transfer-Design
//        var item = scope.$eval(attr.dndDraggable);
//        var mimeType = MIME_TYPE + (dndState.itemType ? ('-' + dndState.itemType) : '');
//        try {
//            event.dataTransfer.setData(mimeType, angular.toJson(item));
//        } catch (e) {
//            // Setting a custom MIME type did not work, we are probably in IE or Edge.
//            var data = angular.toJson({item: item, type: dndState.itemType});
//            try {
//                event.dataTransfer.setData(EDGE_MIME_TYPE, data);
//            } catch (e) {
//                // We are in Internet Explorer and can only use the Text MIME type. Also note that IE
//                // does not allow changing the cursor in the dragover event, therefore we have to choose
//                // the one we want to display now by setting effectAllowed.
//                var effectsAllowed = filterEffects(ALL_EFFECTS, dndState.effectAllowed);
//                event.dataTransfer.effectAllowed = effectsAllowed[0];
//                event.dataTransfer.setData(MSIE_MIME_TYPE, data);
//            }
//        }

        // Try setting a proper drag image if triggered on a dnd-handle (won't work in IE).
        if (event._dndHandle && event.dataTransfer.setDragImage) {
            event.dataTransfer.setDragImage(widget.getElement()[0], 0, 0);
        }

//        // Invoke dragstart callback and prepare extra callback for dropzone.
//        $parse(attr.dndDragstart)(scope, {event: event});
//        if (attr.dndCallback) {
//            var callback = $parse(attr.dndCallback);
//            dndState.callback = function(params) { return callback(scope, params || {}); };
//        }

        event.stopPropagation();
    }

    function dragend(event) {
        event = event.originalEvent || event;

        // Invoke callbacks. Usually we would use event.dataTransfer.dropEffect to determine
        // the used effect, but Chrome has not implemented that field correctly. On Windows
        // it always sets it to 'none', while Chrome on Linux sometimes sets it to something
        // else when it's supposed to send 'none' (drag operation aborted).
        scope.$apply(function() {
            var dropEffect = dndState.dropEffect;
            var cb = {copy: 'dndCopied', link: 'dndLinked', move: 'dndMoved', none: 'dndCanceled'};
            $parse(attr[cb[dropEffect]])(scope, {event: event});
            $parse(attr.dndDragend)(scope, {event: event, dropEffect: dropEffect});
        });

        // Clean up
        dndState.isDragging = false;
        dndState.callback = undefined;
        element.removeClass("dndDragging");
        element.removeClass("dndDraggingSource");
        event.stopPropagation();

        // In IE9 it is possible that the timeout from dragstart triggers after the dragend handler.
        $timeout(function() { element.removeClass("dndDraggingSource"); }, 0);
    }

    function dragenter(event) {
        event = event.originalEvent || event;

        // Calculate list properties, so that we don't have to repeat this on every dragover event.
        var types = attr.dndAllowedTypes && scope.$eval(attr.dndAllowedTypes);
        listSettings = {
                allowedTypes: angular.isArray(types) && types.join('|').toLowerCase().split('|'),
                disabled: attr.dndDisableIf && scope.$eval(attr.dndDisableIf),
                externalSources: attr.dndExternalSources && scope.$eval(attr.dndExternalSources),
                horizontal: attr.dndHorizontalList && scope.$eval(attr.dndHorizontalList)
        };

        var mimeType = getMimeType(event.dataTransfer.types);
        if (!mimeType || !isDropAllowed(getItemType(mimeType))) return true;
        event.preventDefault();
    }

    function dragover(event) {
        event = event.originalEvent || event;

        // Check whether the drop is allowed and determine mime type.
        var mimeType = getMimeType(event.dataTransfer.types);
        var itemType = getItemType(mimeType);
        if (!mimeType || !isDropAllowed(itemType)) return true;

        // Make sure the placeholder is shown, which is especially important if the list is empty.
        if (placeholderNode.parentNode != listNode) {
            element.append(placeholder);
        }

        if (event.target != listNode) {
            // Try to find the node direct directly below the list node.
            var listItemNode = event.target;
            while (listItemNode.parentNode != listNode && listItemNode.parentNode) {
                listItemNode = listItemNode.parentNode;
            }

            if (listItemNode.parentNode == listNode && listItemNode != placeholderNode) {
                // If the mouse pointer is in the upper half of the list item element,
                // we position the placeholder before the list item, otherwise after it.
                var rect = listItemNode.getBoundingClientRect();
                if (listSettings.horizontal) {
                    var isFirstHalf = event.clientX < rect.left + rect.width / 2;
                } else {
                    var isFirstHalf = event.clientY < rect.top + rect.height / 2;
                }
                listNode.insertBefore(placeholderNode,
                        isFirstHalf ? listItemNode : listItemNode.nextSibling);
            }
        } else {
            var listItemNode = null;
            for(var i = 0; i < listNode.childNodes.length; i++){
                var node = listNode.childNodes[i];
                var rect = node.getBoundingClientRect();
                if (listSettings.horizontal) {
                    if(rect.left > event.clientX) {
                        listItemNode = node;
                        break;
                    }
                } else {
                    if(rect.top > event.clientY) {
                        listItemNode = node;
                        break;
                    }
                }
            }
            if(node){
                listNode.insertBefore(placeholderNode, node);
            }
        }

        // In IE we set a fake effectAllowed in dragstart to get the correct cursor, we therefore
        // ignore the effectAllowed passed in dataTransfer. We must also not access dataTransfer for
        // drops from external sources, as that throws an exception.
        var ignoreDataTransfer = mimeType == MSIE_MIME_TYPE;
        var dropEffect = getDropEffect(event, ignoreDataTransfer);
        if (dropEffect == 'none') return stopDragover();

        // At this point we invoke the callback, which still can disallow the drop.
        // We can't do this earlier because we want to pass the index of the placeholder.
        if (attr.dndDragover && !invokeCallback(attr.dndDragover, event, dropEffect, itemType)) {
            return stopDragover();
        }

        // Set dropEffect to modify the cursor shown by the browser, unless we're in IE, where this
        // is not supported. This must be done after preventDefault in Firefox.
        event.preventDefault();
        if (!ignoreDataTransfer) {
            event.dataTransfer.dropEffect = dropEffect;
        }

        element.addClass("dndDragover");
        event.stopPropagation();
        return false;
    }

    function drop(event) {
        event = event.originalEvent || event;

        // Check whether the drop is allowed and determine mime type.
        var mimeType = getMimeType(event.dataTransfer.types);
        var itemType = getItemType(mimeType);
        if (!mimeType || !isDropAllowed(itemType)) return true;

        // The default behavior in Firefox is to interpret the dropped element as URL and
        // forward to it. We want to prevent that even if our drop is aborted.
        event.preventDefault();

        // Unserialize the data that was serialized in dragstart.
        try {
            var data = JSON.parse(event.dataTransfer.getData(mimeType));
        } catch(e) {
            return stopDragover();
        }

        // Drops with invalid types from external sources might not have been filtered out yet.
        if (mimeType == MSIE_MIME_TYPE || mimeType == EDGE_MIME_TYPE) {
            itemType = data.type || undefined;
            data = data.item;
            if (!isDropAllowed(itemType)) return stopDragover();
        }

        // Special handling for internal IE drops, see dragover handler.
        var ignoreDataTransfer = mimeType == MSIE_MIME_TYPE;
        var dropEffect = getDropEffect(event, ignoreDataTransfer);
        if (dropEffect == 'none') return stopDragover();

        // Invoke the callback, which can transform the transferredObject and even abort the drop.
        var index = getPlaceholderIndex();
        if (attr.dndDrop) {
            data = invokeCallback(attr.dndDrop, event, dropEffect, itemType, index, data);
            if (!data) return stopDragover();
        }

        // The drop is definitely going to happen now, store the dropEffect.
        dndState.dropEffect = dropEffect;
        if (!ignoreDataTransfer) {
            event.dataTransfer.dropEffect = dropEffect;
        }

        // Insert the object into the array, unless dnd-drop took care of that (returned true).
        if (data !== true) {
            scope.$apply(function() {
                scope.$eval(attr.dndList).splice(index, 0, data);
            });
        }
        invokeCallback(attr.dndInserted, event, dropEffect, itemType, index, data);

        // Clean up
        stopDragover();
        event.stopPropagation();
        return false;
    }

    function dragleave(event) {
        event = event.originalEvent || event;
        var widget = event.source;
        var newTarget = document.elementFromPoint(event.clientX, event.clientY);
        if (!event._dndPhShown && listNode.contains(newTarget) && !newTarget.getAttribute('dnd-list')) {
            // Signalize to potential parent lists that a placeholder is already shown.
            event._dndPhShown = true;
        } else {
            stopDragover();
        }
    }




    /**
     * Creates new instance of DND processor
     * 
     * @memberof WbProcessorDnd
     */
    function Processor(){
        WbProcessorAbstract.apply(this);
    };

    // extend functionality
    Processor.prototype = new WbProcessorAbstract();
    Processor.prototype.process = function(widget, event){
        if(event.type !== 'stateChanged') {
            return;
        }
        if(widget.state === 'edit') {
            /*
             * Set the HTML5 draggable attribute on the element.
             */
            widget.setProperty('draggable', 'true');

            /*
             * When the drag operation is started we have to prepare the dataTransfer object,
             * which is the primary way we communicate with the target element
             */
            widget.on('dragstart', dragStart);

            /*
             * The dragend event is triggered when the element was dropped or when the drag
             * operation was aborted (e.g. hit escape button). Depending on the executed action
             * we will invoke the callbacks specified with the dnd-moved or dnd-copied attribute.
             */
            widget.on('dragend', dragEnd);
        } else {
            widget.setProperty('draggable');
            widget.off('dragstart', dragStart);
            widget.off('dragend', dragEnd);
        }
    };
    return Processor;
});
