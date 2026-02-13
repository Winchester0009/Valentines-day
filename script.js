// Valentine bouquet generator – Single Random Unique GIF version

const nameInput = document.getElementById("name-input");
const generateBtn = document.getElementById("generate-btn");
const downloadBtn = document.getElementById("download-btn");
const canvas = document.getElementById("bouquet-canvas");
const ctx = canvas.getContext("2d");
const valentineMessage = document.getElementById("valentine-message");
const musicToggle = document.getElementById("music-toggle");
const bgMusic = document.getElementById("bg-music");

// --- CONFIGURATION ---
// Set this to the total number of GIF files you have (e.g., 10 means you have 1.gif through 10.gif)
const TOTAL_AVAILABLE_GIFS = 10; 
// ---------------------

/**
 * Clear canvas with a night gradient background and small starry dots.
 */
function clearCanvas() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#02080f");
  gradient.addColorStop(0.5, "#041521");
  gradient.addColorStop(1, "#071c20");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Star-like dots
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = "#4af2ff";
  for (let i = 0; i < 70; i++) {
    const sx = Math.random() * canvas.width;
    const sy = Math.random() * (canvas.height * 0.6);
    const r = Math.random() * 1.4;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Get normalized name.
 */
function normalizeName(raw) {
  const trimmed = raw.trim();
  return { displayName: trimmed };
}

/**
 * Cache bouquet image as data URL keyed by name.
 */
function cacheBouquet(name, dataUrl) {
  if (!name) return;
  try {
    const key = `valentine_bouquet_${name.toLowerCase()}`;
    localStorage.setItem(key, dataUrl);
  } catch (e) {
    // Ignore storage errors
  }
}

function getCachedBouquet(name) {
  if (!name) return null;
  try {
    const key = `valentine_bouquet_${name.toLowerCase()}`;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * GIF Pool Management: Get available GIFs and mark them as used.
 */
function getAvailableGifs() {
  let usedGifs = JSON.parse(localStorage.getItem('used_valentine_gifs') || '[]');
  let available = [];
  
  for(let i = 1; i <= TOTAL_AVAILABLE_GIFS; i++) {
    const gifName = `${i}.gif`;
    if(!usedGifs.includes(gifName)) {
      available.push(gifName);
    }
  }

  // If all GIFs have been used, reset the pool so the app doesn't break
  if (available.length === 0) {
    console.log("All unique GIFs used! Resetting the pool.");
    usedGifs = [];
    localStorage.setItem('used_valentine_gifs', JSON.stringify([]));
    for(let i = 1; i <= TOTAL_AVAILABLE_GIFS; i++) {
      available.push(`${i}.gif`);
    }
  }
  
  return available;
}

function markGifAsUsed(gifName) {
  let usedGifs = JSON.parse(localStorage.getItem('used_valentine_gifs') || '[]');
  if(!usedGifs.includes(gifName)) {
    usedGifs.push(gifName);
    localStorage.setItem('used_valentine_gifs', JSON.stringify(usedGifs));
  }
}

/**
 * Draw a single random unique bouquet GIF for the user.
 */
function drawRandomBouquet(displayName, onComplete) {
  clearCanvas();
  
  // Pick a random unused GIF
  const availableGifs = getAvailableGifs();
  const randomIndex = Math.floor(Math.random() * availableGifs.length);
  const selectedGif = availableGifs[randomIndex];
  console.log(`Assigned ${selectedGif} to ${displayName}`);

  const centerX = canvas.width / 2;
  const baseYGlow = canvas.height * 0.84;

  // Draw Bouquet base glow + ribbon
  ctx.save();
  const baseGradient = ctx.createRadialGradient(
    centerX, baseYGlow, 5, centerX, baseYGlow, 70
  );
  baseGradient.addColorStop(0, "rgba(255, 75, 110, 0.85)");
  baseGradient.addColorStop(1, "rgba(255, 75, 110, 0)");
  ctx.fillStyle = baseGradient;
  ctx.beginPath();
  ctx.arc(centerX, baseYGlow, 70, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 18;
  ctx.shadowColor = "#ff4b6e";
  ctx.fillStyle = "#ff4b6e";
  ctx.strokeStyle = "#ff99c8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(centerX - 55, baseYGlow - 10, 110, 22, 12);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX - 10, baseYGlow + 10);
  ctx.lineTo(centerX - 40, baseYGlow + 40);
  ctx.lineTo(centerX - 20, baseYGlow + 26);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(centerX + 10, baseYGlow + 10);
  ctx.lineTo(centerX + 40, baseYGlow + 40);
  ctx.lineTo(centerX + 20, baseYGlow + 26);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Load and draw the specific GIF
  const img = new Image();
  img.onload = () => {
    // Calculate dimensions to fit the canvas nicely
    const targetHeight = canvas.height * 0.6;
    const aspect = img.naturalWidth / img.naturalHeight;
    let h = targetHeight;
    let w = h * aspect;

    // Position it resting on the ribbon
    const x = centerX - w / 2;
    const y = baseYGlow - h + 15; 
    
    ctx.drawImage(img, x, y, w, h);
    
    // Mark as used only after successful load
    markGifAsUsed(selectedGif);
    
    if (onComplete) onComplete();
  };
  
  img.onerror = () => {
    ctx.fillStyle = "#a7ffee";
    ctx.font = "18px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Missing file: ${selectedGif}`, centerX, canvas.height / 2);
    if (onComplete) onComplete();
  };
  
  img.src = selectedGif;
}

/**
 * Generate bouquet logic.
 */
function generateBouquet() {
  const rawName = nameInput.value;
  const { displayName } = normalizeName(rawName);

  if (!displayName) {
    valentineMessage.textContent = "Please enter a name to create a bouquet.";
    downloadBtn.disabled = true;
    clearCanvas();
    return;
  }

  // Check if we already generated a bouquet for this specific name
  const existing = getCachedBouquet(displayName);
  if (existing) {
    // If yes, load the same one back up
    loadImageOntoCanvas(existing);
    valentineMessage.textContent = `Happy Valentine’s Day, ${displayName}!`;
    downloadBtn.disabled = false;
  } else {
    // If no, create a brand new random one
    drawRandomBouquet(displayName, () => {
      const dataUrl = canvas.toDataURL("image/png");
      cacheBouquet(displayName, dataUrl);
      valentineMessage.textContent = `Happy Valentine’s Day, ${displayName}!`;
      downloadBtn.disabled = false;
    });
  }
}

/**
 * Load an image data URL back into the canvas.
 */
function loadImageOntoCanvas(dataUrl) {
  const img = new Image();
  img.onload = () => {
    clearCanvas();
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  img.src = dataUrl;
}

/**
 * Download current canvas as PNG.
 */
function downloadBouquet() {
  const rawName = nameInput.value;
  const { displayName } = normalizeName(rawName);

  if (!displayName) return;

  const link = document.createElement("a");
  const safeName = displayName.replace(/[^a-z0-9]+/gi, "_");
  link.download = `Valentines_Flower_${safeName}.png`;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Toggle soft background music.
 */
function toggleMusic() {
  const isPlaying = !bgMusic.paused;
  if (isPlaying) {
    bgMusic.pause();
    musicToggle.setAttribute("aria-pressed", "false");
    musicToggle.textContent = "Enable soft background music";
  } else {
    bgMusic
      .play()
      .then(() => {
        musicToggle.setAttribute("aria-pressed", "true");
        musicToggle.textContent = "Disable soft background music";
      })
      .catch(() => {
        // Autoplay blocked handling
      });
  }
}

// Initial state
clearCanvas();

// Event listeners
generateBtn.addEventListener("click", generateBouquet);

nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    generateBouquet();
  }
});

downloadBtn.addEventListener("click", downloadBouquet);
musicToggle.addEventListener("click", toggleMusic);