"use client";
import type { Building, Room } from '../../domain/model/types';

export type MatchLike = { key?: string; indices: Array<[number, number]> };
export type RoomHit = { room: Room; building: Building; floorKey: string; matches?: ReadonlyArray<MatchLike> };
export type BuildingHit = { building: Building; matches?: ReadonlyArray<MatchLike> };
