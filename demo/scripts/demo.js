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

angular.module('am-wb-coreTest', [ 'am-wb-core'])//

.controller('MyTestEditorCtrl', function($scope, $element, $http, $widget, $wbUtil) {

//  <md-option ng-value="'examples/empty.json'">Empty</md-option>
//  <md-option ng-value="'examples/center.json'">Center</md-option>
//  <md-option ng-value="'examples/larg-text.json'">Larg text</md-option>
//  <md-option ng-value="'examples/hx.json'">Headers</md-option>
//  <md-option ng-value="'examples/row.json'">Row</md-option>
//  <md-option ng-value="'examples/section.json'">Sections</md-option>
//  <md-option ng-value="'examples/image.json'">Image</md-option>
//  <md-option ng-value="'examples/iframe.json'">IFrame</md-option>
//  <md-option ng-value="'examples/list.json'">List</md-option>
//  <md-option ng-value="'examples/unvisible.json'">Unvisible</md-option>
//  <md-option ng-value="'examples/picture.json'">Picture</md-option>
//  <md-option ng-value="'examples/audio.json'">Audio</md-option>
//  <md-option ng-value="'examples/video.json'">Video</md-option>
//  <md-option ng-value="'examples/input.json'">Input Change</md-option>

    this.setModel = function(model){
        this.model = $wbUtil.clean(model);
        $widget.compile(this.model, null, $element);
    };

    this.setDocumentPath = function(path){
        var ctrl = this;
        return $http.get(path)
        .then(function(res) {
            return ctrl.setModel(res.data);
        });
    };

    $scope.$on('$destroy', function(){
//      if(locatorProcessor){
//      locatorProcessor.setEnable(false);
//      }
//      if(selectProcessor){
//      selectProcessor.setEnable(false);
//      }
    });

    this.setDocumentPath('examples/list.json');
});