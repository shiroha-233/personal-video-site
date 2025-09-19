#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 数据文件路径
const dataPath = path.join(__dirname, 'src', 'data', 'videos.json');
const backupPath = path.join(__dirname, 'backup', `videos-backup-${Date.now()}.json`);

// 确保备份目录存在
const backupDir = path.dirname(backupPath);
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

function showHelp() {
    console.log(`
📹 视频数据管理工具

使用方法:
  node sync-data.js [命令] [文件路径]

命令:
  backup              备份当前数据
  restore <文件>      从文件恢复数据
  update <文件>       用新文件更新数据（会自动备份）
  show                显示当前数据概览
  help                显示此帮助信息

示例:
  node sync-data.js backup
  node sync-data.js update ./downloads/videos.json
  node sync-data.js show
`);
}

function backupData() {
    try {
        if (fs.existsSync(dataPath)) {
            fs.copyFileSync(dataPath, backupPath);
            console.log(`✅ 数据已备份到: ${backupPath}`);
        } else {
            console.log('❌ 数据文件不存在');
        }
    } catch (error) {
        console.error('❌ 备份失败:', error.message);
    }
}

function updateData(newFilePath) {
    try {
        if (!fs.existsSync(newFilePath)) {
            console.log('❌ 新数据文件不存在:', newFilePath);
            return;
        }

        // 验证JSON格式
        const newData = JSON.parse(fs.readFileSync(newFilePath, 'utf8'));
        if (!Array.isArray(newData)) {
            console.log('❌ 数据格式错误: 应该是视频对象数组');
            return;
        }

        // 备份现有数据
        if (fs.existsSync(dataPath)) {
            backupData();
        }

        // 更新数据
        fs.copyFileSync(newFilePath, dataPath);
        console.log(`✅ 数据已更新，共 ${newData.length} 个视频`);
        
        showDataOverview();
        
    } catch (error) {
        console.error('❌ 更新失败:', error.message);
    }
}

function showDataOverview() {
    try {
        if (!fs.existsSync(dataPath)) {
            console.log('❌ 数据文件不存在');
            return;
        }

        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        
        console.log('\n📊 数据概览:');
        console.log(`📹 视频总数: ${data.length}`);
        
        if (data.length > 0) {
            const allTags = data.flatMap(v => v.tags || []);
            const uniqueTags = [...new Set(allTags)];
            
            console.log(`🏷️  标签总数: ${uniqueTags.length}`);
            console.log(`🏷️  常用标签: ${uniqueTags.slice(0, 5).join(', ')}`);
            
            console.log('\n最近的视频:');
            data.slice(-3).forEach(video => {
                console.log(`  • ${video.title} (${video.publishDate})`);
            });
        }
        
    } catch (error) {
        console.error('❌ 读取数据失败:', error.message);
    }
}

// 主程序
const command = process.argv[2];
const filePath = process.argv[3];

switch (command) {
    case 'backup':
        backupData();
        break;
        
    case 'update':
        if (!filePath) {
            console.log('❌ 请指定新数据文件路径');
            console.log('示例: node sync-data.js update ./downloads/videos.json');
        } else {
            updateData(filePath);
        }
        break;
        
    case 'restore':
        if (!filePath) {
            console.log('❌ 请指定备份文件路径');
        } else {
            updateData(filePath);
        }
        break;
        
    case 'show':
        showDataOverview();
        break;
        
    case 'help':
    default:
        showHelp();
        break;
}