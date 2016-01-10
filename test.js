import test from 'tape'
import assetsToXML from './src'
import { parseString } from 'xml2js'
import { context } from 'node-matrix-assets'

test('basic test', (assert) => {
  let asset = context()
  let tree = asset('folder', { link: 'type_2' }, asset('site'))
  let xml = assetsToXML(tree)

  parseString(xml, (err, { actions } = {}) => {
    let { action } = actions
    let createActions = action.filter(({ action_type }) => action_type[0] === 'create_asset')
    let permissionActions = action.filter(({ action_type }) => action_type[0] === 'set_permission')
    assert.error(err)
    assert.equal(createActions.length, 2, 'two create_asset actions created')
    assert.deepEquals(createActions.map(({ type_code }) => type_code[0]), ['folder', 'site'], 'correct assets created')
    assert.equal(permissionActions.length, 2, 'two set_permission actions created')
    assert.end()
  })
})
