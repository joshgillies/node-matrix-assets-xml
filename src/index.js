import Importer from 'node-matrix-importer'

module.exports = function assetsToXML (assets) {
  const xml = new Importer({
    sortActions: true
  })
  let assetMap = []

  processAsset(assets)

  return xml.toString()

  function processAsset (asset, parentId) {
    const {
      children,
      dependant,
      exclusive,
      key,
      paths = [],
      type
    } = asset
    const attributes = Object.keys(asset.attributes || {})
    const links = Object.keys(asset.link)
    const noticeLinks = links.filter(noticeLink)
    const permissions = Object.keys(asset.permissions)
    const [ link ] = links.filter(linkTypeN)
    const value = asset.link[link]

    const { id } = createAsset({
      parentId,
      type,
      link,
      value,
      dependant,
      exclusive
    })
    const assetId = assetMap[key] = id

    attributes.forEach(setAttributes(asset.attributes))
    paths.forEach(setPaths)
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

    function setAttributes (attributes) {
      return function setAttribute (attribute) {
        const value = attributes[attribute]
        xml.setAttribute({
          assetId,
          attribute,
          value
        })
      }
    }

    function setPaths (path) {
      xml.addPath({
        assetId,
        path
      })
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
        const { allow, deny } = permissions[permission]

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
