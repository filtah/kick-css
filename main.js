/**
 * in-browser 
 * @param {*} s 
 * @param {*} ssUrl 
 */
function kickCSS(s, ssUrl='') {

    main(s, ssUrl)

    function main(s, ssUrl) {

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

            const regex = /(?<!\S)(sm:|md:|lg:)?(p|pt|pb|pl|pr|px|py|m|mt|mb|ml|mr|mx|my|mnw|mxw|mnh|mxh)-(\d+)(\.\d+)?(rem|em|px|vw|vh|%)(?!\S)/g

            const matches = [...item.className.matchAll(regex)]
            
            if ( matches.length ) {

                matches.forEach(match => {

                    // console.log(match)
                    const rule = composeRule(match)

                    let mq = output.get(rule.mq)
                    mq[rule.selector] = rule.block
                    output.set(rule.mq, mq)

                })
            }
        });

        // build the output..
        output.forEach((rules, mq) => {

            // console.log(mq, rules)

            // no media query..
            if ( !mq && Object.entries(rules).length ) {

                for (const sel in rules) {

                    if ( !hasRule(ssIndex, sel) ) {
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

                    if ( !hasRule(ssIndex, sel, lookupMQ(mq)) ) {
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

        
        // copy to clipboard the filtered missing styles only..
        console.log('CSS:')
        console.log(previewHTML)
        copyToClipboard(previewHTML || '\n')

        // write the css to the main selector..
        selector.innerHTML = outputHTML

    }

    function composeRule(match) {

        let selector = '.' + escapeSelector(match[0]),
            mq       = match[1] || '',
            prop     = match[2],
            whole    = match[3],
            fraction = match[4] || '',
            unit     = match[5];

        const value = whole + fraction + unit

        const rules = {

            // padding
            p:  `padding: ${value};`,
            pt: `padding-top: ${value};`,
            pr: `padding-right: ${value};`,
            pb: `padding-bottom: ${value};`,
            pl: `padding-left: ${value};`,
            px: `padding-left: ${value}; padding-right: ${value};`,
            py: `padding-top: ${value}; padding-bottom: ${value};`,

            // margin
            m:  `margin: ${value};`,
            mt: `margin-top: ${value};`,
            mr: `margin-right: ${value};`,
            mb: `margin-bottom: ${value};`,
            ml: `margin-left: ${value};`,
            mx: `margin-left: ${value}; margin-right: ${value};`,
            my: `margin-top: ${value}; margin-bottom: ${value};`,

            // width
            mnw: `min-width: ${value}`,
            mxw: `max-width: ${value};`,

            //height
            mnh: `min-height: ${value}`,
            mxh: `max-height: ${value};`,

        };

        const block = `{ ${rules[prop]} }`

        return { mq, selector, block }

    }

    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.value = text;
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    function getStyleSheetIndex(ss) {
        for ( let i=0; i < document.styleSheets.length; i++ ) {

            const el = document.styleSheets[i];

            if ( el.href && el.href === location.origin + ss ) {
                return i
            }
        }
        return null
    }

    function hasRule(ssIndex, selectorText, conditionText='') {
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
        return sel.replace(/([:\.%])/g, '\\$1')
    }

    function lookupProp(prop) {
        const props = {

            // padding
            pt: 'padding-top',
            pb: 'padding-bottom',
            pl: 'padding-left',
            pr: 'padding-right',

            p: 'padding',

            // margin
            mt: 'margin-top',
            mb: 'margin-bottom',
            ml: 'margin-left',
            mr: 'margin-right',

            m: 'margin',

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
