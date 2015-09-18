var Generator = require('generate-js'),
    Joi = require('joi'),
    async = require('async');

var EndPoint = Generator.generate(function EndPoint(options) {
    var _ = this;

    _.defineProperties(options);
});

EndPoint.Joi = Joi;

EndPoint.definePrototype({
    incomingScema: Joi.object(),
    outgoingScema: Joi.object(),
    run: function run(data, done) {
        var _ = this;

        function validateIncoming(next) {
            Joi.validate(data, _.incomingScema, _.validateOptions, next);
        }

        function runIncoming(data, next) {
            _.incoming(data, next);
        }

        function validateOutgoing(data, next) {
            Joi.validate(data, _.outgoingScema, _.validateOptions, next);
        }

        function runOutgoing(data, next) {
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
