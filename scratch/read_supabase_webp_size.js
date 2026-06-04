const fs = require('fs');
const https = require('https');

function getWebpSize(buffer) {
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff !== 'RIFF' || webp !== 'WEBP') {
    throw new Error('Not a valid WebP file');
  }

  const type = buffer.toString('ascii', 12, 16);
  if (type === 'VP8 ') {
    const width = buffer.readUInt16LE(26) & 0x3fff;
    const height = buffer.readUInt16LE(28) & 0x3fff;
    return { width, height };
  } else if (type === 'VP8L') {
    const val = buffer.readUInt32LE(21);
    const width = (val & 0x3fff) + 1;
    const height = ((val >> 14) & 0x3fff) + 1;
    return { width, height };
  } else if (type === 'VP8X') {
    const width = buffer[24] + (buffer[25] << 8) + (buffer[26] << 16) + 1;
    const height = buffer[27] + (buffer[28] << 8) + (buffer[29] << 16) + 1;
    return { width, height };
  }
  throw new Error('Unknown WebP VP8 type: ' + type);
}

const url = "https://pgnsslfmgdyenozhpntz.supabase.co/storage/v1/object/public/portfolio/personal/personal-hero_photo_url-1778858673749.webp";

https.get(url, (res) => {
  const chunks = [];
  res.on('data', (chunk) => {
    chunks.push(chunk);
  });
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    try {
      console.log('Uploaded image dimensions:', getWebpSize(buffer));
    } catch (err) {
      console.error('Error parsing webp:', err.stack || err.message);
    }
  });
}).on('error', (err) => {
  console.error('Fetch error:', err.message);
});
