/**
 * Generates an organic brush stroke path for revealing scenes.
 * Moves from left to right (X: 0 -> 1).
 * The path covers the area to the LEFT of the stroke (the "painted" area).
 */
export function buildBrushPath(progress: number, width: number = 100, height: number = 100): string {
  // Normalize progress to ensure full coverage at 1.0
  // We want the brush to start off-screen and end off-screen
  const xOffset = progress * (width * 1.5) - (width * 0.25);
  
  // Brush height variation (organic edge)
  const segments = 10;
  const step = height / segments;
  
  let path = `M 0,0 `; // Start top-left
  
  // Top edge (mostly flat)
  path += `L ${xOffset},0 `;
  
  // The "Brush Tip" - Organic vertical edge moving from top to bottom
  for (let i = 0; i <= segments; i++) {
    const y = i * step;
    // Add some noise/wobble to the X position
    // Use sin waves to create a "rough" but repeatable look
    const wobble = Math.sin(y * 0.1) * 15 + Math.cos(y * 0.05) * 10;
    const x = xOffset + wobble * (1 - Math.pow(progress - 0.5, 2) * 4); // Wobble intensity varies with progress
    
    if (i === 0) {
      path += `L ${x},${y} `;
    } else {
      // Use Quadratic curves for a smoother "bristle" look
      const prevY = (i - 1) * step;
      const cpY = (prevY + y) / 2;
      path += `Q ${x + 5},${cpY} ${x},${y} `;
    }
  }
  
  // Close the shape back to the left
  path += `L 0,${height} `;
  path += `Z`;
  
  return path;
}
