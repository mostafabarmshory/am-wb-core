/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */
angular.module('am-wb-core')

/**
 * Load default resources
 */
.run(function($resource) {
	'use strict';



	var Cell = function (initial) {
		var value = initial;
		var get = function () {
			return value;
		};
		var set = function (v) {
			value = v;
		};
		var clone = function () {
			return Cell(get());
		};
		return {
			get: get,
			set: set,
			clone: clone
		};
	};

	var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

	var global$1 = tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');

	var getContentCss = function (editor) {
		return editor.settings.codesample_content_css;
	};
	var getLanguages = function (editor) {
		return editor.settings.codesample_languages;
	};
	var getDialogMinWidth = function (editor) {
		return Math.min(global$1.DOM.getViewPort().w, editor.getParam('codesample_dialog_width', 800));
	};
	var getDialogMinHeight = function (editor) {
		return Math.min(global$1.DOM.getViewPort().w, editor.getParam('codesample_dialog_height', 650));
	};
	var $_g667hraajm0o6auo = {
			getContentCss: getContentCss,
			getLanguages: getLanguages,
			getDialogMinWidth: getDialogMinWidth,
			getDialogMinHeight: getDialogMinHeight
	};

	function isCodeSample(elm) {
		return elm && elm.nodeName === 'PRE' && elm.className.indexOf('language-') !== -1;
	}
	function trimArg(predicateFn) {
		return function (arg1, arg2) {
			return predicateFn(arg2);
		};
	}
	var $_dcxw1rafjm0o6avx = {
			isCodeSample: isCodeSample,
			trimArg: trimArg
	};

	var getSelectedCodeSample = function (editor) {
		var node = editor.selection.getNode();
		if ($_dcxw1rafjm0o6avx.isCodeSample(node)) {
			return node;
		}
		return null;
	};
	var insertCodeSample = function (editor, language, code) {
		editor.undoManager.transact(function () {
			var node = getSelectedCodeSample(editor);
			code = global$1.DOM.encode(code);
			if (node) {
				editor.dom.setAttrib(node, 'class', 'language-' + language);
				node.innerHTML = code;
				Prism.highlightElement(node);
				editor.selection.select(node);
			} else {
				editor.insertContent('<pre id="__new" class="language-' + language + '">' + code + '</pre>');
				editor.selection.select(editor.$('#__new').removeAttr('id')[0]);
			}
		});
	};
	var getCurrentCode = function (editor) {
		var node = getSelectedCodeSample(editor);
		if (node) {
			return node.textContent;
		}
		return '';
	};
	var $_9sg2iacjm0o6auq = {
			getSelectedCodeSample: getSelectedCodeSample,
			insertCodeSample: insertCodeSample,
			getCurrentCode: getCurrentCode
	};

	var getLanguages$1 = function (editor) {
		var defaultLanguages = [
			{
				text: 'HTML/XML',
				value: 'markup'
			},
			{
				text: 'JavaScript',
				value: 'javascript'
			},
			{
				text: 'CSS',
				value: 'css'
			},
			{
				text: 'PHP',
				value: 'php'
			},
			{
				text: 'Ruby',
				value: 'ruby'
			},
			{
				text: 'Python',
				value: 'python'
			},
			{
				text: 'Java',
				value: 'java'
			},
			{
				text: 'C',
				value: 'c'
			},
			{
				text: 'C#',
				value: 'csharp'
			},
			{
				text: 'C++',
				value: 'cpp'
			}
			];
		var customLanguages = $_g667hraajm0o6auo.getLanguages(editor);
		return customLanguages ? customLanguages : defaultLanguages;
	};
	var getCurrentLanguage = function (editor) {
		var matches;
		var node = $_9sg2iacjm0o6auq.getSelectedCodeSample(editor);
		if (node) {
			matches = node.className.match(/language-(\w+)/);
			return matches ? matches[1] : '';
		}
		return '';
	};
	var $_760p5vagjm0o6avz = {
			getLanguages: getLanguages$1,
			getCurrentLanguage: getCurrentLanguage
	};

	var $_4c9coja9jm0o6aum = {
			open: function (editor) {
				$resource.get('script', {})
				.then(function(script){
					$_9sg2iacjm0o6auq.insertCodeSample(editor, script.language, script.code);
				});
			}
	};

	var register = function (editor) {
		editor.addCommand('codesample', function () {
			var node = editor.selection.getNode();
			if (editor.selection.isCollapsed() || $_dcxw1rafjm0o6avx.isCodeSample(node)) {
				$_4c9coja9jm0o6aum.open(editor);
			} else {
				editor.formatter.toggle('code');
			}
		});
	};
	var $_8fhnxga8jm0o6aul = { register: register };

	var setup = function (editor) {
		var $ = editor.$;
		editor.on('PreProcess', function (e) {
			$('pre[contenteditable=false]', e.node).filter($_dcxw1rafjm0o6avx.trimArg($_dcxw1rafjm0o6avx.isCodeSample)).each(function (idx, elm) {
				var $elm = $(elm), code = elm.textContent;
				$elm.attr('class', $.trim($elm.attr('class')));
				$elm.removeAttr('contentEditable');
				$elm.empty().append($('<code></code>').each(function () {
					this.textContent = code;
				}));
			});
		});
		editor.on('SetContent', function () {
			var unprocessedCodeSamples = $('pre').filter($_dcxw1rafjm0o6avx.trimArg($_dcxw1rafjm0o6avx.isCodeSample)).filter(function (idx, elm) {
				return elm.contentEditable !== 'false';
			});
			if (unprocessedCodeSamples.length) {
				editor.undoManager.transact(function () {
					unprocessedCodeSamples.each(function (idx, elm) {
						$(elm).find('br').each(function (idx, elm) {
							elm.parentNode.replaceChild(editor.getDoc().createTextNode('\n'), elm);
						});
						elm.contentEditable = false;
						elm.innerHTML = editor.dom.encode(elm.textContent);
						Prism.highlightElement(elm);
						elm.className = $.trim(elm.className);
					});
				});
			}
		});
	};
	var $_4bpd7rahjm0o6aw0 = { setup: setup };

	var loadCss = function (editor, pluginUrl, addedInlineCss, addedCss) {
		var linkElm;
		var contentCss = $_g667hraajm0o6auo.getContentCss(editor);
		if (editor.inline && addedInlineCss.get()) {
			return;
		}
		if (!editor.inline && addedCss.get()) {
			return;
		}
		if (editor.inline) {
			addedInlineCss.set(true);
		} else {
			addedCss.set(true);
		}
//		if (contentCss !== false) {
//			linkElm = editor.dom.create('link', {
//				rel: 'stylesheet',
//				href: contentCss ? contentCss : pluginUrl + '/css/prism.css'
//			});
//			editor.getDoc().getElementsByTagName('head')[0].appendChild(linkElm);
//		}
	};
	var $_b85lfuaijm0o6aw2 = { loadCss: loadCss };

	var register$1 = function (editor) {
		editor.addButton('codesample', {
			cmd: 'codesample',
			title: 'Insert/Edit code sample'
		});
		editor.addMenuItem('codesample', {
			cmd: 'codesample',
			text: 'Code sample',
			icon: 'codesample'
		});
	};
	var $_fuxw3sajjm0o6aw4 = { register: register$1 };

	var addedInlineCss = Cell(false);
	global.add('codesample', function (editor, pluginUrl) {
		var addedCss = Cell(false);
		$_4bpd7rahjm0o6aw0.setup(editor);
		$_fuxw3sajjm0o6aw4.register(editor);
		$_8fhnxga8jm0o6aul.register(editor);
		editor.on('init', function () {
			$_b85lfuaijm0o6aw2.loadCss(editor, pluginUrl, addedInlineCss, addedCss);
		});
		editor.on('dblclick', function (ev) {
			if ($_dcxw1rafjm0o6avx.isCodeSample(ev.target)) {
				$_4c9coja9jm0o6aum.open(editor);
			}
		});
	});
});
