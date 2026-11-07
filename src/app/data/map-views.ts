import { projection, statePaths } from './map.generated';
import { journey } from './portfolio.data';

export interface MapBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const indiaFrame: MapBox = { x: 110, y: 20, width: 1000, height: 670 };
export const mapAspect = indiaFrame.height / indiaFrame.width;

export type MapRegion = 'maharashtra' | 'jharkhand' | 'west-bengal';

export function project([lon, lat]: [number, number]): [number, number] {
  const r = Math.PI / 180;
  const mercatorY = (latitude: number) => Math.log(Math.tan(Math.PI / 4 + (latitude * r) / 2));
  return [
    projection.translate[0] + (lon - projection.center[0]) * r * projection.scale,
    projection.translate[1] - (mercatorY(lat) - mercatorY(projection.center[1])) * projection.scale,
  ];
}

function frameAt(x: number, y: number, width: number): MapBox {
  const height = width * mapAspect;
  return { x: x - width / 2, y: y - height / 2, width, height };
}

function region(
  name: keyof typeof statePaths,
  stateFrame: MapBox,
  artworkFrame: MapBox,
  cityWidth: number,
  ...cities: string[]
) {
  const pins = journey
    .filter((place) => cities.includes(place.id))
    .map((place) => {
      const [x, y] = project(place.coordinates);
      return { id: place.id, name: place.city, x, y };
    });
  const x = pins.reduce((sum, pin) => sum + pin.x, 0) / pins.length;
  const y = pins.reduce((sum, pin) => sum + pin.y, 0) / pins.length;
  return {
    name,
    outline: statePaths[name],
    stateFrame,
    artworkFrame,
    cityFrame: frameAt(x, y, cityWidth),
    pins,
  };
}

// Artwork frames register the district SVGs to the same projection as the animated map.
export const mapRegions = {
  maharashtra: region(
    'Maharashtra',
    frameAt(431, 566, 375),
    frameAt(427.382, 566.414, 433.162),
    200,
    'mumbai',
    'pune',
  ),
  jharkhand: region(
    'Jharkhand',
    frameAt(717, 399, 218),
    frameAt(717.723, 398.958, 249.054),
    106,
    'jamshedpur',
  ),
  'west-bengal': region(
    'West Bengal',
    frameAt(789, 373, 342),
    frameAt(788.789, 373.713, 336.96),
    126,
    'kolkata',
  ),
};

export const sectionRegions = {
  work: 'maharashtra',
  projects: 'jharkhand',
  skills: 'jharkhand',
  education: 'west-bengal',
  journey: null,
  about: null,
  contact: null,
} as const satisfies Record<string, MapRegion | null>;

export type MapSection = keyof typeof sectionRegions;
