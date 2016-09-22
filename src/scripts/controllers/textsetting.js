/**
 * Created by mgh on 8/10/2016.
 */


/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */

'use strict';
angular.module('ngMaterialExtension')

    .controller('TextSettingsCtrl', function($scope) {
        var scope = $scope;
        scope.tinymceOptions = {
            /*onChange: function(e) {
                // put logic here for keypress and cut/paste changes
            },*/
/*            selector: 'textarea',
            inline: false,
            plugins : 'advlist autolink link image lists charmap print preview',
            skin: 'lightgray',
            theme : 'modern',
            font_formats: 'Arial=arial,helvetica,sans-serif;'*/
            selector: 'textarea',
            height: 500,
            theme: 'modern',
            plugins: ['advlist autolink lists link image charmap print preview hr anchor pagebreak',
                'searchreplace wordcount visualblocks visualchars code fullscreen',
                'insertdatetime media nonbreaking save table contextmenu directionality',
                'emoticons template paste textcolor colorpicker textpattern imagetools'
            ],
            toolbar1: 'fontselect fontsizeselect | insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
            toolbar2: 'print preview media | forecolor backcolor emoticons',
            image_advtab: true,
            templates: [
                { title: 'Test template 1', content: 'Test 1' },
                { title: 'Test template 2', content: 'Test 2' }
            ],
            content_css: ['//fast.fonts.net/cssapi/e6dc9b99-64fe-4292-ad98-6974f93cd2a2.css',
                '//www.tinymce.com/css/codepen.min.css'
            ]
        };

    });

