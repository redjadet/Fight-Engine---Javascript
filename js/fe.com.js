fe.com = function () {
    var _com = function () {
        this.ready = false;
        this.parent = null;

        this.init = function () {
            self.ready = true;
        }

        var self = this;
        self.init();
        return self;
    }
    return new _com();
};