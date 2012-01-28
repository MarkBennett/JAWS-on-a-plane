(function() {

  var fps = document.getElementById("fps"),
      player, bullets, sharks;

  function startPlay() {
    player = jaws.Sprite({image: "assets/images/plane.png", x: 10, y: 100});
    player.can_shoot = true;
    player.health = 100;
    player.hit = false;
    player.score = 0;

    bullets = new jaws.SpriteList();
    sharks = new jaws.SpriteList();

    jaws.switchGameState(PlayState);
  }

  /** PlayState is the main state where players batter the sharks. */
  function PlayState() {

    this.setup = function() {
      jaws.on_keydown("esc", function() {
        jaws.switchGameState(PauseState);
      });
      jaws.preventDefaultKeys(["left", "right", "up", "down", "space"]);
    };
    this.update = function() {
      // Move the plane
      if(jaws.pressed("left")) { player.x -= 2; }
      if(jaws.pressed("right")) { player.x += 2; }
      if(jaws.pressed("down")) { player.y += 2; }
      if(jaws.pressed("up")) { player.y -= 2; }
      forceInsideCanvas(player);

      // Shoot
      if(jaws.pressed("space")) {
        if (player.can_shoot) {
          player.can_shoot = false;
          bullets.push(new jaws.Sprite({image: "assets/images/bullet.png", x: player.rect().right - 3, y: player.y + 5}));
          setTimeout(function() {
            player.can_shoot = true;
          }, 100);
        }
      }

      // Move bullets
      bullets.forEach(function(bullet) { bullet.x += 4});

      // Create new sharks
      if (sharks.length < 4) {
        if ((Math.random() * 100) < 3) {
          sharks.push(newShark());
        }
      }

      // Move the sharks
      sharks.forEach(function(shark) {
        shark.x -= 3;
        shark.y += shark.delta_y;
        if (shark.y < 0 || ((shark.y + shark.height) > jaws.height)) {
          shark.delta_y *= -1.0;
          shark.y += shark.delta_y;
        }
      });

      // Have we hit someone?
      jaws.collideOneWithMany(player, sharks).forEach(function(shark) {
        sharks.remove(shark);
        player.health -= 20;
        if (player.health <= 0) {
          jaws.switchGameState(GameOverState);
        }
        player.hit = true;
        setTimeout(function() {
          player.hit = false;
        }, 200);
      });

      // Did the bullets hit something
      jaws.collideManyWithMany(bullets, sharks).forEach(function(pair) {
        var shark = pair[1];
        bullets.remove(pair[0]);
        shark.health -= 25;
        if (shark.health <= 0) {
          sharks.remove(shark);
        }
      });

      // Increment the score
      player.score += Math.ceil(jaws.game_loop.tick_duration * 10 / 1000);

      bullets.deleteIf(jaws.isOutsideCanvas);
      sharks.deleteIf(jaws.isOutsideCanvas);
      fps.innerHTML = jaws.game_loop.fps;

      function newShark() {
        var shark = new jaws.Sprite({
          image: "assets/images/shark.png",
          x: jaws.width
        });
        shark.y = Math.random() * (jaws.height - shark.height);
        shark.delta_y = Math.random() * 2 - 1;
        shark.health = 100;
        return  shark;
      }
    };

    this.draw = function() {
      jaws.context.clearRect(0, 0, jaws.width, jaws.height);
      player.draw();
      bullets.draw();
      sharks.draw();

      if (player.hit) {
        jaws.context.drawImage(jaws.assets.get("assets/images/crash.png"), player. x - 10, player.y - 10);
      }

      // Draw HUD
      jaws.context.font = "bold 15pt terminal";
      jaws.context.lineWidth = 10;
      jaws.context.fillStyle = "Red";
      jaws.context.strokeStyle =  "rgba(200,200,200,0.0)";
      jaws.context.fillText("Health = " + player.health, 10, 20);

      jaws.context.fillStyle = "Black"
      jaws.context.fillText("Score = " + player.score, 300, 20);
    };

  };

  function PauseState() {
    var index = 0,
        states = ["Resume", "Quit"];

    this.setup = function() {
      jaws.on_keydown(["enter", "space"], function() {
        switch (index) {
          case 0:
            jaws.switchGameState(PlayState);
            break;
          case 1:
            jaws.switchGameState(MenuState);
            break;
        }
      });
      jaws.on_keydown("esc", function() {
        jaws.switchGameState(PlayState);
      });
      jaws.on_keydown("up", function() {
        index -= 1;
      });
      jaws.on_keydown("down", function() {
        index += 1;
      });
    };

    this.update = function() {
      if (index < 0) { index = states.length -1 };
      if (index === states.length) { index = 0 };
    };

    this.draw = function() {
      jaws.context.font = "bold 40pt terminal";
      jaws.context.lineWidth = 10;
      jaws.context.fillStyle = "Black";
      jaws.context.strokeStyle =  "rgba(200,200,200,0.0)";
      jaws.context.fillText("Paused", 100, 100);

      for (i = 0; i < states.length; i++) {
        jaws.context.font = "bold 20pt terminal";
        jaws.context.lineWidth = 10
        jaws.context.fillStyle = (index === i) ? "Red" : "Black"
        jaws.context.strokeStyle =  "rgba(200,200,200,0.0)"
        jaws.context.fillText(states[i], 100, 150 + (30 * i))
      }
      
    };
  }

  function GameOverState() {
    this.setup = function() {
      jaws.on_keydown(["esc", "space", "enter"], function() {
        startPlay();
      });
    };
    this.draw = function() {
      jaws.context.drawImage(jaws.assets.get("assets/images/sharkmouth.jpg"), 0, 0, jaws.width, jaws.height);

      jaws.context.font = "bold 60pt terminal";
      jaws.context.lineWidth = 10
      jaws.context.fillStyle = "Red"
      jaws.context.strokeStyle =  "rgba(200,200,200,0.0)"
      jaws.context.fillText("Game Over!", 30, 80)

      jaws.context.font = "bold 30pt terminal";
      jaws.context.fillStyle = "White"
      jaws.context.fillText("Press space to play again", 30, 260);
    };
  }

  /* MenuState is our lobby/welcome state where the gamer
   * can start the game. */
  function MenuState() {
    var index = 0,
        states = ["Start", "Help"]

    this.setup = function() {
      jaws.on_keydown(["enter", "space"], function() {
        switch (index) {
          case 0:
            startPlay();
            break;
          case 1:
            jaws.switchGameState(HelpState);
            break;
        }
      });
      jaws.on_keydown("up", function() {
        index -= 1;
      });
      jaws.on_keydown("down", function() {
        index += 1;
      });
    };

    this.update = function() {
      if (index < 0) { index = states.length -1 };
      if (index === states.length) { index = 0 };
    };

    this.draw = function() {
      var i;

      jaws.context.clearRect(0, 0, jaws.width, jaws.height);

      for (i = 0; i < states.length; i++) {
        jaws.context.font = "bold 40pt terminal";
        jaws.context.lineWidth = 10
        jaws.context.fillStyle = (index === i) ? "Red" : "Black"
        jaws.context.strokeStyle =  "rgba(200,200,200,0.0)"
        jaws.context.fillText(states[i], 30, 100 + (60 * i))
      }
    };
  };

  function HelpState() {
    this.setup = function() {
      jaws.on_keydown(["space", "enter"], function() {
        jaws.switchGameState(MenuState);
      });
    };
    this.update = function() {};
    this.draw = function() {
      jaws.context.clearRect(0, 0, jaws.width, jaws.height);

      jaws.context.font = "bold 15pt terminal";
      jaws.context.lineWidth = 10
      jaws.context.fillStyle = "Black"
      jaws.context.strokeStyle =  "rgba(200,200,200,0.0)"
      jaws.context.fillText("Move with arrows, shoot with space. Select with Enter.", 20, 20);
    };
  }

  /**
   * Force <b>item</b> inside canvas by setting items x/y parameters
   * <b>item</b> needs to have the properties x, y, width & height
   */
  forceInsideCanvas = function(item) {
    if(item.x < 0)              { item.x = 0  }
    if(item.x + item.width > jaws.width)     { item.x = jaws.width - item.width  }
    if(item.y < 0)              { item.y = 0 }
    if(item.y + item.height > jaws.height )    { item.y = jaws.height - item.height }
  }

  window.onload = function() {
    jaws.assets.add("assets/images/plane.png");
    jaws.assets.add("assets/images/bullet.png");
    jaws.assets.add("assets/images/shark.png");
    jaws.assets.add("assets/images/sharkmouth.jpg");
    jaws.assets.add("assets/images/crash.png");
    jaws.start(MenuState);
  };


}());
