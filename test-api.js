const fetch = require('node-fetch');
async function run() {
  const res = await fetch('http://localhost:3000/api/facilities');
  const data = await res.json();
  console.log(data.length);
}
run();
