const TouchStatus = {
    BEGAN: 'began',
    ENDED: 'ended',
    CANCEL: 'cancel',
};

const BallStatus = {
    FLY: 'fly',
    DOWN: 'down',
    NONE: 'none',
};

cc.Class({
    extends: cc.Component,

    properties: {
        emitSpeed: 0,
        gravity: 0,
        scale: 0,
        showTime: 0,
        maxXSpeed: 0,
    },

    onLoad() {
        this._touchStatus = TouchStatus.CANCEL;
        this._ballStatus = BallStatus.NONE;
        this.currentHorSpeed = 0;
        this.currentVerSpeed = 0;
        this.valid = false;
        this.hitIn = false;
        this.target = cc.v2();
        this.node.setScale(1); // ✅ still valid
        this.node.angle = 0;

        this._registerInput();
        this._enableInput(true);
        this._showAnim();
    },

    init(game) {
        this.game = game;
    },

    _showAnim() {
        this.node.opacity = 0;
        cc.tween(this.node)
            .to(this.showTime, { opacity: 255 })
            .start();
    },

    _registerInput() {
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
    },

    _enableInput(enable) {
        this.node.enabled = enable;
    },

    _onTouchStart(touch) {
        // console.log('touch start');
        this.began = touch.getLocation();
        this._touchStatus = TouchStatus.BEGAN;
    },

    _onTouchEnd(touch) {
        // console.log('touch End');
        this.ended = touch.getLocation();
        const distance = this.ended.sub(this.began).mag();
        // console.log('Distance',distance);
        if (distance > 30 && this.began.y < this.ended.y) {
            // console.log('touch inScreen');
            this._touchStatus = TouchStatus.ENDED;
            this._enableInput(false);

            this.currentVerSpeed = this.emitSpeed;
            this.target = this.node.parent.convertToNodeSpaceAR(this.ended);
            this.currentHorSpeed = this.target.x * 2;

            this.game.soundMng.playFlySound();
            this._doAnim();
            this.game.newBall();

            if (this.shadow) {
                this.shadow.dismiss();
            }
        } else {
            this._touchStatus = TouchStatus.CANCEL;
        }
    },

    _onTouchCancel() {
        this._touchStatus = TouchStatus.CANCEL;
    },

    _doAnim() {
        const scaleAnim = cc.tween().to(1, { scale: this.scale });
        const rotateAnim = cc.tween().by(2, { angle: 1080 * (Math.random() * 2 - 1) });
        cc.tween(this.node)
            .parallel(scaleAnim, rotateAnim)
            .start();
    },

    bindShadow(shadow) {
        this.shadow = shadow;
    },

    update(dt) {
        if (this._touchStatus !== TouchStatus.ENDED) return;

        this._updatePosition(dt);
        this._checkValid();
    },

    _updatePosition(dt) {
        this.node.x += dt * this.currentHorSpeed;
        this.currentVerSpeed -= dt * this.gravity;
        this.node.y += dt * this.currentVerSpeed;

        this._changeBallStatus(this.currentVerSpeed);

        if (this._ballStatus === BallStatus.NONE && this._isOutOfScreen()) {
            this.node.stopAllActions();
            this.node.removeFromParent();
            this.valid = false;
        }
    },

    _changeBallStatus(speed) {
        if (speed === 0 || this._isOutOfScreen()) {
            this._ballStatus = BallStatus.NONE;
        } else if (speed > 0) {
            this._ballStatus = BallStatus.FLY;
            this.game.basket.switchMaskLineShow(false);
        } else {
            this._ballStatus = BallStatus.DOWN;
            this.game.basket.switchMaskLineShow(true);
        }
    },

    _checkValid() {
        if (this._ballStatus !== BallStatus.DOWN || this.valid) return;

        const parent = this.node.parent;
        const basket = this.game.basket;

        const left = basket.left;
        const right = basket.right;
        const ballRadius = this.node.getBoundingBoxToWorld().width / 2;

        const ballWorldPos = parent.convertToWorldSpaceAR(this.node.position);
        const ballX = ballWorldPos.x;
        const ballY = ballWorldPos.y;

        const validTop = parent.convertToWorldSpaceAR(basket.linePreNode.position).y - ballRadius;
        const validLeft = basket.node.convertToWorldSpaceAR(left.position).x;
        const validRight = basket.node.convertToWorldSpaceAR(right.position).x;
        const validBottom = basket.node.convertToWorldSpaceAR(left.position).y - ballRadius * 2;

        if (ballY < validTop && ballY > validBottom && ballX > validLeft && ballX < validRight) {
            this.valid = true;
            this.game.score.addScore();
            this.game.basket.playNetAnim();
            if (this.hitIn) {
                this.game.soundMng.playHitBoardInSound();
            } else {
                this.game.soundMng.playBallInSound();
            }
        }
    },

    _isOutOfScreen() {
        return this.node.y < -800;
    },

    onCollisionEnter(other, self) {
        if (this._ballStatus === BallStatus.FLY) return;

        const box = other.node.getComponent('CollisionBox');
        const left = box.getLeft();
        const right = box.getRight();

        const world = self.world;
        const radius = world.radius;

        const selfWorldPos = this.node.parent.convertToWorldSpaceAR(self.node.position);
        const otherWorldPos = this.game.basket.node.convertToWorldSpaceAR(other.node.position);

        const ratioVer = (selfWorldPos.y - otherWorldPos.y) / radius;
        const ratioHor = Math.abs(otherWorldPos.x - selfWorldPos.x) / radius;

        const horV = this.currentHorSpeed / Math.abs(this.currentHorSpeed) * this.maxXSpeed;

        if ((other.node.name === 'right' && this.node.x <= left) || (other.node.name === 'left' && this.node.x >= right)) {
            if (!this.hitIn) {
                this.currentHorSpeed = -horV * ratioHor;
                this.hitIn = true;
            } else {
                this.currentHorSpeed = horV * ratioHor;
            }
        }

        if ((other.node.name === 'right' && this.node.x > right) || (other.node.name === 'left' && this.node.x < left)) {
            this.currentHorSpeed = horV;
        }

        this.currentVerSpeed = this.currentVerSpeed * -1 * ratioVer;
        this.game.soundMng.playHitBoardSound();
    }
});
