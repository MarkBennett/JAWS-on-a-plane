(function() {

  var fps = document.getElementById("fps");

  /** PlayState is the main state where players batter the sharks. */
  function PlayState() {
    var player;

    this.setup = function() {
      player = jaws.Sprite({image: "assets/images/plane.png", x: 10, y: 100});
      jaws.log("Player width = " + player.width + ", height = " + player.height);
      jaws.on_keydown("esc", function() {
        jaws.switchGameState(MenuState);
      });
      jaws.preventDefaultKeys(["left", "right", "up", "down"]);
    };
    this.update = function() {
      // Move the plane
      if(jaws.pressed("left")) { player.x -= 2; }
      if(jaws.pressed("right")) { player.x += 2; }
      if(jaws.pressed("down")) { player.y += 2; }
      if(jaws.pressed("up")) { player.y -= 2; }
      forceInsideCanvas(player);

      fps.innerHTML = jaws.game_loop.fps;
    };

    this.draw = function() {
      jaws.context.clearRect(0, 0, jaws.width, jaws.height);
      player.draw();
    };
  };

  /* MenuState is our lobby/welcome state where the gamer
   * can start the game. */
  function MenuState() {
    var index = 0;

    this.setup = function() {
      jaws.on_keydown(["enter", "space"], function() {
        jaws.switchGameState(PlayState);
      });
    };

    this.draw = function() {
      jaws.context.clearRect(0, 0, jaws.width, jaws.height);

      jaws.context.font = "bold 50pt terminal";
      jaws.context.lineWidth = 10
      jaws.context.fillStyle = "Black"
      jaws.context.strokeStyle =  "rgba(200,200,200,0.0)"
      jaws.context.fillText("Start", 30, 100)
    };
  };

  window.onload = function() {
    jaws.assets.add("assets/images/plane.png");
    jaws.start(MenuState);
  };

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

}());
