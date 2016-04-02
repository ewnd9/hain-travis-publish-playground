'use strict';

function runWhen(predicate, func, interval) {
  const _interval = interval || 10;
  let _timer = 0;
  _timer = setInterval(() => {
    const isOk = predicate();
    if (!isOk)
      return;
    clearInterval(_timer);
    func();
  }, _interval);
}

module.exports = { runWhen };
