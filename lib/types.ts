export type LatLng = { lat: number; lng: number };

export type User = {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
  color: string; // fallback avatar background
  verified?: boolean;
  bio?: string;
  locationText?: string;
  link?: string;
  linkCount?: number;
  born?: string;
  joined?: string;
  followers: number;
  following: number;
  postCount: number;
  chitCount: number;
  isFollowing: boolean;
  followsYou: boolean;
  sharingLocation: boolean;
};

/** A 24h story pinned to where it was posted. */
export type Story = {
  id: string;
  user: User;
  location: LatLng;
  placeName: string;
  placeId?: string;
  mediaUrl?: string;
  mediaColor: string;
  caption: string;
  hashtags: string[];
  badge?: "heart" | "fries" | "party";
  group: "people" | "hashtag"; // "Peoples | #Hashtags" toggle on the map
  createdAt: string;
};

/** A post (called "chit" in the app). */
export type Chit = {
  id: string;
  user: User;
  location: LatLng;
  placeName: string;
  placeId?: string;
  mediaUrl?: string;
  mediaColor: string;
  isVideo: boolean;
  caption: string;
  sound?: string;
  hashtags: string[];
  likes: number;
  comments: number;
  views: number;
  reposts: number;
  shares: number;
  liked: boolean;
  createdAt: string;
};

/** A hashtag community/chat tied to a place. */
export type Hashtag = {
  tag: string; // slug, used in URLs
  name: string; // display, e.g. "topkapi museum"
  imageUrl?: string;
  color: string;
  description: string;
  locationName: string;
  address?: string;
  location: LatLng;
  members: number;
  chitCount: number;
  createdBy: User;
  visibility: "Public" | "Private";
  lastMessage?: string;
  active: boolean; // someone chatting right now
  joined: boolean;
  trending: boolean;
};

export type Person = User & { location: LatLng; updatedAt: string };

export type PlaceCategory =
  | "coffee"
  | "restaurant"
  | "park"
  | "hotel"
  | "bar"
  | "museum"
  | "fuel"
  | "atm"
  | "hospital"
  | "parking"
  | "shop"
  | "other";

export type Place = {
  id: string;
  name: string;
  category: PlaceCategory;
  location: LatLng;
  address?: string;
  openingHours?: string; // OSM opening_hours syntax
  phone?: string;
  website?: string;
  description?: string;
  source: "osm" | "mock";
  // From YOUR app (community reviews / visits), not from the map provider:
  rating?: number;
  reviews?: number;
  photos: string[];
  photoColor: string;
  friendsVisited: User[];
};

export type Filters = {
  category?: PlaceCategory;
  km: number; // search radius
  minRating: number; // 0 = any
  openNow: boolean;
  openLate: boolean;
  friends: boolean; // popular with friends first
};

export type Feed = {
  center: LatLng;
  stories: Story[];
  chits: Chit[];
  people: Person[];
  hashtags: Hashtag[];
  places: Place[];
  placesSource: "osm" | "mock";
};

export type SearchResults = {
  categories: { category: PlaceCategory; count: number }[];
  places: Place[];
  people: (User & { location?: LatLng; updatedAt?: string })[];
  hashtags: Hashtag[];
  chits: Chit[];
  searchCenter?: LatLng;
  searchLocation?: string;
};
