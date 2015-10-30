var Generator = require('generate-js'),
    Joi = require('joi'),
    async = require('async');

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
            arr = [];

        function validateIncoming(next) {
            _.debug && console.log('validateIncoming', data);
            Joi.validate(data, _.incomingSchema, _.validateOptions, next);
        }

        function validateOutgoing(data, next) {
            _.debug && console.log('validateOutgoing', data);
            Joi.validate(data, _.outgoingSchema, _.validateOptions, next);
        }

        arr.push(validateIncoming);

        for (var i = 0; i < _.filters.length; i++) {
            arr.push(_.filters[i]);
        }

        arr.push(validateOutgoing);

        async.waterfall(arr, done);
    }
});

module.exports = EndPoint;
