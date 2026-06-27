// Catalog products for The Trend Store
// Mapped to high-fidelity design resources and Unsplash fashion assets
// Includes 15 detailed products spanning clothing, accessories, and footwear

const PRODUCTS = [
    {
        id: 1,
        name: "Indigo Denim Jacket",
        category: "Men's Fashion",
        price: 89.99,
        originalPrice: 120.00,
        image: "https://i.ibb.co/qtXLRWF/Gemini-Generated-Image-j23ma4j23ma4j23m.png",
        description: "A timeless classic crafted from premium heavyweight denim with reinforced stitch detailing. Features a relaxed fit suitable for effortless layering in neutral sand tones.",
        featured: true
    },
    {
        id: 2,
        name: "Sand Knit Sweater",
        category: "Women's Fashion",
        price: 69.99,
        originalPrice: 95.00,
        image: "https://i.ibb.co/Tq7wqvvL/Chat-GPT-Image-Mar-1-2026-08-36-55-PM.png",
        description: "Soft, textured knitwear designed with a premium cotton-wool blend. Its warm sand tone offers a high-contrast pairing with indigo and slate gray accessories.",
        featured: true
    },
    {
        id: 3,
        name: "Classic Leather Tote",
        category: "Accessories",
        price: 129.99,
        originalPrice: 180.00,
        image: "https://i.ibb.co/DPMkRYP0/Chat-GPT-Image-Mar-1-2026-08-38-10-PM.png",
        description: "Constructed from vegetable-tanned full-grain leather. Built with spacious compartments and premium metallic zip accents that age beautifully with use.",
        featured: true
    },
    {
        id: 4,
        name: "Trench Coat",
        category: "Women's Fashion",
        price: 149.99,
        originalPrice: 220.00,
        image: "https://i.ibb.co/9mjsKS0c/Chat-GPT-Image-Mar-1-2026-08-39-19-PM.png",
        description: "The ultimate layering outerwear. Modern tailoring meets classic weatherproof gabardine fabric. Complete with adjustable storm flaps and an elegant waist belt.",
        featured: true
    },
    {
        id: 5,
        name: "Desert Suede Boots",
        category: "Footwear",
        price: 119.99,
        originalPrice: 160.00,
        image: "https://i.ibb.co/G4x07yGc/Chat-GPT-Image-Mar-1-2026-08-41-54-PM.png",
        description: "Handcrafted from durable split-suede leather with a flexible crepe rubber sole. Offers structured support and casual style for urban environments.",
        featured: true
    },
    {
        id: 6,
        name: "Linen Blend Shirt",
        category: "Men's Fashion",
        price: 49.99,
        originalPrice: 75.00,
        image: "https://i.ibb.co/LDfLtVWf/Chat-GPT-Image-Mar-1-2026-08-42-48-PM.png",
        description: "An airy, breathable blend of linen and fine organic cotton. Styled with a clean band collar, flat seams, and mother-of-pearl buttons for standard premium finish.",
        featured: true
    },
    {
        id: 7,
        name: "Oversized Knit Hoodie",
        category: "Men's Fashion",
        price: 59.99,
        originalPrice: 85.00,
        image: "https://images.unsplash.com/photo-1505022610485-0249ba5b3675?q=80&w=600&auto=format&fit=crop",
        description: "Crafted from heavy loopback organic cotton. Tailored with drop shoulders, side rib details, and double-lined hood for premium everyday warmth and structure.",
        featured: false
    },
    {
        id: 8,
        name: "Ribbed Knit Dress",
        category: "Women's Fashion",
        price: 79.99,
        originalPrice: 110.00,
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop",
        description: "An elegant, body-skimming ribbed knit midi dress. Designed with a clean mock neck and subtle side slit for a sophisticated yet effortless casual silhouette.",
        featured: false
    },
    {
        id: 9,
        name: "Minimalist Leather Wallet",
        category: "Accessories",
        price: 39.99,
        originalPrice: 55.00,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
        description: "Sleek card holder made of hand-stitched full grain leather. Features RFID blocking linings, four card slots, and a central notes pocket to keep bulk to a minimum.",
        featured: false
    },
    {
        id: 10,
        name: "Canvas Duffle Bag",
        category: "Accessories",
        price: 99.99,
        originalPrice: 140.00,
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
        description: "Durable water-repellent canvas weekend duffle. Complete with full-grain leather handle grips, detachable shoulder strap, and steel zip dividers.",
        featured: false
    },
    {
        id: 11,
        name: "Classic Suede Sneakers",
        category: "Footwear",
        price: 89.99,
        originalPrice: 120.00,
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop",
        description: "Low-top retro silhouette with split suede paneling and vulcanized rubber sole. Pairs perfectly with denim for an elevated casual weekend look.",
        featured: false
    },
    {
        id: 12,
        name: "Suede Chelsea Boots",
        category: "Footwear",
        price: 139.99,
        originalPrice: 190.00,
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop",
        description: "Hand-finished suede boots with elasticated side gussets and pull tabs. Features structured cork insoles that adapt to your foot shape with wear.",
        featured: false
    },
    {
        id: 13,
        name: "Chronograph Watch",
        category: "Accessories",
        price: 159.99,
        originalPrice: 230.00,
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600&auto=format&fit=crop",
        description: "A striking watch with Japanese quartz movement, black steel casing, and dark brown leather strap. Water resistant up to 50 meters.",
        featured: false
    },
    {
        id: 14,
        name: "Tortoise Sunglasses",
        category: "Accessories",
        price: 29.99,
        originalPrice: 45.00,
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop",
        description: "Hand-polished acetate sunglasses with brown lenses. Provides complete UV400 protection and a classic shape suited for all face structures.",
        featured: false
    },
    {
        id: 15,
        name: "Merino Wool Beanie",
        category: "Accessories",
        price: 24.99,
        originalPrice: 35.00,
        image: "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?q=80&w=600&auto=format&fit=crop",
        description: "Knit from extra-fine 100% merino wool for itch-free insulation. Finished with a double-folded brim and breathable ribbed structure.",
        featured: false
    }
];
