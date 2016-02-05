Package.describe({
    name: "jandres:iscroll-zoom",
    summary: "https://github.com/JoeyAndres/iscroll.git",
    version: "5.1.6",
    documentation: null,
    git: "https://github.com/JoeyAndres/iscroll.git"
});

Package.onUse(function(api) {
    api.addFiles([
        './iscroll-zoom.js'
    ], 'client');
});