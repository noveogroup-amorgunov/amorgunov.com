/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/client/javascript/modules/copy.ts":
/*!***********************************************!*\
  !*** ./src/client/javascript/modules/copy.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "initCopyToClipboard": function() { return /* binding */ initCopyToClipboard; }
/* harmony export */ });
/* harmony import */ var clipboard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! clipboard */ "../../node_modules/.pnpm/clipboard@2.0.4/node_modules/clipboard/dist/clipboard.js");
/* harmony import */ var clipboard__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(clipboard__WEBPACK_IMPORTED_MODULE_0__);

function initCopyToClipboard() {
  document.querySelectorAll('.copy-btn').forEach(function (el) {
    var clipboard = new clipboard__WEBPACK_IMPORTED_MODULE_0__(el);
    clipboard.on('success', function (e) {
      if (!e.trigger.innerHTML.endsWith(' 🤟')) {
        var defaultText = e.trigger.innerHTML;
        e.trigger.innerHTML += ' 🤟';
        setTimeout(function () {
          e.trigger.innerHTML = defaultText;
        }, 2000);
      }
    });
  });
}

/***/ }),

/***/ "./src/client/javascript/modules/menu.ts":
/*!***********************************************!*\
  !*** ./src/client/javascript/modules/menu.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "registerMenuHandlers": function() { return /* binding */ registerMenuHandlers; }
/* harmony export */ });
function registerMenuHandlers() {
  var $toggler = document.querySelector('.header__menu-toggler');
  var $togglerCross = document.querySelector('.menu__toggler');
  var $menu = document.querySelector('.menu');
  var $menuOverlay = document.querySelector('.menu__overlay');
  function openMenu(event) {
    event.preventDefault();
    $menu.classList.add('menu_opened');
  }
  function closeMenu(event) {
    event.preventDefault();
    $menu.classList.remove('menu_opened');
  }
  $toggler.addEventListener('click', openMenu);
  $menuOverlay.addEventListener('click', closeMenu);
  $togglerCross.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      $menu.classList.remove('menu_opened');
    }
  });
}

/***/ }),

/***/ "./src/client/javascript/modules/quiz.ts":
/*!***********************************************!*\
  !*** ./src/client/javascript/modules/quiz.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Quiz": function() { return /* binding */ Quiz; },
/* harmony export */   "registerQuiz": function() { return /* binding */ registerQuiz; }
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var defaultState = {
  currentStep: 0,
  rightCount: 0,
  answers: [],
  startTime: null
};
var Quiz = /*#__PURE__*/function () {
  function Quiz(opts, nodeEl) {
    _classCallCheck(this, Quiz);
    _defineProperty(this, "opts", void 0);
    _defineProperty(this, "nodeEl", void 0);
    _defineProperty(this, "state", void 0);
    _defineProperty(this, "data", void 0);
    _defineProperty(this, "content", void 0);
    this.opts = opts;
    this.nodeEl = nodeEl;
    this.state = _objectSpread({}, defaultState);
  }
  return _createClass(Quiz, [{
    key: "loadData",
    value: function loadData() {
      var _this = this;
      return fetch(this.opts.dataUrl).then(function (res) {
        return res.json();
      }).then(function (data) {
        _this.data = data;
        _this.render();
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;
      this.data.steps.forEach(function (step, idx) {
        return _this2.renderStep(step, idx);
      });
      Array.from(this.nodeEl.querySelectorAll('.quiz__btn')).forEach(function (element) {
        element.addEventListener('click', function (event) {
          return _this2.changeStep(event);
        });
      });
      this.nodeEl.querySelectorAll('.quiz__step')[0].classList.add('quiz__step_current');
    }
  }, {
    key: "changeStep",
    value: function changeStep(event) {
      var _this3 = this;
      if (this.state.currentStep === this.data.steps.length - 1) {
        this.state = _objectSpread(_objectSpread({}, defaultState), {}, {
          answers: []
        });
        this.nodeEl.innerHTML = '';
        this.render();
        return;
      }
      this.state.currentStep += 1;
      if (!this.state.startTime) {
        this.state.startTime = Date.now();
      }
      this.nodeEl.querySelector('.quiz__step_current').classList.remove('quiz__step_current');
      var currentStepEl = this.nodeEl.querySelectorAll('.quiz__step')[this.state.currentStep];
      currentStepEl.classList.add('quiz__step_current');
      var idx = event.currentTarget.dataset.idx;
      if (typeof idx !== 'undefined') {
        this.state.answers.push(idx);
      }

      // Проверка на последний шаг и результаты
      if (this.state.currentStep === this.data.steps.length - 1) {
        this.state.endTime = Math.round((Date.now() - this.state.startTime) / 1000);
        var contentArr = [];
        var joinedContent;
        this.data.answers.split('').forEach(function (answer, i) {
          if (answer === _this3.state.answers[i]) {
            _this3.state.rightCount += 1;
          } else {
            contentArr.push("<a href=\"#".concat(i + 1, "\">#").concat(i + 1, "</a>"));
          }
        });
        if (contentArr.length === 0) {
          joinedContent = 'Очень круто!' + '<br/><br/><img src="/assets/images/2019-06-29-review-js-quiz-codefest/3.gif"/><br/>';
        } else {
          joinedContent = this.opts.preview ? '' : "<br/>\u0420\u0430\u0437\u0431\u043E\u0440 \u043D\u0435\u0432\u0435\u0440\u043D\u044B\u0445 \u043E\u0442\u0432\u0435\u0442\u043E\u0432:<br/>".concat(contentArr.join(', '));
        }
        this.content = joinedContent;
        var content = this.getStepContent(this.data.steps[this.data.steps.length - 1], 0);
        var selector = this.nodeEl.querySelectorAll('.quiz__step')[this.state.currentStep];
        selector.innerHTML = content;
        selector.classList.add('quiz__step_current');
        selector.querySelector('.quiz__btn').addEventListener('click', function (e) {
          return _this3.changeStep(e);
        });
      }
    }
  }, {
    key: "renderStep",
    value: function renderStep(step, idx) {
      var content = this.getStepContent(step, idx);
      this.nodeEl.appendChild(Quiz.generateDiv(content, 'quiz__step'));
    }
  }, {
    key: "getStepContent",
    value: function getStepContent(step, idx) {
      var content = step.content.replace('{counter}', "".concat(idx, "/").concat(this.data.steps.length - 2)).replace('{time}', String(this.state.endTime)).replace('{rightCount}', String(this.state.rightCount)).replace('{totalCount}', String(this.data.steps.length - 2)).replace('{wrongLinks}', this.content);
      if (step.answers) {
        var answers = step.answers.map(function (answer, i) {
          return "<button data-idx=\"".concat(i, "\" class=\"quiz__btn\">").concat(answer, "</button>");
        });
        content += "<div class=\"quiz__answers\">".concat(answers.join(''), "</div>");
      }
      return content;
    }
  }], [{
    key: "generateDiv",
    value: function generateDiv(content, className) {
      var div = document.createElement('div');
      div.className = className;
      div.innerHTML = content;
      return div;
    }
  }]);
}();
function registerQuiz() {
  var $quizs = document.querySelectorAll('.quiz');
  if (!$quizs.length) {
    return;
  }
  $quizs.forEach(function (el) {
    if (el.dataset.opts) {
      var quiz = new Quiz(JSON.parse(el.dataset.opts), el);
      quiz.loadData();
    }
  });
}

/***/ }),

/***/ "./src/client/javascript/modules/theme.ts":
/*!************************************************!*\
  !*** ./src/client/javascript/modules/theme.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "registerThemeToggler": function() { return /* binding */ registerThemeToggler; },
/* harmony export */   "syncTheme": function() { return /* binding */ syncTheme; }
/* harmony export */ });
function getPreferedTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function loadThemeFromStorage() {
  return localStorage.getItem('theme');
}
function saveThemeToStorage(theme) {
  return localStorage.setItem('theme', theme);
}
function setTheme(theme) {
  saveThemeToStorage(theme);
  document.documentElement.setAttribute('data-theme', theme);
}
function syncTheme() {
  var currentTheme = loadThemeFromStorage() || getPreferedTheme();
  setTheme(currentTheme);
}
function registerThemeToggler() {
  var $toggler = document.querySelector('.header__theme-toggler');
  if (!$toggler) {
    return;
  }
  function onTogglerClick(event) {
    event.preventDefault();
    var theme = document.documentElement.getAttribute('data-theme');
    setTheme(theme === 'light' ? 'dark' : 'light');
  }
  $toggler.addEventListener('click', onTogglerClick);
}

/***/ }),

/***/ "./src/client/javascript/next.entry.ts":
/*!*********************************************!*\
  !*** ./src/client/javascript/next.entry.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _modules_copy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modules/copy */ "./src/client/javascript/modules/copy.ts");
/* harmony import */ var _modules_menu__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./modules/menu */ "./src/client/javascript/modules/menu.ts");
/* harmony import */ var _modules_quiz__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modules/quiz */ "./src/client/javascript/modules/quiz.ts");
/* harmony import */ var _modules_theme__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./modules/theme */ "./src/client/javascript/modules/theme.ts");
/* harmony import */ var _stylesheets_next_entry_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../stylesheets/next.entry.css */ "./src/client/stylesheets/next.entry.css");





(0,_modules_theme__WEBPACK_IMPORTED_MODULE_3__.syncTheme)();
document.addEventListener('DOMContentLoaded', function () {
  document.body.classList.add('loaded');
  (0,_modules_quiz__WEBPACK_IMPORTED_MODULE_2__.registerQuiz)();
  (0,_modules_menu__WEBPACK_IMPORTED_MODULE_1__.registerMenuHandlers)();
  (0,_modules_copy__WEBPACK_IMPORTED_MODULE_0__.initCopyToClipboard)();
  (0,_modules_theme__WEBPACK_IMPORTED_MODULE_3__.registerThemeToggler)();
});

/***/ }),

/***/ "./src/client/stylesheets/next.entry.css":
/*!***********************************************!*\
  !*** ./src/client/stylesheets/next.entry.css ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	!function() {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = function(result, chunkIds, fn, priority) {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var chunkIds = deferred[i][0];
/******/ 				var fn = deferred[i][1];
/******/ 				var priority = deferred[i][2];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every(function(key) { return __webpack_require__.O[key](chunkIds[j]); })) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	!function() {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"next": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = function(chunkId) { return installedChunks[chunkId] === 0; };
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = function(parentChunkLoadingFunction, data) {
/******/ 			var chunkIds = data[0];
/******/ 			var moreModules = data[1];
/******/ 			var runtime = data[2];
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some(function(id) { return installedChunks[id] !== 0; })) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunk_amorgunov_app"] = self["webpackChunk_amorgunov_app"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_pnpm_clipboard_2_0_4_node_modules_clipboard_dist_clipboard_js"], function() { return __webpack_require__("./src/client/javascript/next.entry.ts"); })
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=next.entry.js.map?v=29c2265e7a3ae5c38ea6