#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class ProductionOptimizer {
    constructor() {
        this.patterns = [
            // Console statements
            /console\.(log|warn|info|debug|error)\([^)]*\);?\s*\n?/g,
            // Debug comments
            /\/\/ DEBUG:.*\n/g,
            /\/\/ FIXME:.*\n/g,
            /\/\*\s*DEBUG[\s\S]*?\*\//g,
            // Excessive debugging
            /console\.log\(`🔍.*?\n/g,
            /console\.log\(`✅.*?\n/g,
            /console\.log\(`❌.*?\n/g,
            /console\.log\(`⚠️.*?\n/g,
            // Multiple empty lines
            /\n\s*\n\s*\n/g,
        ];
    }

    optimizeFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const originalSize = content.length;
        
        let optimized = content;
        
        // Apply all optimization patterns
        this.patterns.forEach(pattern => {
            if (pattern === /\n\s*\n\s*\n/g) {
                optimized = optimized.replace(pattern, '\n\n');
            } else {
                optimized = optimized.replace(pattern, '');
            }
        });
        
        // Remove trailing whitespace
        optimized = optimized.replace(/[ \t]+$/gm, '');
        
        const newSize = optimized.length;
        const savings = originalSize - newSize;
        const percentage = ((savings / originalSize) * 100).toFixed(1);
        
        return {
            content: optimized,
            originalSize,
            newSize,
            savings,
            percentage
        };
    }

    processDirectory(inputDir, outputDir) {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const files = fs.readdirSync(inputDir);
        const results = [];
        
        files.forEach(file => {
            if (file.endsWith('.js')) {
                const inputPath = path.join(inputDir, file);
                const outputPath = path.join(outputDir, file.replace('.js', '-production.js'));
                
                const result = this.optimizeFile(inputPath);
                fs.writeFileSync(outputPath, result.content);
                
                results.push({
                    file,
                    ...result
                });
            }
        });
        
        return results;
    }

    generateReport(results) {
        console.log('\n🚀 Production Optimization Report\n');
        console.log('File                    | Original | New     | Saved   | %');
        console.log('------------------------|----------|---------|---------|------');
        
        let totalOriginal = 0;
        let totalNew = 0;
        
        results.forEach(result => {
            totalOriginal += result.originalSize;
            totalNew += result.newSize;
            
            console.log(
                `${result.file.padEnd(23)} | ${this.formatBytes(result.originalSize).padEnd(8)} | ${this.formatBytes(result.newSize).padEnd(7)} | ${this.formatBytes(result.savings).padEnd(7)} | ${result.percentage}%`
            );
        });
        
        const totalSavings = totalOriginal - totalNew;
        const totalPercentage = ((totalSavings / totalOriginal) * 100).toFixed(1);
        
        console.log('------------------------|----------|---------|---------|------');
        console.log(`${'TOTAL'.padEnd(23)} | ${this.formatBytes(totalOriginal).padEnd(8)} | ${this.formatBytes(totalNew).padEnd(7)} | ${this.formatBytes(totalSavings).padEnd(7)} | ${totalPercentage}%`);
        
        console.log(`\n✨ Production files saved to: src-production/`);
        console.log(`📦 Total size reduction: ${this.formatBytes(totalSavings)} (${totalPercentage}%)`);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
    }
}

// Run the optimizer
const optimizer = new ProductionOptimizer();
const results = optimizer.processDirectory('./src', './src-production');
optimizer.generateReport(results);

console.log('\n🔧 Next steps:');
console.log('1. Review the optimized files in src-production/');
console.log('2. Update webpack.config.js to use production files');
console.log('3. Run: npm run build');
console.log('4. Test the optimized builds');

module.exports = ProductionOptimizer; 