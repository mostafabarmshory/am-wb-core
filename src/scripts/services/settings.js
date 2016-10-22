/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc service
 * @name $widget
 * @memberof ngMaterialWeburger
 * @description مدیریت ویجت‌های سیستم
 * 
 * این سرویس تمام ویجت‌های قابل استفاده در سیستم را تعیین می‌کند.
 */
.service('$settings', function($mdDialog) {

    var settingPages = {
	notFound : {
	    label : 'Settings not found',
	    page : 'views/settings/wb-notfound.html'
	},
	general : {
	    label : 'general',
	    page : 'views/settings/wb-general.html'
	},
	background : {
	    label : 'background',
	    page : 'views/settings/wb-background.html'
	},
	text : {
	    label : 'Frontend text',
	    page : 'views/settings/wb-text.html'
	},
	description : {
	    label : 'Description',
	    page : 'views/settings/wb-description.html'
	},
	layout : {
	    label : 'Layout',
	    page : 'views/settings/wb-layout.html'
	},
	border : {
	    label : 'Border',
	    page : 'views/settings/wb-border.html'
	},
	pageLayout : {
	    label : 'Page Layout',
	    page : 'views/settings/wb-layout-page.html'
	},
	selfLayout : {
	    label : 'Self Layout',
	    page : 'views/settings/wb-layout-self.html'
	},
	marginPadding : {
	    label : 'Margin/Padding',
	    page : 'views/settings/wb-margin-padding.html'
	},
	minMaxSize : {
	    label : 'Min/Max',
	    page : 'views/settings/wb-min-max-size.html'
	}
    };

    /**
     * توصیف ویجت معادل با مدل داده‌ای را تعیین می‌کند
     * 
     * این کار بر اساس خصوصیت نوع در مدل داده‌ای تعیین می‌شود و در صورتیکه ویجتی
     * برای آو موجود نباشد، ویجت پیشفرض به عنوان نتیجه برگردانده می‌وشد.
     * 
     * @param model
     * @returns
     */
    function page(settingId) {
	var widget = settingPages.notFound;
	if (settingId in settingPages) {
	    widget = settingPages[settingId];
	}
	return widget;
    }

    /**
     * فهرست تمام ویجت‌ها را تعیین می‌کند.
     * 
     * @returns
     */
    function addPage(settingId, page) {
	settingPages[settingId] = page;
    }

    /**
     * تنظیمات را به عنوان تنظیم‌های جاری سیستم لود می‌کند.
     * 
     * @returns
     */
    function loadSetting(locals) {
	return $mdDialog.show({
	    controller : 'SettingDialogsCtrl',
	    templateUrl : 'views/dialogs/wb-settings.html',
	    parent : angular.element(document.body),
	    clickOutsideToClose : true,
	    fullscreen : true,
	    locals : locals
	});
    }
    // تعیین سرویس‌ها
    this.page = page;
    this.load = loadSetting;
    this.newPage = addPage;
});
