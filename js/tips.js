window.GOLF_DATA = {
  clubs: {
    driver: { label: "Driver", pose: "driver" },
    jern: { label: "Jern", pose: "jern" },
    wedge: { label: "Wedge", pose: "wedge" },
    putter: { label: "Putter", pose: "putter" }
  },
  problems: {
    driver: [
      { id: "slice", label: "Slice" },
      { id: "hook", label: "Hook" },
      { id: "push", label: "Push" },
      { id: "pull", label: "Pull" },
      { id: "popup", label: "Pop-up / skyhøy ball" },
      { id: "lengde", label: "For lite lengde" }
    ],
    jern: [
      { id: "slice", label: "Slice" },
      { id: "hook", label: "Hook" },
      { id: "fat", label: "Fat / duff" },
      { id: "thin", label: "Thin / topping" },
      { id: "push", label: "Push" },
      { id: "pull", label: "Pull" }
    ],
    wedge: [
      { id: "fat", label: "Chunk / for mye gress" },
      { id: "thin", label: "Blade / tynn treff" },
      { id: "distanse", label: "Dårlig avstandskontroll" },
      { id: "spin", label: "For lite stopp" },
      { id: "hoyde", label: "For lav eller for høy" },
      { id: "alignment", label: "Sikter feil" }
    ],
    putter: [
      { id: "push", label: "Putter til høyre" },
      { id: "pull", label: "Putter til venstre" },
      { id: "hastighet", label: "Feil hastighet" },
      { id: "alignment", label: "Dårlig lining" },
      { id: "decel", label: "Bremser i slaget" },
      { id: "yips", label: "Urolige hender" }
    ]
  },
  grips: [
    { id: "vardon", label: "Vardon / overlapping" },
    { id: "interlock", label: "Interlocking" },
    { id: "baseball", label: "Baseball / 10-finger" },
    { id: "sterk", label: "Sterkt grep" },
    { id: "noytral", label: "Nøytralt grep" },
    { id: "svakt", label: "Svakt grep" }
  ],
  goals: [
    { id: "lengde", label: "Mer lengde" },
    { id: "presisjon", label: "Mer presisjon" },
    { id: "kontakt", label: "Renere kontakt" },
    { id: "tempo", label: "Bedre tempo" },
    { id: "kontroll", label: "Mer kontroll" }
  ]
};

window.buildTips = function (club, problem, grip, goal) {
  const tips = [];

  const clubTips = {
    driver: "Ballposisjon: like innenfor venstre hæl. Tee høyt nok til at ca. halvparten av ballen er over kronen.",
    jern: "Ball midt i stansen på korte jern, litt fremme på lange. Vekten 55/45 mot venstre side i adresse.",
    wedge: "Smalere stance, mer vekt på venstre fot, og la køllehodet skli gjennom gresset – ikke grave.",
    putter: "Øyne over eller like innenfor ballen. Skuldrene styrer slaget, håndleddene er rolige."
  };
  tips.push({ title: "Setup", text: clubTips[club] });

  const problemMap = {
    slice: "Slice kommer ofte av åpen kølleflate og/eller out-to-in svingbane. Føl at køllehodet peker litt mer mot målet i toppen, og sving mer «innefra».",
    hook: "Hook kommer ofte av for lukket flate eller for sterkt grep. Sjekk at V-ene i hendene peker mot høyre skulder, ikke utenfor.",
    push: "Push: ballen starter høyre uten kurve. Ofte står du for lukket, eller slår for mye innenfra med åpen flate. Still føttene parallelt med mållinjen.",
    pull: "Pull: ballen starter venstre. Ofte for åpen stance eller for bratt, out-to-in bane. La høyre albue peke mer mot hoften i nedsvingen.",
    fat: "Fat-treff: vekten blir igjen på bakfoten. Føl at brystet er over ballen i treff, og at venstre side leder.",
    thin: "Tynn treff: du reiser deg opp. Behold knebøy og la armene henge. Tenk «børst gresset» etter ballen.",
    popup: "Pop-up med driver: slår ned på ballen. Tee høyere, ball lenger frem, og fei opp gjennom ballen.",
    lengde: "Lengde: slå ikke hardere – slå mer sentrert. Bredere svingbue, myk overgang i toppen, og slipp køllen gjennom.",
    distanse: "Velg én lengde per svinglengde (klokken 9, 10 og 11). Tell 1-2 i samme tempo hver gang.",
    spin: "For å stoppe wedge-slag: treff ball først, så gress. Litt mer vekt venstre og rene riller.",
    hoyde: "Høyde styres av loft og svingbunn. For høyere slag: ball litt fremme og slipp køllen. For lavere: ball tilbake og mer hender foran.",
    alignment: "Legg en kølle på bakken mot målet og én langs tærne. Speil den linjen – ikke sikte med føttene mot flagget.",
    hastighet: "Putt til et punkt 30–40 cm bak hullet på slake putter. Øv 3–6–9 meter og bedøm «forbi/kort» før du ser.",
    decel: "Ikke brems putteren. Bak-sving og gjennom-sving skal være like lange. Tenk at putterhodet akselererer gjennom ballen.",
    yips: "Reduser håndleddsbruk. Prøv arm-lock eller claw-grep i 10 minutter på øvingsgreen. Se på hullet, ikke på putteren."
  };
  if (problemMap[problem]) {
    tips.push({ title: "Hovedfeil", text: problemMap[problem] });
  }

  const gripMap = {
    vardon: "Vardon gir god balanse mellom kontroll og frigjøring. Pekefingeren på øverste hånd hviler over lillefingeren på nederste.",
    interlock: "Interlock låser hendene godt – fint om du har mindre hender. Unngå å klemme for hardt.",
    baseball: "Baseball-grep gir ofte mer kraft, men kan åpne flaten. Hold et trykk på 4/10 og la håndleddene slå i takt.",
    sterk: "Sterkt grep (flere knoker synlige på venstre hånd) lukker flaten. Bra mot slice, risikabelt om du allerede hooker.",
    noytral: "Nøytralt grep: to knoker synlige. Dette er utgangspunktet for de fleste faste svinger.",
    svakt: "Svakt grep åpner flaten. Kan dempe hook, men gir ofte slice om svingbanen allerede er utenfra."
  };
  tips.push({ title: "Grep", text: gripMap[grip] });

  if ((problem === "slice" && (grip === "svakt" || grip === "noytral")) || (problem === "slice" && grip !== "sterk")) {
    tips.push({ title: "Grep vs slice", text: "Prøv et litt sterkere venstrehåndsgrep: se 2,5–3 knoker. Det hjelper flaten å squarer i treff." });
  }
  if (problem === "hook" && (grip === "sterk" || grip === "baseball")) {
    tips.push({ title: "Grep vs hook", text: "Svekk grepet ett hakk. Venstre tommel mer oppå skaftet, og høyre hånd mindre under." });
  }

  const goalMap = {
    lengde: "Lengde kommer fra senter-treff + lag. Pause et millisekund i toppen og la hoftene starte nedsvingen.",
    presisjon: "Velg et lite mål bak greenen/fairwayen. Still kølleflaten først, så føttene. Én svingtanke, ikke fem.",
    kontakt: "Øv «low point»: legg et tee 5 cm foran ballen og prøv å børste det etter treff.",
    tempo: "Tell «én» opp og «to» gjennom. Samme tall med driver som med wedge – bare lengre bue.",
    kontroll: "Tre-kvart sving med ferdig finish. Hvis du ikke kan holde finishen i 2 sekunder, var tempoet for høyt."
  };
  tips.push({ title: "Mål", text: goalMap[goal] });

  if (club === "putter") {
    tips.push({ title: "Rask drill", text: "Gate-drill: to tees like utenfor putterhodet. 20 putter fra 1,5 m. Hvis du treffer en tee, start på nytt." });
  } else if (club === "wedge") {
    tips.push({ title: "Rask drill", text: "Tre bunker-håndklær eller merker på 20, 35 og 50 m. Tre baller til hvert merke før du bytter." });
  } else if (club === "driver") {
    tips.push({ title: "Rask drill", text: "Slå 5 baller der målet bare er «fairway-side». Tell treffkvalitet (1–5), ikke lengde." });
  } else {
    tips.push({ title: "Rask drill", text: "Legg et håndkle 5 cm bak ballen. Hvis du treffer håndkleet, kom du for grunt / for tidlig." });
  }

  return tips;
};
