/* eslint-disable no-undef */

const React = require('react');
const {
  useState, useEffect, useRef, useReducer,
} = require('react');
const PropTypes = require('prop-types');

const getMessage = (event, data) => JSON.stringify({ event, data });

/**
 * A CognitoForms iframe embed, with styling and prefills built-in!
 *
 * @param {string} accountId The CognitoForms account ID (the random text after /f/ in your embed code)
 * @param {string} formId The form number (the integer in your embed code)
 * @param {string?} css URL or CSS code to load in the form.
 * @param {object?} prefill Object representing form fields to prefill on the page.
 * @param {React.Component} loading React element to show when the form is loading.
 * @returns {React.Component}
 */
const Form = ({
  accountId, formId, css, prefill, loading,
}) => {
  const ref = useRef();
  const [loaded, setLoaded] = useState(false);
  const [height, setHeight] = useState(100);
  const [grow, dispatchGrow] = useReducer((v) => !v, false);


  useEffect(() => {
    setLoaded(false);
    setHeight(100);
  }, [accountId, formId]);

  const iframeSrc = `https://services.cognitoforms.com/f/${accountId}?id=${formId}`;

  // Event handlers for postMessage
  const listeners = {
    heightChanged: ({ height: newHeight }) => { setHeight(newHeight); },
    navigate: ({ url }) => { window.top.document.location.href = url; },
    updateHash: ({ hash }) => { window.top.document.location.hash = hash; },
    domReady: (_, src) => {
      src.postMessage(getMessage('init', { embedUrl: 'http://localhost/', entry: '' }), '*');
      src.postMessage(getMessage('setCss', { css }), '*');
      src.postMessage(getMessage('prefill', { entry: prefill }), '*');
      setTimeout(() => setLoaded(true), 1000);
    },
  };

  const onMessageRecieved = ({ data, source }) => {
    if (!ref.current || source !== ref.current.contentWindow) return;
    if (typeof data !== 'string') return;
    const payload = JSON.parse(data);
    if (payload.event in listeners) listeners[payload.event](payload, source);
  };

  // Register our message listener
  useEffect(() => {
    if (!ref.current) return () => {};
    window.addEventListener('message', onMessageRecieved, false);
    return () => window.removeEventListener('message', onMessageRecieved);
  }, []);

  // This is a dumb hack to fix the fact that CognitoForms doesn't dispatch resize events when the form changes size,
  // only when the window changes size. TODO: follow up whenever CognitoForms fixes this.
  useEffect(() => {
    const interval = setInterval(() => dispatchGrow(), 1000);
    return () => clearInterval(interval);
  }, []);

  // The CF form
  return (
    // eslint-disable-next-line react/jsx-fragments
    <React.Fragment>
      {!loaded && loading}
      <iframe
        src={iframeSrc}
        title="Form"
        width="100%"
        height={height + (grow ? 1 : 0)}
        ref={ref}
        style={{
          height: `${height + (grow ? 1 : 0)}px`,
          display: !loaded && 'none',
          marginBottom: `${grow ? 0 : 1}px`,
        }}
      />
    </React.Fragment>
  );
};
Form.propTypes = {
  accountId: PropTypes.string.isRequired,
  formId: PropTypes.string.isRequired,
  css: PropTypes.string,
  prefill: PropTypes.object,
  loading: PropTypes.element,
};
Form.defaultProps = {
  css: null,
  prefill: null,
  loading: null,
};

module.exports = Form;
