# iframe

The iframe widget specifies an inline frame.

An inline frame widget is used to embed another document within the current document.

## Tips and Notes

Tip: To deal with browsers that do not support iframe, add a text between the opening iframe tag and the closing </iframe> tag.

Tip: Use style to form the iframe (even to include scrollbars).

## Attributes

### height

Specifies the height of an iframe

### name

Specifies the name of an iframe

### sandbox

The sandbox attribute enables an extra set of restrictions for the content in the iframe.

When the sandbox attribute is present, and it will:

- treat the content as being from a unique origin
- block form submission
- block script execution
- disable APIs
- prevent links from targeting other browsing contexts
- prevent content from using plugins (through <embed>, <object>, <applet>, or other)
- prevent the content to navigate its top-level browsing context
- block automatically triggered features (such as automatically playing a video or automatically focusing a form control)
- The value of the sandbox attribute can either be just sandbox (then all restrictions are applied), or a space-separated list of pre-defined values that will REMOVE the particular restrictions.

values:

- allow-forms
- allow-pointer-lock
- allow-popups
- allow-same-origin
- allow-scripts
- allow-top-navigation

### src

Specifies the address of the document to embed in the iframe

### srcdoc

Specifies the HTML content of the page to show in the iframe

### width

Specifies the width of an iframe
