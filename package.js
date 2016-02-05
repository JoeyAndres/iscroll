Package.describe({
    name: "jandres:iscroll",
    summary: "Ionic components for Meteor. No Angular!",
    version: "5.1.2-alpha5",
    git: "https://github.com/JoeyAndres/iscroll.git"
});

Package.onUse(function(api) {
    api.use([
        'ecmascript'
    ], 'client');

    api.addFiles([
        'build/iscroll-zoom.js'
    ], 'client');
});