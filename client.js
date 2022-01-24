var net = require('net');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});


var HOST = '127.0.0.1';
var PORT = 5678;

var client = new net.Socket();

client.connect(PORT, HOST, function(){
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    readline.question('\n', input => {
        client.write(input);
    })
});

client.on('data', function(data){
    readline.question(data + '\n', input => {
        client.write(input);
    })
});

client.on('close', function(){
    console.log('Server terminated')
    readline.close()
});

client.on('error', function (err) {
    console.error(err);
  });