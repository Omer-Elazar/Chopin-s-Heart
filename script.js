const START_FRAME_PATH = "assets/intro/1first-frame.png";
const TAKE_ME_FRAME_PATH = "assets/intro/take me.png";

const manualFramePaths = [
  "assets/intro/1 blank.png",
  "assets/intro/1.1 opening.png",

  "assets/intro/2.1 hands go in.png",
  "assets/intro/2.2 hands go in.png",
  "assets/intro/2.3 hands go in.png",
  "assets/intro/2.4 hands go in.png",
  "assets/intro/2.5 hands go in.png",
  "assets/intro/2.6 hands go in.png",
  "assets/intro/2.7 hands go in.png",

  "assets/intro/3.1 throw.png",
  "assets/intro/3.2 throw.png",
  "assets/intro/3.3 throw.png",
  "assets/intro/3.4 throw.png",
  "assets/intro/3.5 throw.png",
  "assets/intro/3.6 throw.png",
  "assets/intro/3.7 throw.png",
  "assets/intro/3.8 throw.png",
  "assets/intro/3.9 throw.png",
  "assets/intro/3.10 throw.png",
  "assets/intro/3.11 throw.png",
  "assets/intro/3.12 throw.png",
  "assets/intro/3.13 throw.png",
  "assets/intro/3.14 throw.png",
  "assets/intro/3.15 throw.png",
  "assets/intro/3.15 throw-1.png",
  "assets/intro/3.16 throw.png",
  "assets/intro/3.17 throw.png",
  "assets/intro/3.18 throw.png",
  "assets/intro/3.19 throw.png"
];

const audioPaths = {
  thunder: "assets/audio/universfield-loud-thunder-192165.mp3",
  heartbeat: "assets/audio/heartbeat.mp3",
  beginMusic: "assets/audio/begin-music.mp3",
  storyMusic: "assets/audio/story-music.mp3",
  gameMusic: "assets/audio/game_music.mp3",
  gameMusicFallback: "assets/audio/game-music.mp3"
};

const audio = {
  thunder: new Audio(encodeURI(audioPaths.thunder)),
  heartbeat: new Audio(encodeURI(audioPaths.heartbeat)),
  beginMusic: new Audio(encodeURI(audioPaths.beginMusic)),
  storyMusic: new Audio(encodeURI(audioPaths.storyMusic)),
  gameMusic: new Audio(encodeURI(audioPaths.gameMusic))
};

const BEGIN_MUSIC_VOLUME = 0.42;
const STORY_MUSIC_VOLUME = 0.34;
const GAME_MUSIC_VOLUME = 0.32;
const THUNDER_VOLUME = 1;
const HEARTBEAT_VOLUME = 1;

const MUSIC_FADE_IN_MS = 1800;
const MUSIC_FADE_OUT_MS = 1600;
const BEGIN_MUSIC_FADE_IN_MS = 700;
const BEGIN_MUSIC_FADE_OUT_MS = 1200;
const BEGIN_FRAME_AFTER_CLICK_HOLD_MS = 4500;

const STORY_MUSIC_START_DELAY_MS = 250;
const STORY_MUSIC_FADE_OUT_MS = 3500;

const GAME_SCREEN_FADE_IN_MS = 3500;
const GAME_MUSIC_FADE_OUT_MS = 3000;

audio.beginMusic.loop = true;
audio.beginMusic.volume = 0;
audio.beginMusic.preload = "auto";

audio.storyMusic.loop = false;
audio.storyMusic.volume = 0;
audio.storyMusic.preload = "auto";

audio.gameMusic.loop = true;
audio.gameMusic.volume = 0;
audio.gameMusic.preload = "auto";

audio.gameMusic.addEventListener("error", () => {
  if (!audio.gameMusic.dataset.fallbackTried && audioPaths.gameMusicFallback) {
    audio.gameMusic.dataset.fallbackTried = "true";
    audio.gameMusic.src = encodeURI(audioPaths.gameMusicFallback);
    audio.gameMusic.load();
  }
});


audio.thunder.loop = false;
audio.thunder.volume = THUNDER_VOLUME;
audio.thunder.preload = "auto";

audio.heartbeat.loop = false;
audio.heartbeat.volume = HEARTBEAT_VOLUME;
audio.heartbeat.playbackRate = 0.8;
audio.heartbeat.preload = "auto";

const audioFadeAnimationIds = new WeakMap();

let beginMusicStarted = false;
let beginMusicStopped = false;
let beginMusicActivatedAt = 0;
let storyMusicStarted = false;
let storyMusicStopped = false;
let storyMusicStartTimer = null;
let gameMusicStarted = false;

const MANUAL_END_CLICK_DELAY_MS = 2600;

// שמירה על חדות ב־fullscreen ובמסכים צפופים, בלי להפוך את ה־canvas לכבד מדי.
const MAX_CANVAS_PIXEL_RATIO = 2;

const lingerMap = {
  "assets/intro/1 blank.png": 7,
  "assets/intro/1.1 opening.png": 4,
  "assets/intro/2.4 hands go in.png": 4,
  "assets/intro/3.2 throw.png": 4,
  "assets/intro/3.14 throw.png": 4,
  "assets/intro/3.19 throw.png": 4
};

const autoplayGroups = [
  {
    fps: 1,
    fade: false,
    holdLastFrameMs: 1700,
    frames: [
      "assets/intro/3.19 throw.png"
    ]
  },
  {
    fps: 1,
    fade: false,
    holdLastFrameMs: 2600,
    frames: [
      "assets/intro/3.19 throw.png"
    ]
  },
  {
    fps: 36,
    fade: false,
    holdLastFrameMs: 80,
    frames: [
      "assets/intro/4.1 steal.png",
      "assets/intro/4.2 steal.png",
      "assets/intro/4.3 steal.png"
    ]
  },
  {
    fps: 10,
    fade: false,
    audioCueByFrame: {
      "assets/intro/4.4 steal.png": "thunder"
    },
    frames: [
      "assets/intro/4.4 steal.png",
      "assets/intro/4.5 steal.png",
      "assets/intro/4.6 steal.png"
    ]
  },
  {
    fps: 7,
    fade: false,
    holdFirstFrameMs: 1500,
    holdLastFrameMs: 1800,
    frames: [
      "assets/intro/4.7 steal.png",
      "assets/intro/4.8 steal.png",
      "assets/intro/4.9 steal.png",
      "assets/intro/4.10 steal.png"
    ]
  },
  {
    fade: true,
    fadeDurationMs: 700,
    holdFrameMs: 1800,
    perFrameHoldMs: {
      "assets/intro/5.1 find me.png": 3000,
      "assets/intro/5.3 find me.png": 2200,
      "assets/intro/5.5 find me.png": 2200,
      "assets/intro/5.7 find me.png": 2200
    },
    preTransition: {
      type: "fade",
      durationMs: 1000,
      targetFrame: "assets/intro/5.1 find me.png"
    },
    audioCueByFrame: {
      "assets/intro/5.2 find me.png": "heartbeat",
      "assets/intro/5.4 find me.png": "heartbeat",
      "assets/intro/5.6 find me.png": "heartbeat"
    },
    frames: [
      "assets/intro/5.1 find me.png",
      "assets/intro/5.2 find me.png",
      "assets/intro/5.3 find me.png",
      "assets/intro/5.4 find me.png",
      "assets/intro/5.5 find me.png",
      "assets/intro/5.6 find me.png",
      "assets/intro/5.7 find me.png"
    ]
  }
];

const manualTimeline = [];

manualFramePaths.forEach((path) => {
  const repeatCount = lingerMap[path] || 1;

  for (let i = 0; i < repeatCount; i++) {
    manualTimeline.push(path);
  }
});

const allFramePaths = [
  ...new Set([
    START_FRAME_PATH,
    TAKE_ME_FRAME_PATH,
    ...manualFramePaths,
    ...autoplayGroups.flatMap((group) => group.frames)
  ])
];

const canvas = document.getElementById("intro-canvas");
const context = canvas.getContext("2d");

const introStage = document.getElementById("intro-stage");
const gameFrame = document.getElementById("game-frame");

const startButton = document.getElementById("start-button");
const continueButton = document.getElementById("continue-button");
const scrollHint = document.getElementById("scroll-hint");

const loadingScreen = document.getElementById("loading-screen");
const loadingBarFill = document.getElementById("loading-bar-fill");
const loadingText = document.getElementById("loading-text");

const images = {};

let loadedCount = 0;
let manualIndex = 0;
let currentPath = manualTimeline[0];

let state = "loading";
// loading | start | manual | waiting-click-delay | waiting-click | autoplay | finished

let wheelLock = false;
let manualEndTimer = null;
let baseFrameRatio = null;

/*
  הכפתורים השקופים יושבים לפי הקואורדינטות של הפריים עצמו,
  לא לפי אחוזים קבועים של החלון.
  ככה הם נשארים על הטקסט גם כשהפריים נחתך/נמתח ב-cover.
*/
const introButtonHotspots = {
  begin: {
    x: 0.436,
    y: 0.649,
    width: 0.127,
    height: 0.109
  },
  takeMe: {
    x: 0.375,
    y: 0.799,
    width: 0.259,
    height: 0.15
  }
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

function getCanvasPixelRatio() {
  return Math.min(window.devicePixelRatio || 1, MAX_CANVAS_PIXEL_RATIO);
}

function safePlay(audioElement) {
  const promise = audioElement.play();

  if (promise && typeof promise.catch === "function") {
    promise.catch(() => {
      // הדפדפן עלול לחסום אודיו עד אינטראקציה של המשתמש.
    });
  }
}

function clamp01(value) {
  return Math.max(0, Math.min(value, 1));
}

function setSafeVolume(audioElement, volume) {
  audioElement.volume = clamp01(volume);
}

function cancelAudioFade(audioElement) {
  const animationId = audioFadeAnimationIds.get(audioElement);

  if (animationId) {
    cancelAnimationFrame(animationId);
    audioFadeAnimationIds.delete(audioElement);
  }
}

function fadeInAudio(audioElement, targetVolume, durationMs, restart = false) {
  cancelAudioFade(audioElement);

  if (restart) {
    audioElement.currentTime = 0;
  }

  setSafeVolume(audioElement, 0);
  safePlay(audioElement);

  const startTime = performance.now();

  function step(now) {
    const progress = clamp01((now - startTime) / durationMs);
    setSafeVolume(audioElement, targetVolume * progress);

    if (progress < 1) {
      const animationId = requestAnimationFrame(step);
      audioFadeAnimationIds.set(audioElement, animationId);
    } else {
      setSafeVolume(audioElement, targetVolume);
      audioFadeAnimationIds.delete(audioElement);
    }
  }

  const animationId = requestAnimationFrame(step);
  audioFadeAnimationIds.set(audioElement, animationId);
}

function fadeOutAudio(audioElement, durationMs, restoreVolume = 1) {
  cancelAudioFade(audioElement);

  return new Promise((resolve) => {
    const startVolume = audioElement.volume;
    const startTime = performance.now();

    function step(now) {
      const progress = clamp01((now - startTime) / durationMs);
      setSafeVolume(audioElement, startVolume * (1 - progress));

      if (progress < 1) {
        const animationId = requestAnimationFrame(step);
        audioFadeAnimationIds.set(audioElement, animationId);
      } else {
        audioElement.pause();
        audioElement.currentTime = 0;
        setSafeVolume(audioElement, restoreVolume);
        audioFadeAnimationIds.delete(audioElement);
        resolve();
      }
    }

    const animationId = requestAnimationFrame(step);
    audioFadeAnimationIds.set(audioElement, animationId);
  });
}

function startBeginMusic() {
  if (beginMusicStopped) return;

  /*
    אם הדפדפן חסם ניסיון קודם, האודיו יכול להישאר paused.
    במקרה כזה לא חוסמים ניסיון חדש אחרי קליק אמיתי.
  */
  if (beginMusicStarted && !audio.beginMusic.paused) return;

  beginMusicStarted = true;
  beginMusicActivatedAt = performance.now();
  fadeInAudio(audio.beginMusic, BEGIN_MUSIC_VOLUME, BEGIN_MUSIC_FADE_IN_MS, true);
}

function stopBeginMusicWithFade() {
  if (beginMusicStopped) return;

  beginMusicStopped = true;
  fadeOutAudio(audio.beginMusic, BEGIN_MUSIC_FADE_OUT_MS, BEGIN_MUSIC_VOLUME);
}

function startStoryMusicOnce() {
  if (storyMusicStarted || storyMusicStopped) return;

  storyMusicStarted = true;

  try {
    audio.storyMusic.currentTime = 0;
  } catch (error) {
    audio.storyMusic.currentTime = 0;
  }

  /*
    מוזיקת הגלילה נכנסת בלי fade,
    שנייה אחרי פריים השסע / 1.1 opening.
  */
  setSafeVolume(audio.storyMusic, STORY_MUSIC_VOLUME);
  safePlay(audio.storyMusic);
}

function scheduleStoryMusicStart() {
  if (storyMusicStarted || storyMusicStopped || storyMusicStartTimer) return;

  storyMusicStartTimer = window.setTimeout(() => {
    storyMusicStartTimer = null;
    startStoryMusicOnce();
  }, STORY_MUSIC_START_DELAY_MS);
}

function stopStoryMusicWithFade() {
  if (storyMusicStartTimer) {
    clearTimeout(storyMusicStartTimer);
    storyMusicStartTimer = null;
  }

  if (storyMusicStopped) return;

  storyMusicStopped = true;
  fadeOutAudio(audio.storyMusic, STORY_MUSIC_FADE_OUT_MS, STORY_MUSIC_VOLUME);
}

function startGameMusicOnce() {
  if (gameMusicStarted) return;

  gameMusicStarted = true;

  try {
    audio.gameMusic.currentTime = 0;
  } catch (error) {
    audio.gameMusic.currentTime = 0;
  }

  /*
    מוזיקת המשחק נכנסת בלי fade,
    ורק אחרי שה-fade של מסך המשחק הסתיים.
  */
  setSafeVolume(audio.gameMusic, GAME_MUSIC_VOLUME);
  safePlay(audio.gameMusic);
}

function stopGameMusicWithFade(durationMs = GAME_MUSIC_FADE_OUT_MS) {
  if (!gameMusicStarted) return;

  fadeOutAudio(audio.gameMusic, durationMs, GAME_MUSIC_VOLUME);
}

window.chopinAudio = {
  stopGameMusicWithFade
};

function startThunder() {
  audio.thunder.currentTime = 0;
  audio.thunder.volume = THUNDER_VOLUME;
  safePlay(audio.thunder);
}

function playHeartbeat() {
  audio.heartbeat.currentTime = 0;
  audio.heartbeat.volume = HEARTBEAT_VOLUME;
  audio.heartbeat.playbackRate = 0.8;
  safePlay(audio.heartbeat);
}

function handleAudioCue(cueName) {
  if (cueName === "thunder") {
    startThunder();
  }

  if (cueName === "heartbeat") {
    playHeartbeat();
  }
}

function stopAudioCue(cueName) {
  if (cueName === "storyMusic") {
    stopStoryMusicWithFade();
  }

  if (cueName === "beginMusic") {
    stopBeginMusicWithFade();
  }
}

function updateLoadingProgress(paths) {
  const progress = Math.round((loadedCount / paths.length) * 100);
  loadingBarFill.style.width = `${progress}%`;
  loadingText.textContent = `${progress}%`;
}

function preloadImages(paths) {
  return Promise.all(
    paths.map((path) => {
      return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => {
          images[path] = img;
          loadedCount++;
          updateLoadingProgress(paths);
          resolve(img);
        };

        img.onerror = () => {
          /*
            לא עוצרים את כל האתר בגלל פריים חסר.
            זה קרה ב-4.0 steal.png: הטעינה נתקעה סביב 98%.
            אם פריים חסר בזמן האנימציה, הקוד פשוט נשאר על הפריים הקודם.
          */
          console.warn(`Missing image, skipping: ${path}`);
          loadedCount++;
          updateLoadingProgress(paths);
          resolve(null);
        };

        img.src = encodeURI(path);
      });
    })
  );
}

function setBaseFrameRatio() {
  const referenceImage =
    images[START_FRAME_PATH] ||
    images[manualTimeline[0]] ||
    Object.values(images)[0];

  if (referenceImage) {
    baseFrameRatio = referenceImage.width / referenceImage.height;
  }
}

function setCanvasSize() {
  const { width, height } = getViewportSize();
  const pixelRatio = getCanvasPixelRatio();

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);

  // כל הציור מכאן והלאה עובד בקואורדינטות CSS רגילות,
  // אבל נשמר חד יותר כי ה־canvas עצמו ברזולוציה גבוהה.
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  if (currentPath) {
    drawFrame(currentPath);
  }

  updateAdaptiveIntroButtons();
}

function clearCanvas() {
  const { width, height } = getViewportSize();

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#000";
  context.fillRect(0, 0, width, height);
}

function getFitRect() {
  const { width: canvasWidth, height: canvasHeight } = getViewportSize();

  const imageRatio = baseFrameRatio || canvasWidth / canvasHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth;
  let drawHeight;
  let offsetX;
  let offsetY;

  /*
    COVER MODE:
    ממלא את כל חלון הדפדפן כדי שלא יהיו bars בצדדים/למעלה/למטה.
    המחיר: אם יחס החלון שונה מיחס הפריימים, יהיה קרופ מינימלי בקצוות.
  */
  if (imageRatio > canvasRatio) {
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * imageRatio;
    offsetX = (canvasWidth - drawWidth) / 2;
    offsetY = 0;
  } else {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imageRatio;
    offsetX = 0;
    offsetY = (canvasHeight - drawHeight) / 2;
  }

  return {
    drawWidth,
    drawHeight,
    offsetX,
    offsetY
  };
}

function positionButtonOnFrame(button, hotspot) {
  if (!button || !hotspot) return;

  const rect = getFitRect();

  button.style.left = `${rect.offsetX + hotspot.x * rect.drawWidth}px`;
  button.style.top = `${rect.offsetY + hotspot.y * rect.drawHeight}px`;
  button.style.width = `${hotspot.width * rect.drawWidth}px`;
  button.style.height = `${hotspot.height * rect.drawHeight}px`;
  button.style.transform = "none";
}

function updateAdaptiveIntroButtons() {
  positionButtonOnFrame(startButton, introButtonHotspots.begin);
  positionButtonOnFrame(continueButton, introButtonHotspots.takeMe);
}

function drawImageToCanvas(img, alpha = 1) {
  const rect = getFitRect();

  context.save();
  context.globalAlpha = alpha;
  context.drawImage(
    img,
    rect.offsetX,
    rect.offsetY,
    rect.drawWidth,
    rect.drawHeight
  );
  context.restore();

  return rect;
}

function drawFrame(path) {
  const img = images[path];
  if (!img) return;

  currentPath = path;
  clearCanvas();
  drawImageToCanvas(img, 1);
  updateAdaptiveIntroButtons();
}

function drawBlend(fromPath, toPath, progress) {
  const fromImg = images[fromPath];
  const toImg = images[toPath];

  if (!fromImg || !toImg) return;

  /*
    FADE OUT OVER NEXT FRAME:
    הפריים הבא מצויר מאחורה ב־100%.
    הפריים הנוכחי מצויר מעליו, ואז יורד בהדרגה ל־0%.
    זה מונע את ההבהוב/ההכהיה שנוצרת כששני פריימים יושבים
    יחד על רקע שחור בשקיפויות חלקיות.
  */
  clearCanvas();
  drawImageToCanvas(toImg, 1);
  drawImageToCanvas(fromImg, 1 - progress);
}

function fadeBetween(fromPath, toPath, duration) {
  return new Promise((resolve) => {
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);

      drawBlend(fromPath, toPath, progress);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        drawFrame(toPath);
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

function blackWipeFromBottom(fromPath, toPath, duration) {
  return new Promise((resolve) => {
    const fromImg = images[fromPath];
    const toImg = images[toPath];

    if (!fromImg || !toImg) {
      resolve();
      return;
    }

    const rect = getFitRect();
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);

      clearCanvas();
      drawImageToCanvas(fromImg, 1);

      const wipeHeight = rect.drawHeight * progress;
      const wipeY = rect.offsetY + rect.drawHeight - wipeHeight;

      context.save();
      context.fillStyle = "#000";
      context.fillRect(rect.offsetX, wipeY, rect.drawWidth, wipeHeight);
      context.restore();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        drawFrame(toPath);
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

async function startIntro(event) {
  if (event && typeof event.stopPropagation === "function") {
    event.stopPropagation();
  }

  if (state !== "start") return;

  /*
    לחיצה על BEGIN היא היחידה שמקדמת למסך הבא.
    אם המוזיקה כבר הופעלה קודם בלחיצה על המסך, לא מאתחלים אותה מחדש.
  */
  const beginMusicWasAlreadyPlaying = beginMusicStarted && !audio.beginMusic.paused;
  startBeginMusic();

  state = "manual";
  manualIndex = 0;

  startButton.classList.add("ui-hidden");
  scrollHint.classList.add("ui-hidden");

  const elapsedSinceMusicStart = beginMusicWasAlreadyPlaying && beginMusicActivatedAt
    ? performance.now() - beginMusicActivatedAt
    : 0;

  const remainingFirstFrameHold = Math.max(
    0,
    BEGIN_FRAME_AFTER_CLICK_HOLD_MS - elapsedSinceMusicStart
  );

  if (remainingFirstFrameHold > 0) {
    await wait(remainingFirstFrameHold);
  }

  stopBeginMusicWithFade();

  await fadeBetween(START_FRAME_PATH, manualTimeline[0], 900);
  scrollHint.classList.remove("ui-hidden");
  updateManualFrame();
}

function updateManualFrame() {
  const path = manualTimeline[manualIndex];
  drawFrame(path);

  if (!(manualIndex === manualTimeline.length - 1 && path === "assets/intro/3.19 throw.png")) {
    }

  if (path === "assets/intro/1.1 opening.png") {
    scheduleStoryMusicStart();
  }

  if (manualIndex > 0) {
    scrollHint.classList.add("ui-hidden");
  } else if (state === "manual") {
    scrollHint.classList.remove("ui-hidden");
  }

  if (manualIndex === manualTimeline.length - 1) {
    state = "waiting-click-delay";

    scrollHint.classList.add("ui-hidden");
    continueButton.classList.add("ui-hidden");

    if (manualEndTimer) {
      clearTimeout(manualEndTimer);
    }

    manualEndTimer = setTimeout(() => {
      if (state === "waiting-click-delay") {
        state = "waiting-click";
        drawFrame(TAKE_ME_FRAME_PATH);
        continueButton.classList.remove("ui-hidden");
      }
    }, MANUAL_END_CLICK_DELAY_MS);
  }
}

function nextManualFrame() {
  if (state !== "manual") return;

  if (manualIndex < manualTimeline.length - 1) {
    manualIndex++;
    updateManualFrame();
  }
}

function previousManualFrame() {
  if (state !== "manual") return;

  if (manualIndex > 0) {
    manualIndex--;
    updateManualFrame();
  }
}

function onWheel(event) {
  event.preventDefault();

  if (state !== "manual") return;
  if (wheelLock) return;

  wheelLock = true;

  if (event.deltaY > 0) {
    nextManualFrame();
  } else if (event.deltaY < 0) {
    previousManualFrame();
  }

  setTimeout(() => {
    wheelLock = false;
  }, 55);
}

async function playGroupWithoutFade(group) {
  const frameDuration = 1000 / group.fps;

  for (let i = 0; i < group.frames.length; i++) {
    const path = group.frames[i];

    drawFrame(path);

    if (group.audioCueByFrame && group.audioCueByFrame[path]) {
      handleAudioCue(group.audioCueByFrame[path]);
    }

    const isFirst = i === 0;
    const isLast = i === group.frames.length - 1;

    if (isFirst && group.holdFirstFrameMs) {
      await wait(group.holdFirstFrameMs);
      continue;
    }

    if (isLast && group.holdLastFrameMs) {
      await wait(group.holdLastFrameMs);
      continue;
    }

    await wait(frameDuration);
  }
}

async function playGroupWithFade(group) {
  const defaultHoldFrameMs = group.holdFrameMs ?? 0;
  const fadeDurationMs = group.fadeDurationMs ?? 1000;
  const frames = group.frames;

  if (!frames.length) return;

  if (group.audioCueByFrame && group.audioCueByFrame[frames[0]]) {
    handleAudioCue(group.audioCueByFrame[frames[0]]);
  }

  if (group.preTransition && group.preTransition.type === "blackWipeFromBottom") {
    await blackWipeFromBottom(
      currentPath,
      group.preTransition.targetFrame,
      group.preTransition.durationMs
    );
  } else if (group.preTransition && group.preTransition.type === "fade") {
    await fadeBetween(
      currentPath,
      group.preTransition.targetFrame,
      group.preTransition.durationMs
    );
  } else {
    drawFrame(frames[0]);
  }

  await wait(group.perFrameHoldMs?.[frames[0]] ?? defaultHoldFrameMs);

  for (let i = 1; i < frames.length; i++) {
    if (group.audioCueByFrame && group.audioCueByFrame[frames[i]]) {
      handleAudioCue(group.audioCueByFrame[frames[i]]);
    }

    if (fadeDurationMs > 0) {
      await fadeBetween(frames[i - 1], frames[i], fadeDurationMs);
    } else {
      drawFrame(frames[i]);
    }

    await wait(group.perFrameHoldMs?.[frames[i]] ?? defaultHoldFrameMs);
  }

  currentPath = frames[frames.length - 1];
}

async function runAutoplay() {
  for (const group of autoplayGroups) {
    if (group.fade) {
      await playGroupWithFade(group);
    } else {
      await playGroupWithoutFade(group);
    }
  }
}

async function startAutoplay() {
  if (state !== "waiting-click") return;

  state = "autoplay";
  continueButton.classList.add("ui-hidden");
  stopStoryMusicWithFade();

  await runAutoplay();
  finishIntro();
}

function finishIntro() {
  state = "finished";

  const gameFadeInMs = GAME_SCREEN_FADE_IN_MS;

  /*
    קרוס-פייד למסך המשחק:
    אין fade-out נפרד של ה-intro לשחור.
    המשחק עולה מעל הפריים האחרון, ורק אחרי שהוא מלא מסתירים את ה-intro.
  */
  gameFrame.classList.remove("visible");
  gameFrame.style.zIndex = "3";
  gameFrame.style.transition = `opacity ${gameFadeInMs}ms ease`;

  introStage.style.transition = "none";
  introStage.style.opacity = "1";

  requestAnimationFrame(() => {
    gameFrame.classList.add("visible");

    window.setTimeout(() => {
      introStage.classList.add("hidden");
      introStage.style.pointerEvents = "none";

      startGameMusicOnce();
    }, gameFadeInMs);
  });
}

window.addEventListener("resize", setCanvasSize);

window.addEventListener("wheel", onWheel, {
  passive: false
});

/*
  לחיצה על כל מסך ה-FIRST-FRAME מפעילה רק את המוזיקה.
  התקדמות למסך הבא מתבצעת רק בלחיצה על BEGIN.
*/
introStage.addEventListener("pointerdown", (event) => {
  if (state !== "start") return;

  if (event.target === startButton) {
    return;
  }

  startBeginMusic();
});

startButton.addEventListener("pointerdown", startIntro);
startButton.addEventListener("click", startIntro);
continueButton.addEventListener("click", startAutoplay);

window.addEventListener(
  "touchmove",
  (event) => {
    event.preventDefault();
  },
  { passive: false }
);

preloadImages(allFramePaths)
  .then(() => {
    setBaseFrameRatio();
    setCanvasSize();
    drawFrame(START_FRAME_PATH);

    state = "start";

    startButton.classList.remove("ui-hidden");
    scrollHint.classList.add("ui-hidden");
    continueButton.classList.add("ui-hidden");
  
    loadingScreen.classList.add("hidden");
  })
  .catch((error) => {
    console.error(error);
    loadingText.textContent = "שגיאה בטעינת הפריימים";
  });
