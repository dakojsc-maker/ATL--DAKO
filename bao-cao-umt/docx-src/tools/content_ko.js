const parts = ['content_ko1.js', 'content_ko2.js', 'content_ko3.js'];
module.exports = parts.flatMap(p => require('./' + p));
