const printButton = document.querySelector(".print-button");
const poster = document.querySelector("#poster");
const overview = document.querySelector("#poster-overview");
const presentation = document.querySelector("#presentation");
const modeButtons = [...document.querySelectorAll(".mode-button")];
const slides = [...document.querySelectorAll(".presentation-slide")];
const presenterBadge = document.querySelector("#presenter-badge");
const viewCounter = document.querySelector("#view-counter");
const viewCounterLabel = viewCounter.nextElementSibling;
const navigation = document.querySelector("#view-navigation");
const previousButton = document.querySelector("#previous-view");
const nextButton = document.querySelector("#next-view");
const notesToggle = document.querySelector("#notes-toggle");
const notesPanel = document.querySelector("#speaker-notes");
const notesEditor = document.querySelector("#notes-editor");
const notesViewNumber = document.querySelector("#notes-view-number");
const notesStatus = document.querySelector("#notes-status");
const fullscreenButton = document.querySelector("#fullscreen-button");
const noteTemplates = [...document.querySelectorAll("[data-speaker-notes]")];
const storageKey = "pdd-speaker-notes-v1";

let currentView = 1;
const speakerNotes = Object.fromEntries(
  noteTemplates.map((template) => [
    template.dataset.speakerNotes,
    template.content.textContent.trim(),
  ]),
);

let savedNotes;
try {
  savedNotes = localStorage.getItem(storageKey);
} catch {
  notesStatus.textContent = "Browser storage is unavailable; notes will not persist after this session.";
}

if (savedNotes) {
  try {
    const parsedNotes = JSON.parse(savedNotes);
    if (parsedNotes && typeof parsedNotes === "object" && !Array.isArray(parsedNotes)) {
      for (const [view, text] of Object.entries(parsedNotes)) {
        if (Object.hasOwn(speakerNotes, view) && typeof text === "string") {
          speakerNotes[view] = text;
        }
      }
    } else {
      notesStatus.textContent = "Saved notes could not be read; the presentation script is loaded.";
    }
  } catch {
    notesStatus.textContent = "Saved notes could not be read; the presentation script is loaded.";
  }
}

function saveSpeakerNotes() {
  speakerNotes[String(currentView)] = notesEditor.value;
  try {
    localStorage.setItem(storageKey, JSON.stringify(speakerNotes));
    notesStatus.textContent = "Notes saved in this browser.";
  } catch {
    notesStatus.textContent = "Notes could not be saved in this browser; edits remain until the page closes.";
  }
}

function showView(view) {
  currentView = Math.min(Math.max(view, 1), slides.length);
  const activeSlide = slides[currentView - 1];

  slides.forEach((slide, index) => {
    const isActive = index === currentView - 1;
    slide.hidden = !isActive;
    slide.classList.toggle("is-active", isActive);
  });

  viewCounter.textContent = String(currentView).padStart(2, "0");
  presenterBadge.textContent = activeSlide.dataset.presenter;
  presenterBadge.hidden = currentView <= 8 || currentView === 9;
  viewCounterLabel.textContent =
    currentView <= 3
      ? `/ ${activeSlide.dataset.presenter}`
      : currentView === 4
        ? "/ PRESENTER 2 · Dulanjali"
        : currentView === 5
          ? "/ PRESENTER 2 · Dulanjali"
          : currentView === 6
            ? "/ PRESENTER 2 · Dulanjali"
            : currentView === 7
              ? "/ Hairong"
              : currentView === 8
                ? "/ PRESENTER 3 · Hairong"
                : currentView === 9
                  ? "/ PRESENTER 3 · Hairong"
                : "/ 11 VIEWS";
  notesViewNumber.textContent = String(currentView);
  notesEditor.value = speakerNotes[String(currentView)];
  previousButton.disabled = currentView === 1;
  nextButton.disabled = currentView === slides.length;

  [...navigation.querySelectorAll("button")].forEach((button, index) => {
    if (index === currentView - 1) {
      button.setAttribute("aria-current", "step");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function setMode(mode) {
  const isPresentation = mode === "presentation";
  overview.hidden = isPresentation;
  presentation.hidden = !isPresentation;
  poster.classList.toggle("is-presenting", isPresentation);

  modeButtons.forEach((button) => {
    const isSelected = button.dataset.mode === mode;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  if (isPresentation) {
    notesPanel.hidden = true;
    notesToggle.setAttribute("aria-expanded", "false");
    notesToggle.querySelector("span").textContent = "＋";
  }
}

slides.forEach((slide, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = String(index + 1).padStart(2, "0");
  button.setAttribute("aria-label", `Go to view ${index + 1}`);
  button.addEventListener("click", () => showView(index + 1));
  navigation.append(button);
});

showView(currentView);

printButton?.addEventListener("click", () => {
  window.print();
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

previousButton.addEventListener("click", () => showView(currentView - 1));
nextButton.addEventListener("click", () => showView(currentView + 1));

notesToggle.addEventListener("click", () => {
  const isExpanded = notesToggle.getAttribute("aria-expanded") === "true";
  notesPanel.hidden = isExpanded;
  notesToggle.setAttribute("aria-expanded", String(!isExpanded));
  notesToggle.querySelector("span").textContent = isExpanded ? "＋" : "−";
});

notesEditor.addEventListener("input", saveSpeakerNotes);

document.addEventListener("keydown", (event) => {
  if (presentation.hidden || event.target === notesEditor) {
    return;
  }

  if (event.key === "ArrowLeft") {
    showView(currentView - 1);
  } else if (event.key === "ArrowRight") {
    showView(currentView + 1);
  }
});

fullscreenButton.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement === presentation) {
      await document.exitFullscreen();
    } else {
      await presentation.requestFullscreen();
    }
  } catch {
    notesStatus.textContent = "Full-screen mode is unavailable in this browser.";
  }
});

document.addEventListener("fullscreenchange", () => {
  fullscreenButton.textContent =
    document.fullscreenElement === presentation ? "Exit full screen" : "Full screen";
});
