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
})


/***********************************************************************
 * Editors
 ***********************************************************************/
.run(function ($widget) {

	/***************************************
	 * Section editor
	 * 
	 *  A section is combination of blocks
	 * widgets such as h, p, and pre. This 
	 * is an editor to edit the section.
	 ***************************************/
	$widget.setEditor('section', {
		type: 'WidgetEditorTinymceSection',
		options:{
			inline: true,
			menubar: false,
			plugins: ['link', 'lists', 'powerpaste', 'autolink'],
			// Toolbar
			toolbar: ['close save | undo redo | bold italic underline | fontselect fontsizeselect | forecolor backcolor | alignleft aligncenter alignright alignfull | numlist bullist outdent indent'],
			fixed_toolbar_container: '#demo-widget-editor-toolbar',
		    toolbar_drawer: 'floating'
		}
	});
	
	
	
	
	
	// Editors
	var headerEditorDescription =  {
			type: 'WidgetEditorTinymce',
			options:{
				property: 'html',
				inline: true,
				menubar: false,
				plugins: ['lists', 'powerpaste', 'autolink'],
				valid_elements: 'strong,em,span[style],a[href]',
				powerpaste_word_import: 'clean',
				powerpaste_html_import: 'clean',
				// Toolbar
				toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignjustify alignright alignfull ',
				fixed_toolbar_container: '#demo-widget-editor-toolbar'
			}
	};
	$widget.setEditor('a', headerEditorDescription);

	for(var i = 1; i < 7; i++){
		var type = 'h'+i;
		$widget.setEditor(type, headerEditorDescription);
	}

	$widget.setEditor('pre', {
		type: 'WidgetEditorCode',
		options: {}
	});

	$widget.setEditor('p', {
		type: 'WidgetEditorTinymce',
		options:{
			property: 'html',
			inline: true,
			menubar: false,
			plugins: ['link', 'lists', 'powerpaste', 'autolink'],
			toolbar: ['undo redo | bold italic underline | fontselect fontsizeselect', 'forecolor backcolor | alignleft aligncenter alignright alignfull | numlist bullist outdent indent'],
			valid_elements: 'p[style],strong,em,span[style],a[href],img,q',
			valid_styles: {
				'*': 'font-size,font-family,color,text-decoration,text-align '
			},
			powerpaste_word_import: 'clean',
			powerpaste_html_import: 'clean',
		}
	});
});


