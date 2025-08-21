
#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

class ComponentDiagnostic {
  constructor() {
    this.errors = []
    this.warnings = []
    this.components = new Map()
  }

  scanComponents() {
    console.log('🔍 Scanning components for import/export issues...')

    const componentDirs = ['components', 'app', 'lib']
    const files = this.getAllFiles(componentDirs, ['.tsx', '.ts'])

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8')
        this.analyzeFile(file, content)
      } catch (error) {
        this.errors.push(`Could not read ${file}: ${error.message}`)
      }
    })
  }

  analyzeFile(filePath, content) {
    const relativePath = path.relative(process.cwd(), filePath)
    
    // Extract exports
    const exports = this.extractExports(content)
    const imports = this.extractImports(content)
    
    this.components.set(relativePath, { exports, imports })
    
    // Check for common issues
    this.checkExportConsistency(relativePath, content, exports)
    this.checkImportPaths(relativePath, imports)
  }

  extractExports(content) {
    const exports = {
      default: null,
      named: []
    }

    // Default exports
    const defaultExportPatterns = [
      /export\s+default\s+(?:function\s+)?(\w+)/g,
      /export\s*{\s*(\w+)\s+as\s+default\s*}/g
    ]

    defaultExportPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)]
      matches.forEach(match => {
        exports.default = match[1]
      })
    })

    // Named exports
    const namedExportPatterns = [
      /export\s+(?:const|let|var|function|class)\s+(\w+)/g,
      /export\s*{\s*([^}]+)\s*}/g
    ]

    namedExportPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)]
      matches.forEach(match => {
        if (pattern.source.includes('{')) {
          // Parse export list
          const exportList = match[1].split(',').map(e => e.trim().split(' as ')[0].trim())
          exports.named.push(...exportList)
        } else {
          exports.named.push(match[1])
        }
      })
    })

    return exports
  }

  extractImports(content) {
    const imports = []
    const importPattern = /import\s+(?:(\w+)|{\s*([^}]+)\s*}|\*\s+as\s+(\w+))\s+from\s+['"]([^'"]+)['"]/g

    const matches = [...content.matchAll(importPattern)]
    matches.forEach(match => {
      const [, defaultImport, namedImports, namespaceImport, source] = match
      
      imports.push({
        default: defaultImport || null,
        named: namedImports ? namedImports.split(',').map(i => i.trim()) : [],
        namespace: namespaceImport || null,
        source: source
      })
    })

    return imports
  }

  checkExportConsistency(filePath, content, exports) {
    // Check if component has both default and named exports of same name
    if (exports.default && exports.named.includes(exports.default)) {
      this.warnings.push(`${filePath}: Component exported as both default and named export`)
    }

    // Check if React component follows naming conventions
    if (filePath.endsWith('.tsx') && !exports.default && exports.named.length === 0) {
      this.errors.push(`${filePath}: React component file has no exports`)
    }

    // Check for missing 'use client' directive in client components
    if (content.includes('useState') || content.includes('useEffect') || content.includes('dynamic')) {
      if (!content.includes("'use client'") && !content.includes('"use client"')) {
        this.warnings.push(`${filePath}: Missing 'use client' directive for client component`)
      }
    }
  }

  checkImportPaths(filePath, imports) {
    imports.forEach(imp => {
      // Check for relative import paths
      if (imp.source.startsWith('./') || imp.source.startsWith('../')) {
        const resolvedPath = path.resolve(path.dirname(filePath), imp.source)
        const possibleFiles = [
          resolvedPath + '.ts',
          resolvedPath + '.tsx',
          resolvedPath + '/index.ts',
          resolvedPath + '/index.tsx'
        ]

        const exists = possibleFiles.some(file => fs.existsSync(file))
        if (!exists) {
          this.errors.push(`${filePath}: Cannot resolve import "${imp.source}"`)
        }
      }

      // Check for @ alias imports
      if (imp.source.startsWith('@/')) {
        const aliasPath = imp.source.replace('@/', '')
        const resolvedPath = path.join(process.cwd(), aliasPath)
        const possibleFiles = [
          resolvedPath + '.ts',
          resolvedPath + '.tsx',
          resolvedPath + '/index.ts',
          resolvedPath + '/index.tsx'
        ]

        const exists = possibleFiles.some(file => fs.existsSync(file))
        if (!exists) {
          this.errors.push(`${filePath}: Cannot resolve alias import "${imp.source}"`)
        }
      }
    })
  }

  validateCrossReferences() {
    console.log('🔍 Validating cross-references...')

    this.components.forEach((componentData, filePath) => {
      componentData.imports.forEach(imp => {
        if (imp.source.startsWith('@/components/') || imp.source.startsWith('./') || imp.source.startsWith('../')) {
          // Find the target component
          const targetFile = this.resolveImportPath(filePath, imp.source)
          const targetComponent = this.components.get(targetFile)

          if (targetComponent) {
            // Check if imported items exist in target
            if (imp.default && !targetComponent.exports.default) {
              this.errors.push(`${filePath}: Importing default from "${imp.source}" but no default export found`)
            }

            imp.named.forEach(namedImport => {
              if (!targetComponent.exports.named.includes(namedImport) && namedImport !== targetComponent.exports.default) {
                this.errors.push(`${filePath}: Importing "${namedImport}" from "${imp.source}" but export not found`)
              }
            })
          }
        }
      })
    })
  }

  resolveImportPath(fromFile, importPath) {
    if (importPath.startsWith('@/')) {
      return importPath.replace('@/', '')
    }
    
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const resolved = path.resolve(path.dirname(fromFile), importPath)
      return path.relative(process.cwd(), resolved)
    }

    return importPath
  }

  getAllFiles(directories, extensions) {
    const files = []

    directories.forEach(dir => {
      if (fs.existsSync(dir)) {
        const dirFiles = this.scanDirectory(dir, extensions)
        files.push(...dirFiles)
      }
    })

    return files
  }

  scanDirectory(directory, extensions) {
    const files = []

    try {
      const items = fs.readdirSync(directory)

      items.forEach(item => {
        const fullPath = path.join(directory, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          files.push(...this.scanDirectory(fullPath, extensions))
        } else if (stat.isFile()) {
          const ext = path.extname(fullPath)
          if (extensions.includes(ext)) {
            files.push(fullPath)
          }
        }
      })
    } catch (error) {
      console.log(`Could not scan directory ${directory}: ${error.message}`)
    }

    return files
  }

  generateFixSuggestions() {
    console.log('\n🛠️  Fix Suggestions:')

    // Group errors by type
    const importErrors = this.errors.filter(e => e.includes('Cannot resolve') || e.includes('export not found'))
    const exportErrors = this.errors.filter(e => e.includes('no exports'))
    const clientErrors = this.warnings.filter(w => w.includes('use client'))

    if (importErrors.length > 0) {
      console.log('\n❌ Import/Export Mismatches:')
      importErrors.forEach(error => console.log(`  - ${error}`))
      console.log('\n💡 Fixes:')
      console.log('  1. Check if imported component is exported correctly')
      console.log('  2. Verify import path is correct (case-sensitive)')
      console.log('  3. Ensure file extensions match (.ts vs .tsx)')
    }

    if (exportErrors.length > 0) {
      console.log('\n❌ Missing Exports:')
      exportErrors.forEach(error => console.log(`  - ${error}`))
      console.log('\n💡 Fixes:')
      console.log('  1. Add "export default" for React components')
      console.log('  2. Add "export" for utility functions')
    }

    if (clientErrors.length > 0) {
      console.log('\n⚠️  Client Component Issues:')
      clientErrors.forEach(warning => console.log(`  - ${warning}`))
      console.log('\n💡 Fixes:')
      console.log('  1. Add "use client" directive at top of file')
      console.log('  2. Move client-only code to separate components')
    }
  }

  async run() {
    console.log('🚀 Starting component diagnostic...\n')

    this.scanComponents()
    this.validateCrossReferences()

    console.log('\n📊 Diagnostic Results:')
    console.log(`Found ${this.components.size} components`)

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:')
      this.errors.forEach(error => console.log(`  - ${error}`))
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:')
      this.warnings.forEach(warning => console.log(`  - ${warning}`))
    }

    this.generateFixSuggestions()

    if (this.errors.length === 0) {
      console.log('\n✅ Component diagnostic passed!')
      return true
    } else {
      console.log('\n❌ Component diagnostic failed!')
      return false
    }
  }
}

const diagnostic = new ComponentDiagnostic()
diagnostic.run().catch(console.error)
