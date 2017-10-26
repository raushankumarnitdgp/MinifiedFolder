var fs = require('fs');
var UglifyJS = require("uglify-js");
var babel = require("babel-core");
var es2015 = require('babel-preset-es2015');

var walkPath = '/home/raushankumar/Minify/xt-edge/develop';

var walk = function (dir, done) {
    fs.readdir(dir, function (error, list) {
        if (error) {
            return done(error);
        }

        var i = 0;

        (function next() {
            var file = list[i++];

            if (!file) {
                return done(null);
            }

            file = dir + '/' + file;

            fs.stat(file, function (error, stat) {

                if (stat && stat.isDirectory()) {
                    walk(file, function (error) {
                        next();
                    });
                } else {
                    // do stuff to file here
                    // console.log(file);
                    var data = fs.readFileSync(file, 'utf8');
                    // var options = {
                    //     mangle: false,
                    //     mangleProperties: {
                    //         screw_ie8: false,
                    //         ignore_quoted: true
                    //     },
                    //     compress: {
                    //         screw_ie8: false,
                    //         properties: false
                    //     },
                    //     output: {
                    //         screw_ie8: false
                    //     }
                    // };
                    if (file.endsWith('.js')) {
                        // console.log(file);
                        var result1 = UglifyJS.minify(data /*,options*/ );
                        if (!result1.error) {
                            console.log('minified1: ', file);
                            fs.writeFileSync(file, result1.code);
                        } else {
                            var transpiledCode = babel.transformFile(file, {
                                presets: [es2015]
                            } /*,options*/ , function (err, result) {
                                if (!err) {
                                    //console.log(result.code);
                                    console.log('transpiledCode: ', file);
                                    var result2 = UglifyJS.minify(result.code /*,options*/ );
                                    if (!result2.error) {
                                        console.log('minified2: ', file);
                                        fs.writeFileSync(file, result2.code);
                                    } else {
                                        console.log('ERROR:', result2.error);
                                    }
                                }
                            });
                            // babel.transformFile(file, function (err, transpiledCode) {
                            //     if(!err) {
                            //         var result2 = UglifyJS.minify(transpiledCode.code /*,options*/ );
                            //         if(!result2.error) {
                            //             console.log('minified2: ', file);
                            //             fs.writeFileSync(file, result2.code);
                            //         }
                            //     } 
                            //   });
                        }
                    }
                    next();
                }
            });
        })();
    });
};

// optional command line params
//      source for walk path
process.argv.forEach(function (val, index, array) {
    if (val.indexOf('source') !== -1) {
        walkPath = val.split('=')[1];
    }
});

console.log('-------------------------------------------------------------');
console.log('processing...');
console.log('-------------------------------------------------------------');

walk(walkPath, function (error) {
    if (error) {
        throw error;
    } else {
        console.log('-------------------------------------------------------------');
        console.log('finished.');
        console.log('-------------------------------------------------------------');
    }
});