// YAK: Yet Another yaK
// 
// I originally wanted to write an HTML page but then I thought I'd
// first write YAK, then write my HTML page using YAK. Just kidding :)
//
// Guillaume Lathoud
// December 2014
// 
// License: see the accompanying file ./LICENSE

(function () {

    var  global = this
    , isBrowser = typeof document !== 'undefined'  &&  
        typeof window !== 'undefined'  &&  
        typeof XMLHttpRequest === 'function'
    ;

    global.yak = yak;
    
    yak.parse = yak_parse;
    yak.paste = yak_paste;

    // Tools

    yak.array     = yak_array;
    yak.e         = yak_e;
    yak.eval      = yak_eval;
    yak.f         = yak_f;
    yak.html      = yak_html;
    yak.o         = yak_o;
    yak.read      = yak_read;
    yak.readeval  = yak_readeval;

    yak.isBrowser = isBrowser;

    function yak( simple_or_object, optargs )
    {
        var t = typeof simple_or_object;

        if ('function' === t)
            return yak( simple_or_object.apply( null, optargs ) );
        
        if ('string' === t)
        {
            return simple_or_object
                .replace( /&/g, '&amp;' )            
                .replace( /</g, '&lt;' )
                .replace( />/g, '&gt;' )            
                .replace( /"/g, '&quot;' )
                .replace( /'/g, '&apos;' )
            ;
        }

        if ('boolean' === t  ||  'number' === t)
            return simple_or_object + '';

        if ('object' !== t)
        {
            throw new Error( 
                'Filename string, or array, or object expected. ' + 
                    'Nothing else.' 
            );
        }

        if (simple_or_object instanceof yak_html)
            return simple_or_object.html;

        if (simple_or_object instanceof Array)
            return simple_or_object.map( yak ).join( '' );

        var karr = Object.keys( simple_or_object );
        if (karr.length !== 1)
        {
            throw new Error( 
                'A single key is expected, e.g. "hr" or ' + 
                    '"p id=\'dom-id\'" or ' + 
                    '"a href=\'http://link.com\'".' 
            );
        }

        var k = karr[ 0 ];
        if (!k)
            throw new Error( 'A non-empty key is expected.' );

        var tag = k.match( /^\s*(\S+)(?=\s|$)/ )[ 1 ];
        
        // detect HTML5 void elements: 
        // http://www.w3.org/TR/html5/syntax.html#void-elements
        // http://stackoverflow.com/a/7854998
        
        if (tag in { area:1, base:1, br:1, col:1, embed:1, hr:1, img:1, input:1, 
                     keygen:1, link:1, meta:1, param:1, source:1, track:1, wbr:1 }
           )
            return '<' + k + '>'
        ;
        
        var v = simple_or_object[ k ];
        return v == null  
            ?  '<' + k + '/>'  
            :  '<' + k + '>' + yak( v ) + '</' + tag + '>'
        ;
    }

    function yak_array( /*integer*/n )
    // Return a new array of length `n` which already has all its
    // elements (as opposed to `new Array(n)`), so that one can 
    // write: 
    //
    // {{{
    // var arr12 = yak.array( 12 ).map( function ( tmp, i ) { return i; } );
    // // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    // }}}
    //
    // or shorter:
    //
    // {{{
    // var arr12 = yak.array( 12 ).map( yak.f( "k" ) );
    // // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    //
    // var arr12 = yak.array( 12 ).map( yak.f( "2*k+1" ) );
    // // [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]
    // }}}
    //
    // Difference:
    // {{{
    // 0 in new Array( 12 )  // false
    // 0 in yak.array( 12 )  // true
    // }}}
    {
        return Array.apply( null, Array( n ) ); // based on:  http://stackoverflow.com/a/19286846
    }

    function yak_e( /*expression or partial expression using `v` (left) and optionally `k` (right) variables*/codestring )
    {
        var leftvar  = 'v'
        ,   rightvar = 'k'
        
        ,   is_left_implicit  = /^\s*(?:[+*\/%&|\^\.=<>\?]|!=|$)/.test( codestring )
	,   is_right_implicit = /[+\-*\/%&|\^\.=<>!]\s*$/      .test( codestring )  &&  !/(\+\+|\-\-)$/.test( codestring )
        ;
        if (is_left_implicit)
            codestring = leftvar + codestring;
        
        if (is_right_implicit)
            codestring += is_left_implicit ? rightvar : leftvar;

        return codestring;
    }
    

    function yak_eval( codestring )
    {
        return new Function( 'return (' + codestring + ');' )();
    }

    function yak_f( codestring )
    {
        return new Function( 'v', 'k', 'return (' + yak_e( codestring ) + ');' );
    }

    function yak_html( html )
    // Wrapper to indicate ready HTML -> will not be escaped.
    {
        if (!(this instanceof yak_html))
            return new yak_html( html );

        this.html = html;
    }
    
    function yak_o( k, v )
    {
        var ret = {};
        ret[ k ] = v;
        return ret;
    }
    
    var _yak_parsed = [];
    function yak_parse()
    {
        var noli = [].filter.call( 
            document.getElementsByTagName( 'script' )
            , is_yak_js
        );
        for (var n = noli.length, i = 0; i < n; i++)
        {
            var node = noli[ i ];
            if (!(-1 < _yak_parsed.lastIndexOf( node )))
            {
                _yak_parsed.push( node );

                // Prepare

                var div = document.createElement( 'div' );
                div.innerHTML = yak( yak_eval( node.textContent ) );
                div.setAttribute( 'class', 'yak-parsed' );

                // Replace

                node.parentNode.insertBefore( div, node );
                node.parentNode.removeChild( node );
            }
        }

        function is_yak_js( scriptnode )
        {
            return scriptnode.getAttribute( 'type' ) === 'text/yak.js';
        }
    }
  
    function yak_paste( filename_or_object, optargs )
    {
        var object = 'string' === typeof filename_or_object
            ?  yak_readeval( filename_or_object )
            :  filename_or_object
        
        , markup = yak( object, optargs )
        ;
        
        if (isBrowser)
            document.write( markup );
        else
            write( markup );
    }

    function yak_read( filename )
    {
        if (isBrowser)
        {
            var xhr = new XMLHttpRequest();
            xhr.open( "GET", filename, /*async:*/false );
            xhr.send();
            if (xhr.status !== 0  &&  xhr.status !== 200)
                throw new Error( 'XHR failed.' );
            
            return xhr.responseText;
        }
        else
        {
            return read( filename );
        }
    }
  
    function yak_readeval ( filename )
    { 
        return yak_eval( yak_read( filename ) + '\n/*src: ' + filename + ' */' );
    }
    
})();
