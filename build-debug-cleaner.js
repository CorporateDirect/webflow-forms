const fs = require('fs');
const path = require('path');

class DebugCleaner {
    constructor() {
        this.debugPatterns = [
            /console\.(log|warn|info|debug)\([^)]*\);?\s*\n?/g,
            /\/\/ DEBUG:.*\n/g,
            /\/\/ FIXME:.*\n/g,
            /\/\*\s*DEBUG[\s\S]*?\*\//g
        ];
    }

    cleanFile(filePath) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalSize = content.length;
        
        // Remove debug statements
        this.debugPatterns.forEach(pattern => {
            content = content.replace(pattern, '');
        });
        
        // Remove excessive empty lines
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        // Calculate savings
        let newSize = content.length;
        let savings = originalSize - newSize;
        let percentage = ((savings / originalSize) * 100).toFixed(1);
        
        return {
            content,
            originalSize,
            newSize,
            savings,
            percentage
        };
    }

    processDirectory(srcDir, outputDir) {
        const files = fs.readdirSync(srcDir);
        const results = [];
        
        files.forEach(file => {
            if (file.endsWith('.js')) {
                const srcPath = path.join(srcDir, file);
                const outputPath = path.join(outputDir, file.replace('.js', '-clean.js'));
                
                const result = this.cleanFile(srcPath);
                
                // Ensure output directory exists
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
                
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
        console.log('\n📊 Debug Cleanup Report\n');
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
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
    }
}

// Usage
const cleaner = new DebugCleaner();
const results = cleaner.processDirectory('./src', './src-clean');
cleaner.generateReport(results);

module.exports = DebugCleaner; 