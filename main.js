function kickCSS(s, ssUrl='') {

    const selector = document.querySelector(s)
    if ( ! selector ) return

    // if ( typeof window.kick_css_output === 'undefined' ) {
    //     window.kick_css_output = '';
    // }
    // window.kick_css_output += 'x'
    // let output = window.kick_css_output

    // sort the output by media query breakpoints.
    // init the map with breakpoint keys..
    const output = new Map([
        [''    , {}],
        ['sm:' , {}],
        ['md:' , {}],
        ['lg:' , {}],
    ])


    // init the output string..
    let outputHTML = ''
    let previewHTML = ''

    // external stylesheet index..
    const ssIndex = getStyleSheetIndex(ssUrl)
    // console.log({ssUrl})
    // console.log({ssIndex})

    // query the dom..
    const query = document.querySelectorAll('[class]')
    query.forEach(function(item) {

        // console.log(item.className)

        const regex = /(?<!\S)(sm:|md:|lg:)?(pt|pb|pl|pr|mt|mb|ml|mr|mnw|mxw)-(\d+)(\.\d+)?(rem|em|px)(?!\S)/g

        const matches = [...item.className.matchAll(regex)]
        
        if ( matches.length ) {
            
            // console.log( matches )

            matches.forEach(match => {

                // console.log(match)

                let _rule = {
                    selector: escapeSelector(match[0]),
                    miniMQ:   match[1] || '',
                    fullMQ:   lookupMQ(match[1]) || '',
                    miniDec:  match[2],
                    fullDec:  lookupProp(match[2]),
                    whole:    match[3],
                    fraction: match[4] || '',
                    unit:     match[5]
                }
                // console.log(_rule)
                
                let mq = output.get(_rule.miniMQ)

                mq['.'+_rule.selector] = `{ ${_rule.fullDec}: ${_rule.whole}${_rule.fraction}${_rule.unit}; }`

                output.set(_rule.miniMQ, mq)

            })
        }
    });

    // build the output..
    output.forEach((rules, mq) => {

        // console.log(mq, rules)

        // no media query..
        if ( !mq && Object.entries(rules).length ) {

            for (const sel in rules) {

                if ( !hasRule(sel) ) {
                    previewHTML += `${sel} ${rules[sel]}\n`
                }

                outputHTML += `${sel} ${rules[sel]}\n`
            }
        }
        // has media query..
        else if ( mq && Object.entries(rules).length ) {

            let mqPreview = ''
            let mqOutput = ''

            for (const sel in rules) {

                if ( !hasRule(sel, lookupMQ(mq)) ) {
                    mqPreview += `  ${sel} ${rules[sel]}\n`
                }

                mqOutput += `  ${sel} ${rules[sel]}\n`
            }

            if ( mqPreview ) {
                previewHTML += lookupMQ(mq) + ' {\n'
                previewHTML += mqOutput
                previewHTML += '}\n'
            }

            if ( mqOutput ) {
                outputHTML += lookupMQ(mq) + ' {\n'
                outputHTML += mqOutput
                outputHTML += '}\n'
            }

        }
    })

    // write the css to the main selector..
    console.log('CSS:')
    console.log(previewHTML)
    selector.innerHTML = outputHTML




    function getStyleSheetIndex(ss) {
        for ( let i=0; i < document.styleSheets.length; i++ ) {

            const el = document.styleSheets[i];

            if ( el.href && el.href === location.origin + ss ) {
                return i
            }
        }
        return null
    }

    function hasRule(selectorText, conditionText='') {
        if (ssIndex !== null) {
            const rules = document.styleSheets[ssIndex].rules
            for ( const rule of rules ) {
    
                if (
                    rule.constructor.name === 'CSSMediaRule'
                    && '@media ' + rule.conditionText === conditionText
                ) {
    
                    for ( const mqRule of rule.cssRules ) {
                        if (
                            mqRule.constructor.name === 'CSSStyleRule'
                            && mqRule.selectorText === selectorText
                        ) {
                            // console.log('MQ RULE', mqRule.selectorText)
                            // console.log(mqRule.cssText)
                            return true
                        }
                    }
                }
                else if (
                    rule.constructor.name === 'CSSStyleRule'
                    && rule.selectorText === selectorText
                ) {
                    // console.log('RULE', rule.selectorText)
                    // console.log(rule.cssText)
                    return true
                }
    
    
            }
        }
    }

    function escapeSelector(sel) {
        //escape : and .
        return sel.replace(/([:\.])/g, '\\$1')
    }

    function lookupProp(prop) {
        const props = {

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
        return props[prop]
    }

    function lookupMQ(mq) {
        const mqs = {

            'sm:' : '@media (min-width: 576px)',
            'md:' : '@media (min-width: 768px)',
            'lg:' : '@media (min-width: 992px)',

        }
        return mqs[mq]
    }

}
