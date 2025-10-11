const fs = require('fs');

// Common deprecated patterns in Next.js, React, and Node.js
const DEPRECATED_PATTERNS = [
  {
    pattern: /next\/image(?!\/)/g,
    message: 'Use next/image (Image component is deprecated in favor of next/image)',
    severity: 'warning'
  },
  {
    pattern: /getInitialProps/g,
    message: 'getInitialProps is deprecated, use getServerSideProps or getStaticProps',
    severity: 'warning'
  },
  {
    pattern: /componentWillMount|componentWillReceiveProps|componentWillUpdate/g,
    message: 'Legacy lifecycle methods are deprecated, use functional components with hooks',
    severity: 'error'
  },
  {
    pattern: /findDOMNode/g,
    message: 'findDOMNode is deprecated, use refs instead',
    severity: 'warning'
  },
  {
    pattern: /UNSAFE_componentWillMount|UNSAFE_componentWillReceiveProps|UNSAFE_componentWillUpdate/g,
    message: 'UNSAFE_ lifecycle methods should be replaced with modern patterns',
    severity: 'error'
  },
  {
    pattern: /createReactClass/g,
    message: 'createReactClass is deprecated, use ES6 classes or functional components',
    severity: 'warning'
  },
  {
    pattern: /PropTypes\s+from\s+['"]react['"]/g,
    message: 'PropTypes from react is deprecated, use prop-types package or TypeScript',
    severity: 'warning'
  },
  {
    pattern: /String\.prototype\.substr\(/g,
    message: 'substr() is deprecated, use substring() or slice()',
    severity: 'warning'
  },
  {
    pattern: /new Buffer\(/g,
    message: 'new Buffer() is deprecated, use Buffer.from() or Buffer.alloc()',
    severity: 'error'
  },
  {
    pattern: /url\.parse\(/g,
    message: 'url.parse() is deprecated, use new URL() constructor',
    severity: 'warning'
  }
];

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    let foundIssues = [];
    
    DEPRECATED_PATTERNS.forEach(({ pattern, message, severity }) => {
      let match;
      const regex = new RegExp(pattern.source, 'g');
      
      while ((match = regex.exec(content)) !== null) {
        // Find line number
        const beforeMatch = content.substring(0, match.index);
        const lineNum = beforeMatch.split('\n').length;
        
        foundIssues.push({
          line: lineNum,
          message,
          severity,
          code: lines[lineNum - 1]?.trim()
        });
      }
    });
    
    if (foundIssues.length > 0) {
      const errors = foundIssues.filter(i => i.severity === 'error');
      const warnings = foundIssues.filter(i => i.severity === 'warning');
      
      if (errors.length > 0) {
        console.error(`❌ ${filePath}:`);
        errors.forEach(issue => {
          console.error(`   Line ${issue.line}: ${issue.message}`);
          console.error(`   Code: ${issue.code}`);
        });
      }
      
      if (warnings.length > 0) {
        console.warn(`⚠️  ${filePath}:`);
        warnings.forEach(issue => {
          console.warn(`   Line ${issue.line}: ${issue.message}`);
          console.warn(`   Code: ${issue.code}`);
        });
      }
      
      // Only fail on errors, not warnings
      return errors.length === 0;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
    return false;
  }
}

const files = process.argv.slice(2);

if (files.length === 0) {
  console.log('✅ No files to check');
  process.exit(0);
}

const allPassed = files.every(checkFile);

if (allPassed) {
  console.log('✅ No critical deprecated APIs found');
}

process.exit(allPassed ? 0 : 1);