/*
 * Copyright (c) 2015-2025 Phoinex Scholars Co. http://dpq.co.ir
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

//# Globbing
//'test/spec/{,*/}*.js'
//'test/spec/**/*.js'

module.exports = function(grunt) {

	require('time-grunt')(grunt);
	//MODIFIED: add require for connect-modewrite
	var modRewrite = require('connect-modrewrite');

	require('jit-grunt')(grunt, {
		useminPrepare : 'grunt-usemin',
		ngtemplates : 'grunt-angular-templates',
		configureProxies : 'grunt-connect-proxy',
	});

	var appConfig = {
		app : require('./bower.json').appPath || 'src',
		demo : require('./bower.json').demoPath || 'demo',
		dist : 'dist',
		pkg : require('./bower.json')
	};

	grunt.initConfig({
		yeoman : appConfig,

		watch : {
			bower : {
				files : [ 'bower.json' ],
				tasks : [ 'wiredep' ]
			},
			js : {
				files : [
					'<%= yeoman.app %>/scripts/**/*.js',
					'<%= yeoman.demo %>/scripts/**/*.js',
				],
				tasks : [
					'injector',
					'newer:jshint:all',
					'newer:jscs:all'
				],
				options : {
					livereload : '<%= connect.options.livereload %>'
				}
			},
			jsTest : {
				files : [ 'test/spec/{,*/}*.js' ],
				tasks : [
					'injector',
					'newer:jshint:test', // 
					'newer:jscs:test', //
					'karma' ]
			},
			styles : {
				files : [
					'<%= yeoman.app %>/styles/**/*.css',
					'<%= yeoman.demo %>/styles/**/*.css' ,
				],
				tasks : [
					'injector',
					'newer:copy:styles', 
					'postcss'
				]
			},
			gruntfile : {
				files : [ 'Gruntfile.js' ]
			},
			livereload : {
				options : {
					livereload : '<%= connect.options.livereload %>'
				},
				files : [
					'<%= yeoman.demo %>/**/*.html',
					'<%= yeoman.app %>/views/**/*.html',
					'.tmp/styles/{,*/}*.css',
					'<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
					'<%= yeoman.demo %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
				]
			}
		},


		// The actual grunt server settings
		connect : {
			options : {
				port : 9001,
				// Change this to '0.0.0.0' to access the server from
				// outside.
				hostname : 'localhost',
				livereload : 35729
			},
			proxies : [ {
				context : '/', // the context of the data service
				// wherever the data service is running
				host : '<%= yeoman.pkg.backend.host %>',
				// the port that the data service is running on
				port : '<%= yeoman.pkg.backend.port %>',
				changeOrigin : true,
				headers : {
					host : '<%= yeoman.pkg.backend.host %>'
				}
			} ],
			livereload : {
				options : {
					open : true,
					middleware : function(connect, options) {
						var middlewares = [];
						//Matches everything that does not contain a '.' (period)
						middlewares.push(modRewrite([ '!/api/.*|^.*\\..*$ /index.html [L]' ]));
						middlewares.push(connect.static('.tmp'));
						middlewares.push(
							connect()
								.use('/bower_components', connect.static('./bower_components')));
						middlewares.push(
							connect()
								.use('/app/styles', connect.static('./app/styles')));
						middlewares.push(connect.static('demo'));
						middlewares.push(connect.static(appConfig.app));
						options.base.forEach(function(base) {
							middlewares.push(connect.static(base));
						});
						if (!Array.isArray(options.base)) {
							options.base = [ options.base ];
						}

						// Setup the proxy
						middlewares
							.push(require('grunt-connect-proxy/lib/utils').proxyRequest);

						// Serve static files
						options.base.forEach(function(base) {
							middlewares.push(connect.static(base));
						});

						return middlewares;
					}
				}
			},
			test : {
				options : {
					port : 9001,
					middleware : function(connect) {
						return [
							connect.static('.tmp'),
							connect.static('test'),
							connect().use('/bower_components', connect.static('./bower_components')),
							connect.static(appConfig.app) ];
					}
				}
			},
			dist : {
				options : {
					open : true,
					base : '<%= yeoman.dist %>'
				}
			}
		},

		jshint : {
			options : {
				jshintrc : '.jshintrc',
				reporter : require('jshint-stylish')
			},
			all : {
				src : [ 'Gruntfile.js', '<%= yeoman.app %>/{,*/}*.js' ]
			},
			test : {
				options : {
					jshintrc : 'test/.jshintrc'
				},
				src : [ 'test/spec/{,*/}*.js' ]
			}
		},

		/*
		 * ESLint is an open source project originally created by Nicholas C. Zakas in June 2013. 
		 * Its goal is to provide a pluggable linting utility for JavaScript.
		 * 
		 * 
		 * https://eslint.org/
		 */
		eslint : {
			target : [ '<%= yeoman.app %>/{,*/}*.js' ]
		},

		jscs : {
			options : {
				config : '.jscsrc',
				verbose : true
			},
			all : {
				src : [ 'Gruntfile.js', '<%= yeoman.app %>/{,*/}*.js' ]
			},
			test : {
				src : [ 'test/spec/{,*/}*.js' ]
			}
		},

		/*
		 * Generate document
		 * 
		 * This is one of the task in the rlease phease.
		 * 
		 * @see https://github.com/krampstudio/grunt-jsdoc
		 * @see https://github.com/krampstudio/grunt-jsdoc-plugin
		 */
		jsdoc : {
			all : {
				src : [ '<%= yeoman.app %>/scripts/**/*.js' ],
				options : {
					destination : 'doc',
					configure : 'node_modules/angular-jsdoc/common/conf.json',
					template : 'node_modules/angular-jsdoc/default',
					tutorial : 'tutorials',
					readme : 'README.md'
				},
			},
		},

		clean : {
			dist : {
				files : [ {
					dot : true,
					src : [ //
						'.tmp', '<%= yeoman.dist %>/{,*/}*', //
						'!<%= yeoman.dist %>/.git{,*/}*' //
					]
				} ]
			},
			server : '.tmp'
		},

		wiredep : {
			app : {
				src : [ 'demo/index.html' ],
				ignorePath : /\.\.\//
			},
			test : {
				devDependencies : true,
				src : '<%= karma.unit.configFile %>',
				ignorePath : /\.\.\//,
				fileTypes : {
					js : {
						block : /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
						detect : {
							js : /'(.*\.js)'/gi
						},
						replace : {
							js : '\'{{filePath}}\','
						}
					}
				}
			}
		},

		// The following *-min tasks will produce minified files in the
		// dist folder
		// By default, your `index.html`'s <!-- Usemin block --> will
		// take care of
		// minification. These next options are pre-configured if you do
		// not wish
		// to use the Usemin blocks.
		cssmin : {
			dist : {
				files : {
					'<%= yeoman.dist %>/<%= yeoman.pkg.name %>.min.css' : [ //
						'.tmp/styles/{,*/}*.css' //
					]
				}
			}
		},
		uglify : {
			dist : {
				files : {
					'<%= yeoman.dist %>/<%= yeoman.pkg.name %>.min.js' : [ //
						'.tmp/{,*/}*.js' //
					]
				}
			}
		},

		imagemin : {
			dist : {
				files : [ {
					expand : true,
					cwd : '<%= yeoman.app %>/images',
					src : '{,*/}*.{png,jpg,jpeg,gif}',
					dest : '<%= yeoman.dist %>/images'
				} ]
			}
		},

		svgmin : {
			dist : {
				files : [ {
					expand : true,
					cwd : '<%= yeoman.app %>/images',
					src : '{,*/}*.svg',
					dest : '<%= yeoman.dist %>/images'
				} ]
			}
		},
		concat : {
			tmp : {
				src : [ '<%= yeoman.app %>/scripts/{,*/}*.js' ],
				dest : '.tmp/<%= yeoman.pkg.name %>.js'
			},
			distcss : {
				src : [ '<%= yeoman.app %>/{,*/}*.css' ],
				dest : '<%= yeoman.dist %>/<%= yeoman.pkg.name %>.css'
			},
			dist : {
				src : [ '.tmp/{,*/}*.js' ],
				dest : '<%= yeoman.dist %>/<%= yeoman.pkg.name %>.js'
			}
		},

		/*
		 * 
		 * 
		 */
		htmlmin : {
			dist : {
				options : {
					conservativeCollapse : true,
					removeCommentsFromCDATA : true,
					collapseBooleanAttributes : true,
					collapseWhitespace : true,
					removeAttributeQuotes : true,
					removeComments : true, // Only if you don't use comment
					// directives!
					removeEmptyAttributes : true,
					removeRedundantAttributes : true,
					removeScriptTypeAttributes : true,
					removeStyleLinkTypeAttributes : true
				},
				files : [ {
					expand : true,
					cwd : '<%= yeoman.dist %>',
					src : [ '*.html' ],
					dest : '<%= yeoman.dist %>'
				} ]
			}
		},

		ngtemplates : {
			dist : {
				options : {
					module : '<%= yeoman.pkg.moduleName %>',
					htmlmin : '<%= htmlmin.dist.options %>',
					usemin : 'scripts/scripts.js'
				},
				cwd : '<%= yeoman.app %>',
				src : 'views/{,*/}*.html',
				dest : '.tmp/templateCache.js'
			}
		},

		ngAnnotate : {
			dist : {
				files : [ {
					expand : true,
					cwd : '.tmp/',
					src : '*.js',
					dest : '.tmp/'
				} ]
			}
		},

		// Copies remaining files to places other tasks can use
		copy : {
			dist : {
				files : [
					{
						expand : true,
						dot : true,
						cwd : '<%= yeoman.app %>',
						dest : '<%= yeoman.dist %>',
						src : [ '*.{ico,png,txt}',
							'images/{,*/}*.{webp}',
							'styles/fonts/{,*/}*.*' ]
					}, {
						expand : true,
						cwd : '.tmp/images',
						dest : '<%= yeoman.dist %>/images',
						src : [ 'generated/*' ]
					},{
						// TODO: maso, 2018: optimize resource
						dot : true,
						expand : true,
						cwd : '<%= yeoman.app %>/resources',
						dest : '<%= yeoman.dist %>/resources',
						src : '**/*.*'
					}]
			},
			styles : {
				expand : true,
				cwd : '<%= yeoman.app %>/styles',
				dest : '.tmp/styles/',
				src : '{,*/}*.css'
			},
		},

		// Add vendor prefixed styles
		postcss : {
			options : {
				processors : [ require('autoprefixer-core')({
					browsers : [ 'last 1 version' ]
				}) ]
			},
			server : {
				options : {
					map : true
				},
				files : [ {
					expand : true,
					cwd : '.tmp/styles/',
					src : '{,*/}*.css',
					dest : '.tmp/styles/'
				} ]
			},
			dist : {
				files : [ {
					expand : true,
					cwd : '.tmp/styles/',
					src : '{,*/}*.css',
					dest : '.tmp/styles/'
				} ]
			}
		},

		// Run some tasks in parallel to speed up the build process
		concurrent : {
			server : [ 'copy:styles', ],
			test : [ 'copy:styles' ],
			dist : [ 'copy:styles', 'concat:tmp', 'imagemin', 'svgmin' ]
		},

		karma : {
			unit : {
				configFile : 'test/karma.conf.js',
				singleRun : true
			},
			debug : {
				configFile : 'test/karma.conf.js',
				port : 9999,
				singleRun : false,
				browsers : [ 'Chrome' ]
			}
		},


		/*
		 * Inject project files into the HTMLS
		 * 
		 * SEE: https://github.com/klei/grunt-injector
		 */
		injector : {
			options : {
				// Task-specific options go here.
				relative : true,
				addRootSlash : false,
				ignorePath : [
					'../<%= yeoman.app %>/',
					'<%= yeoman.demo %>/'
				]
			},
			project_files : {
				files : {
					'<%= yeoman.demo %>/index.html' : [
						'<%= yeoman.app %>/scripts/**/*.js',
						'<%= yeoman.app %>/styles/**/*.css',
						'<%= yeoman.demo %>/scripts/**/*.js',
						'<%= yeoman.demo %>/styles/**/*.css'
					],
				}
			}
		},
	});

	grunt.registerTask('demo', 'Compile then start a connect web server',
		function(target) {
			if (target === 'dist') {
				return grunt.task.run([ 'build', //
					// added just before connect
					'configureProxies:server', //
					'connect:dist:keepalive' //
				]);
			}

			grunt.task.run([ //
				'clean:server', //
				'wiredep', //
				'injector', //
				'concurrent:server', //
				'postcss:server', //
				'configureProxies:server', // added just before connect
				'connect:livereload', //
				'watch' //
			]);
		});

	grunt.registerTask('test', [ //
		'clean', //
		'wiredep', //
		'injector', //
		'concurrent:test', //
		'postcss:server', //
		'karma:unit' //
	]);

	grunt.registerTask('debug', [ //
		'clean', //
		'wiredep', //
		'injector', //
		'concurrent:server', //
		'postcss', //
		'karma:debug' //
	]);

	grunt.registerTask('build', [ //
		'wiredep', //
		'injector', //
		'clean:dist', //
		'concurrent:dist', //
		'concat:distcss', //
		'postcss', //
		'ngtemplates', //
		'concat:dist', //
		'ngAnnotate', //
		'copy:dist', //
		'uglify', //
		'cssmin' //
	]);

	grunt.registerTask('default', [ //
		'newer:jshint', //
		'newer:jscs', //
		'newer:eslint', //
		'test', //
		'build' //
	]);

	grunt.registerTask('release', [ //
		'default', //
		'jsdoc'
	]);
};