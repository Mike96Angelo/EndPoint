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
        var _ = this;

        function validateIncoming(next) {
            _.debug && console.log("validateIncoming", data);
            Joi.validate(data, _.incomingSchema, _.validateOptions, next);
        }

        function validateAuth(data, next) {
            _.debug && console.log("validateAuth", data);
            _.auth(data, next);
        }

        function runIncoming(data, next) {
            _.debug && console.log("runIncoming", data);
            _.incoming(data, next);
        }

        function validateOutgoing(data, next) {
            _.debug && console.log("validateOutgoing", data);
            Joi.validate(data, _.outgoingSchema, _.validateOptions, next);
        }

        function runOutgoing(data, next) {
            _.debug && console.log("runOutgoing", data);
            _.outgoing(data, next);
        }

        async.waterfall([
            validateIncoming,
            validateAuth,
            runIncoming,
            validateOutgoing,
            runOutgoing
        ], done);
    },

    auth: function auth(data, done) {
        var _ = this;

        done(null, data);
    },

    incoming: function incoming(data, done) {
        var _ = this;

        done(null, data);
    },

    outgoing: function outgoing(data, done) {
        var _ = this;

        done(null, data);
    }
});

module.exports = EndPoint;
