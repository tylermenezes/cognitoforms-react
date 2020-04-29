"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/* eslint-disable import/no-unresolved */

/* eslint-disable no-undef */
var React = require('react');

var _require = require('react'),
    useState = _require.useState,
    useEffect = _require.useEffect,
    useRef = _require.useRef,
    useReducer = _require.useReducer;

var PropTypes = require('prop-types');
/**
 * Prepares a message for CognitoForms
 *
 * @param {string} event The event name (init, setCss, or prefill are supported)
 * @param {object} data Event data to send
 * @returns {string} Message to send with postMessage
 */


var getMessage = function getMessage(event, data) {
  return JSON.stringify({
    event: event,
    data: data
  });
};
/**
 * A CognitoForms iframe embed, with styling and prefills built-in!
 *
 * @param {object} params React params
 * @param {string} params.accountId         The CognitoForms account ID (the random text after /f/ in your embed code)
 * @param {string} params.formId            The form number (the integer in your embed code)
 * @param {string?} params.css              URL or CSS code to load in the form.
 * @param {object?} params.prefill          Object representing form fields to prefill on the page.
 * @param {React.Component} params.loading  React element to show when the form is loading.
 * @param {object?} params.style            Style to apply to the form.
 * @returns {React.Component}               React component.
 */


var Form = function Form(_ref) {
  var accountId = _ref.accountId,
      formId = _ref.formId,
      css = _ref.css,
      prefill = _ref.prefill,
      loading = _ref.loading,
      style = _ref.style;
  var ref = useRef();

  var _useState = useState(false),
      _useState2 = _slicedToArray(_useState, 2),
      loaded = _useState2[0],
      setLoaded = _useState2[1];

  var _useState3 = useState(100),
      _useState4 = _slicedToArray(_useState3, 2),
      height = _useState4[0],
      setHeight = _useState4[1];

  var _useReducer = useReducer(function (v) {
    return !v;
  }, false),
      _useReducer2 = _slicedToArray(_useReducer, 2),
      grow = _useReducer2[0],
      dispatchGrow = _useReducer2[1];

  useEffect(function () {
    setLoaded(false);
    setHeight(100);
  }, [accountId, formId]);
  var iframeSrc = "https://services.cognitoforms.com/f/".concat(accountId, "?id=").concat(formId); // Event handlers for postMessage

  var listeners = {
    heightChanged: function heightChanged(_ref2) {
      var newHeight = _ref2.height;
      setHeight(newHeight);
    },
    navigate: function navigate(_ref3) {
      var url = _ref3.url;
      window.top.document.location.href = url;
    },
    updateHash: function updateHash(_ref4) {
      var hash = _ref4.hash;
      window.top.document.location.hash = hash;
    },
    domReady: function domReady(_, src) {
      src.postMessage(getMessage('init', {
        embedUrl: 'http://localhost/',
        entry: ''
      }), '*');
      src.postMessage(getMessage('setCss', {
        css: css
      }), '*');
      src.postMessage(getMessage('prefill', {
        entry: prefill
      }), '*');
      setTimeout(function () {
        return setLoaded(true);
      }, 1000);
    }
  };
  /**
   * Processes a postMessage from CognitoForms.
   */

  var onMessageRecieved = function onMessageRecieved(_ref5) {
    var data = _ref5.data,
        source = _ref5.source;
    if (!ref.current || source !== ref.current.contentWindow) return;
    if (typeof data !== 'string') return;
    var payload = JSON.parse(data);
    if (payload.event in listeners) listeners[payload.event](payload, source);
  }; // Register our message listener


  useEffect(function () {
    if (!ref.current) return function () {};
    window.addEventListener('message', onMessageRecieved, false);
    return function () {
      return window.removeEventListener('message', onMessageRecieved);
    };
  }, []); // This is a dumb hack to fix the fact that CognitoForms doesn't dispatch resize events when the form changes size,
  // only when the window changes size. TODO: follow up whenever CognitoForms fixes this.

  useEffect(function () {
    var interval = setInterval(function () {
      return dispatchGrow();
    }, 1000);
    return function () {
      return clearInterval(interval);
    };
  }, []); // The CF form

  return (
    /*#__PURE__*/
    // eslint-disable-next-line react/jsx-fragments
    React.createElement(React.Fragment, null, !loaded && loading, /*#__PURE__*/React.createElement("iframe", {
      src: iframeSrc,
      title: "Form",
      width: "100%",
      height: height + (grow ? 1 : 0),
      ref: ref,
      style: _objectSpread({
        height: "".concat(height + (grow ? 1 : 0), "px"),
        display: !loaded && 'none',
        marginBottom: "".concat(grow ? 0 : 1, "px"),
        transition: 'all 0.25s ease-in-out'
      }, style || {})
    }))
  );
};

Form.propTypes = {
  accountId: PropTypes.string.isRequired,
  formId: PropTypes.string.isRequired,
  css: PropTypes.string,
  prefill: PropTypes.object,
  loading: PropTypes.element,
  style: PropTypes.object
};
Form.defaultProps = {
  css: null,
  prefill: null,
  loading: null,
  style: {}
};
module.exports = Form;