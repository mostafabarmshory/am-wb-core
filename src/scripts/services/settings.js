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
.service('$settings', function() {

	var settingPages = {
		notFound : {
			label : 'Settings not found',
			page : 'views/settings/notfound.html'
		},
		general : {
			label : 'general',
			page : 'views/settings/general.html'
		},
		background : {
			label : 'background',
			page : 'views/settings/background.html'
		},
		text : {
			label : 'Frontend text',
			page : 'views/settings/text.html'
		},
		description : {
			label : 'Description',
			page : 'views/settings/description.html'
		},
		layout : {
			label : 'Layout',
			page : 'views/settings/layout.html'
		},
		border : {
			label : 'Border',
			page : 'views/settings/border.html'
		},
		pageLayout : {
			label : 'Page Layout',
			page : 'views/settings/page-layout.html'
		},
		selfLayout : {
			label : 'Self Layout',
			page : 'views/settings/self-layout.html'
		},
		marginPadding : {
			label: 'Margin/Padding',
			page: 'views/settings/margin-padding.html'
		},
		minMaxSize: {
			label : 'Min/Max',
			page : 'views/settings/min-max-size.html'
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
	// تعیین سرویس‌ها
	this.page = page;
	this.newPage = addPage;
});
