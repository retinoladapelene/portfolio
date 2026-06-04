async function testPost() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/archive-management', { method: 'POST' });
    console.log('POST Status:', res.status);
    const body = await res.text();
    console.log('POST Body:', body);
  } catch (err) {
    console.error('POST error:', err);
  }
}

async function testDelete() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/archive-management?auto=true', { method: 'DELETE' });
    console.log('DELETE Status:', res.status);
    const body = await res.text();
    console.log('DELETE Body:', body);
  } catch (err) {
    console.error('DELETE error:', err);
  }
}

async function run() {
  await testPost();
  await testDelete();
}
run();
