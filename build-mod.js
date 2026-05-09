/**
 * iFlow Mod 打包工具
 * 使用方法: node scripts/build-mod.js [mod-path] [output-path]
 *
 * 示例:
 *   node scripts/build-mod.js                                    # 打包当前目录
 *   node scripts/build-mod.js ./my-mod                          # 打包指定目录
 *   node scripts/build-mod.js ./my-mod ./dist                   # 指定输出目录
 *
 * npm 脚本:
 *   npm run build:mod                   # 打包当前目录
 *   npm run build:mod -- my-mod        # 打包指定目录
 *   npm run build:mod -- my-mod ./dist # 指定输出目录
 */

const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

// 获取命令行参数 (跳过 node 和脚本自身路径)
const args = process.argv.slice(2)
const modPath = path.resolve(args[0] || '.')
const outputPath = path.resolve(args[1] || './dist')

// ANSI 颜色
const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
}

const log = (msg, color = '') => console.log(color ? `${c[color]}${msg}${c.reset}` : msg)
const info = (msg) => log(msg, 'dim')
const ok = (msg) => log(`✓ ${msg}`, 'green')
const fail = (msg) => log(`✗ ${msg}`, 'red')
const header = (msg) => {
  console.log(`\n${c.cyan}${'═'.repeat(48)}${c.reset}`)
  console.log(`${c.cyan} ${msg}${c.reset}`)
  console.log(`${c.cyan}${'═'.repeat(48)}${c.reset}`)
}

// ============================================================
// 主流程
// ============================================================

header('iFlow Mod 打包工具')

// 检查 Mod 目录是否存在
if (!fs.existsSync(modPath)) {
  fail(`找不到 Mod 目录: ${modPath}`)
  log(`请确保 mod.json 和 code.js 存在于指定目录中`, 'yellow')
  process.exit(1)
}

// 检查必需文件
const requiredFiles = ['mod.json', 'code.js']
const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(modPath, file)))

if (missingFiles.length > 0) {
  fail(`缺少必需文件:`)
  missingFiles.forEach(file => log(`  - ${file}`, 'red'))
  process.exit(1)
}

// 读取 mod.json
info('读取 mod.json...')
let modJson
try {
  const content = fs.readFileSync(path.join(modPath, 'mod.json'), 'utf8')
  modJson = JSON.parse(content)
} catch (err) {
  fail(`mod.json 解析失败: ${err.message}`)
  process.exit(1)
}

// 验证必填字段
const requiredFields = ['id', 'name', 'version', 'type']
const missingFields = requiredFields.filter(field => !modJson[field])

if (missingFields.length > 0) {
  fail(`mod.json 缺少必填字段:`)
  missingFields.forEach(field => log(`  - ${field}`, 'red'))
  process.exit(1)
}

const { name: modName, version: modVersion, id: modId, type: modType } = modJson
log(`  名称: ${modName}`)
log(`  版本: ${modVersion}`)
log(`  ID:   ${modId}`)
log(`  类型: ${modType}`)

// 创建输出目录
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true })
  info(`创建输出目录: ${outputPath}`)
}

const outputFile = path.join(outputPath, `${modId}-v${modVersion}.iflow-mod`)
if (fs.existsSync(outputFile)) {
  info(`覆盖已有文件: ${outputFile}`)
}

// 收集文件
const fileList = []
function collectFiles(dir, baseDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.relative(baseDir, fullPath)
    // 跳过 .iflow-mod 和隐藏文件
    if (entry.name.endsWith('.iflow-mod') || entry.name.startsWith('.')) continue
    if (entry.isDirectory()) {
      collectFiles(fullPath, baseDir)
    } else {
      fileList.push({ fullPath, relativePath })
    }
  }
}

collectFiles(modPath, modPath)
info(`找到 ${fileList.length} 个文件`)

// 打包
info('开始打包...')

const output = fs.createWriteStream(outputFile)
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', () => {
  const sizeKB = Math.round(archive.pointer() / 1024 * 100) / 100
  console.log('')
  ok(`打包完成!`)
  log(`  输出: ${outputFile}`, 'dim')
  log(`  大小: ${sizeKB} KB`, 'dim')
  log(`  文件: ${fileList.length}`, 'dim')

  // 验证包内容
  info('验证包内容...')
  try {
    const AdmZip = require('adm-zip')
    const zip = new AdmZip(outputFile)
    const extractedNames = zip.getEntries().map(e => path.basename(e.entryName))
    let valid = true
    for (const file of requiredFiles) {
      const found = extractedNames.includes(file)
      if (found) log(`  ${c.green}✓${c.reset} ${file}`)
      else { log(`  ${c.red}✗${c.reset} ${file} (缺失)`, 'red'); valid = false }
    }
    valid ? ok('包内容验证通过') : fail('包内容验证失败')
  } catch {
    info('跳过验证 (adm-zip 不可用)')
  }

  console.log('')
  log('下一步:')
  console.log(`  1. 打开 iFlow Settings Editor`)
  console.log(`  2. 进入 iFlow Mod 页面`)
  console.log(`  3. 点击「导入 Mod」选择: ${outputFile}`, 'dim')
  console.log('')
})

archive.on('error', (err) => {
  fail(`打包失败: ${err.message}`)
  process.exit(1)
})

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') info(`警告: ${err.message}`)
  else throw err
})

for (const { fullPath, relativePath } of fileList) {
  archive.file(fullPath, { name: relativePath })
}

archive.pipe(output)
archive.finalize()
