
#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

class ChunkValidator {
  constructor() {
    this.errors = []
    this.warnings = []
  }

  validateBuildArtifacts() {
    console.log('🔍 Validating build artifacts for chunk consistency...')

    const buildDir = path.join(process.cwd(), '.next')
    if (!fs.existsSync(buildDir)) {
      this.errors.push('Build directory (.next) not found. Run npm run build first.')
      return
    }

    // Check for chunk consistency
    const chunksDir = path.join(buildDir, 'static', 'chunks')
    if (fs.existsSync(chunksDir)) {
      const chunks = fs.readdirSync(chunksDir)
      
      // Check for suspiciously large chunks
      chunks.forEach(chunk => {
        const chunkPath = path.join(chunksDir, chunk)
        const stats = fs.statSync(chunkPath)
        const sizeKB = Math.round(stats.size / 1024)

        if (sizeKB > 200) {
          this.warnings.push(`Large chunk detected: ${chunk} (${sizeKB} KB) - may cause timeout errors`)
        }

        if (sizeKB < 1) {
          this.errors.push(`Corrupted chunk detected: ${chunk} (${sizeKB} KB)`)
        }
      })

      console.log(`✅ Found ${chunks.length} chunks, sizes validated`)
    }

    // Validate manifest files
    const manifestPath = path.join(buildDir, 'build-manifest.json')
    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
        if (!manifest.pages || Object.keys(manifest.pages).length === 0) {
          this.errors.push('Build manifest is corrupted - no pages found')
        }
        console.log('✅ Build manifest validated')
      } catch (error) {
        this.errors.push('Build manifest is corrupted - invalid JSON')
      }
    }
  }

  validateChunkReferences() {
    console.log('🔍 Validating chunk references...')

    const buildDir = path.join(process.cwd(), '.next')
    const pagesDir = path.join(buildDir, 'server', 'pages')
    
    if (fs.existsSync(pagesDir)) {
      // Check for orphaned chunk references
      const pageFiles = this.getAllFiles(pagesDir, '.js')
      
      pageFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8')
          
          // Look for chunk import failures
          if (content.includes('__webpack_require__') && content.includes('undefined')) {
            this.warnings.push(`Potential chunk reference issue in ${path.relative(process.cwd(), file)}`)
          }
        } catch (error) {
          this.warnings.push(`Could not validate chunk references in ${file}`)
        }
      })
    }
  }

  getAllFiles(dir, extension) {
    const files = []
    if (!fs.existsSync(dir)) return files

    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        files.push(...this.getAllFiles(fullPath, extension))
      } else if (file.endsWith(extension)) {
        files.push(fullPath)
      }
    })

    return files
  }

  async run() {
    console.log('🚀 Starting chunk validation...\n')

    this.validateBuildArtifacts()
    this.validateChunkReferences()

    console.log('\n📊 Chunk Validation Results:')

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:')
      this.errors.forEach(error => console.log(`  - ${error}`))
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:')
      this.warnings.forEach(warning => console.log(`  - ${warning}`))
    }

    if (this.errors.length === 0) {
      console.log('\n✅ Chunk validation passed!')
      return true
    } else {
      console.log('\n❌ Chunk validation failed!')
      console.log('\n🛠️  Try running: npm run clean && npm run build')
      process.exit(1)
    }
  }
}

const validator = new ChunkValidator()
validator.run().catch(console.error)
