Package.describe({
    name: "jandres:iscroll",
    summary: "https://github.com/JoeyAndres/iscroll.git",
    version: "5.1.5",
    documentation: null,
    git: "https://github.com/JoeyAndres/iscroll.git"
});

Package.onUse(function(api) {
    api.addFiles([
        './iscroll.js'
    ], 'client');
});