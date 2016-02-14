import test from 'tape'
import assetsToXML from './src'
import { parseString } from 'xml2js'
import Importer from 'node-matrix-importer'
import { context } from 'node-matrix-assets'

const asset = context()
const tree = asset('folder', { name: 'Sites', link: 'type_2', paths: 'sites' },
  asset('site', { name: 'My Site', paths: 'my-site' })
)

const xmlTests = (assert) => {
  return (err, { actions: { action: actions } } = { actions: [] }) => {
    const getValue = prop => ({ [ prop ]: [ value ] }) => value
    const byType = test => ({ action_type: [ type ] }) => type === test
    const tests = {
      create: actions.filter(byType('create_asset')),
      setAttribute: actions.filter(byType('set_attribute_value')),
      setPath: actions.filter(byType('add_web_path')),
      setPermission: actions.filter(byType('set_permission'))
    }
    assert.error(err)
    assert.equal(tests.create.length, 2, 'two create_asset tests created')
    assert.deepEquals(tests.create.map(getValue('type_code')), ['folder', 'site'], 'correct assets created')
    assert.deepEquals(new Set(tests.setAttribute.map(getValue('attribute'))), new Set(['short_name', 'name']), 'correct asset attributes set')
    assert.deepEquals(tests.setPath.map(getValue('path')), ['sites', 'Sites', 'my-site', 'My-Site'], 'correct paths set')
    assert.equal(tests.setPermission.length, 2, 'correct permissions set')
    assert.end()
  }
}

test('basic test', (assert) => {
  const xml = assetsToXML(tree)
  parseString(xml, xmlTests(assert))
})

test('custom Importer instance', (assert) => {
  const xmlImporter = new Importer({
    sortActions: true
  })
  const generateXML = assetsToXML(xmlImporter)
  const xml = generateXML(tree)
  parseString(xml, xmlTests(assert))
})
