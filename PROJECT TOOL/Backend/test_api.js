import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true, baseURL: 'http://localhost:5050/api' }));

async function run() {
  try {
    // 1. Login or Register
    let user;
    try {
      user = await client.post('/users/login', { email: 'admin@admin.com', password: 'password123' });
      console.log("Logged in Admin");
    } catch(e) {
      console.log("Creating Admin");
      await client.post('/users/register', { name: 'Admin User', email: 'admin@admin.com', password: 'password123' });
      user = await client.post('/users/login', { email: 'admin@admin.com', password: 'password123' });
    }
    
    // Check if user is admin, if not, we must manually update DB or just test what we can
    console.log("User:", user.data);

    // 2. Create Project
    const proj = await client.post('/projects', { name: 'Test API Project', description: 'desc', priority: 'High', status: 'Planning', dueDate: new Date() });
    console.log("Project created:", proj.data._id);

    // 3. Create Task (Valid)
    const task1 = await client.post('/tasks', { name: 'Valid Task', project: proj.data._id });
    console.log("Task created:", task1.data._id);

    // 4. Create Task (Invalid Project)
    try {
      await client.post('/tasks', { name: 'Invalid Task', project: '60d5ecc4f682f50015ea1c61' });
    } catch(e) {
      console.log("Expected Error (Invalid Project):", e.response.data);
    }
    
    // We are done
    console.log("Tests complete.");
  } catch(e) {
    console.log("Unhandled error:", e.response ? e.response.data : e.message);
  }
}
run();
