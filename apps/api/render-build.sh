set -o errexit

npm install

PUPPETEER_CACHE_DIR=.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

npx puppeteer browsers install chrome

echo "Chrome installed into $PUPPETEER_CACHE_DIR"
