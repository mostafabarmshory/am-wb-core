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

/***********************************************************************
 * Editors
 ***********************************************************************/
.run(function ($widget) {
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
                toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignjustify alignright alignfull ',
                valid_elements: 'strong,em,span[style],a[href]',
                valid_styles: {
                  '*': 'font-size,font-family,color,text-decoration,text-align'
                },
                powerpaste_word_import: 'clean',
                powerpaste_html_import: 'clean',
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
            plugins: [
                'link',
                'lists',
                'powerpaste',
                'autolink',
                'tinymcespellchecker'],
            toolbar: [
                'undo redo | bold italic underline | fontselect fontsizeselect',
                'forecolor backcolor | alignleft aligncenter alignright alignfull | numlist bullist outdent indent'],
            valid_elements: 'p[style],strong,em,span[style],a[href],img,q',
            valid_styles: {
                '*': 'font-size,font-family,color,text-decoration,text-align '
            },
            powerpaste_word_import: 'clean',
            powerpaste_html_import: 'clean',
        }
    });
    

    $widget.setEditor('HtmlText', {
        type: 'WidgetEditorDeprecated',
        options:{}
    });
})

/***********************************************************************
 * Widgets
 ***********************************************************************/
.run(function ($widget) {
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
        template: '<div></div>',
        help: 'http://dpq.co.ir/more-information-link',
        helpId: 'wb-widget-group',
        controller: 'WbWidgetGroup'
    });

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
        template: '<div></div>',
        controller: 'WbWidgetAbstractHtml',
    });
    
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
        controller: 'WbWidgetIframe',
    });

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
        controller: 'WbWidgetInput',
        controllerAs: 'ctrl',
    });

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
        controller: 'WbWidgetTextarea',
    });

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
        controller: 'WbWidgetA'
    });

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
        controller: 'WbWidgetP'
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
        controller: 'WbWidgetProgress'
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
        controller: 'WbWidgetMeta'
    });

    for(var i = 1; i < 7; i++){
        var type = 'h'+i;
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
            controller:'WbWidgetAbstractHtml'
        });
    }
    
    $widget.newWidget({
        type: 'link',
        title: 'Link',
        label: 'link',
        icon: 'wb-widget-link',
        description: 'A widget to insert an link to page.',
        groups: ['basic'],
        setting: ['link'],
        template: '<link></link>',
        help: 'http://dpq.co.ir/more-information-link',
        model: {
            html: 'Link',
            url: 'http://www.gitlab.com/am-wb/am-wb-common'
        },
        controllerAs: 'ctrl',
        controller: 'WbWidgetLink', 
    });
    
    $widget.newWidget({
        type: 'pre',
        title: 'Preformatted',
        label: 'preformatted',
        icon: 'wb-widget-pre',
        description: 'A widget to insert an Preformatted text to page.',
        groups: ['basic'],
        template: '<pre></pre>',
        help: 'http://dpq.co.ir/more-information-pre',
        model: {
            html: 'class A {\n\tint a;\n}',
        },
        controller: 'WbWidgetPre', 
        controllerAs: 'ctrl'
    });
    
    $widget.newWidget({
    	type: 'img',
    	title: 'Image',
    	label: 'image',
    	icon: 'wb-widget-img',
    	description: 'A widget to insert an link to page.',
    	groups: ['basic'],
    	setting: ['img'],
    	template: '<img></img>',
    	help: 'http://dpq.co.ir/more-information-img',
    	model: {
    		html: 'img',
    		src: 'http://www.gitlab.com/am-wb/am-wb-commonhttps://unsplash.com/photos/8emNXIvrCL8/download?force=true'
    	},
    	controllerAs: 'ctrl',
    	controller: 'WbWidgetImg', 
    });
    
    $widget.newWidget({
        type: 'source',
        title: 'Source',
        label: 'source',
        icon: 'wb-widget-source',
        description: 'This widget is used to add source in the document.',
        groups: ['basic'],
        setting: ['source'],
        template: '<source></source>',
        help: 'http://dpq.co.ir/more-information-source',
        model: {
            media: '(min-width: 650px)',
            src: 'http://www.gitlab.com/am-wb/am-wb-commonhttps://unsplash.com/photos/8emNXIvrCL8/download?force=true'
        },
        controller: 'WbWidgetSource', 
    });
    
    $widget.newWidget({
        type: 'picture',
        title: 'Picture',
        label: 'picture',
        icon: 'wb-widget-picture',
        description: 'This widget is used to add picture in the document.',
        groups: ['basic'],
        setting: ['picture'],
        template: '<picture></picture>',
        help: 'http://dpq.co.ir/more-information-picture',
        model: {
            media: '(min-width: 650px)',
            src: 'http://www.gitlab.com/am-wb/am-wb-commonhttps://unsplash.com/photos/8emNXIvrCL8/download?force=true'
        },
        controller: 'WbWidgetPicture', 
    });
    
    $widget.newWidget({
        type: 'audio',
        title: 'Audio',
        label: 'audio',
        icon: 'wb-widget-audio',
        description: 'This widget is used to add audio in the document.',
        groups: ['basic'],
        setting: ['audio'],
        template: '<audio></audio>',
        help: 'http://dpq.co.ir/more-information-audio',
        model: {
            media: '(min-width: 650px)',
            src: 'http://www.gitlab.com/am-wb/am-wb-commonhttps://unsplash.com/photos/8emNXIvrCL8/download?force=true'
        },
        controller: 'WbWidgetAudio', 
    });
    
    $widget.newWidget({
        type: 'video',
        title: 'Video',
        label: 'video',
        icon: 'wb-widget-video',
        description: 'This widget is used to add video in the document.',
        groups: ['basic'],
        setting: ['video'],
        template: '<video></video>',
        help: 'http://dpq.co.ir/more-information-audio',
        model: {
            media: '(min-width: 650px)',
            src: 'http://www.gitlab.com/am-wb/am-wb-commonhttps://unsplash.com/photos/8emNXIvrCL8/download?force=true'
        },
        controller: 'WbWidgetVideo', 
    });
    
});
