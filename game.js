const gameRooms = [
  {
    id: "apartment",
    title: "47 Nowy Świat Apartment",
    year: "1850",
    shortTitle: "Apartment",
    image: "assets/game/rooms/47 Nowy Swait Apartment all-closed-grain 1.png",
    objectPosition: "center center",
    gridArea: "apartment"
  },
  {
    id: "garrison",
    title: "The German Garrison Headquarters",
    year: "1944–1945",
    shortTitle: "German Garrison",
    image: "assets/game/rooms/The German Garrison Headquarters all-closed 5.png",
    objectPosition: "center center",
    gridArea: "garrison"
  },
  {
    id: "sanctuary",
    title: "The Holy Cross Sanctuary",
    year: "",
    shortTitle: "Sanctuary",
    image: "assets/game/rooms/The Holy Cross Sanctuary all-closed.png",
    objectPosition: "center center",
    gridArea: "sanctuary"
  },
  {
    id: "ruins",
    title: "The Church Ruins",
    year: "",
    shortTitle: "Church Ruins",
    image: "assets/game/rooms/The Church Ruins all-closed 4(1).png",
    objectPosition: "center center",
    gridArea: "ruins"
  },
  {
    id: "crypt",
    title: "The Holy Cross Crypt",
    year: "",
    shortTitle: "Crypt",
    image: "assets/game/rooms/The Holy Cross Crypt all-closed 7.png",
    objectPosition: "center center",
    gridArea: "crypt"
  }
];

const progressJarPaths = {
  empty: "assets/game/ui/jar-empty 1.png",
  filled: "assets/game/ui/jar+heart 1.png"
};


const completedRoomVisuals = {
  blackFrame: "assets/game/completion/completed-room-black.png",
  apartment: "assets/game/completion/completion-apartment.png",
  garrison: "assets/game/completion/completion-garrison.png",
  sanctuary: "assets/game/completion/completion-sanctuary.png",
  ruins: "assets/game/completion/completion-ruins.png",
  crypt: "assets/game/completion/completion-crypt.png"
};

const endingFramePaths = [
  "assets/ending/6.1 ending.png",
  "assets/ending/6.2 ending.png",
  "assets/ending/6.3 ending.png",
  "assets/ending/6.4 ending.png",
  "assets/ending/6.5 ending.png",
  "assets/ending/6.6 ending.png",
  "assets/ending/6.7 ending.png",
  "assets/ending/6.8 ending.png",
  "assets/ending/6.9 ending.png"
];

const endingHoldMsByFrame = {
  "assets/ending/6.1 ending.png": 3000,
  "assets/ending/6.2 ending.png": 5000,
  "assets/ending/6.3 ending.png": 500,
  "assets/ending/6.4 ending.png": 5000,
  "assets/ending/6.5 ending.png": 500,
  "assets/ending/6.6 ending.png": 5000,
  "assets/ending/6.7 ending.png": 3000,
  "assets/ending/6.8 ending.png": 3000
};

const GAME_TO_ENDING_FADE_MS = 4200;
const START_OVER_FADE_OUT_MS = 1200;
const HEART_FLY_ANIMATION_MS = 520;
const FLYING_HEART_ASSET_PATH = "assets/game/ui/heart 3.png";

const endingAudioPaths = {
  finale: "assets/audio/finale_music.mp3",
  flashlightOn: "assets/audio/flashlight-on.mp3",
  flashlightOff: "assets/audio/flashlight-off.mp3",
  whispers: "assets/audio/whispers-new.mp3",
  beforeWhisper: "assets/audio/before-whisper.mp3",
  glassDing: "assets/audio/glass-ding.mp3"
};

const endingAudio = {
  finale: new Audio(encodeURI(endingAudioPaths.finale)),
  flashlightOn: new Audio(encodeURI(endingAudioPaths.flashlightOn)),
  flashlightOff: new Audio(encodeURI(endingAudioPaths.flashlightOff)),
  whispers: new Audio(encodeURI(endingAudioPaths.whispers)),
  beforeWhisper: new Audio(encodeURI(endingAudioPaths.beforeWhisper)),
  glassDing: new Audio(encodeURI(endingAudioPaths.glassDing))
};

endingAudio.finale.loop = false;
endingAudio.finale.volume = 0.45;
endingAudio.finale.preload = "auto";

endingAudio.flashlightOn.loop = false;
endingAudio.flashlightOn.volume = 1;
endingAudio.flashlightOn.preload = "auto";

endingAudio.flashlightOff.loop = false;
endingAudio.flashlightOff.volume = 0.8;
endingAudio.flashlightOff.preload = "auto";

endingAudio.whispers.loop = true;
endingAudio.whispers.volume = 0.045;
endingAudio.whispers.preload = "auto";

endingAudio.beforeWhisper.loop = true;
endingAudio.beforeWhisper.volume = 0.28;
endingAudio.beforeWhisper.preload = "auto";

endingAudio.glassDing.loop = false;
endingAudio.glassDing.volume = 0.9;
endingAudio.glassDing.preload = "auto";

const ENDING_FIRST_FRAME_FADE_MS = 900;
const ENDING_FRAME_FADE_MS = 900;

const endingRestartHotspot = {
  x: 0.398,
  y: 0.779,
  width: 0.203,
  height: 0.121
};

const completedRooms = new Set();

/*
  GRID layout only.
  No absolute positioning and no contain, so rooms keep their positions and no bars appear.
*/
const FIXED_GRID_AREAS = `
  "apartment apartment garrison sanctuary"
  "ruins crypt crypt sanctuary"
`;

const ROOM_TRANSITION_MS = 820;
const ROOM_COMPLETION_DELAY_MS = 800;

let activeRoomId = "apartment";
let isRoomTransitioning = false;
const roomsPendingCompletion = new Set();

const roomsBoard = document.getElementById("rooms-board");
const gameTitle = document.getElementById("game-title");
let progressBarElement = document.getElementById("progress-bar");

function ensureEndingElements() {
  let stage = document.getElementById("ending-stage");
  let canvas = document.getElementById("ending-canvas");
  let restartButton = document.getElementById("ending-restart-button");

  /*
    הגנה למקרה שהוחלף רק game.js ולא עודכן index.html:
    אם שכבת הסיום לא קיימת ב-HTML, המשחק יוצר אותה לבד.
  */
  if (!stage) {
    stage = document.createElement("div");
    stage.id = "ending-stage";
    stage.className = "ui-hidden";
    stage.setAttribute("aria-label", "Ending animation");

    canvas = document.createElement("canvas");
    canvas.id = "ending-canvas";

    restartButton = document.createElement("button");
    restartButton.id = "ending-restart-button";
    restartButton.className = "ui-hidden";
    restartButton.type = "button";
    restartButton.setAttribute("aria-label", "Start Over");

    stage.appendChild(canvas);
    stage.appendChild(restartButton);

    const app = document.getElementById("app") || document.body;
    app.appendChild(stage);
  }

  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "ending-canvas";
    stage.appendChild(canvas);
  }

  if (!restartButton) {
    restartButton = document.createElement("button");
    restartButton.id = "ending-restart-button";
    restartButton.className = "ui-hidden";
    restartButton.type = "button";
    restartButton.setAttribute("aria-label", "Start Over");
    stage.appendChild(restartButton);
  }

  return {
    stage,
    canvas,
    context: canvas.getContext("2d"),
    restartButton
  };
}

const endingElements = ensureEndingElements();
const endingStage = endingElements.stage;
const endingCanvas = endingElements.canvas;
const endingContext = endingElements.context;
const endingRestartButton = endingElements.restartButton;

/* =========================
   ROOM FRAME / OBJECT LOGIC
========================= */

const roomStates = {};
const completedRoomOrder = [];

const endingImages = {};
let endingBaseFrameRatio = 16 / 9;
let endingCurrentPath = null;
let endingIsRunning = false;
let finalJarGlowTimer = null;

const roomInteractions = {
  apartment: {
    closedFrame: "assets/game/rooms/47 Nowy Swait Apartment all-closed-grain 1.png",

    objects: [
      {
        id: "big-drawer",
        label: "Lower left cabinet door",
        openFrame: "assets/game/rooms/47 Nowy Swait Apartment big-drawer-grain 1.png",
        hotspot: {
          x: 0.415,
          y: 0.49,
          width: 0.18,
          height: 0.255
        }
      },
      {
        id: "chair",
        label: "Piano bench",
        openFrame: "assets/game/rooms/47 Nowy Swait Apartment chair-grain 1.png",
        hotspot: {
          x: 0.055,
          y: 0.565,
          width: 0.38,
          height: 0.29
        },
        heartHotspot: {
          x: 0.155,
          y: 0.63,
          width: 0.06,
          height: 0.09
        }
      },
      {
        id: "drawer1",
        label: "Middle drawer",
        openFrame: "assets/game/rooms/47 Nowy Swait Apartment drawer1-grain 1.png",
        hotspot: {
          x: 0.555,
          y: 0.355,
          width: 0.175,
          height: 0.15
        }
      },
      {
        id: "far-box",
        label: "Wall box",
        openFrame: "assets/game/rooms/47 Nowy Swait Apartment far-box-grain 1.png",
        hotspot: {
          x: 0.81,
          y: 0.155,
          width: 0.155,
          height: 0.255
        }
      }
    ]
  },

  sanctuary: {
    closedFrame: "assets/game/rooms/The Holy Cross Sanctuary all-closed.png",

    objects: [
      {
        id: "altar",
        label: "Altar niche",
        openFrame: "assets/game/rooms/The Holy Cross Sanctuary altar.png",
        hotspot: {
          x: 0.884,
          y: 0.166,
          width: 0.112,
          height: 0.14
        }
      },
      {
        id: "side-cabinet",
        label: "Side cabinet",
        openFrame: "assets/game/rooms/The Holy Cross Sanctuary side-cabinet.png",
        hotspot: {
          x: 0.09,
          y: 0.47,
          width: 0.19,
          height: 0.12
        }
      },
      {
        id: "lectern",
        label: "Black lectern cabinet",
        openFrame: "assets/game/rooms/The Holy Cross Sanctuary lectern.png",
        hotspot: {
          x: 0.59,
          y: 0.43,
          width: 0.15,
          height: 0.335
        }
      },
      {
        id: "pew-box",
        label: "Small box on pew",
        openFrame: "assets/game/rooms/The Holy Cross Sanctuary pew-box.png",
        hotspot: {
          x: 0.252,
          y: 0.69,
          width: 0.086,
          height: 0.115
        }
      },
      {
        id: "pillar-heart",
        label: "Pillar compartment",
        openFrame: "assets/game/rooms/The Holy Cross Sanctuary pillar-heart.png",
        hotspot: {
          x: 0.398,
          y: 0.458,
          width: 0.125,
          height: 0.155
        },
        heartHotspot: {
          x: 0.434,
          y: 0.468,
          width: 0.07,
          height: 0.125
        }
      }
    ]
  },

  ruins: {
    closedFrame: "assets/game/rooms/The Church Ruins all-closed 4(1).png",

    objects: [
      {
        id: "box",
        label: "Wooden crate",
        openFrame: "assets/game/rooms/The Church Ruins box 1.png",
        hotspot: {
          x: 0.61,
          y: 0.655,
          width: 0.18,
          height: 0.275
        }
      },
      {
        id: "small-window",
        label: "Small wall cabinet",
        openFrame: "assets/game/rooms/The Church Ruins small-window 1.png",
        hotspot: {
          x: 0.535,
          y: 0.38,
          width: 0.12,
          height: 0.17
        }
      },
      {
        id: "wall",
        label: "Loose wall stone",
        openFrame: "assets/game/rooms/The Church Ruins wall 1.png",
        hotspot: {
          x: 0.675,
          y: 0.42,
          width: 0.105,
          height: 0.18
        },
        heartHotspot: {
          x: 0.696,
          y: 0.415,
          width: 0.066,
          height: 0.145
        }
      },
      {
        id: "window",
        label: "Wall shrine",
        openFrame: "assets/game/rooms/The Church Ruins window 1.png",
        hotspot: {
          x: 0.235,
          y: 0.235,
          width: 0.145,
          height: 0.32
        }
      }
    ]
  },

  crypt: {
    closedFrame: "assets/game/rooms/The Holy Cross Crypt all-closed 7.png",

    objects: [
      {
        id: "shelf-box",
        label: "Black chest on shelf",
        openFrame: "assets/game/rooms/The Holy Cross Crypt black-box 1.png",
        hotspot: {
          x: 0.55,
          y: 0.456,
          width: 0.086,
          height: 0.06
        }
      },
      {
        id: "cabinet",
        label: "Lower shelf cabinet",
        openFrame: "assets/game/rooms/The Holy Cross Crypt cabinet 3.png",
        hotspot: {
          x: 0.534,
          y: 0.519,
          width: 0.132,
          height: 0.103
        },
        heartHotspot: {
          x: 0.61,
          y: 0.525,
          width: 0.062,
          height: 0.135
        }
      },
      {
        id: "coffin",
        label: "Stone coffin",
        openFrame: "assets/game/rooms/The Holy Cross Crypt sarcophagus 1.png",
        hotspot: {
          x: 0.085,
          y: 0.345,
          width: 0.45,
          height: 0.41
        }
      },
      {
        id: "crate",
        label: "Wooden crate",
        openFrame: "assets/game/rooms/The Holy Cross Crypt wooden-box.png",
        hotspot: {
          x: 0.76,
          y: 0.425,
          width: 0.175,
          height: 0.265
        }
      }
    ]
  },

  garrison: {
    closedFrame: "assets/game/rooms/The German Garrison Headquarters all-closed 5.png",

    objects: [
      {
        id: "cabinet",
        label: "Lower left cabinet",
        openFrame: "assets/game/rooms/The German Garrison Headquarters cabinet 1.png",
        hotspot: {
          x: 0.005,
          y: 0.445,
          width: 0.285,
          height: 0.34
        },
        heartHotspot: {
          x: 0.115,
          y: 0.54,
          width: 0.08,
          height: 0.18
        }
      },
      {
        id: "safe",
        label: "Wall safe",
        openFrame: "assets/game/rooms/The German Garrison Headquarters safe-empty 1.png",
        hotspot: {
          x: 0.57,
          y: 0.145,
          width: 0.125,
          height: 0.245
        }
      },
      {
        id: "drawer1",
        label: "Right cabinet drawer",
        openFrame: "assets/game/rooms/The German Garrison Headquarters drawer1 1.png",
        hotspot: {
          x: 0.805,
          y: 0.47,
          width: 0.15,
          height: 0.155
        }
      },
      {
        id: "drawer2",
        label: "Left cabinet drawer",
        openFrame: "assets/game/rooms/The German Garrison Headquarters drawer2 1.png",
        hotspot: {
          x: 0.705,
          y: 0.47,
          width: 0.145,
          height: 0.155
        }
      }
    ]
  }
};

function getRoomState(roomId) {
  if (!roomStates[roomId]) {
    roomStates[roomId] = {
      openObjectId: null
    };
  }

  return roomStates[roomId];
}

function getRoomInteraction(roomId) {
  return roomInteractions[roomId] || null;
}

function getRoomPanel(roomId) {
  if (!roomsBoard) return null;

  return roomsBoard.querySelector(`[data-room-id="${roomId}"]`);
}

function getRoomImage(roomId) {
  const panel = getRoomPanel(roomId);
  if (!panel) return null;

  return panel.querySelector(".room-image");
}

function setRoomFrame(roomId, framePath) {
  const image = getRoomImage(roomId);
  if (!image || !framePath) return;

  image.src = encodeURI(framePath);
}

function getCompletionBackdropImage(roomId) {
  const panel = getRoomPanel(roomId);
  if (!panel) return null;

  return panel.querySelector(".room-completion-backdrop");
}

function getCompletionOverlayImage(roomId) {
  const panel = getRoomPanel(roomId);
  if (!panel) return null;

  return panel.querySelector(".room-completion-overlay");
}

function refreshCompletedRoomVisual(roomId) {
  const panel = getRoomPanel(roomId);
  const backdrop = getCompletionBackdropImage(roomId);
  const overlay = getCompletionOverlayImage(roomId);

  if (!panel) return;

  if (backdrop && !backdrop.getAttribute("src")) {
    backdrop.src = encodeURI(completedRoomVisuals.blackFrame);
  }

  if (overlay && completedRoomVisuals[roomId]) {
    overlay.src = encodeURI(completedRoomVisuals[roomId]);
  }

  const isCompleted = completedRooms.has(roomId);
  const shouldShowText = isCompleted && activeRoomId === roomId;

  panel.classList.toggle("show-completion-text", shouldShowText);

  if (!isCompleted && overlay) {
    overlay.removeAttribute("src");
  }
}

function refreshAllCompletedRoomVisuals() {
  gameRooms.forEach((room) => refreshCompletedRoomVisual(room.id));
}

function closeRoomObject(roomId) {
  const interaction = getRoomInteraction(roomId);
  const state = getRoomState(roomId);

  if (!interaction) return;

  state.openObjectId = null;

  if (completedRooms.has(roomId)) {
    refreshCompletedRoomVisual(roomId);
    return;
  }

  setRoomFrame(roomId, interaction.closedFrame);
}

function openRoomObject(roomId, objectId) {
  const interaction = getRoomInteraction(roomId);
  const state = getRoomState(roomId);

  if (!interaction) return;

  const object = interaction.objects.find((item) => item.id === objectId);
  if (!object) return;

  state.openObjectId = objectId;

  if (completedRooms.has(roomId)) {
    refreshCompletedRoomVisual(roomId);
    return;
  }

  setRoomFrame(roomId, object.openFrame);
}

function getOpenObject(roomId) {
  const interaction = getRoomInteraction(roomId);
  const state = getRoomState(roomId);

  if (!interaction || !state.openObjectId) return null;

  return interaction.objects.find((item) => item.id === state.openObjectId) || null;
}

function getImagePointFromClick(event, image) {
  const rect = image.getBoundingClientRect();

  const naturalWidth = image.naturalWidth || 1;
  const naturalHeight = image.naturalHeight || 1;

  const renderedWidth = rect.width;
  const renderedHeight = rect.height;

  const imageRatio = naturalWidth / naturalHeight;
  const boxRatio = renderedWidth / renderedHeight;

  let drawnWidth;
  let drawnHeight;
  let offsetX;
  let offsetY;

  if (imageRatio > boxRatio) {
    drawnHeight = renderedHeight;
    drawnWidth = renderedHeight * imageRatio;
    offsetX = (renderedWidth - drawnWidth) / 2;
    offsetY = 0;
  } else {
    drawnWidth = renderedWidth;
    drawnHeight = renderedWidth / imageRatio;
    offsetX = 0;
    offsetY = (renderedHeight - drawnHeight) / 2;
  }

  const xInBox = event.clientX - rect.left;
  const yInBox = event.clientY - rect.top;

  return {
    x: (xInBox - offsetX) / drawnWidth,
    y: (yInBox - offsetY) / drawnHeight
  };
}

function isPointInHotspot(point, hotspot) {
  if (!point || !hotspot) return false;

  return (
    point.x >= hotspot.x &&
    point.x <= hotspot.x + hotspot.width &&
    point.y >= hotspot.y &&
    point.y <= hotspot.y + hotspot.height
  );
}

function findClickedObject(roomId, point) {
  const interaction = getRoomInteraction(roomId);
  if (!interaction) return null;

  return (
    interaction.objects.find((object) => {
      return isPointInHotspot(point, object.hotspot);
    }) || null
  );
}


function safePlayEndingAudio(audioElement) {
  if (!audioElement) return;

  const promise = audioElement.play();

  if (promise && typeof promise.catch === "function") {
    promise.catch(() => {
      // הדפדפן עלול לחסום אודיו אם אין אינטראקציה, אבל כאן כבר יש קליק משתמש.
    });
  }
}

function playEndingAudio(audioElement, restart = true) {
  if (!audioElement) return;

  if (restart) {
    try {
      audioElement.currentTime = 0;
    } catch (error) {
      audioElement.currentTime = 0;
    }
  }

  safePlayEndingAudio(audioElement);
}

function stopEndingAudio(audioElement) {
  if (!audioElement) return;

  audioElement.pause();

  try {
    audioElement.currentTime = 0;
  } catch (error) {
    audioElement.currentTime = 0;
  }
}

function getProgressJarForNextHeart() {
  return getProgressJars()[completedRooms.size] || null;
}

function animateHeartToProgressJar(event) {
  const targetJar = getProgressJarForNextHeart();

  if (!event || !targetJar) {
    return Promise.resolve();
  }

  const targetRect = targetJar.getBoundingClientRect();
  const startX = event.clientX;
  const startY = event.clientY;
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + targetRect.height / 2;

  const heart = document.createElement("img");
  heart.className = "flying-heart";
  heart.src = encodeURI(FLYING_HEART_ASSET_PATH);
  heart.alt = "";
  heart.style.left = `${startX}px`;
  heart.style.top = `${startY}px`;

  heart.onerror = () => {
    /*
      fallback רק למקרה שה-asset חסר בזמן בדיקה.
      בפרויקט עצמו משתמשים ב-assets/game/ui/heart 3.png
    */
    const fallback = document.createElement("div");
    fallback.className = "flying-heart flying-heart-fallback";
    fallback.textContent = "♥";
    fallback.style.left = heart.style.left;
    fallback.style.top = heart.style.top;
    heart.replaceWith(fallback);
  };

  document.body.appendChild(heart);

  const middleX = startX + (endX - startX) * 0.48;
  const middleY = startY + (endY - startY) * 0.48 - 70;

  return new Promise((resolve) => {
    const animation = heart.animate(
      [
        {
          left: `${startX}px`,
          top: `${startY}px`,
          opacity: 1,
          transform: "translate(-50%, -50%) scale(1)"
        },
        {
          left: `${endX}px`,
          top: `${endY}px`,
          opacity: 1,
          transform: "translate(-50%, -50%) scale(1)"
        }
      ],
      {
        duration: HEART_FLY_ANIMATION_MS,
        easing: "linear",
        fill: "forwards"
      }
    );

    animation.onfinish = () => {
      playEndingAudio(endingAudio.glassDing);
      heart.remove();
      resolve();
    };

    animation.oncancel = () => {
      heart.remove();
      resolve();
    };
  });
}

function completeRoom(roomId) {
  if (completedRooms.has(roomId)) return;

  completedRooms.add(roomId);
  completedRoomOrder.push(roomId);

  const panel = getRoomPanel(roomId);
  if (panel) {
    panel.classList.add("is-completed");
    panel.removeAttribute("data-completing");
    panel.setAttribute("data-completed", "true");
  }

  refreshCompletedRoomVisual(roomId);
  updateProgressBar();
}

async function completeRoomWithDelay(roomId, event) {
  if (completedRooms.has(roomId) || roomsPendingCompletion.has(roomId)) return;

  roomsPendingCompletion.add(roomId);

  const panel = getRoomPanel(roomId);
  if (panel) {
    panel.setAttribute("data-completing", "true");
  }

  await animateHeartToProgressJar(event);

  roomsPendingCompletion.delete(roomId);
  completeRoom(roomId);
}

function handleActiveRoomInteraction(event, room) {
  if (completedRooms.has(room.id) || roomsPendingCompletion.has(room.id)) return;

  const interaction = getRoomInteraction(room.id);
  if (!interaction) return;

  const image = event.currentTarget.querySelector(".room-image");
  if (!image) return;

  const point = getImagePointFromClick(event, image);
  const state = getRoomState(room.id);
  const openObject = getOpenObject(room.id);

  if (
    openObject &&
    openObject.heartHotspot &&
    isPointInHotspot(point, openObject.heartHotspot)
  ) {
    completeRoomWithDelay(room.id, event);
    return;
  }

  const clickedObject = findClickedObject(room.id, point);

  if (!clickedObject) {
    closeRoomObject(room.id);
    return;
  }

  if (state.openObjectId === clickedObject.id) {
    closeRoomObject(room.id);
    return;
  }

  openRoomObject(room.id, clickedObject.id);
}

/* =========================
   GRID LAYOUT
========================= */

function getRoomById(roomId) {
  return gameRooms.find((room) => room.id === roomId);
}

function formatRoomTitle(room) {
  if (!room) return "";

  return `·· ${room.title} ··`;
}

function getGridForActiveRoom(roomId) {
  const layouts = {
    apartment: {
      columns: "49% 15% 24% 12%",
      rows: "80% 20%"
    },

    garrison: {
      columns: "20% 4% 64% 12%",
      rows: "80% 20%"
    },

    sanctuary: {
      columns: "8% 6% 10% 76%",
      rows: "52% 48%"
    },

    ruins: {
      columns: "56% 4% 30% 10%",
      rows: "28% 72%"
    },

    crypt: {
      columns: "28% 18% 40% 14%",
      rows: "26% 74%"
    }
  };

  return layouts[roomId] || layouts.apartment;
}

function applyBoardGrid(roomId) {
  if (!roomsBoard) return;

  const grid = getGridForActiveRoom(roomId);

  roomsBoard.style.gridTemplateAreas = FIXED_GRID_AREAS;
  roomsBoard.style.gridTemplateColumns = grid.columns;
  roomsBoard.style.gridTemplateRows = grid.rows;
}

function createRoomPanel(room) {
  const button = document.createElement("button");

  button.className = "room-panel";
  button.type = "button";
  button.dataset.roomId = room.id;
  button.style.gridArea = room.gridArea;
  button.setAttribute("aria-label", room.title);

  const image = document.createElement("img");
  image.className = "room-image";
  image.src = encodeURI(room.image);
  image.alt = room.title;
  image.style.objectPosition = room.objectPosition;

  const completionBackdrop = document.createElement("img");
  completionBackdrop.className = "room-completion-backdrop";
  completionBackdrop.src = encodeURI(completedRoomVisuals.blackFrame);
  completionBackdrop.alt = "";
  completionBackdrop.setAttribute("aria-hidden", "true");

  const completionOverlay = document.createElement("img");
  completionOverlay.className = "room-completion-overlay";
  completionOverlay.alt = "";
  completionOverlay.setAttribute("aria-hidden", "true");

  const label = document.createElement("div");
  label.className = "room-label";
  label.textContent = room.shortTitle;

  button.appendChild(image);
  button.appendChild(completionBackdrop);
  button.appendChild(completionOverlay);
  button.appendChild(label);

  button.addEventListener("click", (event) => {
    if (activeRoomId !== room.id) {
      if (isRoomTransitioning) return;

      setActiveRoom(room.id, true);
      return;
    }

    handleActiveRoomInteraction(event, room);
  });

  return button;
}

function setActiveRoom(roomId, useTransitionLock = true) {
  const selectedRoom = getRoomById(roomId);
  if (!selectedRoom || !roomsBoard || !gameTitle) return;

  if (useTransitionLock) {
    isRoomTransitioning = true;
  }

  activeRoomId = roomId;

  roomsBoard.querySelectorAll(".room-panel").forEach((panel) => {
    const panelRoomId = panel.dataset.roomId;
    const isActive = panelRoomId === roomId;

    panel.classList.toggle("is-active", isActive);
    panel.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  applyBoardGrid(roomId);
  gameTitle.textContent = formatRoomTitle(selectedRoom);
  refreshAllCompletedRoomVisuals();

  if (useTransitionLock) {
    window.setTimeout(() => {
      isRoomTransitioning = false;
    }, ROOM_TRANSITION_MS);
  }
}


/* =========================
   ENDING ANIMATION LOGIC
========================= */

function endingWait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function isEveryRoomCompleted() {
  return completedRooms.size >= gameRooms.length;
}

function getEndingViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

function setEndingCanvasSize() {
  if (!endingCanvas || !endingContext) return;

  const { width, height } = getEndingViewportSize();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  endingCanvas.width = Math.round(width * pixelRatio);
  endingCanvas.height = Math.round(height * pixelRatio);
  endingCanvas.style.width = `${width}px`;
  endingCanvas.style.height = `${height}px`;

  endingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  endingContext.imageSmoothingEnabled = true;
  endingContext.imageSmoothingQuality = "high";

  if (endingCurrentPath) {
    drawEndingFrame(endingCurrentPath);
  }

  positionEndingRestartButton();
}

function getEndingFitRect() {
  const { width: canvasWidth, height: canvasHeight } = getEndingViewportSize();
  const imageRatio = endingBaseFrameRatio || 16 / 9;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth;
  let drawHeight;
  let offsetX;
  let offsetY;

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

function positionEndingRestartButton() {
  if (!endingRestartButton) return;

  const rect = getEndingFitRect();

  endingRestartButton.style.left = `${rect.offsetX + endingRestartHotspot.x * rect.drawWidth}px`;
  endingRestartButton.style.top = `${rect.offsetY + endingRestartHotspot.y * rect.drawHeight}px`;
  endingRestartButton.style.width = `${endingRestartHotspot.width * rect.drawWidth}px`;
  endingRestartButton.style.height = `${endingRestartHotspot.height * rect.drawHeight}px`;
}

function clearEndingCanvas() {
  if (!endingContext) return;

  const { width, height } = getEndingViewportSize();
  endingContext.clearRect(0, 0, width, height);
}

function drawEndingImageToCanvas(image, opacity = 1) {
  if (!endingContext || !image) return;

  const rect = getEndingFitRect();

  endingContext.save();
  endingContext.globalAlpha = opacity;
  endingContext.drawImage(
    image,
    rect.offsetX,
    rect.offsetY,
    rect.drawWidth,
    rect.drawHeight
  );
  endingContext.restore();
}

function drawEndingFrame(path) {
  const image = endingImages[path];

  if (!image) return;

  endingCurrentPath = path;
  clearEndingCanvas();
  drawEndingImageToCanvas(image, 1);
  positionEndingRestartButton();
}

function drawEndingBlend(fromPath, toPath, progress) {
  const fromImage = endingImages[fromPath];
  const toImage = endingImages[toPath];

  if (!fromImage || !toImage) return;

  const safeProgress = Math.max(0, Math.min(progress, 1));

  clearEndingCanvas();
  drawEndingImageToCanvas(toImage, 1);
  drawEndingImageToCanvas(fromImage, 1 - safeProgress);
}

function loadEndingImage(path) {
  if (endingImages[path]) {
    return Promise.resolve(endingImages[path]);
  }

  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      endingImages[path] = image;
      endingBaseFrameRatio = image.naturalWidth / image.naturalHeight;
      resolve(image);
    };

    image.onerror = () => resolve(null);
    image.src = encodeURI(path);
  });
}

function preloadEndingImages() {
  return Promise.all(endingFramePaths.map(loadEndingImage));
}

function fadeEndingBetween(fromPath, toPath, durationMs) {
  return new Promise((resolve) => {
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / durationMs, 1);

      drawEndingBlend(fromPath, toPath, progress);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        drawEndingFrame(toPath);
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

function fadeFirstEndingFrameOverEverything(framePath, durationMs) {
  return new Promise((resolve) => {
    const app = document.getElementById("app") || document.body;
    const fadeLayer = document.createElement("div");

    /*
      שכבה נפרדת שעושה fade-in של 6.1 מעל הכל.
      זה לא תלוי ב-opacity של game-frame או ב-classes קיימים.
    */
    fadeLayer.className = "ending-first-frame-fade-layer";
    fadeLayer.style.position = "fixed";
    fadeLayer.style.inset = "0";
    fadeLayer.style.zIndex = "9000";
    fadeLayer.style.width = "100vw";
    fadeLayer.style.height = "100vh";
    fadeLayer.style.backgroundColor = "#000";
    fadeLayer.style.backgroundImage = `url("${encodeURI(framePath)}")`;
    fadeLayer.style.backgroundSize = "cover";
    fadeLayer.style.backgroundPosition = "center center";
    fadeLayer.style.backgroundRepeat = "no-repeat";
    fadeLayer.style.pointerEvents = "auto";
    fadeLayer.style.opacity = "0";

    app.appendChild(fadeLayer);

    // Force paint at opacity 0 before the animation starts.
    fadeLayer.offsetHeight;

    const animation = fadeLayer.animate(
      [
        { opacity: 0 },
        { opacity: 1 }
      ],
      {
        duration: durationMs,
        easing: "ease",
        fill: "forwards"
      }
    );

    animation.onfinish = () => {
      /*
        אחרי שה-fade הסתיים, מעבירים את השליטה ל-ending-stage
        כשהוא כבר מציג את אותו פריים בדיוק.
      */
      drawEndingFrame(framePath);

      endingStage.classList.remove("ui-hidden");
      endingStage.classList.add("visible");
      endingStage.style.position = "fixed";
      endingStage.style.inset = "0";
      endingStage.style.zIndex = "5000";
      endingStage.style.width = "100vw";
      endingStage.style.height = "100vh";
      endingStage.style.background = "#000";
      endingStage.style.pointerEvents = "auto";
      endingStage.style.transition = "none";
      endingStage.style.opacity = "1";

      fadeLayer.remove();
      resolve();
    };

    animation.oncancel = () => {
      fadeLayer.remove();
      resolve();
    };
  });
}

async function startEndingSequence() {
  if (endingIsRunning || !isEveryRoomCompleted()) return;
  if (!endingStage || !endingCanvas || !endingContext) return;

  endingIsRunning = true;

  const progressBar = document.getElementById("progress-bar");

  if (progressBar) {
    progressBar.classList.add("ending-is-running");
  }

  if (window.chopinAudio && typeof window.chopinAudio.stopGameMusicWithFade === "function") {
    window.chopinAudio.stopGameMusicWithFade(GAME_TO_ENDING_FADE_MS);
  }

  // Make sure any previous ending audio state is reset.
  stopEndingAudio(endingAudio.beforeWhisper);
  stopEndingAudio(endingAudio.whispers);
  stopEndingAudio(endingAudio.flashlightOff);
  stopEndingAudio(endingAudio.flashlightOn);
  stopEndingAudio(endingAudio.finale);

  await preloadEndingImages();
  setEndingCanvasSize();

  const firstFrame = endingFramePaths[0];

  drawEndingFrame(firstFrame);

  endingStage.classList.remove("visible");
  endingStage.classList.remove("ui-hidden");

  // Keep the fade from the game into 6.1, but no fades between ending frames.
  await fadeFirstEndingFrameOverEverything(firstFrame, GAME_TO_ENDING_FADE_MS);

  // Finale music starts only when frame 6.2 appears.

  // From here on: hard cuts, except 6.7 -> 6.8 which fades.
  // flashlight-on.mp3 plays fully, with its midpoint exactly on the frame change.
  let currentPath = firstFrame;

  for (let index = 1; index < endingFramePaths.length; index += 1) {
    const nextPath = endingFramePaths[index];

    await waitForHeldTransition(currentPath, nextPath);

    if (
      (currentPath === "assets/ending/6.7 ending.png"
        && nextPath === "assets/ending/6.8 ending.png")
      || (currentPath === "assets/ending/6.8 ending.png"
        && nextPath === "assets/ending/6.9 ending.png")
    ) {
      await fadeEndingBetween(currentPath, nextPath, ENDING_FRAME_FADE_MS);
    } else {
      drawEndingFrame(nextPath);
    }

    if (nextPath === "assets/ending/6.2 ending.png") {
      playEndingAudio(endingAudio.finale);
    }

    currentPath = nextPath;

    if (index === endingFramePaths.length - 1) {
      break;
    }
  }

  if (endingRestartButton) {
    positionEndingRestartButton();
    endingRestartButton.classList.remove("ui-hidden");
  }
}

function getFlashlightCueDurationMs() {
  const audio = endingAudio.flashlightOn;
  const fallbackMs = 440;

  if (!audio) return fallbackMs;

  const durationSeconds = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null;
  return durationSeconds ? Math.round(durationSeconds * 1000) : fallbackMs;
}

function isFlashlightEndingFrame(framePath) {
  return framePath === "assets/ending/6.2 ending.png"
    || framePath === "assets/ending/6.4 ending.png"
    || framePath === "assets/ending/6.6 ending.png"
    || framePath === "assets/ending/6.7 ending.png";
}

function playFullFlashlightCue() {
  const audio = endingAudio.flashlightOn;

  if (!audio) return;

  try {
    audio.pause();
    audio.currentTime = 0;

    const playPromise = audio.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  } catch (error) {
    // no-op
  }
}

async function waitForHeldTransition(currentPath, nextPath) {
  const currentHoldMs = endingHoldMsByFrame[currentPath] || 0;
  const shouldPlayCue = isFlashlightEndingFrame(nextPath);

  if (!shouldPlayCue) {
    if (currentHoldMs > 0) {
      await endingWait(currentHoldMs);
    }
    return;
  }

  /*
    flashlight-on.mp3 מתנגן כולו.
    האמצע שלו יושב בדיוק על רגע המעבר לפריים הבא.
  */
  const cueMs = getFlashlightCueDurationMs();
  const halfCueMs = Math.round(cueMs / 2);
  const quietHoldMs = Math.max(currentHoldMs - halfCueMs, 0);

  if (quietHoldMs > 0) {
    await endingWait(quietHoldMs);
  }

  playFullFlashlightCue();

  if (halfCueMs > 0) {
    await endingWait(halfCueMs);
  }
}

function handleProgressBarClick() {
  if (!isEveryRoomCompleted()) return;

  startEndingSequence();
}

function restartExperience(event) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (endingRestartButton) {
    endingRestartButton.classList.add("ui-hidden");
  }

  if (endingStage) {
    endingStage.style.transition = `opacity ${START_OVER_FADE_OUT_MS}ms ease`;
    endingStage.style.opacity = "0";
    endingStage.classList.remove("visible");
  }

  window.setTimeout(() => {
    window.location.reload();
  }, START_OVER_FADE_OUT_MS);
}


/* =========================
   PROGRESS BAR LOGIC
========================= */

function getProgressJars() {
  return [...document.querySelectorAll(".progress-jar")];
}

function updateProgressBar() {
  const jars = getProgressJars();
  const progressBar = document.getElementById("progress-bar");
  const completedCount = completedRooms.size;
  const allRoomsCompleted = completedCount >= gameRooms.length;

  if (progressBar) {
    if (allRoomsCompleted) {
      /*
        ההבהוב / glow מתחיל קצת יותר מאוחר,
        כדי שלא יקפוץ מייד ברגע שהלב האחרון נאסף.
      */
      if (!progressBar.classList.contains("all-jars-found") && !finalJarGlowTimer) {
        finalJarGlowTimer = window.setTimeout(() => {
          progressBar.classList.add("all-jars-found");
          finalJarGlowTimer = null;
        }, 1500);
      }
    } else {
      if (finalJarGlowTimer) {
        clearTimeout(finalJarGlowTimer);
        finalJarGlowTimer = null;
      }

      progressBar.classList.remove("all-jars-found");
    }
  }

  jars.forEach((jar, index) => {
    const image = jar.querySelector("img");
    const shouldBeFilled = index < completedCount;

    jar.classList.toggle("is-filled", shouldBeFilled);

    if (image) {
      image.src = shouldBeFilled
        ? encodeURI(progressJarPaths.filled)
        : encodeURI(progressJarPaths.empty);
    }

    jar.setAttribute(
      "aria-label",
      shouldBeFilled
        ? `Progress jar ${index + 1} filled`
        : `Progress jar ${index + 1} empty`
    );
  });
}

/* =========================
   PRELOAD / INIT
========================= */

function getAllGameImagePaths() {
  const roomBaseImages = gameRooms.map((room) => room.image);

  const interactionImages = Object.values(roomInteractions).flatMap((interaction) => {
    return [
      interaction.closedFrame,
      ...interaction.objects.flatMap((object) => {
        return [
          object.openFrame,
          object.completionFrame
        ].filter(Boolean);
      })
    ];
  });

  return [
    ...new Set([
      ...roomBaseImages,
      ...interactionImages,
      ...Object.values(progressJarPaths),
      ...Object.values(completedRoomVisuals),
      ...endingFramePaths
    ])
  ];
}

function preloadGameRoomImages() {
  const imagePaths = getAllGameImagePaths();

  const promises = imagePaths.map((path) => {
    return new Promise((resolve) => {
      const image = new Image();

      image.onload = resolve;
      image.onerror = resolve;

      image.src = encodeURI(path);
    });
  });

  return Promise.all(promises);
}

function initGameRooms() {
  if (!roomsBoard || !gameTitle) return;

  roomsBoard.innerHTML = "";
  roomsBoard.style.gridTemplateAreas = FIXED_GRID_AREAS;

  gameRooms.forEach((room) => {
    getRoomState(room.id);

    const panel = createRoomPanel(room);
    roomsBoard.appendChild(panel);
  });

  setActiveRoom(activeRoomId, false);
  preloadGameRoomImages();
  preloadEndingImages();
  updateProgressBar();
}

window.addEventListener("resize", () => {
  applyBoardGrid(activeRoomId);
  setEndingCanvasSize();
});

function attachEndingTriggerListeners() {
  progressBarElement = document.getElementById("progress-bar");

  const startEndingFromJars = (event) => {
    if (!isEveryRoomCompleted()) return;

    if (event && typeof event.preventDefault === "function") {
      event.preventDefault();
    }

    startEndingSequence();
  };

  if (progressBarElement) {
    progressBarElement.addEventListener("pointerdown", startEndingFromJars);
    progressBarElement.addEventListener("click", startEndingFromJars);
  }

  getProgressJars().forEach((jar) => {
    jar.addEventListener("pointerdown", startEndingFromJars);
    jar.addEventListener("click", startEndingFromJars);
  });
}

if (endingRestartButton) {
  endingRestartButton.addEventListener("click", restartExperience);
}

window.addEventListener("DOMContentLoaded", () => {
  initGameRooms();
  attachEndingTriggerListeners();
});
