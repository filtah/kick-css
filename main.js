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

        // query the dom (all elements with any given class)..
        const query = document.querySelectorAll('[class]')
        query.forEach(function(item) {

            // console.log(item.className)

            // should be passed to constructor as options..
            const mqString      = 'sm:|md:|lg:'
            const modHover      = '(?<hover>hover:)?' // not used (yet)..
            const propString    = 'p|pt|pb|pl|pr|px|py|m|mt|mb|ml|mr|mx|my|mnw|mxw|mnh|mxh|t|b|l|r'
            const unitString    = 'rem|em|px|vw|vh|%'
            const keywordString = 'auto|none|0'
            const selfString    = 'container|row'
            const modImportant  = '(?<im>!)?'


            const regex____ = new RegExp(`(?<!\\S)(?<mq>${mqString})?(?<prop>(?:${propString})-(?<val>(?<num>(?<int>-?\\d+)(?<dec>\\.\\d+)?)(?<unit>${unitString})|(?<keyword>${keywordString}))|(?<self>${selfString}))${modImportant}(?!\\S)`,'g')

            const regex___ = new RegExp(`(?<!\\S)(?<mq>${mqString})?(?<prop>${propString})-(?<val>(?<whole>-?\\d+)(?<frac>\\.\\d+)?(?<unit>${unitString})|${keywordString})(?!\\S)`,'g')
            const regex__ = new RegExp(`(?<!\\S)(?<mq>${mqString})?${modHover}(?<prop>${propString})-(?<val>(?<whole>-?\\d+)(?<frac>\\.\\d+)?(?<unit>${unitString})|${keywordString})(?!\\S)`,'g')
            const regex_ = /(?<!\S)(?<mq>sm:|md:|lg:)?(?<hover>hover:)?(?<prop>p|pt|pb|pl|pr|px|py|m|mt|mb|ml|mr|mx|my|mnw|mxw|mnh|mxh|t|b|l|r)-(?<val>(?<whole>-?\d+)(?<frac>\.\d+)?(?<unit>rem|em|px|vw|vh|%)|auto|none|0)(?!\S)/g
            const regex = /(?<!\S)(sm:|md:|lg:)?(p|pt|pb|pl|pr|px|py|m|mt|mb|ml|mr|mx|my|mnw|mxw|mnh|mxh)-((-?\d+)(\.\d+)?(rem|em|px|vw|vh|%)|auto|none|0)(?!\S)/g

            const matches = [...item.className.matchAll(regex)]
            
            if ( matches.length ) {

                matches.forEach(match => {

                    // can now look at the groups property..
                    // match.groups { mq, prop, val, num, int, dec, unit, keyword, self, im }

                    // we need to pair the match with the corresponding ruleDef.
                    // then we compose the rule based on the given parameters.

                    // console.log(match)
                    const rule = composeRule(match)
                    if ( rule ) {

                        // find the mq group
                        let mq = output.get(rule.mq)

                        // this is important, we match the rule with the selector key.
                        // like this, we prevent duplicate rules being added..
                        mq[rule.selector] = rule.block

                        // write it back..
                        output.set(rule.mq, mq)

                    }


                })
            }
        });


        // build the output..
        output.forEach((rules, mq) => {

            // console.log(mq, rules)

            // we need to re-order the selectors based on the order property.
            // first, this needs to be converted into an array, then can use the array method 'sort'
            let sorted = Object.entries(rules).sort((a, b) => a[1].order - b[1].order)

            // no media query..
            if ( !mq && sorted.length ) {
            // if ( !mq && Object.entries(rules).length ) {

                sorted.forEach((sel, index) => {
                    if ( !hasRule(ssIndex, sel[0]) ) {
                        // TODO: ensure rule obj. has output property (css code)
                        previewHTML += `${sel[0]} ${sel[1].output}\n`
                    }
                    outputHTML += `${sel} ${rules[sel]}\n`
                })

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

                    // note indentation..

                    if ( !hasRule(ssIndex, sel, lookupMQ(mq)) ) {
                        mqPreview += `  ${sel} ${rules[sel]}\n`
                    }

                    mqOutput += `  ${sel} ${rules[sel]}\n`
                }

                // wrap the rules in respective media query block..

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
            value    = match[3],
            whole    = match[4] || '',
            fraction = match[5] || '',
            unit     = match[6] || '';

        const rules = {

            // padding
            p:  { rule: `padding: ${value};`, forbid: ['auto', 'none'] },
            pt: { rule: `padding-top: ${value};`, forbid: ['auto', 'none'] },
            pr: { rule: `padding-right: ${value};`, forbid: ['auto', 'none'] },
            pb: { rule: `padding-bottom: ${value};`, forbid: ['auto', 'none'] },
            pl: { rule: `padding-left: ${value};`, forbid: ['auto', 'none'] },
            px: { rule: `padding-left: ${value}; padding-right: ${value};`, forbid: ['auto', 'none'] },
            py: { rule: `padding-top: ${value}; padding-bottom: ${value};`, forbid: ['auto', 'none'] },

            // margin
            m:  { rule: `margin: ${value};`, forbid: ['none'] },
            mt: { rule: `margin-top: ${value};`, forbid: ['none'] },
            mr: { rule: `margin-right: ${value};`, forbid: ['none'] },
            mb: { rule: `margin-bottom: ${value};`, forbid: ['none'] },
            ml: { rule: `margin-left: ${value};`, forbid: ['none'] },
            mx: { rule: `margin-left: ${value}; margin-right: ${value};`, forbid: ['none'] },
            my: { rule: `margin-top: ${value}; margin-bottom: ${value};`, forbid: ['none'] },

            // width
            mnw: { rule: `min-width: ${value}`, forbid: ['none'] },
            mxw: { rule: `max-width: ${value}`, forbid: ['auto'] },

            //height
            mnh: { rule: `min-height: ${value}`, forbid: ['none'] },
            mxh: { rule: `max-height: ${value}`, forbid: ['auto'] },

        };

        if ( rules[prop].forbid.includes(value) ) {
            return false
        }

        const block = `{ ${rules[prop].rule} }`

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


/*
{

	prop		<string>				// eg: container, 'pt', 'p', 'mx', 'mw'
										// start with single word (a-z only) consider allowed naming conventions / safe characters
										// careful with '-'. must test for issues
										// required

	order		<int>					// number specifying the order sequence of this rule, in relation to others.
										// default: 0

	mqExcludes	<array of strings>		// eg: ['md', 'lg']
				<string>				// also 'all', which is all given mqs.
										// default: 'all'

	keywords	<array of strings>		// eg: ['auto', 'none', '0', '400', '700']
										// default: []

	numeric		<bool>					// allows the use of numbers
										// default: true

	decimals	<bool>					// allow fractional numbers
										// property ignored if numeric:false
										// default: true

	signed		<bool>					// allow negative numbers
										// property ignored if numeric:false
										// default: true

	units		<array of strings>		// eg: ['px', 'rem']
										// default: []
										// required if numeric:true

	important	<bool>					// default: false

}
*/
