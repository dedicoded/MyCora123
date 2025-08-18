const fs = require("fs")
const path = require("path")

class PerformanceAuditor {
  constructor() {
    this.issues = []
    this.recommendations = []
  }

  auditBundleSize() {
    console.log("🔍 Auditing bundle size...")

    const buildDir = path.join(process.cwd(), ".next")
    if (!fs.existsSync(buildDir)) {
      this.issues.push("Build directory not found. Run npm run build first.")
      return
    }

    // Check for large chunks
    const chunksDir = path.join(buildDir, "static", "chunks")
    if (fs.existsSync(chunksDir)) {
      const chunks = fs.readdirSync(chunksDir)
      chunks.forEach((chunk) => {
        const chunkPath = path.join(chunksDir, chunk)
        const stats = fs.statSync(chunkPath)
        const sizeKB = Math.round(stats.size / 1024)

        if (sizeKB > 50) {
          this.issues.push(`Large chunk detected: ${chunk} (${sizeKB} KB)`)
          this.recommendations.push(`Consider code splitting for ${chunk}`)
        }
      })
    }
  }

  auditAPIRoutes() {
    console.log("🔍 Auditing API routes...")

    const apiDir = path.join(process.cwd(), "app", "api")
    if (fs.existsSync(apiDir)) {
      this.checkAPIRoute(path.join(apiDir, "verify-license", "route.ts"))
      this.checkAPIRoute(path.join(apiDir, "whitelist", "route.ts"))
    }
  }

  checkAPIRoute(routePath) {
    if (fs.existsSync(routePath)) {
      const content = fs.readFileSync(routePath, "utf8")
      if (content.length < 100) {
        this.issues.push(`Minimal API route: ${path.basename(path.dirname(routePath))}`)
        this.recommendations.push(`Verify ${path.basename(path.dirname(routePath))} route has proper implementation`)
      }
    } else {
      this.issues.push(`Missing API route: ${path.basename(path.dirname(routePath))}`)
    }
  }

  auditConsoleHygiene() {
    console.log("🔍 Auditing console hygiene...")

    // Check for console.log statements in production code
    const srcDirs = ["app", "components", "lib"]
    srcDirs.forEach((dir) => {
      const dirPath = path.join(process.cwd(), dir)
      if (fs.existsSync(dirPath)) {
        this.scanForConsoleStatements(dirPath)
      }
    })
  }

  scanForConsoleStatements(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true })
    files.forEach((file) => {
      const filePath = path.join(dir, file.name)
      if (file.isDirectory()) {
        this.scanForConsoleStatements(filePath)
      } else if (file.name.endsWith(".ts") || file.name.endsWith(".tsx")) {
        const content = fs.readFileSync(filePath, "utf8")
        const consoleMatches = content.match(/console\.(log|warn|error|debug)/g)
        if (consoleMatches && consoleMatches.length > 0) {
          // Allow [v0] debug statements but flag others
          const nonDebugConsole = content.match(/console\.(log|warn|error|debug)(?!\("\[v0\])/g)
          if (nonDebugConsole && nonDebugConsole.length > 0) {
            this.issues.push(`Console statements found in ${filePath.replace(process.cwd(), "")}`)
            this.recommendations.push(`Remove or replace console statements in production code`)
          }
        }
      }
    })
  }

  generateReport() {
    console.log("\n📊 Performance Audit Report")
    console.log("=".repeat(50))

    if (this.issues.length === 0) {
      console.log("✅ No performance issues detected!")
    } else {
      console.log(`❌ Found ${this.issues.length} issues:`)
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`)
      })
    }

    if (this.recommendations.length > 0) {
      console.log("\n💡 Recommendations:")
      this.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`)
      })
    }

    console.log("\n🚀 Next Steps:")
    console.log('- Run "npm run analyze" to visualize bundle composition')
    console.log('- Run "npm run size-check" to monitor bundle size limits')
    console.log("- Use dynamic imports for heavy components")
    console.log("- Consider replacing heavy dependencies (moment.js, lodash)")
  }

  run() {
    console.log("🔧 Starting MyCora Performance Audit...\n")
    this.auditBundleSize()
    this.auditAPIRoutes()
    this.auditConsoleHygiene()
    this.generateReport()
  }
}

const auditor = new PerformanceAuditor()
auditor.run()
