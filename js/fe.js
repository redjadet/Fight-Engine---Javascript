var fe = new function () {
    this.fps = 30;
    this.rounds = [
       { name: 'Round 1', played: false, winner: null, time: 100 },
       { name: 'Round 2', played: false, winner: null, time: 100 },
       { name: 'Round 3', played: false, winner: null, time: 100 }
     ];

    this.canvas = null;
    this.context = null;
    this.stage = null;
    this.player1 = null;
    this.player2 = null;
    this.frametimer = null;
    this.loadtimer = null;
    this.rate = {
        w: null,
        h: null
    };
    this.font = {
        size: 6,
        family: 'Lucida Console',
        color: 'white'
    };
    this.groundy = 200;
    this.keymonitor = [];
    this.slowmotion = false;
    this.debbug = false;
    this.startdate = null;
    this.keys = {
        39: 'front', //right
        37: 'back', //left
        40: 'crouch', //down
        38: 'jump', //up
        81: 'punch',
        87: 'punchstrong',
        65: 'kick',
        83: 'kickstrong'
    };

    this.keyup = function (event) {
        var keyaction = self.keys[event.keyCode];
        if (keyaction == "front") {
            if (self.keymonitor.indexOf("jump") != -1) self.keymonitor.splice(self.keymonitor.indexOf("jumpfront"), 1);
        } else if (keyaction == "back") {
            if (self.keymonitor.indexOf("jump") != -1) self.keymonitor.splice(self.keymonitor.indexOf("jumpback"), 1);
        } else if (keyaction == "jump") {
            if (self.keymonitor.indexOf("front") != -1) self.keymonitor.splice(self.keymonitor.indexOf("jumpfront"), 1);
            else if (self.keymonitor.indexOf("back") != -1) self.keymonitor.splice(self.keymonitor.indexOf("jumpback"), 1);
        };
        self.keymonitor.splice(self.keymonitor.indexOf(keyaction), 1);
        if (keyaction) {
            if (keyaction == "crouch" && self.player1.current.action.name == "crouch") {
                self.player1.setaction("standup");
            };
        };
        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    this.keydown = function (event) {
        //        if (self.enemyfront == false && self.right == false && keyaction == "back") { self.turn(); return; }
        //        else if (self.enemyfront == false && self.right == true && keyaction == "front") { self.turn(); return; }
        //        else if (self.right == true && keyaction == "front") keyaction = "back";
        //        else if (self.right == true && keyaction == "back") keyaction = "front";

        var keyaction = self.keys[event.keyCode];
        if (self.keymonitor.indexOf(keyaction) == -1) {
            self.keymonitor.push(keyaction);
            if (self.keymonitor.length >= 1) {
                if (self.keymonitor.indexOf("front") != -1) {
                    if (self.keymonitor.indexOf("jump") != -1 && self.keymonitor.indexOf("jumpfront") == -1) self.keymonitor.push("jumpfront");
                } else if (self.keymonitor.indexOf("back") != -1) {
                    if (self.keymonitor.indexOf("jump") != -1 && self.keymonitor.indexOf("jumpback") == -1) self.keymonitor.push("jumpback");
                };
            };
        };
        //console.log(event.keyCode);
        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    this.render = function () {
        self.context.clearRect(0, 0, self.context.width, self.context.height);
        self.renderstage();
        self.selecaction();
        self.renderplayers();
        //self.zz = Math.round(Math.abs(self.getcollisionrect(self.player1.region.impact, self.player2.region.impact).w / self.canvas.width) * 13);
        //self.camera.zoom(self.zz);


        if (self.debbug == true)
            self.renderdebbugbar();
        else
            self.drawlifebar(self.player1, self.player2);
    }

    this.selecaction = function () {
        var keyaction = self.keymonitor[self.keymonitor.length - 1] || false;
        self.player1.calculateaction(keyaction);
        self.player2.calculateaction(keyaction);
    }

    this.renderplayers = function () {
        self.renderplayer(self.player1);
        self.renderplayer(self.player2);
        if (self.debbug == true && self.player1.current.frame != null && self.player2.current.frame != null) {
            self.drawrect(self.player1.region.impact, "white", self.player1.zoom);
            self.drawrect(self.player2.region.impact, "white", self.player2.zoom);
            self.drawrect(self.player1.region.damage, "green", self.player1.zoom);
            self.drawrect(self.player2.region.damage, "green", self.player2.zoom);
            //self.writestatusbar(self.zz);
            //if (self.player1.region.iscollision == true) self.drawrect(self.player1.region.collision, "red", self.player1.zoom);
            //if (self.player2.region.iscollision == true) self.drawrect(self.player2.region.collision, "red", self.player2.zoom);
        }
    }

    this.getcollisionrect = function (rectA, rectB) {
        var x = rectA.x < rectB.x ? rectB.x : rectA.x;
        var y = rectA.y < rectB.y ? rectB.y : rectA.y;
        return {
            x: x,
            y: y,
            w: rectA.x + rectA.w < rectB.x + rectB.w ? rectA.x + rectA.w - x : rectB.x + rectB.w - x,
            h: rectA.y + rectA.h < rectB.y + rectB.h ? rectA.y + rectA.h - y : rectB.y + rectB.h - y
        };
    }

    this.renderplayer = function (player) {
        var frame = player.getframe();
        if (player.current.action.name == "standing") player.region.position.y = 0;
        var position = {
            x: player.right == false ? player.region.position.x : (self.stage.bgsprite.w - player.region.position.x) * -1,
            y: ((self.groundy - (frame.h * player.zoom)) + player.region.position.y)
        };



        self.context.save();


        if (player.right == true)
            self.context.scale(-1, 1);
        else
            self.context.scale(1, 1);

        self.drawimage(player.sprite, frame, position, player.zoom);
        self.context.restore();
    }

    this.renderstage = function () {
        self.drawimage(self.stage.sprite, self.stage.bgsprite, { x: 0, y: 0, w: self.stage.bgsprite.w, h: self.stage.bgsprite.h });
        for (var i = 0; i < self.stage.actions.length; i++) {
            var action = self.stage.actions[i];
            self.drawimage(self.stage.sprite, action.getframe(), action.pos);
        }
    }

    this.drawimage = function (sprite, cut, past, zoom) {
        if (zoom == null) zoom = 1;
        self.context.drawImage(sprite, cut.x, cut.y, cut.w, cut.h, past.x * self.rate.w, past.y * self.rate.h, (cut.w * self.rate.w) * zoom, (cut.h * self.rate.h) * zoom);
    }

    this.drawrect = function (rect, color, zoom) {
        if (zoom == null) zoom = 1;
        self.context.beginPath();
        self.context.lineWidth = "1";
        self.context.strokeStyle = color;
        self.context.rect(rect.x, rect.y, rect.w, rect.h);
        self.context.stroke();
    }

    this.drawtext = function (text, x, y, zoom) {
        if (zoom == null) zoom = 1;
        var col = x;
        for (var i = 0; i < text.length; i++) {
            var chr = text.toString().substr(i, 1);
            if (chr != "") {
                var cut = self.gfont.white["_" + chr];
                if (cut != null && cut != undefined) {
                    var t = cut == null || cut.t == null ? 0 : cut.t * zoom;
                    self.context.drawImage(self.gfont.sprite, cut.x, cut.y, cut.w, cut.h, col * self.rate.w, (y + t) * self.rate.h, (cut.w * self.rate.w) * zoom, (cut.h * self.rate.h) * zoom);
                    col += cut.w * zoom;
                } else {
                    col += 8 * zoom;
                }
            }
        }
    }

    this.calculatetextwidth = function (text, zoom) {
        if (zoom == null) zoom = 1;
        var col = 0;
        for (var i = 0; i < text.length; i++) {
            var chr = text.toString().substr(i, 1);
            if (chr != "") {
                var cut = self.gfont.white["_" + chr];
                if (cut != null && cut != undefined) {
                    col += cut.w * zoom;
                } else {
                    col += 8 * zoom;
                }
            }
        }
        return col;
    }

    this.drawlifebar = function (player1, player2) {
        var t = Math.round(100 - (new Date() - self.startdate) / 1000);
        if (t == 0) self.stop();
        var y = 8 * self.rate.h;
        var width = 150;
        var opacity = .4;
        var height = 6 * self.rate.h;
        self.drawtext(player1.name, 1, 2, .4)
        self.context.beginPath();
        self.context.lineWidth = "1";
        self.context.strokeStyle = "rgba(255,255,255,0.4)";
        self.context.rect(5, y, width * self.rate.w, height);
        self.context.stroke();
        self.context.beginPath();
        self.context.lineWidth = "1";
        self.context.strokeStyle = "rgba(0,155,0,0.4)";
        self.context.fillStyle = "rgba(" + (255 - (player1.durability * 2)) + "," + (player1.durability * 2) + ",0,0.7)";
        self.context.fillRect(5, y, (width * self.rate.w / 100) * player1.durability, height);
        self.context.stroke();

        var numwidth = self.calculatetextwidth(t.toString(), .9)
        self.drawtext(t.toString(), (self.stage.bgsprite.w / 2) - (numwidth / 2), 7, 1)

        self.drawtext(player2.name, (self.canvas.width / self.rate.w - self.calculatetextwidth(player2.name, .4)) - 1, 2, .4)
        self.context.beginPath();
        self.context.lineWidth = "1";
        self.context.strokeStyle = "rgba(255,255,255,0.4)";
        self.context.rect(((self.canvas.width / self.rate.w - width) * self.rate.w) - 5, y, width * self.rate.w, height);
        self.context.stroke();
        self.context.beginPath();
        self.context.lineWidth = "1";
        self.context.strokeStyle = "rgba(0,155,0,0.4)";
        self.context.fillStyle = "rgba(" + (255 - (player2.durability * 2)) + "," + (player2.durability * 2) + ",0,0.7)";
        self.context.fillRect((((self.canvas.width / self.rate.w - width) * self.rate.w) - 5) - (width * self.rate.w / 100) * (player2.durability - 100), y, (width * self.rate.w / 100) * player2.durability, height);
        self.context.stroke();


        //self.drawtext(self.player1.name + ' ' + self.player1.durability + ' ' + self.player2.name + ' ' + self.player2.durability, 5, 5, .5);

    }

    this.init = function (config) {
        if (config != null) {
            self.canvas = document.getElementById(config.canvasid);
            window.onresize = function () {
                fe.canvas.height = window.innerHeight;
                fe.canvas.width = window.innerWidth;
                if (fe.rate.w != null && fe.rate.h != null) self.setrate();
            }
            window.onresize();
            if (!self.canvas.tabIndex || self.canvas.tabIndex == -1) self.canvas.tabIndex = 1;
            self.context = self.canvas.getContext('2d');
            self.gfont.sprite = new Image();
            self.gfont.sprite.src = self.gfont.file;
            self.gfont.parent = self;
            self.gfont.sprite.onload = function () {
                self.gfont.ready = true;
                if (config.stage == null) config.stage = config.player2;
                eval('var stage = fe.stages.' + config.stage + ';');
                eval('var player1 = fe.players.' + config.player1);
                eval('var player2 = fe.players.' + config.player2);
                self.stage = fe.stage(stage);
                self.player1 = fe.player(player1);
                self.player1.type = fe.player.type.local;
                self.player2 = fe.player(player2);
                self.player2.type = fe.player.type.remote;
                self.player2.right = true;
                self.player1.name = config.player1;
                self.player2.name = config.player2;
                self.player1.parent = self;
                self.player2.parent = self;
                self.player1.enemy = self.player2;
                self.player2.enemy = self.player1;
                self.canvas.addEventListener("keydown", self.keydown.bind(self), false);
                self.canvas.addEventListener("keyup", self.keyup.bind(self), false);
                self.canvas.focus();
                self.loadtimer = setInterval(self.checkload.bind(self), 200);
            };





        }
    }

    this.start = function () {
        self.startdate = new Date();
        self.setrate();
        self.frametimer = setInterval(self.render.bind(self), 1000 / self.fps);
    }

    this.stop = function () { 
    
    }

    this.setrate = function () {
        self.rate.w = (self.canvas.width) / (self.stage.bgsprite.w);
        self.rate.h = (self.canvas.height) / (self.stage.bgsprite.h);
    }

    this.checkload = function () {
        var proccessstatus = 0;
        if (self.gfont != null && self.gfont.ready == true) proccessstatus += 25;
        if (self.stage != null && self.stage.ready == true) proccessstatus += 25;
        if (self.player1 != null && self.player1.ready == true) proccessstatus += 25;
        if (self.player2 != null && self.player2.ready == true) proccessstatus += 25;
        self.proccessbar(proccessstatus);
        if (proccessstatus == 100) {
            clearInterval(self.loadtimer);
            self.loadtimer = null;
            setTimeout(self.start, 300);
        }
    }

    this.proccessbar = function (proccessstatus) {
        var width = 250;
        var height = 20;
        var x = (self.canvas.width / 2) - width / 2;
        var y = (self.canvas.height / 2) - height / 2;
        self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
        self.context.beginPath();
        self.context.lineWidth = "4";
        self.context.strokeStyle = "white";
        self.context.rect(x, y, width, height);
        self.context.stroke();
        self.context.beginPath();
        self.context.lineWidth = "4";
        self.context.strokeStyle = "white";
        self.context.fillStyle = "white";
        self.context.fillRect(x, y, (width / 100) * proccessstatus, height);
        self.context.stroke();
        self.context.font = '9px  Lucida Console';
        self.context.textBaseline = 'bottom';
        self.context.fillText('Loading. Please wait', x, y - 5);
    }

    this.renderdebbugbar = function () {
        var d = new Date();
        var lastCall = this.lastFrame;
        this.lastFrame = d.getTime();
        var fps = Math.ceil(1000 / (this.lastFrame - lastCall));
        self.drawtext(fps + " FPS " + " current action: " + self.player1.current.action.name + " keymonitor: " + self.keymonitor, 10, 5, 0.4);
    }

    var self = this;
    return self;
}
