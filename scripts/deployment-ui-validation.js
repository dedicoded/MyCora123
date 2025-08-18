const fs = require("fs")
const path = require("path")

class DeploymentUIValidator {
  constructor() {
    this.issues = []
    this.warnings = []
    this.passed = []
  }

  async validateDeployment() {
    console.log("🔍 Starting MyCora UI Deployment Validation...\n")

    await this.checkCaseSensitivity()
    await this.validateAssets()
    await this.checkEnvironmentVariables()
    await this.validateTailwindConfig()
    await this.checkResponsiveDesign()
    await this.validateImports()

    this.generateReport()
  }

  async checkCaseSensitivity() {
    console.log("📁 Checking file name case sensitivity...")

    const componentsDir = "components"
    const appDir = "app"

    try {
      // Check components directory
      if (fs.existsSync(componentsDir)) {
        const files = this.getAllFiles(componentsDir)
        const duplicates = this.findCaseInsensitiveDuplicates(files)

        if (duplicates.length > 0) {
          this.issues.push(`Case sensitivity issues found: ${duplicates.join(", ")}`)
        } else {
          this.passed.push("✅ No case sensitivity issues in components")
        }
      }

      // Check app directory
      if (fs.existsSync(appDir)) {
        const files = this.getAllFiles(appDir)
        const duplicates = this.findCaseInsensitiveDuplicates(files)

        if (duplicates.length > 0) {
          this.issues.push(`Case sensitivity issues found in app: ${duplicates.join(", ")}`)
        } else {
          this.passed.push("✅ No case sensitivity issues in app directory")
        }
      }
    } catch (error) {
      this.warnings.push(`Could not validate case sensitivity: ${error.message}`)
    }
  }

  async validateAssets() {
    console.log("🖼️ Validating assets and imports...")

    const assetPaths = ["public/images", "public/icons", "public/fonts", "app/globals.css"]

    for (const assetPath of assetPaths) {
      if (fs.existsSync(assetPath)) {
        this.passed.push(`✅ Asset path exists: ${assetPath}`)
      } else {
        this.warnings.push(`Asset path missing: ${assetPath}`)
      }
    }

    // Check for common asset references
    const files = this.getAllFiles("app")
    for (const file of files) {
      if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        const content = fs.readFileSync(file, "utf8")

        // Check for placeholder images
        if (content.includes("/placeholder.svg")) {
          this.passed.push(`✅ Using placeholder images correctly in ${file}`)
        }

        // Check for hardcoded asset paths
        const hardcodedPaths = content.match(/src=["'][^"']*\.(png|jpg|jpeg|gif|svg)["']/g)
        if (hardcodedPaths) {
          this.warnings.push(`Hardcoded asset paths found in ${file}: ${hardcodedPaths.join(", ")}`)
        }
      }
    }
  }

  async checkEnvironmentVariables() {
    console.log("🔧 Checking environment variables...")

    const envExample = ".env.example"
    const requiredEnvVars = [
      "NEXT_PUBLIC_NETWORK",
      "SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ]

    if (fs.existsSync(envExample)) {
      const envContent = fs.readFileSync(envExample, "utf8")

      for (const envVar of requiredEnvVars) {
        if (envContent.includes(envVar)) {
          this.passed.push(`✅ Environment variable defined: ${envVar}`)
        } else {
          this.issues.push(`Missing environment variable: ${envVar}`)
        }
      }
    } else {
      this.issues.push("Missing .env.example file")
    }
  }

  async validateTailwindConfig() {
    console.log("🎨 Validating Tailwind CSS configuration...")

    const globalsCSS = "app/globals.css"

    if (fs.existsSync(globalsCSS)) {
      const cssContent = fs.readFileSync(globalsCSS, "utf8")

      if (cssContent.includes("@import 'tailwindcss'")) {
        this.passed.push("✅ Tailwind CSS v4 properly imported")
      } else if (cssContent.includes("@tailwind")) {
        this.passed.push("✅ Tailwind CSS v3 properly imported")
      } else {
        this.warnings.push("Tailwind CSS import not found in globals.css")
      }

      // Check for custom theme configuration
      if (cssContent.includes("@theme")) {
        this.passed.push("✅ Custom theme configuration found")
      }
    } else {
      this.issues.push("Missing app/globals.css file")
    }
  }

  async checkResponsiveDesign() {
    console.log("📱 Checking responsive design patterns...")

    const files = this.getAllFiles("components")
    let responsivePatterns = 0

    for (const file of files) {
      if (file.endsWith(".tsx")) {
        const content = fs.readFileSync(file, "utf8")

        // Check for responsive classes
        const responsiveClasses = content.match(/(sm:|md:|lg:|xl:|2xl:)/g)
        if (responsiveClasses) {
          responsivePatterns += responsiveClasses.length
        }
      }
    }

    if (responsivePatterns > 0) {
      this.passed.push(`✅ Found ${responsivePatterns} responsive design patterns`)
    } else {
      this.warnings.push("No responsive design patterns found")
    }
  }

  async validateImports() {
    console.log("📦 Validating import statements...")

    const files = this.getAllFiles("app")

    for (const file of files) {
      if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        const content = fs.readFileSync(file, "utf8")
        const imports = content.match(/import.*from\s+['"]([^'"]+)['"]/g)

        if (imports) {
          for (const importStatement of imports) {
            const match = importStatement.match(/from\s+['"]([^'"]+)['"]/)
            if (match) {
              const importPath = match[1]

              // Check for relative imports
              if (importPath.startsWith("./") || importPath.startsWith("../")) {
                const resolvedPath = path.resolve(path.dirname(file), importPath)

                // Check if file exists (with common extensions)
                const extensions = [".ts", ".tsx", ".js", ".jsx"]
                let exists = false

                for (const ext of extensions) {
                  if (fs.existsSync(resolvedPath + ext) || fs.existsSync(resolvedPath + "/index" + ext)) {
                    exists = true
                    break
                  }
                }

                if (!exists && fs.existsSync(resolvedPath)) {
                  exists = true // Directory exists
                }

                if (!exists) {
                  this.issues.push(`Broken import in ${file}: ${importPath}`)
                }
              }
            }
          }
        }
      }
    }

    this.passed.push("✅ Import validation completed")
  }

  getAllFiles(dir, files = []) {
    if (!fs.existsSync(dir)) return files

    const items = fs.readdirSync(dir)

    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory() && !item.startsWith(".") && item !== "node_modules") {
        this.getAllFiles(fullPath, files)
      } else if (stat.isFile()) {
        files.push(fullPath)
      }
    }

    return files
  }

  findCaseInsensitiveDuplicates(files) {
    const seen = new Map()
    const duplicates = []

    for (const file of files) {
      const lower = file.toLowerCase()
      if (seen.has(lower) && seen.get(lower) !== file) {
        duplicates.push(`${seen.get(lower)} vs ${file}`)
      } else {
        seen.set(lower, file)
      }
    }

    return duplicates
  }

  generateReport() {
    console.log("\n📊 MyCora UI Deployment Validation Report")
    console.log("=".repeat(50))

    if (this.issues.length > 0) {
      console.log("\n❌ CRITICAL ISSUES:")
      this.issues.forEach((issue) => console.log(`  • ${issue}`))
    }

    if (this.warnings.length > 0) {
      console.log("\n⚠️  WARNINGS:")
      this.warnings.forEach((warning) => console.log(`  • ${warning}`))
    }

    if (this.passed.length > 0) {
      console.log("\n✅ PASSED CHECKS:")
      this.passed.forEach((pass) => console.log(`  • ${pass}`))
    }

    const totalChecks = this.issues.length + this.warnings.length + this.passed.length
    const successRate = Math.round((this.passed.length / totalChecks) * 100)

    console.log(`\n📈 Overall Success Rate: ${successRate}%`)
    console.log(`   Critical Issues: ${this.issues.length}`)
    console.log(`   Warnings: ${this.warnings.length}`)
    console.log(`   Passed: ${this.passed.length}`)

    if (this.issues.length === 0) {
      console.log("\n🎉 Ready for deployment!")
    } else {
      console.log("\n🚨 Fix critical issues before deploying")
    }
  }
}

// Run validation
const validator = new DeploymentUIValidator()
validator.validateDeployment().catch(console.error)
