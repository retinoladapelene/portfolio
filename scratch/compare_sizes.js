const fs = require('fs');
const https = require('https');

const localSize = fs.statSync('c:\\Users\\Prase\\Downloads\\artwork web\\portfolio\\public\\personalfoto.webp').size;
console.log('Local personalfoto.webp size:', localSize, 'bytes');

const url = "https://pgnsslfmgdyenozhpntz.supabase.co/storage/v1/object/public/portfolio/personal/personal-hero_photo_url-1778858673749.webp";

https.get(url, (res) => {
  let size = 0;
  res.on('data', (chunk) => {
    size += chunk.length;
  });
  res.on('end', () => {
    console.log('Supabase personal photo size:', size, 'bytes');
  });
}).on('error', (err) => {
  console.error('Fetch error:', err.message);
});
