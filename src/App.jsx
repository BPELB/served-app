import { useState, useEffect, useRef, useCallback, Fragment } from "react"; // v3

// ============================================================
// CONFIG — paste your keys here
// ============================================================
const CONFIG = {
  GOOGLE_PLACES_KEY: "AIzaSyB2waptMfRWj_mkt07llXQ5aKR0M6F91Ec",
  SUPABASE_URL:      "YOUR_SUPABASE_URL",
  SUPABASE_KEY:      "YOUR_SUPABASE_ANON_KEY",
  RESEND_KEY:        "YOUR_RESEND_API_KEY",
  APP_URL:           "https://getserved.app",
};

// ============================================================
// BRAND
// ============================================================
const O   = "#e05535";
const G   = `linear-gradient(135deg,${O},#8b2a14)`;

// CSS variable references — all theme colors live on :root
const BG  = "var(--bg)";
const BG2 = "var(--bg2)";
const BG3 = "var(--bg3)";
const BDR = "var(--bdr)";
const N   = "var(--text)";
const HOV = "var(--hover)";
const MUT = "var(--muted)";

const DARK_VARS  = { "--bg":"#0d2b35","--bg2":"#0a2029","--bg3":"#071820","--bdr":"#2a5568","--text":"#ffffff","--muted":"rgba(255,255,255,0.65)","--hover":"#0f3040" };
const LIGHT_VARS = { "--bg":"#f0ebe8","--bg2":"#ffffff","--bg3":"#e0d8d4","--bdr":"#a89080","--text":"#111820","--muted":"rgba(17,24,32,0.55)","--hover":"#e8e0dc" };

function applyTheme(vars) {
  Object.entries(vars).forEach(([k,v])=>document.documentElement.style.setProperty(k,v));
}

// Functional score colors
const SH = { bg:"rgba(22,163,74,0.10)",   bd:"#16a34a",  tx:"#16a34a" };
const SM = { bg:"rgba(224,85,53,0.10)",   bd:"#e05535",  tx:"#e05535" };
const SL = { bg:"rgba(220,38,38,0.10)",   bd:"#dc2626",  tx:"#dc2626" };
const scC = s => s>=4?SH:s>=3?SM:SL;
const stC = s => s>=8?"#16a34a":s>=6?"#e05535":"#dc2626";
const LABELS = ["","Terrible","Poor","OK","Good","Amazing"];

// ============================================================
// ALL 20 BUSINESS TYPES — each with unique icon box color
// ============================================================
const BT = {
  food:         { label:"Food & Drink",      icon:"🍴", box:{bg:"#FFF0EC",bd:"#F9C4B0",ic:"#C84B1F"},
    core:[{id:"food",label:"Food",icon:"🍽️",q:"How was the food?"},{id:"service",label:"Service",icon:"⚡",q:"How was the service?"},{id:"vibe",label:"Vibe",icon:"✨",q:"How was the atmosphere?"}],
    extra:[{id:"value",label:"Value",icon:"💰",q:"Worth the price?"},{id:"cleanliness",label:"Cleanliness",icon:"🧹",q:"How clean?"}],
    chips:["Amazing food","Slow service","Great atmosphere","Would return","Rude staff","Cold food","Overpriced"],
    itemLabel:"What did you order?", placeholder:"What made the biggest impression?",
  },
  beauty:       { label:"Beauty & Wellness", icon:"✂️", box:{bg:"#FFF0F5",bd:"#F5BBCF",ic:"#C2366A"},
    core:[{id:"result",label:"Result",icon:"✂️",q:"Happy with the outcome?"},{id:"wait",label:"Wait Time",icon:"⏱️",q:"How long did you wait?"},{id:"value",label:"Value",icon:"💰",q:"Worth the price?"}],
    extra:[{id:"staff",label:"Staff",icon:"👋",q:"How friendly was the staff?"}],
    chips:["Love the result","Too long wait","Great technician","Overpriced","Will return"],
    itemLabel:"What service did you get?", placeholder:"What worked and what didn't?",
  },
  health:       { label:"Health & Medical",  icon:"🏥", box:{bg:"#E8FAFA",bd:"#96DFE0",ic:"#1A8A8C"},
    core:[{id:"care",label:"Care",icon:"❤️",q:"How was the quality of care?"},{id:"wait",label:"Wait Time",icon:"⏱️",q:"How long did you wait?"},{id:"clarity",label:"Communication",icon:"💬",q:"Did they explain clearly?"}],
    extra:[{id:"staff",label:"Staff",icon:"👋",q:"How was the front desk?"}],
    chips:["Very thorough","Long wait","Caring staff","Felt rushed","Would recommend"],
    itemLabel:"What type of visit?", placeholder:"What should someone know before visiting?",
  },
  fitness:      { label:"Fitness & Sport",   icon:"💪", box:{bg:"#EEF4FF",bd:"#B8D0F8",ic:"#2255C4"},
    core:[{id:"equipment",label:"Equipment",icon:"🏋️",q:"How was the equipment?"},{id:"cleanliness",label:"Cleanliness",icon:"✨",q:"How clean?"},{id:"staff",label:"Staff",icon:"👋",q:"How was the staff?"}],
    extra:[{id:"value",label:"Value",icon:"💰",q:"Worth the cost?"}],
    chips:["Great equipment","Always crowded","Very clean","Great classes","Would join"],
    itemLabel:"What did you do?", placeholder:"What should someone know before signing up?",
  },
  automotive:   { label:"Automotive",        icon:"🔧", box:{bg:"#F1F5F9",bd:"#CBD5E1",ic:"#475569"},
    core:[{id:"quality",label:"Quality",icon:"🔧",q:"Happy with the work?"},{id:"comms",label:"Communication",icon:"💬",q:"Did they keep you informed?"},{id:"time",label:"Timeliness",icon:"⏱️",q:"Ready when promised?"}],
    extra:[{id:"value",label:"Value",icon:"💰",q:"Worth what you paid?"}],
    chips:["Great work","Overpriced","Honest advice","Would return","Problem fixed"],
    itemLabel:"What work was done?", placeholder:"What should other customers know?",
  },
  homeservices: { label:"Home Services",     icon:"🏠", box:{bg:"#FFF8EC",bd:"#FDDFA0",ic:"#B87415"},
    core:[{id:"quality",label:"Quality",icon:"🛠️",q:"Happy with the work quality?"},{id:"comms",label:"Communication",icon:"💬",q:"Did they communicate well?"},{id:"time",label:"Timeliness",icon:"⏱️",q:"On time?"}],
    extra:[{id:"value",label:"Value",icon:"💰",q:"Worth what you paid?"}],
    chips:["Great work","Showed up on time","Would hire again","Left a mess","Overcharged"],
    itemLabel:"What service was done?", placeholder:"Would you hire them again?",
  },
  pets:         { label:"Pet Services",      icon:"🐾", box:{bg:"#EDFAF4",bd:"#A3E4C5",ic:"#1A7A4A"},
    core:[{id:"care",label:"Care",icon:"❤️",q:"How well did they care for your pet?"},{id:"staff",label:"Staff",icon:"👋",q:"How was the staff?"},{id:"value",label:"Value",icon:"💰",q:"Worth the price?"}],
    extra:[{id:"cleanliness",label:"Cleanliness",icon:"✨",q:"How clean?"}],
    chips:["My pet loved it","Gentle with animals","Would trust again","Very clean"],
    itemLabel:"Service + which pet?", placeholder:"Would you trust them with your pet again?",
  },
  childcare:    { label:"Childcare",         icon:"👶", box:{bg:"#FFFBE8",bd:"#F5E087",ic:"#9A7D0A"},
    core:[{id:"care",label:"Care & Safety",icon:"🛡️",q:"Did you feel your child was safe?"},{id:"comms",label:"Communication",icon:"💬",q:"Did they keep you informed?"},{id:"value",label:"Value",icon:"💰",q:"Worth the cost?"}],
    extra:[{id:"staff",label:"Staff",icon:"👋",q:"How caring was the staff?"}],
    chips:["My child loved it","Very safe","Great communication","Caring staff"],
    itemLabel:"Which program?", placeholder:"Would you trust them with your child again?",
  },
  hospitality:  { label:"Hotels & Stays",   icon:"🏨", box:{bg:"#F3EFFF",bd:"#C9BBF5",ic:"#5B3FCC"},
    core:[{id:"room",label:"Room",icon:"🛏️",q:"How was the room?"},{id:"staff",label:"Staff",icon:"👋",q:"How was the staff?"},{id:"location",label:"Location",icon:"📍",q:"How was the location?"}],
    extra:[{id:"value",label:"Value",icon:"💰",q:"Worth what you paid?"}],
    chips:["Great location","Clean room","Helpful staff","Would return","Poor value"],
    itemLabel:"Type of stay?", placeholder:"What would you tell someone booking here?",
  },
  retail:       { label:"Retail & Shopping", icon:"🛍️", box:{bg:"#FFF0F5",bd:"#F5BBCF",ic:"#C2366A"},
    core:[{id:"selection",label:"Selection",icon:"🛍️",q:"Good selection?"},{id:"staff",label:"Staff",icon:"👋",q:"Were staff helpful?"},{id:"value",label:"Value",icon:"💰",q:"Worth the price?"}],
    extra:[{id:"cleanliness",label:"Cleanliness",icon:"✨",q:"How clean?"}],
    chips:["Great selection","Very helpful","Overpriced","Would shop again"],
    itemLabel:"What did you buy?", placeholder:"What would you tell a friend?",
  },
  professional: { label:"Professional",      icon:"💼", box:{bg:"#EEF4FF",bd:"#B8D0F8",ic:"#2255C4"},
    core:[{id:"expertise",label:"Expertise",icon:"🎓",q:"Did they seem knowledgeable?"},{id:"comms",label:"Communication",icon:"💬",q:"Did they explain clearly?"},{id:"value",label:"Value",icon:"💰",q:"Worth what you paid?"}],
    extra:[{id:"trust",label:"Trust",icon:"🛡️",q:"Did you feel you could trust them?"}],
    chips:["Very knowledgeable","Would recommend","Hard to reach","Overpriced"],
    itemLabel:"What service did you use?", placeholder:"Would you hire them again?",
  },
  events:       { label:"Events",            icon:"🎉", box:{bg:"#F3EFFF",bd:"#C9BBF5",ic:"#5B3FCC"},
    core:[{id:"quality",label:"Quality",icon:"⭐",q:"How was the overall quality?"},{id:"comms",label:"Communication",icon:"💬",q:"Easy to work with?"},{id:"value",label:"Value",icon:"💰",q:"Worth the price?"}],
    extra:[{id:"punctuality",label:"On Time",icon:"⏱️",q:"Did they show up on time?"}],
    chips:["Exceeded expectations","Very organized","Would book again","Arrived late"],
    itemLabel:"What type of event?", placeholder:"Would you book them for your next event?",
  },
  education:    { label:"Education",         icon:"📚", box:{bg:"#EEF4FF",bd:"#B8D0F8",ic:"#2255C4"},
    core:[{id:"teaching",label:"Teaching",icon:"📚",q:"How effective was the teaching?"},{id:"comms",label:"Communication",icon:"💬",q:"Clear and easy to understand?"},{id:"value",label:"Value",icon:"💰",q:"Worth the cost?"}],
    extra:[{id:"results",label:"Results",icon:"✅",q:"Did you actually improve?"}],
    chips:["Very effective","Patient teacher","Overpriced","Great results"],
    itemLabel:"What subject or skill?", placeholder:"Did you learn what you came to learn?",
  },
  entertainment:{ label:"Entertainment",     icon:"🎭", box:{bg:"#FFF0EC",bd:"#F9C4B0",ic:"#C84B1F"},
    core:[{id:"experience",label:"Experience",icon:"🎭",q:"How fun was it?"},{id:"staff",label:"Staff",icon:"👋",q:"How was the staff?"},{id:"value",label:"Value",icon:"💰",q:"Worth the price?"}],
    extra:[{id:"cleanliness",label:"Cleanliness",icon:"✨",q:"How clean?"}],
    chips:["So much fun","Too expensive","Great for kids","Would go back"],
    itemLabel:"What did you do?", placeholder:"Would you go back?",
  },
  moving:       { label:"Moving & Storage",  icon:"📦", box:{bg:"#FFF8EC",bd:"#FDDFA0",ic:"#B87415"},
    core:[{id:"care",label:"Care of Items",icon:"📦",q:"Were your belongings handled carefully?"},{id:"comms",label:"Communication",icon:"💬",q:"Clear communication?"},{id:"time",label:"Timeliness",icon:"⏱️",q:"On time?"}],
    extra:[{id:"value",label:"Value",icon:"💰",q:"Worth what you paid?"}],
    chips:["Nothing was damaged","Showed up on time","Would hire again","Items damaged"],
    itemLabel:"What type of move?", placeholder:"Would you trust them with your belongings again?",
  },
  techrepair:   { label:"Tech & Repair",     icon:"💻", box:{bg:"#E8FAFA",bd:"#96DFE0",ic:"#1A8A8C"},
    core:[{id:"quality",label:"Fix Quality",icon:"💻",q:"Was the problem fixed?"},{id:"speed",label:"Speed",icon:"⚡",q:"How fast?"},{id:"value",label:"Value",icon:"💰",q:"Worth what you paid?"}],
    extra:[{id:"comms",label:"Communication",icon:"💬",q:"Did they explain what was wrong?"}],
    chips:["Problem solved","Quick turnaround","Fair pricing","Still broken"],
    itemLabel:"What was repaired?", placeholder:"Was the problem fixed? Would you go back?",
  },
  laundry:      { label:"Laundry & Cleaning",icon:"🧺", box:{bg:"#EDFAF4",bd:"#A3E4C5",ic:"#1A7A4A"},
    core:[{id:"quality",label:"Quality",icon:"✨",q:"How was the cleaning quality?"},{id:"speed",label:"Speed",icon:"⚡",q:"Ready when promised?"},{id:"value",label:"Value",icon:"💰",q:"Worth the price?"}],
    extra:[{id:"care",label:"Item Care",icon:"🛡️",q:"Were your items treated carefully?"}],
    chips:["Spotless result","Quick turnaround","Great price","Would return"],
    itemLabel:"What did you bring in?", placeholder:"Would you bring your things back?",
  },
  financial:    { label:"Financial",         icon:"💳", box:{bg:"#EDFAF4",bd:"#A3E4C5",ic:"#1A7A4A"},
    core:[{id:"expertise",label:"Expertise",icon:"🎓",q:"Did they seem knowledgeable?"},{id:"comms",label:"Communication",icon:"💬",q:"Did they explain clearly?"},{id:"trust",label:"Trust",icon:"🛡️",q:"Did you trust them?"}],
    extra:[{id:"value",label:"Value",icon:"💰",q:"Worth what you paid?"}],
    chips:["Very trustworthy","Clear explanation","Would recommend","Pushy sales"],
    itemLabel:"What service did you use?", placeholder:"Did they act in your best interest?",
  },
  funeral:      { label:"Funeral & Memorial",icon:"🕊️", box:{bg:"#F1F5F9",bd:"#CBD5E1",ic:"#475569"},
    core:[{id:"care",label:"Compassion",icon:"❤️",q:"Did they treat your family with care?"},{id:"comms",label:"Communication",icon:"💬",q:"Clear and helpful?"},{id:"professionalism",label:"Professionalism",icon:"🎗️",q:"Professional and respectful?"}],
    extra:[{id:"value",label:"Value",icon:"💰",q:"Were costs clearly explained?"}],
    chips:["Very compassionate","Handled everything","Clear pricing","Would recommend"],
    itemLabel:"Type of service?", placeholder:"Did they make a difficult time easier?",
  },
  government:   { label:"Government & Public",icon:"🏛️",box:{bg:"#F1F5F9",bd:"#CBD5E1",ic:"#475569"},
    core:[{id:"wait",label:"Wait Time",icon:"⏱️",q:"How long did you wait?"},{id:"staff",label:"Staff",icon:"👋",q:"Were staff helpful?"},{id:"efficiency",label:"Efficiency",icon:"⚡",q:"Was the process efficient?"}],
    extra:[{id:"outcome",label:"Outcome",icon:"✅",q:"Did you get what you came for?"}],
    chips:["Short wait","Helpful staff","Got what I needed","Very long wait"],
    itemLabel:"What were you there for?", placeholder:"Did you get what you came for?",
  },
};

const TYPE_KEYS = Object.keys(BT);

function guessType(types=[]) {
  if (types.some(t=>["restaurant","food","bar","cafe","bakery"].includes(t))) return "food";
  if (types.some(t=>["beauty_salon","hair_care","spa","nail_salon"].includes(t))) return "beauty";
  if (types.some(t=>["doctor","dentist","hospital","pharmacy","health"].includes(t))) return "health";
  if (types.some(t=>["gym","fitness"].includes(t))) return "fitness";
  if (types.some(t=>["car_repair","car_wash"].includes(t))) return "automotive";
  if (types.some(t=>["plumber","electrician","general_contractor"].includes(t))) return "homeservices";
  if (types.some(t=>["veterinary_care","pet_store"].includes(t))) return "pets";
  if (types.some(t=>["school","child_care"].includes(t))) return "childcare";
  if (types.some(t=>["lodging"].includes(t))) return "hospitality";
  if (types.some(t=>["store","shopping_mall","clothing_store"].includes(t))) return "retail";
  if (types.some(t=>["lawyer","accounting","insurance_agency"].includes(t))) return "professional";
  if (types.some(t=>["movie_theater","bowling_alley","amusement_park"].includes(t))) return "entertainment";
  if (types.some(t=>["moving_company","storage"].includes(t))) return "moving";
  if (types.some(t=>["electronics_store","computer_repair"].includes(t))) return "techrepair";
  if (types.some(t=>["laundry"].includes(t))) return "laundry";
  if (types.some(t=>["bank","finance","insurance"].includes(t))) return "financial";
  if (types.some(t=>["funeral_home"].includes(t))) return "funeral";
  if (types.some(t=>["local_government_office","post_office","library"].includes(t))) return "government";
  return "food";
}

// ============================================================
// DEMO DATA — per category
// ============================================================
const H = {
  std:  {Mon:"9am–9pm", Tue:"9am–9pm", Wed:"9am–9pm", Thu:"9am–9pm", Fri:"9am–10pm", Sat:"10am–10pm", Sun:"11am–8pm"},
  rest: {Mon:"11am–10pm",Tue:"11am–10pm",Wed:"11am–10pm",Thu:"11am–10pm",Fri:"11am–11pm",Sat:"10am–11pm",Sun:"10am–9pm"},
  med:  {Mon:"8am–5pm", Tue:"8am–5pm", Wed:"8am–5pm", Thu:"8am–5pm", Fri:"8am–4pm", Sat:"9am–12pm", Sun:"Closed"},
  gym:  {Mon:"5am–11pm",Tue:"5am–11pm",Wed:"5am–11pm",Thu:"5am–11pm",Fri:"5am–10pm",Sat:"7am–9pm",   Sun:"8am–8pm"},
  auto: {Mon:"7am–6pm", Tue:"7am–6pm", Wed:"7am–6pm", Thu:"7am–6pm", Fri:"7am–6pm", Sat:"8am–4pm",  Sun:"Closed"},
};

function closeTime(hours) {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const today = days[new Date().getDay()];
  const h = hours?.[today];
  if (!h || h === "Closed") return null;
  return h.split("–")[1];
}

const DEMOS = {
  food:        [
    {id:"d1",name:"Osteria Romana",    addr:"123 Main St, McKinney TX",  type:"food",subtype:"Italian",        emoji:"🍕",rating:4.3,price:2,open:true, hours:H.rest},
    {id:"d2",name:"The Garden Bistro", addr:"456 Oak Ave, McKinney TX",  type:"food",subtype:"American",       emoji:"🥗",rating:4.1,price:2,open:true, hours:{...H.rest,Sun:"Closed"}},
    {id:"d3",name:"Sakura House",      addr:"789 Elm St, McKinney TX",   type:"food",subtype:"Japanese",       emoji:"🍱",rating:4.6,price:3,open:false,hours:{...H.rest,Mon:"Closed",Tue:"Closed"}},
    {id:"d4",name:"El Rancho Tacos",   addr:"321 Pine St, McKinney TX",  type:"food",subtype:"Mexican",        emoji:"🌮",rating:4.4,price:1,open:true, hours:{...H.rest,Mon:"11am–9pm"}},
    {id:"d5",name:"The Burger Lab",    addr:"654 Cedar Rd, McKinney TX", type:"food",subtype:"Burgers",        emoji:"🍔",rating:4.2,price:1,open:true, hours:H.rest},
    {id:"d6",name:"Spice Garden",      addr:"987 Walnut St, McKinney TX",type:"food",subtype:"Indian",         emoji:"🍛",rating:4.5,price:2,open:true, hours:{...H.rest,Mon:"Closed"}},
  ],
  beauty:      [
    {id:"b1",name:"Cuts & Co.",         addr:"321 Pine St",  type:"beauty",subtype:"Hair Salon",   emoji:"✂️",rating:4.4,price:2,open:true, hours:H.std},
    {id:"b2",name:"Glow Studio",        addr:"100 Maple Ave",type:"beauty",subtype:"Nail & Spa",   emoji:"💅",rating:4.6,price:2,open:true, hours:H.std},
    {id:"b3",name:"The Barber Shop",    addr:"55 Oak Blvd",  type:"beauty",subtype:"Barbershop",   emoji:"💈",rating:4.3,price:1,open:true, hours:{...H.std,Sun:"Closed"}},
  ],
  health:      [
    {id:"h1",name:"Dr. Chen Family",    addr:"111 Oak Blvd",   type:"health",subtype:"Family Practice",emoji:"🏥",rating:4.7,price:2,open:true, hours:H.med},
    {id:"h2",name:"McKinney Dental",    addr:"200 Health Way", type:"health",subtype:"Dentistry",      emoji:"🦷",rating:4.5,price:2,open:true, hours:H.med},
    {id:"h3",name:"Vision Care",        addr:"300 Eye St",     type:"health",subtype:"Optometry",      emoji:"👁️",rating:4.4,price:2,open:false,hours:{...H.med,Sat:"Closed",Sun:"Closed"}},
  ],
  fitness:     [
    {id:"f1",name:"QuickFit Gym",       addr:"654 Cedar Rd",type:"fitness",subtype:"Gym",         emoji:"💪",rating:4.2,price:1,open:true, hours:H.gym},
    {id:"f2",name:"Zen Yoga Studio",    addr:"77 Calm Blvd", type:"fitness",subtype:"Yoga",        emoji:"🧘",rating:4.8,price:2,open:true, hours:{...H.gym,Sun:"9am–6pm"}},
    {id:"f3",name:"CrossFit McKinney",  addr:"88 Strong St", type:"fitness",subtype:"CrossFit",    emoji:"🏋️",rating:4.5,price:2,open:true, hours:H.gym},
  ],
  automotive:  [
    {id:"a1",name:"Main St. Garage",    addr:"987 Walnut St",type:"automotive",subtype:"Auto Repair",  emoji:"🔧",rating:4.5,price:2,open:true, hours:H.auto},
    {id:"a2",name:"Speedy Lube",        addr:"400 Motor Ave",type:"automotive",subtype:"Oil Change",   emoji:"🚗",rating:4.2,price:1,open:true, hours:H.auto},
    {id:"a3",name:"AutoShine",          addr:"500 Clean Dr", type:"automotive",subtype:"Car Wash",     emoji:"✨",rating:4.6,price:2,open:false,hours:{...H.auto,Sat:"9am–5pm",Sun:"10am–4pm"}},
  ],
  homeservices:[
    {id:"hs1",name:"Handy Home Pros",   addr:"456 Maple Ave",  type:"homeservices",subtype:"Handyman",   emoji:"🏠",rating:4.6,price:2,open:false,hours:{Mon:"7am–6pm",Tue:"7am–6pm",Wed:"7am–6pm",Thu:"7am–6pm",Fri:"7am–6pm",Sat:"8am–3pm",Sun:"Closed"}},
    {id:"hs2",name:"CleanTeam",         addr:"100 Spotless Ln",type:"homeservices",subtype:"Cleaning",   emoji:"🧹",rating:4.4,price:2,open:true, hours:H.std},
    {id:"hs3",name:"Pro Plumbing",      addr:"200 Pipe St",    type:"homeservices",subtype:"Plumbing",   emoji:"🔩",rating:4.3,price:2,open:true, hours:H.auto},
  ],
  pets:        [
    {id:"p1",name:"Paws & Claws Vet",    addr:"789 Elm St",  type:"pets",subtype:"Veterinary",  emoji:"🐾",rating:4.8,price:2,open:true, hours:H.med},
    {id:"p2",name:"Happy Tails Grooming",addr:"50 Woof Way", type:"pets",subtype:"Grooming",    emoji:"🐶",rating:4.6,price:2,open:true, hours:H.std},
    {id:"p3",name:"Doggy Daycare",       addr:"99 Bark Blvd",type:"pets",subtype:"Daycare",     emoji:"🦴",rating:4.5,price:2,open:true, hours:H.gym},
  ],
  childcare:   [
    {id:"c1",name:"Sunshine Daycare",   addr:"200 Oak St",     type:"childcare",subtype:"Daycare",   emoji:"☀️",rating:4.9,price:2,open:true, hours:{Mon:"6:30am–6pm",Tue:"6:30am–6pm",Wed:"6:30am–6pm",Thu:"6:30am–6pm",Fri:"6:30am–6pm",Sat:"Closed",Sun:"Closed"}},
    {id:"c2",name:"A+ Tutoring",        addr:"77 Learning Ln", type:"childcare",subtype:"Tutoring",  emoji:"📚",rating:4.7,price:2,open:true, hours:{Mon:"3pm–8pm",Tue:"3pm–8pm",Wed:"3pm–8pm",Thu:"3pm–8pm",Fri:"3pm–7pm",Sat:"10am–4pm",Sun:"Closed"}},
  ],
  hospitality: [
    {id:"ho1",name:"The McKinney Inn",  addr:"200 Main St",   type:"hospitality",subtype:"Boutique Hotel",emoji:"🏨",rating:4.3,price:3,open:true, hours:{Mon:"24hrs",Tue:"24hrs",Wed:"24hrs",Thu:"24hrs",Fri:"24hrs",Sat:"24hrs",Sun:"24hrs"}},
    {id:"ho2",name:"Comfort Suites",   addr:"300 Rest Blvd", type:"hospitality",subtype:"Extended Stay", emoji:"🛏️",rating:4.0,price:2,open:true, hours:{Mon:"24hrs",Tue:"24hrs",Wed:"24hrs",Thu:"24hrs",Fri:"24hrs",Sat:"24hrs",Sun:"24hrs"}},
  ],
  retail:      [
    {id:"r1",name:"The Boutique",       addr:"333 Fashion Blvd",type:"retail",subtype:"Women's Fashion",emoji:"🛍️",rating:4.1,price:2,open:true, hours:H.std},
    {id:"r2",name:"Book Nook",          addr:"44 Read St",      type:"retail",subtype:"Books",          emoji:"📖",rating:4.7,price:1,open:true, hours:{...H.std,Sun:"12pm–6pm"}},
    {id:"r3",name:"Tech World",         addr:"500 Gadget Dr",   type:"retail",subtype:"Electronics",    emoji:"📱",rating:4.2,price:2,open:false,hours:H.std},
  ],
  professional:[
    {id:"pr1",name:"Smith Law",         addr:"100 Business Park",type:"professional",subtype:"Law Firm",    emoji:"💼",rating:4.5,price:3,open:true, hours:H.med},
    {id:"pr2",name:"McKinney CPA",      addr:"200 Tax Blvd",     type:"professional",subtype:"Accounting",  emoji:"💰",rating:4.4,price:2,open:true, hours:H.med},
  ],
  events:      [
    {id:"e1",name:"Grand Event Hall",   addr:"500 Event Pkwy",type:"events",subtype:"Venue",        emoji:"🎉",rating:4.4,price:3,open:true, hours:H.std},
    {id:"e2",name:"Lens & Light Photo", addr:"60 Camera Way", type:"events",subtype:"Photography",  emoji:"📸",rating:4.8,price:3,open:true, hours:H.std},
  ],
  education:   [
    {id:"ed1",name:"A+ Tutoring",       addr:"77 Learning Ln",type:"education",subtype:"Tutoring",       emoji:"📚",rating:4.6,price:2,open:true, hours:{Mon:"3pm–8pm",Tue:"3pm–8pm",Wed:"3pm–8pm",Thu:"3pm–8pm",Fri:"3pm–7pm",Sat:"10am–4pm",Sun:"Closed"}},
    {id:"ed2",name:"Driving School",    addr:"400 Road St",   type:"education",subtype:"Driver's Ed",     emoji:"🚗",rating:4.3,price:2,open:true, hours:H.std},
  ],
  entertainment:[
    {id:"en1",name:"Fun Zone Arcade",   addr:"400 Play Blvd",type:"entertainment",subtype:"Arcade",   emoji:"🎮",rating:4.0,price:1,open:true, hours:{...H.std,Mon:"12pm–9pm",Sun:"12pm–8pm"}},
    {id:"en2",name:"McKinney Bowling",  addr:"300 Lane Ave", type:"entertainment",subtype:"Bowling",  emoji:"🎳",rating:4.2,price:2,open:true, hours:{...H.std,Mon:"12pm–10pm"}},
  ],
  moving:      [
    {id:"m1",name:"Two Men & A Truck",  addr:"600 Industrial Dr",type:"moving",subtype:"Full Service",emoji:"📦",rating:4.3,price:2,open:true, hours:H.auto},
    {id:"m2",name:"EasyMove Co.",       addr:"700 Haul Rd",      type:"moving",subtype:"Labor Only",  emoji:"🚛",rating:4.1,price:2,open:true, hours:H.auto},
  ],
  techrepair:  [
    {id:"t1",name:"iFixIt Now",         addr:"222 Tech Row",  type:"techrepair",subtype:"Phone & Tablet",emoji:"💻",rating:4.4,price:1,open:true, hours:H.std},
    {id:"t2",name:"Phone Doctor",       addr:"111 Screen St", type:"techrepair",subtype:"Screen Repair", emoji:"📱",rating:4.3,price:1,open:true, hours:H.std},
  ],
  laundry:     [
    {id:"l1",name:"Prestige Cleaners",  addr:"88 Clean St",type:"laundry",subtype:"Dry Cleaning",emoji:"🧺",rating:4.2,price:2,open:true, hours:H.std},
    {id:"l2",name:"Spin Cycle",         addr:"99 Wash Ave", type:"laundry",subtype:"Laundromat",  emoji:"👕",rating:3.9,price:1,open:true, hours:{Mon:"7am–10pm",Tue:"7am–10pm",Wed:"7am–10pm",Thu:"7am–10pm",Fri:"7am–10pm",Sat:"7am–10pm",Sun:"8am–9pm"}},
  ],
  financial:   [
    {id:"fi1",name:"First National Bank",addr:"1 Bank Plaza",  type:"financial",subtype:"Bank",       emoji:"🏦",rating:3.8,price:2,open:true, hours:{Mon:"9am–5pm",Tue:"9am–5pm",Wed:"9am–5pm",Thu:"9am–5pm",Fri:"9am–6pm",Sat:"9am–1pm",Sun:"Closed"}},
    {id:"fi2",name:"McKinney Tax Pro",   addr:"200 Tax Blvd",  type:"financial",subtype:"Tax Services",emoji:"💳",rating:4.4,price:2,open:true, hours:H.med},
  ],
  funeral:     [
    {id:"fu1",name:"Peaceful Rest",     addr:"999 Serenity Ln",type:"funeral",subtype:"Funeral Home",emoji:"🕊️",rating:4.9,price:3,open:true, hours:{Mon:"9am–5pm",Tue:"9am–5pm",Wed:"9am–5pm",Thu:"9am–5pm",Fri:"9am–5pm",Sat:"10am–3pm",Sun:"Closed"}},
  ],
  government:  [
    {id:"g1",name:"McKinney City Hall", addr:"222 Government Way",type:"government",subtype:"City Services",emoji:"🏛️",rating:3.5,price:1,open:true, hours:{Mon:"8am–5pm",Tue:"8am–5pm",Wed:"8am–5pm",Thu:"8am–5pm",Fri:"8am–5pm",Sat:"Closed",Sun:"Closed"}},
    {id:"g2",name:"McKinney DMV",       addr:"400 License Blvd",  type:"government",subtype:"DMV",          emoji:"🪪",rating:2.8,price:1,open:true, hours:{Mon:"8am–4:30pm",Tue:"8am–4:30pm",Wed:"8am–4:30pm",Thu:"8am–4:30pm",Fri:"8am–4:30pm",Sat:"Closed",Sun:"Closed"}},
  ],
};

const DEMO_REVIEWS = [
  {id:1,avg:9.1,scores:{food:10,service:8,vibe:9},  feedback:"Best pasta in Dallas. The carbonara is absolutely unreal.",items:["Carbonara","Tiramisu"],created_at:"2026-05-28",helpful:12},
  {id:2,avg:5.7,scores:{food:7,service:3,vibe:7},   feedback:"Food was solid but waited 25 minutes to be acknowledged.",items:["Margherita Pizza"],created_at:"2026-05-25",helpful:19},
  {id:3,avg:8.3,scores:{food:9,service:8,vibe:8},   feedback:"Lovely anniversary dinner. Staff made it really special.",items:["Salmon","Lava Cake"],created_at:"2026-05-22",helpful:5},
  {id:4,avg:7.5,scores:{food:8,service:7,vibe:8},   feedback:"Solid spot. Nothing blew me away but everything was good.",items:[],created_at:"2026-05-20",helpful:3},
  {id:5,avg:4.3,scores:{food:6,service:3,vibe:4},   feedback:"Rude server, long wait, lukewarm food. Really disappointing.",items:["Caesar Salad"],created_at:"2026-05-18",helpful:24},
];

// ============================================================
// API HELPERS
// ============================================================
const sb = {
  async save(table, data) {
    if (CONFIG.SUPABASE_URL.includes("YOUR_")) return {ok:false};
    try {
      const r = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${table}`, {
        method:"POST",
        headers:{"Content-Type":"application/json","apikey":CONFIG.SUPABASE_KEY,"Authorization":`Bearer ${CONFIG.SUPABASE_KEY}`},
        body:JSON.stringify(data),
      });
      return {ok:r.ok};
    } catch { return {ok:false}; }
  },
};

const gPlaces = {
  async search(query, lat, lng, type) {
    if (CONFIG.GOOGLE_PLACES_KEY.includes("YOUR_")) return DEMOS[type]||DEMOS.food;
    try {
      // Use Places API (New) — Nearby Search
      const typeMap = {
        food:"restaurant",beauty:"beauty_salon",health:"doctor",
        fitness:"gym",automotive:"car_repair",homeservices:"plumber",
        pets:"veterinary_care",childcare:"school",hospitality:"lodging",
        retail:"store",professional:"lawyer",events:"event_venue",
        education:"school",entertainment:"movie_theater",moving:"moving_company",
        techrepair:"electronics_store",laundry:"laundry",financial:"bank",
        funeral:"funeral_home",government:"local_government_office",
      };
      const includedType = typeMap[type]||"restaurant";
      const searchQuery = query && query !== BT[type]?.label ? query : "";

      const body = {
        locationRestriction:{circle:{center:{latitude:lat,longitude:lng},radius:8000}},
        includedTypes:[includedType],
        maxResultCount:10,
        languageCode:"en",
      };
      if (searchQuery) { body.textQuery = searchQuery; }

      const r = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "X-Goog-Api-Key": CONFIG.GOOGLE_PLACES_KEY,
          "X-Goog-FieldMask":"places.id,places.displayName,places.formattedAddress,places.types,places.rating,places.priceLevel,places.currentOpeningHours,places.photos",
        },
        body:JSON.stringify(body),
      });
      const d = await r.json();
      if (!d.places) return DEMOS[type]||DEMOS.food;
      return d.places.slice(0,10).map(p=>({
        id:p.id, placeId:p.id,
        name:p.displayName?.text||"Unknown",
        addr:p.formattedAddress||"",
        type:guessType(p.types||[]),
        rating:p.rating,
        price:p.priceLevel ? ["","$","$$","$$$","$$$$"][p.priceLevel]?.length||null : null,
        open:p.currentOpeningHours?.openNow,
        emoji:BT[guessType(p.types||[])]?.icon||"📍",
        photo:p.photos?.[0] ?
          `https://places.googleapis.com/v1/${p.photos[0].name}/media?maxWidthPx=400&key=${CONFIG.GOOGLE_PLACES_KEY}` : null,
      }));
    } catch(e) {
      console.error("Places API error:", e);
      return DEMOS[type]||DEMOS.food;
    }
  },
};

// ============================================================
// SHARED COMPONENTS
// ============================================================
function Logo({ light=false }) {
  const c = N;
  const G2 = "#e05535";
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,userSelect:"none"}}>
      <svg width="32" height="32" viewBox="0 0 40 40">
        <rect width="40" height="40" rx="11" fill={G2}/>
        <path d="M4,26 C6,22 8,12 13,11 C16,10 18,13 17,17 C16,20 14,24 16,23 C19,21 23,19 38,20" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4,26 C6,22 8,12 13,11 C16,10 18,13 17,17 C16,20 14,24 16,23 C19,21 23,19 38,20" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{fontSize:22,fontWeight:900,letterSpacing:"-0.05em",color:c,lineHeight:1}}>
        tru<span style={{color:G2}}>filo</span><span style={{color:G2}}>.</span>
      </span>
    </div>
  );
}

// Unique orange SVG icons — one per category, clearly distinct
const CAT_ICONS = {
  // Fork + knife
  food:         <><line x1="9" y1="3" x2="9" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="3" x2="12" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M9 9 Q9 13 10.5 14 L10.5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M15 3 L15 10 Q15 14 15 21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/><path d="M15 3 Q18 5 18 9 L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></>,
  // Scissors
  beauty:       <><circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="20" y1="4" x2="8.12" y2="15.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="20" y1="20" x2="13.12" y2="13.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  // Cross / medical
  health:       <><rect x="3" y="10" width="18" height="4" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/><rect x="10" y="3" width="4" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  // Dumbbell
  fitness:      <><line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><rect x="2" y="9" width="4" height="6" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/><rect x="18" y="9" width="4" height="6" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  // Car
  automotive:   <><path d="M5 17H3a1 1 0 0 1-1-1v-4l2-5h14l2 5v4a1 1 0 0 1-1 1h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><circle cx="7.5" cy="17" r="2" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="16.5" cy="17" r="2" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M5 9h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
  // House
  homeservices: <><path d="M3 12L12 4l9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></>,
  // Paw
  pets:         <><ellipse cx="9" cy="7" rx="2" ry="2.5" stroke="currentColor" strokeWidth="2" fill="none"/><ellipse cx="15" cy="7" rx="2" ry="2.5" stroke="currentColor" strokeWidth="2" fill="none"/><ellipse cx="5.5" cy="11" rx="1.5" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/><ellipse cx="18.5" cy="11" rx="1.5" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M12 21c-4 0-6-2.5-6-5 0-1.5 1-3 3-3.5h6c2 0.5 3 2 3 3.5 0 2.5-2 5-6 5z" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  // Baby / person small
  childcare:    <><circle cx="12" cy="5" r="3" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M5 21v-2a7 7 0 0 1 14 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M9 14l1.5 3h3L15 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  // Bed
  hospitality:  <><path d="M2 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M22 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M2 16h20" stroke="currentColor" strokeWidth="2"/><path d="M2 10h20v6" stroke="currentColor" strokeWidth="2" fill="none"/><rect x="6" y="7" width="5" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M2 20h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  // Shopping bag
  retail:       <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/><path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  // Briefcase
  professional: <><rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="12" y1="12" x2="12" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="9" y1="14.5" x2="15" y2="14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  // Party popper / balloon
  events:       <><path d="M5.8 11.3L2 22l10.7-3.79" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M4 3h.01M22 8h.01M15 2h.01M22 20h.01M9.95 6.95l9.1 9.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M14.78 6.95a5 5 0 0 1 2.27 9.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></>,
  // Graduation cap
  education:    <><path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></>,
  // Game controller
  entertainment:<><rect x="2" y="7" width="20" height="11" rx="5" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M7 12h4M9 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="15" cy="11" r="1" fill="currentColor"/><circle cx="17" cy="13" r="1" fill="currentColor"/></>,
  // Moving truck
  moving:       <><rect x="1" y="4" width="13" height="12" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M14 8h4l3 4v4h-7V8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/><circle cx="5" cy="18" r="2" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  // Laptop
  techrepair:   <><rect x="2" y="4" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M1 20h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M9 9l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
  // Washing machine
  laundry:      <><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="12" cy="13" r="5" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M6 6h.01M9 6h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  // Credit card / dollar
  financial:    <><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="2"/><line x1="6" y1="15" x2="10" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  // Dove / flower
  funeral:      <><path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 12C12 12 7 10 5 6c4 0 7 3 7 6z" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M12 12C12 12 17 10 19 6c-4 0-7 3-7 6z" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M12 12C12 12 8 8 8 3c3 1 5 5 4 9z" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M12 12C12 12 16 8 16 3c-3 1-5 5-4 9z" stroke="currentColor" strokeWidth="1.5" fill="none"/></>,
  // Government columns
  government:   <><path d="M3 22V12M7 22V12M11 22V12M15 22V12M19 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 3L2 8h20L12 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/><path d="M2 22h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M2 8h20" stroke="currentColor" strokeWidth="1.5"/></>,
};

function IconBox({ type, size=44, emoji }) {
  const icon = CAT_ICONS[type] || CAT_ICONS.food;
  const box  = BT[type]?.box || { bg:"#FFF0EC", bd:"#F9C4B0", ic:"#C84B1F" };
  const s = size * 0.55;
  return (
    <div style={{width:size,height:size,borderRadius:16,flexShrink:0,
      background:BG3,border:`1.5px solid ${BDR}`,
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      {emoji
        ? <span style={{fontSize:size*0.42,lineHeight:1}}>{emoji}</span>
        : <svg width={s} height={s} viewBox="0 0 24 24" style={{color:O}}>{icon}</svg>
      }
    </div>
  );
}

function ScoreBadge({ score, size=50 }) {
  const C      = score ? (score>=8?SH:score>=6?SM:SL) : null;
  const dec    = score ? (score/2).toFixed(1) : null;
  const starSz = size > 40 ? 13 : 10;
  const bd = C ? C.bd : BDR;
  const bg = C ? C.bg : BG2;
  return (
    <div style={{width:size,height:size,flexShrink:0,borderRadius:12,
      border:`2px solid ${bd}`,background:bg,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}}>
      <svg width={starSz} height={starSz} viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="1">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>
      <span style={{fontSize:size>40?16:12,fontWeight:900,color:N,lineHeight:1}}>{dec||"—"}</span>
    </div>
  );
}

function Back({ onClick, label }) {
  const [h,setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{width:"100%",padding:"11px",borderRadius:14,marginBottom:14,
        border:`2px solid ${O}`,background:h?BG2:O,color:h?O:"#fff",
        fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6,
        transition:"all 0.15s",fontFamily:"inherit",cursor:"pointer"}}>
      ‹ {label}
    </button>
  );
}

function PrimaryBtn({ children, onClick, disabled, full, style={} }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{width:full?"100%":"auto",padding:"13px 22px",borderRadius:14,border:"none",
        background:disabled?"#eee":G,color:disabled?"#555":"#fff",
        fontSize:14,fontWeight:700,cursor:disabled?"default":"pointer",
        boxShadow:disabled?"none":"0 4px 16px rgba(255,107,53,0.3)",
        transition:"all 0.2s",fontFamily:"inherit",...style}}>
      {children}
    </button>
  );
}

// Category filter pill
function BusinessCard({ b, onSelect, onRate }) {
  const [hoursOpen, setHoursOpen] = useState(false);
  const bt = BT[b.type||"food"];
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const todayKey = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];
  const closes = b.hours ? closeTime(b.hours) : null;

  return (
    <div style={{background:BG2,border:`2px solid ${BDR}`,borderRadius:18,marginBottom:10,overflow:"hidden",
      transition:"border-color 0.15s",cursor:"pointer"}}
      onMouseEnter={e=>e.currentTarget.style.borderColor=O}
      onMouseLeave={e=>e.currentTarget.style.borderColor=BDR}>
      {/* Main row */}
      <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px"}}
        onClick={()=>onSelect(b)}>
        <IconBox type={b.type} size={52} emoji={b.emoji}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:16,fontWeight:800,color:N,marginBottom:3,
            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{b.name}</div>
          <div style={{fontSize:12,color:MUT,marginBottom:4}}>
            {b.subtype||bt.label}
            {b.rating ? <span style={{color:MUT}}> · ⭐ {b.rating}</span> : null}
            {b.price ? <span style={{color:MUT}}> · {"$".repeat(b.price)}</span> : null}
          </div>
          {/* Hours row */}
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:12,fontWeight:700,color:b.open?"#e05535":"#dc2626"}}>
              {b.open ? "Open" : "Closed"}
            </span>
            {b.hours && (
              <button
                onClick={e=>{e.stopPropagation();setHoursOpen(o=>!o);}}
                style={{display:"inline-flex",alignItems:"center",gap:2,
                  fontSize:11,color:MUT,background:"none",border:"none",cursor:"pointer",padding:"0 2px"}}>
                <span>Hours</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <polyline points={hoursOpen?"18 15 12 9 6 15":"6 9 12 15 18 9"}/>
                </svg>
              </button>
            )}
          </div>
        </div>
        <button
          onClick={e=>{e.stopPropagation();onRate(b);}}
          style={{flexShrink:0,padding:"9px 14px",borderRadius:10,
            border:`2px solid ${O}`,background:"transparent",color:N,fontSize:11,fontWeight:800,
            cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",
            display:"flex",alignItems:"center",gap:5}}>
          Rate Now
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        </button>
      </div>

      {/* Hours dropdown */}
      {hoursOpen && b.hours && (
        <div style={{borderTop:`1.5px solid ${BDR}`,padding:"12px 16px 14px",
          background:BG3}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
            {days.map(day=>{
              const isToday = day === todayKey;
              const h = b.hours[day];
              return (
                <div key={day} style={{textAlign:"center"}}>
                  <div style={{fontSize:9,fontWeight:700,color:isToday?O:MUT,
                    textTransform:"uppercase",marginBottom:3}}>{day}</div>
                  <div style={{fontSize:10,color:isToday?N:MUT,fontWeight:isToday?700:400,
                    lineHeight:1.4,background:isToday?`${O}22`:undefined,
                    borderRadius:6,padding:"3px 2px"}}>
                    {h==="Closed"?"—":h==="24hrs"?"24h":h?.replace("am","a").replace("pm","p")||"—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Mock active sponsored ad — in production this comes from the DB
function SponsoredCard({ ad, onSelect }) {
  const [hoursOpen, setHoursOpen] = useState(false);
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const todayKey = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];
  const W = "rgba(255,255,255,0.9)";
  const WM = "rgba(255,255,255,0.65)";
  return (
    <div style={{background:O,border:"none",borderRadius:18,marginBottom:10,overflow:"hidden",cursor:"pointer"}}
      onClick={()=>onSelect({id:ad.bizId,name:ad.bizName,type:ad.bizType,emoji:ad.bizEmoji})}>
      {/* Header row: name + sponsored badge */}
      <div style={{background:"rgba(0,0,0,0.12)",borderBottom:"1px solid rgba(255,255,255,0.15)",
        padding:"6px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:13,fontWeight:800,color:"#fff",letterSpacing:"-0.01em"}}>{ad.bizName}</span>
        <span style={{fontSize:9,fontWeight:800,color:"#fff",textTransform:"uppercase",letterSpacing:"0.12em",
          background:"rgba(255,255,255,0.2)",padding:"2px 8px",borderRadius:20}}>Sponsored</span>
      </div>
      {/* Main row */}
      <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px"}}>
        <div style={{width:52,height:52,borderRadius:14,flexShrink:0,overflow:"hidden",
          background:"rgba(255,255,255,0.15)",border:"1.5px solid rgba(255,255,255,0.4)",
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          {ad.image
            ? <img src={ad.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            : <span style={{fontSize:26}}>{ad.bizEmoji||"🏪"}</span>
          }
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:15,fontWeight:800,color:"#fff",marginBottom:2,
            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ad.headline}</div>
          <div style={{fontSize:11,color:WM,marginBottom:5,
            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ad.tagline}</div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:11,color:WM}}>
              {ad.bizSubtype||ad.bizType}
              {ad.bizRating ? <span> · ⭐ {ad.bizRating}</span> : null}
              {ad.bizPrice ? <span> · {"$".repeat(ad.bizPrice)}</span> : null}
            </span>
            <span style={{color:WM}}>·</span>
            <span style={{fontSize:11,fontWeight:700,color:ad.bizOpen?"#86efac":"#fca5a5"}}>
              {ad.bizOpen ? "Open" : "Closed"}
            </span>
            {ad.bizHours && (
              <button onClick={e=>{e.stopPropagation();setHoursOpen(o=>!o);}}
                style={{display:"inline-flex",alignItems:"center",gap:2,
                  fontSize:11,color:WM,background:"none",border:"none",cursor:"pointer",padding:"0 2px"}}>
                <span>Hours</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <polyline points={hoursOpen?"18 15 12 9 6 15":"6 9 12 15 18 9"}/>
                </svg>
              </button>
            )}
          </div>
        </div>
        <div style={{flexShrink:0,padding:"9px 14px",borderRadius:10,
          background:"rgba(255,255,255,0.2)",border:"1.5px solid rgba(255,255,255,0.5)",
          color:"#fff",fontSize:11,fontWeight:800,
          whiteSpace:"nowrap",fontFamily:"inherit"}}>
          {ad.cta}
        </div>
      </div>
      {/* Hours dropdown */}
      {hoursOpen && ad.bizHours && (
        <div style={{borderTop:"1px solid rgba(255,255,255,0.2)",padding:"12px 16px 14px",
          background:"rgba(0,0,0,0.12)"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
            {days.map(day=>{
              const isToday = day === todayKey;
              const h = ad.bizHours[day];
              return (
                <div key={day} style={{textAlign:"center"}}>
                  <div style={{fontSize:9,fontWeight:700,color:isToday?"#fff":WM,
                    textTransform:"uppercase",marginBottom:3}}>{day}</div>
                  <div style={{fontSize:10,color:isToday?"#fff":WM,fontWeight:isToday?700:400,
                    lineHeight:1.4,background:isToday?"rgba(255,255,255,0.2)":undefined,
                    borderRadius:6,padding:"3px 2px"}}>
                    {h==="Closed"?"—":h==="24hrs"?"24h":h?.replace("am","a").replace("pm","p")||"—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CatPill({ typeKey, selected, onClick }) {
  const t = BT[typeKey];
  const on = selected === typeKey;
  return (
    <button onClick={onClick} style={{
      display:"flex",alignItems:"center",gap:5,
      padding:"7px 13px",borderRadius:20,flexShrink:0,
      border:`2px solid ${on?O:BDR}`,
      background:on?O:"transparent",
      color:on?"#fff":N,
      fontSize:12,fontWeight:on?700:500,cursor:"pointer",
      transition:"all 0.15s",whiteSpace:"nowrap",fontFamily:"inherit"}}>
      <svg width="13" height="13" viewBox="0 0 24 24" style={{color:on?"#fff":O,flexShrink:0}}>
        {CAT_ICONS[typeKey]||CAT_ICONS.food}
      </svg>
      {t.label.split(" ")[0]}
    </button>
  );
}

// ============================================================
// STAR RATING CARD
// ============================================================
const STAR_LABELS = ["","Terrible","Poor","OK","Good","Amazing"];

// Renders 5 stars with partial fill support (e.g. 4.5 = 4 full + 1 half)
function PartialStars({ value, size=14, color="#FBBF24" }) {
  // value is 0-5 (can be decimal)
  const stars = [1,2,3,4,5].map(n => {
    const diff = value - (n-1);
    if (diff >= 1) return "full";
    if (diff > 0) return "half";
    return "empty";
  });
  const id = `ps-${Math.random().toString(36).slice(2,7)}`;
  return (
    <div style={{display:"flex",gap:1,alignItems:"center"}}>
      <svg width={size*5+4*1} height={size} viewBox={`0 0 ${size*5+4} ${size}`}>
        <defs>
          {stars.map((s,i) => s==="half" && (
            <linearGradient key={i} id={`${id}-${i}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="50%" stopColor={color}/>
              <stop offset="50%" stopColor="#BBBBBB"/>
            </linearGradient>
          ))}
        </defs>
        {stars.map((s,i) => {
          const x = i*(size+1);
          const c = s==="full" ? color : s==="half" ? `url(#${id}-${i})` : "#BBBBBB";
          // Simple star polygon
          const cx = x + size/2, cy = size/2, r1 = size*0.48, r2 = size*0.2;
          const pts = Array.from({length:10},(_,k)=>{
            const angle = (k*Math.PI/5) - Math.PI/2;
            const r = k%2===0 ? r1 : r2;
            return `${cx+r*Math.cos(angle)},${cy+r*Math.sin(angle)}`;
          }).join(" ");
          return <polygon key={i} points={pts} fill={c}/>;
        })}
      </svg>
    </div>
  );
}

function StarCard({ cat, value, onChange, box }) {
  const [hov,setHov] = useState(0);
  const sv   = value ? value/2 : 0;
  const show = hov || sv;
  const SC   = sv ? scC(sv) : null;

  return (
    <div style={{padding:"14px 16px",borderRadius:16,marginBottom:10,
      background:BG2,border:`1.5px solid ${SC?SC.bd:O}`,
      transition:"border-color 0.2s"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{width:38,height:38,borderRadius:11,flexShrink:0,
          background:BG3,border:`1.5px solid ${BDR}`,
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="18" height="18" viewBox="0 0 24 24" stroke={O} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {CAT_ICONS[cat.id]||CAT_ICONS.food}
          </svg>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:N}}>{cat.label}</div>
          <div style={{fontSize:11,color:MUT,marginTop:1}}>{cat.q}</div>
        </div>
        {sv>0&&(
          <div style={{fontSize:12,fontWeight:800,color:SC?SC.tx:MUT,
            background:SC?SC.bg:BG3,padding:"3px 10px",borderRadius:20,
            border:`1.5px solid ${SC?SC.bd:BDR}`,whiteSpace:"nowrap"}}>
            {sv}/5
          </div>
        )}
      </div>
      {/* Stars in boxes */}
      <div style={{display:"flex",justifyContent:"center",gap:6}}
           onMouseLeave={()=>setHov(0)}>
        {[1,2,3,4,5].map(n=>{
          const filled = n<=show;
          return (
            <button key={n} onMouseEnter={()=>setHov(n)} onClick={()=>onChange(sv===n?null:n*2)}
              style={{width:44,height:44,borderRadius:12,
                background:filled?O:BG3,border:`1.5px solid ${filled?O:BDR}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:22,cursor:"pointer",fontFamily:"inherit",
                transition:"background 0.12s,border-color 0.12s"}}>
              <span style={{color:filled?"#fff":MUT,lineHeight:1}}>★</span>
            </button>
          );
        })}
      </div>
      {sv>0&&(
        <div style={{textAlign:"center",marginTop:7}}>
          <button onClick={()=>onChange(null)}
            style={{fontSize:11,color:SC?"rgba(255,255,255,0.6)":"#aaa",background:"none",border:"none",
              cursor:"pointer",textDecoration:"underline",fontFamily:"inherit"}}>clear</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// REVIEW CARD
// ============================================================
function ReviewCard({ review, btKey, onHelpful, helpedIds }) {
  const bt    = BT[btKey||"food"];
  const rated = bt.core.filter(c=>review.scores?.[c.id]);
  const vals  = Object.values(review.scores||{}).filter(Boolean);
  const avg   = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
  const helped = helpedIds?.includes(review.id);
  const d     = Math.floor((Date.now()-new Date(review.created_at))/86400000);
  const ago   = d===0?"Today":d===1?"Yesterday":`${d}d ago`;

  return (
    <div style={{background:BG2,border:`2px solid ${BDR}`,borderRadius:18,padding:"14px 15px",marginBottom:10}}>
      {/* Photos row if present */}
      {review.photos?.length>0&&(
        <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
          {review.photos.map((src,i)=>(
            <img key={i} src={src} alt="" style={{width:70,height:70,borderRadius:10,objectFit:"cover",border:`2px solid ${BDR}`}}/>
          ))}
        </div>
      )}
      {/* Top row: score badge + testimonial + helpful */}
      <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:rated.length>0?10:0}}>
        <ScoreBadge score={avg} size={50}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:11,color:MUT,marginBottom:4}}>{ago}</div>
          {review.feedback&&(
            <div style={{fontSize:13,color:MUT,lineHeight:1.5,fontStyle:"italic"}}>
              "{review.feedback}"
            </div>
          )}
        </div>
        <button onClick={()=>onHelpful(review.id)}
          style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,
            padding:"5px 8px",borderRadius:10,flexShrink:0,
            background:helped?"#FFF3EE":"transparent",
            border:`1.5px solid ${helped?"#FFD4C2":"transparent"}`,
            transition:"all 0.15s",fontFamily:"inherit"}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color:helped?"#e05535":"#999"}}>
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
          </svg>
          <span style={{fontSize:10,color:helped?O:MUT,fontWeight:helped?700:400}}>
            {(review.helpful||0)+(helped?1:0)}
          </span>
        </button>
      </div>
      {/* Category star pills below */}
      {rated.length>0&&(
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>
          {rated.map(cat=>{
            const s  = review.scores[cat.id];
            return (
              <div key={cat.id} style={{display:"inline-flex",alignItems:"center",gap:4,
                padding:"3px 10px",background:"rgba(255,255,255,0.06)",
                border:`1.5px solid ${BDR}`,borderRadius:10}}>
                <span style={{fontSize:10,fontWeight:700,color:O}}>{cat.label}</span>
                <PartialStars value={s/2} size={10} color="#FBBF24"/>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// SHARE CARD
// ============================================================
function ShareCard({ business, scores, onClose }) {
  const vals  = Object.values(scores).filter(Boolean);
  const avg   = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
  const stars = avg ? Math.round(avg/2) : null;
  const bt    = BT[business?.type||"food"];
  const text  = `Just rated ${business?.name} on Trufilo — ${"★".repeat(stars||0)} ${stars||"??"}/5 stars. Free at trufilo.com`;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(26,26,46,0.7)",display:"flex",
      alignItems:"center",justifyContent:"center",zIndex:999,padding:"1rem"}}>
      <div style={{background:BG2,borderRadius:24,padding:24,maxWidth:360,width:"100%",
        boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{background:G,borderRadius:18,padding:22,marginBottom:18,textAlign:"center"}}>
          <Logo light/>
          <div style={{background:"rgba(255,255,255,0.12)",borderRadius:14,padding:16,marginTop:14}}>
            <div style={{fontSize:15,fontWeight:700,color:N,marginBottom:8}}>{business?.name}</div>
            <div style={{fontSize:32,color:"#e05535",lineHeight:1,letterSpacing:2}}>
              {"★".repeat(stars||0)}{"☆".repeat(5-(stars||0))}
            </div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.65)",marginTop:6}}>{stars||"?"}/5 · {bt?.label}</div>
          </div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:10}}>trufilo.com · free for everyone</div>
        </div>
        <div style={{fontSize:13,color:MUT,marginBottom:14,lineHeight:1.5}}>{text}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
          {[["📋 Copy",()=>navigator.clipboard?.writeText(text)],
            ["🐦 Tweet",()=>window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`)],
            ["💬 Text",()=>window.open(`sms:?body=${encodeURIComponent(text)}`)]
          ].map(([l,fn])=>(
            <button key={l} onClick={fn}
              style={{padding:"10px 6px",borderRadius:12,border:`2px solid ${BDR}`,
                background:BG3,fontSize:12,fontWeight:700,color:N,fontFamily:"inherit"}}>{l}</button>
          ))}
        </div>
        <PrimaryBtn full onClick={onClose}>Done ✓</PrimaryBtn>
      </div>
    </div>
  );
}

// ============================================================
// BUSINESS PAGE
// ============================================================
function BusinessPage({ business, onBack, onRate }) {
  const [sort,setSort]       = useState("highest");
  const [helpedIds,setHelped]= useState([]);
  const bt = BT[business.type||"food"];

  const allVals = DEMO_REVIEWS.flatMap(r=>Object.values(r.scores||{}).filter(Boolean));
  const overall = allVals.length ? allVals.reduce((a,b)=>a+b,0)/allVals.length : null;
  const overallStars = overall ? Math.round(overall/2) : null;

  const catAvgs = bt.core.map(cat=>{
    const vals = DEMO_REVIEWS.map(r=>r.scores?.[cat.id]).filter(Boolean);
    const avg  = vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
    return {...cat,avg,stars:avg?Math.round(avg/2):null};
  }).filter(c=>c.avg);

  const sorted = [...DEMO_REVIEWS].sort((a,b)=>{
    if(sort==="highest") return b.avg-a.avg;
    if(sort==="lowest")  return a.avg-b.avg;
    if(sort==="helpful") return (b.helpful||0)-(a.helpful||0);
    return new Date(b.created_at)-new Date(a.created_at);
  });

  return (
    <div style={{maxWidth:560,margin:"0 auto",padding:"1rem 1rem 3rem"}}>
      <Back onClick={onBack} label="Back to search"/>
      <div style={{background:BG,borderRadius:20,padding:"18px",marginBottom:12,
        position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,
          borderRadius:"50%",background:"rgba(255,107,53,0.15)"}}/>
        <div style={{display:"flex",alignItems:"flex-start",gap:12,position:"relative"}}>
          <IconBox type={business.type} size={50} emoji={business.emoji}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:10,fontWeight:700,color:O,textTransform:"uppercase",
              letterSpacing:"0.08em",marginBottom:2}}>{bt.label}</div>
            <div style={{fontSize:17,fontWeight:900,color:N,marginBottom:2}}>{business.name}</div>
            <div style={{fontSize:11,color:MUT}}>{business.addr||business.address}</div>
            <div style={{display:"flex",gap:8,marginTop:4}}>
              {business.rating&&<span style={{fontSize:11,color:MUT}}>★ {business.rating}</span>}
              {(business.price||business.priceLevel)&&<span style={{fontSize:11,color:MUT}}>{"$".repeat(business.price||business.priceLevel)}</span>}
              <span style={{fontSize:11,fontWeight:700,
                color:(business.open||business.isOpen)?"#e05535":"rgba(255,255,255,0.4)"}}>
                {(business.open||business.isOpen)?"● Open":"● Closed"}
              </span>
            </div>
          </div>
          {overallStars&&(()=>{
            const sw=64,sh=60,tail=10,r=10;
            const path=`M${r},0 H${sw-r} Q${sw},0 ${sw},${r} V${sh-r} Q${sw},${sh} ${sw-r},${sh} H${sw/2+9} L${sw/2},${sh+tail} L${sw/2-9},${sh} H${r} Q0,${sh} 0,${sh-r} V${r} Q0,0 ${r},0 Z`;
            return (
              <div style={{position:"relative",width:sw,height:sh+tail,flexShrink:0}}>
                <svg width={sw} height={sh+tail} viewBox={`0 0 ${sw} ${sh+tail}`} style={{position:"absolute",top:0,left:0}}>
                  <path d={path} fill={O}/>
                </svg>
                <div style={{position:"absolute",top:0,left:0,width:sw,height:sh,
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}}>
                  <div style={{fontSize:20,fontWeight:900,color:"#fff",lineHeight:1}}>{(overall/2).toFixed(1)}</div>
                  <PartialStars value={overall/2} size={11} color="#FBBF24"/>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {catAvgs.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:`repeat(${catAvgs.length},1fr)`,gap:8,marginBottom:12}}>
          {catAvgs.map(cat=>{
            return (
              <div key={cat.id} style={{padding:"12px 6px",
                background:BG2,
                border:`1.5px solid ${BDR}`,
                borderRadius:16,textAlign:"center"}}>
                <div style={{fontSize:11,fontWeight:800,color:O,textTransform:"uppercase",
                  letterSpacing:"0.06em",marginBottom:6}}>{cat.label}</div>
                <div style={{fontSize:18,fontWeight:900,color:N,lineHeight:1,marginBottom:4}}>{(cat.avg/2).toFixed(1)}</div>
                <div style={{display:"flex",justifyContent:"center"}}>
                  <PartialStars value={cat.avg/2} size={13} color="#FBBF24"/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PrimaryBtn full onClick={onRate} style={{marginBottom:16}}>
        ⭐ Rate {business.name} — 30 seconds
      </PrimaryBtn>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        marginBottom:12,flexWrap:"wrap",gap:6}}>
        <span style={{fontSize:14,fontWeight:700,color:N}}>{DEMO_REVIEWS.length} reviews</span>
        <div style={{display:"flex",gap:5}}>
          {[["recent","Recent"],["highest","Best"],["lowest","Worst"]].map(([s,l])=>(
            <button key={s} onClick={()=>setSort(s)}
              style={{padding:"4px 9px",borderRadius:10,fontSize:11,fontWeight:sort===s?700:400,
                border:`2px solid ${sort===s?N:BDR}`,
                background:sort===s?N:BG2,color:sort===s?BG:N,
                transition:"all 0.15s",fontFamily:"inherit",cursor:"pointer"}}>{l}</button>
          ))}
        </div>
      </div>

      {sorted.map(r=>(
        <ReviewCard key={r.id} review={r} btKey={business.type}
          onHelpful={id=>setHelped(h=>h.includes(id)?h.filter(x=>x!==id):[...h,id])}
          helpedIds={helpedIds}/>
      ))}
    </div>
  );
}

// ============================================================
// RATE VIEW
// ============================================================
function RateView({ business, onBack, onDone }) {
  const bt = BT[business.type||"food"];
  const [scores,setScores]     = useState({});
  const [items,setItems]       = useState([]);
  const [newItem,setNewItem]   = useState("");
  const [feedback,setFeedback] = useState("");
  const [showExtra,setExtra]   = useState(false);
  const [submitting,setSub]    = useState(false);
  const [photos,setPhotos]     = useState([]); // base64 strings

  const hasAny = Object.keys(scores).length>0||items.length>0||feedback.trim().length>0||photos.length>0;
  const vals   = Object.values(scores).filter(Boolean);
  const avgSt  = vals.length?Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)/2):0;

  const addItem = ()=>{if(!newItem.trim())return;setItems(i=>[...i,newItem.trim()]);setNewItem("");};

  const addPhotos = (e) => {
    const files = Array.from(e.target.files||[]);
    files.slice(0, 3-photos.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setPhotos(p=>[...p, ev.target.result]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const submit = async()=>{
    setSub(true);
    await sb.save("reviews",{
      place_id:business.placeId||business.id,
      business_name:business.name,business_type:business.type,
      scores,items,feedback:feedback.trim()||null,
      avg:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null,
      created_at:new Date().toISOString(),
    });
    setSub(false);
    onDone({scores,feedback,items,photos});
  };

  return (
    <div style={{maxWidth:540,margin:"0 auto",padding:"1rem 1rem 5rem"}}>
      <Back onClick={onBack} label={`Back to ${business.name}`}/>

      {/* Business header — category colored */}
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",
        background:BG,border:`2px solid ${BDR}`,borderRadius:16,marginBottom:14,
        position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-15,right:-15,width:60,height:60,
          borderRadius:"50%",background:"rgba(255,107,53,0.15)"}}/>
        <div style={{width:40,height:40,borderRadius:12,flexShrink:0,
          background:BG2,border:`1.5px solid ${BDR}`,
          display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
          <svg width="18" height="18" viewBox="0 0 24 24" style={{color:O}}>
            {CAT_ICONS[business.type]||CAT_ICONS.food}
          </svg>
        </div>
        <div style={{flex:1,minWidth:0,position:"relative"}}>
          <div style={{fontSize:10,fontWeight:700,color:O,textTransform:"uppercase",
            letterSpacing:"0.08em",marginBottom:2}}>{bt.label}</div>
          <div style={{fontSize:15,fontWeight:800,color:N,
            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{business.name}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:1}}>any one field is enough</div>
        </div>
        {avgSt>0&&<div style={{fontSize:20,fontWeight:900,color:N,flexShrink:0,
          position:"relative"}}>{avgSt}<span style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>/5</span></div>}
      </div>

      {bt.core.map(cat=>(
        <StarCard key={cat.id} cat={cat} value={scores[cat.id]} box={bt.box}
          onChange={v=>setScores(s=>({...s,[cat.id]:v}))}/>
      ))}

      {!showExtra?(
        <button onClick={()=>setExtra(true)}
          style={{width:"100%",padding:"10px",borderRadius:14,marginBottom:12,
            border:`1.5px solid ${BDR}`,background:BG2,fontSize:12,color:O,fontWeight:600,
            transition:"all 0.15s",fontFamily:"inherit"}}
          onMouseEnter={e=>{e.currentTarget.style.background="#FFE8D6"}}
          onMouseLeave={e=>{e.currentTarget.style.background="#FFF3EE"}}>
          + More to rate (optional)
        </button>
      ):(
        bt.extra?.map(cat=>(
          <StarCard key={cat.id} cat={cat} value={scores[cat.id]} box={bt.box}
            onChange={v=>setScores(s=>({...s,[cat.id]:v}))}/>
        ))
      )}

      <div style={{marginBottom:14}}>
        <p style={{fontSize:12,fontWeight:600,color:N,marginBottom:7}}>
          {bt.itemLabel} <span style={{fontWeight:400,color:MUT}}>(optional)</span>
        </p>
        <div style={{display:"flex",gap:8,marginBottom:items.length?8:0}}>
          <input value={newItem} onChange={e=>setNewItem(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&addItem()}
            placeholder="Type and press Enter…"
            style={{flex:1,borderRadius:12,border:`1.5px solid ${BDR}`,
              padding:"9px 13px",fontSize:13,background:BG2,color:N}}/>
          <button onClick={addItem} disabled={!newItem.trim()}
            style={{padding:"9px 14px",borderRadius:12,border:`2px solid ${O}`,
              background:O,color:N,fontSize:12,fontWeight:700,
              opacity:newItem.trim()?1:0.4,fontFamily:"inherit"}}>Add</button>
        </div>
        {items.length>0&&(
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {items.map((item,i)=>(
              <div key={i} style={{display:"inline-flex",alignItems:"center",gap:4,
                padding:"3px 10px",background:BG3,border:`1.5px solid ${BDR}`,borderRadius:10}}>
                <span style={{fontSize:11,fontWeight:600,color:N}}>{item}</span>
                <button onClick={()=>setItems(it=>it.filter((_,j)=>j!==i))}
                  style={{background:"none",border:"none",color:MUT,fontSize:13,lineHeight:1,
                    padding:0,fontFamily:"inherit"}}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo upload */}
      <div style={{marginBottom:14}}>
        <p style={{fontSize:12,fontWeight:600,color:N,marginBottom:7}}>
          Add photos <span style={{fontWeight:400,color:MUT}}>(optional · up to 3)</span>
        </p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {photos.map((src,i)=>(
            <div key={i} style={{position:"relative",width:80,height:80}}>
              <img src={src} alt="" style={{width:80,height:80,borderRadius:12,objectFit:"cover",border:`2px solid ${BDR}`}}/>
              <button onClick={()=>setPhotos(p=>p.filter((_,j)=>j!==i))}
                style={{position:"absolute",top:-6,right:-6,width:20,height:20,borderRadius:"50%",
                  background:"#111",color:N,border:"none",fontSize:12,lineHeight:1,
                  display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontFamily:"inherit"}}>×</button>
            </div>
          ))}
          {photos.length<3&&(
            <label style={{width:80,height:80,borderRadius:12,border:"2px dashed #FFD4C2",
              background:BG2,display:"flex",flexDirection:"column",alignItems:"center",
              justifyContent:"center",cursor:"pointer",gap:4}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="#555"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              <span style={{fontSize:10,color:O,fontWeight:600}}>Add photo</span>
              <input type="file" accept="image/*" multiple onChange={addPhotos} style={{display:"none"}}/>
            </label>
          )}
        </div>
      </div>

      <div style={{marginBottom:16}}>
        <p style={{fontSize:12,fontWeight:600,color:N,marginBottom:7}}>
          {bt.placeholder} <span style={{fontWeight:400,color:MUT}}>(optional)</span>
        </p>
        <textarea value={feedback} onChange={e=>setFeedback(e.target.value)}
          placeholder="Say as much or as little as you want…"
          style={{width:"100%",minHeight:72,borderRadius:14,border:`1.5px solid ${BDR}`,
            padding:"11px 13px",fontSize:13,lineHeight:1.6,
            background:BG2,color:N,boxSizing:"border-box"}}/>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:6}}>
          {bt.chips.map(c=>(
            <button key={c}
              onClick={()=>setFeedback(f=>f?(f.endsWith(".")?f+" "+c:f+". "+c):c)}
              style={{padding:"4px 11px",fontSize:11,borderRadius:10,border:`2px solid ${BDR}`,
                background:BG2,color:MUT,fontWeight:500,
                transition:"all 0.12s",fontFamily:"inherit",cursor:"pointer"}}
              onMouseEnter={e=>{e.target.style.background=HOV;e.target.style.borderColor="#555";}}
              onMouseLeave={e=>{e.target.style.background=BG2;e.target.style.borderColor=BDR;}}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{position:"sticky",bottom:16}}>
        <button disabled={!hasAny||submitting} onClick={submit}
          style={{width:"100%",padding:"13px",borderRadius:14,border:"none",
            background:hasAny?O:"#eee",color:hasAny?"#fff":"#999",
            fontSize:14,fontWeight:700,cursor:hasAny?"pointer":"default",
            transition:"all 0.2s",fontFamily:"inherit"}}>
          {submitting?"Submitting…":hasAny?"Submit feedback — free":"Fill out anything above to submit"}
        </button>
        {!hasAny&&(
          <p style={{textAlign:"center",fontSize:11,color:MUT,marginTop:5}}>
            Stars · add an item · or write one line — any one is enough
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CLAIM MODAL
// ============================================================
function ClaimModal({ onClose, onDashboard }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:"", email:"", biz:"", phone:"" });
  const [errors, setErrors] = useState({});
  const set = k => e => {
    setForm(f=>({...f,[k]:e.target.value}));
    setErrors(er=>({...er,[k]:false}));
  };

  const FIELDS = [
    {ph:"Business name *", k:"biz",   t:"text",  req:true},
    {ph:"Your name *",     k:"name",  t:"text",  req:true},
    {ph:"Email address *", k:"email", t:"email", req:true},
    {ph:"Phone number",    k:"phone", t:"tel",   req:false},
  ];

  const validate = () => {
    const errs = {};
    FIELDS.filter(f=>f.req).forEach(f=>{ if(!form[f.k].trim()) errs[f.k]=true; });
    if(form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email=true;
    setErrors(errs);
    return Object.keys(errs).length===0;
  };

  const submit = () => { if(validate()) setStep(2); };

  const inp = k => ({
    width:"100%", padding:"11px 14px", borderRadius:12,
    border:`1.5px solid ${errors[k]?"#ef4444":BDR}`,
    background:BG2, color:N, fontSize:13, fontFamily:"inherit",
    outline:"none", boxSizing:"border-box",
  });

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",
      alignItems:"flex-end",justifyContent:"center",zIndex:1000}} onClick={onClose}>
      <div style={{width:"100%",maxWidth:430,background:BG,borderRadius:"24px 24px 0 0",
        padding:"28px 24px 40px",boxShadow:"0 -8px 40px rgba(0,0,0,0.4)"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{width:40,height:4,borderRadius:2,background:BDR,margin:"0 auto 24px"}}/>

        {step===1 && <>
          <div style={{fontSize:22,fontWeight:900,color:N,marginBottom:6}}>Claim your business</div>
          <p style={{fontSize:13,color:MUT,marginBottom:24,lineHeight:1.6}}>
            Get a free dashboard, respond to reviews, and unlock AI-powered insights about your customers.
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:6}}>
            {FIELDS.map(({ph,k,t})=>(
              <div key={k}>
                <input type={t} placeholder={ph} value={form[k]} onChange={set(k)}
                  style={inp(k)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
                {errors[k] && (
                  <div style={{fontSize:11,color:"#ef4444",marginTop:4,paddingLeft:4}}>
                    {k==="email"?"Enter a valid email address":"This field is required"}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p style={{fontSize:11,color:MUT,marginBottom:20,paddingLeft:2}}>* Required fields</p>
          <button onClick={submit} style={{width:"100%",padding:"14px",borderRadius:14,
            border:"none",background:O,color:"#fff",fontSize:15,fontWeight:800,
            cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 16px rgba(255,107,53,0.4)"}}>
            Claim for free →
          </button>
        </>}

        {step===2 && <>
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:48,marginBottom:16}}>🎉</div>
            <div style={{fontSize:22,fontWeight:900,color:N,marginBottom:8}}>You're in!</div>
            <p style={{fontSize:13,color:MUT,lineHeight:1.6,marginBottom:8}}>
              Welcome to Trufilo, <strong style={{color:N}}>{form.name}</strong>.
            </p>
            <div style={{background:BG2,border:`1.5px solid ${BDR}`,borderRadius:14,
              padding:"14px 16px",marginBottom:24,textAlign:"left"}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8}}>
                <span style={{fontSize:18}}>📧</span>
                <div>
                  <div style={{fontSize:12,fontWeight:800,color:N,marginBottom:2}}>Dashboard link sent</div>
                  <div style={{fontSize:12,color:MUT,lineHeight:1.5}}>
                    A welcome email with your dashboard access link has been sent to{" "}
                    <strong style={{color:N}}>{form.email}</strong>.
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:18}}>✅</span>
                <div style={{fontSize:12,color:MUT,lineHeight:1.5}}>
                  Your listing for <strong style={{color:N}}>{form.biz}</strong> is now claimed. Everything on Trufilo is free for business owners.
                </div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button onClick={onDashboard} style={{padding:"13px 32px",borderRadius:12,border:"none",
                background:O,color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit",
                boxShadow:"0 4px 16px rgba(255,107,53,0.35)"}}>
                View my dashboard →
              </button>
              <button onClick={onClose} style={{padding:"12px 32px",borderRadius:12,
                border:`1.5px solid ${BDR}`,background:"transparent",color:MUT,
                fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                I'll explore later
              </button>
            </div>
          </div>
        </>}
      </div>
    </div>
  );
}

// ============================================================
// ADVERTISE MODAL — self-serve ad builder
// ============================================================
const AD_BUDGETS = [
  {
    label:"Starter", amount:50,
    reach:"1,200–2,000", cpm:"$25",
    placements:"Featured in 1 category feed",
    audience:"Local users browsing your category",
    billing:"Billed monthly · Cancel anytime",
    best:"New to advertising",
  },
  {
    label:"Growth", amount:150,
    reach:"4,000–6,500", cpm:"$23",
    placements:"Featured in 3 category feeds + search results",
    audience:"Local + nearby-city users · interest-matched",
    billing:"Billed monthly · Cancel anytime",
    best:"Growing a loyal base",
  },
  {
    label:"Pro", amount:350,
    reach:"10,000–16,000", cpm:"$22",
    placements:"All category feeds + search + home spotlight",
    audience:"Broad local area · highest-intent users prioritized",
    billing:"Billed monthly · Cancel anytime",
    best:"Dominating local search",
  },
];

function AdvertisePage({ onBack }) {
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState(null);
  const [adForm, setAdForm] = useState({ headline:"", tagline:"", cta:"Book now" });
  const [card, setCard] = useState({ num:"", exp:"", cvv:"" });
  const [launched, setLaunched] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [customCta, setCustomCta] = useState(false);
  const [adImage, setAdImage] = useState(null);
  const set = k => e => setAdForm(f=>({...f,[k]:e.target.value}));
  const inp = {width:"100%",padding:"11px 14px",borderRadius:10,border:`1.5px solid ${BDR}`,
    background:BG,color:N,fontSize:16,fontFamily:"inherit",outline:"none",boxSizing:"border-box"};
  const sel = AD_BUDGETS[budget];

  useEffect(()=>{ window.scrollTo(0,0); },[step]);

  const STEPS = ["Plan","Creative","Funds"];

  return (
    <div style={{width:"100%",minHeight:"100vh",display:"flex",flexDirection:"column",overflowX:"hidden"}}>

      {/* Header — matches OwnerDashboard */}
      <div style={{background:BG2,padding:"16px 16px 0",borderBottom:`1.5px solid ${BDR}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <button onClick={onBack} style={{background:"none",border:"none",color:MUT,
            cursor:"pointer",padding:"4px 0",fontFamily:"inherit",fontSize:12,fontWeight:700,
            display:"flex",alignItems:"center",gap:4}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{width:44,height:44,borderRadius:12,background:O,flexShrink:0,
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="rgba(255,255,255,0.25)" stroke="white"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
          </div>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:N}}>Advertise on Trufilo</div>
            <div style={{fontSize:11,color:MUT}}>Self-serve · No contracts · Cancel anytime</div>
          </div>
        </div>

        {/* Step tab bar */}
        {!launched && (
          <div style={{display:"flex",gap:0}}>
            {STEPS.map((s,i)=>(
              <div key={s} style={{flex:1,padding:"10px 0",
                borderBottom:`2.5px solid ${step===i+1?O:"transparent"}`,
                display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{width:20,height:20,borderRadius:"50%",flexShrink:0,
                  background:step>i+1?O:step===i+1?O:BG3,
                  border:`2px solid ${step>=i+1?O:BDR}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:10,fontWeight:800,color:step>=i+1?"#fff":MUT}}>
                  {step>i+1
                    ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : i+1}
                </div>
                <span style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",
                  color:step===i+1?O:MUT}}>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",padding:"16px",boxSizing:"border-box",width:"100%"}}>

        {/* STEP 1 — Choose plan */}
        {step===1 && !launched && <>
          <div style={{fontSize:14,fontWeight:800,color:N,textTransform:"uppercase",
            letterSpacing:"0.06em",marginBottom:12}}>Choose your plan</div>

          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
            {AD_BUDGETS.map((b,i)=>(
              <div key={b.label} onClick={()=>setBudget(i)}
                onMouseEnter={()=>setHoveredPlan(i)}
                onMouseLeave={()=>setHoveredPlan(null)}
                style={{background:budget===i?O:BG2,
                  border:`1.5px solid ${budget===i||hoveredPlan===i?O:BDR}`,
                  borderRadius:16,padding:"14px 16px",cursor:"pointer",transition:"all 0.15s",
                  boxShadow:budget===i?`0 0 0 3px ${O}33`:"none"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:14,fontWeight:900,color:budget===i?"#fff":N}}>{b.label}</span>
                    <span style={{fontSize:9,fontWeight:700,
                      color:budget===i?"rgba(255,255,255,0.8)":MUT,
                      background:budget===i?"rgba(255,255,255,0.2)":BG3,
                      borderRadius:6,padding:"2px 7px",textTransform:"uppercase",letterSpacing:"0.05em"}}>Best for {b.best}</span>
                  </div>
                  <span style={{fontSize:18,fontWeight:900,color:budget===i?"#fff":O}}>${b.amount}<span style={{fontSize:11,fontWeight:600,color:budget===i?"rgba(255,255,255,0.7)":MUT}}>/mo</span></span>
                </div>
                <div style={{height:1,background:budget===i?"rgba(255,255,255,0.25)":BDR,marginBottom:10}}/>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {[["👥",<><strong>{b.reach}</strong> est. views/mo · {b.cpm} CPM</>],
                    ["📍",b.placements],
                    ["🎯",b.audience]
                  ].map(([icon,text],j)=>(
                    <div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                      <span style={{fontSize:12,lineHeight:"18px"}}>{icon}</span>
                      <span style={{fontSize:12,color:budget===i?"rgba(255,255,255,0.9)":N,lineHeight:1.5}}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{background:BG2,border:`1.5px solid ${BDR}`,borderRadius:16,
            padding:"14px 16px",marginBottom:16,display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:14,lineHeight:"18px"}}>ℹ️</span>
            <p style={{fontSize:12,color:MUT,margin:0,lineHeight:1.7}}>
              No setup fees or hidden charges. Ad spend goes entirely toward impressions. Pause or cancel anytime from your dashboard.
            </p>
          </div>

          <button onClick={()=>budget!==null&&setStep(2)} style={{width:"100%",padding:"14px",borderRadius:12,
            border:"none",background:budget!==null?O:BDR,color:"#fff",fontSize:14,fontWeight:800,
            cursor:budget!==null?"pointer":"default",fontFamily:"inherit",
            boxShadow:budget!==null?"0 4px 16px rgba(255,107,53,0.35)":"none"}}>
            Continue →
          </button>
        </>}

        {/* STEP 2 — Ad creative */}
        {step===2 && !launched && (()=>{
          const CTA_PRESETS = ["Book now","Order online","Get directions","Call us","See menu","Learn more"];
          return <>
            <div style={{fontSize:14,fontWeight:800,color:N,textTransform:"uppercase",
              letterSpacing:"0.06em",marginBottom:12}}>Build your ad</div>

            {/* Live preview card */}
            <div style={{background:BG2,border:`1.5px solid ${O}`,borderRadius:16,
              padding:"14px 16px",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:11,fontWeight:800,color:N}}>{DEMO_BIZ.name}</span>
                <span style={{fontSize:9,fontWeight:700,color:MUT,background:BG3,borderRadius:6,padding:"2px 8px"}}>Sponsored</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                {/* Image / upload tap target */}
                <label style={{width:44,height:44,borderRadius:12,flexShrink:0,cursor:"pointer",
                  overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",
                  background:adImage?"transparent":O,border:adImage?"none":`2px dashed rgba(255,255,255,0.4)`}}>
                  {adImage
                    ? <img src={adImage} alt="ad" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  }
                  <input type="file" accept="image/*" style={{display:"none"}}
                    onChange={e=>{
                      const f=e.target.files[0];
                      if(f){const r=new FileReader();r.onload=ev=>setAdImage(ev.target.result);r.readAsDataURL(f);}
                    }}/>
                </label>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:800,color:N,
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {adForm.headline||<span style={{color:MUT}}>Your headline here</span>}
                  </div>
                  <div style={{fontSize:11,color:MUT,
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {adForm.tagline||"Your tagline appears here"}
                  </div>
                </div>
                <div style={{padding:"6px 10px",borderRadius:8,background:O,
                  color:"#fff",fontSize:10,fontWeight:800,flexShrink:0,maxWidth:80,
                  whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textAlign:"center"}}>
                  {adForm.cta||"Book now"}
                </div>
              </div>
            </div>
            <div style={{fontSize:11,color:MUT,marginBottom:14,paddingLeft:2}}>
              Tap the image box to upload a photo — logo, product, or location.
            </div>

            <div style={{background:BG2,border:`1.5px solid ${BDR}`,borderRadius:16,
              padding:"16px",marginBottom:14,display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
                  <span style={{fontSize:11,fontWeight:800,color:N,textTransform:"uppercase",letterSpacing:"0.06em"}}>Headline <span style={{color:"#ef4444"}}>*</span></span>
                  <span style={{fontSize:11,color:MUT}}>{adForm.headline.length}/40</span>
                </div>
                <input placeholder="e.g. Best Italian in McKinney" value={adForm.headline}
                  onChange={set("headline")} style={inp} maxLength={40}/>
                <div style={{fontSize:11,color:MUT,marginTop:5}}>First thing customers read — make it specific and local.</div>
              </div>
              <div style={{height:1,background:BDR}}/>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
                  <span style={{fontSize:11,fontWeight:800,color:N,textTransform:"uppercase",letterSpacing:"0.06em"}}>Tagline</span>
                  <span style={{fontSize:11,color:MUT}}>{adForm.tagline.length}/60</span>
                </div>
                <input placeholder="e.g. Authentic recipes since 1987 · Dine-in & takeout" value={adForm.tagline}
                  onChange={set("tagline")} style={inp} maxLength={60}/>
                <div style={{fontSize:11,color:MUT,marginTop:5}}>Hook, offer, or differentiator. Emojis welcome.</div>
              </div>
              <div style={{height:1,background:BDR}}/>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:N,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Call to action <span style={{color:"#ef4444"}}>*</span></div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                  {CTA_PRESETS.map(cta=>(
                    <button key={cta} onClick={()=>{setAdForm(f=>({...f,cta}));setCustomCta(false);}}
                      style={{padding:"6px 12px",borderRadius:8,cursor:"pointer",fontFamily:"inherit",
                        border:`1.5px solid ${!customCta&&adForm.cta===cta?O:BDR}`,
                        background:!customCta&&adForm.cta===cta?O:"transparent",
                        color:!customCta&&adForm.cta===cta?"#fff":N,fontSize:11,fontWeight:700}}>{cta}</button>
                  ))}
                  <button onClick={()=>{setCustomCta(true);setAdForm(f=>({...f,cta:""}));}}
                    style={{padding:"6px 12px",borderRadius:8,cursor:"pointer",fontFamily:"inherit",
                      border:`1.5px solid ${customCta?O:BDR}`,
                      background:customCta?O:"transparent",
                      color:customCta?"#fff":N,fontSize:11,fontWeight:700}}>Custom…</button>
                </div>
                {customCta && (
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
                      <span style={{fontSize:11,fontWeight:800,color:N,textTransform:"uppercase",letterSpacing:"0.06em"}}>Custom text</span>
                      <span style={{fontSize:11,color:MUT}}>{adForm.cta.length}/20</span>
                    </div>
                    <input autoFocus placeholder="e.g. Claim offer, Reserve a table…" value={adForm.cta}
                      onChange={set("cta")} style={inp} maxLength={20}/>
                    <div style={{fontSize:11,color:MUT,marginTop:5}}>Max 20 characters. Keep it action-first.</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setStep(1)} style={{flex:1,padding:"12px",borderRadius:12,
                border:`1.5px solid ${BDR}`,background:"transparent",color:MUT,
                fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Back</button>
              <button onClick={()=>setStep(3)} style={{flex:2,padding:"12px",borderRadius:12,
                border:"none",background:O,color:"#fff",fontSize:13,fontWeight:800,
                cursor:"pointer",fontFamily:"inherit"}}>Continue →</button>
            </div>
          </>;
        })()}

        {/* STEP 3 — Add funds */}
        {step===3 && !launched && <>
          <div style={{fontSize:14,fontWeight:800,color:N,textTransform:"uppercase",
            letterSpacing:"0.06em",marginBottom:12}}>Add funds</div>

          {/* Order summary */}
          <div style={{background:BG2,border:`1.5px solid ${BDR}`,borderRadius:16,
            padding:"16px",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,color:MUT,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Order summary</div>
            {[["Plan",sel.label],["Estimated reach",`${sel.reach}/mo`],["CPM",sel.cpm]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",
                padding:"8px 0",borderBottom:`1px solid ${BDR}`}}>
                <span style={{fontSize:12,color:MUT}}>{k}</span>
                <span style={{fontSize:12,fontWeight:700,color:N}}>{v}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
              <span style={{fontSize:14,fontWeight:800,color:N}}>Total today</span>
              <span style={{fontSize:16,fontWeight:900,color:O}}>${sel.amount}<span style={{fontSize:11,color:MUT,fontWeight:600}}>/mo</span></span>
            </div>
          </div>

          {/* Payment */}
          <div style={{background:BG2,border:`1.5px solid ${BDR}`,borderRadius:16,
            padding:"16px",marginBottom:14,display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontSize:11,fontWeight:800,color:MUT,textTransform:"uppercase",letterSpacing:"0.06em"}}>Payment</div>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:N,textTransform:"uppercase",
                letterSpacing:"0.06em",marginBottom:6}}>Card number</div>
              <input placeholder="1234 5678 9012 3456" value={card.num} maxLength={19}
                onChange={e=>setCard(c=>({...c,num:e.target.value}))} style={inp}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:800,color:N,textTransform:"uppercase",
                  letterSpacing:"0.06em",marginBottom:6}}>Expiry</div>
                <input placeholder="MM / YY" value={card.exp} maxLength={7}
                  onChange={e=>setCard(c=>({...c,exp:e.target.value}))} style={inp}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:800,color:N,textTransform:"uppercase",
                  letterSpacing:"0.06em",marginBottom:6}}>CVV</div>
                <input placeholder="•••" value={card.cvv} maxLength={4}
                  onChange={e=>setCard(c=>({...c,cvv:e.target.value}))} style={inp}/>
              </div>
            </div>
          </div>

          <div style={{display:"flex",gap:10,marginBottom:10}}>
            <button onClick={()=>setStep(2)} style={{flex:1,padding:"12px",borderRadius:12,
              border:`1.5px solid ${BDR}`,background:"transparent",color:MUT,
              fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Back</button>
            <button onClick={()=>setLaunched(true)} style={{flex:2,padding:"12px",borderRadius:12,
              border:"none",background:O,color:"#fff",fontSize:13,fontWeight:800,
              cursor:"pointer",fontFamily:"inherit",
              boxShadow:"0 4px 16px rgba(255,107,53,0.4)"}}>Launch campaign →</button>
          </div>
          <p style={{textAlign:"center",fontSize:10,color:MUT,margin:0}}>
            Secured by Stripe · Cancel anytime in your dashboard
          </p>
        </>}

        {/* SUCCESS */}
        {launched && (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{width:72,height:72,borderRadius:20,background:O,
              display:"flex",alignItems:"center",justifyContent:"center",
              margin:"0 auto 20px",boxShadow:"0 8px 24px rgba(255,107,53,0.3)"}}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{fontSize:22,fontWeight:900,color:N,marginBottom:8}}>Campaign live!</div>
            <p style={{fontSize:13,color:MUT,lineHeight:1.7,marginBottom:28}}>
              Your <strong style={{color:N}}>{sel.label}</strong> plan is active.<br/>You'll start seeing impressions within the hour.
            </p>
            <div style={{background:BG2,border:`1.5px solid ${BDR}`,borderRadius:16,
              padding:"16px",marginBottom:24,textAlign:"left"}}>
              {[["Plan",sel.label],["Monthly budget",`$${sel.amount}`],["Est. reach",`${sel.reach} views/mo`]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",
                  padding:"8px 0",borderBottom:`1px solid ${BDR}`}}>
                  <span style={{fontSize:12,color:MUT}}>{k}</span>
                  <span style={{fontSize:12,fontWeight:700,color:N}}>{v}</span>
                </div>
              ))}
            </div>
            <button onClick={onBack} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",
              background:O,color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
              Back to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// HOME
// ============================================================
function Home({ onSelect, onRate, isDark, toggleTheme, onDashboard, onAdvertise }) {
  const [search,setSearch]      = useState("");
  const [cat,setCat]            = useState("food");
  const [page,setPage]          = useState(0);
  const [loc,setLoc]            = useState(null);
  const [results,setResults]    = useState(DEMOS.food);
  const [searching,setSearching]= useState(false);
  const [showClaim,setShowClaim]= useState(false);
  const timer                   = useRef(null);
  const PAGE = 5;

  useEffect(()=>{
    navigator.geolocation?.getCurrentPosition(
      p=>setLoc({lat:p.coords.latitude,lng:p.coords.longitude}),
      ()=>setLoc({lat:33.2,lng:-96.6})
    );
  },[]);

  useEffect(()=>{
    clearTimeout(timer.current);
    timer.current = setTimeout(async()=>{
      if (!loc) return;
      setSearching(true);
      setPage(0);
      const q = search.trim()||BT[cat].label;
      const r = await gPlaces.search(q,loc.lat,loc.lng,cat);
      setResults(r);
      setSearching(false);
    },400);
  },[search,cat,loc]);

  const sponsoredActive = MOCK_AD.categories.includes(cat);
  const filtered = results.filter(b=>
    (!search||b.name.toLowerCase().includes(search.toLowerCase())) &&
    !(sponsoredActive && b.id===MOCK_AD.bizId)
  );
  const visible  = filtered.slice(page*PAGE,(page+1)*PAGE);
  const hasMore  = (page+1)*PAGE < filtered.length;
  const hasPrev  = page > 0;

  const changeCat = k => { setCat(k); setPage(0); setSearch(""); };

  return (
    <div style={{width:"100%"}}>
      {showClaim && <ClaimModal onClose={()=>setShowClaim(false)} onDashboard={()=>{setShowClaim(false);onDashboard();}}/>}
      {/* Navy header */}
      <div style={{background:BG,padding:"1.5rem 1rem 1.75rem",boxShadow:"0 4px 16px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <Logo light/>
          {/* Dark / Light toggle */}
          <div onClick={toggleTheme} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",flexShrink:0}}>
            <span style={{fontSize:11,fontWeight:700,color:MUT}}>{isDark?"Dark Mode":"Light Mode"}</span>
            <div style={{
              width:42,height:22,borderRadius:11,
              background:isDark?O:BDR,
              position:"relative",flexShrink:0,
              transition:"background 0.3s"
            }}>
              <div style={{
                position:"absolute",top:3,
                left:isDark?21:3,
                width:16,height:16,borderRadius:"50%",
                background:"#fff",
                boxShadow:"0 1px 3px rgba(0,0,0,0.3)",
                transition:"left 0.3s",
              }}/>
            </div>
          </div>
        </div>
        <p style={{fontSize:12,color:MUT,marginTop:5}}>
          Honest feedback for every business. Free. Always.
        </p>
        <div style={{position:"relative",marginTop:14}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",
            fontSize:14,pointerEvents:"none"}}>🔍</span>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}}
            placeholder="Search by name…"
            style={{width:"100%",borderRadius:14,padding:"11px 12px 11px 38px",
              fontSize:13,border:`1.5px solid ${BDR}`,background:BG2,
              color:N,fontFamily:"inherit",outline:"none"}}/>
          {searching&&<span style={{position:"absolute",right:12,top:"50%",
            transform:"translateY(-50%)",fontSize:11,color:MUT}}>
            searching…
          </span>}
        </div>
      </div>

      {/* Category pills */}
      <div style={{background:BG2,borderBottom:`1.5px solid ${BDR}`,padding:"10px 1rem",
        display:"flex",gap:6,overflowX:"auto",WebkitOverflowScrolling:"touch",
        msOverflowStyle:"none",scrollbarWidth:"none"}}>
        {TYPE_KEYS.map(k=>(
          <CatPill key={k} typeKey={k} selected={cat} onClick={()=>changeCat(k)}/>
        ))}
      </div>

      <div style={{padding:"1rem"}}>
        {/* Category header */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <IconBox type={cat} size={30}/>
          <div>
            <p style={{fontSize:12,fontWeight:700,color:N,textTransform:"uppercase",letterSpacing:"0.08em"}}>
              {BT[cat].label}
            </p>
            <p style={{fontSize:11,color:MUT}}>{filtered.length} nearby</p>
          </div>
        </div>

        {filtered.length===0&&!searching&&(
          <p style={{textAlign:"center",color:MUT,padding:"2rem 0",fontSize:14}}>
            No results in this category.
          </p>
        )}

        {/* Listings — sponsored card first */}
        {MOCK_AD.categories.includes(cat) && (
          <SponsoredCard ad={MOCK_AD} onSelect={onSelect}/>
        )}
        {visible.map(b=>(
          <BusinessCard key={b.id} b={b} onSelect={onSelect} onRate={onRate}/>
        ))}

        {/* Pagination */}
        {(hasPrev||hasMore)&&(
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {hasPrev&&(
              <button onClick={()=>setPage(p=>p-1)}
                style={{flex:1,padding:"10px",borderRadius:12,
                  border:`2px solid ${BDR}`,background:BG2,color:N,
                  fontSize:13,fontWeight:700,transition:"all 0.15s",fontFamily:"inherit"}}
                onMouseEnter={e=>{e.currentTarget.style.background=HOV;}}
                onMouseLeave={e=>{e.currentTarget.style.background=BG2;}}>
                ‹ Previous 5
              </button>
            )}
            {hasMore&&(
              <button onClick={()=>setPage(p=>p+1)}
                style={{flex:1,padding:"10px",borderRadius:12,
                  border:`2px solid ${O}`,background:O,color:"#fff",
                  fontSize:13,fontWeight:700,transition:"all 0.15s",fontFamily:"inherit"}}
                onMouseEnter={e=>{e.currentTarget.style.background=N;e.currentTarget.style.borderColor=N;}}
                onMouseLeave={e=>{e.currentTarget.style.background=O;e.currentTarget.style.borderColor=O;}}>
                Next 5 ›
              </button>
            )}
          </div>
        )}

        {/* CTAs */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {/* Own a business */}
          <div onClick={()=>setShowClaim(true)} style={{padding:"16px 18px",background:"transparent",
            border:`1.5px solid ${BDR}`,borderRadius:18,display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}>
            <div style={{width:46,height:46,borderRadius:13,
              background:O,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:800,color:N}}>Own a business?</div>
              <div style={{fontSize:11,color:MUT,marginTop:2}}>Free dashboard + AI training</div>
            </div>
            <button style={{padding:"8px 13px",borderRadius:10,border:"none",
              background:O,color:"#fff",fontSize:11,fontWeight:700,
              whiteSpace:"nowrap",fontFamily:"inherit",
              boxShadow:"0 2px 8px rgba(255,107,53,0.3)",cursor:"pointer"}} onClick={()=>setShowClaim(true)}>Claim for free →</button>
          </div>
          {/* Advertise */}
          <div onClick={()=>onAdvertise()} style={{padding:"16px 18px",background:O,
            border:"none",borderRadius:18,display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}>
            <div style={{width:46,height:46,borderRadius:13,
              background:BG,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="rgba(255,255,255,0.25)" stroke="#ffffff"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>Advertise on Trufilo</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.75)",marginTop:2}}>Reach local customers · No contracts</div>
            </div>
            <button style={{padding:"8px 13px",borderRadius:10,
              border:"none",background:BG,color:"#ffffff",
              fontSize:11,fontWeight:700,whiteSpace:"nowrap",fontFamily:"inherit",
              cursor:"pointer"}} onClick={e=>{e.stopPropagation();onAdvertise();}}>Learn more →</button>
          </div>
        </div>

        {/* Owner login link */}
        <div style={{textAlign:"center",marginTop:16,paddingBottom:8}}>
          <button onClick={onDashboard} style={{background:"none",border:"none",
            color:MUT,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
            textDecoration:"underline",textDecorationColor:BDR}}>
            Business owner? Access dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DONE SCREEN
// ============================================================
function DoneScreen({ business, reviewData, onReset }) {
  const [shareOpen,setShare] = useState(false);
  return (
    <div style={{maxWidth:480,margin:"0 auto",padding:"4rem 1.5rem",textAlign:"center"}}>
      {shareOpen&&<ShareCard business={business} scores={reviewData?.scores||{}} onClose={()=>setShare(false)}/>}
      <div style={{width:72,height:72,borderRadius:20,background:G,
        display:"flex",alignItems:"center",justifyContent:"center",
        margin:"0 auto 20px",boxShadow:"0 8px 24px rgba(255,107,53,0.3)"}}>
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
        </svg>
      </div>
      <div style={{fontSize:26,fontWeight:900,color:N,marginBottom:8,letterSpacing:"-0.5px"}}>
        trufilo approved!
      </div>
      <p style={{fontSize:14,color:MUT,lineHeight:1.8,marginBottom:32,textAlign:"center"}}>
        Your feedback is heading to {business?.name}.<br/>
        Honest reviews make every business better.
      </p>
      <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:300,margin:"0 auto"}}>
        <PrimaryBtn full onClick={()=>setShare(true)}>
          <span style={{display:"inline-flex",alignItems:"center",gap:8}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Share your review
          </span>
        </PrimaryBtn>
        <button onClick={onReset}
          style={{width:"100%",padding:"13px",borderRadius:14,
            border:`2px solid ${BDR}`,background:"transparent",color:N,
            fontSize:14,fontWeight:700,fontFamily:"inherit"}}>
          Rate another business
        </button>
      </div>
    </div>
  );
}

// ============================================================
// OWNER DASHBOARD
// ============================================================
const DEMO_BIZ = DEMOS.food[0]; // Osteria Romana as demo owner biz
const MOCK_AD = {
  bizId: DEMO_BIZ.id,
  bizName: DEMO_BIZ.name,
  bizType: DEMO_BIZ.type,
  bizEmoji: DEMO_BIZ.emoji,
  bizSubtype: DEMO_BIZ.subtype,
  bizRating: DEMO_BIZ.rating,
  bizPrice: DEMO_BIZ.price,
  bizOpen: DEMO_BIZ.open,
  bizHours: DEMO_BIZ.hours,
  headline: "Best Italian in McKinney",
  tagline: "Authentic recipes since 1987 · Dine-in & takeout 🍝",
  cta: "Book now",
  image: null,
  categories: ["food"],
};

const WEEKLY = [
  {day:"Mon",reviews:3,rating:4.2},{day:"Tue",reviews:5,rating:4.6},
  {day:"Wed",reviews:2,rating:3.8},{day:"Thu",reviews:7,rating:4.5},
  {day:"Fri",reviews:9,rating:4.7},{day:"Sat",reviews:11,rating:4.4},
  {day:"Sun",reviews:6,rating:4.3},
];
const maxR = Math.max(...WEEKLY.map(d=>d.reviews));

function OwnerDashboard({ onBack, onAdvertise }) {
  const [tab, setTab] = useState("overview");
  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [tab]);
  const [replyOpen, setReplyOpen] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState({});
  const [editOpen, setEditOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: DEMO_BIZ.name,
    address: DEMO_BIZ.addr,
    phone: "(972) 555-0123",
    website: "osteriaromana.com",
    hours: "Mon–Sat 11am–10pm · Sun 12pm–9pm",
    description: "Authentic Italian cuisine in the heart of McKinney. Family recipes since 1987.",
  });
  const [editForm, setEditForm] = useState({...profile});

  const allVals = DEMO_REVIEWS.flatMap(r=>Object.values(r.scores||{}).filter(Boolean));
  const overall = allVals.length ? allVals.reduce((a,b)=>a+b,0)/allVals.length : 0;
  const overallStars = (overall/2).toFixed(1);

  const bt = BT[DEMO_BIZ.type];
  const catAvgs = bt.core.map(cat=>{
    const vals = DEMO_REVIEWS.map(r=>r.scores?.[cat.id]).filter(Boolean);
    const avg = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
    return {...cat, avg, pct: Math.round((avg/10)*100)};
  });

  const sendReply = (id) => {
    if (!replyText.trim()) return;
    setReplies(r=>({...r,[id]:replyText.trim()}));
    setReplyText("");
    setReplyOpen(null);
  };

  const tabs = [
    {id:"overview", icon:<><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/></>, label:"Overview"},
    {id:"insights", icon:<><line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>, label:"AI Insights"},
    {id:"reviews",  icon:<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" fill="none"/></>, label:"Reviews"},
    {id:"profile",  icon:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/></>, label:"Profile"},
  ];

  return (
    <div style={{width:"100%",minHeight:"100vh",display:"flex",flexDirection:"column",overflowX:"hidden"}}>
      {/* Header */}
      <div style={{background:BG2,padding:"16px 16px 0",borderBottom:`1.5px solid ${BDR}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <button onClick={onBack} style={{background:"none",border:"none",color:MUT,
            cursor:"pointer",padding:"4px 0",fontFamily:"inherit",fontSize:12,fontWeight:700,
            display:"flex",alignItems:"center",gap:4}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <div style={{flex:1}}/>
          <div style={{width:8,height:8,borderRadius:"50%",background:"#e05535"}}/>
          <span style={{fontSize:11,color:"#e05535",fontWeight:700}}>Live</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <IconBox type={DEMO_BIZ.type} size={44} emoji={DEMO_BIZ.emoji}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:16,fontWeight:900,color:N,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{profile.name}</div>
            <div style={{fontSize:11,color:MUT,marginTop:2,display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
              <span>⭐ {DEMO_BIZ.rating}</span>
              <span>·</span>
              <span>{"$".repeat(DEMO_BIZ.price)}</span>
              <span>·</span>
              <span style={{color:DEMO_BIZ.open?"#16a34a":"#dc2626",fontWeight:700}}>{DEMO_BIZ.open?"Open":"Closed"}</span>
            </div>
            <div style={{fontSize:11,color:MUT,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{bt.label} · {profile.address}</div>
          </div>
        </div>
        {/* Tab bar */}
        <div style={{display:"flex",gap:0}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1,padding:"10px 0",background:"none",border:"none",
              borderBottom:`2.5px solid ${tab===t.id?O:"transparent"}`,
              color:tab===t.id?O:MUT,fontSize:9,fontWeight:700,cursor:"pointer",
              fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:4,
              textTransform:"uppercase",letterSpacing:"0.05em",transition:"all 0.15s"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">{t.icon}</svg>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",padding:"16px",boxSizing:"border-box",width:"100%"}}>

        {/* ── OVERVIEW ── */}
        {tab==="overview" && <>
          {/* Advertise CTA */}
          <button onClick={onAdvertise} style={{width:"100%",padding:"13px 16px",borderRadius:14,
            border:`1.5px solid ${O}`,background:"transparent",color:O,fontSize:14,fontWeight:800,
            cursor:"pointer",fontFamily:"inherit",marginBottom:14,
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            boxShadow:`0 0 12px rgba(255,107,53,0.3), inset 0 0 12px rgba(255,107,53,0.05)`}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 1 0 8"/><path d="M22 6a10 10 0 0 1 0 12"/><path d="M2 15V9a1 1 0 0 1 1-1h4l5-4v14l-5-4H3a1 1 0 0 1-1-1z"/></svg>
            Start Advertising
          </button>
          {/* KPI row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
            {[
              {label:"Rating",value:overallStars,sub:"out of 5"},
              {label:"Reviews",value:DEMO_REVIEWS.length,sub:"total"},
              {label:"This week",value:"+"+WEEKLY.reduce((a,d)=>a+d.reviews,0),sub:"new reviews"},
            ].map(k=>(
              <div key={k.label} style={{background:BG2,border:`1.5px solid ${BDR}`,
                borderRadius:16,padding:"14px 10px",textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:900,color:O,lineHeight:1}}>{k.value}</div>
                <div style={{fontSize:9,fontWeight:700,color:N,textTransform:"uppercase",
                  letterSpacing:"0.06em",marginTop:4}}>{k.label}</div>
                <div style={{fontSize:10,color:MUT,marginTop:2}}>{k.sub}</div>
              </div>
            ))}
          </div>


          {/* AI Insight */}
          <div style={{background:`linear-gradient(135deg,${O}22,${O}08)`,
            border:`1.5px solid ${O}44`,borderRadius:16,padding:"16px",marginBottom:16}}>
            {/* Header */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{width:28,height:28,borderRadius:8,background:O,
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/><circle cx="19" cy="5" r="3" fill="white" stroke="none"/></svg>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:800,color:N}}>AI Insights</div>
                <div style={{fontSize:10,color:MUT}}>Based on your last 30 days of reviews</div>
              </div>
              <div style={{marginLeft:"auto",fontSize:9,fontWeight:700,color:O,
                background:`${O}22`,padding:"2px 7px",borderRadius:10,flexShrink:0}}>NEW</div>
            </div>

            {/* Summary */}
            <p style={{fontSize:13,color:N,lineHeight:1.65,margin:"0 0 14px 0"}}>
              Customers love your <strong>atmosphere</strong> and <strong>food quality</strong>, but consistently mention <strong>wait times</strong> on Friday evenings. Your ratings spike when staff proactively checks in — and dip when tables feel ignored.
            </p>

            {/* Insight pills */}
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
              {[
                {icon:"⭐",label:"Top strength","value":"Atmosphere & ambiance","color":"#4ade80"},
                {icon:"⚡",label:"Top friction","value":"Wait times Fri 6–9 pm","color":"#f87171"},
                {icon:"💬",label:"Keyword spike","value":'"cozy" mentioned 11× this week',"color":"#60a5fa"},
                {icon:"📈",label:"Rating trend","value":"Up 0.2★ from last month","color":"#a78bfa"},
              ].map(({icon,label,value,color})=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:10,
                  background:BG2,borderRadius:10,padding:"9px 12px"}}>
                  <span style={{fontSize:15,flexShrink:0}}>{icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:9,fontWeight:700,color:MUT,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</div>
                    <div style={{fontSize:12,fontWeight:700,color:N}}>{value}</div>
                  </div>
                  <div style={{width:6,height:6,borderRadius:"50%",background:color,flexShrink:0}}/>
                </div>
              ))}
            </div>

            {/* Action callout */}
            <div style={{background:`${O}18`,borderRadius:10,padding:"10px 12px",
              borderLeft:`3px solid ${O}`}}>
              <div style={{fontSize:10,fontWeight:800,color:O,textTransform:"uppercase",
                letterSpacing:"0.06em",marginBottom:4}}>Recommended action</div>
              <p style={{fontSize:12,color:N,margin:0,lineHeight:1.6}}>
                Add 1–2 servers to Friday evening shifts and brief them on proactive table check-ins. Even one extra check-in per visit correlates with a <strong>+0.3★ rating lift</strong> based on your data.
              </p>
            </div>
          </div>

          {/* Recent reviews preview */}
          <div style={{fontSize:12,fontWeight:800,color:N,marginBottom:10}}>Recent reviews</div>
          {DEMO_REVIEWS.slice(0,2).map(r=>(
            <div key={r.id} style={{background:BG2,border:`1.5px solid ${BDR}`,
              borderRadius:14,padding:"12px 14px",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:O,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:11,fontWeight:800,color:"#fff",flexShrink:0}}>
                  {r.author?.[0]||"A"}
                </div>
                <span style={{fontSize:12,fontWeight:700,color:N}}>{r.author||"Anonymous"}</span>
                <PartialStars value={r.avg/2} size={10}/>
                <span style={{marginLeft:"auto",fontSize:10,color:MUT}}>{r.created_at?.slice(0,10)}</span>
              </div>
              {r.feedback&&<p style={{fontSize:12,color:MUT,margin:0,lineHeight:1.5}}>{r.feedback}</p>}
            </div>
          ))}
          <button onClick={()=>setTab("reviews")} style={{width:"100%",padding:"10px",
            borderRadius:12,border:`1.5px solid ${BDR}`,background:"transparent",
            color:O,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>
            View all reviews →
          </button>
        </>}

        {/* ── REVIEWS ── */}
        {tab==="reviews" && <>
          <div style={{fontSize:13,fontWeight:800,color:N,marginBottom:14}}>
            {DEMO_REVIEWS.length} reviews
          </div>
          {DEMO_REVIEWS.map(r=>(
            <div key={r.id} style={{background:BG2,border:`1.5px solid ${BDR}`,
              borderRadius:16,padding:"14px",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:O,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:13,fontWeight:800,color:"#fff",flexShrink:0}}>
                  {r.author?.[0]||"A"}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:N}}>{r.author||"Anonymous"}</div>
                  <div style={{fontSize:10,color:MUT}}>{r.created_at?.slice(0,10)}</div>
                </div>
                <PartialStars value={r.avg/2} size={12}/>
              </div>
              {r.feedback&&<p style={{fontSize:12,color:MUT,margin:"0 0 10px",lineHeight:1.5}}>{r.feedback}</p>}
              {replies[r.id] ? (
                <div style={{background:BG3,borderRadius:10,padding:"10px 12px",
                  borderLeft:`3px solid ${O}`}}>
                  <div style={{fontSize:10,fontWeight:700,color:O,marginBottom:4}}>Your reply</div>
                  <p style={{fontSize:12,color:N,margin:0,lineHeight:1.5}}>{replies[r.id]}</p>
                </div>
              ) : replyOpen===r.id ? (
                <div>
                  <textarea value={replyText} onChange={e=>setReplyText(e.target.value)}
                    placeholder="Write a reply…"
                    style={{width:"100%",padding:"10px 12px",borderRadius:10,
                      border:`1.5px solid ${BDR}`,background:BG3,color:N,
                      fontSize:12,fontFamily:"inherit",resize:"none",height:72,
                      outline:"none",boxSizing:"border-box"}}/>
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    <button onClick={()=>{setReplyOpen(null);setReplyText("");}}
                      style={{flex:1,padding:"8px",borderRadius:10,border:`1.5px solid ${BDR}`,
                        background:"transparent",color:MUT,fontSize:12,fontWeight:700,
                        cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                    <button onClick={()=>sendReply(r.id)}
                      style={{flex:2,padding:"8px",borderRadius:10,border:"none",
                        background:O,color:"#fff",fontSize:12,fontWeight:700,
                        cursor:"pointer",fontFamily:"inherit"}}>Post reply</button>
                  </div>
                </div>
              ) : (
                <button onClick={()=>{setReplyOpen(r.id);setReplyText("");}}
                  style={{padding:"6px 12px",borderRadius:8,border:`1.5px solid ${BDR}`,
                    background:"transparent",color:MUT,fontSize:11,fontWeight:700,
                    cursor:"pointer",fontFamily:"inherit"}}>Reply →</button>
              )}
            </div>
          ))}
        </>}

        {/* ── INSIGHTS ── */}
        {tab==="insights" && <>
          <div style={{background:`linear-gradient(135deg,${O}22,${O}08)`,
            border:`1.5px solid ${O}44`,borderRadius:16,padding:"16px",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:900,color:N,marginBottom:4}}>AI Recommendations</div>
            <div style={{fontSize:11,color:MUT,marginBottom:14}}>Powered by your review data · Updated weekly</div>

            {/* Operations */}
            <div style={{fontSize:10,fontWeight:800,color:O,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>Operations</div>
            {[
              {tip:"3 reviews mention cold food — check delivery times and plate heat-up procedures.",icon:"🌡️"},
              {tip:"Friday 6–9 pm is your busiest window. Staffing data suggests you're running 1–2 servers short.",icon:"⏱️"},
              {tip:"Respond to every review within 24 hrs — businesses that do see a 0.6★ average lift.",icon:"💬"},
            ].map((r,i)=>(
              <div key={i} style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start"}}>
                <span style={{fontSize:16,lineHeight:1,flexShrink:0,marginTop:1}}>{r.icon}</span>
                <p style={{fontSize:12,color:N,margin:0,lineHeight:1.55}}>{r.tip}</p>
              </div>
            ))}

            {/* Employee Training */}
            <div style={{fontSize:10,fontWeight:800,color:"#4ade80",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8,marginTop:6}}>Employee Training</div>
            {[
              {tip:"2 reviews this week describe staff as inattentive during busy periods. Run a 15-min daily huddle on table-check cadence.",icon:"👥"},
              {tip:"4 customers mentioned long waits without communication. Train front-of-house to provide a time estimate within 2 min of seating.",icon:"🗣️"},
              {tip:"'Friendly staff' appears in your top-rated reviews 78% of the time — reinforce greeting protocols in every pre-shift.",icon:"⭐"},
              {tip:"Kitchen ticket times spiked Friday night. Consider cross-training 1 line cook as expo to reduce bottlenecks.",icon:"🍳"},
            ].map((r,i)=>(
              <div key={i} style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start"}}>
                <span style={{fontSize:16,lineHeight:1,flexShrink:0,marginTop:1}}>{r.icon}</span>
                <p style={{fontSize:12,color:N,margin:0,lineHeight:1.55}}>{r.tip}</p>
              </div>
            ))}

            {/* Customer Experience */}
            <div style={{fontSize:10,fontWeight:800,color:"#60a5fa",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8,marginTop:6}}>Customer Experience</div>
            {[
              {tip:"Customers who mention 'atmosphere' rate 0.4★ higher on average — consider ambient lighting or music adjustments.",icon:"✨"},
              {tip:"'Parking' mentioned negatively 6× this month. Add a note to your listing about nearby lots.",icon:"🅿️"},
              {tip:"Dessert mentions correlate with 5★ reviews. Brief servers to suggest dessert proactively.",icon:"🍰"},
            ].map((r,i)=>(
              <div key={i} style={{display:"flex",gap:10,marginBottom:i===2?0:12,alignItems:"flex-start"}}>
                <span style={{fontSize:16,lineHeight:1,flexShrink:0,marginTop:1}}>{r.icon}</span>
                <p style={{fontSize:12,color:N,margin:0,lineHeight:1.55}}>{r.tip}</p>
              </div>
            ))}
          </div>

          <div style={{background:BG2,border:`1.5px solid ${BDR}`,borderRadius:16,
            padding:"16px",marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:800,color:N,marginBottom:14}}>Category breakdown</div>
            {catAvgs.map(cat=>(
              <div key={cat.id} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:12,fontWeight:700,color:N}}>{cat.label}</span>
                  <span style={{fontSize:12,fontWeight:800,color:O}}>{(cat.avg/2).toFixed(1)}</span>
                </div>
                <div style={{height:8,borderRadius:4,background:BG3,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:4,background:O,
                    width:`${cat.pct}%`,transition:"width 0.5s"}}/>
                </div>
              </div>
            ))}
          </div>

          <div style={{background:BG2,border:`1.5px solid ${BDR}`,borderRadius:16,
            padding:"16px",marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:800,color:N,marginBottom:12}}>Top mentions</div>
            {[["atmosphere","positive"],["food quality","positive"],["wait times","negative"],
              ["friendly staff","positive"],["pricing","neutral"]].map(([tag,sentiment])=>(
              <div key={tag} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"8px 0",borderBottom:`1px solid ${BDR}`}}>
                <span style={{fontSize:12,color:N,textTransform:"capitalize"}}>{tag}</span>
                <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:8,
                  background:sentiment==="positive"?"#dcfce7":sentiment==="negative"?"#fee2e2":"#fef9c3",
                  color:sentiment==="positive"?"#e05535":sentiment==="negative"?"#dc2626":"#ca8a04"}}>
                  {sentiment}
                </span>
              </div>
            ))}
          </div>
        </>}

        {/* ── PROFILE ── */}
        {tab==="profile" && <>
          <div style={{background:BG2,border:`1.5px solid ${BDR}`,borderRadius:16,
            padding:"16px",marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:800,color:N}}>Business info</div>
              <button onClick={()=>{setEditOpen(true);setEditForm({...profile});}}
                style={{padding:"6px 12px",borderRadius:8,border:`1.5px solid ${O}`,
                  background:"transparent",color:O,fontSize:11,fontWeight:700,
                  cursor:"pointer",fontFamily:"inherit"}}>Edit</button>
            </div>
            {[["Business","name"],["Address","address"],["Phone","phone"],
              ["Website","website"],["Hours","hours"],["About","description"]].map(([label,key])=>(
              <div key={key} style={{marginBottom:12}}>
                <div style={{fontSize:10,fontWeight:700,color:MUT,
                  textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{label}</div>
                <div style={{fontSize:13,color:N,lineHeight:1.5}}>{profile[key]}</div>
              </div>
            ))}
          </div>

          <div style={{background:BG2,border:`1.5px solid ${BDR}`,borderRadius:16,padding:"16px"}}>
            <div style={{fontSize:12,fontWeight:800,color:N,marginBottom:12}}>Account</div>
            {[["Plan","Free"],["Status","Verified"],["Member since","Jun 2025"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",
                padding:"10px 0",borderBottom:`1px solid ${BDR}`}}>
                <span style={{fontSize:12,color:MUT}}>{k}</span>
                <span style={{fontSize:12,fontWeight:700,color:N}}>{v}</span>
              </div>
            ))}
            <button onClick={onAdvertise} style={{width:"100%",marginTop:14,padding:"12px",borderRadius:12,
              border:`2px solid ${O}`,background:"transparent",color:O,fontSize:13,fontWeight:800,
              cursor:"pointer",fontFamily:"inherit"}}>🚀 Start Advertising on Trufilo</button>
          </div>
        </>}
      </div>

      {/* Edit profile modal */}
      {editOpen && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",
          display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000}}
          onClick={()=>setEditOpen(false)}>
          <div style={{width:"100%",maxWidth:430,background:BG,borderRadius:"24px 24px 0 0",
            padding:"28px 24px 40px",maxHeight:"85vh",overflowY:"auto"}}
            onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,borderRadius:2,background:BDR,margin:"0 auto 20px"}}/>
            <div style={{fontSize:18,fontWeight:900,color:N,marginBottom:20}}>Edit profile</div>
            {[["Business name","name","text"],["Address","address","text"],
              ["Phone","phone","tel"],["Website","website","text"],
              ["Hours","hours","text"],["About","description","text"]].map(([ph,k])=>(
              <div key={k} style={{marginBottom:12}}>
                <div style={{fontSize:10,fontWeight:700,color:MUT,
                  textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:5}}>{ph}</div>
                {k==="description"
                  ? <textarea value={editForm[k]} onChange={e=>setEditForm(f=>({...f,[k]:e.target.value}))}
                      style={{width:"100%",padding:"11px 14px",borderRadius:12,
                        border:`1.5px solid ${BDR}`,background:BG2,color:N,
                        fontSize:13,fontFamily:"inherit",resize:"none",height:80,
                        outline:"none",boxSizing:"border-box"}}/>
                  : <input type="text" value={editForm[k]} onChange={e=>setEditForm(f=>({...f,[k]:e.target.value}))}
                      style={{width:"100%",padding:"11px 14px",borderRadius:12,
                        border:`1.5px solid ${BDR}`,background:BG2,color:N,
                        fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
                }
              </div>
            ))}
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button onClick={()=>setEditOpen(false)}
                style={{flex:1,padding:"12px",borderRadius:12,border:`1.5px solid ${BDR}`,
                  background:"transparent",color:MUT,fontSize:13,fontWeight:700,
                  cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
              <button onClick={()=>{setProfile({...editForm});setEditOpen(false);}}
                style={{flex:2,padding:"12px",borderRadius:12,border:"none",
                  background:O,color:"#fff",fontSize:13,fontWeight:800,
                  cursor:"pointer",fontFamily:"inherit"}}>Save changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// APP ROOT
// ============================================================
export default function ServedApp() {
  const [view,setView]       = useState("home");
  const [business,setBiz]    = useState(null);
  const [reviewData,setReview] = useState(null);
  const [isDark,setIsDark]   = useState(true);

  useEffect(() => { applyTheme(DARK_VARS); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  const toggleTheme = useCallback(() => {
    setIsDark(d => {
      const next = !d;
      applyTheme(next ? DARK_VARS : LIGHT_VARS);
      return next;
    });
  }, []);

  const select  = b => { setBiz(b); setView("business"); };
  const rate    = b => { setBiz(b); setView("rate"); };
  const done   = d => { setReview(d); setView("done"); };
  const reset  = () => { setBiz(null); setReview(null); setView("home"); };

  return (
    <div style={{minHeight:"100vh",background:"#111",display:"flex",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:430,background:BG,minHeight:"100vh",color:N,position:"relative",borderRadius:24,overflow:"hidden"}}>
        {view==="home"      && <Home onSelect={select} onRate={rate} isDark={isDark} toggleTheme={toggleTheme} onDashboard={()=>setView("dashboard")} onAdvertise={()=>setView("advertise")}/>}
        {view==="business"  && <BusinessPage business={business} onBack={()=>setView("home")} onRate={()=>setView("rate")}/>}
        {view==="rate"      && <RateView business={business} onBack={()=>setView("business")} onDone={done}/>}
        {view==="done"      && <DoneScreen business={business} reviewData={reviewData} onReset={reset}/>}
        {view==="dashboard" && <OwnerDashboard onBack={()=>setView("home")} onAdvertise={()=>setView("advertise")}/>}
        {view==="advertise" && <AdvertisePage onBack={()=>setView("home")}/>}
      </div>
    </div>
  );
}
