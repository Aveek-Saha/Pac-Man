# Pac-Man

A re-creation of the classic Pac-Man game created using Phaser. The ghosts use improved AI to track down Pac-Man faster.

### Play it here: [Pac-Man](https://home.aveek.io/Pac-Man)

## Gameplay
<img src="/recording.gif" width="250" height="auto"/>


# Ghost AI 👾

The game map is represented as a 2D array where each cell has either a `0` or `1`. `0` represents a wall and `1` is a traversable path. This 2D array is what gets passed to the `A*` function which returns an array of steps the ghosts should follow to reach Pac-Man. The function uses the A* algorithm to find the best path for the ghosts to take.
 
Since Pac-Man's position is constantly changing, we only need to get the first step from the array of steps and move the ghost. The path that the ghosts take is highlighted by tracing the path returned by the A* function.

# Controlling Pac-Man 🎮

Move right: <kbd>🠊</kbd> | 
Move left: <kbd>🠈</kbd> | 
Move up: <kbd>🠉</kbd> | 
Move down: <kbd>🠋</kbd>

The game ends when a ghost catches you, refresh the page to restart.

# Development

To develop, clone the repo and start the dev server
```
git clone git@github.com:Aveek-Saha/Pac-Man.git
cd Pac-Man
npm start
```

This will automatically open http://localhost:8080/

# Assets

All assets are from [kenney.nl](https://kenney.nl/)

# Team
This project was a team effort by

| Name | GitHub Profile |
|:---:|:---:|
|  Aveek Saha | [aveek-saha](https://github.com/aveek-saha) |
|  Gopal Nambiar | [gopuman](https://github.com/gopuman) |
|  Arvind Srinivasan | [arvindsrinivasan](https://github.com/arvindsrinivasan) |