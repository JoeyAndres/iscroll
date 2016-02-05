module.exports = {
    _getScrollerSize () {
        let width = Math.round(this.scroller.offsetWidth * this.scale);
        let height = Math.round(this.scroller.offsetHeight * this.scale);
        return { width: width, height: height };
    }
};
