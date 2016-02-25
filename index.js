var ping = require('ping');
var traceroute = require('traceroute');
var fs = require('fs')
var async = require('async')
var sleep = require('sleep');
var winston = require('winston');

// set logger
winston.add(winston.transports.File, { filename: 'history.log' });
var endpoint = process.argv[2] ? process.argv[2] : 'google.com'
var timer = process.argv[3] ? parseInt(process.argv[3]) : 5

console.log('ping-watch started')
console.log('endpoint: ' + endpoint)
console.log('ping every ' + timer + ' seconds')
traceroute.trace(endpoint, function (err, hops) {
    if (!err) {
        var hosts = [];
        hops.forEach(function (hop) {
            for (var k in hop) hosts.push(k);
        })
        console.log("total " + hosts.length + " hosts: " + hosts);
        pingHosts(hosts)
    }
});

function pingHosts(hosts) {

    async.eachSeries(hosts, function (host, eachCallback) {
        ping.sys.probe(host, function (isAlive) {
            var msg = isAlive ? 'host ' + host + ' is alive' : 'host ' + host + ' is dead';
            console.log(new Date() + ': ' + msg);
            
            winston.info(msg);
            eachCallback(null, msg)
        });
    }, function (err) {
        if (err) {
            process.exit(1);
        } else {
            sleep.sleep(timer)
            // response.send(data)
            pingHosts(hosts)
        }
    });
    // setTimeout(pingHosts2(hosts), 5000);
}
