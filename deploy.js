const ghpages = require('gh-pages')

ghpages.publish(
'.',
{
  src: [
    "dist/**/*",
    "assets/**/*",
    "index.html",
    "favicon.ico",
    "manifest.json",
  ]
}
, (err) => {
  console.log(err)
})
