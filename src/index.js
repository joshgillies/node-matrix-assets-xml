import Importer from 'node-matrix-importer'

module.exports = function assetsToXML (assets) {
  const xml = new Importer({
    sortActions: true
  })
  let assetMap = []

  processAsset(assets)

  return xml.toString()

  function processAsset (asset, parentId) {
    let { children, dependant, exclusive, key, type } = asset
    let links = Object.keys(asset.link)
    let noticeLinks = links.filter(noticeLink)
    let [ link ] = links.filter(linkTypeN)
    let value = asset.link[link]

    let assetId = assetMap[key] = createAsset({
      parentId,
      type,
      link,
      value,
      dependant,
      exclusive
    }).id

    noticeLinks.forEach(createLink)

    if (children && children.length) {
      children.forEach(processChild)
    }

    function processChild (child) {
      processAsset(child, assetId)
    }

    function createAsset (opts) {
      if (typeof opts.value === 'boolean') {
        delete opts.value
      }
      return xml.createAsset(opts)
    }

    function createLink (link) {
      xml.createLink({
        to: assetMap[asset.link[link].key],
        from: assetId,
        link: 'notice',
        value: link
      })
    }

    function linkTypeN (link) {
      return /^type_[1-3]$/.test(link)
    }

    function noticeLink (link) {
      return !linkTypeN(link)
    }
  }
}
