import { Scissors, Plane, Ship, Utensils, Stethoscope, Truck, GraduationCap, Ticket, Car, Scale, Building, PawPrint, Palmtree, Wrench, Laptop, Trophy, SprayCan, Camera, Baby, Package, Home, Heart, Dumbbell, PlaneTakeoff, Gem, Apple } from "lucide-react";

const sectors = [
  {
    icon: Scissors,
    title: "Beauty & Wellness",
    description: "Hair, spa, nails — cancelled slots filled in real-time across 50K+ salons.",
    stat: "43K slots/day",
  },
  {
    icon: Stethoscope,
    title: "Healthcare",
    description: "Doctor visits, specialist consults, and therapy sessions recovered instantly.",
    stat: "12K slots/day",
  },
  {
    icon: Utensils,
    title: "Dining",
    description: "Premium restaurant reservations at exclusive venues worldwide.",
    stat: "8K slots/day",
  },
  {
    icon: Plane,
    title: "Aviation",
    description: "Private jet empty legs at up to 75% off. TEB, VNY, OPF, and 200+ FBOs.",
    stat: "$14M recovered/mo",
  },
  {
    icon: Ship,
    title: "Maritime & Ports",
    description: "Docking windows, berth swaps, and container slot trading to avoid demurrage.",
    stat: "$8M recovered/mo",
  },
  {
    icon: Truck,
    title: "Freight & Trucking",
    description: "Deadhead elimination. Fill empty return legs and reduce carbon output.",
    stat: "2.1K routes/day",
  },
  {
    icon: GraduationCap,
    title: "Education & Tutoring",
    description: "Cancelled tutoring sessions, driving lessons, and course slots reclaimed instantly.",
    stat: "6K slots/day",
  },
  {
    icon: Ticket,
    title: "Events & Entertainment",
    description: "Last-minute concert, theatre, and experience tickets at steep discounts.",
    stat: "4K slots/day",
  },
  {
    icon: Car,
    title: "Automotive Services",
    description: "MOTs, servicing, and detailing appointments filled from no-show gaps.",
    stat: "3K slots/day",
  },
  {
    icon: Scale,
    title: "Legal Services",
    description: "Solicitor consultations and legal aid sessions recovered from cancellations.",
    stat: "1.8K slots/day",
  },
  {
    icon: Building,
    title: "Property & Viewings",
    description: "Estate agent viewings, surveys, and valuations filled from dropped bookings.",
    stat: "2.5K slots/day",
  },
  {
    icon: PawPrint,
    title: "Pet Care & Vets",
    description: "Vet appointments, grooming, and pet boarding slots reclaimed in real-time.",
    stat: "5K slots/day",
  },
  {
    icon: Palmtree,
    title: "Holidays & Travel",
    description: "Last-minute holiday packages, hotel rooms, and tour slots at up to 80% off.",
    stat: "9K deals/day",
  },
  {
    icon: Car,
    title: "Car Deals & Rentals",
    description: "Cancelled test drives, rental returns, and dealer overstock at massive discounts.",
    stat: "4.2K deals/day",
  },
  {
    icon: Wrench,
    title: "Tools & Hardware",
    description: "Tool hire, equipment rental, and workshop slots freed up by cancellations.",
    stat: "2.8K slots/day",
  },
  {
    icon: Home,
    title: "Home & Garden",
    description: "Plumbers, electricians, landscapers — cancelled appointments filled instantly.",
    stat: "6.5K slots/day",
  },
  {
    icon: Laptop,
    title: "Technology",
    description: "Tech repairs, gadget trade-ins, and setup services at discounted rates.",
    stat: "3.4K slots/day",
  },
  {
    icon: Trophy,
    title: "Sports & Recreation",
    description: "Court bookings, coaching sessions, and gym classes freed up by no-shows.",
    stat: "7.1K slots/day",
  },
  {
    icon: SprayCan,
    title: "Cleaning Services",
    description: "Professional home and office cleaning slots from last-minute cancellations.",
    stat: "5.3K slots/day",
  },
  {
    icon: Camera,
    title: "Photography",
    description: "Studio sessions, event photography, and portrait shoots at steep discounts.",
    stat: "1.9K slots/day",
  },
  {
    icon: Baby,
    title: "Childcare & Nursery",
    description: "Nursery places, holiday clubs, and childminder slots reclaimed in real-time.",
    stat: "3.7K slots/day",
  },
  {
    icon: Package,
    title: "Self Storage",
    description: "Storage units from early terminations and overstock at up to 60% off.",
    stat: "1.2K units/day",
  },
  {
    icon: Heart,
    title: "Weddings",
    description: "Cancelled wedding venues, caterers, florists, and photographers at huge savings.",
    stat: "2.4K deals/day",
  },
  {
    icon: Dumbbell,
    title: "Gym Memberships",
    description: "Monthly passes, class packs, and annual memberships from cancellations and early exits.",
    stat: "8.2K deals/day",
  },
  {
    icon: PlaneTakeoff,
    title: "Travel & Flights",
    description: "Last-minute flights, upgrades, error fares, and flight + hotel bundles at huge savings.",
    stat: "11K deals/day",
  },
  {
    icon: Gem,
    title: "Luxury & Designer",
    description: "Authenticated designer fashion, watches, and luxury goods from sample sales and returns.",
    stat: "3.6K deals/day",
  },
  {
    icon: Apple,
    title: "Food & Grocery",
    description: "Restaurant surplus, cancelled meal kits, and wholesale grocery clearance at up to 75% off.",
    stat: "15K deals/day",
  },
];

const SectorShowcase = () => {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1920&q=80"
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.08]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Every Sector. <span className="gradient-text-gold">Zero Dead Air.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From salon chairs to shipping berths — we fill what others waste
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {sectors.map((sector, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 hover:border-primary/30 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <sector.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{sector.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{sector.description}</p>
              <div className="text-sm font-mono text-primary font-medium">{sector.stat}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectorShowcase;
