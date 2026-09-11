export type MediaType = 'ANIME' | 'MANGA' | 'NOVEL';

export type MediaRelationship =
  | 'ORIGINAL_LIGHT_NOVEL'
  | 'ORIGINAL_MANGA'
  | 'MANGA_ADAPTATION'
  | 'ANIME_ADAPTATION'
  | 'SIDE_STORY'
  | 'SPIN_OFF';

export interface ConnectedMediaNode {
  id: string | number;
  mediaType: MediaType;
  title: string;
  coverUrl: string;
  relationship: MediaRelationship;
  status: string;
  rating?: number;
  releaseYear?: number;
  badgeLabel: string;
}

export interface CrossMediaBundle {
  sourceMediaType: MediaType;
  sourceId: string | number;
  franchiseTitle: string;
  connectedItems: ConnectedMediaNode[];
}
