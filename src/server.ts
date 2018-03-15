import './config/load-env'; // Load our environment variables
import app from './app';

// TODO: Implement tree-house startServer
app.listen(3000, () => console.log('Server started on port 3000'));
