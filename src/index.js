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
    let permissions = Object.keys(asset.permissions)
    let [ link ] = links.filter(linkTypeN)
    let value = asset.link[link]

    let { id } = createAsset({
      parentId,
      type,
      link,
      value,
      dependant,
      exclusive
    })
    let assetId = assetMap[key] = id

    noticeLinks.forEach(createLinks(asset.link))
    permissions.forEach(setPermissions(asset.permissions))

    if (children && children.length) {
      children.forEach(createChild(assetId))
    }

    function createChild (assetId) {
      return function processChild (child) {
        processAsset(child, assetId)
      }
    }

    function createAsset (opts) {
      if (typeof opts.value === 'boolean') {
        delete opts.value
      }
      return xml.createAsset(opts)
    }

    function createLinks (links) {
      return function createLink (link) {
        xml.createLink({
          to: assetMap[links[link].key],
          from: assetId,
          link: 'notice',
          value: link
        })
      }
    }

    function setPermissions (permissions) {
      return function setPermission (permission) {
        let { allow, deny } = permissions[permission]

        allowUsers(allow)
        denyUsers(deny)

        function allowUsers (users) {
          permissionsToSet(users, true)
        }

        function denyUsers (users) {
          permissionsToSet(users, false)
        }

        function permissionsToSet (users = [], granted) {
          users.forEach((userId) => {
            xml.setPermission({
              assetId,
              permission,
              granted,
              userId
            })
          })
        }
      }
    }

    function linkTypeN (link) {
      return /^type_[1-3]$/.test(link)
    }

    function noticeLink (link) {
      return !linkTypeN(link)
    }
  }
}
