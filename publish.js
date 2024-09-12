/* global result */
/* global MINIFY */
/* global FILES */
/* global DONOTABBRIVIATE */
/* global ABBRIVIATE */

FILES = FILES.split('\n')                            // Split into lines
 .map(l=>l.trim())                                   // Trim the lines
 .filter(l=>l.length>0);                             // Remove empty lines

DONOTABBRIVIATE = DONOTABBRIVIATE.split('\n')        // Split into lines
 .map(l=>l.trim())                                   // Trim the lines
 .filter(l=>l.length>0);                             // Remove empty lines

let warnings = [];
ABBRIVIATE = ABBRIVIATE.split('\n')                  // Split into lines
 .map(l=>l.trim())                                   // Trim the lines
 .filter(l=>l.length>0)                              // Remove empty lines
 .filter(l=>{ if(DONOTABBRIVIATE.includes(l)){warnings.push(l); return false} else {return true} })            // Remove the DONOTABBRIVIATE entries
 .map((t,i)=>{ return { abbr:getId(i), text:t, count:0 }; } ); // Determine the replacement id for the text based on the index (no specific order)

if (warnings.length>0) {
  console.log('DONOTABBRIVIATE found in ABBRIVIATE\n=========\n\n' + warnings.join('\n'));
}

function getId(i) {
  let a = i%26;
  let b = Math.floor(i/26);
  return String.fromCharCode(a+65) + String.fromCharCode(b+97);
}

function extractVariablesAndFunctions(jsFileString) {
    // Regex to match 'var x =' , 'function x()', 'let x =', 'const x ='
    let declarationPattern = /(var\s+|function\s+|let\s+|const\s+|this[.])([a-z$_][a-z0-9$_]*)/gi;

    // Regex to match 'x = function()', 'x =>', and 'x: function()'
    let expressionPattern = /([a-z$_][a-z0-9$_]*)\s*(=|=>|:)\s*function/gi;

    // Regex to match 'x ()' class functions, excluding 'if(', 'for(', 'while(', etc.
    let classFuncPattern = /(?<=^|\s|{|;)(?!if|for|while|switch|catch)\b([a-z$_][a-z0-9$_]*)\s*\((.*?)\)\s*\{/gi;

    let match, variables = new Set(), functions = new Set();

    // Get Matches for Variable and Function Declarations
    while (match = declarationPattern.exec(jsFileString)) {
        if (match[1] !== 'function') {
            variables.add(match[2]);
        } else {
            functions.add(match[2]);
        }
    }

    // Get Matches for Function Expressions and Arrow Functions
    while (match = expressionPattern.exec(jsFileString)) {
        functions.add(match[1]);
    }

    // Get Matches for Class Methods
    while (match = classFuncPattern.exec(jsFileString)) {
        functions.add(match[1]);
    }

    return { variables: Array.from(variables), functions: Array.from(functions) };
}


function convertFiles() {

  if (FILES.length === 0) {
    let varsAndFuncs = extractVariablesAndFunctions(result);
    console.log('Missing function abbriviations\n=========\n\n' + varsAndFuncs.functions.filter(l=> l.length>2 && !DONOTABBRIVIATE.some(o=>l===o)).join('\n'));
    console.log('Missing variable abbriviations\n=========\n\n' + varsAndFuncs.variables.filter(l=> l.length>2 && !DONOTABBRIVIATE.some(o=>l===o)).join('\n'));
    console.log('Unused abbriviations\n=========\n\n' + ABBRIVIATE.filter(l=> l.count===0 && !DONOTABBRIVIATE.some(o=>l.text===o)).map(l=>l.text).join('\n'));
    
    
    // Just setting innerHTML assumes HTML so does not handle < > correctly
    document.getElementById('result').appendChild(document.createTextNode(result));
    return;
  }

  let fileUrl = FILES.shift();
  fetch(fileUrl)
    .then(function(response) {
          // The call was successful!
          return response.text();
       })
     .then(function (source) {
          source = source.replace(/(\/\*\s*global(.|\r|\n)*?\*\/)/gm, '')      // Remove /* global ... */ comments
                         .trim() + '\r\n'; 

          if (fileUrl.endsWith('.js')) {
            source = source.replace(/\"use strict\";/gm, '')                     // Remove "use strict" lines
          }

          if (MINIFY) { 
            source = source.replace(/[ \t]*([+=*/%(){}:,.])[ \t]*/gm, '$1')    // Remove extra spaces
                           .replace(/(?<!((data:image|https:).*))(\/\/.*)$/gm, '') // Remove all comments except in base64 image lines
                           .replace(/^[ \t]*(.*)[ \t]*$/gm, '$1')              // Trim all lines   
                           .replace(/^[ ]*\r?\n/gm, '');                       // Remove empty lines
            
            if (fileUrl.endsWith('.js')) {
              for (let a=0; a<ABBRIVIATE.length;a++) {
                let item = ABBRIVIATE[a];
                let len = source.length;
                source = source.replace(new RegExp(`\\b(${item.text})\\b`,'gm'), item.abbr);  
                if (source.length<len) {
                  ABBRIVIATE[a].count++;
                }
              }
            }
          }
    
          result += `\r\n` +
                    `// =====================================================\r\n` +
                    `// ${fileUrl}\r\n`                                            +
                    `// =====================================================\r\n` +
                    `\r\n` + source; 
                    

         // Convert the rest of the files
         convertFiles();

      })
    .catch(function (err) {
      // There was an error
      console.warn('Something went wrong reading ' + fileUrl, err);
    });
}  


