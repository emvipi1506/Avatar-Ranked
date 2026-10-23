// ===== STYLE GROUPS PER MASTER PROMPT SECTION V =====
// Cấu hình phân nhóm style theo các tiêu chí Độc lạ & Sáng tạo, Hài hước, Giá trị (Thẩm mỹ & Flex)

export interface StyleSubgroup {
  id: string;
  name: string;
  description: string;
  styleIds: string[];
}

export const STYLE_GROUPS = {
  uniqueness: {
    title: "Độc lạ và sáng tạo",
    subgroups: [
      {
        id: "futuristic_digital",
        name: "Futuristic và kỹ thuật số",
        description: "Công nghệ cao, neon, cyberpunk, vũ trụ, pixel và thẩm mỹ kỹ thuật số.",
        styleIds: [
          "cyberpunk", "cybercore", "cyber-y2k", "cyber-y3k", "y3k", "techwear", "futuristic", "sci-fi",
          "steampunk", "mecha", "robot", "alien", "digitalcore", "glitchcore", "webcore", "internetcore",
          "vaporwave", "synthwave", "retrowave", "frutiger-aero", "frutiger-metro", "spacecore", "galaxycore",
          "cosmic", "industrial", "neon", "glowcore", "r6core"
        ]
      },
      {
        id: "surreal_distinct",
        name: "Concept siêu thực và dị biệt",
        description: "Thẩm mỹ kỳ lạ, phi thực tế, quái vật, kinh dị và thế giới hư ảo.",
        styleIds: [
          "weirdcore", "dreamcore", "dreamycore", "clowncore", "circuscore", "circus-goth", "morute", "maximalist",
          "glitchcore", "digitalcore", "monster", "dark-fantasy", "horror", "cute-gore", "gore", "alien",
          "cosmic", "mythical", "dollcore", "toycore", "plushcore", "retroslop"
        ]
      },
      {
        id: "artistic_fashion",
        name: "Thời trang nghệ thuật",
        description: "Thời trang đường phố Nhật Bản, alternative, ma mị, thần thoại và cosplay.",
        styleIds: [
          "decora", "harajuku", "visual-kei", "scene", "scenecore", "punk", "alt", "gyaru", "jojifuku",
          "kawaii", "kidcore", "fairycore", "naturecore", "mushroomcore", "animalcore", "cybergoth", "pastel-goth",
          "whimsygoth", "boho", "indie", "acubi", "y2k", "mcbling", "blokette", "balletcore", "ethereal",
          "celestial", "royalcore", "rococo", "lolita-fashion", "fantasy", "cosplay", "anime", "manga",
          "chibi", "magical-girl", "mermaidcore", "samuraicore"
        ]
      },
      {
        id: "body_concept_variation",
        name: "Biến tấu hình thể và concept cá nhân",
        description: "Dáng vóc đặc thù, hoài niệm Roblox các thời kỳ và dấu ấn người chơi.",
        styleIds: [
          "blocky", "neoclassic", "slender", "cnp", "furry", "neko", "catboy", "femboy", "headless",
          "korblox", "avatar-flex", "guestcore", "baconcore", "retro", "vintage", "heisei-retro", "old-roblox",
          "2017-style", "2018-style", "2020-style", "2021-style", "2022-style", "2023-style", "2024-style", "2025-style", "2026-style"
        ]
      }
    ]
  },
  humor: {
    title: "Hài hước và Meme",
    subgroups: [
      {
        id: "meme_troll",
        name: "Meme và troll",
        description: "Biểu tượng meme mạng, noob cổ điển, trollface và tạo hình châm biếm.",
        styleIds: [
          "classic-noob", "modern-noob", "bacon-hair", "guest", "troll", "meme", "silly-goober",
          "mlg", "goofy", "funny-avatar", "scam-bot", "guestcore", "baconcore", "classic", "old-roblox"
        ]
      },
      {
        id: "visual_comedy",
        name: "Hài hước nhờ ngoại hình",
        description: "Tạo hình dị thường, parody phong cách thị phi, chú hề và quái vật ngộ nghĩnh.",
        styleIds: [
          "od-er", "cnp", "slender", "retroslop", "maximalist", "clowncore", "circuscore", "clown",
          "toycore", "plushcore", "monster", "zombie", "funny-avatar", "goofy", "silly-goober"
        ]
      },
      {
        id: "contrast_parody",
        name: "Hài hước nhờ sự tương phản",
        description: "Parody người giàu, siêu anh hùng, quân đội, flex hài hước hoặc biến tấu gây cười.",
        styleIds: [
          "rich", "luxury", "hypebeast", "headless-flex", "korblox-flex", "limited-flex", "avatar-flex",
          "preppy", "baddie", "barbie", "royal", "princess", "prince", "superhero", "supervillain",
          "military", "swat", "knight", "samurai", "pirate", "cowboy", "nerd", "geek", "gamer",
          "e-kid", "e-girl", "e-boy"
        ]
      }
    ]
  },
  value: {
    title: "Giá trị (Aesthetic Value & Verified Robux)",
    subgroups: [
      {
        id: "luxury_elegance",
        name: "Sang trọng và tinh tế",
        description: "Thẩm mỹ cao cấp, quiet luxury, học thuật cổ điển và đường nét gọn gàng.",
        styleIds: [
          "old-money", "luxury", "rich", "chic", "clean-girl", "clean-boy", "minimalist", "academia",
          "dark-academia", "light-academia", "royal-academia", "light-academia-vintage", "dark-vintage",
          "classic", "vintage", "korean-streetwear", "japanese-streetwear", "acubi", "model", "male-model",
          "glam", "night-luxe", "celebrity"
        ]
      },
      {
        id: "elaborate_detail",
        name: "Cầu kỳ và giàu chi tiết",
        description: "Nhiều phụ kiện xếp tầng, trang phục cổ trang, thần thoại và gothic tinh xảo.",
        styleIds: [
          "gothic-romance", "trad-goth", "pastel-goth", "cybergoth", "dark-coquette", "coquette", "dollette",
          "lolita-fashion", "rococo", "royalcore", "fairycore", "angelcore", "heavenly", "ethereal",
          "celestial", "fantasy", "dark-fantasy", "greek-mythology", "egyptian", "viking", "samurai",
          "knight", "medieval", "steampunk", "visual-kei", "gyaru", "decora", "harajuku", "cyberpunk",
          "techwear", "y3k"
        ]
      },
      {
        id: "collectible_flex",
        name: "Giá trị sưu tầm và thể hiện item",
        description: "Trang phục khoe vật phẩm hiếm, Korblox, Headless, Limited và combo đắt đỏ.",
        styleIds: [
          "headless", "korblox", "korblox-flex", "headless-flex", "limited-flex", "avatar-flex",
          "hypebeast", "luxury", "rich", "streetwear", "y2k", "slender", "cnp", "dahoodian",
          "rogangster", "bloxburg", "berry-avenue"
        ]
      },
      {
        id: "practical_fashion",
        name: "Phối đồ đẹp và dễ ứng dụng",
        description: "Thời trang đời thường hài hòa, streetwear, năng động và phong cách âm nhạc.",
        styleIds: [
          "streetwear", "streetwear-y2k", "casual", "sporty", "athletic", "skater", "grunge-skater",
          "indie", "softie", "soft-boy", "soft-girl", "preppy", "baddie", "barbie", "clean-girl",
          "clean-boy", "chic", "minimalist", "vsco", "boho", "hippie", "country", "schoolcore",
          "cafe-worker", "bloxburg-mom", "balletcore", "k-pop", "j-pop", "pop-star", "rockstar",
          "hip-hop", "rapper"
        ]
      }
    ]
  }
};
