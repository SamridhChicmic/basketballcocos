cc.Class({
    extends: cc.Component,

    properties: {
        line: cc.Node,
        left: cc.Node,
        right: cc.Node,
        linePre: cc.Prefab,
        count: cc.Label,
    },

    /**
     * Initialize basket and create mask line
     * @param {cc.Component} game - Reference to the game component
     */
    init: function (game) {
        this.game = game;
        this._createMaskLine();
    },

    /**
     * Starts the moving animation for the basket
     */
    startMove: function () {
        this._doMoveAnim();
    },

    /**
     * Stops the moving animation for the basket
     */
    stopMove: function () {
        cc.Tween.stopAllByTarget(this.node);
        this._resetPosition();
    },

    /**
     * Resets the basket to its original position
     */
    _resetPosition: function () {
        this.node.x = 0;
    },

    /**
     * Basket horizontal movement animation using tween
     */
    _doMoveAnim: function () {
        const moveDistance = 200;
        const duration = 3;
    
        cc.tween(this.node)
            .repeatForever(
                cc.tween()
                    .by(duration, { x: moveDistance })
                    .by(duration, { x: -moveDistance })
                    .by(duration, { x: -moveDistance })
                    .by(duration, { x: moveDistance })
            )
            .start();
    },

    /**
     * Keeps the mask line in sync with basket's position every frame
     */
    update: function (dt) {
        if (this.line && this.linePreNode) {
            const worldPos = this.node.convertToWorldSpaceAR(this.line.getPosition());
            const localPos = this.node.parent.convertToNodeSpaceAR(worldPos);
            this.linePreNode.setPosition(this.node.x, localPos.y);
        }
    },

    /**
     * Creates the visual mask line under the basket using prefab
     */
    _createMaskLine: function () {
        this.linePreNode = cc.instantiate(this.linePre);
        this.game.node.addChild(this.linePreNode);
    },

    /**
     * Toggle the visibility depth of the mask line
     * @param {boolean} flag - True to bring forward, false to send back
     */
    switchMaskLineShow: function (flag) {
        this.linePreNode.zIndex=(flag ? 100 : 0);
    },

    /**
     * Play the net stretching animation
     */
    playNetAnim: function () {
        if (this.linePreNode) {
            const net = this.linePreNode.getChildByName('net');
            if (net) {
                cc.Tween.stopAllByTarget(net);
                cc.tween(net)
                    .to(0.1, { scaleY: 1.1 })
                    .to(0.3, { scaleY: 0.9 })
                    .to(0.2, { scaleY: 1.0 })
                    .start();
            }
        }
    },
});
