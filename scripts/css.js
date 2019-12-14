const postcss = require('postcss');
const fs = require('fs');
const path = require('path');

const input = path.join(__dirname, '../content.css');
const output = path.join(__dirname, '../content-ext.css');

fs.watchFile(input, () => {
  console.log('changed');
  const css = fs.readFileSync(input, 'utf-8');
  postcss([replaceUrl]).process(css, { from: undefined }).then((result) => {
    fs.writeFileSync(output, result.css, 'utf-8');
  });
});
  

function replaceUrl(root) {
  root.walkDecls('background-image', decl => {
    decl.value = decl.value.replace(/url\('(.*)'\)/, "url('chrome-extension://__MSG_@@extension_id__$1')");
  });
}