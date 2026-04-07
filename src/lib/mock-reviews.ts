// Deterministic mock reviews for demo slots (keyed by slot ID)
// For real DB slots, reviews come from the reviews table

const REVIEWER_NAMES = [
  "Emma T.", "James R.", "Sophie M.", "Oliver K.", "Charlotte H.",
  "Harry W.", "Amelia B.", "George P.", "Isla F.", "Jack S.",
  "Lily C.", "Noah D.", "Mia L.", "William A.", "Ava N.",
  "Liam G.", "Grace V.", "Lucas J.", "Chloe E.", "Ethan Z.",
];

const POSITIVE_COMMENTS: Record<string, string[]> = {
  Beauty: [
    "Amazing results — my stylist was incredible!",
    "Couldn't believe the price. Salon was gorgeous.",
    "Best blowout I've ever had, will definitely return.",
    "Luxurious experience at a fraction of the cost.",
  ],
  Aviation: [
    "Seamless booking, FBO experience was first class.",
    "Incredible value for a private flight. Very smooth.",
    "Crew was outstanding, onboard service was perfect.",
    "Can't beat empty-leg pricing through SlotEngine.",
  ],
  Health: [
    "Saw the specialist within days instead of months!",
    "Professional, thorough consultation. Highly recommend.",
    "Got a same-week appointment — lifesaver.",
    "Excellent care, felt very looked after.",
  ],
  Dining: [
    "Unbelievable we got a table at this price!",
    "Food was exquisite, service impeccable.",
    "Our best dining experience this year.",
    "The tasting menu was worth every penny.",
  ],
  Logistics: [
    "Got our cargo loaded 3 days ahead of schedule.",
    "Reliable slot, port handling was seamless.",
    "Massive saving on container costs. Great service.",
    "Documentation was handled perfectly.",
  ],
  Fitness: [
    "Great class, instructor was super motivating!",
    "Love grabbing last-minute sessions at this price.",
    "Studio was clean and well-equipped.",
    "Best workout deal in the city.",
  ],
  Education: [
    "Tutor was fantastic — really patient and clear.",
    "My daughter's grades improved after just one session.",
    "Excellent value for high-quality instruction.",
    "Flexible booking and great teaching.",
  ],
  Events: [
    "Got front-row seats at a huge discount!",
    "The show was incredible, tickets were legit.",
    "Can't believe we got in at this price.",
    "Unforgettable night, smooth entry process.",
  ],
  Automotive: [
    "Quick, professional service. Car runs perfectly.",
    "Saved a fortune on my MOT and service.",
    "They even washed the car — great touch!",
    "Honest mechanics, transparent pricing.",
  ],
  Legal: [
    "Got expert advice at a very reasonable rate.",
    "The solicitor was incredibly thorough.",
    "Really helped clarify my legal position.",
    "Professional and efficient consultation.",
  ],
  Property: [
    "Agent was very knowledgeable about the area.",
    "Quick viewing, no pressure — great experience.",
    "Found our dream flat through a last-minute slot!",
    "Very efficient valuation process.",
  ],
  "Pet Care": [
    "Vet was wonderful with our nervous puppy.",
    "Got an urgent appointment when we needed it most.",
    "Thorough check-up, great communication.",
    "Our cat loved the groomer — highly recommend.",
  ],
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export interface MockReview {
  id: string;
  reviewer: string;
  rating: number;
  comment: string;
  daysAgo: number;
}

export interface SlotRating {
  average: number;
  count: number;
  reviews: MockReview[];
}

export function getSlotRating(slotId: string, vertical: string): SlotRating {
  const seed = hashCode(slotId);
  const count = 3 + (seed % 45); // 3-47 reviews
  const baseRating = 3.8 + ((seed % 14) / 10); // 3.8 - 5.0
  const average = Math.min(5, Math.round(baseRating * 10) / 10);

  const comments = POSITIVE_COMMENTS[vertical] || POSITIVE_COMMENTS.Beauty;
  const reviewCount = Math.min(4, count);
  const reviews: MockReview[] = [];

  for (let i = 0; i < reviewCount; i++) {
    const rSeed = hashCode(`${slotId}-${i}`);
    reviews.push({
      id: `mock-${slotId}-${i}`,
      reviewer: REVIEWER_NAMES[rSeed % REVIEWER_NAMES.length],
      rating: Math.max(3, Math.min(5, Math.round(average + (rSeed % 3 - 1) * 0.5))),
      comment: comments[rSeed % comments.length],
      daysAgo: 1 + (rSeed % 30),
    });
  }

  return { average, count, reviews };
}

export function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - (half ? 1 : 0));
}
