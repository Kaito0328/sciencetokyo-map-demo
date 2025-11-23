export function getFloorplanSources(buildingCode: string, floorKey: string): string[] {
  return [`/floorplans/${buildingCode}/${floorKey}.png`];
}

export function getPrimaryFloorplanSrc(buildingCode: string, floorKey: string): string | null {
  const list = getFloorplanSources(buildingCode, floorKey);
  return list.length > 0 ? list[0] : null;
}
