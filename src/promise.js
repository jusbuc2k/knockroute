function Promise(context) {
    this._context = context;
    this._state = 'pending';
    this._callbacks = [];
    this._args = null;
}

Promise.prototype.resolve = function (args) {
    this._args = args;
    this._state = 'resolved';
    for (i = 0; i < this.callbacks.length; i++) {
        if (typeof this.callbacks[i][0] === 'function') {
            this.callbacks[i][0].call(this._context, this._args);
        }
    }
};

Promise.prototype.reject = function (args) {
    this._args = args;
    this._state = 'rejected';
    var i;
    for (i = 0; i < this.callbacks.length; i++) {
        if (typeof this.callbacks[i][1] === 'function') {
            this.callbacks[i][1].call(this._context, this._args);
        }
    }
};

Promise.prototype.then = function (successCallback, failCallback) {
    if (this._state === 'pending') {
        this.callbacks.push([successCallback, failCallback]);
    } else if (this._state === 'resolved' && typeof successCallback === 'function') {
        successCallback.call(this._context, this._args);
    } else if (this._state === 'rejected' && typeof failCallback === 'function') {
        failCallback.call(this._context, this._args);
    }
    return this;
};

Promise.prototype.abort = function () {
    this.state = 'aborted';
};

Promise.all = function () {
    var counter = new HitCounter(arguments.length, this);
    var i;
    for (i = 0; i < arguments.length; i++) {
        arguments[i].then(function () {
            counter.hit();
        }, function () {
            counter.reject();
        })
    }
    return counter;
};