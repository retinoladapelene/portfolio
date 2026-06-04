const fs = require('fs');
const path = require('path');

const glbPath = path.join('public', 'flower_bouquet.glb');

if (!fs.existsSync(glbPath)) {
    console.error('File not found');
    process.exit(1);
}

const buffer = fs.readFileSync(glbPath);

// GLB Header: magic (4), version (4), length (4)
// Chunk 0 Header: length (4), type (4) -> 'JSON' (0x4E4F534A)
const jsonChunkLength = buffer.readUInt32LE(12);
const jsonChunkType = buffer.readUInt32LE(16);

if (jsonChunkType !== 0x4E4F534A) {
    console.error('First chunk is not JSON');
    process.exit(1);
}

const jsonBuffer = buffer.slice(20, 20 + jsonChunkLength);
const gltf = JSON.parse(jsonBuffer.toString());

console.log('--- GLTF INFO ---');
console.log('Materials:', gltf.materials ? gltf.materials.length : 0);
if (gltf.materials) {
    gltf.materials.forEach((m, i) => {
        console.log(`Material ${i}: ${m.name}`);
        if (m.pbrMetallicRoughness) {
            console.log('  Base Color:', m.pbrMetallicRoughness.baseColorFactor);
        }
    });
}

console.log('Nodes:', gltf.nodes ? gltf.nodes.length : 0);
if (gltf.nodes) {
    gltf.nodes.slice(0, 10).forEach((n, i) => {
        console.log(`Node ${i}: ${n.name}`);
    });
}
