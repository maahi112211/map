// Sample data shaped like the real app: stories, chits (posts), hashtag chats, people.
// Positions are offsets in metres (north, east) from the viewer, so the map is
// populated wherever you open it. Images come from free placeholder services
// (picsum / dicebear) — your backend will return real media URLs instead.

import type { PlaceCategory } from "../types";

export const photo = (seed: string, w = 600, h = 800) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
export const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=f2d6c9,d6e4f5,dcecd9,efe0f5,f6e7b9`;

export type UserSeed = {
  id: string; username: string; name: string; color: string; avatarUrl?: string; verified?: boolean;
  bio?: string; locationText?: string; link?: string; linkCount?: number; born?: string; joined?: string;
  followers: number; following: number; postCount: number; chitCount: number;
  isFollowing: boolean; followsYou: boolean; sharingLocation: boolean;
};

export const USERS: UserSeed[] = [
  {
    id: "u1", username: "grace.kim", name: "Grace Kim", color: "#F2D6C9",
    bio: "Design lead & sourdough baker. Exploring local parks and cozy coffee corners 🌿",
    locationText: "Brooklyn, NY", link: "gracekim.studio", linkCount: 2,
    born: "April 22, 1997", joined: "May 2023",
    followers: 812, following: 301, postCount: 44, chitCount: 120, isFollowing: true, followsYou: true, sharingLocation: false,
  },
  {
    id: "u2", username: "david.chen", name: "David Chen", color: "#D6E4F5",
    bio: "Architect & urban photographer. Capturing modern skylines and quiet streets.",
    locationText: "San Francisco, CA", link: "davidchen.design", linkCount: 1,
    born: "September 15, 1995", joined: "August 2022",
    followers: 1204, following: 410, postCount: 61, chitCount: 88, isFollowing: true, followsYou: false, sharingLocation: false,
  },
  {
    id: "u3", username: "priya.sharma", name: "Priya Sharma", color: "#EFE0F5",
    bio: "Visual artist & cafe hopper ☕ Sharing street sketches, local culinary hidden gems, and cozy work corners.",
    locationText: "Connaught Place, New Delhi", link: "priyasharma.art", linkCount: 1,
    born: "August 10, 1999", joined: "March 2023",
    followers: 2310, following: 520, postCount: 97, chitCount: 240, isFollowing: true, followsYou: true, sharingLocation: true,
  },
  {
    id: "u4", username: "javier.m", name: "Javier Morales", color: "#DCECD9",
    bio: "Historic architecture enthusiast and street traveler.",
    locationText: "Madrid, Spain", link: "javierm.es",
    born: "January 19, 1994", joined: "October 2023",
    followers: 402, following: 388, postCount: 19, chitCount: 51, isFollowing: false, followsYou: true, sharingLocation: false,
  },
  {
    id: "u5", username: "sofia.novak", name: "Sofia Novak", color: "#F6E7B9",
    bio: "Color enthusiast & mural painter. Painting public spaces worldwide 🎨",
    locationText: "Prague, Czech Republic", link: "sofianovak.art", linkCount: 2,
    born: "December 3, 1996", joined: "February 2023",
    followers: 5120, following: 190, postCount: 210, chitCount: 402, isFollowing: true, followsYou: false, sharingLocation: false,
  },
  {
    id: "u6", username: "kenji.t", name: "Kenji Tanaka", color: "#D6E4F5",
    bio: "Documenting quiet moments in lively streets. Coffee, film cameras, and long walks at blue hour 📷",
    locationText: "Sector 18, Noida, Uttar Pradesh", link: "kenjitanaka.photos", linkCount: 3,
    born: "November 5, 1996", joined: "October 2023",
    followers: 930, following: 612, postCount: 58, chitCount: 77, isFollowing: true, followsYou: true, sharingLocation: true,
  },
  {
    id: "u7", username: "mateo.rossi", name: "Mateo Rossi", color: "#F2D6C9",
    bio: "Espresso purist & cycling commuter. Finding the best bakery in every town.",
    locationText: "Milan, Italy", link: "mateorossi.it",
    born: "July 28, 1998", joined: "June 2024",
    followers: 640, following: 245, postCount: 33, chitCount: 64, isFollowing: false, followsYou: false, sharingLocation: false,
  },
  {
    id: "u8", username: "elena.p", name: "Elena Petrova", color: "#EFE0F5",
    bio: "Live music curator & night owl. Always somewhere between the stage and the console 🎵",
    locationText: "Berlin, Germany", link: "elenapetrova.fm", linkCount: 2,
    born: "May 12, 1997", joined: "April 2023",
    followers: 1880, following: 330, postCount: 72, chitCount: 150, isFollowing: true, followsYou: true, sharingLocation: false,
  },
  {
    id: "u9", username: "fatima.as", name: "Fatima Al-Sayed", color: "#DCECD9",
    bio: "Barista champion & latte art trainer. Coffee culture explorer ☕",
    locationText: "Dubai, UAE", link: "fatima.coffee", linkCount: 1,
    born: "October 14, 1999", joined: "November 2023",
    followers: 770, following: 290, postCount: 40, chitCount: 93, isFollowing: false, followsYou: true, sharingLocation: false,
  },
  {
    id: "u10", username: "liam.oc", name: "Liam O'Connell", color: "#F6E7B9",
    bio: "Urban photographer & cyclist 🚲 Chasing morning mist, architectural lines, and espresso shots across cities.",
    locationText: "Plot# 4, South Extension, New Delhi", link: "liamoc.lens", linkCount: 2,
    born: "March 14, 1998", joined: "January 2024",
    followers: 350, following: 410, postCount: 12, chitCount: 30, isFollowing: true, followsYou: true, sharingLocation: true,
  },
  {
    id: "u11", username: "chloe.d", name: "Chloé Dubois", color: "#D6E4F5",
    bio: "Curator of flea markets, antique books, and cozy Parisian bistros 🥐",
    locationText: "Paris, France", link: "chloedubois.fr", linkCount: 1,
    born: "February 8, 1996", joined: "September 2022",
    followers: 2900, following: 150, postCount: 130, chitCount: 210, isFollowing: false, followsYou: false, sharingLocation: false,
  },
  {
    id: "u12", username: "anya.sharma", name: "Anya Sharma", color: "#F2D6C9",
    bio: "Sunrise walker & landscape photographer. Capturing the golden hour daily 🌅",
    locationText: "Jaipur, Rajasthan", link: "anyasharma.in",
    born: "August 30, 2001", joined: "December 2023",
    followers: 510, following: 480, postCount: 25, chitCount: 70, isFollowing: true, followsYou: false, sharingLocation: false,
  },
  {
    id: "u13", username: "emma_10gk", name: "Emma_jo", color: "#EFE0F5", avatarUrl: "/avatars/emma.png", verified: false,
    bio: "Bronx Based, MD ANT 🥇 Art, photography, literature, and lots appear to be a deeply thoughtful, aesthetically curious person.",
    locationText: "Plot# 11, Utter Pradesh, 201301, India", link: "Quearn.com", linkCount: 3, born: "June 19, 2000", joined: "July 2025",
    followers: 28, following: 20, postCount: 8, chitCount: 7, isFollowing: false, followsYou: false, sharingLocation: true,
  },
  {
    id: "u14", username: "sparsh_kumawat_20", name: "Sparsh Kumawat", color: "#DCECD9", verified: true,
    bio: "Building next-gen digital experiences. Passionate about interactive maps & geospatial tech 🚀",
    locationText: "Sector 62, Noida, India", link: "sparshkumawat.dev", linkCount: 3,
    born: "July 20, 1999", joined: "August 2023",
    followers: 3400, following: 210, postCount: 150, chitCount: 320, isFollowing: false, followsYou: false, sharingLocation: false,
  },
  {
    id: "u15", username: "jishnu.ux", name: "Jishnu.UX", color: "#F6E7B9",
    bio: "Crafting beautiful mobile experiences. UI/UX designer & coffee lover 📱☕",
    locationText: "Bangalore, India", link: "jishnu.design", linkCount: 2,
    born: "November 11, 1998", joined: "April 2023",
    followers: 1300, following: 700, postCount: 41, chitCount: 60, isFollowing: false, followsYou: false, sharingLocation: false,
  },
  {
    id: "u16", username: "nikhil_chejara_07", name: "Nikhil chejara", color: "#D6E4F5",
    bio: "Full stack developer & open source enthusiast 💻 Explorer of local food joints.",
    locationText: "Jaipur, India", link: "nikhilchejara.io",
    born: "May 7, 2000", joined: "February 2024",
    followers: 220, following: 330, postCount: 9, chitCount: 22, isFollowing: false, followsYou: true, sharingLocation: false,
  },
  {
    id: "u17", username: "andreas", name: "Andreas", color: "#F2D6C9",
    bio: "Sound designer and night walker. Documenting ambient city sounds.",
    locationText: "Stockholm, Sweden", link: "andreas.audio",
    born: "March 2, 1993", joined: "January 2022",
    followers: 4100, following: 120, postCount: 88, chitCount: 140, isFollowing: true, followsYou: false, sharingLocation: false,
  },
  {
    id: "u19", username: "cafe.with.emma", name: "Emma Joe", color: "#F6E7B9",
    bio: "Coffee notes from every café I visit ☕ Exploring roasters around the globe.",
    locationText: "Plot# 11, Utter Pradesh, 201301, India", link: "cafewithemma.blog",
    born: "June 19, 2000", joined: "July 2025",
    followers: 2200, following: 180, postCount: 64, chitCount: 130, isFollowing: false, followsYou: false, sharingLocation: false,
  },
  {
    id: "u18", username: "ryze_hendrick12", name: "Ryze Hendrick", color: "#EFE0F5",
    bio: "Visual storyteller & content creator. Short clips that move your world 🎬",
    locationText: "New York, NY", link: "ryzehendrick.com", linkCount: 4,
    born: "April 18, 1995", joined: "November 2021",
    followers: 10400, following: 310, postCount: 300, chitCount: 820, isFollowing: false, followsYou: false, sharingLocation: false,
  },
];

type Geo = { north: number; east: number };

export const STORY_SEEDS: (Geo & { id: string; userId: string; caption: string; hashtags: string[]; badge?: "heart" | "fries" | "party"; group: "people" | "hashtag"; hoursAgo: number; color: string })[] = [
  { id: "s1", userId: "u1", north: 820, east: -560, caption: "Morning light at the park", hashtags: ["morningwalk"], group: "people", hoursAgo: 2, color: "#C9B8A6" },
  { id: "s2", userId: "u1", north: 640, east: -360, caption: "Found the cutest bakery", hashtags: ["cafehopping"], group: "people", hoursAgo: 3, color: "#8E7A6A" },
  { id: "s3", userId: "u2", north: 950, east: 560, caption: "Rooftop views", hashtags: [], group: "people", hoursAgo: 5, color: "#6E8A5E" },
  { id: "s4", userId: "u3", north: 560, east: 40, caption: "Friday fries", hashtags: ["foodie"], badge: "fries", group: "people", hoursAgo: 1, color: "#B58B6B" },
  { id: "s5", userId: "u5", north: 420, east: 560, caption: "Colour everywhere", hashtags: ["streetart"], group: "hashtag", hoursAgo: 7, color: "#D2604A" },
  { id: "s6", userId: "u4", north: 300, east: -60, caption: "Old town doors", hashtags: [], group: "people", hoursAgo: 6, color: "#9C7A5B" },
  { id: "s7", userId: "u6", north: 250, east: -660, caption: "Alley walks", hashtags: ["citylife"], badge: "heart", group: "people", hoursAgo: 4, color: "#5F5A57" },
  { id: "s8", userId: "u7", north: 230, east: -240, caption: "Autumn on the block", hashtags: [], group: "people", hoursAgo: 8, color: "#B8452F" },
  { id: "s9", userId: "u8", north: 140, east: 560, caption: "Skyline party", hashtags: ["livemusic"], badge: "party", group: "hashtag", hoursAgo: 2, color: "#7D8FA3" },
  { id: "s10", userId: "u9", north: -120, east: -720, caption: "Evening strolls", hashtags: [], group: "people", hoursAgo: 9, color: "#A8886A" },
  { id: "s11", userId: "u10", north: -160, east: -120, caption: "Bike day", hashtags: ["citylife"], group: "people", hoursAgo: 3, color: "#4E5963" },
  { id: "s12", userId: "u11", north: -200, east: 40, caption: "Market finds", hashtags: [], group: "hashtag", hoursAgo: 5, color: "#6A7F8C" },
  { id: "s13", userId: "u6", north: -380, east: -420, caption: "Cathedral square", hashtags: ["museums"], group: "hashtag", hoursAgo: 10, color: "#B89D7A" },
  { id: "s14", userId: "u12", north: -620, east: -700, caption: "Sunset street", hashtags: ["goldenhour"], group: "people", hoursAgo: 1, color: "#C58D5E" },
  { id: "s15", userId: "u10", north: -470, east: 520, caption: "Late night eats", hashtags: ["foodie"], badge: "heart", group: "people", hoursAgo: 2, color: "#5B4640" },
  { id: "s16", userId: "u17", north: -760, east: 260, caption: "Quiet moments", hashtags: [], group: "people", hoursAgo: 12, color: "#8B6A52" },
];

export const CHIT_SEEDS: (Geo & { id: string; userId: string; caption: string; hashtags: string[]; sound?: string; isVideo: boolean; likes: number; comments: number; views: number; reposts: number; shares: number; hoursAgo: number; color: string })[] = [
  { id: "c1", userId: "u18", north: 700, east: -600, caption: "Content like visuals, sports entertainment videos can increase the attention span of your audience.", hashtags: ["citylife"], sound: "original sound - surbhijyoti", isVideo: true, likes: 10100, comments: 20, views: 1_500_000, reposts: 10, shares: 10, hoursAgo: 3, color: "#2B2B30" },
  { id: "c2", userId: "u2", north: 610, east: -240, caption: "Underwater dreams", hashtags: ["travel"], isVideo: false, likes: 820, comments: 41, views: 12000, reposts: 4, shares: 9, hoursAgo: 6, color: "#2E5E8A" },
  { id: "c3", userId: "u3", north: 520, east: 420, caption: "Polaroid wall", hashtags: ["cafehopping", "coffeeculture"], isVideo: false, likes: 402, comments: 18, views: 5100, reposts: 2, shares: 3, hoursAgo: 9, color: "#CDB79A" },
  { id: "c4", userId: "u6", north: 90, east: -420, caption: "Bridge at dusk", hashtags: ["goldenhour"], isVideo: false, likes: 1200, comments: 60, views: 20000, reposts: 12, shares: 20, hoursAgo: 12, color: "#3F5A73" },
  { id: "c5", userId: "u5", north: 170, east: 520, caption: "Game day", hashtags: ["sports"], isVideo: true, likes: 3300, comments: 120, views: 88000, reposts: 30, shares: 41, hoursAgo: 20, color: "#6C7A58" },
  { id: "c6", userId: "u8", north: -130, east: -60, caption: "Neon nature", hashtags: ["art"], isVideo: false, likes: 640, comments: 22, views: 9000, reposts: 5, shares: 7, hoursAgo: 26, color: "#1E3B2A" },
  { id: "c7", userId: "u12", north: -400, east: -560, caption: "Hills and hats", hashtags: ["travel", "morningwalk"], isVideo: false, likes: 910, comments: 33, views: 14000, reposts: 6, shares: 11, hoursAgo: 4, color: "#6F9AA8" },
  { id: "c8", userId: "u11", north: -330, east: 480, caption: "Autumn trees", hashtags: ["goldenhour"], isVideo: false, likes: 505, comments: 12, views: 6100, reposts: 3, shares: 2, hoursAgo: 30, color: "#B07A2E" },
  { id: "c9", userId: "u1", north: 70, east: 40, caption: "Morning brew done right", hashtags: ["coffeeculture", "morningbrew"], isVideo: false, likes: 330, comments: 9, views: 3000, reposts: 1, shares: 2, hoursAgo: 2, color: "#8A6446" },
  { id: "c10", userId: "u9", north: 60, east: 70, caption: "Latte art level up", hashtags: ["coffeeculture"], isVideo: true, likes: 740, comments: 25, views: 11000, reposts: 4, shares: 6, hoursAgo: 5, color: "#A67C5B" },
];

export const PEOPLE_SEEDS: (Geo & { userId: string; minutesAgo: number })[] = [
  { userId: "u13", north: 120, east: -180, minutesAgo: 2 },
  { userId: "u19", north: 220, east: -240, minutesAgo: 5 },
  { userId: "u14", north: 180, east: 210, minutesAgo: 4 },
  { userId: "u15", north: -140, east: -150, minutesAgo: 8 },
  { userId: "u3", north: 380, east: 260, minutesAgo: 3 },
  { userId: "u6", north: -260, east: -300, minutesAgo: 12 },
  { userId: "u10", north: -60, east: 300, minutesAgo: 1 },
  { userId: "u1", north: 80, east: 120, minutesAgo: 15 },
  { userId: "u2", north: -180, east: 190, minutesAgo: 7 },
];

export const HASHTAG_SEEDS: (Geo & { tag: string; name: string; description: string; imageUrl?: string; locationName: string; address: string; members: number; chitCount: number; createdBy: string; lastMessage?: string; active: boolean; trending: boolean; color: string })[] = [
  {
    tag: "topkapimuseum",
    name: "topkapi museum",
    imageUrl: "/avatars/topkapi.png",
    north: 90,
    east: 60,
    description: "🕌 Built in the 15th century by Sultan Mehmed II after conquest of Constantinople, it was the primary residence and administrative HQ of the Ottoman sultans for centuries.",
    locationName: "Old City",
    address: "Plot# 11, Utter Pradesh, 201301, India",
    members: 120,
    chitCount: 340,
    createdBy: "u13",
    lastMessage: "Who's going Sunday?",
    active: true,
    trending: true,
    color: "#6C7F5A",
  },
  {
    tag: "sunrisebrewhouse",
    name: "Sunrise Brew House",
    north: -380,
    east: -420,
    description: "Coffee lovers meet-up for the best pour-overs nearby.",
    locationName: "Plot# 11, Utter Pradesh, 201301, India",
    address: "Main Street, Plot# 11",
    members: 88,
    chitCount: 210,
    createdBy: "u1",
    lastMessage: "The ambiance is fantastic!",
    active: true,
    trending: false,
    color: "#8A6446",
  },
  { tag: "northstarcoffeelab", name: "Northstar Coffee Lab", north: 520, east: 420, description: "Experimental brews and latte art battles.", locationName: "Boulder, Colorado", address: "Lab Lane", members: 64, chitCount: 90, createdBy: "u3", active: false, trending: false, color: "#5B4A3E" },
  { tag: "cedarsageroasters", name: "Cedar & Sage Roasters", north: -520, east: 380, description: "Small-batch roasters and their fans.", locationName: "Boulder, Colorado", address: "Cedar Road", members: 41, chitCount: 55, createdBy: "u5", active: false, trending: false, color: "#6E6049" },
  { tag: "morningglowcafe", name: "Morning Glow Cafe", north: 300, east: -500, description: "Breakfast club for early risers.", locationName: "Boulder, Colorado", address: "Sunrise Ave", members: 132, chitCount: 400, createdBy: "u6", lastMessage: "The ambiance is fantastic!", active: true, trending: true, color: "#B98A56" },
  { tag: "coffeeculture", name: "CoffeeCulture", north: 70, east: 40, description: "Everything coffee: beans, brews, cafés.", locationName: "Nearby", address: "", members: 12800, chitCount: 12800, createdBy: "u2", lastMessage: "New single origin just dropped", active: true, trending: true, color: "#7B5A44" },
  { tag: "cafehopping", name: "CafeHopping", north: 520, east: 400, description: "One café at a time.", locationName: "Nearby", address: "", members: 8400, chitCount: 8400, createdBy: "u3", active: false, trending: true, color: "#9A7B63" },
  { tag: "morningbrew", name: "MorningBrew", north: 60, east: 70, description: "First cup of the day.", locationName: "Nearby", address: "", members: 3100, chitCount: 3100, createdBy: "u1", active: false, trending: false, color: "#A0764F" },
  { tag: "livemusic", name: "LiveMusic", north: 140, east: 560, description: "Gigs and open mics around you.", locationName: "Nearby", address: "", members: 2200, chitCount: 5100, createdBy: "u8", active: true, trending: true, color: "#46506A" },
  { tag: "morningwalk", name: "MorningWalk", north: 820, east: -560, description: "Step out before the city wakes.", locationName: "Nearby", address: "", members: 1400, chitCount: 2600, createdBy: "u1", active: false, trending: true, color: "#6E8A5E" },
];

/** Fallback places when OpenStreetMap is unreachable. */
export const MOCK_PLACE_SEEDS: (Geo & { id: string; name: string; category: PlaceCategory; address: string; hours: string; phone?: string; website?: string; description?: string })[] = [
  { id: "mock-1", name: "Brew'd Awakening Coffeehaus", category: "coffee", north: 80, east: 50, address: "41 El Ensha Street", hours: "Mo-Th 10:00-23:00; Fr-Su 12:00-05:00", phone: "+201068781849", website: "http://brewd.com", description: "Casual dining with an international menu, specialty coffee and a relaxed social atmosphere." },
  { id: "mock-2", name: "Monmouth Coffee", category: "coffee", north: 520, east: 420, address: "Covent Garden", hours: "Mo-Su 08:00-19:00", description: "Single-origin espresso and pour-over bar." },
  { id: "mock-3", name: "Kaffeine", category: "coffee", north: 300, east: -500, address: "Fitzrovia", hours: "Mo-Fr 07:30-17:00; Sa-Su 08:30-17:00" },
  { id: "mock-4", name: "Prufrock Coffee", category: "coffee", north: -520, east: 380, address: "Leather Lane", hours: "Mo-Fr 08:00-16:00" },
  { id: "mock-5", name: "Night Owl Espresso", category: "coffee", north: -200, east: -600, address: "Station Road", hours: "Mo-Su 16:00-02:00" },
  { id: "mock-6", name: "Spice Route Kitchen", category: "restaurant", north: 620, east: -120, address: "Market Lane", hours: "Mo-Su 12:00-23:30" },
  { id: "mock-7", name: "Central Park", category: "park", north: 820, east: -560, address: "Park Street", hours: "24/7" },
  { id: "mock-8", name: "Old City Museum", category: "museum", north: -380, east: -420, address: "Cathedral Square", hours: "Tu-Su 10:00-18:00" },
  { id: "mock-9", name: "Hotel Lakeview", category: "hotel", north: -300, east: 700, address: "Lake Road", hours: "24/7" },
  { id: "mock-10", name: "The Jazz Cellar", category: "bar", north: 140, east: 560, address: "River Walk", hours: "We-Su 19:00-02:00" },
  { id: "mock-11", name: "City Hospital", category: "hospital", north: 380, east: -160, address: "Hospital Road", hours: "24/7" },
  { id: "mock-12", name: "The Artisan Boutique", category: "shop", north: 210, east: -220, address: "Fashion Street", hours: "Mo-Sa 10:00-20:00" },
  { id: "mock-13", name: "SpeedyFuel Station", category: "fuel", north: -420, east: 180, address: "Highway 10", hours: "24/7" },
  { id: "mock-14", name: "Green Valley Park", category: "park", north: -150, east: -350, address: "Valley Road", hours: "06:00-22:00" },
  { id: "mock-15", name: "Trattoria Bella", category: "restaurant", north: -180, east: 220, address: "Olive Street", hours: "12:00-23:00" },
  { id: "mock-16", name: "Grand Palace Hotel", category: "hotel", north: 350, east: -320, address: "Grand Avenue", hours: "24/7" },
  { id: "mock-17", name: "Skyline Lounge & Bar", category: "bar", north: -90, east: 450, address: "Tower 1 Rooftop", hours: "17:00-02:00" },
  { id: "mock-18", name: "National Art Gallery", category: "museum", north: 480, east: -180, address: "Museum Mile", hours: "10:00-18:00" },
];

export const TRENDING_SEARCHES = ["#MorningWalk", "Coffee", "Parks", "#LiveMusic", "Museums"];
