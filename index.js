var Generator = require('generate-js'),
    Joi = require('joi'),
    async = require('async');

function TRY_CATCH(func, options, callback) {
    try {
        if (func.length === 3) {
            func.call(null, options.data, options, callback);
        } else if (func.length === 2) {
            func.call(null, options.data, callback);
        } else if (func.length === 1) {
            func.call(null, callback);
        } else {
            func.call(null);
            async.setImmediate(function () {
                callback();
            });
        }
    } catch (err) {
        console.error(err.stack);
        callback(err);
    }
}

var EndPoint = Generator.generate(function EndPoint(options) {
    var _ = this;

    options.validateOptions = options.validateOptions || {
        abortEarly: false,
        stripUnknown: true
    };

    _.defineProperties(options);
    _.debug = false;
});

EndPoint.Joi = Joi;

EndPoint.definePrototype({
    incomingSchema: Joi.object(),
    outgoingSchema: Joi.object(),

    run: function run(data, done) {
        var _ = this,
            arr = [],
            errs = [],
            options = {
                data: data
            };

        function validateIncoming(data, options, next) {
            var result = Joi.validate(data, _.incomingSchema, _.validateOptions);

            options.data = result.value;

            next(result.error || null);
        }

        function validateOutgoing(data, options, next) {
            var result = Joi.validate(data, _.outgoingSchema, _.validateOptions);

            options.data = result.value;

            next(result.error || null);
        }

        arr.push(validateIncoming);

        for (var i = 0; i < _.filters.length; i++) {
            arr.push(_.filters[i]);
        }

        arr.push(validateOutgoing);

        _.debug && console.log('IN: ', options.data);

        async.eachSeries(
            arr,
            function iterator(item, next) {
                var func = item;

                if (item && typeof item === 'object') {
                    func = item.run;

                    if (item.cleanup instanceof Function) {
                        errs.push(item.cleanup);
                    }
                }

                _.debug && console.log('FILTER: ' + func.name, options.data);

                TRY_CATCH(func, options, next);
            },
            function callback(err) {
                _.debug && console.log('OUT: ', options.data);
                _.debug && err && console.log('ERROR: ');
                _.debug && err && console.error(err.stack);
                if (err) {
                    async.eachSeries(
                        errs,
                        function iterator(item, next) {
                            var func = item;

                            _.debug && console.log('CLEANER: ' + func.name, options.data);

                            TRY_CATCH(func, options, next);
                        },
                        function callback(cleaning_err) {
                            _.debug && console.log('CLEANED: ', options.data);
                            _.debug && cleaning_err && console.log('CLEANING-ERROR: ');
                            _.debug && cleaning_err && console.error(cleaning_err.stack);
                            done(err, null);
                        }
                    );
                } else {
                    done(null, options.data);
                }
            }
        );
    }
});

module.exports = EndPoint;
