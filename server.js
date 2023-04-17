var http = require('http');

http.createServer((req, res) => {
  console.log('Er was een request');
  res.writeHead(200, {'Content-Type': 'text/plain'});

  var exampleArray = ["item1", "item2"]
  var exampleObject = {
    item1: "item1val",
    item2: "item2val"
  }
  var json = JSON.stringify({
    array: exampleArray,
    object: exampleObject,
    another: "item"
  });

  res.end(json);
}).listen(3000);

console.log('De server luistert op poort 3000')
