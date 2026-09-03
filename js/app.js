(function () {
  const clubEl = document.getElementById("club-grid");
  const problemEl = document.getElementById("problem");
  const gripEl = document.getElementById("grip");
  const goalEl = document.getElementById("goal");
  const tipsEl = document.getElementById("tips");
  const poseNote = document.getElementById("pose-note");
  const chipsEl = document.getElementById("chips");
  const state = { club: "driver", problem: "slice", grip: "vardon", goal: "presisjon" };

  function fillSelect(el, items, selected) {
    el.innerHTML = items.map((i) => `<option value="${i.id}" ${i.id === selected ? "selected" : ""}>${i.label}</option>`).join("");
  }
  function renderProblems() {
    const list = GOLF_DATA.problems[state.club];
    if (!list.some((p) => p.id === state.problem)) state.problem = list[0].id;
    problemEl.innerHTML = list.map((p) => `<button type="button" class="choice-btn ${p.id === state.problem ? "active" : ""}" data-problem="${p.id}">${p.label}</button>`).join("");
  }
  function renderClubs() {
    clubEl.innerHTML = Object.entries(GOLF_DATA.clubs).map(([id, c]) => `<button class="club-btn ${id === state.club ? "active" : ""}" data-club="${id}">${c.label}</button>`).join("");
  }
  function poseText(club) {
    return {
      driver: "Driver: bredere stance, ballen innenfor venstre hæl og teet opp. Køllehodet ligger bak ballen.",
      jern: "Jern: nøytral stance, ballen midt i stansen. Vekten litt mot venstre, køllen i bakken bak ballen.",
      wedge: "Wedge: smalere stance, ballen litt tilbake. Steilere skaft og mer loft i adressen.",
      putter: "Putter: smal stance, ballen under øynene. Putterhodet i bakken rett bak ballen."
    }[club];
  }
  function renderTips() {
    const clubLabel = GOLF_DATA.clubs[state.club].label;
    const problemLabel = GOLF_DATA.problems[state.club].find((p) => p.id === state.problem)?.label || "";
    const gripLabel = GOLF_DATA.grips.find((g) => g.id === state.grip).label;
    const goalLabel = GOLF_DATA.goals.find((g) => g.id === state.goal).label;
    chipsEl.innerHTML = [clubLabel, problemLabel, gripLabel, goalLabel].map((t) => `<span class="chip">${t}</span>`).join("");
    tipsEl.innerHTML = buildTips(state.club, state.problem, state.grip, state.goal).map((t) => `<div class="tip"><strong>${t.title}:</strong> ${t.text}</div>`).join("");
    poseNote.textContent = poseText(state.club);
    GolfScene.update(state.club, state.problem);
  }
  clubEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-club]"); if (!btn) return;
    state.club = btn.dataset.club; renderClubs(); renderProblems(); renderTips();
  });
  problemEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-problem]"); if (!btn) return;
    state.problem = btn.dataset.problem; renderProblems(); renderTips();
  });
  gripEl.addEventListener("change", () => { state.grip = gripEl.value; renderTips(); });
  goalEl.addEventListener("change", () => { state.goal = goalEl.value; renderTips(); });

  const music = document.getElementById("bg-music");
  const musicBtn = document.getElementById("music-btn");
  if (music && musicBtn) {
    music.volume = 0.28;
    musicBtn.addEventListener("click", async () => {
      try {
        if (music.paused) {
          await music.play();
          musicBtn.classList.add("active");
          musicBtn.textContent = "Pause musikk";
        } else {
          music.pause();
          musicBtn.classList.remove("active");
          musicBtn.textContent = "Spill av bakgrunnsmusikk";
        }
      } catch (err) {
        musicBtn.textContent = "Kunne ikke starte musikk";
      }
    });
  }

  renderClubs();
  fillSelect(gripEl, GOLF_DATA.grips, state.grip);
  fillSelect(goalEl, GOLF_DATA.goals, state.goal);
  renderProblems();
  const canvas = document.getElementById("scene");
  const errorEl = document.getElementById("scene-error");
  try {
    GolfScene.init(canvas);
    if (window.DEFAULT_FACE) GolfScene.setFace(window.DEFAULT_FACE);
  } catch (err) {
    console.error(err);
    if (errorEl) errorEl.classList.add("visible");
  }
  renderTips();
})();
