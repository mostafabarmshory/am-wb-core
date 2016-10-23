/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc controller
 * @name WbCmsCtrl
 * @memberof ngMaterialWeburger
 * @description # WbCmsCtrl
 * 
 * 
 */
.controller('WbCmsCtrl',
	function($scope, $rootScope, $http, $cms, PaginatorParameter) {

	    /*
	     * از این متغیر برای صفحه بندی و جستجوی محتوی‌ها استفاده می‌شود.‌
	     */
	    var paginatorParameter = new PaginatorParameter();

	    /*
	     * آخرین نتیچه‌ها در این متغیر نگهداری می‌شود.
	     */
	    var requests = null;

	    /*
	     * حالت اجرا را تعیین می‌کند. در صورتی که در حال بارگزاری باشیم این
	     * مقدار درستی است.
	     */
	    var status = {
		working : false
	    };

	    /*
	     * جستجوی درخواست‌ها
	     */
	    function find() {
		status.working = true;
		$cms.contents(paginatorParameter)//
		.then(function(items) {
		    requests = items;
		    $scope.contents = $scope.contents.concat(requests.items);
		    status.working = false;
		}, function() {
		    status.working = false;
		});
	    }

	    function clear() {
		$scope.concats.length = 0;
	    }

	    function search(text) {
		paginatorParameter//
		.setQuery(text)//
		.setPage(0);
		clear();
		find();
	    }

	    function date(dateTiem) {
		clear();
		find();
	    }

	    function mimetype(type) {
		clear();
		find();
	    }

	    /**
	     * یک فایل جدید به عنوان محتوی به سرور لود می‌شود.
	     * 
	     * @param file
	     * @returns
	     */
	    function upload(file) {
		var content = null;
		// 1- create new content
		return $cms.newContent({
		    title : 'no name',
		    description : ''
		})//
		.then(function(newContent) {
		    // 2- upload file
		    content = newContent;
		    return content.upload(file);
		})//
		.then(function() {
		    // 3- push in current result
		    $scope.contents.push(content);
		    return content;
		});
	    }

	    /**
	     * محتوی را به روز می‌کند.
	     * 
	     * @param content
	     * @returns
	     */
	    function update(content) {
		return content.update();
	    }

	    /**
	     * انتخاب یک محتوی
	     * 
	     * @param content
	     * @returns
	     */
	    function select(content) {
		$scope.content = content;
	    }

	    /**
	     * حذف محتوی
	     * 
	     * @param content
	     * @returns
	     */
	    function remove(content) {
		return content.remove()//
		.then(function() {
		    var index = $scope.contents.indexOf(request);
		    if (index > -1) {
			$scope.contents.splice(index, 1);
		    }
		});
	    }

	    /**
	     * صفحه بعد را بار گزاری می‌کند.
	     */
	    function next() {
		// XXX: maso, 1395: check end page
		if (status.working || !requests.hasMore()) {
		    return;
		}
		paginatorParameter.setPage(requests.next());
		find();
	    }

	    // Parameters
	    $scope.status = status; // loading state
	    $scope.contents = []; // contents
	    // functions
	    $scope.search = search;
	    $scope.date = date;
	    $scope.mimetype = mimetype;
	    $scope.upload = upload;
	    $scope.select = select;
	    $scope.remove = remove;
	    $scope.next = next;

	    // init
	    find();

	});
