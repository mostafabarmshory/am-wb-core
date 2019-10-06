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
                margin: '1px',
                padding: '1px',
                layout: {
                    direction: 'column'
                },
                size: {
                    minHeight: '16px',
                    minWidth: '16px'
                }
            }
        },
        // functional properties
        template: function(model){
            var groupType = model.groupType | 'div';
            if(groupType === 'form'){
                return '<form></form>';
            }
            if(groupType === 'section'){
                return '<section></section>';
            }
            return '<div></div>';
        },
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
        template: '<div ng-bind-html="ctrl.text | wbunsafe" class="wb-widget-fill wb-widget-text"></div>',
        /*
         * @ngInject
         */
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

    $widget.setEditor('HtmlText', {
        type: 'WidgetEditorTinymce',
        options:{
            property: 'html',
            inline: true,
            menubar: false,
            plugins: [
                'link',
                'lists',
                'powerpaste',
                'autolink',
                'tinymcespellchecker'],
            toolbar: [
                'undo redo | bold italic underline | fontselect fontsizeselect',
                'forecolor backcolor | alignleft aligncenter alignright alignfull | numlist bullist outdent indent'],
            valid_elements: 'p[style],strong,em,span[style],a[href],ul,ol,li',
            valid_styles: {
                '*': 'font-size,font-family,color,text-decoration,text-align'
            },
            powerpaste_word_import: 'clean',
            powerpaste_html_import: 'clean',
        }
    });
    /**
     * @ngdoc Widgets
     * @name iframe
     * @description Add inline frame to show another document within current one.
     */
    $widget.newWidget({
        // widget description
        type: 'iframe',
        title: 'Inline Frame',
        description: 'Add inline frame to show another document within current one.',
        icon: 'wb-widget-iframe',
        groups: ['basic'],
        model: {
            name: 'iframe',
            sandbox: 'allow-same-origin allow-scripts',
            src: 'https://www.google.com',
            style: {
                padding: '8px'
            }
        },
        // help id
        help: 'http://dpq.co.ir',
        helpId: 'wb-widget-iframe',
        // functional properties
        template: '<iframe>Frame Not Supported?!</iframe>',
        setting: ['iframe'],
        controllerAs: 'ctrl',
        controller: 'MbWidgetIframeCtrl',
    });

    /**
     * @ngdoc Widgets
     * @name input
     * @description Add input to get user value
     * 
     * It is used to create intractive page with users
     */
    $widget.newWidget({
        // widget description
        type: 'input',
        title: 'Input field',
        description: 'A widget to get data from users.',
        icon: 'wb-widget-input',
        groups: ['basic'],
        model: {
            name: 'input',
            sandbox: 'allow-same-origin allow-scripts',
            src: 'https://www.google.com',
            style: {
                padding: '8px'
            }
        },
        // help id
        help: 'http://dpq.co.ir',
        helpId: 'wb-widget-input',
        // functional properties
        template: '<input></input>',
        setting: ['input'],
        controllerAs: 'ctrl',
        controller: 'MbWidgetInputCtrl',
    });

    /**
     * @ngdoc Widgets
     * @name textarea
     * @description Add textarea to get user value
     * 
     * It is used to create textarea
     */
    $widget.newWidget({
        // widget description
        type: 'textarea',
        title: 'Text Area field',
        description: 'A widget to get data from users.',
        icon: 'wb-widget-textarea',
        groups: ['basic'],
        model: {
            name: 'textarea',
            style: {
                padding: '8px'
            }
        },
        // help id
        help: 'http://dpq.co.ir',
        helpId: 'wb-widget-textarea',
        // functional properties
        template: '<textarea></textarea>',
        setting: ['textarea'],
        controllerAs: 'ctrl',
        controller: 'MbWidgetTextareaCtrl',
    });

    /**
     * @ngdoc Widgets
     * @name a
     * @description Add a to get user value
     * 
     * It is used to create textarea
     */
    $widget.newWidget({
        // widget description
        type: 'a',
        title: 'A link',
        description: 'A widget to add external link. It is used as block item.',
        icon: 'wb-widget-a',
        groups: ['basic'],
        model: {
            name: 'Link',
            style: {
                padding: '8px'
            }
        },
        // help id
        help: 'http://dpq.co.ir',
        helpId: 'wb-widget-a',
        // functional properties
        template: '<a></a>',
        setting: ['a'],
        controllerAs: 'ctrl',
        controller: 'MbWidgetACtrl'
    });



    /**
     * @ngdoc Widgets
     * @name p
     * @description Add p to get user value
     * 
     * It is used to create p
     */
    $widget.newWidget({
        // widget description
        type: 'p',
        title: 'Paragraph',
        description: 'A widget to add paragraph.',
        icon: 'wb-widget-p',
        groups: ['basic'],
        model: {
            name: 'Pragraph',
            style: {
                padding: '8px'
            }
        },
        // help id
        help: 'http://dpq.co.ir',
        helpId: 'wb-widget-p',
        // functional properties
        template: '<p></p>',
        controllerAs: 'ctrl',
        controller: 'MbWidgetHtmlCtrl'
    });

    $widget.setEditor('p', {
        type: 'WidgetEditorTinymce',
        options:{
            property: 'html',
            inline: true,
            menubar: false,
            plugins: [
                'link',
                'lists',
                'powerpaste',
                'autolink',
                'tinymcespellchecker'],
            toolbar: [
                'undo redo | bold italic underline | fontselect fontsizeselect',
                'forecolor backcolor | alignleft aligncenter alignright alignfull | numlist bullist outdent indent'],
            valid_elements: 'p[style],strong,em,span[style],a[href],ul,ol,li',
            valid_styles: {
                '*': 'font-size,font-family,color,text-decoration,text-align'
            },
            powerpaste_word_import: 'clean',
            powerpaste_html_import: 'clean',
        }
    });
    
    /**
     * @ngdoc Widgets
     * @name progress
     * @description Add Progress into the page
     */
    $widget.newWidget({
        // widget description
        type: 'progress',
        title: 'Progress',
        description: 'A widget to add progress.',
        icon: 'wb-widget-progress',
        groups: ['basic'],
        model: {
            name: 'progress',
            style: {
                padding: '8px',
                margin: '8px',
                size: {
                    height: '30px'
                }
            }
        },
        // help id
        help: 'http://dpq.co.ir',
        helpId: 'wb-widget-progress',
        // functional properties
        template: '<progress value="22" max="100"></progress>',
        controllerAs: 'ctrl',
        controller: 'MbWidgetProgressCtrl'
    });

    
    /**
     * @ngdoc Widgets
     * @name progress
     * @description Add Progress into the page
     */
    $widget.newWidget({
        // widget description
        type: 'meta',
        title: 'Meta',
        description: 'A widget to add meta data.',
        icon: 'wb-widget-meta',
        groups: ['basic'],
        model: {
            name: 'name',
            content: 'content',
            style: {
                margin: '8px',
                background: {
                	color: '#313131',
                },
                border: {
	                style:  "dotted",
	                color:  "#afafaf"
                },
                color:  "#ffffff",
            	padding:  "8px"
            }
        },
        // help id
        help: 'http://dpq.co.ir',
        helpId: 'wb-widget-meta',
        // functional properties
        template: '<meta></meta>',
        controllerAs: 'ctrl',
        controller: 'MbWidgetMetaCtrl'
    });

    var headerEditorDescription =  {
            type: 'WidgetEditorTinymce',
            options:{
                property: 'html',
                inline: true,
                menubar: false,
                plugins: [
                  'lists',
                  'powerpaste',
                  'autolink'
                ],
                toolbar: 'undo redo | bold italic underline',
                valid_elements: 'strong,em,span[style],a[href]',
                valid_styles: {
                  '*': 'font-size,font-family,color,text-decoration,text-align'
                },
                powerpaste_word_import: 'clean',
                powerpaste_html_import: 'clean',
            }
    };
    $widget.setEditor('a', headerEditorDescription);

    /**
     * @ngdoc Widgets
     * @name h1
     * @description Header of level 1
     * 
     * It is used to create h1
     */
    for(var i = 1; i < 7; i++){
        var type = 'h'+i;
        $widget.setEditor(type, headerEditorDescription);
        $widget.newWidget({
            // widget description
            type: type,
            title: 'Header Level '+i,
            description: 'A header widget',
            icon: 'wb-widget-h'+i,
            groups: ['basic'],
            model: {
                name: 'Header-'+i,
                style: {
                    padding: '8px'
                }
            },
            // help id
            help: 'http://dpq.co.ir',
            helpId: 'wb-widget-hx',
            // functional properties
            template: '<h' +i +'></h' + i + '>',
            controllerAs: 'ctrl',
            controller:'MbWidgetHtmlCtrl'
        });
    }
});
