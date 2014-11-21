fe.player = function (player) {
    var _player = function () {
        this.id = null;
        this.type = null;
        this.name = null;
        this.durability = 100;
        this.parent = null;
        this.ready = false;
        this.right = false;
        this.zoom = 1;
        this.region = {
            position: { x: 10, y: 0, w: 0, h: 0, move: function (x, y) {
                var newx = this.x + x;
                if (newx >= 0 && newx + (self.current.frame.w * self.zoom) <= self.parent.stage.bgsprite.w) this.x += x;
                this.y += y;
                self.updateregion();
            }
            },
            impact: { x: 0, y: 0, w: 0, h: 0 },
            damage: { x: 0, y: 0, w: 0, h: 0 },
            iscollision: false,
            collision: { x: 0, y: 0, w: 0, h: 0 }
        }
        this.lastrender = null;
        this.current = {
            action: null,
            frame: null
        }
        this.sound = null;
        this.enemy = null;
        this.enemyfront = null;
        this.com = null;

        this.updateregion = function () {
            self.region.impact.x = self.right != true ? self.region.position.x * self.parent.rate.w : (self.parent.stage.bgsprite.w - (self.region.position.x + self.region.position.w * self.zoom)) * self.parent.rate.w;
            self.region.impact.y = ((self.parent.groundy - (self.current.frame.h * self.zoom)) + self.region.position.y) * self.parent.rate.h;
            self.region.impact.w = self.current.frame.w * self.parent.rate.w * self.zoom;
            self.region.impact.h = self.current.frame.h * self.parent.rate.h * self.zoom;
            self.region.impact.c = self.region.impact.x + (self.region.impact.w / 2);

            var ratew = self.region.impact.w * 0.2;
            var rateh = self.region.impact.h * 0.1;

            self.region.damage.x = self.region.impact.x + ratew;
            self.region.damage.y = self.region.impact.y + rateh;
            self.region.damage.w = self.region.impact.w - ratew * 2;
            self.region.damage.h = self.region.impact.h - rateh * 1.3;

            self.enemyfront = self.right == false ? self.region.impact.c < self.enemy.region.impact.c : self.region.impact.c >= self.enemy.region.impact.c;

        }

        this.calculateaction = function (keyaction) {
            if (keyaction && !self.current.action.mustend && self.current.action.name != keyaction) {
                if (self.actions[keyaction]) {
                    self.setaction(keyaction);
                };
            };
            if (!self.current.action.frames[self.current.action.frameindex]) {
                if (self.current.action.name == "crouch") self.current.action.frameindex -= 1;
                else {
                    self.setaction("standing");
                };
            };
        }

        this.turn = function () {
            if (self.right == true)
                self.right = false;
            else
                self.right = true;

            self.region.position.x = self.parent.stage.bgsprite.w - (self.region.position.x + self.current.frame.w * self.zoom);
        }

        this.checkcollision = function () {
            if (self.current.frame != null && self.current.frame.p > 0 && self.enemy.current.frame != null && self.enemyfront == true) {
                self.region.collision = self.parent.getcollisionrect(self.region.impact, self.enemy.region.damage);
                self.region.iscollision = self.region.collision.w > 0;
                if (self.region.iscollision) self.enemy.damage(self.current.frame.p);
            }
        }

        this.damage = function (power) {
            self.durability -= power;
            self.setaction('damage');
            if (self.durability <= 0) self.parent.slowmotion = true;
        }

        this.getframe = function () {
            if (self.current.action.frameindex > self.current.action.frames.length - 1) {
                self.current.action.frameindex = 0;
            }
            var frame = self.current.action.frames[self.current.action.frameindex];
            var duration = self.parent.slowmotion == true ? 800 : frame.d;
            if (self.lastrender.getTime() + duration <= (new Date()).getTime()) {
                self.current.action.frameindex += 1;
                self.lastrender = new Date();
                if (self.sound != null && frame.s != null) {
                    self.sound.play(frame.s);
                }
                self.region.position.w = frame.w;
                self.region.position.h = frame.h;
                self.region.position.move(frame.m[0], frame.m[1]);
                //if (self.right == true) self.region.position.move(1, 0);

            }
            self.updateregion();
            self.checkcollision();
            self.current.frame = frame;
            return frame;
        }

        this.setaction = function (actionname) {
            self.current.action = self.actions[actionname];
            self.current.action.frameindex = 0;
            self.current.frame = self.current.action.frames[self.current.action.frameindex];
            self.lastrender = new Date();
        }

        this.init = function () {
            self.id = (new Date()).getTime();
            self.zoom = player.zoom;
            self.enemyfront = true;
            self.actions = player.actions;
            self.initactions();
            if (player.sound != null) self.sound = new Howl(player.sound);
            self.sprite = new Image();
            self.sprite.src = 'media/' + player.sprite;
            self.com = fe.com();
            self.com.parent = self;
            self.sprite.onload = function () {
                self.setaction('salaam');
                self.ready = true;
                //if (self.right != true) self.region.position.x = 50;
            }
        }

        this.initactions = function () {
            if (self.actions != null && self.actions.length > 0) {
                for (var i = 0; i < self.actions.length; i++) {
                    var action = self.actions[i];
                    action.frameindex = 0;
                    action.frame = action.frames[action.frameindex];
                }
            }
        }

        var self = this;
        self.init();
        return self;
    }
    return new _player();
};

fe.player.type = { local:0 , remote:1, computer:2 };

