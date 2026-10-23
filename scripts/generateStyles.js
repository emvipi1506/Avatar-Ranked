// Scratch generator to assemble src/lib/data/avatarStyles.ts and src/lib/data/styleGroups.ts
import fs from "fs";
import path from "path";

const stylesRaw = [
  // Nhóm A (1-10)
  { num: 1, id: "classic", name: "Classic", category: "group_a", desc: "Phong cách Roblox đời đầu, avatar đơn giản, hình khối vuông, trang phục cơ bản và phụ kiện truyền thống.", kw: ["classic", "vintage roblox", "06", "2006", "2007", "2008", "retro roblox", "studs"] },
  { num: 2, id: "classic-noob", name: "Classic Noob", category: "group_a", desc: "Avatar noob kinh điển với đầu vàng, thân xanh dương, tay chân vàng hoặc xanh lá tùy phiên bản.", kw: ["noob", "classic noob", "yellow head", "blue torso", "green legs", "default noob"] },
  { num: 3, id: "modern-noob", name: "Modern Noob", category: "group_a", desc: "Biến tấu noob cổ điển bằng item và phụ kiện hiện đại.", kw: ["modern noob", "noob outfit", "noob hoodie", "noob suit", "cute noob"] },
  { num: 4, id: "bacon-hair", name: "Bacon Hair", category: "group_a", desc: "Nhận diện bằng mái tóc nâu giống các dải bacon; thường gắn với hình tượng người chơi mới.", kw: ["bacon", "bacon hair", "pal hair", "starter hair", "bacon outfit"] },
  { num: 5, id: "guest", name: "Guest", category: "group_a", desc: "Mô phỏng avatar Guest thời Roblox còn tính năng khách.", kw: ["guest", "guest 666", "guest cap", "roblox guest"] },
  { num: 6, id: "blocky", name: "Blocky", category: "group_a", desc: "Cơ thể vuông vức, tay chân khối hộp, tạo cảm giác cổ điển hoặc mạnh mẽ.", kw: ["blocky", "square", "box", "cube", "block body", "lego body"] },
  { num: 7, id: "r6core", name: "R6core", category: "group_a", desc: "Sử dụng hình thể R6 với sáu bộ phận cơ thể cơ bản.", kw: ["r6", "r6core", "six parts", "classic limbs", "nostalgia r6"] },
  { num: 8, id: "neoclassic", name: "NeoClassic", category: "group_a", desc: "Kết hợp phong cách cổ điển với item hiện đại.", kw: ["neoclassic", "neo classic", "modern classic", "retro modern"] },
  { num: 9, id: "slender", name: "Slender", category: "group_a", desc: "Avatar dáng cao, mảnh, chân dài; thường dùng đồ tối màu, tóc thời trang và phụ kiện cá tính.", kw: ["slender", "stitch face", "tall avatar", "slender hair", "black messy hair", "edgy slender"] },
  { num: 10, id: "cnp", name: "Copy and Paste (CNP)", category: "group_a", desc: "Combo thời trang phổ biến trong cộng đồng Roblox, thường có tóc layer và streetwear hoặc emo.", kw: ["cnp", "copy and paste", "c&p", "layered hair", "valk", "choker cnp"] },

  // Nhóm B (11-50)
  { num: 11, id: "cool-kid", name: "Cool Kid", category: "group_b", desc: "Vẻ ngoài trẻ trung, ngầu, kính, tóc nổi bật và streetwear.", kw: ["cool kid", "cool", "shades", "skateboarder", "stylish kid"] },
  { num: 12, id: "the-2-0s", name: "The 2.0s", category: "group_b", desc: "Sử dụng thân hình hoặc gói cơ thể kiểu 2.0.", kw: ["2.0", "roblox 2.0", "package 2.0", "torso 2.0"] },
  { num: 13, id: "dahoodian", name: "Dahoodian", category: "group_b", desc: "Phong cách gắn với Da Hood, đồ đường phố, đồ thể thao và phụ kiện cá tính.", kw: ["dahood", "da hood", "dahoodian", "dh fit", "flame", "bandana"] },
  { num: 14, id: "rogangster", name: "Rogangster", category: "group_b", desc: "Hình tượng gangster trong Roblox, streetwear và phụ kiện nổi bật.", kw: ["rogangster", "gangster", "gang", "hoodie gang", "tatted"] },
  { num: 15, id: "robanger", name: "Robanger", category: "group_b", desc: "Tên gọi ít phổ biến, chưa có định nghĩa thống nhất; cần bằng chứng cụ thể.", kw: ["robanger", "banger fit"] },
  { num: 16, id: "retroslop", name: "Retroslop", category: "group_b", desc: "Phong cách retro mang tính châm biếm các combo hoài cổ rập khuôn.", kw: ["retroslop", "nostalgia bait", "fake retro", "overused retro"] },
  { num: 17, id: "emo", name: "Emo", category: "group_b", desc: "Tông đen, tóc mái, dây xích và phụ kiện tâm trạng.", kw: ["emo", "sad", "depressed", "chains", "dark hair", "emo boy", "emo girl"] },
  { num: 18, id: "goth", name: "Goth", category: "group_b", desc: "Thời trang tối màu, ren, da, trang sức bạc và hình tượng Gothic.", kw: ["goth", "gothic", "corse", "fishnet", "spikes", "dark makeup"] },
  { num: 19, id: "scene", name: "Scene", category: "group_b", desc: "Tóc nhiều lớp, màu nổi, họa tiết tương phản và nét emo.", kw: ["scene", "scene hair", "neon emo", "rawr", "gir", "invader zim"] },
  { num: 20, id: "scenecore", name: "Scenecore", category: "group_b", desc: "Scene hiện đại với màu rực, họa tiết hỗn hợp và phụ kiện internet.", kw: ["scenecore", "rainbow scene", "scene kid", "kandi"] },
  { num: 21, id: "grunge", name: "Grunge", category: "group_b", desc: "Áo rộng, flannel, quần rách, màu bạc và vẻ ngoài không quá chỉn chu.", kw: ["grunge", "flannel", "ripped", "nirvana", "faded", "vintage grunge"] },
  { num: 22, id: "punk", name: "Punk", category: "group_b", desc: "Da, đinh tán, dây xích và họa tiết nổi loạn.", kw: ["punk", "mohawk", "leather jacket", "studs", "punk rock", "anarchy"] },
  { num: 23, id: "alt", name: "Alt", category: "group_b", desc: "Alternative, có thể pha emo, goth, punk hoặc grunge.", kw: ["alt", "alternative", "alt fashion", "indie alt", "rebel"] },
  { num: 24, id: "dark-y2k", name: "Dark Y2K", category: "group_b", desc: "Thời trang đầu những năm 2000, tông đen, kính nhỏ và phụ kiện kim loại.", kw: ["dark y2k", "black 2000s", "silver chrome", "cyber grunge y2k"] },
  { num: 25, id: "y2k", name: "Y2K", category: "group_b", desc: "Thời trang cuối thập niên 1990 và đầu 2000, kính màu, đồ bóng, quần rộng và phụ kiện vui nhộn.", kw: ["y2k", "2000s", "low rise", "baggy", "metallic", "glossy", "rhinestone"] },
  { num: 26, id: "mcbling", name: "McBling", category: "group_b", desc: "Hào nhoáng giữa những năm 2000, màu hồng, kim tuyến, logo và phụ kiện lấp lánh.", kw: ["mcbling", "juicy", "sparkle", "glitter pink", "bling", "diamante"] },
  { num: 27, id: "indie", name: "Indie", category: "group_b", desc: "Thể hiện cá tính riêng, vintage, màu đất và layer không theo khuôn mẫu.", kw: ["indie", "indie kid", "oversized sweater", "earth tone", "thrifted"] },
  { num: 28, id: "softie", name: "Softie", category: "group_b", desc: "Pastel, quần áo mềm mại, tóc dễ thương và phụ kiện nhỏ.", kw: ["softie", "soft", "pastel soft", "cute beret", "fluffy"] },
  { num: 29, id: "soft-girl", name: "Soft Girl", category: "group_b", desc: "Nữ tính, pastel, má hồng, váy và phụ kiện dễ thương.", kw: ["soft girl", "blush", "pastel skirt", "butterfly clip", "cute girl"] },
  { num: 30, id: "soft-boy", name: "Soft Boy", category: "group_b", desc: "Áo len, cardigan, quần rộng, màu trung tính hoặc pastel và tóc mềm.", kw: ["soft boy", "cardigan", "vintage knit", "messy curls", "soft sweater"] },
  { num: 31, id: "e-girl", name: "E-Girl", category: "group_b", desc: "Tóc nhuộm hoặc layer, eyeliner, sọc đen trắng và phụ kiện nổi bật.", kw: ["egirl", "e-girl", "striped long sleeve", "heart cheeks", "winged liner"] },
  { num: 32, id: "e-boy", name: "E-Boy", category: "group_b", desc: "Tóc rẽ giữa, áo sọc, dây chuyền, màu tối và emo pha streetwear.", kw: ["eboy", "e-boy", "curtains hair", "padlock necklace", "middle part"] },
  { num: 33, id: "preppy", name: "Preppy", category: "group_b", desc: "Trang phục học đường gọn gàng, polo, váy xếp ly, cardigan hoặc đồ thể thao.", kw: ["preppy", "polo", "pleated skirt", "tennis", "argyle", "country club"] },
  { num: 34, id: "baddie", name: "Baddie", category: "group_b", desc: "Vẻ ngoài sắc sảo, outfit ôm dáng và phụ kiện thời trang.", kw: ["baddie", "acrylic nails", "corset", "tight fit", "hoop earrings", "glam baddie"] },
  { num: 35, id: "barbie", name: "Barbie", category: "group_b", desc: "Cảm hứng búp bê Barbie, màu hồng và vẻ ngoài bóng bẩy.", kw: ["barbie", "barbiecore", "hot pink", "doll fashion", "blonde barbie"] },
  { num: 36, id: "coquette", name: "Coquette", category: "group_b", desc: "Nơ, ren, ruy băng, ngọc trai và màu pastel.", kw: ["coquette", "bow", "lace", "ribbon", "pearl", "dollette bow", "pink bow"] },
  { num: 37, id: "dollette", name: "Dollette", category: "group_b", desc: "Phong cách búp bê với váy bèo, ren và nơ.", kw: ["dollette", "doll dress", "ruffle", "porcelain doll"] },
  { num: 38, id: "kawaii", name: "Kawaii", category: "group_b", desc: "Dễ thương kiểu Nhật Bản, pastel, gương mặt đáng yêu và phụ kiện hình thú.", kw: ["kawaii", "cute japanese", "sanrio", "pastel pink", "kitty ears", "plushie"] },
  { num: 39, id: "gyaru", name: "Gyaru", category: "group_b", desc: "Thời trang Nhật nổi bật, tóc sáng, makeup đậm, móng và phụ kiện cầu kỳ.", kw: ["gyaru", "kogal", "ganguro", "loose socks", "tanned", "blonde hair clips"] },
  { num: 40, id: "decora", name: "Decora", category: "group_b", desc: "Harajuku nhiều màu, nhiều kẹp tóc, vòng tay và phụ kiện xếp lớp.", kw: ["decora", "decora kei", "many hair clips", "rainbow clips", "harajuku layered"] },
  { num: 41, id: "kidcore", name: "Kidcore", category: "group_b", desc: "Màu sắc đồ chơi trẻ em, cầu vồng và họa tiết vui nhộn.", kw: ["kidcore", "rainbow", "crayons", "lego", "nostalgic toys", "colorful beads"] },
  { num: 42, id: "cottagecore", name: "Cottagecore", category: "group_b", desc: "Váy hoa, giỏ, màu đất và cảm hứng nông thôn.", kw: ["cottagecore", "floral", "meadow", "straw hat", "apron", "vintage farm"] },
  { num: 43, id: "fairycore", name: "Fairycore", category: "group_b", desc: "Cánh tiên, hoa, lá và trang phục huyền ảo.", kw: ["fairycore", "fairy wings", "glimmer", "nature fairy", "ethereal wings"] },
  { num: 44, id: "weirdcore", name: "Weirdcore", category: "group_b", desc: "Hình ảnh kỳ lạ, siêu thực và cảm giác khó hiểu.", kw: ["weirdcore", "eyeball", "surreal", "unsettling", "dream void"] },
  { num: 45, id: "dreamcore", name: "Dreamcore", category: "group_b", desc: "Không gian như trong mơ, hoài niệm hoặc hơi bất an.", kw: ["dreamcore", "cloud", "liminal", "dreamy nostalgic", "floating"] },
  { num: 46, id: "clowncore", name: "Clowncore", category: "group_b", desc: "Trang phục chú hề, màu tương phản và họa tiết xiếc.", kw: ["clowncore", "clown nose", "circus", "jester", "polka dot", "ruffled collar"] },
  { num: 47, id: "morute", name: "Morute", category: "group_b", desc: "Dễ thương pha mong manh, u tối và mơ màng.", kw: ["morute", "fragile cute", "dark dreamy", "melancholy cute"] },
  { num: 48, id: "maximalist", name: "Maximalist", category: "group_b", desc: "Nhiều màu sắc, họa tiết, lớp trang phục và phụ kiện có chủ đích.", kw: ["maximalist", "layered accessories", "many items", "complex fit", "busy outfit"] },
  { num: 49, id: "hypebeast", name: "Hypebeast", category: "group_b", desc: "Sneaker, logo, thương hiệu streetwear và item theo xu hướng.", kw: ["hypebeast", "supreme", "bape", "off-white", "jordan", "designer flex"] },
  { num: 50, id: "streetwear", name: "Streetwear", category: "group_b", desc: "Áo graphic, hoodie, quần rộng, sneaker, mũ và phụ kiện đường phố.", kw: ["streetwear", "hoodie", "cargo", "sneakers", "beanie", "baggy pants", "graphic tee"] },

  // Nhóm C (51-100)
  { num: 51, id: "streetwear-y2k", name: "Streetwear Y2K", category: "group_c", desc: "Streetwear đầu những năm 2000, quần baggy, áo graphic và kính nhỏ.", kw: ["streetwear y2k", "2000s baggy", "y2k hoodie", "chrome shades"] },
  { num: 52, id: "techwear", name: "Techwear", category: "group_c", desc: "Trang phục chức năng, nhiều túi, dây đai, khóa kéo và tông tối.", kw: ["techwear", "straps", "buckles", "tactical vest", "cargo straps", "black tech"] },
  { num: 53, id: "cyberpunk", name: "Cyberpunk", category: "group_c", desc: "Tương lai u tối, công nghệ cao, neon, mặt nạ và phụ kiện cơ khí.", kw: ["cyberpunk", "cyber", "neon visor", "cyborg", "prosthetic", "futuristic neon"] },
  { num: 54, id: "cybercore", name: "Cybercore", category: "group_c", desc: "Thẩm mỹ kỹ thuật số, neon, glitch và phụ kiện công nghệ.", kw: ["cybercore", "digital grid", "circuit", "hacker", "cybernetic"] },
  { num: 55, id: "futuristic", name: "Futuristic", category: "group_c", desc: "Thiết kế hướng tương lai, hình khối hiện đại và chất liệu bóng.", kw: ["futuristic", "future", "modernist", "sleek armor", "sci-fi suit"] },
  { num: 56, id: "sci-fi", name: "Sci-Fi", category: "group_c", desc: "Khoa học viễn tưởng, phi hành gia, người ngoài hành tinh hoặc chiến binh vũ trụ.", kw: ["scifi", "sci-fi", "astronaut", "spacesuit", "alien", "space marine"] },
  { num: 57, id: "steampunk", name: "Steampunk", category: "group_c", desc: "Máy móc hơi nước, bánh răng, đồng, da và thời trang Victoria.", kw: ["steampunk", "gears", "brass", "goggles", "clockwork", "victorian steam"] },
  { num: 58, id: "vaporwave", name: "Vaporwave", category: "group_c", desc: "Hồng tím, cyan, máy tính cổ và internet hoài cổ.", kw: ["vaporwave", "arizona", "greek statue", "windows 95", "pink cyan", "aesthetic 80s"] },
  { num: 59, id: "retro", name: "Retro", category: "group_c", desc: "Trang phục lấy cảm hứng từ thời kỳ quá khứ.", kw: ["retro", "70s", "80s", "90s", "retro stripes", "nostalgia"] },
  { num: 60, id: "vintage", name: "Vintage", category: "group_c", desc: "Đồ cổ hoặc mô phỏng thời trang những thập niên trước.", kw: ["vintage", "classic antique", "heritage", "retro jacket"] },
  { num: 61, id: "heisei-retro", name: "Heisei Retro", category: "group_c", desc: "Văn hóa đại chúng, công nghệ và thời trang Nhật Bản thời Heisei.", kw: ["heisei", "heisei retro", "japanese 90s", "flip phone", "early anime aesthetic"] },
  { num: 62, id: "acubi", name: "Acubi", category: "group_c", desc: "Tối giản kiểu Hàn Quốc, đen, xám, trắng, áo ôm và quần rộng.", kw: ["acubi", "korean minimal", "grey muted", "fitted top baggy bottom", "subtle tech"] },
  { num: 63, id: "korean-streetwear", name: "Korean Streetwear", category: "group_c", desc: "Streetwear Hàn Quốc, layer và phụ kiện tinh tế.", kw: ["korean streetwear", "k-style", "seoul fashion", "oversized blazer", "minimal street"] },
  { num: 64, id: "japanese-streetwear", name: "Japanese Streetwear", category: "group_c", desc: "Streetwear Nhật Bản, đồ rộng, vintage, họa tiết độc đáo và nhiều lớp.", kw: ["japanese streetwear", "tokyo street", "uramachi", "kimono jacket", "wide cargo"] },
  { num: 65, id: "harajuku", name: "Harajuku", category: "group_c", desc: "Thời trang đường phố Tokyo sáng tạo, màu sắc và khác biệt.", kw: ["harajuku", "takeshita", "colorful japanese", "avant garde tokyo"] },
  { num: 66, id: "mori-kei", name: "Mori Kei", category: "group_c", desc: "Cảm hứng người sống trong rừng, vải mềm, màu đất và nhiều lớp.", kw: ["mori kei", "forest girl", "layered linen", "earthy vintage", "shawl"] },
  { num: 67, id: "jojifuku", name: "Jojifuku", category: "group_c", desc: "Thuật ngữ không phổ biến, cần ngữ cảnh và bằng chứng cụ thể.", kw: ["jojifuku", "japanese schoolchild"] },
  { num: 68, id: "igari", name: "Igari", category: "group_c", desc: "Cảm hứng makeup Nhật, má hồng đặt cao và gương mặt đặc trưng.", kw: ["igari", "drunk blush", "japanese blush", "flushed makeup"] },
  { num: 69, id: "douyin", name: "Douyin", category: "group_c", desc: "Thẩm mỹ làm đẹp Douyin, mắt nổi bật, phụ kiện lấp lánh và vẻ ngoài trau chuốt.", kw: ["douyin", "douyin makeup", "sparkle eyes", "chinese aesthetic", "glam filter"] },
  { num: 70, id: "visual-kei", name: "Visual Kei (VKEI)", category: "group_c", desc: "Rock Nhật Bản, tóc tạo kiểu mạnh, makeup đậm và trang phục sân khấu.", kw: ["visual kei", "vkei", "j-rock", "spiky hair rock", "the gazette", "malice mizer"] },
  { num: 71, id: "lolita-fashion", name: "Lolita Fashion", category: "group_c", desc: "Váy phồng, ren, nơ và phụ kiện cầu kỳ kiểu Nhật.", kw: ["lolita", "sweet lolita", "gothic lolita", "petticoat", "frills dress", "headbow"] },
  { num: 72, id: "rococo", name: "Rococo", category: "group_c", desc: "Thời trang quý tộc châu Âu thế kỷ 18, trang phục và họa tiết cầu kỳ.", kw: ["rococo", "18th century", "marie antoinette", "powdered wig", "ornate corset"] },
  { num: 73, id: "royalcore", name: "Royalcore", category: "group_c", desc: "Hình tượng hoàng gia, vương miện, áo choàng và trang phục sang trọng.", kw: ["royalcore", "crown", "cape", "royal gown", "scepter", "ermine"] },
  { num: 74, id: "old-money", name: "Old Money", category: "group_c", desc: "Trang phục cổ điển, kín đáo, màu trung tính và vẻ sang trọng không phô trương.", kw: ["old money", "quiet luxury", "polo club", "tweed", "cashmere", "neutral elegance"] },
  { num: 75, id: "dark-academia", name: "Dark Academia", category: "group_c", desc: "Blazer, sơ mi, áo len, nâu và đen, cảm hứng học thuật cổ điển.", kw: ["dark academia", "blazer", "tweed coat", "plaid", "oxford shoes", "vintage scholar"] },
  { num: 76, id: "light-academia", name: "Light Academia", category: "group_c", desc: "Học thuật cổ điển với kem, be và trắng.", kw: ["light academia", "beige sweater", "cream blazer", "poetry scholar"] },
  { num: 77, id: "academia", name: "Academia", category: "group_c", desc: "Phong cách trường học, sách vở và trang phục cổ điển.", kw: ["academia", "school uniform", "scholar", "books", "satchel"] },
  { num: 78, id: "minimalist", name: "Minimalist", category: "group_c", desc: "Ít màu, ít phụ kiện và đường nét gọn.", kw: ["minimalist", "clean line", "simple fit", "monotone", "subtle"] },
  { num: 79, id: "clean-girl", name: "Clean Girl", category: "group_c", desc: "Gọn gàng, tinh tế, trung tính và makeup nhẹ.", kw: ["clean girl", "slick hair", "gold hoops", "natural beauty", "dewy"] },
  { num: 80, id: "clean-boy", name: "Clean Boy", category: "group_c", desc: "Tóc gọn, trang phục vừa vặn và màu sắc tối giản.", kw: ["clean boy", "neat hair", "basic tee", "minimalist boy"] },
  { num: 81, id: "chic", name: "Chic", category: "group_c", desc: "Thanh lịch, thời trang và phối hợp chỉn chu.", kw: ["chic", "elegant", "sophisticated", "fashionable", "stylish"] },
  { num: 82, id: "casual", name: "Casual", category: "group_c", desc: "Áo thun, jeans, hoodie và sneaker đời thường.", kw: ["casual", "jeans and tee", "everyday fit", "simple casual"] },
  { num: 83, id: "sporty", name: "Sporty", category: "group_c", desc: "Áo jersey, jogger và giày thể thao phối theo hướng thời trang.", kw: ["sporty", "jersey", "joggers", "tracksuit", "baseball cap"] },
  { num: 84, id: "athletic", name: "Athletic", category: "group_c", desc: "Đồ vận động, dáng thể thao và trang phục tập luyện.", kw: ["athletic", "gym", "workout", "leggings", "compression"] },
  { num: 85, id: "skater", name: "Skater", category: "group_c", desc: "Áo rộng, quần baggy, giày skate, mũ và phụ kiện đường phố.", kw: ["skater", "skateboard", "thrasher", "vans", "skate beanie", "baggy skate"] },
  { num: 86, id: "blokette", name: "Blokette", category: "group_c", desc: "Thể thao hoặc bóng đá pha chi tiết nữ tính như nơ, váy và tất cao.", kw: ["blokette", "football jersey bow", "soccer skirt", "sporty coquette"] },
  { num: 87, id: "grunge-skater", name: "Grunge Skater", category: "group_c", desc: "Đồ skate, màu tối, quần rách và flannel.", kw: ["grunge skater", "dark skate", "torn jeans skate"] },
  { num: 88, id: "mall-goth", name: "Mall Goth", category: "group_c", desc: "Goth đại chúng, áo ban nhạc, quần tối và dây xích.", kw: ["mall goth", "tripp pants", "band tee", "chain belt", "hot topic"] },
  { num: 89, id: "trad-goth", name: "Trad Goth", category: "group_c", desc: "Goth truyền thống, tóc dựng, eyeliner đậm, ren và đồ đen.", kw: ["trad goth", "siouxsie", "bauhaus", "batcave", "big teased hair", "pointed boots"] },
  { num: 90, id: "pastel-goth", name: "Pastel Goth", category: "group_c", desc: "Goth pha pastel, tương phản giữa dễ thương và u tối.", kw: ["pastel goth", "pastel purple goth", "creepy cute", "inverted cross pastel"] },
  { num: 91, id: "cybergoth", name: "Cybergoth", category: "group_c", desc: "Goth pha rave và công nghệ, neon, dây đai và kính.", kw: ["cybergoth", "cyber hair falls", "gas mask", "glow goggles", "rave goth"] },
  { num: 92, id: "gothic-romance", name: "Gothic Romance", category: "group_c", desc: "Lãng mạn u tối, ren, váy dài, nhung và phụ kiện cổ điển.", kw: ["gothic romance", "dark velvet", "victorian mourning", "rose lace"] },
  { num: 93, id: "dark-coquette", name: "Dark Coquette", category: "group_c", desc: "Nơ, ren, đen và đỏ rượu theo hướng bí ẩn.", kw: ["dark coquette", "black bow", "wine red ribbon", "vamp coquette"] },
  { num: 94, id: "whimsygoth", name: "Whimsygoth", category: "group_c", desc: "Goth huyền bí, thiên nhiên và trang phục bay bổng.", kw: ["whimsygoth", "celestial velvet", "witchy bohemian", "moon stars dress"] },
  { num: 95, id: "hippie", name: "Hippie", category: "group_c", desc: "Trang phục phóng khoáng, hoa, tua rua và màu tự nhiên.", kw: ["hippie", "peace sign", "tie dye", "fringed vest", "flower child"] },
  { num: 96, id: "hipster", name: "Hipster", category: "group_c", desc: "Phong cách thay thế đại chúng, vintage, kính và phụ kiện độc đáo.", kw: ["hipster", "thick glasses", "vintage scarf", "indie coffee"] },
  { num: 97, id: "boho", name: "Boho", category: "group_c", desc: "Bohemian, vải mềm, tua rua, họa tiết dân gian và phụ kiện nhiều lớp.", kw: ["boho", "bohemian", "maxi dress", "turquoise jewelry", "boho chic"] },
  { num: 98, id: "vsco", name: "VSCO", category: "group_c", desc: "Aesthetic mạng xã hội, áo rộng, sneaker và phụ kiện trẻ trung.", kw: ["vsco", "scrunchie", "hydro flask", "oversized tee", "shell necklace"] },
  { num: 99, id: "night-luxe", name: "Night Luxe", category: "group_c", desc: "Sang trọng về đêm, đồ tối màu, chất liệu bóng và phụ kiện nổi bật.", kw: ["night luxe", "cocktail dress", "satin slip", "champagne glam", "midnight party"] },
  { num: 100, id: "glam", name: "Glam", category: "group_c", desc: "Hào nhoáng, ánh kim, trang sức và vẻ ngoài được chăm chút.", kw: ["glam", "glamour", "sequin", "gold jewelry", "red carpet glam"] },

  // Nhóm D (101-150)
  { num: 101, id: "luxury", name: "Luxury", category: "group_d", desc: "Mô phỏng xa xỉ với phụ kiện cao cấp và màu sắc sang trọng.", kw: ["luxury", "designer", "diamond", "rolex", "expensive outfit"] },
  { num: 102, id: "rich", name: "Rich", category: "group_d", desc: "Hình tượng giàu có, suit, trang sức và đồ hiệu mô phỏng.", kw: ["rich", "tuxedo", "suit", "gold watch", "millionaire"] },
  { num: 103, id: "celebrity", name: "Celebrity", category: "group_d", desc: "Hình tượng người nổi tiếng hoặc thời trang thảm đỏ.", kw: ["celebrity", "red carpet", "paparazzi", "star outfit"] },
  { num: 104, id: "model", name: "Model", category: "group_d", desc: "Tạo hình thời trang, chú trọng tỷ lệ, trang phục và dáng tổng thể.", kw: ["model", "runway", "fashion week", "vogue"] },
  { num: 105, id: "male-model", name: "Male Model", category: "group_d", desc: "Hình tượng người mẫu nam với outfit chỉn chu.", kw: ["male model", "sharp suit", "chiseled", "runway boy"] },
  { num: 106, id: "femboy", name: "Femboy", category: "group_d", desc: "Avatar thể hiện nam tính kết hợp trang phục hoặc phụ kiện nữ tính.", kw: ["femboy", "thigh highs", "cat ears boy", "skirt boy", "cute fem"] },
  { num: 107, id: "catboy", name: "Catboy", category: "group_d", desc: "Nhân vật nam mang đặc điểm mèo, tai và đuôi.", kw: ["catboy", "cat ears boy", "feline boy", "meow"] },
  { num: 108, id: "neko", name: "Neko", category: "group_d", desc: "Nhân vật có đặc điểm mèo, lấy cảm hứng từ anime Nhật.", kw: ["neko", "nekomimi", "cat ears", "cat tail", "paw gloves"] },
  { num: 109, id: "furry", name: "Furry", category: "group_d", desc: "Nhân vật động vật có đặc điểm nhân hóa.", kw: ["furry", "fursuit", "anthropomorphic", "fox ears", "wolf tail"] },
  { num: 110, id: "anime", name: "Anime", category: "group_d", desc: "Tạo hình lấy cảm hứng từ nhân vật hoạt hình Nhật Bản.", kw: ["anime", "otaku", "manga style", "anime eyes", "anime hair"] },
  { num: 111, id: "manga", name: "Manga", category: "group_d", desc: "Phong cách mô phỏng nhân vật truyện tranh Nhật.", kw: ["manga", "shonen", "screentone", "manga panel", "monochrome anime"] },
  { num: 112, id: "cosplay", name: "Cosplay", category: "group_d", desc: "Tái tạo trang phục và ngoại hình của một nhân vật cụ thể.", kw: ["cosplay", "character costume", "recreation", "iconic outfit"] },
  { num: 113, id: "chibi", name: "Chibi", category: "group_d", desc: "Đầu lớn, thân nhỏ và tạo hình dễ thương.", kw: ["chibi", "mini avatar", "tiny body", "cute chibi"] },
  { num: 114, id: "moe", name: "Moe", category: "group_d", desc: "Anime đáng yêu, biểu cảm ngây thơ và nét mềm mại.", kw: ["moe", "moe anime", "cute innocent", "shy anime"] },
  { num: 115, id: "magical-girl", name: "Magical Girl", category: "group_d", desc: "Nhân vật phép thuật với váy, nơ, gậy phép và màu rực rỡ.", kw: ["magical girl", "mahou shoujo", "wand", "sailor moon", "transformation"] },
  { num: 116, id: "fantasy", name: "Fantasy", category: "group_d", desc: "Thế giới giả tưởng, phép thuật, sinh vật huyền bí và trang phục phi hiện thực.", kw: ["fantasy", "magic", "mystic", "sorcery", "enchanted"] },
  { num: 117, id: "elf", name: "Elf", category: "group_d", desc: "Tiên tộc, tai nhọn và trang phục fantasy hoặc thiên nhiên.", kw: ["elf", "pointed ears", "elven", "wood elf", "high elf"] },
  { num: 118, id: "fairy", name: "Fairy", category: "group_d", desc: "Nhân vật tiên với cánh và trang phục nhẹ nhàng.", kw: ["fairy", "pixie", "fairy dust", "flutter wings"] },
  { num: 119, id: "angelcore", name: "Angelcore", category: "group_d", desc: "Thiên thần, cánh trắng, hào quang và trang phục sáng.", kw: ["angelcore", "angel wings", "halo", "white angel", "cherub"] },
  { num: 120, id: "demoncore", name: "Demoncore", category: "group_d", desc: "Quỷ, sừng, cánh tối và chi tiết siêu nhiên.", kw: ["demoncore", "horns", "demon wings", "devil tail", "succubus"] },
  { num: 121, id: "vampire", name: "Vampire", category: "group_d", desc: "Ma cà rồng, áo choàng, răng nanh và tông đen đỏ.", kw: ["vampire", "fangs", "dracula", "blood red cape", "vampire collar"] },
  { num: 122, id: "witchcore", name: "Witchcore", category: "group_d", desc: "Phù thủy, mũ nhọn, áo choàng và phụ kiện phép thuật.", kw: ["witchcore", "witch hat", "potion", "broom", "cauldron"] },
  { num: 123, id: "wizard", name: "Wizard", category: "group_d", desc: "Pháp sư với áo choàng, mũ, gậy và sách thần chú.", kw: ["wizard", "mage", "staff", "spellbook", "robe"] },
  { num: 124, id: "knight", name: "Knight", category: "group_d", desc: "Hiệp sĩ với giáp, kiếm, khiên hoặc áo choàng.", kw: ["knight", "armor", "sword", "shield", "crusader", "iron armor"] },
  { num: 125, id: "medieval", name: "Medieval", category: "group_d", desc: "Trang phục Trung cổ, tunic, giáp, áo choàng và đồ da.", kw: ["medieval", "middle ages", "tunic", "chainmail", "peasant"] },
  { num: 126, id: "dark-fantasy", name: "Dark Fantasy", category: "group_d", desc: "Fantasy u tối với giáp đen, vũ khí và chi tiết ma quái.", kw: ["dark fantasy", "black knight", "cursed sword", "eldritch"] },
  { num: 127, id: "horror", name: "Horror", category: "group_d", desc: "Kinh dị với mặt nạ, hiệu ứng đáng sợ và trang phục kinh dị.", kw: ["horror", "creepy", "blood", "jason mask", "haunted"] },
  { num: 128, id: "scary", name: "Scary", category: "group_d", desc: "Tập trung vào vẻ ngoài đáng sợ.", kw: ["scary", "spooky", "frightening", "skull face"] },
  { num: 129, id: "gore", name: "Gore", category: "group_d", desc: "Hiệu ứng máu me hoặc tổn thương cơ thể giả lập.", kw: ["gore", "bloody", "stitched", "wounds", "slasher"] },
  { num: 130, id: "cute-gore", name: "Cute Gore", category: "group_d", desc: "Dễ thương kết hợp chi tiết kinh dị cách điệu.", kw: ["cute gore", "gurokawa", "bandages cute", "bloody pastel"] },
  { num: 131, id: "zombie", name: "Zombie", category: "group_d", desc: "Xác sống, da xanh hoặc xám và quần áo rách.", kw: ["zombie", "undead", "green skin", "torn clothes", "tattered"] },
  { num: 132, id: "monster", name: "Monster", category: "group_d", desc: "Quái vật với sừng, móng vuốt, răng nanh hoặc hình thể kỳ dị.", kw: ["monster", "beast", "claws", "sharp teeth", "creature"] },
  { num: 133, id: "military", name: "Military", category: "group_d", desc: "Quân phục, đồ ngụy trang và giày quân đội.", kw: ["military", "camo", "camouflage", "combat boots", "soldier"] },
  { num: 134, id: "tactical", name: "Tactical", category: "group_d", desc: "Trang phục chiến thuật với áo giáp, túi và dây đai.", kw: ["tactical", "plate carrier", "holster", "tactical helmet", "night vision"] },
  { num: 135, id: "police", name: "Police", category: "group_d", desc: "Đồng phục cảnh sát, phù hiệu và phụ kiện công vụ.", kw: ["police", "cop", "badge", "patrol", "handcuffs"] },
  { num: 136, id: "swat", name: "SWAT", category: "group_d", desc: "Đặc nhiệm với đồ tối màu, mũ, kính và áo giáp.", kw: ["swat", "special forces", "balaclava", "tactical gear"] },
  { num: 137, id: "army", name: "Army", category: "group_d", desc: "Hình tượng quân nhân lục quân và trang bị chiến đấu.", kw: ["army", "armed forces", "infantry", "beret"] },
  { num: 138, id: "ninja", name: "Ninja", category: "group_d", desc: "Trang phục kín mặt, tông đen, khăn quấn và vũ khí mô phỏng.", kw: ["ninja", "shinobi", "kunai", "shuriken", "katana", "mask"] },
  { num: 139, id: "samurai", name: "Samurai", category: "group_d", desc: "Giáp samurai, kimono, hakama và katana.", kw: ["samurai", "kabuto", "katana", "bushido", "ronin"] },
  { num: 140, id: "assassin", name: "Assassin", category: "group_d", desc: "Sát thủ với áo choàng, mặt nạ và trang phục kín đáo.", kw: ["assassin", "hood", "hidden blade", "stealth cloak"] },
  { num: 141, id: "warrior", name: "Warrior", category: "group_d", desc: "Chiến binh với giáp, vũ khí và trang phục chiến đấu.", kw: ["warrior", "fighter", "gladiator", "battle gear"] },
  { num: 142, id: "superhero", name: "Superhero", category: "group_d", desc: "Siêu anh hùng với bộ đồ và biểu tượng sức mạnh.", kw: ["superhero", "cape", "hero suit", "spider-man", "batman", "superman"] },
  { num: 143, id: "supervillain", name: "Supervillain", category: "group_d", desc: "Phản diện siêu năng lực với thiết kế mạnh và đáng sợ.", kw: ["supervillain", "villain", "joker", "nemesis", "evil lord"] },
  { num: 144, id: "villaincore", name: "Villaincore", category: "group_d", desc: "Aesthetic phản diện, bí ẩn và quyền lực.", kw: ["villaincore", "evil aesthetic", "dark throne", "sinister"] },
  { num: 145, id: "royal", name: "Royal", category: "group_d", desc: "Trang phục hoàng gia, áo choàng, vương miện và đồ trang trí.", kw: ["royal", "king", "queen", "monarch", "tiara"] },
  { num: 146, id: "princess", name: "Princess", category: "group_d", desc: "Công chúa, váy dạ hội, vương miện và phụ kiện lấp lánh.", kw: ["princess", "ballgown", "sparkly tiara", "royal princess"] },
  { num: 147, id: "prince", name: "Prince", category: "group_d", desc: "Hoàng tử với áo khoác sang trọng và trang phục nghi lễ.", kw: ["prince", "regal sash", "royal prince suit"] },
  { num: 148, id: "pirate", name: "Pirate", category: "group_d", desc: "Cướp biển với áo khoác, khăn trùm đầu và phụ kiện hàng hải.", kw: ["pirate", "eyepatch", "tricorne", "cutlass", "jolly roger"] },
  { num: 149, id: "cowboy", name: "Cowboy", category: "group_d", desc: "Mũ cao bồi, boots, jeans và trang phục miền Tây.", kw: ["cowboy", "cowboy hat", "leather boots", "sheriff", "spurs"] },
  { num: 150, id: "western", name: "Western", category: "group_d", desc: "Thời trang miền Tây với cowboy, denim, da và họa tiết cao bồi.", kw: ["western", "wild west", "leather fringe", "saloon"] },

  // Nhóm E (151-200)
  { num: 151, id: "country", name: "Country", category: "group_e", desc: "Thời trang đồng quê, denim, boots, mũ và họa tiết caro.", kw: ["country", "flannel plaid", "country boots", "barn"] },
  { num: 152, id: "bloxburg", name: "Bloxburg", category: "group_e", desc: "Phối đồ nhập vai đời thường trong Welcome to Bloxburg.", kw: ["bloxburg", "roleplay casual", "city life fit"] },
  { num: 153, id: "bloxburg-mom", name: "Bloxburg Mom", category: "group_e", desc: "Hình tượng mẹ trong game nhập vai gia đình, trang phục đời thường chỉn chu.", kw: ["bloxburg mom", "cardigan mom", "roleplay parent"] },
  { num: 154, id: "berry-avenue", name: "Berry Avenue", category: "group_e", desc: "Thời trang đời thường, học đường hoặc sang trọng gắn với game Berry Avenue.", kw: ["berry avenue", "ba aesthetic", "suburban chic"] },
  { num: 155, id: "cafe-worker", name: "Café Worker", category: "group_e", desc: "Đồng phục quán cà phê với tạp dề và sơ mi.", kw: ["cafe", "barista", "apron", "coffee shop"] },
  { num: 156, id: "schoolcore", name: "Schoolcore", category: "group_e", desc: "Đồng phục học sinh, balô, cà vạt và áo len.", kw: ["schoolcore", "school uniform", "backpack", "tie", "blazer school"] },
  { num: 157, id: "nerd", name: "Nerd", category: "group_e", desc: "Kính, sơ mi và áo len gợi hình tượng học sinh hoặc người yêu tri thức.", kw: ["nerd", "nerd glasses", "tape on glasses", "braces", "suspenders"] },
  { num: 158, id: "geek", name: "Geek", category: "group_e", desc: "Công nghệ, trò chơi, truyện tranh và văn hóa đại chúng.", kw: ["geek", "geek tee", "comic tee", "retro gaming"] },
  { num: 159, id: "gamer", name: "Gamer", category: "group_e", desc: "Hoodie, tai nghe, áo game và phụ kiện công nghệ.", kw: ["gamer", "gaming headset", "rgb headphones", "gamer hoodie"] },
  { num: 160, id: "e-kid", name: "E-Kid", category: "group_e", desc: "Giới trẻ internet, emo, streetwear, tóc layer và phụ kiện.", kw: ["ekid", "e-kid", "internet fashion", "tiktok style"] },
  { num: 161, id: "troll", name: "Troll", category: "group_e", desc: "Avatar nhằm trêu chọc, gây bất ngờ hoặc tạo hài hước.", kw: ["troll", "trollface", "derp", "distorted body", "prank"] },
  { num: 162, id: "meme", name: "Meme", category: "group_e", desc: "Tái hiện meme internet qua mặt, trang phục hoặc phụ kiện.", kw: ["meme", "shrek", "doge", "amogus", "pepe", "gigachad", "funny head"] },
  { num: 163, id: "silly-goober", name: "Silly Goober", category: "group_e", desc: "Avatar ngộ nghĩnh, cố tình ngớ ngẩn hoặc dễ thương.", kw: ["silly goober", "goober", "silly face", "wacky"] },
  { num: 164, id: "mlg", name: "MLG", category: "group_e", desc: "Meme game đời cũ, màu sắc phóng đại và phụ kiện hài hước.", kw: ["mlg", "doritos", "mountain dew", "deal with it", "illuminati"] },
  { num: 165, id: "goofy", name: "Goofy", category: "group_e", desc: "Biểu cảm kỳ quặc hoặc hình thể bất thường gây cười.", kw: ["goofy", "goofy ahh", "funny expression", "awkward pose"] },
  { num: 166, id: "funny-avatar", name: "Funny Avatar", category: "group_e", desc: "Phối đồ với mục đích gây cười.", kw: ["funny", "hilarious", "joke fit", "comedy"] },
  { num: 167, id: "od-er", name: "Od(er)", category: "group_e", desc: "Thuật ngữ online dater, cần đánh giá dựa trên ngữ cảnh thực tế.", kw: ["oder", "online dater", "matching couple fit"] },
  { num: 168, id: "scam-bot", name: "Scam Bot", category: "group_e", desc: "Hình tượng tài khoản giả mạo hoặc bot lừa đảo mang tính châm biếm.", kw: ["scam bot", "free robux tee", "bot avatar"] },
  { num: 169, id: "guestcore", name: "Guestcore", category: "group_e", desc: "Hoài niệm avatar Guest và Roblox thời trước.", kw: ["guestcore", "guest nostalgia", "guest tribute"] },
  { num: 170, id: "baconcore", name: "Baconcore", category: "group_e", desc: "Outfit xoay quanh Bacon Hair và hình tượng người chơi mới.", kw: ["baconcore", "bacon hair tribute", "pal hair aesthetic"] },
  { num: 171, id: "headless", name: "Headless", category: "group_e", desc: "Hiệu ứng đầu vô hình từ gói Headless Horseman.", kw: ["headless", "headless horseman", "invisible head", "no head"] },
  { num: 172, id: "korblox", name: "Korblox", category: "group_e", desc: "Sử dụng item hoặc gói Korblox, nổi tiếng với chân giả dạng xương.", kw: ["korblox", "deathspeaker", "floating leg", "skeleton leg"] },
  { num: 173, id: "korblox-flex", name: "Korblox Flex", category: "group_e", desc: "Phối đồ làm nổi bật Korblox như item thể hiện giá trị.", kw: ["korblox flex", "showing korblox", "korblox leg"] },
  { num: 174, id: "headless-flex", name: "Headless Flex", category: "group_e", desc: "Tập trung khoe hiệu ứng đầu vô hình.", kw: ["headless flex", "showing headless", "expensive headless"] },
  { num: 175, id: "limited-flex", name: "Limited Flex", category: "group_e", desc: "Dùng item Limited để thể hiện bộ sưu tập.", kw: ["limited", "limited flex", "dominus", "valkyrie", "fedora limited"] },
  { num: 176, id: "avatar-flex", name: "Avatar Flex", category: "group_e", desc: "Khoe item hiếm, phụ kiện đắt hoặc combo độc đáo.", kw: ["flex", "flexing", "rare items", "expensive combo"] },
  { num: 177, id: "free-avatar", name: "Free Avatar", category: "group_e", desc: "Outfit sử dụng item miễn phí.", kw: ["free avatar", "0 robux", "free items", "event free"] },
  { num: 178, id: "cheap-avatar", name: "Cheap Avatar", category: "group_e", desc: "Phối item giá thấp nhằm đạt hiệu quả thẩm mỹ.", kw: ["cheap avatar", "budget fit", "under 100 robux"] },
  { num: 179, id: "aesthetic", name: "Aesthetic", category: "group_e", desc: "Tên gọi chung cho avatar có concept hình ảnh rõ ràng.", kw: ["aesthetic", "vibe", "mood", "concept fit"] },
  { num: 180, id: "cute", name: "Cute", category: "group_e", desc: "Phong cách dễ thương với màu sáng và phụ kiện nhỏ.", kw: ["cute", "adorable", "sweet", "tiny accessory"] },
  { num: 181, id: "edgy", name: "Edgy", category: "group_e", desc: "Nổi loạn, màu đen, mặt nạ, dây xích và họa tiết sắc cạnh.", kw: ["edgy", "dark rebel", "chains mask", "spikes edgy"] },
  { num: 182, id: "dark", name: "Dark", category: "group_e", desc: "Tông tối, bí ẩn hoặc lạnh lùng.", kw: ["dark", "shadow", "mysterious", "pitch black"] },
  { num: 183, id: "light", name: "Light", category: "group_e", desc: "Tông sáng, màu nhạt và cảm giác nhẹ nhàng.", kw: ["light", "bright", "soft tones", "white aesthetic"] },
  { num: 184, id: "monochrome", name: "Monochrome", category: "group_e", desc: "Một màu chủ đạo hoặc các sắc độ của cùng màu.", kw: ["monochrome", "grayscale", "black and white", "one color"] },
  { num: 185, id: "all-black", name: "All Black", category: "group_e", desc: "Outfit chủ yếu màu đen.", kw: ["all black", "total black", "blackout", "full black"] },
  { num: 186, id: "all-white", name: "All White", category: "group_e", desc: "Outfit chủ yếu màu trắng.", kw: ["all white", "pure white", "snow white", "full white"] },
  { num: 187, id: "red-and-black", name: "Red and Black", category: "group_e", desc: "Phối đỏ và đen để tạo cảm giác mạnh hoặc bí ẩn.", kw: ["red and black", "crimson black", "black red combo"] },
  { num: 188, id: "pink-aesthetic", name: "Pink Aesthetic", category: "group_e", desc: "Màu hồng chủ đạo, từ pastel đến neon.", kw: ["pink aesthetic", "all pink", "hot pink", "baby pink"] },
  { num: 189, id: "pastel-aesthetic", name: "Pastel Aesthetic", category: "group_e", desc: "Các màu nhạt như hồng, xanh nhạt, vàng kem và lavender.", kw: ["pastel aesthetic", "pastel tones", "soft pastel"] },
  { num: 190, id: "rainbow", name: "Rainbow", category: "group_e", desc: "Nhiều màu cầu vồng trên quần áo và phụ kiện.", kw: ["rainbow", "multicolor", "pride rainbow", "colorful spectrum"] },
  { num: 191, id: "neon", name: "Neon", category: "group_e", desc: "Màu phát sáng như xanh điện, hồng neon hoặc xanh lá rực.", kw: ["neon", "fluorescent", "bright neon", "electric blue"] },
  { num: 192, id: "glowcore", name: "Glowcore", category: "group_e", desc: "Hiệu ứng phát sáng và chi tiết nổi bật trong bóng tối.", kw: ["glowcore", "bioluminescence", "glowing", "neon glow"] },
  { num: 193, id: "cyber-y2k", name: "Cyber Y2K", category: "group_e", desc: "Y2K kết hợp công nghệ và cyberpunk.", kw: ["cyber y2k", "futuristic 2000s", "silver digital y2k"] },
  { num: 194, id: "techno", name: "Techno", category: "group_e", desc: "Thời trang nhạc điện tử, club, màu đen, neon và phụ kiện công nghiệp.", kw: ["techno", "berlin club", "industrial rave", "minimal techno"] },
  { num: 195, id: "industrial", name: "Industrial", category: "group_e", desc: "Kim loại, khóa, dây đai và hình ảnh máy móc.", kw: ["industrial", "chains pipes", "factory aesthetic", "heavy metal"] },
  { num: 196, id: "robot", name: "Robot", category: "group_e", desc: "Mô phỏng robot, giáp máy và khuôn mặt nhân tạo.", kw: ["robot", "android", "mechanical", "circuits", "automaton"] },
  { num: 197, id: "mecha", name: "Mecha", category: "group_e", desc: "Robot chiến đấu cỡ lớn, giáp góc cạnh và vũ khí khoa học viễn tưởng.", kw: ["mecha", "gundam", "eva", "giant robot", "exoskeleton"] },
  { num: 198, id: "alien", name: "Alien", category: "group_e", desc: "Người ngoài hành tinh với màu da và đặc điểm khác thường.", kw: ["alien", "extraterrestrial", "ufo", "martian", "green alien"] },
  { num: 199, id: "spacecore", name: "Spacecore", category: "group_e", desc: "Không gian, hành tinh và phi hành gia.", kw: ["spacecore", "planets", "astronomy", "spacesuit helmet"] },
  { num: 200, id: "galaxycore", name: "Galaxycore", category: "group_e", desc: "Tím, xanh đậm, sao và tinh vân.", kw: ["galaxycore", "galaxy hoodie", "nebula", "starlight galaxy"] },

  // Nhóm F (201-234)
  { num: 201, id: "aquatic", name: "Aquatic", category: "group_f", desc: "Đại dương, sinh vật dưới nước và phụ kiện biển.", kw: ["aquatic", "underwater", "scuba", "fish", "marine"] },
  { num: 202, id: "mermaidcore", name: "Mermaidcore", category: "group_f", desc: "Nàng tiên cá, đuôi cá, vảy lấp lánh và màu xanh biển.", kw: ["mermaidcore", "mermaid tail", "seashell bra", "scales iridescent"] },
  { num: 203, id: "oceancore", name: "Oceancore", category: "group_f", desc: "Đại dương, san hô, vỏ sò và sắc xanh.", kw: ["oceancore", "coral", "deep sea", "waves", "tide"] },
  { num: 204, id: "naturecore", name: "Naturecore", category: "group_f", desc: "Lá, hoa, màu đất và thiên nhiên.", kw: ["naturecore", "foliage", "earth green", "botanical"] },
  { num: 205, id: "forestcore", name: "Forestcore", category: "group_f", desc: "Rừng, rêu, nấm, lá và trang phục tự nhiên.", kw: ["forestcore", "moss", "woodland", "pine forest"] },
  { num: 206, id: "mushroomcore", name: "Mushroomcore", category: "group_f", desc: "Nấm, màu đất và hình ảnh cổ tích.", kw: ["mushroomcore", "mushroom hat", "toadstool", "fungi"] },
  { num: 207, id: "plantcore", name: "Plantcore", category: "group_f", desc: "Cây xanh, dây leo, lá và phụ kiện thực vật.", kw: ["plantcore", "vines", "succulents", "houseplants", "sprout"] },
  { num: 208, id: "flowercore", name: "Flowercore", category: "group_f", desc: "Hoa là chủ đề chính.", kw: ["flowercore", "flower crown", "blossom", "sunflower", "daisy"] },
  { num: 209, id: "animalcore", name: "Animalcore", category: "group_f", desc: "Mô phỏng động vật hoặc dùng tai, đuôi và họa tiết động vật.", kw: ["animalcore", "animal ears", "animal pattern", "leopard print"] },
  { num: 210, id: "bearcore", name: "Bearcore", category: "group_f", desc: "Gấu, tai gấu, áo lông và phụ kiện hình gấu.", kw: ["bearcore", "bear ears", "teddy bear", "fluffy bear hoodie"] },
  { num: 211, id: "cat-aesthetic", name: "Cat Aesthetic", category: "group_f", desc: "Tai mèo, đuôi mèo và phụ kiện lấy cảm hứng từ mèo.", kw: ["cat aesthetic", "kitty paws", "cat hat", "whiskers"] },
  { num: 212, id: "bunnycore", name: "Bunnycore", category: "group_f", desc: "Tai thỏ, nơ, pastel và phụ kiện dễ thương.", kw: ["bunnycore", "rabbit ears", "fluffy tail", "bunny slippers"] },
  { num: 213, id: "puppycore", name: "Puppycore", category: "group_f", desc: "Hình tượng chó con, tai, đuôi và phụ kiện thú cưng.", kw: ["puppycore", "dog ears", "puppy tail", "dog collar"] },
  { num: 214, id: "dollcore", name: "Dollcore", category: "group_f", desc: "Avatar giống búp bê với gương mặt trau chuốt và phụ kiện cầu kỳ.", kw: ["dollcore", "doll joints", "glass eyes", "doll clothes"] },
  { num: 215, id: "toycore", name: "Toycore", category: "group_f", desc: "Đồ chơi, màu sắc rực và hình khối vui nhộn.", kw: ["toycore", "toy blocks", "plastic toys", "windup key"] },
  { num: 216, id: "plushcore", name: "Plushcore", category: "group_f", desc: "Thú nhồi bông và phụ kiện mềm, bông xù.", kw: ["plushcore", "stuffed animal", "plush backpack", "cuddly"] },
  { num: 217, id: "clown", name: "Clown", category: "group_f", desc: "Trang phục chú hề, makeup đậm và màu tương phản.", kw: ["clown", "circus clown", "jester hat", "pie face"] },
  { num: 218, id: "circuscore", name: "Circuscore", category: "group_f", desc: "Rạp xiếc, trang phục biểu diễn và họa tiết sân khấu.", kw: ["circuscore", "ringmaster", "big top", "trapeze", "carnival"] },
  { num: 219, id: "circus-goth", name: "Circus Goth", category: "group_f", desc: "Xiếc kết hợp goth, đen, đỏ, sọc và hình ảnh ma mị.", kw: ["circus goth", "creepy jester", "striped goth clown"] },
  { num: 220, id: "balletcore", name: "Balletcore", category: "group_f", desc: "Váy quấn, nơ, tất dài và giày ba lê.", kw: ["balletcore", "tutu", "leg warmers", "ballet flats", "ribbons dance"] },
  { num: 221, id: "dancecore", name: "Dancecore", category: "group_f", desc: "Trang phục và phụ kiện vũ công, sân khấu và điệu nhảy.", kw: ["dancecore", "leotard", "dancer", "hip hop dance"] },
  { num: 222, id: "k-pop", name: "K-Pop", category: "group_f", desc: "Outfit idol Hàn Quốc với layer và trang phục biểu diễn.", kw: ["kpop", "k-pop", "idol outfit", "korean stage outfit", "kpop hair"] },
  { num: 223, id: "j-pop", name: "J-Pop", category: "group_f", desc: "Phong cách idol Nhật Bản, dễ thương hoặc cá tính.", kw: ["jpop", "j-pop", "japanese idol", "stage idol"] },
  { num: 224, id: "pop-star", name: "Pop Star", category: "group_f", desc: "Ngôi sao nhạc pop, đồ biểu diễn và trang sức.", kw: ["pop star", "microphone", "stage sparkle", "diva"] },
  { num: 225, id: "rockstar", name: "Rockstar", category: "group_f", desc: "Áo ban nhạc, da, boots và phong cách sân khấu.", kw: ["rockstar", "electric guitar", "leather pants", "heavy rock"] },
  { num: 226, id: "grunge-rockstar", name: "Grunge Rockstar", category: "group_f", desc: "Rock kết hợp grunge, đồ bạc màu và màu tối.", kw: ["grunge rockstar", "distressed rock", "vintage band tee"] },
  { num: 227, id: "punk-rockstar", name: "Punk Rockstar", category: "group_f", desc: "Rock kết hợp punk, đinh tán và dây xích.", kw: ["punk rockstar", "studded guitar", "leather spikes rock"] },
  { num: 228, id: "hip-hop", name: "Hip-Hop", category: "group_f", desc: "Áo rộng, sneaker, dây chuyền và văn hóa hip-hop.", kw: ["hip hop", "hiphop", "baggy tee", "gold chain", "flat brim"] },
  { num: 229, id: "rapper", name: "Rapper", category: "group_f", desc: "Hình tượng rapper với trang sức, kính, mũ và streetwear.", kw: ["rapper", "iced out", "grillz", "puffer jacket", "diamond chain"] },
  { num: 230, id: "r-and-b-aesthetic", name: "R&B Aesthetic", category: "group_f", desc: "Thời trang nghệ sĩ R&B, thanh lịch hoặc hoài cổ.", kw: ["r&b", "rnb", "smooth leather", "90s rnb", "velvet r&b"] },
  { num: 231, id: "reggae", name: "Reggae", category: "group_f", desc: "Cảm hứng reggae, đôi khi dùng đỏ, vàng và xanh lá.", kw: ["reggae", "rasta", "red gold green", "dreadlocks", "bob marley"] },
  { num: 232, id: "raver", name: "Raver", category: "group_f", desc: "Outfit lễ hội nhạc điện tử với neon và phụ kiện phát sáng.", kw: ["raver", "edm", "glowsticks", "kandi bracelets", "neon rave"] },
  { num: 233, id: "festival", name: "Festival", category: "group_f", desc: "Thời trang lễ hội âm nhạc, phụ kiện và màu sắc phóng khoáng.", kw: ["festival", "coachella", "face gems", "fringe", "boho festival"] },
  { num: 234, id: "disco", name: "Disco", category: "group_f", desc: "Đồ ánh kim, quần ống loe và thời trang sàn nhảy thập niên 1970.", kw: ["disco", "bell bottoms", "disco ball", "70s glitter", "flare pants"] },

  // Nhóm G (235-260)
  { num: 235, id: "y3k", name: "Y3K", category: "group_g", desc: "Tưởng tượng thời trang thiên niên kỷ tiếp theo, bạc kim loại và chất liệu bóng.", kw: ["y3k", "year 3000", "chrome silver", "metallic future", "liquid metal"] },
  { num: 236, id: "cyber-y3k", name: "Cyber Y3K", category: "group_g", desc: "Y3K kết hợp cyberpunk, công nghệ và neon.", kw: ["cyber y3k", "cybernetic 3000", "neon chrome"] },
  { num: 237, id: "futuristic-streetwear", name: "Futuristic Streetwear", category: "group_g", desc: "Streetwear tương lai, áo khoác kỹ thuật và phụ kiện công nghệ.", kw: ["futuristic streetwear", "future tech hoodie", "sci fi street"] },
  { num: 238, id: "digitalcore", name: "Digitalcore", category: "group_g", desc: "Pixel, màn hình và hình ảnh máy tính.", kw: ["digitalcore", "pixel art", "monitor head", "crt screen"] },
  { num: 239, id: "glitchcore", name: "Glitchcore", category: "group_g", desc: "Nhiễu hình ảnh, màu lệch, pixel vỡ và hiệu ứng lỗi kỹ thuật số.", kw: ["glitchcore", "glitch", "static noise", "rgb split", "corrupted"] },
  { num: 240, id: "webcore", name: "Webcore", category: "group_g", desc: "Giao diện website, biểu tượng internet và thiết kế web cổ.", kw: ["webcore", "old web", "hyperlink", "internet 90s", "clipart"] },
  { num: 241, id: "internetcore", name: "Internetcore", category: "group_g", desc: "Meme, văn hóa mạng và biểu tượng kỹ thuật số.", kw: ["internetcore", "netizen", "viral culture", "dial up"] },
  { num: 242, id: "frutiger-aero", name: "Frutiger Aero", category: "group_g", desc: "Công nghệ những năm 2000, xanh dương, trắng, nước, bong bóng và thiên nhiên bóng bẩy.", kw: ["frutiger aero", "glossy blue", "water bubbles", "windows aero", "skymorphism"] },
  { num: 243, id: "frutiger-metro", name: "Frutiger Metro", category: "group_g", desc: "Đồ họa phẳng, biểu tượng đơn giản và màu giao diện tươi.", kw: ["frutiger metro", "windows 8 flat", "metro ui", "vector human"] },
  { num: 244, id: "synthwave", name: "Synthwave", category: "group_g", desc: "Tím, hồng neon, lưới và tương lai hoài cổ thập niên 1980.", kw: ["synthwave", "neon grid", "80s synth", "outrun", "miami nights"] },
  { num: 245, id: "retrowave", name: "Retrowave", category: "group_g", desc: "Neon, xe thể thao và ánh sáng đêm mang cảm giác tương lai hoài cổ.", kw: ["retrowave", "neon car", "retro sunset", "laser grid"] },
  { num: 246, id: "dreamycore", name: "Dreamycore", category: "group_g", desc: "Hình ảnh mơ màng, màu nhẹ và ánh sáng mềm.", kw: ["dreamycore", "soft glow", "pastel clouds", "dreamy daydream"] },
  { num: 247, id: "ethereal", name: "Ethereal", category: "group_g", desc: "Vẻ đẹp mong manh, siêu thực và trang phục bay bổng.", kw: ["ethereal", "translucent silk", "floating goddess", "celestial aura"] },
  { num: 248, id: "angelic", name: "Angelic", category: "group_g", desc: "Thiên thần, trắng, cánh và phụ kiện sáng.", kw: ["angelic", "white wings", "golden halo", "seraphim", "heavenly light"] },
  { num: 249, id: "heavenly", name: "Heavenly", category: "group_g", desc: "Thiên đường, ánh sáng, mây và hào quang.", kw: ["heavenly", "paradise", "cloud steps", "divine ray"] },
  { num: 250, id: "celestial", name: "Celestial", category: "group_g", desc: "Mặt trăng, mặt trời, sao và thiên thể.", kw: ["celestial", "crescent moon", "sunburst", "zodiac", "starlight"] },
  { num: 251, id: "cosmic", name: "Cosmic", category: "group_g", desc: "Vũ trụ, tinh vân, hành tinh và năng lượng siêu nhiên.", kw: ["cosmic", "supernova", "black hole", "cosmic energy"] },
  { num: 252, id: "mythical", name: "Mythical", category: "group_g", desc: "Nhân vật hoặc sinh vật thần thoại, truyền thuyết.", kw: ["mythical", "legendary beast", "phoenix", "dragon", "griffin"] },
  { num: 253, id: "greek-mythology", name: "Greek Mythology", category: "group_g", desc: "Thần Hy Lạp, áo choàng, nguyệt quế và trang phục cổ đại.", kw: ["greek mythology", "toga", "laurel wreath", "zeus", "athena", "olympus"] },
  { num: 254, id: "egyptian", name: "Egyptian", category: "group_g", desc: "Ai Cập cổ đại, trang sức vàng, khăn đội đầu và biểu tượng thần thoại.", kw: ["egyptian", "pharaoh", "nemes", "ankh", "eye of horus", "gold collar"] },
  { num: 255, id: "viking", name: "Viking", category: "group_g", desc: "Chiến binh Bắc Âu, lông thú, giáp và rìu.", kw: ["viking", "norse", "battleaxe", "fur cape", "valhalla"] },
  { num: 256, id: "samuraicore", name: "Samuraicore", category: "group_g", desc: "Samurai, kiếm Nhật và trang phục chiến binh truyền thống.", kw: ["samuraicore", "katana master", "samurai helmet", "japanese blade"] },
  { num: 257, id: "piratecore", name: "Piratecore", category: "group_g", desc: "Cướp biển, áo khoác, khăn trùm đầu và phụ kiện hàng hải.", kw: ["piratecore", "sea dog", "black sails", "treasure map"] },
  { num: 258, id: "royal-academia", name: "Royal Academia", category: "group_g", desc: "Học thuật pha quý tộc, áo khoác cổ điển và phụ kiện sang trọng.", kw: ["royal academia", "prestigious school", "golden crest blazer"] },
  { num: 259, id: "light-academia-vintage", name: "Light Academia Vintage", category: "group_g", desc: "Học thuật hoài cổ, kem, be, trắng và nâu nhạt.", kw: ["light academia vintage", "classic beige scholar"] },
  { num: 260, id: "dark-vintage", name: "Dark Vintage", category: "group_g", desc: "Thời trang cổ điển với màu tối và phụ kiện hoài cổ.", kw: ["dark vintage", "antique dark", "charcoal retro"] },

  // Nhóm H (261-270)
  { num: 261, id: "old-roblox", name: "Old Roblox", category: "group_h", desc: "Tái hiện avatar, item và hình dáng Roblox thời kỳ cũ.", kw: ["old roblox", "2010 roblox", "2012 roblox", "classic visor", "robloxian 2.0"] },
  { num: 262, id: "2017-style", name: "2017 Style", category: "group_h", desc: "Phối đồ gợi nhớ xu hướng Roblox khoảng năm 2017.", kw: ["2017", "2017 style", "2017 roblox", "shaggy hair 2017"] },
  { num: 263, id: "2018-style", name: "2018 Style", category: "group_h", desc: "Tái hiện thẩm mỹ avatar Roblox giai đoạn 2018.", kw: ["2018", "2018 style", "2018 roblox", "super super happy face"] },
  { num: 264, id: "2020-style", name: "2020 Style", category: "group_h", desc: "Phong cách gợi nhớ xu hướng avatar Roblox khoảng năm 2020.", kw: ["2020", "2020 style", "slender 2020", "softie 2020"] },
  { num: 265, id: "2021-style", name: "2021 Style", category: "group_h", desc: "Aesthetic và xu hướng cộng đồng Roblox năm 2021.", kw: ["2021", "2021 style", "ugc wave 2021", "layered clothes 2021"] },
  { num: 266, id: "2022-style", name: "2022 Style", category: "group_h", desc: "Combo avatar gợi nhớ năm 2022.", kw: ["2022", "2022 style", "y2k revival 2022"] },
  { num: 267, id: "2023-style", name: "2023 Style", category: "group_h", desc: "Phong cách lấy cảm hứng từ xu hướng avatar năm 2023.", kw: ["2023", "2023 style", "acubi 2023", "ugc head 2023"] },
  { num: 268, id: "2024-style", name: "2024 Style", category: "group_h", desc: "Phối đồ gợi nhớ xu hướng avatar Roblox năm 2024.", kw: ["2024", "2024 style", "coquette 2024", "mini plush 2024"] },
  { num: 269, id: "2025-style", name: "2025 Style", category: "group_h", desc: "Phong cách dựa trên xu hướng avatar Roblox năm 2025.", kw: ["2025", "2025 style", "y3k 2025", "hyper ugc"] },
  { num: 270, id: "2026-style", name: "2026 Style", category: "group_h", desc: "Tên gọi chung cho xu hướng avatar Roblox năm 2026, không phải một aesthetic duy nhất.", kw: ["2026", "2026 style", "next-gen roblox", "futuristic trend"] },
];

console.log("Total styles defined:", stylesRaw.length);
if (stylesRaw.length !== 270) {
  throw new Error(`Expected 270 styles, got ${stylesRaw.length}`);
}

const dir = path.join(process.cwd(), "src", "lib", "data");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Generate TS code
const tsCode = `// ===== 270 ROBLOX AVATAR STYLES CATALOG =====
// Auto-generated & verified complete catalog of exactly 270 styles as requested in MASTER PROMPT

export interface AvatarStyleDefinition {
  index: number;
  id: string;
  name: string;
  description: string;
  category: "group_a" | "group_b" | "group_c" | "group_d" | "group_e" | "group_f" | "group_g" | "group_h";
  groups: ("uniqueness" | "humor" | "value" | "theme")[];
  aliases: string[];
  evidence: string[];
  confidenceGuidance: string;
  keywords: string[];
}

export const AVATAR_STYLES_CATALOG: readonly AvatarStyleDefinition[] = [
${stylesRaw.map(s => {
  // Determine criteria groups
  const groups = ["theme"];
  const id = s.id;
  // Uniqueness check
  if ([
    "cyberpunk", "cybercore", "cyber-y2k", "cyber-y3k", "y3k", "techwear", "futuristic", "sci-fi", "steampunk", "mecha", "robot", "alien", "digitalcore", "glitchcore", "webcore", "internetcore", "vaporwave", "synthwave", "retrowave", "frutiger-aero", "frutiger-metro", "spacecore", "galaxycore", "cosmic", "industrial", "neon", "glowcore", "r6core",
    "weirdcore", "dreamcore", "dreamycore", "clowncore", "circuscore", "circus-goth", "morute", "maximalist", "monster", "dark-fantasy", "horror", "cute-gore", "gore", "mythical", "dollcore", "toycore", "plushcore", "retroslop",
    "decora", "harajuku", "visual-kei", "scene", "scenecore", "punk", "alt", "gyaru", "jojifuku", "kawaii", "kidcore", "fairycore", "naturecore", "mushroomcore", "animalcore", "cybergoth", "pastel-goth", "whimsygoth", "boho", "indie", "acubi", "y2k", "mcbling", "blokette", "balletcore", "ethereal", "celestial", "royalcore", "rococo", "lolita-fashion", "fantasy", "cosplay", "anime", "manga", "chibi", "magical-girl", "mermaidcore", "samuraicore",
    "blocky", "neoclassic", "slender", "cnp", "furry", "neko", "catboy", "femboy", "headless", "korblox", "avatar-flex", "guestcore", "baconcore", "retro", "vintage", "heisei-retro", "old-roblox", "2017-style", "2018-style", "2020-style", "2021-style", "2022-style", "2023-style", "2024-style", "2025-style", "2026-style"
  ].includes(id)) {
    groups.push("uniqueness");
  }

  // Humor check
  if ([
    "classic-noob", "modern-noob", "bacon-hair", "guest", "troll", "meme", "silly-goober", "mlg", "goofy", "funny-avatar", "scam-bot", "guestcore", "baconcore", "classic", "old-roblox",
    "od-er", "cnp", "slender", "retroslop", "maximalist", "clowncore", "circuscore", "clown", "toycore", "plushcore", "monster", "zombie",
    "rich", "luxury", "hypebeast", "headless-flex", "korblox-flex", "limited-flex", "avatar-flex", "preppy", "baddie", "barbie", "royal", "princess", "prince", "superhero", "supervillain", "military", "swat", "knight", "samurai", "pirate", "cowboy", "nerd", "geek", "gamer", "e-kid", "e-girl", "e-boy"
  ].includes(id)) {
    groups.push("humor");
  }

  // Value check
  if ([
    "old-money", "luxury", "rich", "chic", "clean-girl", "clean-boy", "minimalist", "academia", "dark-academia", "light-academia", "royal-academia", "light-academia-vintage", "dark-vintage", "vintage", "korean-streetwear", "japanese-streetwear", "acubi", "model", "male-model", "glam", "night-luxe", "celebrity",
    "gothic-romance", "trad-goth", "pastel-goth", "cybergoth", "dark-coquette", "coquette", "dollette", "lolita-fashion", "rococo", "royalcore", "fairycore", "angelcore", "heavenly", "ethereal", "celestial", "fantasy", "dark-fantasy", "greek-mythology", "egyptian", "viking", "samurai", "knight", "medieval", "steampunk", "visual-kei", "gyaru", "decora", "harajuku", "cyberpunk", "techwear", "y3k",
    "headless", "korblox", "korblox-flex", "headless-flex", "limited-flex", "avatar-flex", "hypebeast", "streetwear", "y2k", "dahoodian", "rogangster", "bloxburg", "berry-avenue",
    "streetwear-y2k", "casual", "sporty", "athletic", "skater", "grunge-skater", "indie", "softie", "soft-boy", "soft-girl", "vsco", "country", "schoolcore", "cafe-worker", "bloxburg-mom", "k-pop", "j-pop", "pop-star", "rockstar", "hip-hop", "rapper"
  ].includes(id)) {
    groups.push("value");
  }

  return `  {
    index: ${s.num},
    id: ${JSON.stringify(s.id)},
    name: ${JSON.stringify(s.name)},
    description: ${JSON.stringify(s.desc)},
    category: ${JSON.stringify(s.category)},
    groups: ${JSON.stringify(groups)},
    aliases: [],
    evidence: [],
    confidenceGuidance: "Chỉ nhận diện khi có đủ dấu hiệu thị giác hoặc item metadata phù hợp.",
    keywords: ${JSON.stringify(s.kw)}
  }`;
}).join(",\n")}
];

/** Map tra cứu nhanh theo ID (O(1)) */
export const AVATAR_STYLE_MAP = new Map<string, AvatarStyleDefinition>(
  AVATAR_STYLES_CATALOG.map((s) => [s.id, s])
);

/** Kiểm tra và lấy style theo ID */
export function getStyleById(id: string): AvatarStyleDefinition | undefined {
  return AVATAR_STYLE_MAP.get(id);
}

/** Tổng số lượng style trong Catalog (Phải luôn luôn là 270) */
export const TOTAL_STYLES_COUNT = AVATAR_STYLES_CATALOG.length;
`;

fs.writeFileSync(path.join(dir, "avatarStyles.ts"), tsCode, "utf8");
console.log("Successfully wrote src/lib/data/avatarStyles.ts!");

// Also generate src/lib/data/styleGroups.ts
const groupsCode = `// ===== STYLE GROUPS PER MASTER PROMPT SECTION V =====
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
`;

fs.writeFileSync(path.join(dir, "styleGroups.ts"), groupsCode, "utf8");
console.log("Successfully wrote src/lib/data/styleGroups.ts!");
