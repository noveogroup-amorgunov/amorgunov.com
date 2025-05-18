/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/client/javascript/modules/bot/WebConnector.ts":
/*!***********************************************************!*\
  !*** ./src/client/javascript/modules/bot/WebConnector.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WebConnector": function() { return /* binding */ WebConnector; }
/* harmony export */ });
/* harmony import */ var _typebot_core_lib_core_Message__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @typebot/core/lib/core/Message */ "../../node_modules/.pnpm/@typebot+core@0.0.2/node_modules/@typebot/core/lib/core/Message.js");
/* harmony import */ var event_emitter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! event-emitter */ "../../node_modules/.pnpm/event-emitter@0.3.5/node_modules/event-emitter/index.js");
/* harmony import */ var event_emitter__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(event_emitter__WEBPACK_IMPORTED_MODULE_1__);
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }


// @ts-expect-error FIXME fix type error
var WebConnector = /*#__PURE__*/function () {
  function WebConnector() {
    _classCallCheck(this, WebConnector);
  }
  return _createClass(WebConnector, [{
    key: "getConnectorName",
    value: function getConnectorName() {
      return 'console';
    }
  }, {
    key: "getUniqueSessionKey",
    value: function getUniqueSessionKey() {
      return this.getConnectorName();
    }
  }, {
    key: "getUser",
    value: function getUser() {
      return Promise.resolve(WebConnector._getUser());
    }
  }, {
    key: "send",
    value: function send(message) {
      // eslint-disable-next-line no-console
      console.log(message.getText());
      return Promise.resolve();
    }
  }, {
    key: "receiveMessage",
    value: function receiveMessage(text) {
      if (!text) {
        return;
      }

      // @ts-expect-error FIXME fix type error
      this.emit('receiveMessage', new _typebot_core_lib_core_Message__WEBPACK_IMPORTED_MODULE_0__.Message({
        rawData: {
          text: text
        },
        user: WebConnector._getUser(),
        sessionKey: 'web-console',
        // @ts-expect-error FIXME fix type error
        sender: 'user'
      }));
    }
  }], [{
    key: "_getUser",
    value: function _getUser() {
      return {
        id: 'user',
        name: 'Console User'
      };
    }
  }]);
}();

// @ts-expect-error FIXME fix type error
event_emitter__WEBPACK_IMPORTED_MODULE_1__(WebConnector.prototype);

/***/ }),

/***/ "./src/client/javascript/modules/bot/createBot.ts":
/*!********************************************************!*\
  !*** ./src/client/javascript/modules/bot/createBot.ts ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addHandlers": function() { return /* binding */ addHandlers; },
/* harmony export */   "createBot": function() { return /* binding */ createBot; },
/* harmony export */   "registerTerminals": function() { return /* binding */ registerTerminals; }
/* harmony export */ });
/* harmony import */ var _typebot_core_lib_core_Bot__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @typebot/core/lib/core/Bot */ "../../node_modules/.pnpm/@typebot+core@0.0.2/node_modules/@typebot/core/lib/core/Bot.js");
/* harmony import */ var _terminal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./terminal */ "./src/client/javascript/modules/bot/terminal.ts");
/* harmony import */ var _WebConnector__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./WebConnector */ "./src/client/javascript/modules/bot/WebConnector.ts");
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }



function addHandlers(type, bot) {
  switch (type) {
    case 'echobot':
      bot.use(function (_ref) {
        var session = _ref.session,
          message = _ref.message;
        session.send("You said: ".concat(message.getText()));
      });
      break;
    case 'todo':
      bot.initialState = {
        todos: []
      };
      bot.use('/list', function (_ref2) {
        var session = _ref2.session;
        var todos = session.state.todos;
        var msg = todos.length > 0 ? todos.join('\n') : 'No todos!';
        session.send(msg);
      });
      bot.use('/clear', function (_ref3) {
        var session = _ref3.session;
        session.resetState();
        session.send('Successfully clear all todos!');
      });
      bot.use(/\/add (.+)/, function (_ref4) {
        var session = _ref4.session,
          params = _ref4.params;
        var _ref5 = params,
          _ref6 = _slicedToArray(_ref5, 1),
          newTodo = _ref6[0];
        var todos = session.state.todos || [];
        session.setState({
          todos: [].concat(_toConsumableArray(todos), [newTodo])
        });
        session.send("Todo: ".concat(newTodo, " added!"));
      });
      bot.use(function (_ref7) {
        var session = _ref7.session;
        session.send('Unknown command. Type /list, /clear or /add {todo}.');
      });
      break;
    default:
      return false;
  }
  return false;
}
function createBot(el) {
  var terminal = new _terminal__WEBPACK_IMPORTED_MODULE_1__.Terminal(el, {
    text: 'Say anything to bot'
  });
  var connector = new _WebConnector__WEBPACK_IMPORTED_MODULE_2__.WebConnector();
  var bot = new _typebot_core_lib_core_Bot__WEBPACK_IMPORTED_MODULE_0__["default"]({
    connector: connector
  });
  connector.send = function (message) {
    terminal.addLine("<span class=\"bot\">Bot says</span>: ".concat(message.getText()));
    return Promise.resolve();
  };
  terminal.readLine = connector.receiveMessage.bind(connector);
  return bot;
}
function registerTerminals($nodes) {
  $nodes.forEach(function (el) {
    if (el.dataset.bot) {
      addHandlers(el.dataset.bot, createBot(el));
    }
  });
}


/***/ }),

/***/ "./src/client/javascript/modules/bot/terminal.ts":
/*!*******************************************************!*\
  !*** ./src/client/javascript/modules/bot/terminal.ts ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Terminal": function() { return /* binding */ Terminal; }
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var template = "\n    <div class=\"term\">\n        <div class=\"term-bar\">\n            <div class=\"term-winctrl\">\n                <span class=\"term-btn close\"></span>\n                <span class=\"term-btn minimise\"></span>\n                <span class=\"term-btn maximise\"></span>\n            </div>\n        </div>\n        <div class=\"term-cont\">\n            <div class=\"term-lines\">\n                {lines}\n            </div>\n            <div class=\"term-line\">\n              ~$ <span contentEditable=\"true\" class=\"term-cmd current\">{text}</span>\n            </div>\n        </div>\n    </div>\n";
var Terminal = /*#__PURE__*/function () {
  function Terminal(el) {
    var _this = this;
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$text = _ref.text,
      text = _ref$text === void 0 ? '' : _ref$text;
    _classCallCheck(this, Terminal);
    _defineProperty(this, "el", void 0);
    _defineProperty(this, "lines", void 0);
    _defineProperty(this, "text", void 0);
    _defineProperty(this, "$cont", null);
    _defineProperty(this, "$lines", null);
    _defineProperty(this, "$cmd", null);
    this.el = el;
    this.lines = [];
    this.text = text;
    this.render();
    this.el.addEventListener('click', function () {
      return _this.$cmd && _this.$cmd.focus();
    });
    setTimeout(function () {
      _this.$cont = _this.el.querySelector('.term-cont');
      _this.$lines = _this.el.querySelector('.term-lines');
      _this.$cmd = _this.el.querySelector('.term-cmd.current');
      if (_this.$cmd) {
        _this.$cmd.addEventListener('keydown', _this.onKeyDown.bind(_this));
      }
    });
  }
  return _createClass(Terminal, [{
    key: "onKeyDown",
    value: function onKeyDown(e) {
      var line = e.target.innerHTML;
      if (e.keyCode === 13) {
        e.preventDefault();
        this.addLine(line);

        // @ts-expect-error FIXME fix type error
        this.readLine(line);
      }
    }
  }, {
    key: "addLine",
    value: function addLine(line) {
      this.lines.push(line);
      if (!this.$lines || !this.$cont || !this.$cmd) {
        return;
      }
      this.$lines.innerHTML = this.lines.map(function (text) {
        return "<div class=\"term-line\"><span class=\"term-cmd\">~$&nbsp;".concat(text, "</span></div>");
      }).join('');
      this.$cmd.innerHTML = '';
      this.$cont.scrollTop = this.$cont.scrollHeight;
    }
  }, {
    key: "readLine",
    value: function readLine() {
      return false;
    }
  }, {
    key: "render",
    value: function render() {
      if (!this.el) {
        return;
      }
      this.el.innerHTML = template.replace('{text}', this.text).replace('{lines}', '');
    }
  }]);
}();

/***/ }),

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

/***/ "./src/client/javascript/modules/lazyload.ts":
/*!***************************************************!*\
  !*** ./src/client/javascript/modules/lazyload.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "lazyload": function() { return /* binding */ lazyload; }
/* harmony export */ });
function throttle(func, timeout) {
  var inThrottle = false;
  return function () {
    if (!inThrottle) {
      inThrottle = true;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      func.apply(this, args);
      setTimeout(function () {
        inThrottle = false;
      }, timeout);
    }
  };
}
function lazyload() {
  var windowHeight = window.innerHeight;
  var images = document.querySelectorAll('.lazyload');
  var offset = 120;
  images.forEach(function (image) {
    var boundingRect = image.getBoundingClientRect();
    var yPosition = boundingRect.top - windowHeight;
    var yPositionBottom = boundingRect.bottom;
    if (yPosition <= offset && yPositionBottom >= -offset) {
      // Заменяем содержимое src из data-src
      if (image.getAttribute('data-src')) {
        image.src = image.getAttribute('data-src');
      }

      // replace the srcset with the data-srcset
      if (image.getAttribute('data-srcset')) {
        image.srcset = image.getAttribute('data-srcset');
      }

      // replace the source srcset's with the data-srcset's
      if (image.parentElement.tagName === 'PICTURE') {
        var sources = image.parentElement.querySelectorAll('source');
        sources.forEach(function (source) {
          source.srcset = source.getAttribute('data-srcset');
        });
      }

      // Ожимаем пока новое изображение не загрузится
      image.addEventListener('load', function () {
        // Удаляем lazyload класс
        this.classList.remove('lazyload');
      });
    }
  });
}
var throttledLazyLoad = throttle(lazyload, 200);
document.addEventListener('scroll', throttledLazyLoad);
window.addEventListener('resize', throttledLazyLoad);
window.addEventListener('orientationChange', throttledLazyLoad);
window.lazyload = lazyload;
lazyload();


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

/***/ "./src/client/javascript/modules/postReactions.ts":
/*!********************************************************!*\
  !*** ./src/client/javascript/modules/postReactions.ts ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "registerPostReactions": function() { return /* binding */ registerPostReactions; }
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var EMOJI_MAP = {
  shocked: '🤯',
  love: '😍',
  like: '👍',
  dislike: '🥱',
  rage: '😡',
  party: '🥳',
  partyPopper: '🥳'
};
var IMAGES_MAP = {
  shocked: '/assets/reactions/shocked.svg',
  love: '/assets/reactions/love.svg',
  like: '/assets/reactions/like.svg',
  dislike: '/assets/reactions/dislike.svg',
  rage: '/assets/reactions/rage.svg',
  party: '/assets/reactions/party.svg',
  partyPopper: '/assets/reactions/partyPopper.svg'
};
var REACTION_ENDPOINT = 'https://i7on6ck7ng.execute-api.us-east-2.amazonaws.com/dev/posts/{slug}/likes';
function getSlug() {
  var _ref = document.location.pathname.match(/^\/posts\/([a-z0-9-_]+)/) || [],
    _ref2 = _slicedToArray(_ref, 2),
    slug = _ref2[1];
  return slug;
}
function getInitialReactions() {
  return {
    shocked: 0,
    love: 0,
    like: 0,
    dislike: 0,
    rage: 0,
    party: 0,
    partyPopper: 0
  };
}
function renderItems(reactions, wrapperEl) {
  if (_typeof(reactions) !== 'object') {
    return;
  }
  var content = Object.entries(reactions).map(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
      type = _ref4[0],
      count = _ref4[1];
    var typedType = type;
    return "\n    <div class=\"reactions__item reaction\" data-type=\"".concat(type, "\">\n      <img class=\"reaction__image\" src=\"").concat(IMAGES_MAP[typedType], "\" alt=\"").concat(EMOJI_MAP[typedType], "\" width=\"64\" height=\"64\" />\n      <div class=\"reaction__counter\">").concat(count, "</div>\n    </div>\n    ");
  });
  wrapperEl.innerHTML = content.join('\n');
}
function getReaction(slug) {
  return fetch(REACTION_ENDPOINT.replace('{slug}', slug)).then(function (response) {
    return response.json();
  }).catch(function (err) {
    return console.error(err);
  });
}
function clientOptimisticUpdate(wrapperEl, selector, increaseValue) {
  var el = wrapperEl.querySelector(selector);
  if (!el) {
    return;
  }
  var imageEl = el.querySelector('.reaction__image');
  var counterEl = el.querySelector('.reaction__counter');
  if (increaseValue) {
    el.classList.add('reaction_active');
    imageEl.src = imageEl.src.replace('.svg', '.gif');
    counterEl.textContent = String(Number(counterEl.textContent) + 1);
  } else {
    el.classList.remove('reaction_active');
    imageEl.src = imageEl.src.replace('.gif', '.svg');
    counterEl.textContent = String(Number(counterEl.textContent) - 1);
  }
}
function setReaction(type, wrapperEl) {
  var params = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: "{\"reactionId\":\"".concat(type, "\"}")
  };
  clientOptimisticUpdate(wrapperEl, '.reaction_active', false);
  clientOptimisticUpdate(wrapperEl, ".reaction[data-type=".concat(type, "]"), true);
  return fetch(REACTION_ENDPOINT.replace('{slug}', getSlug()), params).then(function (response) {
    return response.json();
  }).catch(function (err) {
    return console.error(err);
  });
}
function registerPostReactions() {
  var wrapperEl = document.querySelector('.reactions');
  if (!wrapperEl) {
    return;
  }
  renderItems(getInitialReactions(), wrapperEl);
  getReaction(getSlug()).then(function (reactions) {
    renderItems(reactions, wrapperEl);
    wrapperEl.addEventListener('click', function (event) {
      var target = event.target;
      if (!target) {
        return;
      }
      var el = target.closest('.reaction') || target;
      if (!el.dataset.type) {
        return;
      }
      setReaction(el.dataset.type, wrapperEl);
    });
  });
}

/***/ }),

/***/ "./src/client/javascript/modules/prepareExternalLinks.ts":
/*!***************************************************************!*\
  !*** ./src/client/javascript/modules/prepareExternalLinks.ts ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "prepareExternalLinks": function() { return /* binding */ prepareExternalLinks; }
/* harmony export */ });
function isExternalLink() {
  var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var host = document.location.host;
  return url.startsWith('http') && !url.includes(host);
}
function prepareExternalLinks() {
  document.querySelectorAll('.post a').forEach(function (a) {
    if (isExternalLink(a.getAttribute('href'))) {
      a.setAttribute('rel', 'noreferrer external');
      a.setAttribute('target', '_blank');
    }
  });
}

/***/ }),

/***/ "./src/client/javascript/modules/scroll.ts":
/*!*************************************************!*\
  !*** ./src/client/javascript/modules/scroll.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "scroll": function() { return /* binding */ scroll; }
/* harmony export */ });
function scroll() {
  var upContainer = document.querySelector('.post-layer__up');
  var lastScrolledY = 0;
  if (!upContainer) {
    return;
  }
  upContainer.addEventListener('click', function () {
    var scrolled = window.scrollY > 100;
    if (lastScrolledY && !scrolled) {
      window.scrollTo(0, lastScrolledY);
      lastScrolledY = 0;
    } else {
      lastScrolledY = window.scrollY;
      window.scrollTo(0, 0);
    }
  });
  window.addEventListener('scroll', function () {
    var scrolled = window.scrollY > 100;
    if (scrolled) {
      upContainer.classList.add('post-layer__up_scrolled');
      upContainer.classList.remove('post-layer__has_down_scroll');
    } else {
      upContainer.classList.remove('post-layer__up_scrolled');
      if (lastScrolledY) {
        upContainer.classList.add('post-layer__has_down_scroll');
      }
    }
  });
}

/***/ }),

/***/ "./src/client/javascript/modules/share.ts":
/*!************************************************!*\
  !*** ./src/client/javascript/modules/share.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isWebShareSupported": function() { return /* binding */ isWebShareSupported; },
/* harmony export */   "registerShare": function() { return /* binding */ registerShare; }
/* harmony export */ });
function isWebShareSupported() {
  if (!('share' in window.navigator)) {
    return false;
  }
  if ('canShare' in navigator) {
    var url = "https://".concat(window.location.hostname);
    return window.navigator.canShare({
      url: url
    });
  }
  return true;
}
function registerShare() {
  var button = document.querySelector('[data-id=share-button');
  if (!button || !isWebShareSupported()) {
    return;
  }
  var shareData = {
    text: document.title,
    url: window.location.href
  };
  button.addEventListener('click', function (event) {
    try {
      event.preventDefault();
      navigator.share(shareData);
    } catch (err) {
      console.error(err);
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

/***/ "./src/client/javascript/post.entry.ts":
/*!*********************************************!*\
  !*** ./src/client/javascript/post.entry.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var medium_zoom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! medium-zoom */ "../../node_modules/.pnpm/medium-zoom@1.0.4/node_modules/medium-zoom/dist/medium-zoom.esm.js");
/* harmony import */ var _modules_bot_createBot__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./modules/bot/createBot */ "./src/client/javascript/modules/bot/createBot.ts");
/* harmony import */ var _modules_copy__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modules/copy */ "./src/client/javascript/modules/copy.ts");
/* harmony import */ var _modules_lazyload__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./modules/lazyload */ "./src/client/javascript/modules/lazyload.ts");
/* harmony import */ var _modules_menu__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./modules/menu */ "./src/client/javascript/modules/menu.ts");
/* harmony import */ var _modules_postReactions__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./modules/postReactions */ "./src/client/javascript/modules/postReactions.ts");
/* harmony import */ var _modules_prepareExternalLinks__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./modules/prepareExternalLinks */ "./src/client/javascript/modules/prepareExternalLinks.ts");
/* harmony import */ var _modules_scroll__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./modules/scroll */ "./src/client/javascript/modules/scroll.ts");
/* harmony import */ var _modules_share__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./modules/share */ "./src/client/javascript/modules/share.ts");
/* harmony import */ var _modules_theme__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./modules/theme */ "./src/client/javascript/modules/theme.ts");
/* harmony import */ var _stylesheets_post_entry_css__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../stylesheets/post.entry.css */ "./src/client/stylesheets/post.entry.css");











(0,_modules_theme__WEBPACK_IMPORTED_MODULE_9__.syncTheme)();
document.addEventListener('DOMContentLoaded', function () {
  document.body.classList.add('loaded');
  var $postImages = document.querySelectorAll('.post__content img');
  var $terminals = document.querySelectorAll('.terminal');
  (0,_modules_menu__WEBPACK_IMPORTED_MODULE_4__.registerMenuHandlers)();
  (0,_modules_copy__WEBPACK_IMPORTED_MODULE_2__.initCopyToClipboard)();
  (0,_modules_lazyload__WEBPACK_IMPORTED_MODULE_3__.lazyload)();
  (0,medium_zoom__WEBPACK_IMPORTED_MODULE_0__["default"])($postImages, {
    background: '#2f2f2ed6'
  });
  (0,_modules_postReactions__WEBPACK_IMPORTED_MODULE_5__.registerPostReactions)();
  (0,_modules_prepareExternalLinks__WEBPACK_IMPORTED_MODULE_6__.prepareExternalLinks)();
  (0,_modules_scroll__WEBPACK_IMPORTED_MODULE_7__.scroll)();
  (0,_modules_bot_createBot__WEBPACK_IMPORTED_MODULE_1__.registerTerminals)($terminals);
  (0,_modules_share__WEBPACK_IMPORTED_MODULE_8__.registerShare)();
  (0,_modules_theme__WEBPACK_IMPORTED_MODULE_9__.registerThemeToggler)();
});

/***/ }),

/***/ "./src/client/stylesheets/post.entry.css":
/*!***********************************************!*\
  !*** ./src/client/stylesheets/post.entry.css ***!
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
/******/ 			"post": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_pnpm_clipboard_2_0_4_node_modules_clipboard_dist_clipboard_js","vendors-node_modules_pnpm_typebot_core_0_0_2_node_modules_typebot_core_lib_core_Bot_js-node_m-784253"], function() { return __webpack_require__("./src/client/javascript/post.entry.ts"); })
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=post.entry.js.map?v=b64ef7f3e2cffa5d98e4