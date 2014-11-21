fe.stage = function (stage) {
    var _stage = function () {
        this.ready = false;
        this.init = function () {
            self.bgsprite = stage.bgsprite;
            self.actions = stage.actions;
            self.initactions();
            self.sprite = new Image();
            self.sprite.src = 'media/' + stage.sprite;
            self.sprite.onload = function () {
                self.ready = true;
            }
        }
        this.initactions = function () {
            if (self.actions != null && self.actions.length > 0) {
                for (var i = 0; i < self.actions.length; i++) {
                    var action = self.actions[i];
                    action.lastrender = new Date();
                    action.actualframeindex = 0;
                    action.getframe = function () {
                        var currentframe = this.frames[this.actualframeindex];
                        if (action.lastrender.getTime() + currentframe.d <= (new Date()).getTime()) {
                            action.actualframeindex += 1;
                            if (action.actualframeindex > this.frames.length - 1) action.actualframeindex = 0;
                            action.lastrender = new Date();
                        }
                        return this.frames[action.actualframeindex];
                    }
                }
            }
        }

        var self = this;
        self.init();
        return self;
    }
    return new _stage();
};