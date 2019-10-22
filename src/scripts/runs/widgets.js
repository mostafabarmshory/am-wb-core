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
 * Convertors
 ***********************************************************************/
.run(function ($widget, WbConverterWeburger, WbConverterDom, WbConverterText) {
    $widget.addConverter(new WbConverterWeburger());
    $widget.addConverter(new WbConverterDom());
    $widget.addConverter(new WbConverterText());
})
/***********************************************************************
 * Processors
 ***********************************************************************/
.run(function ($widget, WbProcessorMicrodata, WbProcessorStyle, WbProcessorEvent, WbProcessorAttribute) {
    $widget.setProcessor('microdata', new WbProcessorMicrodata());
    $widget.setProcessor('style', new WbProcessorStyle());
    $widget.setProcessor('event', new WbProcessorEvent());
    $widget.setProcessor('attribut', new WbProcessorAttribute());
})
/***********************************************************************
 * Editors
 ***********************************************************************/
.run(function ($widget) {
    // Editors
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
        type: 'a',
        title: 'A link',
        description: 'A widget to add external link. It is used as block item.',
        icon: 'wb-widget-a',
        groups: ['basic'],
        // help id
        help: 'http://dpq.co.ir',
        helpId: 'wb-widget-a',
        // functional properties
        template: '<a></a>',
        model: {
            html: 'Link title'
        },
        setting: ['a'],
        controller: 'WbWidgetA'
    });
    $widget.newWidget({
        // widget description
        type: 'address',
        title: 'address',
        description: 'description.',
        icon: 'wb-widget-address',
        groups: ['basic'],
        // help id
        help: 'http://dpq.co.ir',
        helpId: 'wb-widget-address',
        // functional properties
        template: '<address></address>',
        setting: ['address'],
        controller: 'WbWidgetAddress'
    });
    $widget.newWidget({
        // widget description
        type: 'applet',
        title: 'applet',
        description: 'applet.',
        icon: 'wb-widget-applet',
        groups: ['basic'],
        // help id
        help: 'http://dpq.co.ir',
        helpId: 'wb-widget-applet',
        // functional properties
        template: '<applet></applet>',
        setting: ['applet'],
        controller: 'WbWidgetApplet'
    });
    $widget.newWidget({
        // widget description
        type: 'area',
        title: 'area',
        description: 'area',
        icon: 'wb-widget-area',
        groups: ['basic'],
        // help id
        help: 'http://dpq.co.ir',
        helpId: 'wb-widget-area',
        // functional properties
        template: '<area></area>',
        setting: ['area'],
        controller: 'WbWidgetArea'
    });
    $widget.newWidget({
        // widget description
        type: 'article',
        title: 'article',
        description: 'article',
        icon: 'wb-widget-article',
        groups: ['basic'],
        // help id
        help: 'http://dpq.co.ir',
        helpId: 'wb-widget-article',
        // functional properties
        template: '<article></article>',
        setting: ['article'],
        controller: 'WbWidgetArticle'
    });
    $widget.newWidget({
        // widget description
        type: 'aside',
        title: 'aside',
        description: 'aside',
        icon: 'wb-widget-aside',
        groups: ['basic'],
        // help id
        help: 'http://dpq.co.ir',
        helpId: 'wb-widget-aside',
        // functional properties
        template: '<aside></aside>',
        setting: ['aside'],
        controller: 'WbWidgetAside'
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
        type: 'blockquote',
        title: 'blockquote',
        label: 'blockquote',
        icon: 'wb-widget-blockquote',
        description: 'description',
        groups: ['basic'],
        setting: ['blockquote'],
        template: '<blockquote></blockquote>',
        help: 'http://dpq.co.ir/more-information-blockquote',
        controller: 'WbWidgetBlockquote', 
    });
    $widget.newWidget({
        type: 'button',
        title: 'button',
        label: 'button',
        icon: 'wb-widget-button',
        description: 'description',
        groups: ['basic'],
        setting: ['button'],
        template: '<button></button>',
        help: 'http://dpq.co.ir/more-information-button',
        controller: 'WbWidgetButton', 
    });
    $widget.newWidget({
        type: 'canvas',
        title: 'canvas',
        label: 'canvas',
        icon: 'wb-widget-canvas',
        description: 'description',
        groups: ['basic'],
        setting: ['canvas'],
        template: '<canvas></canvas>',
        help: 'http://dpq.co.ir/more-information-canvas',
        controller: 'WbWidgetCanvas', 
    });
    $widget.newWidget({
        type: 'datalist',
        title: 'datalist',
        label: 'datalist',
        icon: 'wb-widget-datalist',
        description: 'description',
        groups: ['basic'],
        setting: ['datalist'],
        template: '<datalist></datalist>',
        help: 'http://dpq.co.ir/more-information-datalist',
        controller: 'WbWidgetDatalist', 
    });
    $widget.newWidget({
        type: 'dd',
        title: 'dd',
        label: 'dd',
        icon: 'wb-widget-dd',
        description: 'description',
        groups: ['basic'],
        setting: ['dd'],
        template: '<dd></dd>',
        help: 'http://dpq.co.ir/more-information-dd',
        controller: 'WbWidgetDd', 
    });
    $widget.newWidget({
        type: 'details',
        title: 'details',
        label: 'details',
        icon: 'wb-widget-details',
        description: 'description',
        groups: ['basic'],
        setting: ['details'],
        template: '<details></details>',
        help: 'http://dpq.co.ir/more-information-details',
        controller: 'WbWidgetDetails', 
    });
    $widget.newWidget({
        type: 'dialog',
        title: 'dialog',
        label: 'dialog',
        icon: 'wb-widget-dialog',
        description: 'description',
        groups: ['basic'],
        setting: ['dialog'],
        template: '<dialog></dialog>',
        help: 'http://dpq.co.ir/more-information-dialog',
        controller: 'WbWidgetDialog', 
    });
    $widget.newWidget({
        type: 'div',
        title: 'div',
        label: 'div',
        icon: 'wb-widget-div',
        description: 'description',
        groups: ['basic'],
        setting: ['div'],
        template: '<div></div>',
        help: 'http://dpq.co.ir/more-information-div',
        controller: 'WbWidgetDiv',
        isLeaf: false
    });
    $widget.newWidget({
        type: 'dl',
        title: 'dl',
        label: 'dl',
        icon: 'wb-widget-dl',
        description: 'description',
        groups: ['basic'],
        setting: ['dl'],
        template: '<dl></dl>',
        help: 'http://dpq.co.ir/more-information-dl',
        controller: 'WbWidgetDl', 
    });
    $widget.newWidget({
        type: 'dt',
        title: 'dt',
        label: 'dt',
        icon: 'wb-widget-dt',
        description: 'description',
        groups: ['basic'],
        setting: ['dt'],
        template: '<dt></dt>',
        help: 'http://dpq.co.ir/more-information-dt',
        controller: 'WbWidgetDt', 
    });
    $widget.newWidget({
        type: 'embed',
        title: 'embed',
        label: 'embed',
        icon: 'wb-widget-embed',
        description: 'description',
        groups: ['basic'],
        setting: ['embed'],
        template: '<embed></embed>',
        help: 'http://dpq.co.ir/more-information-embed',
        controller: 'WbWidgetEmbed', 
    });
    $widget.newWidget({
        type: 'fieldset',
        title: 'fieldset',
        label: 'fieldset',
        icon: 'wb-widget-fieldset',
        description: 'description',
        groups: ['basic'],
        setting: ['fieldset'],
        template: '<fieldset></fieldset>',
        help: 'http://dpq.co.ir/more-information-fieldset',
        controller: 'WbWidgetFieldset', 
    });
    $widget.newWidget({
        type: 'figcaption',
        title: 'figcaption',
        label: 'figcaption',
        icon: 'wb-widget-figcaption',
        description: 'description',
        groups: ['basic'],
        setting: ['figcaption'],
        template: '<figcaption></figcaption>',
        help: 'http://dpq.co.ir/more-information-figcaption',
        controller: 'WbWidgetFigcaption', 
    });
    $widget.newWidget({
        type: 'figure',
        title: 'figure',
        label: 'figure',
        icon: 'wb-widget-figure',
        description: 'description',
        groups: ['basic'],
        setting: ['figure'],
        template: '<figure></figure>',
        help: 'http://dpq.co.ir/more-information-figure',
        controller: 'WbWidgetFigure', 
    });
    $widget.newWidget({
        type: 'footer',
        title: 'footer',
        label: 'footer',
        icon: 'wb-widget-footer',
        description: 'description',
        groups: ['basic'],
        setting: ['footer'],
        template: '<footer></footer>',
        help: 'http://dpq.co.ir/more-information-footer',
        controller: 'WbWidgetFooter', 
    });
    $widget.newWidget({
        type: 'form',
        title: 'form',
        label: 'form',
        icon: 'wb-widget-form',
        description: 'description',
        groups: ['basic'],
        setting: ['form'],
        template: '<form></form>',
        help: 'http://dpq.co.ir/more-information-form',
        controller: 'WbWidgetForm', 
        isLeaf: false
    });
    $widget.newWidget({
        type: 'frame',
        title: 'frame',
        label: 'frame',
        icon: 'wb-widget-form',
        description: 'description',
        groups: ['basic'],
        setting: ['frame'],
        template: '<frame></frame>',
        help: 'http://dpq.co.ir/more-information-frame',
        controller: 'WbWidgetFrame', 
    });
    $widget.newWidget({
        type: 'frameset',
        title: 'frameset',
        label: 'frameset',
        icon: 'wb-widget-frameset',
        description: 'description',
        groups: ['basic'],
        setting: ['frameset'],
        template: '<frameset></frameset>',
        help: 'http://dpq.co.ir/more-information-frameset',
        controller: 'WbWidgetFrameset', 
        isLeaf: false
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
            controller:'WbWidgetH'+i
        });
    }
    $widget.newWidget({
        type: 'header',
        title: 'header',
        label: 'header',
        icon: 'wb-widget-header',
        description: 'description',
        groups: ['basic'],
        setting: ['header'],
        template: '<header></header>',
        help: 'http://dpq.co.ir/more-information-header',
        controller: 'WbWidgetHeader', 
        isLeaf: false
    });
    $widget.newWidget({
        type: 'hr',
        title: 'hr',
        label: 'hr',
        icon: 'wb-widget-hr',
        description: 'description',
        groups: ['basic'],
        setting: ['hr'],
        template: '<hr></hr>',
        help: 'http://dpq.co.ir/more-information-hr',
        controller: 'WbWidgetHr', 
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
        type: 'kbd',
        title: 'kbd',
        label: 'kbd',
        icon: 'wb-widget-kbd',
        description: 'description',
        groups: ['basic'],
        setting: ['kbd'],
        template: '<kbd></kbd>',
        help: 'http://dpq.co.ir/more-information-kbd',
        controller: 'WbWidgetKbd', 
    });
    $widget.newWidget({
        type: 'label',
        title: 'label',
        label: 'label',
        icon: 'wb-widget-label',
        description: 'description',
        groups: ['basic'],
        setting: ['label'],
        template: '<label></label>',
        help: 'http://dpq.co.ir/more-information-label',
        controller: 'WbWidgetLabel', 
    });
    $widget.newWidget({
        type: 'legend',
        title: 'legend',
        label: 'legend',
        icon: 'wb-widget-legend',
        description: 'description',
        groups: ['basic'],
        setting: ['legend'],
        template: '<legend></legend>',
        help: 'http://dpq.co.ir/more-information-label',
        controller: 'WbWidgetLegend', 
    });
    $widget.newWidget({
        type: 'li',
        title: 'li',
        label: 'li',
        icon: 'wb-widget-li',
        description: 'description',
        groups: ['basic'],
        setting: ['legend'],
        template: '<li></li>',
        help: 'http://dpq.co.ir/more-information-li',
        controller: 'WbWidgetLi', 
    });
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
        type: 'main',
        title: 'main',
        label: 'main',
        icon: 'wb-widget-main',
        description: 'A widget to insert an link to page.',
        groups: ['basic'],
        setting: ['main'],
        template: '<main></main>',
        help: 'http://dpq.co.ir/more-information-main',
        controller: 'WbWidgetMain', 
        isLeaf: false
    });
    $widget.newWidget({
        type: 'map',
        title: 'map',
        label: 'map',
        icon: 'wb-widget-map',
        description: 'description',
        groups: ['basic'],
        setting: ['map'],
        template: '<map></map>',
        help: 'http://dpq.co.ir/more-information-map',
        controller: 'WbWidgetMap', 
        isLeaf: false
    });
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
    $widget.newWidget({
        type: 'meter',
        title: 'meter',
        label: 'meter',
        icon: 'wb-widget-meter',
        description: 'description',
        groups: ['basic'],
        setting: ['meter'],
        template: '<meter></meter>',
        help: 'http://dpq.co.ir/more-information-meter',
        controller: 'WbWidgetMeter', 
    });
    $widget.newWidget({
        type: 'nav',
        title: 'nav',
        label: 'nav',
        icon: 'wb-widget-nav',
        description: 'description',
        groups: ['basic'],
        setting: ['nav'],
        template: '<nav></nav>',
        help: 'http://dpq.co.ir/more-information-nav',
        controller: 'WbWidgetNav', 
        isLeaf: false
    });
    $widget.newWidget({
        type: 'noscript',
        title: 'noscript',
        label: 'noscript',
        icon: 'wb-widget-noscript',
        description: 'description',
        groups: ['basic'],
        setting: ['noscript'],
        template: '<noscript></noscript>',
        help: 'http://dpq.co.ir/more-information-noscript',
        controller: 'WbWidgetNoscript', 
    });
    $widget.newWidget({
        type: 'object',
        title: 'object',
        label: 'object',
        icon: 'wb-widget-object',
        description: 'description',
        groups: ['basic'],
        setting: ['object'],
        template: '<object></object>',
        help: 'http://dpq.co.ir/more-information-object',
        controller: 'WbWidgetObject', 
        isLeaf: false
    });
    $widget.newWidget({
        type: 'ol',
        title: 'ol',
        label: 'ol',
        icon: 'wb-widget-ol',
        description: 'description',
        groups: ['basic'],
        setting: ['ol'],
        template: '<ol></ol>',
        help: 'http://dpq.co.ir/more-information-ol',
        controller: 'WbWidgetOl', 
        isLeaf: false
    });
    $widget.newWidget({
        type: 'optgroup',
        title: 'optgroup',
        label: 'optgroup',
        icon: 'wb-widget-optgroup',
        description: 'description',
        groups: ['basic'],
        setting: ['optgroup'],
        template: '<optgroup></optgroup>',
        help: 'http://dpq.co.ir/more-information-optgroup',
        controller: 'WbWidgetOptgroup', 
        isLeaf: false
    });
    $widget.newWidget({
        type: 'option',
        title: 'option',
        label: 'option',
        icon: 'wb-widget-option',
        description: 'description',
        groups: ['basic'],
        setting: ['option'],
        template: '<option></option>',
        help: 'http://dpq.co.ir/more-information-option',
        controller: 'WbWidgetOption', 
    });
    $widget.newWidget({
        type: 'output',
        title: 'output',
        label: 'output',
        icon: 'wb-widget-output',
        description: 'description',
        groups: ['basic'],
        setting: ['output'],
        template: '<output></output>',
        help: 'http://dpq.co.ir/more-information-output',
        controller: 'WbWidgetOutput', 
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
    $widget.newWidget({
        type: 'param',
        title: 'param',
        label: 'param',
        icon: 'wb-widget-param',
        description: 'description',
        groups: ['basic'],
        setting: ['param'],
        template: '<param></param>',
        help: 'http://dpq.co.ir/more-information-param',
        controller: 'WbWidgetParam', 
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
        isLeaf: false
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
    $widget.newWidget({
        type: 'q',
        title: 'q',
        label: 'q',
        icon: 'wb-widget-q',
        description: 'description',
        groups: ['basic'],
        setting: ['q'],
        template: '<q></q>',
        help: 'http://dpq.co.ir/more-information-q',
        controller: 'WbWidgetQ', 
    });
    $widget.newWidget({
        type: 'script',
        title: 'script',
        label: 'script',
        icon: 'wb-widget-script',
        description: 'description',
        groups: ['basic'],
        setting: ['script'],
        template: '<script></script>',
        help: 'http://dpq.co.ir/more-information-script',
        controller: 'WbWidgetScript', 
    });
    $widget.newWidget({
        type: 'section',
        title: 'section',
        label: 'section',
        icon: 'wb-widget-section',
        description: 'description',
        groups: ['basic'],
        setting: ['section'],
        template: '<section></section>',
        help: 'http://dpq.co.ir/more-information-section',
        controller: 'WbWidgetSection', 
        isLeaf: false
    });
    $widget.newWidget({
        type: 'select',
        title: 'select',
        label: 'select',
        icon: 'wb-widget-select',
        description: 'description',
        groups: ['basic'],
        setting: ['select'],
        template: '<select></select>',
        help: 'http://dpq.co.ir/more-information-select',
        controller: 'WbWidgetSelect', 
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
        type: 'style',
        title: 'style',
        label: 'style',
        icon: 'wb-widget-style',
        description: 'description',
        groups: ['basic'],
        setting: ['style'],
        template: '<style></style>',
        help: 'http://dpq.co.ir/more-information-style',
        controller: 'WbWidgetStyle', 
    });
    $widget.newWidget({
        type: 'summary',
        title: 'summary',
        label: 'summary',
        icon: 'wb-widget-summary',
        description: 'description',
        groups: ['basic'],
        setting: ['summary'],
        template: '<summary></summary>',
        help: 'http://dpq.co.ir/more-information-summary',
        controller: 'WbWidgetSummary', 
        isLeaf: false
    });
    $widget.newWidget({
        type: 'svg',
        title: 'svg',
        label: 'svg',
        icon: 'wb-widget-svg',
        description: 'description',
        groups: ['basic'],
        setting: ['svg'],
        template: '<svg></svg>',
        help: 'http://dpq.co.ir/more-information-svg',
        controller: 'WbWidgetSvg', 
    });
    $widget.newWidget({
        type: 'template',
        title: 'template',
        label: 'template',
        icon: 'wb-widget-template',
        description: 'description',
        groups: ['basic'],
        setting: ['template'],
        template: '<template></template>',
        help: 'http://dpq.co.ir/more-information-template',
        controller: 'WbWidgetTemplate', 
        isLeaf: false
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
        type: 'track',
        title: 'track',
        label: 'track',
        icon: 'wb-widget-track',
        description: 'description',
        groups: ['basic'],
        setting: ['track'],
        template: '<track></track>',
        help: 'http://dpq.co.ir/more-information-track',
        controller: 'WbWidgetTrack', 
    });
    $widget.newWidget({
        type: 'ul',
        title: 'ul',
        label: 'ul',
        icon: 'wb-widget-ul',
        description: 'description',
        groups: ['basic'],
        setting: ['ul'],
        template: '<ul></ul>',
        help: 'http://dpq.co.ir/more-information-ul',
        controller: 'WbWidgetUl', 
        isLeaf: false
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
        isLeaf: false
    });

    /*******************************************************
     * Deprecated
     *******************************************************/
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
        controller: 'WbWidgetGroup',
        isLeaf: false
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
});
