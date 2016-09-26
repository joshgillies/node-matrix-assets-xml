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
      type
    } = asset

    const links = Object.keys(asset.link)

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

    createChildren(assetId, children)
    createLinks(createdAsset, asset)
    setAttributes(createdAsset, asset)
    setPaths(createdAsset, asset)
    setPermissions(createdAsset, asset)
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

  function setPaths ({ id: assetId }, { paths }) {
    paths.forEach(function setPath (path) {
      xml.addPath({
        assetId,
        path
      })
    })
  }

  function setPermissions ({ id: assetId }, { permissions }) {
    Object.keys(permissions).forEach(function processPermission (permission) {
      const {
        allow: allowed = [],
        deny: denied = []
      } = permissions[permission]

      setAssetPermissionForUsers(assetId, permission, true, allowed)
      setAssetPermissionForUsers(assetId, permission, false, denied)
    })
  }

  function setAssetPermissionForUsers (assetId, permission, granted, users) {
    users.forEach(function setPermission (userId) {
      xml.setPermission({
        assetId,
        permission,
        granted,
        userId
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
