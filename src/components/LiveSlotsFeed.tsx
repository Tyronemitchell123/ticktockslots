import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, TrendingDown, Globe, ChevronDown, Search, X as XIcon, Radio, Wifi, ArrowLeftRight, Info, Star, CheckCircle2, Navigation, ArrowUpDown, Heart, Lock, Crown } from "lucide-react";
import SlotDetailModal from "./SlotDetailModal";
import { getVendorAddress, openMapLocation } from "@/lib/vendor-addresses";
import { supabase } from "@/integrations/supabase/client";
import { CURRENCIES, detectCurrency, formatPriceInCurrency } from "@/lib/currency";
import { getSlotRating } from "@/lib/mock-reviews";
import { useSavedSlots } from "@/hooks/use-saved-slots";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Slot {
  id: string;
  merchant: string;
  vertical: string;
  location: string;
  region: string;
  time: string;
  originalPrice: number;
  currentPrice: number;
  urgency: "critical" | "high" | "medium";
  timeLeft: number;
  isLive?: boolean;
  source?: string;
}

const MOCK_SLOTS: Slot[] = [
  // ===== UK =====
  { id: "1", merchant: "Luxe Hair Studio", vertical: "Beauty", location: "Manhattan, NY", region: "North America", time: "2:30 PM Today", originalPrice: 180, currentPrice: 89, urgency: "critical", timeLeft: 23 },
  { id: "13", merchant: "Harley Street Clinic", vertical: "Health", location: "London, UK", region: "UK", time: "10:30 AM Tomorrow", originalPrice: 400, currentPrice: 195, urgency: "high", timeLeft: 150 },
  { id: "14", merchant: "Sketch Restaurant", vertical: "Dining", location: "Mayfair, London", region: "UK", time: "8:00 PM Today", originalPrice: 380, currentPrice: 210, urgency: "critical", timeLeft: 35 },
  { id: "15", merchant: "Third Space Gym", vertical: "Fitness", location: "Soho, London", region: "UK", time: "6:30 AM Tomorrow", originalPrice: 55, currentPrice: 22, urgency: "medium", timeLeft: 480 },
  { id: "16", merchant: "King Street Barbers", vertical: "Beauty", location: "Manchester, UK", region: "UK", time: "1:00 PM Today", originalPrice: 65, currentPrice: 28, urgency: "critical", timeLeft: 18 },
  { id: "17", merchant: "Hawksmoor Manchester", vertical: "Dining", location: "Deansgate, Manchester", region: "UK", time: "7:00 PM Today", originalPrice: 290, currentPrice: 145, urgency: "high", timeLeft: 110 },
  { id: "18", merchant: "The Edgbaston Clinic", vertical: "Health", location: "Birmingham, UK", region: "UK", time: "9:00 AM Tomorrow", originalPrice: 320, currentPrice: 155, urgency: "medium", timeLeft: 390 },
  { id: "19", merchant: "Pure Gym Jewellery Qtr", vertical: "Fitness", location: "Birmingham, UK", region: "UK", time: "5:30 AM Tomorrow", originalPrice: 30, currentPrice: 12, urgency: "medium", timeLeft: 540 },
  { id: "20", merchant: "Timberyard Restaurant", vertical: "Dining", location: "Edinburgh, UK", region: "UK", time: "8:30 PM Today", originalPrice: 340, currentPrice: 180, urgency: "critical", timeLeft: 28 },
  { id: "21", merchant: "Edinburgh Dermatology", vertical: "Health", location: "New Town, Edinburgh", region: "UK", time: "2:00 PM Tomorrow", originalPrice: 275, currentPrice: 130, urgency: "high", timeLeft: 260 },
  { id: "22", merchant: "NetJets UK", vertical: "Aviation", location: "MAN → EDI", region: "UK", time: "4:00 PM Today", originalPrice: 8500, currentPrice: 2900, urgency: "high", timeLeft: 85 },
  { id: "59", merchant: "Ox Restaurant", vertical: "Dining", location: "Belfast, UK", region: "UK", time: "7:30 PM Today", originalPrice: 260, currentPrice: 130, urgency: "high", timeLeft: 95 },
  { id: "60", merchant: "Cowshed Spa", vertical: "Beauty", location: "Bristol, UK", region: "UK", time: "12:00 PM Today", originalPrice: 120, currentPrice: 52, urgency: "critical", timeLeft: 15 },
  { id: "61", merchant: "David Lloyd Leeds", vertical: "Fitness", location: "Leeds, UK", region: "UK", time: "6:00 AM Tomorrow", originalPrice: 48, currentPrice: 19, urgency: "medium", timeLeft: 500 },
  { id: "62", merchant: "The Ivy Glasgow", vertical: "Dining", location: "Glasgow, UK", region: "UK", time: "8:00 PM Today", originalPrice: 310, currentPrice: 165, urgency: "critical", timeLeft: 38 },
  { id: "63", merchant: "Spire Hospital", vertical: "Health", location: "Cardiff, UK", region: "UK", time: "11:00 AM Tomorrow", originalPrice: 340, currentPrice: 160, urgency: "medium", timeLeft: 350 },
  { id: "64", merchant: "Raby Hunt", vertical: "Dining", location: "Darlington, UK", region: "UK", time: "7:00 PM Today", originalPrice: 420, currentPrice: 220, urgency: "high", timeLeft: 125 },
  { id: "65", merchant: "Rudding Park Spa", vertical: "Beauty", location: "Harrogate, UK", region: "UK", time: "10:00 AM Tomorrow", originalPrice: 180, currentPrice: 78, urgency: "medium", timeLeft: 410 },
  { id: "66", merchant: "Nuffield Health", vertical: "Health", location: "Nottingham, UK", region: "UK", time: "3:00 PM Today", originalPrice: 280, currentPrice: 135, urgency: "high", timeLeft: 80 },
  { id: "67", merchant: "The Orangery Bath", vertical: "Dining", location: "Bath, UK", region: "UK", time: "1:00 PM Today", originalPrice: 230, currentPrice: 110, urgency: "critical", timeLeft: 22 },
  { id: "68", merchant: "VistaJet UK", vertical: "Aviation", location: "LHR → GLA", region: "UK", time: "3:30 PM Today", originalPrice: 7200, currentPrice: 2500, urgency: "high", timeLeft: 60 },
  { id: "69", merchant: "Port of Felixstowe", vertical: "Logistics", location: "Felixstowe, UK", region: "UK", time: "06:00 AM Wed", originalPrice: 5800, currentPrice: 2600, urgency: "high", timeLeft: 640 },
  { id: "70", merchant: "F45 Liverpool", vertical: "Fitness", location: "Liverpool, UK", region: "UK", time: "7:00 AM Tomorrow", originalPrice: 32, currentPrice: 13, urgency: "medium", timeLeft: 470 },
  { id: "71", merchant: "Moor Hall", vertical: "Dining", location: "Aughton, Lancashire", region: "UK", time: "8:30 PM Today", originalPrice: 480, currentPrice: 250, urgency: "critical", timeLeft: 19 },
  { id: "72", merchant: "Skin Clinic Cambridge", vertical: "Beauty", location: "Cambridge, UK", region: "UK", time: "2:30 PM Tomorrow", originalPrice: 150, currentPrice: 65, urgency: "medium", timeLeft: 430 },
  { id: "73", merchant: "Bupa Dental Oxford", vertical: "Health", location: "Oxford, UK", region: "UK", time: "4:00 PM Today", originalPrice: 220, currentPrice: 100, urgency: "high", timeLeft: 70 },
  { id: "100", merchant: "Kumon Kensington", vertical: "Education", location: "London, UK", region: "UK", time: "4:00 PM Today", originalPrice: 65, currentPrice: 28, urgency: "high", timeLeft: 90 },
  { id: "101", merchant: "BSM Driving School", vertical: "Education", location: "Manchester, UK", region: "UK", time: "10:00 AM Tomorrow", originalPrice: 40, currentPrice: 18, urgency: "medium", timeLeft: 380 },
  { id: "103", merchant: "West End Shows", vertical: "Events", location: "London, UK", region: "UK", time: "7:30 PM Today", originalPrice: 180, currentPrice: 72, urgency: "critical", timeLeft: 30 },
  { id: "106", merchant: "Kwik Fit MOT", vertical: "Automotive", location: "Birmingham, UK", region: "UK", time: "9:00 AM Tomorrow", originalPrice: 55, currentPrice: 25, urgency: "medium", timeLeft: 400 },
  { id: "107", merchant: "Halfords Autocentre", vertical: "Automotive", location: "Leeds, UK", region: "UK", time: "2:00 PM Today", originalPrice: 180, currentPrice: 85, urgency: "high", timeLeft: 75 },
  { id: "109", merchant: "Slater & Gordon", vertical: "Legal", location: "Manchester, UK", region: "UK", time: "11:00 AM Today", originalPrice: 280, currentPrice: 130, urgency: "high", timeLeft: 65 },
  { id: "110", merchant: "Irwin Mitchell", vertical: "Legal", location: "London, UK", region: "UK", time: "3:30 PM Today", originalPrice: 350, currentPrice: 165, urgency: "critical", timeLeft: 22 },
  { id: "112", merchant: "Foxtons Viewings", vertical: "Property", location: "London, UK", region: "UK", time: "12:00 PM Today", originalPrice: 0, currentPrice: 0, urgency: "critical", timeLeft: 35 },
  { id: "113", merchant: "Savills Valuations", vertical: "Property", location: "Edinburgh, UK", region: "UK", time: "2:00 PM Tomorrow", originalPrice: 450, currentPrice: 200, urgency: "medium", timeLeft: 420 },
  { id: "115", merchant: "Battersea Vets", vertical: "Pet Care", location: "London, UK", region: "UK", time: "9:30 AM Tomorrow", originalPrice: 85, currentPrice: 38, urgency: "medium", timeLeft: 360 },
  { id: "116", merchant: "Pets at Home Groom", vertical: "Pet Care", location: "Bristol, UK", region: "UK", time: "1:00 PM Today", originalPrice: 60, currentPrice: 25, urgency: "critical", timeLeft: 20 },
  // New UK slots
  { id: "200", merchant: "Toni & Guy Chelsea", vertical: "Beauty", location: "Chelsea, London", region: "UK", time: "3:00 PM Today", originalPrice: 95, currentPrice: 42, urgency: "high", timeLeft: 88 },
  { id: "201", merchant: "Gordon Ramsay Royal Hospital", vertical: "Dining", location: "Chelsea, London", region: "UK", time: "9:00 PM Today", originalPrice: 550, currentPrice: 290, urgency: "critical", timeLeft: 20 },
  { id: "202", merchant: "The Corinthia Spa", vertical: "Beauty", location: "Whitehall, London", region: "UK", time: "11:00 AM Today", originalPrice: 280, currentPrice: 125, urgency: "high", timeLeft: 115 },
  { id: "203", merchant: "Gymbox Bank", vertical: "Fitness", location: "City of London", region: "UK", time: "6:00 AM Tomorrow", originalPrice: 28, currentPrice: 11, urgency: "medium", timeLeft: 520 },
  { id: "204", merchant: "The Shard View", vertical: "Events", location: "London Bridge, London", region: "UK", time: "6:00 PM Today", originalPrice: 45, currentPrice: 18, urgency: "high", timeLeft: 72 },
  { id: "205", merchant: "AA Driving School", vertical: "Education", location: "Leeds, UK", region: "UK", time: "2:00 PM Today", originalPrice: 35, currentPrice: 15, urgency: "critical", timeLeft: 28 },
  { id: "206", merchant: "Arnold Clark Service", vertical: "Automotive", location: "Glasgow, UK", region: "UK", time: "10:00 AM Tomorrow", originalPrice: 220, currentPrice: 95, urgency: "medium", timeLeft: 370 },
  { id: "207", merchant: "DLA Piper", vertical: "Legal", location: "Leeds, UK", region: "UK", time: "4:00 PM Today", originalPrice: 400, currentPrice: 185, urgency: "high", timeLeft: 55 },
  { id: "208", merchant: "Knight Frank", vertical: "Property", location: "Kensington, London", region: "UK", time: "11:30 AM Today", originalPrice: 0, currentPrice: 0, urgency: "high", timeLeft: 90 },
  { id: "209", merchant: "Vets4Pets Edinburgh", vertical: "Pet Care", location: "Edinburgh, UK", region: "UK", time: "10:00 AM Tomorrow", originalPrice: 95, currentPrice: 42, urgency: "medium", timeLeft: 340 },
  { id: "210", merchant: "Port of Tilbury", vertical: "Logistics", location: "Tilbury, Essex", region: "UK", time: "05:00 AM Wed", originalPrice: 4200, currentPrice: 1800, urgency: "high", timeLeft: 580 },
  { id: "211", merchant: "Jet2 Charter", vertical: "Aviation", location: "LBA → FAO", region: "UK", time: "6:00 AM Tomorrow", originalPrice: 5200, currentPrice: 1800, urgency: "medium", timeLeft: 440 },
  { id: "212", merchant: "Bupa Cromwell Hospital", vertical: "Health", location: "Kensington, London", region: "UK", time: "1:00 PM Today", originalPrice: 480, currentPrice: 230, urgency: "critical", timeLeft: 25 },
  { id: "213", merchant: "Tattu Manchester", vertical: "Dining", location: "Spinningfields, Manchester", region: "UK", time: "8:00 PM Today", originalPrice: 260, currentPrice: 120, urgency: "high", timeLeft: 105 },
  { id: "214", merchant: "Pho Oxford", vertical: "Dining", location: "Oxford, UK", region: "UK", time: "12:30 PM Today", originalPrice: 80, currentPrice: 35, urgency: "critical", timeLeft: 16 },
  { id: "215", merchant: "Rush Hair Nottingham", vertical: "Beauty", location: "Nottingham, UK", region: "UK", time: "4:30 PM Today", originalPrice: 75, currentPrice: 32, urgency: "high", timeLeft: 68 },
  { id: "216", merchant: "Clifford Chance", vertical: "Legal", location: "Canary Wharf, London", region: "UK", time: "2:00 PM Today", originalPrice: 500, currentPrice: 240, urgency: "high", timeLeft: 45 },
  { id: "217", merchant: "Strutt & Parker", vertical: "Property", location: "Cheltenham, UK", region: "UK", time: "3:00 PM Tomorrow", originalPrice: 350, currentPrice: 150, urgency: "medium", timeLeft: 480 },
  { id: "218", merchant: "Edinburgh Fringe Late", vertical: "Events", location: "Edinburgh, UK", region: "UK", time: "10:00 PM Today", originalPrice: 35, currentPrice: 12, urgency: "critical", timeLeft: 14 },
  { id: "219", merchant: "Green Flag Breakdown", vertical: "Automotive", location: "Sheffield, UK", region: "UK", time: "8:00 AM Tomorrow", originalPrice: 120, currentPrice: 52, urgency: "medium", timeLeft: 400 },
  { id: "220", merchant: "Explore Learning", vertical: "Education", location: "Bristol, UK", region: "UK", time: "5:00 PM Today", originalPrice: 50, currentPrice: 22, urgency: "high", timeLeft: 62 },
  { id: "221", merchant: "PDSA Vet Clinic", vertical: "Pet Care", location: "Cardiff, UK", region: "UK", time: "11:00 AM Today", originalPrice: 65, currentPrice: 28, urgency: "high", timeLeft: 78 },

  // ===== NORTH AMERICA =====
  { id: "2", merchant: "Atlantic Charter", vertical: "Aviation", location: "TEB → MIA", region: "North America", time: "5:00 PM Today", originalPrice: 14500, currentPrice: 4200, urgency: "high", timeLeft: 67 },
  { id: "3", merchant: "Dr. Sarah Chen", vertical: "Health", location: "Beverly Hills, CA", region: "North America", time: "11:00 AM Tomorrow", originalPrice: 350, currentPrice: 175, urgency: "medium", timeLeft: 180 },
  { id: "6", merchant: "SoulCycle Tribeca", vertical: "Fitness", location: "New York, NY", region: "North America", time: "7:00 AM Tomorrow", originalPrice: 38, currentPrice: 15, urgency: "medium", timeLeft: 420 },
  { id: "23", merchant: "Drybar Chicago", vertical: "Beauty", location: "Chicago, IL", region: "North America", time: "3:00 PM Today", originalPrice: 95, currentPrice: 42, urgency: "high", timeLeft: 75 },
  { id: "24", merchant: "Wheels Up", vertical: "Aviation", location: "LAX → SFO", region: "North America", time: "6:00 PM Today", originalPrice: 9800, currentPrice: 3400, urgency: "critical", timeLeft: 40 },
  { id: "25", merchant: "Mayo Clinic Express", vertical: "Health", location: "Rochester, MN", region: "North America", time: "9:00 AM Tomorrow", originalPrice: 500, currentPrice: 240, urgency: "medium", timeLeft: 320 },
  { id: "26", merchant: "Canlis Restaurant", vertical: "Dining", location: "Seattle, WA", region: "North America", time: "7:30 PM Today", originalPrice: 420, currentPrice: 220, urgency: "high", timeLeft: 100 },
  { id: "27", merchant: "Barry's Miami", vertical: "Fitness", location: "Miami Beach, FL", region: "North America", time: "8:00 AM Tomorrow", originalPrice: 42, currentPrice: 18, urgency: "medium", timeLeft: 450 },
  { id: "28", merchant: "Port of Vancouver", vertical: "Logistics", location: "Vancouver, BC", region: "North America", time: "05:00 AM Wed", originalPrice: 7100, currentPrice: 3200, urgency: "high", timeLeft: 580 },
  { id: "29", merchant: "Ossington Dental", vertical: "Health", location: "Toronto, ON", region: "North America", time: "2:00 PM Today", originalPrice: 290, currentPrice: 140, urgency: "critical", timeLeft: 30 },
  { id: "102", merchant: "Princeton Tutors", vertical: "Education", location: "New York, NY", region: "North America", time: "3:00 PM Today", originalPrice: 120, currentPrice: 55, urgency: "critical", timeLeft: 25 },
  { id: "105", merchant: "Broadway Tickets", vertical: "Events", location: "New York, NY", region: "North America", time: "8:00 PM Today", originalPrice: 320, currentPrice: 140, urgency: "critical", timeLeft: 18 },
  { id: "111", merchant: "LegalZoom Consult", vertical: "Legal", location: "Los Angeles, CA", region: "North America", time: "1:00 PM Today", originalPrice: 200, currentPrice: 90, urgency: "medium", timeLeft: 250 },
  { id: "114", merchant: "Compass Realty", vertical: "Property", location: "San Francisco, CA", region: "North America", time: "10:00 AM Tomorrow", originalPrice: 0, currentPrice: 0, urgency: "high", timeLeft: 280 },
  { id: "117", merchant: "Banfield Pet Hospital", vertical: "Pet Care", location: "Chicago, IL", region: "North America", time: "3:00 PM Today", originalPrice: 120, currentPrice: 52, urgency: "high", timeLeft: 95 },
  // New North America
  { id: "300", merchant: "Nobu Malibu", vertical: "Dining", location: "Malibu, CA", region: "North America", time: "8:00 PM Today", originalPrice: 480, currentPrice: 240, urgency: "critical", timeLeft: 22 },
  { id: "301", merchant: "Equinox Hudson Yards", vertical: "Fitness", location: "New York, NY", region: "North America", time: "5:30 AM Tomorrow", originalPrice: 55, currentPrice: 22, urgency: "medium", timeLeft: 510 },
  { id: "302", merchant: "Tesla Service Center", vertical: "Automotive", location: "Austin, TX", region: "North America", time: "10:00 AM Tomorrow", originalPrice: 400, currentPrice: 180, urgency: "medium", timeLeft: 350 },
  { id: "303", merchant: "Perkins Coie LLP", vertical: "Legal", location: "Seattle, WA", region: "North America", time: "11:00 AM Today", originalPrice: 450, currentPrice: 210, urgency: "high", timeLeft: 78 },
  { id: "304", merchant: "Sotheby's Open House", vertical: "Property", location: "Manhattan, NY", region: "North America", time: "1:00 PM Today", originalPrice: 0, currentPrice: 0, urgency: "critical", timeLeft: 40 },
  { id: "305", merchant: "VCA Animal Hospital", vertical: "Pet Care", location: "Los Angeles, CA", region: "North America", time: "4:00 PM Today", originalPrice: 150, currentPrice: 65, urgency: "high", timeLeft: 85 },
  { id: "306", merchant: "Kaplan Test Prep", vertical: "Education", location: "Boston, MA", region: "North America", time: "6:00 PM Today", originalPrice: 80, currentPrice: 35, urgency: "high", timeLeft: 110 },
  { id: "307", merchant: "Madison Square Events", vertical: "Events", location: "New York, NY", region: "North America", time: "9:00 PM Today", originalPrice: 250, currentPrice: 110, urgency: "critical", timeLeft: 30 },
  { id: "308", merchant: "Port of Los Angeles", vertical: "Logistics", location: "San Pedro, CA", region: "North America", time: "04:00 AM Wed", originalPrice: 8800, currentPrice: 4100, urgency: "high", timeLeft: 620 },
  { id: "309", merchant: "Cedars-Sinai Urgent", vertical: "Health", location: "Los Angeles, CA", region: "North America", time: "1:30 PM Today", originalPrice: 380, currentPrice: 180, urgency: "critical", timeLeft: 28 },
  { id: "310", merchant: "Dry Bar Dallas", vertical: "Beauty", location: "Dallas, TX", region: "North America", time: "11:00 AM Today", originalPrice: 70, currentPrice: 30, urgency: "high", timeLeft: 92 },
  { id: "311", merchant: "NetJets USA", vertical: "Aviation", location: "ORD → ATL", region: "North America", time: "2:00 PM Today", originalPrice: 12000, currentPrice: 4100, urgency: "high", timeLeft: 55 },
  { id: "312", merchant: "Alinea Restaurant", vertical: "Dining", location: "Chicago, IL", region: "North America", time: "7:00 PM Today", originalPrice: 600, currentPrice: 310, urgency: "critical", timeLeft: 18 },
  { id: "313", merchant: "Orangetheory Denver", vertical: "Fitness", location: "Denver, CO", region: "North America", time: "6:00 AM Tomorrow", originalPrice: 35, currentPrice: 14, urgency: "medium", timeLeft: 490 },
  { id: "314", merchant: "Jiffy Lube Express", vertical: "Automotive", location: "Houston, TX", region: "North America", time: "9:00 AM Tomorrow", originalPrice: 90, currentPrice: 38, urgency: "medium", timeLeft: 410 },
  { id: "315", merchant: "Baker McKenzie", vertical: "Legal", location: "Chicago, IL", region: "North America", time: "2:30 PM Today", originalPrice: 380, currentPrice: 175, urgency: "high", timeLeft: 65 },
  { id: "316", merchant: "RE/MAX Phoenix", vertical: "Property", location: "Phoenix, AZ", region: "North America", time: "9:00 AM Tomorrow", originalPrice: 0, currentPrice: 0, urgency: "medium", timeLeft: 380 },
  { id: "317", merchant: "BluePearl Vet", vertical: "Pet Care", location: "Atlanta, GA", region: "North America", time: "5:00 PM Today", originalPrice: 200, currentPrice: 88, urgency: "high", timeLeft: 70 },

  // ===== EUROPE =====
  { id: "4", merchant: "Noma Restaurant", vertical: "Dining", location: "Copenhagen, DK", region: "Europe", time: "8:30 PM Today", originalPrice: 450, currentPrice: 280, urgency: "critical", timeLeft: 12 },
  { id: "5", merchant: "Port of Rotterdam", vertical: "Logistics", location: "Rotterdam, NL", region: "Europe", time: "06:00 AM Wed", originalPrice: 8200, currentPrice: 3900, urgency: "high", timeLeft: 340 },
  { id: "30", merchant: "Dolder Grand Spa", vertical: "Beauty", location: "Zürich, CH", region: "Europe", time: "11:00 AM Today", originalPrice: 380, currentPrice: 190, urgency: "high", timeLeft: 120 },
  { id: "31", merchant: "Ristorante Cracco", vertical: "Dining", location: "Milan, IT", region: "Europe", time: "9:00 PM Today", originalPrice: 480, currentPrice: 260, urgency: "critical", timeLeft: 22 },
  { id: "32", merchant: "CrossFit Eixample", vertical: "Fitness", location: "Barcelona, ES", region: "Europe", time: "7:00 AM Tomorrow", originalPrice: 35, currentPrice: 14, urgency: "medium", timeLeft: 490 },
  { id: "33", merchant: "Charité Klinik", vertical: "Health", location: "Berlin, DE", region: "Europe", time: "10:00 AM Tomorrow", originalPrice: 310, currentPrice: 155, urgency: "medium", timeLeft: 380 },
  { id: "34", merchant: "VistaJet Europe", vertical: "Aviation", location: "FCO → CDG", region: "Europe", time: "3:00 PM Today", originalPrice: 18000, currentPrice: 6200, urgency: "high", timeLeft: 90 },
  { id: "35", merchant: "Port of Hamburg", vertical: "Logistics", location: "Hamburg, DE", region: "Europe", time: "07:00 AM Thu", originalPrice: 6800, currentPrice: 3100, urgency: "high", timeLeft: 650 },
  { id: "108", merchant: "Tesla Service Berlin", vertical: "Automotive", location: "Berlin, DE", region: "Europe", time: "11:00 AM Tomorrow", originalPrice: 350, currentPrice: 160, urgency: "medium", timeLeft: 340 },
  // New Europe
  { id: "400", merchant: "Geranium Restaurant", vertical: "Dining", location: "Copenhagen, DK", region: "Europe", time: "7:00 PM Today", originalPrice: 520, currentPrice: 270, urgency: "high", timeLeft: 95 },
  { id: "401", merchant: "La Mamounia Spa", vertical: "Beauty", location: "Marrakech→Paris", region: "Europe", time: "10:00 AM Today", originalPrice: 340, currentPrice: 155, urgency: "high", timeLeft: 110 },
  { id: "402", merchant: "Technogym Milano", vertical: "Fitness", location: "Milan, IT", region: "Europe", time: "6:30 AM Tomorrow", originalPrice: 40, currentPrice: 16, urgency: "medium", timeLeft: 500 },
  { id: "403", merchant: "Universitätsklinikum", vertical: "Health", location: "Munich, DE", region: "Europe", time: "9:30 AM Tomorrow", originalPrice: 280, currentPrice: 130, urgency: "medium", timeLeft: 390 },
  { id: "404", merchant: "Berlitz Language", vertical: "Education", location: "Frankfurt, DE", region: "Europe", time: "2:00 PM Today", originalPrice: 90, currentPrice: 38, urgency: "high", timeLeft: 72 },
  { id: "405", merchant: "Salzburg Festival", vertical: "Events", location: "Salzburg, AT", region: "Europe", time: "8:00 PM Today", originalPrice: 300, currentPrice: 130, urgency: "critical", timeLeft: 25 },
  { id: "406", merchant: "Renault Service Lyon", vertical: "Automotive", location: "Lyon, FR", region: "Europe", time: "8:00 AM Tomorrow", originalPrice: 180, currentPrice: 78, urgency: "medium", timeLeft: 420 },
  { id: "407", merchant: "Hogan Lovells", vertical: "Legal", location: "Amsterdam, NL", region: "Europe", time: "11:00 AM Today", originalPrice: 380, currentPrice: 175, urgency: "high", timeLeft: 60 },
  { id: "408", merchant: "Engel & Völkers", vertical: "Property", location: "Barcelona, ES", region: "Europe", time: "12:00 PM Today", originalPrice: 0, currentPrice: 0, urgency: "critical", timeLeft: 32 },
  { id: "409", merchant: "AniCura Vet", vertical: "Pet Care", location: "Stockholm, SE", region: "Europe", time: "3:00 PM Today", originalPrice: 110, currentPrice: 48, urgency: "high", timeLeft: 88 },
  { id: "410", merchant: "Port of Antwerp", vertical: "Logistics", location: "Antwerp, BE", region: "Europe", time: "06:00 AM Thu", originalPrice: 7200, currentPrice: 3300, urgency: "high", timeLeft: 670 },
  { id: "411", merchant: "Air Partner Europe", vertical: "Aviation", location: "ZRH → BCN", region: "Europe", time: "4:00 PM Today", originalPrice: 11000, currentPrice: 3800, urgency: "high", timeLeft: 75 },
  { id: "412", merchant: "Osteria Francescana", vertical: "Dining", location: "Modena, IT", region: "Europe", time: "8:30 PM Today", originalPrice: 600, currentPrice: 320, urgency: "critical", timeLeft: 15 },
  { id: "413", merchant: "David Lloyd Madrid", vertical: "Fitness", location: "Madrid, ES", region: "Europe", time: "7:00 AM Tomorrow", originalPrice: 38, currentPrice: 15, urgency: "medium", timeLeft: 480 },
  { id: "414", merchant: "Therme Erding Spa", vertical: "Beauty", location: "Munich, DE", region: "Europe", time: "1:00 PM Today", originalPrice: 120, currentPrice: 52, urgency: "high", timeLeft: 82 },
  { id: "415", merchant: "Goethe-Institut", vertical: "Education", location: "Berlin, DE", region: "Europe", time: "10:00 AM Tomorrow", originalPrice: 75, currentPrice: 32, urgency: "medium", timeLeft: 360 },
  { id: "416", merchant: "La Scala Opera", vertical: "Events", location: "Milan, IT", region: "Europe", time: "8:00 PM Today", originalPrice: 280, currentPrice: 120, urgency: "critical", timeLeft: 20 },
  { id: "417", merchant: "Volvo Service", vertical: "Automotive", location: "Gothenburg, SE", region: "Europe", time: "9:00 AM Tomorrow", originalPrice: 250, currentPrice: 110, urgency: "medium", timeLeft: 380 },
  { id: "418", merchant: "White & Case", vertical: "Legal", location: "Paris, FR", region: "Europe", time: "3:00 PM Today", originalPrice: 420, currentPrice: 195, urgency: "high", timeLeft: 55 },

  // ===== ASIA PACIFIC =====
  { id: "7", merchant: "Mandarin Spa", vertical: "Beauty", location: "Hong Kong, HK", region: "Asia Pacific", time: "4:00 PM Today", originalPrice: 320, currentPrice: 160, urgency: "high", timeLeft: 95 },
  { id: "36", merchant: "Sulwhasoo Spa", vertical: "Beauty", location: "Seoul, KR", region: "Asia Pacific", time: "2:00 PM Today", originalPrice: 280, currentPrice: 130, urgency: "high", timeLeft: 105 },
  { id: "37", merchant: "Narisawa Restaurant", vertical: "Dining", location: "Tokyo, JP", region: "Asia Pacific", time: "8:00 PM Today", originalPrice: 550, currentPrice: 290, urgency: "critical", timeLeft: 15 },
  { id: "38", merchant: "Apollo Clinic", vertical: "Health", location: "Mumbai, IN", region: "Asia Pacific", time: "11:30 AM Tomorrow", originalPrice: 180, currentPrice: 75, urgency: "medium", timeLeft: 440 },
  { id: "39", merchant: "F45 Training", vertical: "Fitness", location: "Singapore, SG", region: "Asia Pacific", time: "6:00 AM Tomorrow", originalPrice: 50, currentPrice: 20, urgency: "medium", timeLeft: 520 },
  { id: "40", merchant: "Cathay Pacific Jet", vertical: "Aviation", location: "HKG → NRT", region: "Asia Pacific", time: "5:00 PM Today", originalPrice: 16000, currentPrice: 5500, urgency: "high", timeLeft: 70 },
  { id: "41", merchant: "Port of Shanghai", vertical: "Logistics", location: "Shanghai, CN", region: "Asia Pacific", time: "06:00 AM Wed", originalPrice: 9200, currentPrice: 4100, urgency: "high", timeLeft: 600 },
  { id: "11", merchant: "Bondi Fitness", vertical: "Fitness", location: "Sydney, AU", region: "Asia Pacific", time: "6:00 AM Tomorrow", originalPrice: 45, currentPrice: 18, urgency: "medium", timeLeft: 510 },
  { id: "104", merchant: "Sydney Opera House", vertical: "Events", location: "Sydney, AU", region: "Asia Pacific", time: "8:00 PM Today", originalPrice: 250, currentPrice: 110, urgency: "high", timeLeft: 105 },
  // New Asia Pacific
  { id: "500", merchant: "Den Restaurant", vertical: "Dining", location: "Tokyo, JP", region: "Asia Pacific", time: "7:30 PM Today", originalPrice: 480, currentPrice: 250, urgency: "critical", timeLeft: 22 },
  { id: "501", merchant: "Banyan Tree Spa", vertical: "Beauty", location: "Bangkok, TH", region: "Asia Pacific", time: "3:00 PM Today", originalPrice: 200, currentPrice: 85, urgency: "high", timeLeft: 90 },
  { id: "502", merchant: "Fortis Hospital", vertical: "Health", location: "Delhi, IN", region: "Asia Pacific", time: "10:00 AM Tomorrow", originalPrice: 220, currentPrice: 95, urgency: "medium", timeLeft: 380 },
  { id: "503", merchant: "Kumon Japan", vertical: "Education", location: "Osaka, JP", region: "Asia Pacific", time: "4:00 PM Today", originalPrice: 55, currentPrice: 24, urgency: "high", timeLeft: 80 },
  { id: "504", merchant: "K-League Match", vertical: "Events", location: "Seoul, KR", region: "Asia Pacific", time: "7:00 PM Today", originalPrice: 120, currentPrice: 50, urgency: "critical", timeLeft: 35 },
  { id: "505", merchant: "Toyota Service", vertical: "Automotive", location: "Tokyo, JP", region: "Asia Pacific", time: "9:00 AM Tomorrow", originalPrice: 280, currentPrice: 125, urgency: "medium", timeLeft: 400 },
  { id: "506", merchant: "Rajah & Tann", vertical: "Legal", location: "Singapore, SG", region: "Asia Pacific", time: "11:00 AM Today", originalPrice: 350, currentPrice: 160, urgency: "high", timeLeft: 65 },
  { id: "507", merchant: "CBRE Melbourne", vertical: "Property", location: "Melbourne, AU", region: "Asia Pacific", time: "2:00 PM Tomorrow", originalPrice: 0, currentPrice: 0, urgency: "medium", timeLeft: 420 },
  { id: "508", merchant: "Greencross Vets", vertical: "Pet Care", location: "Sydney, AU", region: "Asia Pacific", time: "10:00 AM Today", originalPrice: 130, currentPrice: 55, urgency: "high", timeLeft: 85 },
  { id: "509", merchant: "Port of Singapore", vertical: "Logistics", location: "Singapore, SG", region: "Asia Pacific", time: "05:00 AM Wed", originalPrice: 10500, currentPrice: 4800, urgency: "high", timeLeft: 640 },
  { id: "510", merchant: "Deer Jet Asia", vertical: "Aviation", location: "PVG → HND", region: "Asia Pacific", time: "3:00 PM Today", originalPrice: 13000, currentPrice: 4500, urgency: "high", timeLeft: 60 },
  { id: "511", merchant: "Virgin Active HK", vertical: "Fitness", location: "Central, Hong Kong", region: "Asia Pacific", time: "6:30 AM Tomorrow", originalPrice: 42, currentPrice: 17, urgency: "medium", timeLeft: 510 },
  { id: "512", merchant: "Gaggan Restaurant", vertical: "Dining", location: "Bangkok, TH", region: "Asia Pacific", time: "8:30 PM Today", originalPrice: 380, currentPrice: 190, urgency: "critical", timeLeft: 18 },
  { id: "513", merchant: "Bumrungrad Hospital", vertical: "Health", location: "Bangkok, TH", region: "Asia Pacific", time: "9:00 AM Tomorrow", originalPrice: 300, currentPrice: 135, urgency: "medium", timeLeft: 370 },
  { id: "514", merchant: "Hyundai Service Centre", vertical: "Automotive", location: "Seoul, KR", region: "Asia Pacific", time: "2:00 PM Today", originalPrice: 190, currentPrice: 82, urgency: "high", timeLeft: 75 },
  { id: "515", merchant: "British Council HK", vertical: "Education", location: "Hong Kong, HK", region: "Asia Pacific", time: "5:00 PM Today", originalPrice: 95, currentPrice: 42, urgency: "high", timeLeft: 68 },

  // ===== MIDDLE EAST =====
  { id: "8", merchant: "Emirates Jet", vertical: "Aviation", location: "DXB → LHR", region: "Middle East", time: "9:00 PM Today", originalPrice: 22000, currentPrice: 7800, urgency: "critical", timeLeft: 45 },
  { id: "42", merchant: "Talise Spa", vertical: "Beauty", location: "Dubai, AE", region: "Middle East", time: "3:00 PM Today", originalPrice: 450, currentPrice: 210, urgency: "high", timeLeft: 88 },
  { id: "43", merchant: "Zuma Dubai", vertical: "Dining", location: "DIFC, Dubai", region: "Middle East", time: "9:00 PM Today", originalPrice: 380, currentPrice: 195, urgency: "critical", timeLeft: 25 },
  { id: "44", merchant: "Cleveland Clinic AD", vertical: "Health", location: "Abu Dhabi, AE", region: "Middle East", time: "10:00 AM Tomorrow", originalPrice: 420, currentPrice: 200, urgency: "medium", timeLeft: 360 },
  { id: "45", merchant: "GoldGym Riyadh", vertical: "Fitness", location: "Riyadh, SA", region: "Middle East", time: "5:30 AM Tomorrow", originalPrice: 60, currentPrice: 25, urgency: "medium", timeLeft: 500 },
  { id: "46", merchant: "Jebel Ali Port", vertical: "Logistics", location: "Jebel Ali, AE", region: "Middle East", time: "04:00 AM Thu", originalPrice: 7500, currentPrice: 3400, urgency: "high", timeLeft: 680 },
  // New Middle East
  { id: "600", merchant: "Nobu Dubai", vertical: "Dining", location: "Atlantis, Dubai", region: "Middle East", time: "8:00 PM Today", originalPrice: 420, currentPrice: 210, urgency: "critical", timeLeft: 20 },
  { id: "601", merchant: "Hammam Al Ándalus", vertical: "Beauty", location: "Dubai, AE", region: "Middle East", time: "2:00 PM Today", originalPrice: 250, currentPrice: 110, urgency: "high", timeLeft: 85 },
  { id: "602", merchant: "King Faisal Hospital", vertical: "Health", location: "Riyadh, SA", region: "Middle East", time: "9:00 AM Tomorrow", originalPrice: 350, currentPrice: 155, urgency: "medium", timeLeft: 380 },
  { id: "603", merchant: "Sylvan Learning", vertical: "Education", location: "Dubai, AE", region: "Middle East", time: "4:00 PM Today", originalPrice: 80, currentPrice: 35, urgency: "high", timeLeft: 72 },
  { id: "604", merchant: "Dubai Opera Gala", vertical: "Events", location: "Downtown, Dubai", region: "Middle East", time: "8:30 PM Today", originalPrice: 350, currentPrice: 150, urgency: "critical", timeLeft: 28 },
  { id: "605", merchant: "Al Futtaim Toyota", vertical: "Automotive", location: "Dubai, AE", region: "Middle East", time: "10:00 AM Tomorrow", originalPrice: 300, currentPrice: 130, urgency: "medium", timeLeft: 350 },
  { id: "606", merchant: "Al Tamimi & Co", vertical: "Legal", location: "DIFC, Dubai", region: "Middle East", time: "12:00 PM Today", originalPrice: 400, currentPrice: 185, urgency: "high", timeLeft: 55 },
  { id: "607", merchant: "Allsopp & Allsopp", vertical: "Property", location: "Dubai Marina, AE", region: "Middle East", time: "11:00 AM Today", originalPrice: 0, currentPrice: 0, urgency: "high", timeLeft: 90 },
  { id: "608", merchant: "Modern Vet Dubai", vertical: "Pet Care", location: "Jumeirah, Dubai", region: "Middle East", time: "1:00 PM Today", originalPrice: 140, currentPrice: 60, urgency: "critical", timeLeft: 22 },
  { id: "609", merchant: "Fitness First Doha", vertical: "Fitness", location: "Doha, QA", region: "Middle East", time: "6:00 AM Tomorrow", originalPrice: 45, currentPrice: 18, urgency: "medium", timeLeft: 490 },
  { id: "610", merchant: "Qatar Exec Jet", vertical: "Aviation", location: "DOH → BAH", region: "Middle East", time: "4:00 PM Today", originalPrice: 8500, currentPrice: 2900, urgency: "high", timeLeft: 65 },
  { id: "611", merchant: "Nusr-Et Steakhouse", vertical: "Dining", location: "Istanbul, TR", region: "Middle East", time: "9:00 PM Today", originalPrice: 350, currentPrice: 175, urgency: "high", timeLeft: 100 },

  // ===== LATIN AMERICA =====
  { id: "9", merchant: "São Paulo Medical", vertical: "Health", location: "São Paulo, BR", region: "Latin America", time: "3:00 PM Tomorrow", originalPrice: 280, currentPrice: 120, urgency: "medium", timeLeft: 600 },
  { id: "47", merchant: "Salón Bó", vertical: "Beauty", location: "Mexico City, MX", region: "Latin America", time: "1:00 PM Today", originalPrice: 120, currentPrice: 55, urgency: "critical", timeLeft: 20 },
  { id: "48", merchant: "Don Julio Parrilla", vertical: "Dining", location: "Buenos Aires, AR", region: "Latin America", time: "9:30 PM Today", originalPrice: 310, currentPrice: 160, urgency: "high", timeLeft: 115 },
  { id: "49", merchant: "Hospital Israelita", vertical: "Health", location: "São Paulo, BR", region: "Latin America", time: "8:00 AM Tomorrow", originalPrice: 350, currentPrice: 165, urgency: "medium", timeLeft: 410 },
  { id: "50", merchant: "SmartFit Bogotá", vertical: "Fitness", location: "Bogotá, CO", region: "Latin America", time: "6:00 AM Tomorrow", originalPrice: 25, currentPrice: 10, urgency: "medium", timeLeft: 530 },
  { id: "51", merchant: "LATAM Charter", vertical: "Aviation", location: "GRU → EZE", region: "Latin America", time: "4:00 PM Today", originalPrice: 11000, currentPrice: 3800, urgency: "high", timeLeft: 80 },
  { id: "52", merchant: "Port of Santos", vertical: "Logistics", location: "Santos, BR", region: "Latin America", time: "06:00 AM Wed", originalPrice: 6200, currentPrice: 2800, urgency: "high", timeLeft: 620 },
  // New Latin America
  { id: "700", merchant: "Pujol Restaurant", vertical: "Dining", location: "Mexico City, MX", region: "Latin America", time: "8:00 PM Today", originalPrice: 420, currentPrice: 210, urgency: "critical", timeLeft: 22 },
  { id: "701", merchant: "BodyTech Lima", vertical: "Fitness", location: "Lima, PE", region: "Latin America", time: "6:30 AM Tomorrow", originalPrice: 30, currentPrice: 12, urgency: "medium", timeLeft: 500 },
  { id: "702", merchant: "Spa Six Senses Cartagena", vertical: "Beauty", location: "Cartagena, CO", region: "Latin America", time: "11:00 AM Today", originalPrice: 180, currentPrice: 78, urgency: "high", timeLeft: 95 },
  { id: "703", merchant: "Clínica Alemana", vertical: "Health", location: "Santiago, CL", region: "Latin America", time: "10:00 AM Tomorrow", originalPrice: 300, currentPrice: 135, urgency: "medium", timeLeft: 380 },
  { id: "704", merchant: "EF Language School", vertical: "Education", location: "Buenos Aires, AR", region: "Latin America", time: "3:00 PM Today", originalPrice: 65, currentPrice: 28, urgency: "high", timeLeft: 78 },
  { id: "705", merchant: "Rock in Rio Late", vertical: "Events", location: "Rio de Janeiro, BR", region: "Latin America", time: "9:00 PM Today", originalPrice: 200, currentPrice: 85, urgency: "critical", timeLeft: 30 },
  { id: "706", merchant: "Volkswagen Service", vertical: "Automotive", location: "Mexico City, MX", region: "Latin America", time: "9:00 AM Tomorrow", originalPrice: 150, currentPrice: 65, urgency: "medium", timeLeft: 400 },
  { id: "707", merchant: "Garrigues Law", vertical: "Legal", location: "Bogotá, CO", region: "Latin America", time: "11:00 AM Today", originalPrice: 250, currentPrice: 110, urgency: "high", timeLeft: 62 },
  { id: "708", merchant: "Century 21 Mexico", vertical: "Property", location: "Mexico City, MX", region: "Latin America", time: "1:00 PM Today", originalPrice: 0, currentPrice: 0, urgency: "critical", timeLeft: 38 },
  { id: "709", merchant: "Pet Shop Buenos Aires", vertical: "Pet Care", location: "Buenos Aires, AR", region: "Latin America", time: "2:00 PM Today", originalPrice: 80, currentPrice: 35, urgency: "high", timeLeft: 88 },
  { id: "710", merchant: "Port of Callao", vertical: "Logistics", location: "Lima, PE", region: "Latin America", time: "05:00 AM Wed", originalPrice: 5100, currentPrice: 2200, urgency: "high", timeLeft: 610 },
  { id: "711", merchant: "Azul Jet Charter", vertical: "Aviation", location: "GIG → LIM", region: "Latin America", time: "3:00 PM Today", originalPrice: 9800, currentPrice: 3400, urgency: "high", timeLeft: 72 },

  // ===== AFRICA =====
  { id: "53", merchant: "Skin Renewal Clinic", vertical: "Beauty", location: "Cape Town, ZA", region: "Africa", time: "11:00 AM Today", originalPrice: 200, currentPrice: 85, urgency: "high", timeLeft: 100 },
  { id: "54", merchant: "La Colombe Restaurant", vertical: "Dining", location: "Constantia, Cape Town", region: "Africa", time: "7:00 PM Today", originalPrice: 340, currentPrice: 170, urgency: "critical", timeLeft: 32 },
  { id: "55", merchant: "Aga Khan Hospital", vertical: "Health", location: "Nairobi, KE", region: "Africa", time: "9:00 AM Tomorrow", originalPrice: 240, currentPrice: 105, urgency: "medium", timeLeft: 400 },
  { id: "56", merchant: "Planet Fitness Lagos", vertical: "Fitness", location: "Lagos, NG", region: "Africa", time: "6:00 AM Tomorrow", originalPrice: 35, currentPrice: 14, urgency: "medium", timeLeft: 510 },
  { id: "57", merchant: "ExecuJet Africa", vertical: "Aviation", location: "JNB → CPT", region: "Africa", time: "2:00 PM Today", originalPrice: 9500, currentPrice: 3200, urgency: "high", timeLeft: 65 },
  { id: "58", merchant: "Port of Durban", vertical: "Logistics", location: "Durban, ZA", region: "Africa", time: "05:00 AM Thu", originalPrice: 4800, currentPrice: 2100, urgency: "high", timeLeft: 700 },
  { id: "12", merchant: "Mombasa Port", vertical: "Logistics", location: "Mombasa, KE", region: "Africa", time: "08:00 AM Thu", originalPrice: 5400, currentPrice: 2200, urgency: "high", timeLeft: 720 },
  // New Africa
  { id: "800", merchant: "The Test Kitchen", vertical: "Dining", location: "Cape Town, ZA", region: "Africa", time: "8:00 PM Today", originalPrice: 380, currentPrice: 190, urgency: "critical", timeLeft: 20 },
  { id: "801", merchant: "Healing Hands Spa", vertical: "Beauty", location: "Johannesburg, ZA", region: "Africa", time: "1:00 PM Today", originalPrice: 160, currentPrice: 70, urgency: "high", timeLeft: 85 },
  { id: "802", merchant: "Netcare Hospital", vertical: "Health", location: "Johannesburg, ZA", region: "Africa", time: "10:00 AM Tomorrow", originalPrice: 300, currentPrice: 135, urgency: "medium", timeLeft: 380 },
  { id: "803", merchant: "Alliance Française", vertical: "Education", location: "Nairobi, KE", region: "Africa", time: "4:00 PM Today", originalPrice: 55, currentPrice: 24, urgency: "high", timeLeft: 72 },
  { id: "804", merchant: "Cape Town Jazz Fest", vertical: "Events", location: "Cape Town, ZA", region: "Africa", time: "8:30 PM Today", originalPrice: 180, currentPrice: 78, urgency: "critical", timeLeft: 25 },
  { id: "805", merchant: "CMC Motors Service", vertical: "Automotive", location: "Nairobi, KE", region: "Africa", time: "9:00 AM Tomorrow", originalPrice: 140, currentPrice: 60, urgency: "medium", timeLeft: 390 },
  { id: "806", merchant: "ENS Africa Law", vertical: "Legal", location: "Johannesburg, ZA", region: "Africa", time: "11:00 AM Today", originalPrice: 280, currentPrice: 125, urgency: "high", timeLeft: 58 },
  { id: "807", merchant: "Pam Golding Property", vertical: "Property", location: "Cape Town, ZA", region: "Africa", time: "2:00 PM Tomorrow", originalPrice: 0, currentPrice: 0, urgency: "medium", timeLeft: 420 },
  { id: "808", merchant: "Vetcare Kenya", vertical: "Pet Care", location: "Nairobi, KE", region: "Africa", time: "10:00 AM Today", originalPrice: 75, currentPrice: 32, urgency: "high", timeLeft: 80 },
  { id: "809", merchant: "Virgin Active JHB", vertical: "Fitness", location: "Sandton, Johannesburg", region: "Africa", time: "6:00 AM Tomorrow", originalPrice: 40, currentPrice: 16, urgency: "medium", timeLeft: 500 },
  { id: "810", merchant: "FlexJet Africa", vertical: "Aviation", location: "CPT → NBO", region: "Africa", time: "3:00 PM Today", originalPrice: 11000, currentPrice: 3800, urgency: "high", timeLeft: 68 },
  { id: "811", merchant: "Wolfgat Restaurant", vertical: "Dining", location: "Paternoster, ZA", region: "Africa", time: "7:00 PM Today", originalPrice: 290, currentPrice: 140, urgency: "high", timeLeft: 105 },
  { id: "812", merchant: "Port of Lagos", vertical: "Logistics", location: "Lagos, NG", region: "Africa", time: "06:00 AM Wed", originalPrice: 4500, currentPrice: 1900, urgency: "high", timeLeft: 650 },

  // ===== ADDITIONAL UK SLOTS =====
  { id: "900", merchant: "Dishoom Shoreditch", vertical: "Dining", location: "Shoreditch, London", region: "UK", time: "1:00 PM Today", originalPrice: 120, currentPrice: 52, urgency: "critical", timeLeft: 12 },
  { id: "901", merchant: "Sanctuary Spa Covent Garden", vertical: "Beauty", location: "Covent Garden, London", region: "UK", time: "3:30 PM Today", originalPrice: 210, currentPrice: 95, urgency: "high", timeLeft: 78 },
  { id: "902", merchant: "PureGym Camden", vertical: "Fitness", location: "Camden, London", region: "UK", time: "7:00 AM Tomorrow", originalPrice: 22, currentPrice: 9, urgency: "medium", timeLeft: 530 },
  { id: "903", merchant: "Barts Health NHS", vertical: "Health", location: "City of London", region: "UK", time: "11:00 AM Tomorrow", originalPrice: 350, currentPrice: 170, urgency: "medium", timeLeft: 400 },
  { id: "904", merchant: "The Ivy Manchester", vertical: "Dining", location: "Spinningfields, Manchester", region: "UK", time: "7:30 PM Today", originalPrice: 280, currentPrice: 135, urgency: "high", timeLeft: 95 },
  { id: "905", merchant: "Headmasters Islington", vertical: "Beauty", location: "Islington, London", region: "UK", time: "2:00 PM Today", originalPrice: 85, currentPrice: 38, urgency: "critical", timeLeft: 16 },
  { id: "906", merchant: "CrossFit London", vertical: "Fitness", location: "Bethnal Green, London", region: "UK", time: "6:00 AM Tomorrow", originalPrice: 35, currentPrice: 14, urgency: "medium", timeLeft: 490 },
  { id: "907", merchant: "The Fat Duck", vertical: "Dining", location: "Bray, Berkshire", region: "UK", time: "8:00 PM Today", originalPrice: 650, currentPrice: 340, urgency: "critical", timeLeft: 25 },
  { id: "908", merchant: "Harvey Nichols Beauty", vertical: "Beauty", location: "Knightsbridge, London", region: "UK", time: "4:00 PM Today", originalPrice: 160, currentPrice: 72, urgency: "high", timeLeft: 65 },
  { id: "909", merchant: "Virgin Atlantic Upper", vertical: "Aviation", location: "LHR → JFK", region: "UK", time: "6:00 PM Today", originalPrice: 6800, currentPrice: 2400, urgency: "critical", timeLeft: 42 },
  { id: "910", merchant: "Port of Southampton", vertical: "Logistics", location: "Southampton, UK", region: "UK", time: "07:00 AM Thu", originalPrice: 4800, currentPrice: 2100, urgency: "high", timeLeft: 590 },
  { id: "911", merchant: "Kumon Westminster", vertical: "Education", location: "Westminster, London", region: "UK", time: "5:00 PM Today", originalPrice: 70, currentPrice: 30, urgency: "high", timeLeft: 58 },
  { id: "912", merchant: "National Theatre", vertical: "Events", location: "South Bank, London", region: "UK", time: "7:30 PM Today", originalPrice: 95, currentPrice: 38, urgency: "critical", timeLeft: 20 },
  { id: "913", merchant: "Mercedes-Benz Service", vertical: "Automotive", location: "Stratford, London", region: "UK", time: "10:00 AM Tomorrow", originalPrice: 350, currentPrice: 155, urgency: "medium", timeLeft: 380 },
  { id: "914", merchant: "Herbert Smith Freehills", vertical: "Legal", location: "Exchange Square, London", region: "UK", time: "3:00 PM Today", originalPrice: 520, currentPrice: 245, urgency: "high", timeLeft: 48 },
  { id: "915", merchant: "Hamptons International", vertical: "Property", location: "Hampstead, London", region: "UK", time: "12:30 PM Today", originalPrice: 0, currentPrice: 0, urgency: "critical", timeLeft: 30 },
  { id: "916", merchant: "Blue Cross Vet", vertical: "Pet Care", location: "Victoria, London", region: "UK", time: "2:30 PM Today", originalPrice: 110, currentPrice: 48, urgency: "high", timeLeft: 72 },

  // ===== ADDITIONAL NORTH AMERICA =====
  { id: "920", merchant: "Eleven Madison Park", vertical: "Dining", location: "Manhattan, NY", region: "North America", time: "7:00 PM Today", originalPrice: 700, currentPrice: 365, urgency: "critical", timeLeft: 15 },
  { id: "921", merchant: "Drybar Beverly Hills", vertical: "Beauty", location: "Beverly Hills, CA", region: "North America", time: "11:00 AM Today", originalPrice: 105, currentPrice: 45, urgency: "high", timeLeft: 88 },
  { id: "922", merchant: "Peloton Studio NYC", vertical: "Fitness", location: "Chelsea, NY", region: "North America", time: "8:00 AM Tomorrow", originalPrice: 48, currentPrice: 19, urgency: "medium", timeLeft: 460 },
  { id: "923", merchant: "Cleveland Clinic FL", vertical: "Health", location: "Weston, FL", region: "North America", time: "9:30 AM Tomorrow", originalPrice: 420, currentPrice: 195, urgency: "medium", timeLeft: 340 },
  { id: "924", merchant: "Per Se Restaurant", vertical: "Dining", location: "Columbus Circle, NY", region: "North America", time: "8:30 PM Today", originalPrice: 550, currentPrice: 280, urgency: "critical", timeLeft: 22 },
  { id: "925", merchant: "Blade Helicopters", vertical: "Aviation", location: "JFK → EWR", region: "North America", time: "4:30 PM Today", originalPrice: 3500, currentPrice: 1200, urgency: "high", timeLeft: 55 },
  { id: "926", merchant: "Port of Houston", vertical: "Logistics", location: "Houston, TX", region: "North America", time: "05:00 AM Thu", originalPrice: 7600, currentPrice: 3400, urgency: "high", timeLeft: 660 },

  // ===== ADDITIONAL EUROPE =====
  { id: "930", merchant: "El Celler de Can Roca", vertical: "Dining", location: "Girona, ES", region: "Europe", time: "9:00 PM Today", originalPrice: 500, currentPrice: 260, urgency: "critical", timeLeft: 18 },
  { id: "931", merchant: "Terme di Saturnia", vertical: "Beauty", location: "Tuscany, IT", region: "Europe", time: "10:00 AM Today", originalPrice: 220, currentPrice: 95, urgency: "high", timeLeft: 100 },
  { id: "932", merchant: "Barry's Bootcamp Paris", vertical: "Fitness", location: "Le Marais, Paris", region: "Europe", time: "7:00 AM Tomorrow", originalPrice: 38, currentPrice: 15, urgency: "medium", timeLeft: 480 },
  { id: "933", merchant: "Helios Klinikum", vertical: "Health", location: "Berlin, DE", region: "Europe", time: "2:00 PM Tomorrow", originalPrice: 350, currentPrice: 160, urgency: "medium", timeLeft: 420 },
  { id: "934", merchant: "Steirereck Restaurant", vertical: "Dining", location: "Vienna, AT", region: "Europe", time: "8:00 PM Today", originalPrice: 420, currentPrice: 210, urgency: "high", timeLeft: 90 },
  { id: "935", merchant: "Louvre Museum VIP", vertical: "Events", location: "Paris, FR", region: "Europe", time: "10:00 AM Today", originalPrice: 150, currentPrice: 65, urgency: "critical", timeLeft: 28 },

  // ===== ADDITIONAL ASIA PACIFIC =====
  { id: "940", merchant: "Jiro Sushi Ginza", vertical: "Dining", location: "Ginza, Tokyo", region: "Asia Pacific", time: "12:00 PM Today", originalPrice: 480, currentPrice: 250, urgency: "critical", timeLeft: 10 },
  { id: "941", merchant: "Thann Sanctuary Spa", vertical: "Beauty", location: "Bangkok, TH", region: "Asia Pacific", time: "2:00 PM Today", originalPrice: 150, currentPrice: 65, urgency: "high", timeLeft: 95 },
  { id: "942", merchant: "Anytime Fitness Tokyo", vertical: "Fitness", location: "Shibuya, Tokyo", region: "Asia Pacific", time: "6:00 AM Tomorrow", originalPrice: 35, currentPrice: 14, urgency: "medium", timeLeft: 510 },
  { id: "943", merchant: "Mount Elizabeth Hospital", vertical: "Health", location: "Singapore, SG", region: "Asia Pacific", time: "11:00 AM Tomorrow", originalPrice: 380, currentPrice: 175, urgency: "medium", timeLeft: 390 },

  // ===== ADDITIONAL MIDDLE EAST =====
  { id: "950", merchant: "Ossiano Restaurant", vertical: "Dining", location: "Atlantis, Dubai", region: "Middle East", time: "9:00 PM Today", originalPrice: 550, currentPrice: 280, urgency: "critical", timeLeft: 22 },
  { id: "951", merchant: "Amara Spa Dubai", vertical: "Beauty", location: "JBR, Dubai", region: "Middle East", time: "11:00 AM Today", originalPrice: 300, currentPrice: 135, urgency: "high", timeLeft: 85 },
  { id: "952", merchant: "Saudi German Hospital", vertical: "Health", location: "Jeddah, SA", region: "Middle East", time: "10:00 AM Tomorrow", originalPrice: 280, currentPrice: 125, urgency: "medium", timeLeft: 370 },
];


const REGIONS = [
  { id: "all", label: "🌍 All Regions", flag: "" },
  { id: "North America", label: "North America", flag: "🇺🇸" },
  { id: "UK", label: "UK / London", flag: "🇬🇧" },
  { id: "Europe", label: "Europe", flag: "🇪🇺" },
  { id: "Asia Pacific", label: "Asia Pacific", flag: "🌏" },
  { id: "Middle East", label: "Middle East", flag: "🕌" },
  { id: "Latin America", label: "Latin America", flag: "🌎" },
  { id: "Africa", label: "Africa", flag: "🌍" },
];

const urgencyColors = {
  critical: "bg-destructive/20 text-destructive border-destructive/30",
  high: "bg-secondary/20 text-secondary border-secondary/30",
  medium: "bg-primary/20 text-primary border-primary/30",
};

const SLOT_DETAILS: Record<string, { description: string; includes: string[]; ideal: string }> = {
  Beauty: {
    description: "Premium beauty & grooming appointment released due to last-minute cancellation.",
    includes: ["Full service as originally booked", "Same stylist / therapist", "Premium products included", "No service downgrade"],
    ideal: "Perfect for walk-ins wanting salon-quality at a fraction of the price.",
  },
  Aviation: {
    description: "Private jet seat or charter leg available from repositioning or cancellation.",
    includes: ["Confirmed departure slot", "Full cabin crew service", "Luggage allowance included", "FBO lounge access"],
    ideal: "Ideal for flexible travellers who can depart on short notice.",
  },
  Health: {
    description: "Medical or specialist consultation slot freed up by a cancellation.",
    includes: ["Licensed practitioner", "Full consultation duration", "Follow-up notes provided", "Prescription if needed"],
    ideal: "Great for non-emergency appointments you've been waiting weeks for.",
  },
  Dining: {
    description: "Reserved table at a top restaurant now available due to a no-show or cancellation.",
    includes: ["Prime-time table", "Full à la carte menu access", "Sommelier service", "Original party size"],
    ideal: "Perfect for food lovers who want a last-minute fine dining experience.",
  },
  Logistics: {
    description: "Cargo berth or container slot released from a schedule change.",
    includes: ["Confirmed loading window", "Port handling included", "Documentation support", "Priority clearance"],
    ideal: "Ideal for shippers needing urgent capacity at reduced rates.",
  },
  Fitness: {
    description: "Class spot or personal training session freed up by a cancellation.",
    includes: ["Full class/session duration", "Equipment provided", "Certified instructor", "Shower & locker access"],
    ideal: "Great for fitness enthusiasts wanting premium sessions at drop-in prices.",
  },
  Education: {
    description: "Tutoring session or course slot available from a student cancellation.",
    includes: ["Qualified tutor/instructor", "Full session length", "Learning materials provided", "Progress tracking"],
    ideal: "Perfect for students needing extra help or test preparation.",
  },
  Events: {
    description: "Premium event ticket or VIP experience released at the last minute.",
    includes: ["Confirmed seat/entry", "Original ticket tier", "Venue amenities access", "Digital ticket delivery"],
    ideal: "Ideal for spontaneous plans — catch sold-out shows at a discount.",
  },
  Automotive: {
    description: "Vehicle service, MOT, or repair slot freed up by a cancellation.",
    includes: ["Certified technician", "Genuine/OEM parts", "Service report provided", "Warranty maintained"],
    ideal: "Great for drivers needing timely maintenance without the long wait.",
  },
  Legal: {
    description: "Legal consultation or advisory slot available from a rescheduled client.",
    includes: ["Qualified solicitor/attorney", "Full consultation time", "Confidential session", "Written summary if applicable"],
    ideal: "Perfect for getting timely legal advice at reduced consultation fees.",
  },
  Property: {
    description: "Property viewing or valuation appointment freed up by a cancellation.",
    includes: ["Accompanied viewing", "Agent expertise", "Property pack available", "Flexible scheduling"],
    ideal: "Ideal for buyers and renters wanting priority access to listings.",
  },
  "Pet Care": {
    description: "Vet appointment or grooming slot available from a cancellation.",
    includes: ["Licensed veterinarian/groomer", "Full appointment duration", "Health check included", "Treatment notes provided"],
    ideal: "Great for pet owners needing prompt care without emergency prices.",
  },
};

const SlotSkeleton = () => (
  <div className="glass rounded-xl p-5 animate-pulse">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 rounded-lg bg-muted" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-40" />
          <div className="h-3 bg-muted rounded w-60" />
          <div className="h-3 bg-muted rounded w-32" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-6 w-20 bg-muted rounded-full" />
        <div className="space-y-1 text-right">
          <div className="h-3 bg-muted rounded w-16 ml-auto" />
          <div className="h-5 bg-muted rounded w-20 ml-auto" />
        </div>
        <div className="h-9 w-16 bg-muted rounded-lg" />
      </div>
    </div>
  </div>
);

const LiveSlotsFeed = () => {
  const { savedSlotIds, toggleSave } = useSavedSlots();
  const { toast } = useToast();
  const [slots, setSlots] = useState(MOCK_SLOTS);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveCount, setLiveCount] = useState(0);
  const [displayCurrency, setDisplayCurrency] = useState("GBP");
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null);
  const [selectedVertical, setSelectedVertical] = useState("all");
  const [verticalDropdownOpen, setVerticalDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price" | "discount" | "timeLeft">("default");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleOpenMap = useCallback(async (address: string) => {
    const result = await openMapLocation(address);

    if (result === "opened") return;

    toast({
      title:
        result === "preview_copied"
          ? "Address copied for preview"
          : result === "copied"
            ? "Map link copied"
            : "Couldn't open map",
      description:
        result === "preview_copied"
          ? "Preview blocks third-party map sites, so the address and map link were copied to your clipboard instead."
          : result === "copied"
            ? "Popup blocking prevented opening the map, so the address and map link were copied instead."
            : `Copy this address manually: ${address}`,
      variant: result === "failed" ? "destructive" : undefined,
    });
  }, [toast]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSlots((prev) =>
        prev.map((s) => ({ ...s, timeLeft: Math.max(0, s.timeLeft - 1) }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live slots from database + trigger ingestion
  useEffect(() => {
    // Trigger edge function to ingest fresh slots (fire-and-forget)
    supabase.functions.invoke("ingest-live-slots", { method: "POST" }).catch(() => {});

    const loadFromDb = async () => {
      try {
        const { data, error } = await supabase
          .from("slots")
          .select("*")
          .eq("is_live", true)
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) {
          console.warn("DB fetch error:", error);
          return;
        }

        if (data && data.length > 0) {
          const dbSlots: Slot[] = data.map((s) => ({
            id: s.id,
            merchant: s.merchant_name,
            vertical: s.vertical,
            location: s.location,
            region: s.region,
            time: s.time_description,
            originalPrice: Number(s.original_price),
            currentPrice: Number(s.current_price),
            urgency: s.urgency as "critical" | "high" | "medium",
            timeLeft: s.time_left,
            isLive: true,
            source: s.source,
          }));
          setSlots((prev) => {
            const mockOnly = prev.filter((s) => !s.isLive);
            return [...dbSlots, ...mockOnly];
          });
          setLiveCount(dbSlots.length);
        }
        setInitialLoading(false);
      } catch (e) {
        console.warn("Live data fetch failed:", e);
        setInitialLoading(false);
      }
    };
    loadFromDb();
    const interval = setInterval(loadFromDb, 15000);

    // Subscribe to realtime inserts and updates
    const channel = supabase
      .channel("live-slots")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "slots" }, (payload) => {
        const s = payload.new as any;
        const newSlot: Slot = {
          id: s.id,
          merchant: s.merchant_name,
          vertical: s.vertical,
          location: s.location,
          region: s.region,
          time: s.time_description,
          originalPrice: Number(s.original_price),
          currentPrice: Number(s.current_price),
          urgency: s.urgency,
          timeLeft: s.time_left,
          isLive: true,
          source: s.source,
        };
        setSlots((prev) => [newSlot, ...prev]);
        setLiveCount((prev) => prev + 1);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "slots" }, (payload) => {
        const s = payload.new as any;
        if (!s.is_live) {
          // Slot was claimed — remove from feed
          setSlots((prev) => prev.filter((slot) => slot.id !== s.id));
          setLiveCount((prev) => Math.max(0, prev - 1));
        }
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredSlots = useMemo(() => {
    let result = selectedRegion === "all" ? slots : slots.filter((s) => s.region === selectedRegion);
    if (selectedVertical !== "all") {
      result = result.filter((s) => s.vertical === selectedVertical);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.merchant.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.vertical.toLowerCase().includes(q) ||
          s.region.toLowerCase().includes(q)
      );
    }
    if (sortBy === "price") {
      result = [...result].sort((a, b) => a.currentPrice - b.currentPrice);
    } else if (sortBy === "discount") {
      const disc = (s: Slot) => s.originalPrice > 0 ? ((s.originalPrice - s.currentPrice) / s.originalPrice) * 100 : 0;
      result = [...result].sort((a, b) => disc(b) - disc(a));
    } else if (sortBy === "timeLeft") {
      result = [...result].sort((a, b) => a.timeLeft - b.timeLeft);
    }
    return result;
  }, [slots, selectedRegion, selectedVertical, searchQuery, sortBy]);

  const verticals = useMemo(() => {
    const set = new Set(slots.map((s) => s.vertical));
    return ["all", ...Array.from(set).sort()];
  }, [slots]);

  const verticalCounts = useMemo(() => {
    const base = selectedRegion === "all" ? slots : slots.filter((s) => s.region === selectedRegion);
    const counts: Record<string, number> = { all: base.length };
    base.forEach((s) => { counts[s.vertical] = (counts[s.vertical] || 0) + 1; });
    return counts;
  }, [slots, selectedRegion]);

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: slots.length };
    slots.forEach((s) => { counts[s.region] = (counts[s.region] || 0) + 1; });
    return counts;
  }, [slots]);

  const currentRegion = REGIONS.find((r) => r.id === selectedRegion) || REGIONS[0];

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [selectedRegion, selectedVertical, searchQuery, sortBy]);

  const visibleSlots = useMemo(() => filteredSlots.slice(0, visibleCount), [filteredSlots, visibleCount]);
  const hasMore = visibleCount < filteredSlots.length;

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => prev + 20);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  const handleClaim = (slot: Slot) => {
    setSelectedSlot(slot);
    setModalOpen(true);
  };

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1920&q=80"
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.07]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Live Slots</h2>
            <p className="text-muted-foreground">Real-time cancellations across all verticals</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-countdown" />
              <span className="text-sm text-muted-foreground font-mono">LIVE</span>
            </div>
            {liveCount > 0 && (
              <Badge variant="outline" className="bg-green-400/10 text-green-400 border-green-400/30 text-[10px] gap-1">
                <Wifi className="w-3 h-3" /> {liveCount} real-time
              </Badge>
            )}
            {/* Currency selector */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-sm font-medium text-foreground hover:border-primary/30 transition-colors"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />
                {CURRENCIES.find((c) => c.code === displayCurrency)?.flag}{" "}
                {displayCurrency}
                <ChevronDown className={`w-3 h-3 transition-transform ${currencyDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {currencyDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 glass rounded-xl border border-border/50 shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setDisplayCurrency(c.code); setCurrencyDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-muted/50 transition-colors ${
                        displayCurrency === c.code ? "text-primary font-semibold" : "text-foreground"
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span className="flex-1">{c.name}</span>
                      <span className="text-muted-foreground font-mono text-xs">{c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Sort selector */}
            <div className="relative">
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-sm font-medium text-foreground hover:border-primary/30 transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">
                  {sortBy === "default" ? "Sort" : sortBy === "price" ? "Price" : sortBy === "discount" ? "Discount" : "Time Left"}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${sortDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {sortDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSortDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-44 glass rounded-xl border border-border/50 shadow-xl z-50 py-1">
                    {([
                      { value: "default", label: "Default" },
                      { value: "price", label: "Price (low → high)" },
                      { value: "discount", label: "Discount % (high)" },
                      { value: "timeLeft", label: "Ending soonest" },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors ${
                          sortBy === opt.value ? "text-primary font-semibold" : "text-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by merchant, city, or vertical..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/50 border border-border/50 rounded-xl pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}
          {searchQuery && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono">
              {filteredSlots.length} result{filteredSlots.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Location Selector */}
        <div className="mb-6">
          {/* Region Dropdown (mobile + desktop trigger) */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="sm:hidden w-full glass rounded-xl px-4 py-3 flex items-center justify-between text-sm text-foreground"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                {currentRegion.flag} {currentRegion.label}
                <Badge variant="outline" className="text-[10px] ml-1">{regionCounts[selectedRegion] || 0}</Badge>
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Mobile dropdown */}
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-30 sm:hidden" onClick={() => setDropdownOpen(false)} />
                <div className="absolute top-full left-0 right-0 z-40 mt-1 glass rounded-xl border border-border/50 py-1 sm:hidden">
                  {REGIONS.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => { setSelectedRegion(region.id); setDropdownOpen(false); }}
                      className={`w-full px-4 py-2.5 flex items-center justify-between text-sm transition-colors ${
                        selectedRegion === region.id ? "text-primary bg-primary/5" : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {region.flag} {region.label}
                      </span>
                      <Badge variant="outline" className="text-[10px]">{regionCounts[region.id] || 0}</Badge>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Desktop pill selector */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            <Globe className="w-4 h-4 text-primary mr-1" />
            {REGIONS.map((region) => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedRegion === region.id
                    ? "bg-primary text-primary-foreground glow-blue"
                    : "glass text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {region.flag} {region.label}
                <span className="ml-1.5 opacity-70">({regionCounts[region.id] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vertical / Category Filter */}
        <div className="mb-6">
          {/* Mobile dropdown */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setVerticalDropdownOpen(!verticalDropdownOpen)}
              className="w-full glass rounded-xl px-4 py-3 flex items-center justify-between text-sm text-foreground"
            >
              <span className="flex items-center gap-2">
                🏷️ {selectedVertical === "all" ? "All Categories" : selectedVertical}
                <Badge variant="outline" className="text-[10px] ml-1">{verticalCounts[selectedVertical] || 0}</Badge>
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${verticalDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {verticalDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setVerticalDropdownOpen(false)} />
                <div className="absolute top-full left-0 right-0 z-40 mt-1 glass rounded-xl border border-border/50 py-1 max-h-64 overflow-y-auto">
                  {verticals.map((v) => (
                    <button
                      key={v}
                      onClick={() => { setSelectedVertical(v); setVerticalDropdownOpen(false); }}
                      className={`w-full px-4 py-2.5 flex items-center justify-between text-sm transition-colors ${
                        selectedVertical === v ? "text-primary bg-primary/5" : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span>{v === "all" ? "All Categories" : v}</span>
                      <Badge variant="outline" className="text-[10px]">{verticalCounts[v] || 0}</Badge>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Desktop pill selector */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            <span className="text-sm mr-1">🏷️</span>
            {verticals.map((v) => (
              <button
                key={v}
                onClick={() => setSelectedVertical(v)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedVertical === v
                    ? "bg-primary text-primary-foreground glow-blue"
                    : "glass text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {v === "all" ? "All" : v}
                <span className="ml-1.5 opacity-70">({verticalCounts[v] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {initialLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SlotSkeleton key={i} />)
          ) : filteredSlots.length === 0 ? (
            <div className="glass rounded-xl p-10 text-center">
              <Globe className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No live slots in this region right now.</p>
              <button onClick={() => setSelectedRegion("all")} className="text-primary text-sm mt-2 hover:underline">
                View all regions →
              </button>
            </div>
          ) : (
            visibleSlots.map((slot) => {
              const details = SLOT_DETAILS[slot.vertical];
              const isExpanded = expandedSlotId === slot.id;
              const rating = getSlotRating(slot.id, slot.vertical);

              return (
                <div
                  key={slot.id}
                  className="glass rounded-xl overflow-hidden hover:border-primary/30 transition-colors group animate-fade-in"
                >
                  <div
                    className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
                    onClick={() => handleClaim(slot)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-primary">
                          {slot.vertical[0]}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {slot.merchant}
                          </span>
                          {slot.isLive && (
                            <Badge variant="outline" className="bg-green-400/10 text-green-400 border-green-400/30 text-[9px] py-0 px-1.5 gap-0.5">
                              <Radio className="w-2.5 h-2.5 animate-countdown" /> {slot.source}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{slot.location}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{slot.time}</span>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5">{slot.region}</Badge>
                        </div>
                        {(() => {
                          const address = getVendorAddress(slot.merchant);
                          return address ? (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-muted-foreground/70 truncate max-w-[260px]">{address}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleOpenMap(address);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors shrink-0"
                              >
                                <Navigation className="w-3 h-3" />
                                Map
                              </button>
                            </div>
                          ) : null;
                        })()}
                        {/* Star rating */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${s <= Math.round(rating.average) ? "text-secondary fill-secondary" : "text-muted-foreground/30"}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium text-foreground">{rating.average.toFixed(1)}</span>
                          <span className="text-[10px] text-muted-foreground">({rating.count} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full md:w-auto justify-between md:justify-end">
                      <Badge variant="outline" className={urgencyColors[slot.urgency]}>
                        {slot.urgency === "critical" ? "🔥" : slot.urgency === "high" ? "⚡" : "📌"} {slot.timeLeft}s left
                      </Badge>

                      <div className="text-right">
                        <div className="text-sm text-muted-foreground line-through">
                          {formatPriceInCurrency(slot.originalPrice, detectCurrency(slot.location, slot.region), displayCurrency)}
                        </div>
                        <div className="text-lg font-bold text-secondary flex items-center gap-1">
                          <TrendingDown className="w-4 h-4" />
                          {formatPriceInCurrency(slot.currentPrice, detectCurrency(slot.location, slot.region), displayCurrency)}
                        </div>
                      </div>

                      {/* Details toggle */}
                      <button
                        className="p-2 rounded-lg glass text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                        title="View details"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedSlotId(isExpanded ? null : slot.id);
                        }}
                      >
                        <Info className="w-4 h-4" />
                        <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>

                      {/* Save to wishlist */}
                      <button
                        className={`p-2 rounded-lg glass transition-colors ${
                          savedSlotIds.has(slot.id)
                            ? "text-red-400 hover:text-red-300"
                            : "text-muted-foreground hover:text-red-400 hover:border-red-400/30"
                        }`}
                        title={savedSlotIds.has(slot.id) ? "Remove from wishlist" : "Save to wishlist"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave(slot.id, {
                            id: slot.id,
                            merchant: slot.merchant,
                            vertical: slot.vertical,
                            location: slot.location,
                            region: slot.region,
                            time: slot.time,
                            originalPrice: slot.originalPrice,
                            currentPrice: slot.currentPrice,
                            urgency: slot.urgency,
                          });
                        }}
                      >
                        <Heart className={`w-4 h-4 ${savedSlotIds.has(slot.id) ? "fill-current" : ""}`} />
                      </button>

                      <button
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/80 transition-colors glow-blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClaim(slot);
                        }}
                      >
                        Claim
                      </button>
                    </div>
                  </div>

                  {/* Expandable details dropdown */}
                  {isExpanded && details && (
                    <div className="border-t border-border/30 px-5 py-4 bg-muted/20 animate-fade-in space-y-3">
                      <p className="text-sm text-muted-foreground">{details.description}</p>
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> What's Included
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {details.includes.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                              <Star className="w-3 h-3 text-secondary shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-xs text-primary font-medium italic">{details.ideal}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
          {/* Load more sentinel + count indicator */}
          {filteredSlots.length > 0 && (
            <div className="text-center py-4 space-y-2">
              <p className="text-xs text-muted-foreground font-mono">
                Showing {visibleSlots.length} of {filteredSlots.length} slots
              </p>
              {hasMore && (
                <button
                  onClick={() => setVisibleCount((prev) => prev + 20)}
                  className="px-6 py-2 rounded-lg glass text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  Load more
                </button>
              )}
            </div>
          )}
          <div ref={loadMoreRef} className="h-1" />
        </div>
      </div>

      <SlotDetailModal
        slot={selectedSlot}
        open={modalOpen}
        onOpenChange={setModalOpen}
        displayCurrency={displayCurrency}
      />
    </section>
  );
};

export default LiveSlotsFeed;
