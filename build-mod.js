const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

async function buildMod(modPath, outputPath = './dist') {
  try {
    console.log('开始打包 Mod...');

    // 验证必需文件
    const modJsonPath = path.join(modPath, 'mod.json');
    const codeJsPath = path.join(modPath, 'code.js');

    if (!fs.existsSync(modJsonPath)) {
      throw new Error('缺少 mod.json 文件');
    }
    if (!fs.existsSync(codeJsPath)) {
      throw new Error('缺少 code.js 文件');
    }

    // 读取 mod.json
    const modJson = JSON.parse(fs.readFileSync(modJsonPath, 'utf-8'));

    // 生成输出文件名
    const outputFile = `${modJson.id}-v${modJson.version}.iflow-mod`;
    const outputPathFull = path.join(outputPath, outputFile);

    // 创建输出目录
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // 创建 zip 压缩包
    const output = fs.createWriteStream(outputPathFull);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`✓ 打包完成: ${outputPathFull}`);
      console.log(`  文件大小: ${(fs.statSync(outputPathFull).size / 1024).toFixed(2)} KB`);
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);

    // 添加文件（排除 .iflow-mod 和隐藏文件）
    const files = fs.readdirSync(modPath);
    files.forEach(file => {
      if (!file.startsWith('.') && !file.endsWith('.iflow-mod')) {
        const filePath = path.join(modPath, file);
        if (fs.statSync(filePath).isFile()) {
          archive.file(filePath, { name: file });
        }
      }
    });

    archive.finalize();
  } catch (error) {
    console.error('打包失败:', error.message);
    process.exit(1);
  }
}

// 使用示例
if (require.main === module) {
  const modPath = process.argv[2] || '.';
  const outputPath = process.argv[3] || './dist';
  buildMod(modPath, outputPath);
}

module.exports = buildMod;
