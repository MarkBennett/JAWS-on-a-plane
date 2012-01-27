(function() {
  var fps = document.getElementById("fps");

  /** PlayState is the main state where players batter the sharks. */
  function PlayState() {
    this.setup = function() {
      jaws.on_keydown("esc", function() {
        jaws.switchGameState(MenuState);
      });
    };
    this.draw = function() {
      jaws.context.clearRect(0, 0, jaws.width, jaws.height);
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
    jaws.start(MenuState);
  };

}());
