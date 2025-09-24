// src/data/variantImageMap.js

// Mapping dasar tanpa ekstensi fix
const variantImageMap = {
  // BALINESE
  "LOVE OUD": "/images/balinese/love-oud.webp",
  "ROSE": "/images/balinese/rose.webp",
  "OCEAN D PARADIS": "/images/balinese/ocean-d-paradis.webp",
  "SUNSET FALVOR": "/images/balinese/sunset-flavor.webp",
  "LOVE FRANGIPANI": "/images/balinese/love-frangipani.webp",
  "OMBRE": "/images/balinese/ombre.webp",
  "CIGAR NOIR": "/images/balinese/cigar-noir.webp",
  "SENSO D BLOSSOM": "/images/balinese/senso-d-blossom.webp",
  "BROTHERHOOD STORY": "/images/balinese/brotherhood-story.webp",
  "SONG OF JOY": "/images/balinese/song-of-joy.webp",
  "AMBER VOUGERE": "/images/balinese/amber-vougere.webp",
  "AMETHYST": "/images/balinese/amethyst.webp",
  "GOLD FRANGIPANI": "/images/balinese/gold-frangipani.webp",
  "AEROS": "/images/balinese/aeros.webp",
  "BASIL BREEZE": "/images/balinese/basil-breeze.webp",
  "TONKA DUSK": "/images/balinese/tonka-dusk.webp",
  "ELYSIAN HAZE": "/images/balinese/elysian-haze.webp",
  "VELDRAN": "/images/balinese/veldran.webp",
  "LUNAREVE": "/images/balinese/lunareve.webp",
  "NUTTY WHISPER": "/images/balinese/nutty-whisper.webp",
  "CARTIVAGE": "/images/balinese/cartivage.webp",

  // EKSKLUSIF
  "GLORIOUS MOONLIGHT": "/images/eksklusif/glorious-moonlight.png",
  "L AME DE L OCEAN": "/images/eksklusif/l-ame-de-l-ocean.png",
  "SENSO DI BLOSSOM": "/images/eksklusif/senso-di-blossom.png",
  "SUNSET FALVOR (EX)": "/images/eksklusif/sunset-falvor.png",
  "TOBACCO NOIRE": "/images/eksklusif/tobacco-noire.webp",

  // CLASSIC
  "AMBER VOUGERE (CL)": "/images/classic/amber-vougere.png",
  "AMETHYST (CL)": "/images/classic/amethyst.png",
  "BROTHERHOOD STORY (CL)": "/images/classic/brotherhood-story.png",
  "HAPPINESS": "/images/classic/happiness.png",
  "OMBRE (CL)": "/images/classic/ombre.png",
  "ROSES": "images/classic/roses.png",
  "JASMINUM SAMBAC": "/images/classic/jasminum-sambac.png",
  "LOVE OUD (CL)": "/images/classic/love-oud.png",
  "MAGIC OF NATURE": "/images/classic/magic-of-nature.png",
  "MATCHER": "/images/classic/matcher.png",

  // SANJU
  "MEN PERFUME (RED)": "/images/sanju/men-red.png",
  "MEN PERFUME (WHITE)": "/images/sanju/men-white.png",
  "MEN PERFUME (YELLOW)": "/images/sanju/men-yellow.png",
  "SENCE AMETHYST": "/images/sanju/sence-amethyst.png",
  "SENCE HAPPY": "/images/sanju/sence-happy.png",
  "SENCE JOYFUL": "/images/sanju/sence-joyful.png",
  "SENCE LOVELY": "/images/sanju/sence-lovely.png",
  "SENCE ROMANCE": "/images/sanju/sence-romance.png",
  "SENCE SECRET": "/images/sanju/sence-secret.png",

  // BODY SPRAY
  "MEN BODY SPRAY (RED)": "/images/body-spray/men-red.png",
  "MEN BODY SPRAY (WHITE)": "/images/body-spray/men-white.png",
  "MEN BODY SPRAY (YELLOW)": "/images/body-spray/men-yellow.png",
  "SENCE BODY SPRAY HAPPY": "/images/body-spray/sence-happy.png",
  "SENCE BODY SPRAY JOYFUL": "/images/body-spray/sence-joyful.png",
  "SENCE BODY SPRAY LOVELY": "/images/body-spray/sence-lovely.png",
  "SENCE BODY SPRAY ROMANCE": "/images/body-spray/sence-romance.png",

  // DIFFUSER
  "DISFFUSER FLORAL SENSATION": "/images/diffuser/floral-sensation.png",
  "DISFFUSER WARM TOBACCO": "/images/diffuser/warm-tobacco.png",
  "DISFFUSER WOODY": "/images/diffuser/woody.png",
  "DISFFUSER WHITE": "/images/diffuser/white.png",
  "DISFFUSER BLUE": "/images/diffuser/blue.png",
  "DISFFUSER": "/images/diffuser/disffuser.png",
  "DISFFUSER MIX BERRIES": "/images/diffuser/mix-berries.webp",
  "DISFFUSER BLOOMING": "/images/diffuser/blooming.webp",
  "DISFFUSER WARM TOBBACO NEW": "/images/diffuser/warm-tobbaco-new.webp",

  // HAIR CARE
  "HAIR CREAM (BLACK)": "/images/hair-care/black.png",
  "HAIR CREAM (WHITE)": "/images/hair-care/white.png",
  "SUPER HARD GEL (PURPLE)": "/images/hair-care/purple.png",
  "SUPER HARD GEL (GREEN FIX)": "/images/hair-care/green.png",
  "SUPER HARD GEL (BLUE)": "/images/hair-care/blue.png",

  // OCCASION
  "AMBER VOUGERE": "/images/occasion/amber-vougere.webp",
  "HAPPINES": "/images/occasion/happines.webp",
  "AMETHYST": "/images/occasion/amethyst.webp",
  "STORMCAHSER": "/images/occasion/stormchaser.webp",
  "POETIC SUEDE": "/images/occasion/poetic-suede.webp",

};

// Fungsi helper untuk ambil file dengan fallback ekstensi
const getImagePath = (variant) => {
  const basePath = variantImageMap[variant];
  if (!basePath) return "/images/no-image.png"; // default kalau gak ada

  // Coba beberapa ekstensi umum
  const extensions = [".jpg", ".png", ".webp", ".jpeg"];
  return extensions.map((ext) => `/images/${basePath}${ext}`);
};

export { variantImageMap, getImagePath };
