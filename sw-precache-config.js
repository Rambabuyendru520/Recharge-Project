module.exports = {
  staticFileGlobs: [
    'dist/app/**.html',
    'dist/app/**.js',
    'dist/app/**.css',
    'dist/app/**.otf',
    'dist/app/**.woff2',
    'dist/app/**.woff',
    'dist/app/**.ttf',
    'dist/app/appassets/pages/*',
    'dist/app/appassets/images/*',
    'dist/app/appassets/icons/*',
    'dist/app/appassets/fonts/*'
  ],
  root: 'dist/app',
  stripPrefix: 'dist',
  navigateFallback: 'appassets/pages/pageNotFound.html',

}
