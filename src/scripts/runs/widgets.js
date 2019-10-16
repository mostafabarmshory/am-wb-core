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
        template: '<div></div>',
        help: 'http://dpq.co.ir/more-information-link',
        helpId: 'wb-widget-group',
        controller: 'WbWidgetGroup'
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
        template: '<div></div>',
        controller: 'WbWidgetAbstractHtml',
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
        controller: 'WbWidgetIframe',
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
        controller: 'WbWidgetA'
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
        controller: 'WbWidgetP'
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
//    menubar: true,
//    inline: true,
//    theme: 'modern',
//    plugins : ['advlist','autolink','autoresize','autosave','bbcode','charmap',
//        'code','codesample','colorpicker','contextmenu', 'directionality','emoticons',
//        'hr','image','imagetools','importcss','insertdatetime','legacyoutput',
//        'link','lists','media','nonbreaking','noneditable','paste','save','searchreplace',
//        'spellchecker','tabfocus','table','template','textcolor','textpattern',
//        'toc','visualblocks','wordcount'
//    ],
//    toolbar: [
//        'fullscreen | undo redo | bold italic underline | formatselect fontselect fontsizeselect | visualblocks',
//        'forecolor backcolor | ltr rtl | alignleft aligncenter alignjustify alignright alignfull | numlist bullist outdent indent'
//    ],
//    powerpaste_word_import: 'clean',
//    powerpaste_html_import: 'clean',
//    format: 'raw'
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
            controller:'WbWidgetAbstractHtml'
        });
    }
    
    
    

    /**
     * @ngdoc Widgets
     * @name Link
     * @description A widget to add document link 
     */
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
    
    /**
     * @ngdoc Widgets
     * @name pre
     * @description A widget to add Preformatted text
     */
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
    

    $widget.setEditor('pre', {
        type: 'WidgetEditorCode',
        options: {}
    });
    
    /**
	 * @ngdoc Widgets
	 * @name img
	 * @description Image widget
	 * 
	 * Display an image with meta tag for SEO. Here is minimal list of attributes:
     */
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
//	controller: function ($scope) {
//		var keys = ['fit', 'url', 'description', 'label', 'keywords'];
//		this.setUrl = function (url) {
//			this.url = url;
//		};
//		/**
//		 * Loads all parameters from model
//		 * 
//		 * @memberof AmWbCommonVideoCtrl
//		 */
//		this.fillMedia = function () {
//			for (var i = 0; i < keys.length; i++) {
//				var key = keys[i];
//				this[key] = this.getModelProperty(key);
//			}
//		};
//		/**
//		 * Initialize the widget
//		 * 
//		 * @memberof AmWbCommonVideoCtrl
//		 */
//		this.initWidget = function () {
//			var ctrl = this;
//
//			// pass event to setting panel if video loaded successfully
//			this.onLoad = function () {
//				var event = {};
//				event.source = ctrl;
//				event.key = 'success';
//				ctrl.fire('success', event);
//			};
//
//			// pass event to setting panel if video doesn't load successfully
//			this.onError = function () {
//				var event = {};
//				event.source = ctrl;
//				event.key = 'failure';
//				ctrl.fire('error', event);
//			};
//
//			this.on('modelUpdated', function ($event) {
//				if (keys.indexOf($event.key) > -1) {
//					var key = $event.key;
//					ctrl[key] = ctrl.getModelProperty(key);
//				}
//			});
//			this.on('runtimeModelUpdated', function ($event) {
//				if (keys.indexOf($event.key) > -1) {
//					var key = $event.key;
//					ctrl[key] = ctrl.getProperty(key);
//				}
//			});
//			this.on('modelChanged', function () {
//				ctrl.fillMedia();
//			});
//			this.fillMedia();
//		};
//	},
//	controllerAs: 'ctrl'
//});
    
    
    
    
    
    
    
    
    
    
    
    
    
//	$widget.newWidget({
//		// widget
//		type: 'CommonVideoPlayer',
//		title: 'Video Player',
//		description: 'A video player component.',
//		groups: ['commons'],
//		icon: 'wb-common-video',
//		// help
//		help: 'https://gitlab.com/weburger/am-wb-common/wikis/video-player',
//		helpId: '',
//		// page
//		templateUrl: 'views/am-wb-common-widgets/video-player.html',
//		controller: 'AmWbCommonVideoCtrl',
//		controllerAs: 'ctrl',
//		setting: ['common-video-player', 'SEO']
//	});
	// NOTE: audio is moved to core component
//	$widget.newWidget({
//		// widget
//		type: 'CommonAudioPlayer',
//		title: 'Audio Player',
//		description: 'An audio player component.',
//		groups: ['commons'],
//		icon: 'wb-common-audio',
//		// help
//		help: 'https://gitlab.com/weburger/am-wb-common/wikis/audio-player',
//		helpId: '',
//		// page
//		templateUrl: 'views/am-wb-common-widgets/audio-player.html',
//		controller: 'AmWbCommonAudioCtrl',
//		controllerAs: 'ctrl',
//		setting: ['common-audio-player']
//	});
    
});
