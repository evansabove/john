import './style.css';

// We instruct Vite to find anything in the photos directory
const originalModules = import.meta.glob('../photos/*.{jpg,jpeg,png,gif,HEIC,heic,webp}', { eager: true, query: '?url', import: 'default' });

// We also load the lightweight thumbnails side-by-side
const thumbnailModules = import.meta.glob('../photos/thumbnails/*.webp', { eager: true, query: '?url', import: 'default' });

// We link the large original file with its tiny thumbnail by pairing their base names
const photoItems = Object.keys(originalModules).map(key => {
  const originalUrl = originalModules[key];
  
  // Extract filename without extension (e.g. '../photos/img_001.jpg' -> 'img_001')
  const filenameStr = key.split('/').pop();
  const baseName = filenameStr.replace(/\.[^/.]+$/, "");
  
  // Form the expected path of the thumbnail
  const thumbKey = `../photos/thumbnails/${baseName}.webp`;
  
  // If the thumbnail exists, use it. If not, fallback perfectly to the original image just in case
  const thumbnailUrl = thumbnailModules[thumbKey] || originalUrl; 
  
  return { originalUrl, thumbnailUrl };
});

function initGallery() {
  const photoGrid = document.getElementById('photo-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  if (photoItems.length === 0) {
    photoGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; opacity: 0.7; padding-top: 10vh;">
        <p style="font-size: 1.2rem; margin-bottom: 1rem;">No photos found yet.</p>
        <p style="font-size: 0.95rem; line-height: 1.5;">Please ensure your photos are inside <br> <code style="color: var(--accent-gold); background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px;">c:\\Projects\\john\\photos</code></p>
        <p style="font-size: 0.85rem; margin-top: 2rem; opacity: 0.6;">(If you just added them, restart the Vite server!)</p>
      </div>`;
    return;
  }

  // Generate a grid tile using the THUMBNAIL url, keeping it lightning fast
  photoGrid.innerHTML = photoItems.map((item) => `
    <div class="photo-grid-item">
      <!-- Image 'src' is the tiny thumbnail. Data attribute securely stores the massive original path -->
      <img src="${item.thumbnailUrl}" alt="Memory of John" loading="lazy" data-original="${item.originalUrl}">
    </div>
  `).join('');

  // Lightbox click interactions
  const gridItems = document.querySelectorAll('.photo-grid-item img');
  
  gridItems.forEach(img => {
    img.addEventListener('click', (e) => {
      // Set the lightbox image source to the massive ORIGINAL file only when clicked!
      const targetOriginal = e.target.getAttribute('data-original');
      lightboxImg.src = targetOriginal;
      lightbox.classList.add('active');
    });
  });

  // Lightbox close functionality
  function closeLightbox() {
    lightbox.classList.remove('active');
    // Clear out the image source after the fade-out transition so it doesn't flicker on next open
    setTimeout(() => {
      lightboxImg.src = '';
    }, 300);
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

document.addEventListener('DOMContentLoaded', initGallery);
