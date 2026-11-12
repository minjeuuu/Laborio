async (page) => {
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  console.log("=== BATCH 1: SCREENSHOTS 01 TO 20 ===");

  // Set standard desktop viewport 1280x800
  await page.setViewportSize({ width: 1280, height: 800 });

  // 01: Startup Splash Cinema Intro
  console.log("Capturing 01...");
  await page.goto("http://localhost:3000/?hide_companion=1", { waitUntil: "domcontentloaded" });
  await wait(800);
  await page.screenshot({ path: "screenshots/01-startup-splash-cinema-intro.png" });

  // 02: Home Overworld Dashboard
  console.log("Capturing 02...");
  await page.goto("http://localhost:3000/?autostart=1&hide_companion=1", { waitUntil: "domcontentloaded" });
  await wait(800);
  await page.screenshot({ path: "screenshots/02-home-overworld-dashboard.png" });

  // 03: Daily Statutory Goal Ring
  console.log("Capturing 03...");
  const goalCard = page.locator("text=Daily Statutory Study Goal").first();
  if (await goalCard.count() > 0) {
    await goalCard.scrollIntoViewIfNeeded();
    await wait(300);
  }
  await page.screenshot({ path: "screenshots/03-daily-statutory-goal-ring.png" });

  // 04: Mario Mystery Question Block
  console.log("Capturing 04...");
  const mysteryBlock = page.locator('button[title*="Mystery Question Block"], button:has-text("Mystery Law Block"), button:has-text("Hit [?] Law Block")').first();
  if (await mysteryBlock.count() > 0) {
    await mysteryBlock.scrollIntoViewIfNeeded();
    await mysteryBlock.click();
    await wait(600);
  }
  await page.screenshot({ path: "screenshots/04-mario-mystery-question-block.png" });

  // 05: Flagpole Streak Widget
  console.log("Capturing 05...");
  const flagpole = page.locator("text=5-Day Flagpole Streak").first();
  if (await flagpole.count() > 0) {
    await flagpole.scrollIntoViewIfNeeded();
    await wait(300);
  }
  await page.screenshot({ path: "screenshots/05-flagpole-streak-widget.png" });

  // 06: Six Worlds Mastery Timeline
  console.log("Capturing 06...");
  const timeline = page.locator("text=MUSHROOM KINGDOM 6-WORLD STAGE TIMELINE").first();
  if (await timeline.count() > 0) {
    await timeline.scrollIntoViewIfNeeded();
    await wait(300);
  }
  await page.screenshot({ path: "screenshots/06-six-worlds-mastery-timeline.png" });

  // 07: Daily Bar Challenge Scenario
  console.log("Capturing 07...");
  const challenge = page.locator("text=DAILY STATUTORY CHALLENGE").first();
  if (await challenge.count() > 0) {
    await challenge.scrollIntoViewIfNeeded();
    await wait(300);
  }
  await page.screenshot({ path: "screenshots/07-daily-bar-challenge-scenario.png" });

  // 08: Toadstool Campaign Quest Log
  console.log("Capturing 08...");
  const questLog = page.locator("text=TOADSTOOL CAMPAIGN QUEST LOG").first();
  if (await questLog.count() > 0) {
    await questLog.scrollIntoViewIfNeeded();
    await wait(300);
  }
  await page.screenshot({ path: "screenshots/08-toadstool-campaign-quest-log.png" });

  // 09: Consecutive Fire Flower Tracker
  console.log("Capturing 09...");
  const fireFlower = page.locator("text=CONSECUTIVE DAYS STUDIED TRACKER").first();
  if (await fireFlower.count() > 0) {
    await fireFlower.scrollIntoViewIfNeeded();
    await wait(300);
  }
  await page.screenshot({ path: "screenshots/09-consecutive-fire-flower-tracker.png" });

  // 10: Study Companion HUD Interactive (here we explicitly show Counsel Toad)
  console.log("Capturing 10...");
  await page.goto("http://localhost:3000/?autostart=1", { waitUntil: "domcontentloaded" });
  await wait(800);
  const companionHud = page.locator("text=Counsel Toad Esq.").first();
  if (await companionHud.count() > 0) {
    await companionHud.scrollIntoViewIfNeeded();
    await wait(300);
  }
  await page.screenshot({ path: "screenshots/10-study-companion-hud-interactive.png" });

  // 11: Navbar Tools Dropdown
  console.log("Capturing 11...");
  await page.goto("http://localhost:3000/?autostart=1&hide_companion=1", { waitUntil: "domcontentloaded" });
  await wait(500);
  const toolsBtn = page.locator('button[title*="Tools Menu"], button:has-text("Tools")').first();
  if (await toolsBtn.count() > 0) {
    await toolsBtn.click();
    await wait(500);
  }
  await page.screenshot({ path: "screenshots/11-navbar-tools-dropdown.png" });

  // 12: Audio Settings Volume Sliders
  console.log("Capturing 12...");
  await page.goto("http://localhost:3000/?autostart=1&hide_companion=1", { waitUntil: "domcontentloaded" });
  await wait(500);
  const audioBtn = page.locator('button[title*="Dedicated Audio Volume Sliders"]').first();
  if (await audioBtn.count() > 0) {
    await audioBtn.click();
    await wait(600);
  }
  await page.screenshot({ path: "screenshots/12-audio-settings-volume-sliders.png" });

  // 13: Theme Dark Mode Night
  console.log("Capturing 13...");
  await page.goto("http://localhost:3000/?autostart=1&hide_companion=1&theme=underground", { waitUntil: "domcontentloaded" });
  await wait(600);
  await page.screenshot({ path: "screenshots/13-theme-dark-mode-night.png" });

  // 14: Theme Peach Castle
  console.log("Capturing 14...");
  await page.goto("http://localhost:3000/?autostart=1&hide_companion=1&theme=peach_castle", { waitUntil: "domcontentloaded" });
  await wait(600);
  await page.screenshot({ path: "screenshots/14-theme-peach-castle.png" });

  // 15: Theme Yoshi Island
  console.log("Capturing 15...");
  await page.goto("http://localhost:3000/?autostart=1&hide_companion=1&theme=yoshi_island", { waitUntil: "domcontentloaded" });
  await wait(600);
  await page.screenshot({ path: "screenshots/15-theme-yoshi-island.png" });

  // 16: Theme Bowser Castle
  console.log("Capturing 16...");
  await page.goto("http://localhost:3000/?autostart=1&hide_companion=1&theme=bowser_lava", { waitUntil: "domcontentloaded" });
  await wait(600);
  await page.screenshot({ path: "screenshots/16-theme-bowser-castle.png" });

  // 17: Mobile Bottom Navigation Bar (mobile viewport 390x844)
  console.log("Capturing 17...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/?autostart=1&hide_companion=1", { waitUntil: "domcontentloaded" });
  await wait(600);
  await page.screenshot({ path: "screenshots/17-mobile-bottom-navigation-bar.png" });

  // 18: Mobile Drawer Menu
  console.log("Capturing 18...");
  const mobileMenuBtn = page.locator('button:has-text("Menu")').first();
  if (await mobileMenuBtn.count() > 0) {
    await mobileMenuBtn.click();
    await wait(600);
  }
  await page.screenshot({ path: "screenshots/18-mobile-drawer-menu.png" });

  // Restore desktop viewport
  await page.setViewportSize({ width: 1280, height: 800 });

  // 19: Modules Overview and Worlds
  console.log("Capturing 19...");
  await page.goto("http://localhost:3000/?tab=modules&autostart=1&hide_companion=1", { waitUntil: "domcontentloaded" });
  await wait(800);
  await page.screenshot({ path: "screenshots/19-modules-overview-and-worlds.png" });

  // 20: Module W1 Topic Expanded
  console.log("Capturing 20...");
  const topicExpandBtn = page.locator('button:has-text("Coverage & Exclusions"), button:has-text("Expand Topic Details")').first();
  if (await topicExpandBtn.count() > 0) {
    await topicExpandBtn.click();
    await wait(600);
  }
  await page.screenshot({ path: "screenshots/20-module-w1-topic-expanded.png" });

  console.log("=== BATCH 1 COMPLETE! ===");
}
