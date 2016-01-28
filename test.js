import test from 'tape'
import assetsToXML from './src'
import { parseString } from 'xml2js'
import { context } from 'node-matrix-assets'

test('basic test', (assert) => {
  const asset = context()
  const tree = asset('folder', { name: 'Sites', link: 'type_2', paths: 'sites' },
    asset('site', { name: 'My Site', paths: 'my-site' })
  )
  const xml = assetsToXML(tree)

  parseString(xml, (err, { actions } = {}) => {
    const { action } = actions
    const byType = type => ({ action_type }) => action_type[0] === type
    const tests = {
      create: action.filter(byType('create_asset')),
      setAttribute: action.filter(byType('set_attribute_value')),
      setPath: action.filter(byType('add_web_path')),
      setPermission: action.filter(byType('set_permission'))
    }
    assert.error(err)
    assert.equal(tests.create.length, 2, 'two create_asset tests created')
    assert.deepEquals(tests.create.map(({ type_code }) => type_code[0]), ['folder', 'site'], 'correct assets created')
    assert.deepEquals(new Set(tests.setAttribute.map(({ attribute }) => attribute[0])), new Set(['short_name', 'name']), 'correct asset attributes set')
    assert.deepEquals(tests.setPath.map(({ path }) => path[0]), ['sites', 'my-site'], 'correct paths set')
    assert.equal(tests.setPermission.length, 2, 'correct permissions set')
    assert.end()
  })
})
