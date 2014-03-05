var operation = require('plumber').operation;
var Resource = require('plumber').Resource;

var pkg = require('lodash-cli/package.json');
var bin = pkg.bin.lodash;
var builder = require.resolve('lodash-cli/' + bin);

var highland = require('highland');
var spawn = require('child_process').spawn;


function lodash(options) {
    return highland(function(push, next) {
        // --stdout (instead of --output)
        // --debug (not minified)
        // --source-map
        var includes = 'include=' + (options.include || []).join(',');
        var args = [includes, '--stdout', '--debug', 'exports=amd', 'strict'];

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
            push(null, new Resource({
                type:     'javascript',
                filename: 'lodash.js',
                data:     output
            }));
            push(null, highland.nil);
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
