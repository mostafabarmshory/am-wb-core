/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular
.module('ngMaterialWeburger')

/**
 * @ngdoc service
 * @name $widget
 * @memberof ngMaterialWeburger
 * @description مدیریت ویجت‌های سیستم
 * 
 * این سرویس تمام ویجت‌های قابل استفاده در سیستم را تعیین می‌کند.
 */
.service(
	'$widget',
	function($q, $timeout, $mdDialog, PaginatorPage) {

	    var contentElementAsso = {
		    NotfoundElement : {
			dom : '<wb-notfound-element></wb-notfound-element>',
			label : 'Not found',
			image : 'images/wb/notfoundelement.svg',
			link : 'link',
		    },
		    Page : {
			dom : '<wb-content></wb-content>',
			label : 'Panel',
			description : 'Panel contains list of widgets.',
			image : 'images/wb/content.svg',
			link : 'http://dpq.co.ir/more-information-link',
			data : {
			    type : 'Page',
			    style : {
				direction : 'column',
			    },
			    contents : []
			}
		    },
		    HtmlText : {
			dom : '<wb-html ng-class="[wbModel.style.flexAlignItem]" ></wb-html>',
			label : 'HTML text',
			description : 'An HTML block text.',
			image : 'images/wb/html.svg',
			link : 'http://dpq.co.ir',
			data : {
			    type : 'HtmlText',
			    body : '<h2>HTML Text</h2><p>Insert HTML text heare</p>',
			    style : {
				marginLeft : 1,
				marginRight : 1,
				marginTop : 1,
				marginBottom : 1,
				paddingLeft : 1,
				paddingRight : 1,
				paddingTop : 1,
				paddingBottom : 1,
				minWidth : 0,
				maxWidth : 0,
				minHeight : 0,
				maxHeight : 0
			    }
			}
		    },
	    };

	    /**
	     * توصیف ویجت معادل با مدل داده‌ای را تعیین می‌کند
	     * 
	     * این کار بر اساس خصوصیت نوع در مدل داده‌ای تعیین می‌شود و
	     * در صورتیکه ویجتی برای آو موجود نباشد، ویجت پیشفرض به
	     * عنوان نتیجه برگردانده می‌وشد.
	     * 
	     * @param model
	     * @returns
	     */
	    function widget(model) {
		var deferred = $q.defer();
		$timeout(function() {
		    var widget = contentElementAsso.mdeNotfoundElement;
		    if (model.type in contentElementAsso) {
			widget = contentElementAsso[model.type];
		    }
		    deferred.resolve(widget);
		}, 1);
		return deferred.promise;
	    }

	    /**
	     * فهرست تمام ویجت‌ها را تعیین می‌کند.
	     * 
	     * @returns
	     */
	    function widgets() {
		var deferred = $q.defer();
		$timeout(function() {
		    var widgets = new PaginatorPage({});
		    // XXX: maso, 1395: تعیین خصوصیت‌ها به صورت دستی است
		    widgets.items = [];
		    widgets.items.push(contentElementAsso.Page);
		    widgets.items.push(contentElementAsso.HtmlText);
		    deferred.resolve(widgets);
		}, 1);
		return deferred.promise;
	    }

	    function select(locals) {
		// TODO: maso, 1394: just prepare data for view
		return $mdDialog.show({
		    controller : 'WbDialogsCtrl',
		    templateUrl : 'views/dialogs/wb-selectwidget.html',
		    parent : angular.element(document.body),
		    clickOutsideToClose : true,
		    fullscreen : true,
		    locals : locals,
		});
	    }
	    // تعیین سرویس‌ها
	    this.widget = widget;
	    this.widgets = widgets;
	    this.select = select;
	});
