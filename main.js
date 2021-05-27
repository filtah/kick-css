function kickCSS(s) {

    const selector = document.querySelector(s)
    if ( ! selector ) return

    // if ( typeof window.kick_css_output === 'undefined' ) {
    //     window.kick_css_output = '';
    // }
    // window.kick_css_output += 'x'
    // let output = window.kick_css_output

    let output = new Map([
        [''    , ''],
        ['sm:' , ''],
        ['md:' , ''],
        ['lg:' , ''],
    ])

    let outputHTML = ''

    const query = document.querySelectorAll('[class]')

    // console.log(query)

    query.forEach(function(item) {

        // console.log(item.className)

        const regex = /(?<!\S)(sm:|md:|lg:)?(pt|pb|pl|pr|mt|mb|ml|mr|mnw|mxw)-(\d+)(\.\d+)?(rem|em|px)(?!\S)/g

        let matches = [...item.className.matchAll(regex)]
        // console.log(matches)
        
        if ( matches.length ) {
            
            // console.log( matches )

            matches.forEach(match => {

                // console.log(match)

                let _rule = {
                    selector: escapeSelector(match[0]),
                    miniMQ:   match[1] || '',
                    fullMQ:   lookupMQ(match[1]) || '',
                    miniDec:  match[2],
                    fullDec:  lookupDeclaration(match[2]),
                    whole:    match[3],
                    fraction: match[4] || '',
                    unit:     match[5]
                }
                // console.log(_rule)
    
                let rule = `.${_rule.selector} { ${_rule.fullDec}: ${_rule.whole}${_rule.fraction}${_rule.unit}; }`
                // console.log(rule)

                if ( _rule.miniMQ ) {
                    // just indent..
                    rule = `  ${rule}`
                }
                    
                output.set(_rule.miniMQ, output.get(_rule.miniMQ) + `${rule}\n`)
                // console.log( output.get(_rule.miniMQ) )

            })


        }
    
    });


    output.forEach((styles, mq) => {

        // console.log(mq, styles)

        // no media query..
        if ( !mq && styles ) {

            outputHTML += styles
            
        }
        // has media query..
        else if ( mq && styles ) {

            // console.log(lookupMQ(mq))
            outputHTML += lookupMQ(mq) +` {\n${styles}}`

        }
    })

    console.log(outputHTML)
    selector.innerHTML = outputHTML







    function escapeSelector(sel) {
        //escape : and .
        return sel.replace(/([:\.])/g, '\\$1')
    }

    function lookupDeclaration(dec) {
        const decs = {

            // padding
            pt: 'padding-top',
            pb: 'padding-bottom',
            pl: 'padding-left',
            pr: 'padding-right',

            // margin
            mt: 'margin-top',
            mb: 'margin-bottom',
            ml: 'margin-left',
            mr: 'margin-right',

            // widths
            mxw: 'max-width',
            mnw: 'min-width',


            
        }
        return decs[dec]
    }

    function lookupMQ(mQ) {
        const mQs = {

            'sm:' : '@media (min-width: 576px)',
            'md:' : '@media (min-width: 768px)',
            'lg:' : '@media (min-width: 992px)',

        }
        return mQs[mQ]
    }

}
