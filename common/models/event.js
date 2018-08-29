'use strict';

const shortid = require('shortid');
const hashids = require('hashids');
const bcrypt = require('bcrypt');
const randtoken = require('rand-token');
const moment = require('moment');
const ErrorConst = require('../../server/middleware/error-const');
const editJsonFile = require("edit-json-file");
const config = require('../../server/config.json');
const superagentPromise = require('superagent-promise');
const _superagent = require('superagent');
const agent = superagentPromise(_superagent, Promise);

function ensureValidDays(days) {
  let startDate, endDate, dayTime, dayTimes = [];

  if(!days || days.length === 0) {
    throw ErrorConst.Error(ErrorConst.DAYS_REQUIRED);
  }

  days.forEach(day => {
    if(!day.period || !day.period.start || isNaN(day.period.start.getTime())) {
      throw ErrorConst.Error(ErrorConst.PERIOD_REQUIRED);
    }

    startDate = moment(day.period.start);
    dayTime = moment(startDate).startOf('day').toDate().getTime();

    if(!dayTimes.includes(dayTime)) {
      dayTimes.push(dayTime);
    } else {
      throw ErrorConst.Error(ErrorConst.DAYS_NOT_UNIQUE);
    }

    if(!day.period.duration || day.period.duration <= 0) {
      day.period.duration = Math.floor(moment(startDate).endOf('day').diff(startDate) / 60000) + 1;
    } else if(day.period.duration > 1440) {
      day.period.duration = 1440;
    }
    endDate = moment(startDate).add(day.period.duration, 'm');
    if(day.period.duration === 1440 && endDate.hours() === 0 && endDate.minutes() === 0) {
      endDate = moment(startDate).endOf('day');
    }

    if(day.blockedPeriods) {
      day.blockedPeriods.forEach(period => {
        if(!period.start || isNaN(period.start.getTime())) {
          throw ErrorConst.Error(ErrorConst.PERIOD_REQUIRED);
        }

        let bpStart = moment(startDate).hours(period.start.getHours()).minutes(period.start.getMinutes());
        let minutesToEnd = Math.floor(endDate.diff(bpStart) / 60000) % 1440;

        if(!period.duration || period.duration <= 0 || period.duration > minutesToEnd) {
          period.duration = minutesToEnd;
        }
      });
    }
  });
}

async function generateUniqueId(ctx) {
  let uniqueId, unique = false, count = 0;

  while(!unique) {
    if(count === 5) {
      config.eventIdLength = config.eventIdLength + 1;
      let file = editJsonFile(`${__dirname}/../../server/config.json`, {});
      file.set("eventIdLength", config.eventIdLength);
      file.save();
      count = 0;
    }
    uniqueId = new hashids(shortid.generate(), config.eventIdLength).encode(1);
    await ctx.Model.findById(uniqueId).then(event => unique = !event);
    count++;
  }

  return uniqueId;
}

async function handleCreate(ctx) {
  ensureValidDays(ctx.instance.days);

  let userId = null;
  if(ctx.options.accessToken) {
    userId = ctx.options.accessToken.userId;
  }

  await generateUniqueId(ctx)
    .then(id => {
      ctx.instance.id = id;
      ctx.instance.ownerId = userId;
      ctx.instance.claimToken = userId ? null : randtoken.generate(64);
      if(ctx.instance.password) {
        ctx.instance.password = bcrypt.hashSync(ctx.instance.password, bcrypt.genSaltSync());
      }
    });
}

function handleUpdate(ctx) {
  return ctx.Model.findById(ctx.instance.id)
    .then(event => {
      ensureValidDays(ctx.instance.days);

      ctx.instance.id = event.id;
      ctx.instance.ownerId = event.ownerId;
      ctx.instance.claimToken = event.claimToken;
      if(ctx.instance.password) {
        ctx.instance.password = bcrypt.hashSync(ctx.instance.password, bcrypt.genSaltSync());
      }
    });
}

function handlePatch(ctx) {
  return ctx.Model.findById(ctx.currentInstance.id)
    .then(event => {
      ensureValidDays(ctx.data.days);

      ctx.data.id = event.id;
      ctx.data.ownerId = event.ownerId;
      ctx.data.claimToken = event.claimToken;
      if(ctx.data.password) {
        ctx.data.password = bcrypt.hashSync(ctx.data.password, bcrypt.genSaltSync());
      }
    });
}

module.exports = function(model) {
  model.validatesPresenceOf("days");

  model.beforeRemote('create', async function (ctx) {
    let captchaData = `secret=${config.invisibleCaptchaSecret}&response=${ctx.req.body.captchaToken}`;
    await agent.post('https://www.google.com/recaptcha/api/siteverify', captchaData)
      .then(res => {
        if(!res.body.success) {
          throw ErrorConst.Error(ErrorConst.INVALID_CAPTCHA);
        }
      });
    delete ctx.req.body.captchaToken;
  });

  // Apply checks and modifications before save
  model.observe('before save', async function(ctx) {
    if(ctx.isNewInstance) {
      await handleCreate(ctx);
    } else if(ctx.instance) {
      await handleUpdate(ctx);
    } else if(ctx.currentInstance) {
      await handlePatch(ctx);
    }
  });

  // Send the claimToken when an event is created
  model.observe('after save', async function(ctx) {
    if(ctx.isNewInstance && ctx.instance.claimToken) {
      ctx.instance._claimToken = ctx.instance.claimToken;
    }
  });

  // Logic for claiming an event
  model.remoteMethod('claim', {
      description: 'Allows an user to claims an event using the claimToken',
      accepts: [
        {arg: 'id', type: 'String', required: true, description: 'Model id'},
        {arg: 'userId', type: 'any', http: ctx => ctx.req.accessToken ? ctx.req.accessToken.userId : null},
        {arg: 'claimToken', type: 'String', required: true, http: {source: 'form'}, description: 'Claim token'},
      ],
      http: {verb: 'POST', path: '/:id/claim'}
    }
  );
  model.claim = function(eventId, userId, claimToken, cb) {
    if(!userId) {
      let error = new Error("You need to log in to claim an event");
      error.statusCode = 400;
      return cb(error);
    }
    model.findById(eventId)
      .then(event => {
        if(!event) {
          let error = new Error("Event not found");
          error.statusCode = 400;
          return cb(error);
        }

        if(!event.claimToken || event.ownerId) {
          let error = new Error("The event already has an owner");
          error.statusCode = 400;
          return cb(error);
        }

        if(event.claimToken !== claimToken) {
          let error = new Error("Invalid claim token");
          error.statusCode = 400;
          return cb(error);
        }

        model.update({id: event.id}, {ownerId: userId, claimToken: null});

        return cb();
      });
  };
};
