'use strict';

let shortid = require('shortid');
let hashids = require('hashids');
let bcrypt = require('bcrypt');
let randtoken = require('rand-token');
let moment = require('moment');

function ensureValidDays(days) {
  let startDate, endDate, startBlockedDate, minutesToEnd;

  days.forEach(day => {
    if(!day.period || !day.period.start || isNaN(day.period.start.getTime())) return;

    startDate = moment(day.period.start);
    if(!day.period.duration || day.period.duration <= 0) {
      day.period.duration = Math.floor(moment(day.period.start).endOf('day').diff(startDate) / 60000);
    } else if(day.period.duration > 1439) {
      day.period.duration = 1439;
    }
    endDate = moment(day.period.start).add(day.period.duration, 'm');

    if(day.blockedPeriods) {
      day.blockedPeriods.forEach(blockedPeriod => {
        if(!blockedPeriod.start || isNaN(blockedPeriod.start.getTime())) return;

        startBlockedDate = moment(day.period.start)
          .hours(blockedPeriod.start.getHours())
          .minutes(blockedPeriod.start.getMinutes());
        minutesToEnd = Math.floor(endDate.diff(startBlockedDate) / 60000) % 1440;
        if(!blockedPeriod.duration || blockedPeriod.duration <= 0) {
          blockedPeriod.duration = minutesToEnd;
        } else if(blockedPeriod.duration > minutesToEnd) {
          blockedPeriod.duration = minutesToEnd;
        }
      });
    }
  });
}

function handleCreate(ctx) {
  if(ctx.instance.days && ctx.instance.days.length !== 0) {
    ensureValidDays(ctx.instance.days);
  } else {
    return;
  }

  let userId = null;
  if(ctx.options.accessToken) {
    userId = ctx.options.accessToken.userId;
  }

  ctx.instance.id = new hashids(shortid.generate(), 6).encode(1);
  ctx.instance.ownerId = userId;
  ctx.instance.claimToken = userId ? null : randtoken.generate(64);
  if(ctx.instance.password) {
    ctx.instance.password = bcrypt.hashSync(ctx.instance.password, bcrypt.genSaltSync());
  }
}

function handleUpdate(ctx) {
  return ctx.Model.findById(ctx.instance.id)
    .then(event => {
      if(ctx.instance.days && ctx.instance.days.length !== 0) {
        ensureValidDays(ctx.instance.days);
      } else {
        return;
      }

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
      if(ctx.data.days && ctx.data.days.length !== 0) {
        ensureValidDays(ctx.data.days);
      }

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
