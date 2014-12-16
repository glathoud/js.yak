`yak.js`
======

Yet Another yaK - JS &amp; JSON united together to write dynamic HTML pages with less hassle.

Idea : sick of both HTML and kludgy backend frameworks -> use JS &
JSON to write dynamic pages. Can also run in V8 backend + cache
(varnish or equivalent) if you absolutely want pure HTML output.

## Disclaimer

Please do not take `yak.js` too seriously. This started as a joke. Who knows how this will turn out.

## Contents

 * [Browser example](#browser-example)
 * [Use: directly in the browser](#use-directly-in-the-browser)
 * [Use: in a V8 backend](#use-in-a-v8-backend)
 * [Tools](#tools)
 
## Browser example 

Source: [./index.html](./index.html)

Live: http://glat.info/js.yak/

## Use: directly in the browser

Depending on your constraints (SEO...), the size of your contents, their static or dynamic nature, and your taste, you can use one or both of the two options 2a. or 2b.

1. Load `yak.js`

```html
<script type="text/javascript" src="yak.js"></script>
```

2a. One possible use: write yak.js code inline and parse it later on:

```html
<script type="text/yak.js">
[
    { p : [ 'Summary: '
            , { ul : 
                'wrote plain HTML > got fed up writing closing tags and having too little page structure dynamics > generated HTML using frameworks > too many features > kludge accumulated over time > wrote plain HTML again > got fed up again > wrote - wait first wrote YAK.'
                .split( '>' ).map( yak.f( '{ li : v }' ) ) 
              }
            , { hr : null }
            , { p : 'Bonjour' }
            , { p : (function define( n ) {
                return n > 0  
                    ?  { blockquote : [ 'Y.A.K. means Yet Another (', define( n - 1 ), ')' ] }
                : 'yaK'
                ;  
            }( 10 ))
              }
            , { p : 'Aurevoir' }
          ]
      }
    , ...
]
</script>

...


<script type="text/yak.js">
  [ { p : 'By Guillaume Lathoud, December 2014.' } ]
</script>

...
    

<script type="text/javascript">yak.parse()</script>

```

2b. Another use: directly call `yak.paste(<object>)` or `yak.paste(<filename>)`:

```html

<script type="text/javascript" id="yak-paste-object">yak.paste([ 
  { hr : null }
  , { p : [ 'Call yak.paste with an', { strong : 'object' }, ':' ] }
  , { pre : { code : document.getElementById( 'yak-paste-object' ).textContent } }
  , { hr : null}
]);</script>

or

<script type="text/javascript" id="yak-paste-filename">
yak.paste("yak_test.yak.js");
</script>

```

## Use: in a V8 backend

1. Load `yak.js`:

```js
load('yak.js');
```

2a. One possible use: call `yak.paste(<object or filename>)` as above, which writes to the standard output right away. Example:

```js
yak.paste([
  { '!DOCTYPE HTML': null }   // `null` means here: no closing slash
  , { html : [
      { head : [ { meta : 'charset: utf-8' }, { title : 'my title' }, ... ] }
      , { body : [
          { 'p class="big-p"' : 'blah blah blah' }
          , { h3 : 'blah blah' }
          , { p : [ { ... }, ... ]}
      ]}
  ]}
]);
```

2b. Another possible use: call `yak(<object>)` or `yak(yak.readeval(<filename>))`, which both return a markup string - they do NOT write to the standard output.

## Tools

`yak.js` comes along with a few small tools like `yak.o()`, see the (currently pretty short) [source](./yak.js).

