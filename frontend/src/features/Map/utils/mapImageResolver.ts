import { Campus } from "../../../domain/model/types";

export function resolveMapImage(campus: Campus): string {
  const ca = (campus.alias || '').toLowerCase();

  return `/img/${ca}.webp`;
}