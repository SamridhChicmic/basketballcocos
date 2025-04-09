var Basket = require('Basket');
var Ball = require('Ball');
var Shadow = require('Shadow');
var Score = require('Score');
var SoundManager = require('SoundManager');
var TimeManager = require('TimeManager');

cc.Class({
    extends: cc.Component,

    properties: {
        ball: cc.Prefab,
        shadow: cc.Prefab,
        basket: Basket,
        startPosition: cc.Vec2,
        score: Score,
        soundMng: SoundManager,
        timeMng: TimeManager,
    },

    onLoad: function () {
        console.log("test")
        this.ballPool = new cc.NodePool('Ball');
        this.shadowPool = new cc.NodePool('Shadow');

        this.newBall();
        this.initCollisionSys();
        this.basket.init(this);
        this.score.init(this);
        this.timeMng.init(this);

        this.timeMng.oneSchedule();
        this.score.setScore(0);
    },

    initCollisionSys: function () {
        this.collisionManager = cc.director.getCollisionManager();
        this.collisionManager.enabled = true;

        // To show collision boxes while debugging:
        // this.collisionManager.enabledDebugDraw = true;

        // Correct way to show FPS stats in Creator 2.x
        cc.debug.setDisplayStats(true);
    },

    newBall: function () {
        let child = null;
        if (this.ballPool.size() > 0) {
            child = this.ballPool.get();
        } else {
            child = cc.instantiate(this.ball);
        }

        child.zIndex = 1;
        this.node.addChild(child);
        child.setPosition(this.startPosition);

        let ballComp = child.getComponent('Ball');
        ballComp.init(this);
        this.newShadow(ballComp);
    },

    newShadow: function (ball) {
        let ballShadow = null;
        if (this.shadowPool.size() > 0) {
            ballShadow = this.shadowPool.get();
        } else {
            ballShadow = cc.instantiate(this.shadow);
        }

        ballShadow.zIndex = 2;
        this.node.addChild(ballShadow);
        ballShadow.setPosition(this.startPosition);

        let shadowComp = ballShadow.getComponent('Shadow');
        ball.bindShadow(shadowComp);
        shadowComp.init(this);
    },

    startMoveBasket: function () {
        this.basket.startMove();
    },

    stopMoveBasket: function () {
        this.basket.stopMove();
    },

    gameOver: function () {
        this.score.setScore(0);
        this.scheduleOnce(()=>{this.timeMng.oneSchedule()
        this.timeMng.reset()}, this.maxTime);
        
       
    },

    recycleBall: function (ballNode) {
        ballNode.removeFromParent();
        this.ballPool.put(ballNode);
    },

    recycleShadow: function (shadowNode) {
        shadowNode.removeFromParent();
        this.shadowPool.put(shadowNode);
    },
});
