const net = require("net")

const checkPort = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer()

    server.listen(port, () => {
      server.once("close", () => {
        resolve(true) // Port is available
      })
      server.close()
    })

    server.on("error", () => {
      resolve(false) // Port is in use
    })
  })
}

const findAvailablePort = async (startPort = 3000) => {
  for (let port = startPort; port < startPort + 100; port++) {
    const isAvailable = await checkPort(port)
    if (isAvailable) {
      console.log(`✅ Available port found: ${port}`)
      return port
    }
  }
  throw new Error("No available ports found in range")
}

if (require.main === module) {
  findAvailablePort()
    .then((port) => {
      console.log(`🚀 Recommended port: ${port}`)
      console.log(`Run: npm run dev -- -p ${port}`)
    })
    .catch(console.error)
}

module.exports = { checkPort, findAvailablePort }
