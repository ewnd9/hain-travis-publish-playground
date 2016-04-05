'use strict';

class Ticket {
  constructor() {
    this.ticket = 0;
  }

  get current() {
    return this.ticket;
  }

  newTicket() {
    this.ticket++;
    if (this.ticket > 99999999)
      this.ticket = 0;
    return this.ticket;
  }
}

module.exports = Ticket;
