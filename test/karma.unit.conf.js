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
			'bower_components/angular/angular.js',
			'bower_components/angular-animate/angular-animate.js',
			'bower_components/angular-aria/angular-aria.js',
			'bower_components/angular-messages/angular-messages.js',
			'bower_components/angular-material/angular-material.js',
			'bower_components/angular-translate/angular-translate.js',
			'bower_components/tinymce/tinymce.js',
			'bower_components/angular-ui-tinymce/src/tinymce.js',
			'bower_components/angular-material-expansion-panel/dist/md-expansion-panel.js',
			'bower_components/angular-material-icons/angular-material-icons.min.js',
			'bower_components/weakmap-polyfill/weakmap-polyfill.js',
			'bower_components/moment/moment.js',
			'bower_components/numbro/numbro.js',
			'bower_components/pikaday/pikaday.js',
			'bower_components/zeroclipboard/dist/ZeroClipboard.js',
			'bower_components/handsontable/dist/handsontable.js',
			'bower_components/ngHandsontable/dist/ngHandsontable.js',
			'bower_components/tinycolor/tinycolor.js',
			'bower_components/md-color-picker/dist/md-color-picker.js',
			'bower_components/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
			'bower_components/jspanel4x/dist/jspanel.js',
			'bower_components/lodash/lodash.js',
			'bower_components/angular-mocks/angular-mocks.js',
			'bower_components/json-formatter/dist/json-formatter.js',
			// endbower
			'src/scripts/**/*.js',
			'test/mock/**/*.js',
			'test/spec/**/*.js'
		],

		// coverage reporter generates the coverage
		reporters: [
			'progress', 
			'coverage'
		],

		// optionally, configure the reporter
		coverageReporter: {
			dir : 'coverage/',
			reporters: [{
				type : 'lcovonly',
				file : 'lcov.info'
			},{
				type: 'text-summary'
			}]
		},

		preprocessors: {
			// source files, that you wanna generate coverage for
			// do not include tests or libraries
			// (these files will be instrumented by Istanbul)
			'src/scripts/**/*.js': ['coverage']
		},

		// list of files / patterns to exclude
		exclude: [],

		// web server port
		port: 8080,


		// Which plugins to enable
		plugins: [
			'karma-jasmine',
			'karma-coverage',

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
		singleRun: false,

		colors: true,

		// level of logging
		// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
		logLevel: config.LOG_INFO

		// Uncomment the following lines if you are using grunt's server to run the tests
		// proxies: {
		//   '/': 'http://localhost:9000/'
		// },
		// URL root prevent conflicts with the site root
		// urlRoot: '_karma_'
	});
};
