var operation = require('plumber').operation;
var Resource = require('plumber').Resource;
var Rx = require('plumber').Rx;

var pkg = require('lodash-cli/package.json');
var bin = pkg.bin.lodash;
var builder = require.resolve('lodash-cli/' + bin);

var spawn = require('child_process').spawn;


function lodash(options) {
    return Rx.Observable.create(function(observer) {
        // --stdout (instead of --output)
        // --debug (not minified)
        // --source-map
        var args = ['--stdout', '--debug', 'exports=amd', 'strict'];
        if (options.include) {
            args.push('include=' + options.include.join(','));
        }

        var build = spawn(builder, args);
        var output = '';
        build.stdout.on('data', function(data) {
            output += String(data);
        });
        build.stderr.on('data', function(data) {
            // FIXME: push error?
            console.log("stderr", data);
        });
        // FIXME: close?? not end?
        build.on('close', function(code) {
            // FIXME: inspect code to see if success or not
            observer.onNext(new Resource({
                type:     'javascript',
                filename: 'lodash.js',
                data:     output
            }));
            observer.onCompleted();
        });
    });
}

module.exports = function(options) {
    options = options || [];

    return operation.concat(function() {
        // FIXME: use default options
        var defaultOptions = {
            modifier: 'strict',
            exports: 'amd'
        };

        return lodash(options);
    });
};
