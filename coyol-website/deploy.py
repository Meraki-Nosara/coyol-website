
import os
import requests
import json

# --- Configuration ---
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
REPO_OWNER = "Meraki-Nosara"
REPO_NAME = "coyol-website"
BRANCH = "main"
COMMIT_MESSAGE = "Fix: Correctly link hero and nav buttons; update WhatsApp button color"

# --- File Contents ---
nnavigation_astro_content = """
---
const navLinks = [
  { href: '/#home', label: 'Home' },
  { href: '/#dining', label: 'Family' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/homesites', label: 'Real Estate' },
  { href: '/#contact', label: 'Contact' },
];
---

<!-- Restaurant redirect banner -->
<div id="restaurant-banner" class="fixed top-0 left-0 right-0 z-50 bg-landrover-keswick text-white text-center py-2 px-4 text-sm">
  <span>Looking for <a href="https://coyolrestaurant.com" target="_blank" class="underline hover:text-landrover-sand">coyolrestaurant.com</a>?</span>
</div>

<nav id="navbar" class="fixed left-0 right-0 z-50 transition-all duration-300" style="top: 36px;">
  <div class="max-w-7xl mx-auto px-6 lg:px-8">
    <div class="flex items-center justify-between h-20">
      <!-- Logo -->
      <a href="/" class="flex items-center gap-3">
        <img 
          src="/images/logo-coyol.png" 
          alt="Coyol Real Estate" 
          class="h-12 w-auto transition-all duration-300"
          id="logo-img"
        />
        <span class="text-xl font-serif font-semibold text-white tracking-widest transition-colors duration-300 hidden sm:block" id="logo-text">
          COYOL
        </span>
      </a>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-8">
        {navLinks.map((link) => (
          <a 
            href={link.href}
            class="nav-link text-xs font-medium text-white/90 hover:text-white transition-colors duration-200 tracking-[0.2em] uppercase"
          >
            {link.label}
          </a>
        ))}
      </div>

      <!-- Mobile Menu Button -->
      <button 
        id="mobile-menu-btn"
        class="md:hidden p-2 text-white"
        aria-label="Open menu"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Mobile Menu -->
  <div id="mobile-menu" class="hidden md:hidden bg-landrover-keswick/95 backdrop-blur-md">
    <div class="px-6 py-4 space-y-4">
      {navLinks.map((link) => (
        <a 
          href={link.href}
          class="block text-base font-medium text-white/90 hover:text-white transition-colors py-2 tracking-wider"
        >
          {link.label}
        </a>
      ))}
    </div>
  </div>
</nav>

<script>
  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  const logoText = document.getElementById('logo-text');
  const logoImg = document.getElementById('logo-img');
  const navLinks = document.querySelectorAll('.nav-link');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      navbar?.classList.add('bg-landrover-limestone/95', 'backdrop-blur-md', 'shadow-sm');
      logoText?.classList.remove('text-white');
      logoText?.classList.add('text-landrover-keswick');
      logoImg?.classList.add('brightness-0');
      navLinks.forEach(link => {
        link.classList.remove('text-white/90', 'hover:text-white');
        link.classList.add('text-landrover-keswick/80', 'hover:text-landrover-keswick');
      });
    } else {
      navbar?.classList.remove('bg-landrover-limestone/95', 'backdrop-blur-md', 'shadow-sm');
      logoText?.classList.add('text-white');
      logoText?.classList.remove('text-landrover-keswick');
      logoImg?.classList.remove('brightness-0');
      navLinks.forEach(link => {
        link.classList.add('text-white/90', 'hover:text-white');
        link.classList.remove('text-landrover-keswick/80', 'hover:text-landrover-keswick');
      });
    }
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  mobileMenuBtn?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('hidden');
  });

  // Close mobile menu on link click
  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu?.classList.add('hidden');
    });
  });
</script>
"""

layout_astro_content = """
---
import { ViewTransitions } from 'astro:transitions';

interface Props {
  title: string;
  description?: string;
}

const { title, description = "Luxury homes and jungle homesites in Nosara, Costa Rica — the world's only Blue Zone beach town. Private developments with ocean views, world-class amenities, and a lifestyle rooted in nature." } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/favicon-large.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <meta name="generator" content={Astro.generator} />
    
    <!-- Open Graph -->
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://coyolnosara.com/images/og-image.jpg" />
    <meta property="og:url" content="https://coyolnosara.com" />
    <meta property="og:site_name" content="Coyol Nosara" />
    <meta property="og:locale" content="en_US" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content="https://coyolnosara.com/images/og-image.jpg" />
    
    <!-- SEO -->
    <meta name="keywords" content="Nosara real estate, Costa Rica luxury homes, Blue Zone property, Guiones beach homes, Nosara homesites, Mar Azul development, Nosara Hills, Los Coyoles, jungle homes Costa Rica, ocean view lots Nosara, Nicoya Peninsula real estate, expat homes Costa Rica, surf town property" />
    <link rel="canonical" href="https://coyolnosara.com" />
    <meta name="robots" content="index, follow" />
    <meta name="author" content="Coyol Real Estate" />
    <meta name="geo.region" content="CR-G" />
    <meta name="geo.placename" content="Nosara" />
    
    <title>{title}</title>
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "Coyol Real Estate",
      "description": "Luxury homes and jungle homesites in Nosara, Costa Rica — the world's only Blue Zone beach town",
      "url": "https://coyolnosara.com",
      "telephone": "+1-818-401-8068",
      "email": "info@coyolnosara.com",
      "image": "https://coyolnosara.com/images/og-image.jpg",
      "sameAs": [
        "https://www.instagram.com/coyolnosara"
      ],
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Nosara",
        "addressRegion": "Guanacaste",
        "addressCountry": "CR"
      },
      "areaServed": "Nosara, Costa Rica",
      "priceRange": "$180,000 - $7,000,000"
    }
    </script>
  </head>
  <body class="bg-landrover-alaska text-landrover-santorini antialiased">
    <slot />
    
    <!-- Floating WhatsApp Button -->
    <a 
      href="https://wa.me/18184018068?text=Hi%2C%20I'm%20interested%20in%20Coyol%20properties%20in%20Nosara"
      target="_blank"
      rel="noopener noreferrer"
      class="fixed bottom-6 right-6 z-50 bg-[#C4A67C] text-landrover-santorini p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      aria-label="Chat on WhatsApp"
    >
      <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span class="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-gray-800 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
        Chat with us
      </span>
    </a>
    
    <!-- Vercel Analytics -->
    <script>
      import { inject } from '@vercel/analytics';
      inject();
    </script>
    
    <!-- Custom Event Tracking -->
    <script>
      // Track clicks on important elements
      document.addEventListener('DOMContentLoaded', () => {
        // Track CTA clicks
        document.querySelectorAll('a[href*="whatsapp"], a[href*="tel:"], a[href*="mailto:"]').forEach(el => {
          el.addEventListener('click', () => {
            if (window.va) window.va('event', { name: 'contact_click', data: { type: el.getAttribute('href')?.split(':')[0] } });
          });
        });
        
        // Track property/development clicks
        document.querySelectorAll('a[href*="/homesites"]').forEach(el => {
          el.addEventListener('click', () => {
            if (window.va) window.va('event', { name: 'property_click', data: { page: el.getAttribute('href') } });
          });
        });
        
        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
          const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
          if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            if ([25, 50, 75, 100].includes(scrollPercent)) {
              if (window.va) window.va('event', { name: 'scroll_depth', data: { percent: scrollPercent } });
            }
          }
        });
      });
    </script>
  </body>
</html>

<style is:global>
  @import '../styles/global.css';
</style>
"""

hero_astro_content = """
---
---

<section id="home" class="relative h-screen min-h-[700px]">
  <!-- Fixed Video Background with Parallax -->
  <div id="hero-video-container" class="fixed inset-0 w-full h-screen z-0">
    <!-- Video (same for desktop/mobile, responsive via object-cover) -->
    <video 
      id="hero-video"
      autoplay 
      muted 
      loop 
      playsinline
      poster="/video/poster-1.jpg"
      class="w-full h-full object-cover"
    >
      <source src="/video/mar-azul-1.mp4" type="video/mp4" />
    </video>
    
    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40"></div>
    
    <!-- Sound Toggle Button -->
    <button 
      id="sound-toggle"
      class="absolute bottom-24 right-6 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all backdrop-blur-sm"
      aria-label="Toggle sound"
    >
      <svg id="sound-off-icon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
      </svg>
      <svg id="sound-on-icon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    </button>
  </div>

  <!-- Content (scrolls normally) -->
  <div class="relative z-10 h-full flex items-center justify-center">
    <div class="max-w-5xl mx-auto px-6 text-center">
      <p class="text-white/80 text-sm md:text-base tracking-[0.3em] uppercase mb-6 animate-fade-in-up opacity-0" style="animation-delay: 0.2s;">
        Nosara, Costa Rica · Blue Zone Living
      </p>
      
      <h1 class="font-serif text-4xl md:text-6xl lg:text-7xl text-white font-medium leading-tight mb-8 text-shadow animate-fade-in-up opacity-0" style="animation-delay: 0.4s;">
        Where Land Meets Legacy
      </h1>
      
      <p class="text-white/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12 animate-fade-in-up opacity-0" style="animation-delay: 0.6s;">
        From the creators of La Luna, Coyol Restaurant, and Esh. A new way of living, 
        shaped by decades of hospitality and rooted in Costa Rica's most magical coast.
      </p>
      
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up opacity-0" style="animation-delay: 0.8s;">
        <a 
          href="/homesites" 
          class="btn-elegant bg-landrover-sand text-landrover-santorini px-8 py-4 text-sm font-medium tracking-wider uppercase hover:opacity-90 transition-opacity"
        >
          View Homesites
        </a>
        <a 
          href="/#dining" 
          class="border border-white/60 text-white px-8 py-4 text-sm font-medium tracking-wider uppercase hover:bg-white/10 transition-colors"
        >
          Our Restaurants
        </a>
      </div>
    </div>
  </div>

  <!-- Scroll indicator -->
  <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
    <svg class="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  </div>
</section>

<!-- Spacer to allow content to scroll over video -->
<div id="hero-spacer" class="h-0"></div>

<script>
  // Video stays fixed, content scrolls over it
  const videoContainer = document.getElementById('hero-video-container');
  const heroSection = document.getElementById('home');
  const video = document.getElementById('hero-video') as HTMLVideoElement;
  const soundToggle = document.getElementById('sound-toggle');
  const soundOffIcon = document.getElementById('sound-off-icon');
  const soundOnIcon = document.getElementById('sound-on-icon');
  
  let ticking = false;
  
  // Sound toggle functionality
  soundToggle?.addEventListener('click', () => {
    if (video.muted) {
      video.muted = false;
      soundOffIcon?.classList.add('hidden');
      soundOnIcon?.classList.remove('hidden');
    } else {
      video.muted = true;
      soundOffIcon?.classList.remove('hidden');
      soundOnIcon?.classList.add('hidden');
    }
  });
  
  function updateParallax() {
    const scrollY = window.scrollY;
    const heroHeight = heroSection.offsetHeight;
    
    // Fade out video as user scrolls
    if (scrollY < heroHeight) {
      const opacity = 1 - (scrollY / heroHeight) * 0.7;
      videoContainer.style.opacity = Math.max(0.3, opacity);
    }
    
    // Hide video container completely when scrolled well past hero
    if (scrollY > heroHeight * 1.2) {
      videoContainer.style.visibility = 'hidden';
      // Mute when not visible to save resources
      if (!video.muted) {
        video.muted = true;
        soundOffIcon?.classList.remove('hidden');
        soundOnIcon?.classList.add('hidden');
      }
    } else {
      videoContainer.style.visibility = 'visible';
    }
    
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });
  
  // Initial call
  updateParallax();
</script>
"""

FILES_TO_COMMIT = [
    {"path": "src/components/Navigation.astro", "content": nnavigation_astro_content},
    {"path": "src/layouts/Layout.astro", "content": layout_astro_content},
    {"path": "src/components/Hero.astro", "content": hero_astro_content}
]
# --- Helper Functions ---
def github_api_request(method, url, **kwargs):
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
    }
    return requests.request(method, f"https://api.github.com{url}", headers=headers, **kwargs)

# --- Main Script ---
try:
    # Step 1: Get the latest commit SHA of the branch
    ref_response = github_api_request("GET", f"/repos/{REPO_OWNER}/{REPO_NAME}/git/refs/heads/{BRANCH}")
    ref_response.raise_for_status()
    latest_commit_sha = ref_response.json()["object"]["sha"]
    print(f"Latest commit SHA: {latest_commit_sha}")

    # Step 2: Get the tree SHA of the latest commit
    commit_response = github_api_request("GET", f"/repos/{REPO_OWNER}/{REPO_NAME}/git/commits/{latest_commit_sha}")
    commit_response.raise_for_status()
    base_tree_sha = commit_response.json()["tree"]["sha"]
    print(f"Base tree SHA: {base_tree_sha}")

    # Step 3: Create blobs for each file to be committed
    blobs = []
    for file_info in FILES_TO_COMMIT:
        blob_response = github_api_request("POST", f"/repos/{REPO_OWNER}/{REPO_NAME}/git/blobs", json={"content": file_info["content"], "encoding": "utf-8"})
        blob_response.raise_for_status()
        blob_sha = blob_response.json()["sha"]
        blobs.append({"path": file_info["path"], "mode": "100644", "type": "blob", "sha": blob_sha})
    print(f"Created {len(blobs)} blobs.")

    # Step 4: Create a new tree with the new blobs
    tree_response = github_api_request("POST", f"/repos/{REPO_OWNER}/{REPO_NAME}/git/trees", json={"base_tree": base_tree_sha, "tree": blobs})
    tree_response.raise_for_status()
    new_tree_sha = tree_response.json()["sha"]
    print(f"New tree SHA: {new_tree_sha}")

    # Step 5: Create a new commit with the new tree
    new_commit_response = github_api_request("POST", f"/repos/{REPO_OWNER}/{REPO_NAME}/git/commits", json={"message": COMMIT_MESSAGE, "tree": new_tree_sha, "parents": [latest_commit_sha]})
    new_commit_response.raise_for_status()
    new_commit_sha = new_commit_response.json()["sha"]
    print(f"New commit SHA: {new_commit_sha}")

    # Step 6: Update the branch reference to point to the new commit ("push")
    update_ref_response = github_api_request("PATCH", f"/repos/{REPO_OWNER}/{REPO_NAME}/git/refs/heads/{BRANCH}", json={"sha": new_commit_sha})
    update_ref_response.raise_for_status()
    print(f"Successfully pushed commit {new_commit_sha} to branch {BRANCH}.")

except requests.exceptions.RequestException as e:
    print(f"An error occurred: {e}")
    if e.response is not None:
        print(f"Response body: {e.response.text}")
