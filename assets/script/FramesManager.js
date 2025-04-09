cc.Class({
    extends: cc.Component,

    properties: {
        // You can bind a Label node here to display the wallet address
        addresstext: {
            default: null,
            type: cc.Label
        }
    },

    start() {
        console.log("FramesManager started", window.FrameSdk);
        
        this.readyState();
        this.createConfiguration();
    },

    createConfiguration: function () {
        if (window && window.miniAppConnector && window.base && window.http && window.createConfig) {
            var connector = window.miniAppConnector();
            this.configuration = window.createConfig({
                chains: [window.base],
                connectors: [connector],
                transports: {
                    [window.base.id]: window.http("https://mainnet.base.org")
                }
            });
        } else {
            cc.warn("Missing Frame SDK configuration dependencies.");
        }
    },

    readyState: function () {
        if (
            window &&
            window.FrameSdk &&
            window.FrameSdk.actions &&
            typeof window.FrameSdk.actions.ready === "function"
        ) {
            window.FrameSdk.actions.ready()
                .then(function () {
                    cc.log("Frame SDK ready");
                })
                .catch(function (err) {
                    cc.error("Error in FrameSdk ready:", err);
                });
        } else {
            cc.warn("FrameSdk ready() not available");
        }
    },

    onConnectWallet: function () {
        cc.log("Connect Wallet", this.configuration);
        if (this.configuration && this.configuration.connectors && this.configuration.connectors[0]) {
            this.configuration.connectors[0].connect()
                .then(function (result) {
                    cc.log("Connect Config Wagmi Result:", result);
                    this.setAddress(result.accounts[0]);
                }.bind(this))
                .catch(function (e) {
                    this.setAddress(e.message);
                }.bind(this));
        } else {
            cc.warn("No valid connector found");
        }
    },

    onDisConnectWallet: function () {
        cc.log("Disconnect Wallet", this.configuration);
        if (this.configuration && this.configuration.connectors && this.configuration.connectors[0]) {
            this.configuration.connectors[0].disconnect()
                .then(function (result) {
                    cc.log("Disconnected:", result);
                    this.setAddress("Your Wallet Disconnected");
                }.bind(this))
                .catch(function (e) {
                    this.setAddress(e.message);
                }.bind(this));
        } else {
            cc.warn("No valid connector found");
        }
    },

    onAddWarpCast: function () {
        cc.log("Add WarpCast");
        if (
            window &&
            window.FrameSdk &&
            window.FrameSdk.actions &&
            typeof window.FrameSdk.actions.addFrame === "function"
        ) {
            window.FrameSdk.actions.addFrame()
                .then(function () {
                    cc.log("addFrame successful");
                })
                .catch(function (err) {
                    cc.error("Error adding frame:", err);
                });
        } else {
            cc.warn("FrameSdk addFrame() not available");
        }
    },

    setAddress: function (address) {
        if (this.addresstext) {
            this.addresstext.string = address;
        } else {
            cc.log("Address:", address); // fallback log
        }
    }

    // update: function (dt) {},
});
