module.exports = function(x, y) {
    if (this.indicators) {
        for (var i = this.indicators.length; i--;) {
            this.indicators[i].updatePosition();
        }
    }
};
