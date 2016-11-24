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
		    NotfoundElement : {
			dom : '<wb-notfound-element></wb-notfound-element>',
			label : 'Not found',
			image : 'images/wb/notfoundelement.svg',
			link : 'link',
		    },
//		    BrandAction : {
//			dom : '<wb-brand-action></wb-brand-action>',
//			label : 'Brand with action',
//			description : 'A brand image with action list',
//			image : 'images/wb/brandaction.svg',
//			link : 'http://dpq.co.ir',
//			data : {
//			    type : 'BrandAction',
//			    style : {},
//			}
//		    },
//		    Copyright : {
//			dom : '<wb-copyright></wb-copyright>',
//			label : 'Copyright',
//			description : 'Copyright text',
//			image : 'images/wb/copyright.svg',
//			link : 'http://dpq.co.ir',
//			data : {
//			    type : 'Copyright',
//			    title : 'copyright example',
//			    text : 'This is a simple copy right text.',
//			    style : {
//				width : '100%',
//				color : '#000000',
//				backgroundColor : '#00000000'
//			    }
//			}
//		    },
//		    FeatureList : {
//			dom : '<wb-feature-list></wb-feature-list>',
//			label : 'Features list',
//			description : 'List of features',
//			image : 'images/wb/featurelist.svg',
//			link : 'http://dpq.co.ir',
//			data : {
//			    type : 'FeatureList',
//			    style : {},
//			}
//		    },
//		    SocialList : {
//			dom : '<wb-social-list></wb-social-list>',
//			label : 'Socials link',
//			description : 'Social link list',
//			image : 'images/wb/sociallist.svg',
//			link : 'http://dpq.co.ir',
//			data : {
//			    type : 'SocialList',
//			    style : {},
//			}
//		    },
		    LinkList : {
			dom : '<wb-link-list></wb-link-list>',
			label : 'Link list',
			description : 'List of links and ticktes',
			image : 'images/wb/linklist.svg',
			link : 'link',
			data : {
			    type : 'LinkList',
			    style : {},
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
//		    CollapsibleItemList : {
//			dom : '<wb-collapsible-item-list></wb-collapsible-item-list>',
//			label : 'Collapsible item list',
//			description : 'List of item with a collapsiblity',
//			image : 'images/wb/notfoundelement.svg',
//			link : 'http://dpq.co.ir',
//			data : {
//			    type : 'CollapsibleItemList',
//			    style : {},
//			}
//		    },
		    Members : {
			dom : '<wb-members></wb-members>',
			label : 'Members list',
			description : 'List of members',
			image : 'images/wb/user.svg',
			link : 'http://dpq.co.ir',
			data : {
			    type : 'Members',
			    style : {},
			    template : {}
			}
		    }
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
//		    widgets.items.push(contentElementAsso.BrandAction);
//		    widgets.items.push(contentElementAsso.Copyright);
//		    widgets.items.push(contentElementAsso.FeatureList);
//		    widgets.items.push(contentElementAsso.SocialList);
		    widgets.items.push(contentElementAsso.LinkList);
		    widgets.items.push(contentElementAsso.HtmlText);
		    // widgets.items.push(contentElementAsso.CollapsibleItemList);
		    widgets.items.push(contentElementAsso.Members);
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
