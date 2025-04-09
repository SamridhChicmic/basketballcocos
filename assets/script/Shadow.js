cc.Class({
    extends: cc.Component,

    properties: {
        showTime: 0,    // Time to show basketball animation
        shadow2: cc.Node,
    },

    init: function (game, nodePool) {
        this.game = game;
        this.nodePool = nodePool;

        this.node.setScale(1);
        this._showAnim();
    },

    // Show animation
    _showAnim: function () {
        this.node.opacity = 0;
        if (this.shadow2) this.shadow2.active = true;

        var fadeAnim = cc.fadeIn(this.showTime);
        this.node.runAction(fadeAnim);    
    },

    // Call to dismiss
    dismiss: function () {
        this._dismissAnim();
    },

    _dismissAnim: function () {
        if (this.shadow2) this.shadow2.active = false;

        var fadeAnim = cc.fadeOut(this.showTime);
        var scaleAnim = cc.scaleTo(this.showTime, 0.5);
        var spawnAnim = cc.spawn(fadeAnim, scaleAnim);
        var func = cc.callFunc(this._callBack, this);

        this.node.runAction(cc.sequence(spawnAnim, func));
    },

    // Animation complete callback
    _callBack: function () {
        this.node.stopAllActions();
        this.node.removeFromParent(false); // keep node alive

        if (this.nodePool) {
            this.nodePool.put(this.node); // Reuse node
        } else {
            this.node.destroy(); // Destroy if no pool
        }
    },
});
