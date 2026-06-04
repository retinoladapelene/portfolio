const fs = require('fs');

function getWebpSize(filepath) {
  const buffer = fs.readFileSync(filepath);
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
    const width = buffer.readUInt24LE(24) + 1;
    const height = buffer.readUInt24LE(27) + 1;
    return { width, height };
  }
  throw new Error('Unknown WebP VP8 type: ' + type);
}

try {
  console.log('personalfoto.webp:', getWebpSize('c:\\Users\\Prase\\Downloads\\artwork web\\portfolio\\public\\personalfoto.webp'));
  console.log('gambarcursorinteraktif.webp:', getWebpSize('c:\\Users\\Prase\\Downloads\\artwork web\\portfolio\\public\\gambarcursorinteraktif.webp'));
} catch (err) {
  console.error(err);
}
