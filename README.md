# node-matrix-assets-xml

Generate XML for Squiz Matrix' "Import Assets from XML Tool" from asset trees.

[![Build Status](https://travis-ci.org/joshgillies/node-matrix-assets-xml.svg)](https://travis-ci.org/joshgillies/node-matrix-assets-xml)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

## Install

`npm install node-matrix-assets-xml`

## Example

```js
import asset from 'node-matrix-assets'
import assetsToXML from 'node-matrix-assets-xml'

const { getAssetById } = asset

let tree = asset('folder', { name: 'Sites', link: 'type_2' },
  asset('site', { id: 'site', name: 'My Site' },
    asset('page_standard', { name: 'Home', link: { index: getAssetById('site') } },
      asset('bodycopy', { link: 'type_2', dependant: '1', exclusive: '1' },
        asset('bodycopy_div', { link: 'type_2', dependant: '1' },
          asset('content_type_wysiwyg', { link: 'type_2', dependant: '1', exclusive: '1' })
        )
      )
    )
  )
)
let xml = assetsToXML(tree)

console.log(xml)
```

## API

## License

MIT
