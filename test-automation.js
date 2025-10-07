#!/usr/bin/env node

/**
 * 自动化测试脚本
 * 用于避免AI助手"手动验证"的问题
 */

const { spawn } = require('child_process');
const path = require('path');

class TestAutomation {
  constructor() {
    this.projectRoot = __dirname;
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runTest(name, command, args = [], cwd = this.projectRoot) {
    console.log(`\n🧪 运行测试: ${name}`);
    console.log(`📁 工作目录: ${cwd}`);
    console.log(`⚡ 命令: ${command} ${args.join(' ')}`);
    
    return new Promise((resolve) => {
      const child = spawn(command, args, { 
        cwd, 
        stdio: 'pipe',
        shell: true 
      });
      
      let output = '';
      let errorOutput = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
        process.stdout.write(data);
      });
      
      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
        process.stderr.write(data);
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${name} - 通过`);
          this.results.passed++;
        } else {
          console.log(`❌ ${name} - 失败 (退出码: ${code})`);
          this.results.failed++;
          this.results.errors.push({
            test: name,
            code,
            error: errorOutput
          });
        }
        resolve({ code, output, error: errorOutput });
      });
    });
  }

  async runFrontendTests() {
    console.log('\n🚀 开始前端测试...');
    
    // 检查前端项目是否存在
    const frontendPath = path.join(this.projectRoot, 'teable-ui');
    
    try {
      await this.runTest(
        '前端构建测试',
        'npm', ['run', 'build'],
        frontendPath
      );
    } catch (error) {
      console.log('⚠️  前端构建测试跳过 (项目不存在或未配置)');
    }
  }

  async runBackendTests() {
    console.log('\n🚀 开始后端测试...');
    
    const backendPath = path.join(this.projectRoot, 'server');
    
    try {
      // 运行Go测试
      await this.runTest(
        'Go单元测试',
        'go', ['test', './internal/domain/...', '-v'],
        backendPath
      );
    } catch (error) {
      console.log('⚠️  Go测试跳过 (Go环境未配置)');
    }
  }

  async runPackageTests() {
    console.log('\n🚀 开始包测试...');
    
    const packagePath = path.join(this.projectRoot, 'packages', 'grid-table-kanban');
    
    try {
      await this.runTest(
        'Grid Table Kanban 构建测试',
        'npm', ['run', 'build'],
        packagePath
      );
    } catch (error) {
      console.log('⚠️  Grid Table Kanban 测试跳过');
    }
  }

  async runAllTests() {
    console.log('🎯 开始自动化测试流程...');
    console.log('📅 时间:', new Date().toLocaleString());
    
    await this.runFrontendTests();
    await this.runBackendTests();
    await this.runPackageTests();
    
    this.printResults();
  }

  printResults() {
    console.log('\n📊 测试结果汇总:');
    console.log('================');
    console.log(`✅ 通过: ${this.results.passed}`);
    console.log(`❌ 失败: ${this.results.failed}`);
    console.log(`📈 总计: ${this.results.passed + this.results.failed}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ 错误详情:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.test}: ${error.error}`);
      });
    }
    
    console.log('\n🎉 测试完成!');
    
    if (this.results.failed === 0) {
      console.log('✨ 所有测试都通过了!');
    } else {
      console.log('⚠️  有测试失败，请检查错误详情');
    }
  }
}

// 运行测试
if (require.main === module) {
  const automation = new TestAutomation();
  automation.runAllTests().catch(console.error);
}

module.exports = TestAutomation;
