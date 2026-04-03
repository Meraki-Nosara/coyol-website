#!/usr/bin/env node

/**
 * Parse KML files and extract lot boundaries as GeoJSON
 */

const fs = require('fs');
const path = require('path');

function parseKML(kmlContent, sourceName) {
  const features = [];
  
  // Match all Placemarks
  const placemarkRegex = /<Placemark[^>]*>([\s\S]*?)<\/Placemark>/g;
  let match;
  let lotId = 1;
  
  while ((match = placemarkRegex.exec(kmlContent)) !== null) {
    const placemark = match[1];
    
    // Extract layer name
    const layerMatch = placemark.match(/<SimpleData name="Layer">([^<]+)<\/SimpleData>/);
    const layer = layerMatch ? layerMatch[1] : 'unknown';
    
    // Extract coordinates
    const coordMatch = placemark.match(/<coordinates>\s*([\s\S]*?)\s*<\/coordinates>/);
    if (!coordMatch) continue;
    
    const coordString = coordMatch[1].trim();
    const coordinates = coordString.split(/\s+/).map(coord => {
      const [lng, lat, alt] = coord.split(',').map(Number);
      return [lng, lat];
    }).filter(c => !isNaN(c[0]) && !isNaN(c[1]));
    
    if (coordinates.length < 2) continue;
    
    // Determine geometry type
    const isPolygon = coordinates.length >= 3 && 
      coordinates[0][0] === coordinates[coordinates.length-1][0] &&
      coordinates[0][1] === coordinates[coordinates.length-1][1];
    
    // Only include property boundaries and lot-related layers
    const includeLayers = [
      'f-limite de propiedad',
      'f-lotes',
      'lote',
      'lots',
      'boundary',
      'limite'
    ];
    
    const isRelevant = includeLayers.some(l => 
      layer.toLowerCase().includes(l.toLowerCase().replace('f-', ''))
    );
    
    // Create feature
    const feature = {
      type: 'Feature',
      properties: {
        id: `${sourceName}-${lotId}`,
        layer: layer,
        source: sourceName,
        status: 'available', // Default - will be updated with real data
        name: `Lot ${lotId}`,
        area: null, // Calculate later if needed
      },
      geometry: {
        type: isPolygon ? 'Polygon' : 'LineString',
        coordinates: isPolygon ? [coordinates] : coordinates
      }
    };
    
    features.push(feature);
    lotId++;
  }
  
  return {
    type: 'FeatureCollection',
    features: features
  };
}

// Parse both KML files
const kmlDir = path.join(__dirname, '..');
const outputDir = path.join(kmlDir, 'public', 'data');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Process Nosara Hills
const nosaraHillsPath = path.join(kmlDir, 'Nosara Hills.kml');
if (fs.existsSync(nosaraHillsPath)) {
  console.log('Parsing Nosara Hills.kml...');
  const nosaraKml = fs.readFileSync(nosaraHillsPath, 'utf-8');
  const nosaraGeoJson = parseKML(nosaraKml, 'nosara-hills');
  fs.writeFileSync(
    path.join(outputDir, 'nosara-hills.geojson'),
    JSON.stringify(nosaraGeoJson, null, 2)
  );
  console.log(`  Created nosara-hills.geojson with ${nosaraGeoJson.features.length} features`);
}

// Process Mar Azul
const marAzulPath = path.join(kmlDir, 'MAR AZUL PRUEBA1.kml');
if (fs.existsSync(marAzulPath)) {
  console.log('Parsing MAR AZUL PRUEBA1.kml...');
  const marAzulKml = fs.readFileSync(marAzulPath, 'utf-8');
  const marAzulGeoJson = parseKML(marAzulKml, 'mar-azul');
  fs.writeFileSync(
    path.join(outputDir, 'mar-azul.geojson'),
    JSON.stringify(marAzulGeoJson, null, 2)
  );
  console.log(`  Created mar-azul.geojson with ${marAzulGeoJson.features.length} features`);
}

// Create combined file
const combined = {
  type: 'FeatureCollection',
  features: []
};

['nosara-hills.geojson', 'mar-azul.geojson'].forEach(file => {
  const filePath = path.join(outputDir, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    combined.features.push(...data.features);
  }
});

fs.writeFileSync(
  path.join(outputDir, 'all-developments.geojson'),
  JSON.stringify(combined, null, 2)
);

console.log(`\nTotal features: ${combined.features.length}`);
console.log('Done!');
