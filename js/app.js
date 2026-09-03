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
    el.innerHTML = items.map((i) =>
      `<option value="${i.id}" ${i.id === selected ? "selected" : ""}>${i.label}</option>`
    ).join("");
  }

  function renderClubs() {
    clubEl.innerHTML = Object.entries(GOLF_DATA.clubs).map(([id, c]) =>
      `<button class="club-btn ${id === state.club ? "active" : ""}" data-club="${id}">${c.label}</button>`
    ).join("");
  }

  function poseText(club) {
    return {
      driver: "3D-figuren står i driver-adresse: ballen fremme, lengre kølle og mer oppreist holdning. Roter med musen.",
      jern: "Jern-setup: mer fremoverbøyd, ballen mer midt i stansen. Roter figuren for å se svingplanet.",
      wedge: "Wedge-setup: smalere og steilere. Se hvordan køllehodet har mer loft.",
      putter: "Putter-setup: mer over ballen, korte armer og lavt køllehode. Sjekk lining bakfra."
    }[club];
  }

  function renderTips() {
    const clubLabel = GOLF_DATA.clubs[state.club].label;
    const problemLabel = GOLF_DATA.problems[state.club].find((p) => p.id === state.problem)?.label || "";
    const gripLabel = GOLF_DATA.grips.find((g) => g.id === state.grip).label;
    const goalLabel = GOLF_DATA.goals.find((g) => g.id === state.goal).label;

    chipsEl.innerHTML = [clubLabel, problemLabel, gripLabel, goalLabel]
      .map((t) => `<span class="chip">${t}</span>`).join("");

    const tips = buildTips(state.club, state.problem, state.grip, state.goal);
    tipsEl.innerHTML = tips.map((t) =>
      `<div class="tip"><strong>${t.title}:</strong> ${t.text}</div>`
    ).join("");
    poseNote.textContent = poseText(state.club);
    GolfScene.update(state.club, state.problem);
  }

  function syncProblems() {
    const list = GOLF_DATA.problems[state.club];
    if (!list.some((p) => p.id === state.problem)) state.problem = list[0].id;
    fillSelect(problemEl, list, state.problem);
  }

  clubEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-club]");
    if (!btn) return;
    state.club = btn.dataset.club;
    renderClubs();
    syncProblems();
    renderTips();
  });

  problemEl.addEventListener("change", () => { state.problem = problemEl.value; renderTips(); });
  gripEl.addEventListener("change", () => { state.grip = gripEl.value; renderTips(); });
  goalEl.addEventListener("change", () => { state.goal = goalEl.value; renderTips(); });

  renderClubs();
  fillSelect(gripEl, GOLF_DATA.grips, state.grip);
  fillSelect(goalEl, GOLF_DATA.goals, state.goal);
  syncProblems();

  GolfScene.init(document.getElementById("scene"));
  renderTips();
})();
