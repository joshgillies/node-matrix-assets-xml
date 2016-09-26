import Importer from 'node-matrix-importer'

export default function assetsToXML (assets, parentId) {
  let assetMap = []
  let xml

  if (assets instanceof Importer) {
    xml = assets

    return processAssets
  } else {
    xml = new Importer({
      sortActions: true
    })

    return processAssets(assets, parentId)
  }

  function processAssets (assets, parentId) {
    processAsset(assets, parentId)

    return xml.toString()
  }

  function processAsset (asset, parentId) {
    const {
      children = [],
      dependant,
      exclusive,
      key,
      paths,
      type
    } = asset

    const links = Object.keys(asset.link)
    const permissions = Object.keys(asset.permissions)

    const [ link ] = links.filter(linkTypeN)
    const value = asset.link[link]

    const createdAsset = createAsset({
      parentId,
      type,
      link,
      value,
      dependant,
      exclusive
    })
    const { id: assetId } = createdAsset

    assetMap[key] = assetId

    paths.forEach(setPaths)
    permissions.forEach(setPermissions(asset.permissions))
    createChildren(assetId, children)
    createLinks(createdAsset, asset)
    setAttributes(createdAsset, asset)

    function setPaths (path) {
      xml.addPath({
        assetId,
        path
      })
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
  }

  function createAsset (opts) {
    if (typeof opts.value === 'boolean') {
      delete opts.value
    }
    return xml.createAsset(opts)
  }

  function createChildren (assetId, children) {
    children.forEach(function processChild (child) {
      processAsset(child, assetId)
    })
  }

  function createLinks ({ id: assetId }, { link }) {
    const links = Object.keys(link)

    links.filter(noticeLink).forEach(function createLink (link) {
      xml.createLink({
        to: assetMap[links[link].key],
        from: assetId,
        link: 'notice',
        value: link
      })
    })
  }

  function setAttributes ({ id: assetId }, { attributes }) {
    Object.keys(attributes).forEach(function setAttribute (attribute) {
      const value = attributes[attribute]
      xml.setAttribute({
        assetId,
        attribute,
        value
      })
    })
  }
}

function linkTypeN (link) {
  return /^type_[1-3]$/.test(link)
}

function noticeLink (link) {
  return !linkTypeN(link)
}
