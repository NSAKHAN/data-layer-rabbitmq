'use strict';

const RabbitBaseHandler = require('./rabbit-base-handler');
const EVENTS = require('../constants').EVENTS;

class RabbitQueueHandler extends RabbitBaseHandler{
  constructor(rmq, config){
    super(rmq, config);

    const self = this;

    self.id = config.ID ? config.ID : '';
    self.options = config.OPTIONS ? config.OPTIONS : {};
  }

  *init(){
    const self = this;

    yield super.init();
    const res = yield self.channel.assertQueue(self.id, self.options);
    self.id = res.queue;
  }

  consume(){
    const self = this;

    self.channel.consume(self.id, function(data){
      self.rmq.emit(EVENTS.MESSAGE_ARRIVED, self, data);
    });
  }

  ack(message, allUpTo){
    const self = this;

    allUpTo = allUpTo ? allUpTo : false;

    self.channel.ack(message, allUpTo);
  }

  reject(message, requeue){
    const self = this;

    requeue = requeue ? requeue : true;

    self.channel.reject(message, requeue);
  }

  destroy(){
    const self = this;

    super.destroy();

    self.id = null;
    self.options = null;
  }
}

module.exports = RabbitQueueHandler;