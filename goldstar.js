// ...context above...
        for (const pu of picked) {
          if (pu.type === "red-punch") {
            state.goldStar.redKills++;
            if (state.goldStar.redKills % 5 === 0 && state.goldStar.redPunchLevel < 5) {
              state.goldStar.redPunchLevel++;
              levelUpGoldStar();
            }
            createExplosion(pu.x, pu.y, "orange");
            state.addScore(8);
          }
          else if (pu.type === "blue-cannon") {
            state.goldStar.blueKills++;
            if (state.goldStar.blueKills % 5 === 0 && state.goldStar.blueCannonnLevel < 5) {
              state.goldStar.blueCannonnLevel++;
              levelUpGoldStar();
            }
            createExplosion(pu.x, pu.y, "cyan");
            state.addScore(8);
          }
          else if (pu.type === "health") {
            state.goldStar.health = Math.min(state.goldStar.maxHealth, state.goldStar.health+30);
            state.player.health = Math.min(state.player.maxHealth, state.player.health+30);
            createExplosion(pu.x, pu.y, "magenta");
            state.addScore(5);
          }
          else if (pu.type === "reflect") {
            state.goldStar.reflectAvailable = true;
            state.player.reflectAvailable = true;
            createExplosion(pu.x, pu.y, "magenta");
            state.addScore(12);
          }
        }
-       state.powerUps = state.powerUps.filter(p => !picked.includes(p));
+       // Use the exported mutator instead of reassigning the imported binding
+       state.filterPowerUps(p => !picked.includes(p));
