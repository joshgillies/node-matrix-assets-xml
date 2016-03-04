import test from 'tape'
import assetsToXML from './src'
import { parseString } from 'xml2js'
import Importer from 'node-matrix-importer'
import { context } from 'node-matrix-assets'

const asset = context()
const tree = asset('folder', { name: 'Sites', link: 'type_2', paths: 'sites' },
  asset('site', { name: 'My Site', paths: 'my-site' })
)

const getValue = (prop) => ({ [ prop ]: [ value ] }) => value
const byType = (test) => ({ action_type: [ type ] }) => type === test
const noop = () => {}

const xmlTests = (assert, pre = noop, post = noop) =>
  (err, { actions: { action: actions } } = { actions: [] }) => {
    const tests = {
      create: actions.filter(byType('create_asset')),
      setAttribute: actions.filter(byType('set_attribute_value')),
      setPath: actions.filter(byType('add_web_path')),
      setPermission: actions.filter(byType('set_permission'))
    }
    assert.error(err, 'shouldn\'t error')
    pre(actions)
    assert.equal(tests.create.length, 2, 'two create_asset tests created')
    assert.deepEquals(tests.create.map(getValue('type_code')), ['folder', 'site'], 'correct assets created')
    assert.deepEquals(new Set(tests.setAttribute.map(getValue('attribute'))), new Set(['short_name', 'name']), 'correct asset attributes set')
    assert.deepEquals(tests.setPath.map(getValue('path')), ['sites', 'Sites', 'my-site', 'My-Site'], 'correct paths set')
    assert.equal(tests.setPermission.length, 2, 'correct permissions set')
    post(actions)
  }

test('basic test', (assert) => {
  const xml = assetsToXML(tree)
  parseString(xml, xmlTests(assert))
  assert.end()
})

test('custom parent root node', (assert) => {
  const xml = assetsToXML(tree, 1337)
  parseString(xml, xmlTests(assert, ([ action ]) => {
    assert.equal(getValue('parentid')(action), '1337', 'custom parent root node set')
  }))
  assert.end()
})

test('custom Importer instance', (assert) => {
  const xmlImporter = new Importer({
    sortActions: true
  })

  xmlImporter.once('create_asset', (asset) => {
    assert.ok(asset, 'xml importer event triggered')
  })

  const generateXML = assetsToXML(xmlImporter)
  const xml = generateXML(tree)

  parseString(xml, xmlTests(assert))
  assert.end()
})
