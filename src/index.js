/* eslint-disable import/no-unresolved */
/* eslint-disable no-undef */

const React = require('react');
const {
  useState, useEffect, useRef, useMemo, useReducer,
} = require('react');
const PropTypes = require('prop-types');

const SCRIPT_SRC = 'https://www.cognitoforms.com/f/seamless.js';

/**
 * Because we need to make sure the form <script> never re-renders, we need to use refs.
 */
function useStateRef(val) {
  const ref = useRef(val);
  useEffect(() => { ref.current = val; }, [val]);
  return ref;
}

function useIsBrowser() {
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => { setIsBrowser(typeof window !== 'undefined'); }, [typeof window]);
  return isBrowser;
}

const genId = (parts) => 'id-' + parts.map(p => p.toString().replace(/[^a-zA-Z0-9]/g, '')).join('-');
function useId(parts) {
  const [id, setId] = useState(genId(parts));
  useEffect(() => { setId(genId(parts)); }, parts);
  return id;
}

/**
 * A CognitoForms iframe embed, with styling and prefills built-in!
 *
 * @param {object} params React params
 * @param {string} params.accountId           The CognitoForms account ID (the random text after /f/ in your embed code)
 * @param {string} params.formId              The form number (the integer in your embed code)
 * @param {string=} params.css                URL or CSS code to load in the form.
 * @param {object=} params.prefill            Object representing form fields to prefill on the page.
 * @param {React.Component} params.loading    React element to show when the form is loading.
 * @param {Function=} params.onReady          Function to run after the form is ready.
 * @param {Function=} params.onSubmit         Function to run after the form is submitted.
 * @param {Function=} params.onPageChange     Function to run after the page changes.
 * @returns {React.Component}                 React component.
 */
const Form = ({
  accountId, formId, css, prefill, loading, onReady, onSubmit, onPageChange,
}) => {
  const isBrowser = useIsBrowser();
  const id = useId([accountId, formId]);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef();

  // When accountId or formId changes, re-render the form.
  useEffect(() => {
    setIsLoaded(false);
    if (containerRef.current) {
      containerRef.current.height = 0;
      containerRef.current.overflow = 'hidden';
    }
  }, [accountId, formId]);

  // We can't use normal hooks because it would rerender the memo, so we'll periodically check
  // if the ref has initialized yet.
  const [retry, nextRetry] = useReducer(prev => prev+1, 0);
  useEffect(() => {
    if (containerRef.current) return () => {};
    const retrierTimeout = setTimeout(nextRetry, 350 * retry);
    return () => clearTimeout(retrierTimeout);
  }, [retry]);

  // Refs to prevent re-renders of the memo
  const setIsLoadedRef = useStateRef(setIsLoaded);
  const onReadyRef = useStateRef(onReady);
  const onSubmitRef = useStateRef(onSubmit);
  const onPageChangeRef = useStateRef(onPageChange);
  const prefillRef = useStateRef(prefill);

  const formContainer = useMemo(() => (
    <div id={id+'-parent'} ref={containerRef} style={{ height: 0, overflow: 'hidden' }}>
      <div id={id} />
    </div>
  ), [id, isBrowser]);

  const cssContainer = useMemo(() => (
    <style type="text/css">{typeof css === 'function' ? css(id+'-parent') : css}</style>
  ), [id, css]);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    const cfScript = document.createElement('script');
    cfScript.src = SCRIPT_SRC;
    cfScript.dataset.key = accountId;
    cfScript.dataset.form = formId;
    cfScript.addEventListener('load', () => {
      window.Cognito
        .mount(formId.toString(), `#${id}`)
        .on('ready', () => {
          setIsLoadedRef.current(true);
          if (onReadyRef.current) onReadyRef.current();
          containerRef.current?.style.height = 'auto';
          containerRef.current?.style.overflow = 'initial';
        })
        .on('afterSubmit', () => onSubmitRef.current())
        .on('afterNavigate', () => onPageChangeRef.current())
        .prefill(prefillRef.current || {});
    });
    containerRef.current.children[0]?.appendChild(cfScript);
  }, [id, formId, accountId, containerRef.current, typeof window]);

  if (!isBrowser) return loading;

  return (
    <React.Fragment>
      {!isLoaded && loading}
      {cssContainer}
      {formContainer}
      <div style={{ display: 'none' }}>{retry}</div>
    </React.Fragment>
  );
};

Form.propTypes = {
  accountId: PropTypes.string.isRequired,
  formId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  css: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  prefill: PropTypes.object,
  loading: PropTypes.element,
  onReady: PropTypes.func,
  onSubmit: PropTypes.func,
  onPageChange: PropTypes.func,
};

Form.defaultProps = {
  css: null,
  prefill: null,
  loading: null,
  onReady: () => {},
  onSubmit: () => {},
  onPageChange: () => {},
};

module.exports = Form;
