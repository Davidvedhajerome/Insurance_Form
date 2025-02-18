const path = require('path');

module.exports = {
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      // Add your middleware logic here
      devServer.app.get('/custom-route', (req, res) => {
        res.send('Custom middleware response');
      });

      return middlewares;
    },
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 9000,
  },
};
