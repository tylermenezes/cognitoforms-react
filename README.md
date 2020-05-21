# CognitoForms React

A React component for embedding CognitoForms forms, making it easy to embed in a React-like way.

Usage:

```jsx
import CognitoForm from '@tylermenezes/cognitoforms-react';


export default () => (
  <>
    <h1>My Demo Page</h1>
    <CognitoForm
      formId={61}
      accountId={`SOMEACCOUNTIDSTRING`}
      prefill={{
        Name: {
          First: 'John',
          Last: 'Peter',
        }
      }}
      css="* { color: red !important }"
    />
  </h1>
);
```
