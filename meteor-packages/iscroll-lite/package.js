Package.describe({
    name: "jandres:iscroll-lite",
    summary: "https://github.com/JoeyAndres/iscroll.git",
    version: "5.1.9",
    documentation: null,
    git: "https://github.com/JoeyAndres/iscroll.git"
});

Package.onUse(function(api) {
    api.addFiles([
        './iscroll-lite.js'
    ], 'client');
});