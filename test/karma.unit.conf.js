//Karma configuration

module.exports = function(config) {
	'use strict';

	config.set({
		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,

		// base path, that will be used to resolve files and exclude
		basePath: '../',

		// testing framework to use (jasmine/mocha/qunit/...)
		// as well as any additional frameworks (requirejs/chai/sinon/...)
		frameworks: [
			'jasmine',
			'detectBrowsers'
		],

		detectBrowsers: {
			// enable/disable, default is true
			enabled: true,
			// enable/disable phantomjs support, default is true
			usePhantomJS: false,
			// use headless mode, for browsers that support it, default is false
			preferHeadless: true
		},

		// list of files / patterns to load in the browser
		files: [
			// bower:js
			'bower_components/jquery/dist/jquery.js',
			'bower_components/lodash/lodash.js',
			'bower_components/flux/dist/Flux.js',
			'bower_components/mustache.js/mustache.js',
			'bower_components/angular/angular.js',
			'bower_components/angular-mocks/angular-mocks.js',
			// endbower
			'src/libs/*.js',
			'src/scripts/**/*.js',
			'test/mock/**/*.js',
			'test/spec/**/*.js',
            '.tmp/templateCache.js'
		],
		
		// optionally, configure the reporter
		coverageReporter: {
			dir : 'coverage',
			reporters: [{
				type : 'lcovonly',
				file : 'lcov.info'
			},{
			    type: 'text-summary'
			},{
			    type: 'html',
			    dir : 'coverage/'
			}]
		},

		// list of files / patterns to exclude
		exclude: [],

		// web server port
		port: 8080,


		// Which plugins to enable
		pluginszz: [
			'karma-jasmine',

			'karma-chrome-launcher',
			'karma-edge-launcher',
			'karma-firefox-launcher',
			'karma-ie-launcher',
			'karma-safari-launcher',
			'karma-safaritechpreview-launcher',
			'karma-opera-launcher',
			'karma-detect-browsers'],

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: true,

		colors: true,

		// level of logging
		// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
		logLevel: config.LOG_WARN

		// Uncomment the following lines if you are using grunt's server to run the tests
		// proxies: {
		//   '/': 'http://localhost:9000/'
		// },
		// URL root prevent conflicts with the site root
		// urlRoot: '_karma_'
	});
};
