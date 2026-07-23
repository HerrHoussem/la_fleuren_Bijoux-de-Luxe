La_Fleuren — Bijoux de Luxe 🌸

La_Fleuren is a bilingual (Arabic / French) online boutique for affordable fashion jewelry and accessories, built for women and girls in Algeria. No gold, no diamonds — just elegant, budget-friendly pieces, ordered directly through the site or via WhatsApp.

🔗 Live site: https://herrhoussem.github.io/la_fleuren_Bijoux-de-Luxe/


<img width="1727" height="740" alt="image" src="https://github.com/user-attachments/assets/9215f554-b76e-42d0-b752-428303a3a389" />
<img width="1843" height="788" alt="image" src="https://github.com/user-attachments/assets/b18b5624-58c1-4352-8a55-0a18ab42cca9" />
<img width="1846" height="770" alt="image" src="https://github.com/user-attachments/assets/22123dfd-cd82-4f08-9e7e-12a1c2ee4bfb" />
<img width="1790" height="702" alt="image" src="https://github.com/user-attachments/assets/0b70f2d6-85f8-44e8-b2c9-d9be5796b315" />
<img width="1827" height="768" alt="image" src="https://github.com/user-attachments/assets/ca0bc98e-09f3-47dc-ad4f-8f4eca0c5cbb" />
<img width="1860" height="743" alt="image" src="https://github.com/user-attachments/assets/b4c4f29b-5307-404d-9df9-bee29157a770" />
<img width="1845" height="782" alt="image" src="https://github.com/user-attachments/assets/c26d5434-c48f-48d8-ba7f-b821777fa479" />


#Features
Entrance splash screen with the brand logo and a "Discover the Collection" call to action
Product catalog with categories, live product counts per category, search, and pagination
Two ways to buy: Add to Cart (multi-item basket) or Buy Now (skips the cart, checks out a single item immediately)
Cart & Wishlist, saved locally in the browser (localStorage) so they persist between visits
Quick View modal — see full product details without leaving the page
Checkout form that writes orders straight into Supabase, with cash-on-delivery in mind
WhatsApp ordering — floating button and dedicated contact section for customers who prefer to order by chat
Dark mode toggle, remembered per visitor
Fully responsive, with a dedicated bottom tab bar for mobile
No build step — plain HTML, CSS, and JavaScript. Open index.html and it runs.


#Project Structure

la_fleuren_Bijoux-de-Luxe/
├── index.html                # Arabic homepage (default site)
├── fr/
│   └── index.html            # French homepage
├── assets/
│   ├── logo-large.png        # Brand logo (wordmark)
│   └── images/
│       ├── hero-card.jpg     # Homepage hero banner
│       └── about-card.jpg    # "About us" contact card
├── admin/
│   └── index.html            # Admin dashboard (products, orders, stats) — password protected
├── supabase-schema.sql       # Base database schema — run ONCE on a fresh Supabase project
├── setup-admin.sql           # Adds stock tracking, descriptions, and admin permissions
├── LICENSE
└── README.md

Made with 🌸 for La_Fleuren.


