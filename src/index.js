/* eslint-disable import/no-unresolved */
/* eslint-disable no-undef */

const React = require('react');
const {
  useState, useEffect, useRef, useReducer,
} = require('react');
const PropTypes = require('prop-types');

/**
 * Prepares a message for CognitoForms
 *
 * @param {string} event The event name (init, setCss, or prefill are supported)
 * @param {object} data Event data to send
 * @returns {string} Message to send with postMessage
 */
const getMessage = (event, data) => JSON.stringify({ event, data });

/**
 * A CognitoForms iframe embed, with styling and prefills built-in!
 *
 * @param {object} params React params
 * @param {string} params.accountId           The CognitoForms account ID (the random text after /f/ in your embed code)
 * @param {string} params.formId              The form number (the integer in your embed code)
 * @param {string=} params.css                URL or CSS code to load in the form.
 * @param {object=} params.prefill            Object representing form fields to prefill on the page.
 * @param {React.Component} params.loading    React element to show when the form is loading.
 * @param {object=} params.style              Style to apply to the form.
 * @param {Function=} params.onSubmit         Function to run after the form is submitted.
 * @param {Function=} params.onPageChange     Function to run after the page changes.
 * @returns {React.Component}                 React component.
 */
const Form = ({
  accountId, formId, css, prefill, loading, style, onSubmit, onPageChange,
}) => {
  const ref = useRef();
  const [loaded, setLoaded] = useState(false);
  const [height, setHeight] = useState(0);
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
    fireEvent: ({ name, data }) => {
      if (name === 'afterSubmit.cognito') return onSubmit(data);
      if (name === 'afterNavigate.cognito') return onPageChange(data);
      return null;
    },
    domReady: (_, src) => {
      src.postMessage(getMessage('init', { embedUrl: 'http://localhost/', entry: '' }), '*');
      src.postMessage(getMessage('setCss', { css }), '*');
      src.postMessage(getMessage('prefill', { entry: prefill }), '*');
      setTimeout(() => setLoaded(true), 1000);
    },
  };

  /**
   * Processes a postMessage from CognitoForms.
   */
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
  }, [onSubmit, onPageChange]);

  // This is a dumb hack to fix the fact that CognitoForms doesn't dispatch resize events when the form changes size,
  // only when the window changes size. TODO: follow up whenever CognitoForms fixes this.
  useEffect(() => {
    const interval = setInterval(() => dispatchGrow(), 4000);
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
          height: !loaded ? `1px` : `${height + (grow ? 1 : 0)}px`,
          marginBottom: `${grow ? 0 : 1}px`,
          opacity: !loaded ? 0 : 1,
          transition: 'all 0.25s ease-in-out',
          ...(style || {}),
        }}
      />
    </React.Fragment>
  );
};
Form.propTypes = {
  accountId: PropTypes.string.isRequired,
  formId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  css: PropTypes.string,
  prefill: PropTypes.object,
  loading: PropTypes.element,
  style: PropTypes.object,
  onSubmit: PropTypes.func,
  onPageChange: PropTypes.func,
};
Form.defaultProps = {
  css: null,
  prefill: null,
  loading: null,
  style: {},
  onSubmit: () => {},
  onPageChange: () => {},
};

module.exports = Form;
