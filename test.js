import test from 'tape'
import assetsToXML from './src'
import { parseString } from 'xml2js'
import { context } from 'node-matrix-assets'

test('basic test', (assert) => {
  let asset = context()
  let tree = asset('folder', { name: 'Sites', link: 'type_2', paths: 'sites' }, asset('site', { name: 'My Site', paths: 'my-site' }))
  let xml = assetsToXML(tree)

  parseString(xml, (err, { actions } = {}) => {
    let { action } = actions
    let createActions = action.filter(({ action_type }) => action_type[0] === 'create_asset')
    let setAtrrributeActionss = action.filter(({ action_type }) => action_type[0] === 'set_attribute_value')
    let setPathActions = action.filter(({ action_type }) => action_type[0] === 'add_web_path')
    let permissionActions = action.filter(({ action_type }) => action_type[0] === 'set_permission')
    assert.error(err)
    assert.equal(createActions.length, 2, 'two create_asset actions created')
    assert.deepEquals(createActions.map(({ type_code }) => type_code[0]), ['folder', 'site'], 'correct assets created')
    assert.deepEquals(new Set(setAtrrributeActionss.map(({ attribute }) => attribute[0])), new Set(['short_name', 'name']), 'correct asset attributes set')
    assert.deepEquals(setPathActions.map(({ path }) => path[0]), ['sites', 'my-site'], 'correct paths set')
    assert.equal(permissionActions.length, 2, 'correct permissions set')
    assert.end()
  })
})
