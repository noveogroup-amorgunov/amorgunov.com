const fs = require('fs');

module.exports = function registerBrowserSync(config) {
  config.setBrowserSyncConfig({
    reloadDelay: 2000,
    files: ['src', '!src/client/*'],
    callbacks: {
      ready(err, browserSync) {
        const content404 = fs.readFileSync('dist/404.html');

        browserSync.addMiddleware('*', (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content404);
          res.end();
        });
      },
    },
  });
};
