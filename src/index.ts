import server from './app'

// Create a way to access environment variables
import { config } from 'dotenv'
if (process.env.NODE_ENV !== 'production'){
    config();
}

// Choose port the server will be running on
const port = process.env.PORT || 2001

// Start the server
server.listen(port, async () => {
    console.log(`Server listening on http://localhost:${port}`)
})