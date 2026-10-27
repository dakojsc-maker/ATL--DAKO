const parts = ['content1.js', 'content2.js', 'content3.js'];
module.exports = parts.flatMap(p => require('./' + p));
