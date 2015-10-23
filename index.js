var Generator = require('generate-js'),
    Joi = require('joi'),
    async = require('async');

var EndPoint = Generator.generate(function EndPoint(options) {
    var _ = this;

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

        function runIncoming(data, next) {
            _.debug && console.log("runIncoming", data);
            _.incoming(data, next);
        }

        function validateOutgoing(data, next) {
            console.log("validateOutgoing", data);
            Joi.validate(data, _.outgoingSchema, _.validateOptions, next);
        }

        function runOutgoing(data, next) {
            _.debug && console.log("runOutgoing", data);
            _.outgoing(data, next);
        }

        async.waterfall([
            validateIncoming,
            runIncoming,
            validateOutgoing,
            runOutgoing
        ], done);
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
