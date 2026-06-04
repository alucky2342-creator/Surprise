const screens = {
  welcome: document.getElementById("welcomeScreen"),
  loading: document.getElementById("loadingScreen"),
  main: document.getElementById("mainScreen"),
  memory: document.getElementById("memoryScreen"),
  special: document.getElementById("specialScreen"),
  final: document.getElementById("finalScreen"),
  catalog: document.getElementById("catalogScreen")
};

const bgMusic = document.getElementById("bgMusic");
const loadingText = document.getElementById("loadingText");
const slideImage = document.getElementById("slideImage");
const caption = document.getElementById("caption");
const musicToggle = document.getElementById("musicToggle");

const photos = [
  "assets/photos/photo1.jpeg",
  "assets/photos/photo2.jpeg",
  "assets/photos/photo3.jpeg",
  "assets/photos/photo4.jpeg",
  "assets/photos/photo5.jpeg"
];

const captions = [
  "A memory I will always keep.",
  "One of my favorite moments.",
  "This picture carries so many smiles.",
  "A beautiful memory with a beautiful person.",
  "Some memories never fade."
];

let currentSlide = 0;
let webAudioContext = null;
let melodyTimer = null;
let musicEnabled = false;

function showScreen(screenName) {
  if (screenName !== "catalog") {
    stopWarmCatalog();
  }

  Object.values(screens).forEach(screen => screen.classList.remove("active"));
  screens[screenName].classList.add("active");

  if (screenName === "catalog") {
    setTimeout(startWarmCatalog, 50);
  }
}

function showWelcome() {
  showScreen("welcome");
}

function showMain() {
  showScreen("main");
}

function startSurprise() {
  startMusic();
  showScreen("loading");

  const lines = [
    "Collecting our memories...",
    "Adding smiles...",
    "Wrapping your surprise...",
    "Adding a little magic...",
    "Almost ready..."
  ];

  let index = 0;
  loadingText.textContent = lines[index];

  const textInterval = setInterval(() => {
    index += 1;

    if (index < lines.length) {
      loadingText.textContent = lines[index];
    } else {
      clearInterval(textInterval);
      setTimeout(() => showScreen("main"), 900);
    }
  }, 1050);
}

function startMusic() {
  bgMusic.volume = 0.45;

  bgMusic.play()
    .then(() => {
      musicEnabled = true;
      musicToggle.textContent = "♪";
    })
    .catch(() => {
      startSoftGeneratedMusic();
    });
}

function startSoftGeneratedMusic() {
  try {
    if (!webAudioContext) {
      webAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (melodyTimer) return;

    const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.00, 698.46];
    let step = 0;
    musicEnabled = true;
    musicToggle.textContent = "♪";

    melodyTimer = setInterval(() => {
      if (!musicEnabled || !webAudioContext) return;

      const oscillator = webAudioContext.createOscillator();
      const gain = webAudioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = notes[step % notes.length];

      gain.gain.setValueAtTime(0.0001, webAudioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.055, webAudioContext.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, webAudioContext.currentTime + 0.75);

      oscillator.connect(gain);
      gain.connect(webAudioContext.destination);

      oscillator.start();
      oscillator.stop(webAudioContext.currentTime + 0.8);
      step += 1;
    }, 900);
  } catch (error) {
    console.log("Music fallback unavailable:", error);
  }
}

function toggleMusic() {
  if (musicEnabled) {
    bgMusic.pause();
    musicEnabled = false;
    musicToggle.textContent = "×";
  } else {
    startMusic();
  }
}

function showMemories() {
  updateSlide();
  showScreen("memory");
}

function updateSlide() {
  slideImage.src = photos[currentSlide];
  caption.textContent = captions[currentSlide];
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % photos.length;
  updateSlide();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + photos.length) % photos.length;
  updateSlide();
}

setInterval(() => {
  if (screens.memory.classList.contains("active")) nextSlide();
}, 3000);

function showSpecialSection() {
  showScreen("special");
}

function showFinalMessage() {
  showScreen("final");
}

function showCatalog() {
  showScreen("catalog");
  startWarmCatalog();
  launchConfetti();
}

function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#ff6fae", "#d946ef", "#facc15", "#fb7185", "#a78bfa", "#38bdf8", "#ffffff"];
  const confetti = [];

  for (let i = 0; i < 190; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 8 + 4,
      speed: Math.random() * 4 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 10 - 5,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  let animationFrame;
  const endTime = Date.now() + 6200;

  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confetti.forEach(piece => {
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate((piece.rotation * Math.PI) / 180);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
      ctx.restore();

      piece.y += piece.speed;
      piece.rotation += piece.rotationSpeed;

      if (piece.y > canvas.height) {
        piece.y = -20;
        piece.x = Math.random() * canvas.width;
      }
    });

    if (Date.now() < endTime) {
      animationFrame = requestAnimationFrame(drawConfetti);
    } else {
      cancelAnimationFrame(animationFrame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  drawConfetti();
}

window.addEventListener("resize", () => {
  const canvas = document.getElementById("confettiCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});


/* Guaranteed JS-controlled photo catalog rotation */
let catalogRotationFrame = null;
let catalogRotationAngle = 0;

function startWarmCatalog() {
  const carousel = document.getElementById("catalogCarousel");
  if (!carousel) return;

  if (catalogRotationFrame) {
    cancelAnimationFrame(catalogRotationFrame);
    catalogRotationFrame = null;
  }

  let lastTime = performance.now();

  function rotateCatalog(now) {
    const delta = now - lastTime;
    lastTime = now;

    // Smooth visible rotation speed
    catalogRotationAngle -= delta * 0.025;
    carousel.style.transform = `rotateY(${catalogRotationAngle}deg)`;

    if (screens.catalog && screens.catalog.classList.contains("active")) {
      catalogRotationFrame = requestAnimationFrame(rotateCatalog);
    }
  }

  catalogRotationFrame = requestAnimationFrame(rotateCatalog);
}

function stopWarmCatalog() {
  if (catalogRotationFrame) {
    cancelAnimationFrame(catalogRotationFrame);
    catalogRotationFrame = null;
  }
}


/* Warm photo catalog module - reliable replacement for 3D rotation */
const catalogPhotos = [
  "assets/photos/photo1.svg",
  "assets/photos/photo2.svg",
  "assets/photos/photo3.svg",
  "assets/photos/photo4.svg",
  "assets/photos/photo5.svg"
];

const catalogCaptions = [
  "Every picture has a memory, and every memory has you in it 💖",
  "A little moment, a big smile, and a memory worth keeping ✨",
  "Some memories feel warm forever 🌸",
  "This photo carries a beautiful feeling 💫",
  "A special memory for a special person 💕"
];

let currentCatalogPhoto = 0;
let warmCatalogTimer = null;

function getCatalogPhotoSources() {
  const thumbImages = Array.from(document.querySelectorAll(".warm-thumb img"));
  return thumbImages.map(img => img.getAttribute("src")).filter(Boolean);
}

function fixFeaturedPhotoFromThumbs() {
  const featuredImage = document.getElementById("catalogFeaturedImage");
  const sources = getCatalogPhotoSources();

  if (featuredImage && sources.length > 0) {
    featuredImage.onerror = null;
    featuredImage.src = sources[currentCatalogPhoto] || sources[0];
  }
}

function showCatalogPhoto(index) {
  const featuredImage = document.getElementById("catalogFeaturedImage");
  const catalogCaption = document.getElementById("catalogWarmCaption");
  const thumbnails = document.querySelectorAll(".warm-thumb");
  const sources = getCatalogPhotoSources();

  if (!featuredImage || !catalogCaption || sources.length === 0) return;

  currentCatalogPhoto = (index + sources.length) % sources.length;

  featuredImage.onerror = fixFeaturedPhotoFromThumbs;
  featuredImage.classList.remove("warm-photo-change");
  void featuredImage.offsetWidth;

  featuredImage.src = sources[currentCatalogPhoto];
  featuredImage.classList.add("warm-photo-change");

  catalogCaption.textContent = catalogCaptions[currentCatalogPhoto] || catalogCaptions[0];

  thumbnails.forEach((thumb, thumbIndex) => {
    thumb.classList.toggle("active-thumb", thumbIndex === currentCatalogPhoto);
  });
}

function nextCatalogPhoto() {
  showCatalogPhoto(currentCatalogPhoto + 1);
}

function startWarmCatalog() {
  fixFeaturedPhotoFromThumbs();
  showCatalogPhoto(currentCatalogPhoto);

  if (warmCatalogTimer) {
    clearInterval(warmCatalogTimer);
  }

  warmCatalogTimer = setInterval(() => {
    if (screens.catalog && screens.catalog.classList.contains("active")) {
      nextCatalogPhoto();
    }
  }, 2600);
}

function stopWarmCatalog() {
  if (warmCatalogTimer) {
    clearInterval(warmCatalogTimer);
    warmCatalogTimer = null;
  }
}