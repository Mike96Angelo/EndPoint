var Generator = require('generate-js'),
    Joi = require('joi'),
    async = require('async');

function TRY_CATCH(func, options, callback) {
    try {
        if (func.length === 3) {
            func.call(null, options.request, options, callback);
        } else if (func.length === 2) {
            func.call(null, options.request, callback);
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
    headers:   Joi.object(),
    payload:   Joi.object(),
    query:     Joi.object(),
    params:    Joi.object(),

    response:  Joi.object(),

    validateHeaders: function validateHeaders(request, options, next) {
        var result = Joi.validate(request.headers, _.headers, _.validateOptions);

        request.headers = result.value;

        next(result.error || null);
    },

    validatePayload: function validatePayload(request, options, next) {
        var result = Joi.validate(request.payload, _.payload, _.validateOptions);

        request.payload = result.value;

        next(result.error || null);
    },

    validateQuery: function validateQuery(request, options, next) {
        var result = Joi.validate(request.query, _.query, _.validateOptions);

        request.query = result.value;

        next(result.error || null);
    },

    validateParams: function validateParams(request, options, next) {
        var result = Joi.validate(request.params, _.params, _.validateOptions);

        request.params = result.value;

        next(result.error || null);
    },

    validateResponse: function validateResponse(request, options, next) {
        var result = Joi.validate(request.response, _.response, _.validateOptions);

        request.response = result.value;

        next(result.error || null);
    },

    run: function run(request, done) {
        var _ = this,
            filters = [
                _.validateHeaders,
                _.validatePayload,
                _.validateQuery,
                _.validateParams
            ],
            cleaners = [],
            options = {};

        for (var i = 0; i < _.filters.length; i++) {
            filters.push(_.filters[i]);
        }

        filters.push(_.validateResponse);

        async.eachSeries(
            filters,
            function iterator(item, next) {
                var func = item;

                if (item && typeof item === 'object') {
                    func = item.run;

                    if (item.cleanup instanceof Function) {
                        cleaners.push(item.cleanup);
                    }
                }

                _.debug && console.log('FILTER: ' + func.name, options.request);

                TRY_CATCH(func, options, next);
            },
            function callback(err) {
                _.debug && console.log('OUT: ', options.request);
                _.debug && err && console.log('ERROR: ');
                _.debug && err && console.error(err.stack);
                if (err) {
                    async.eachSeries(
                        cleaners,
                        function iterator(item, next) {
                            var func = item;

                            _.debug && console.log('CLEANER: ' + func.name, options.request);

                            TRY_CATCH(func, options, next);
                        },
                        function callback(cleaning_err) {
                            _.debug && console.log('CLEANED: ', options.request);
                            _.debug && cleaning_err && console.log('CLEANING-ERROR: ');
                            _.debug && cleaning_err && console.error(cleaning_err.stack);
                            done(err, null);
                        }
                    );
                } else {
                    done(null, options.request);
                }
            }
        );
    }
});

module.exports = EndPoint;
