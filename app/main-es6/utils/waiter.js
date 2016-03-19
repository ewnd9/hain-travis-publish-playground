'use strict';

function runWhen(predicate, func, interval) {
  let _timer = 0;
  _timer = setInterval(() => {
    const isOk = predicate();
    if (!isOk)
      return;
    clearInterval(_timer);
    func();
  }, interval);
}

module.exports = { runWhen };
