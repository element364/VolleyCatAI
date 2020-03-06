const {
  WIDTH,
  GROUND_PLANE_HEIGHT,
  GRAVITATION,
  STANDARD_BALL_HEIGHT,
  BALL_GRAVITATION,
  BALL_RADIUS,
  BALL_COLLISION_VELOCITY,
  BLOBBY_JUMP_ACCELERATION,
  BLOBBY_JUMP_BUFFER,
  BLOBBY_SPEED,
  BLOBBY_LOWER_SPHERE,
  BLOBBY_LOWER_RADIUS,
  BLOBBY_UPPER_SPHERE,
  BLOBBY_UPPER_RADIUS,
  NET_POSITION_X,
  NET_SPHERE_POSITION,
  NET_RADIUS
} = require('../client/constants');

function getInitialState() {
  return {
    isGameRunning: false,
    isBallValid: true,
    servingPlayer: '',
    timeSinceBallout: 0,
    leftPlayer: {
      score: 0,
      hitCount: 0,
      x: 200,
      y: GROUND_PLANE_HEIGHT,
      vX: 0,
      vY: 0,
      input: { left: 0, right: 0, up: 0 }
    },
    rightPlayer: {
      score: 0,
      hitCount: 0,
      x: 600,
      y: GROUND_PLANE_HEIGHT,
      vX: 0,
      vY: 0,
      input: {
        left: 0,
        right: 0,
        up: 0
      }
    },
    ball: {
      x: 200,
      y: STANDARD_BALL_HEIGHT,
      vX: 0,
      vY: 0
    },
    players: []
  };
}

function nextPlayerState(state, player) {
  if (state[player].input.up) {
    if (state[player].y >= GROUND_PLANE_HEIGHT) {
      state[player].vY = -BLOBBY_JUMP_ACCELERATION;
    }

    state[player].vY -= BLOBBY_JUMP_BUFFER;
  }
  state[player].vX =
    (state[player].input.right ? BLOBBY_SPEED : 0.0) -
    (state[player].input.left ? BLOBBY_SPEED : 0.0);

  state[player].vY += GRAVITATION;

  state[player].x += state[player].vX;
  state[player].y += state[player].vY;

  if (state[player].y > GROUND_PLANE_HEIGHT) {
    state[player].y = GROUND_PLANE_HEIGHT;
    state[player].vY = 0;
  }
}

function playerBottomBallCollision(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1) <= BALL_RADIUS + BLOBBY_LOWER_RADIUS;
}

function playerTopBallCollision(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1) <= BALL_RADIUS + BLOBBY_UPPER_RADIUS;
}

function playerBallCollision(state, player) {
  if (
    playerBottomBallCollision(
      state.ball.x,
      state.ball.y,
      state[player].x,
      state[player].y + BLOBBY_LOWER_SPHERE
    )
  ) {
    state.ball.vX = -(state[player].x - state.ball.x);
    state.ball.vY = -(state[player].y + BLOBBY_LOWER_SPHERE - state.ball.y);

    // normalization and scale
    const l = Math.hypot(state.ball.vX, state.ball.vY);
    state.ball.vX = (state.ball.vX / l) * BALL_COLLISION_VELOCITY;
    state.ball.vY = (state.ball.vY / l) * BALL_COLLISION_VELOCITY;

    state.ball.x += state.ball.vX;
    state.ball.y += state.ball.vY;

    state.isGameRunning = true;
    state[player].hitCount++;
    state[player === 'leftPlayer' ? 'rightPlayer' : 'leftPlayer'].hitCount = 0;
  } else if (
    playerTopBallCollision(
      state.ball.x,
      state.ball.y,
      state[player].x,
      state[player].y - BLOBBY_UPPER_SPHERE
    )
  ) {
    state.ball.vX = -(state[player].x - state.ball.x);
    state.ball.vY = -(state[player].y - BLOBBY_UPPER_SPHERE - state.ball.y);

    // normalization and scale
    const l = Math.hypot(state.ball.vX, state.ball.vY);
    state.ball.vX = (state.ball.vX / l) * BALL_COLLISION_VELOCITY;
    state.ball.vY = (state.ball.vY / l) * BALL_COLLISION_VELOCITY;

    state.ball.x += state.ball.vX;
    state.ball.y += state.ball.vY;

    state.isGameRunning = true;
    state[player].hitCount++;
    state[player === 'leftPlayer' ? 'rightPlayer' : 'leftPlayer'].hitCount = 0;
  }
}

function getNextState(state) {
  nextPlayerState(state, 'rightPlayer');
  nextPlayerState(state, 'leftPlayer');

  if (state.isGameRunning) {
    state.ball.vY += BALL_GRAVITATION;
  }

  state.ball.y += state.ball.vY;
  state.ball.x += state.ball.vX;

  // Player collision
  if (state.isBallValid) {
    playerBallCollision(state, 'leftPlayer');
    playerBallCollision(state, 'rightPlayer');
    // Ball to ground Collision
  } else if (state.ball.y + BALL_RADIUS > 500.0) {
    state.ball.vY = -state.ball.vY * 0.5;
    state.ball.vX *= 0.55;
    state.ball.y = 500.0 - BALL_RADIUS;
  }

  // Border collision
  if (state.ball.x - BALL_RADIUS <= 0 && state.ball.vX < 0) {
    state.ball.vX = -state.ball.vX;
  } else if (state.ball.x + BALL_RADIUS >= WIDTH && state.ball.vX > 0) {
    state.ball.vX = -state.ball.vX;
  } else if (
    state.ball.y > NET_SPHERE_POSITION &&
    Math.abs(state.ball.x - NET_POSITION_X) < BALL_RADIUS + NET_RADIUS
  ) {
    state.ball.vX = -state.ball.vX;
    state.ball.x += state.ball.vX;
    state.ball.y += state.ball.vY;
  } else {
    // Net collision
    const tmp = {
      x: NET_POSITION_X - state.ball.x,
      y: NET_SPHERE_POSITION - state.ball.y
    };

    let ballNetDistance = Math.hypot(tmp.x, tmp.y);

    if (ballNetDistance < NET_RADIUS + BALL_RADIUS) {
      // Normalize
      tmp.x = tmp.x / ballNetDistance;
      tmp.y = tmp.y / ballNetDistance;

      // Reflect
      const dotProduct = state.ball.vX * tmp.x + state.ball.vY * tmp.y;
      state.ball.vX -= tmp.x * 2 * dotProduct * 0.75;
      state.ball.vY -= tmp.y * 2 * dotProduct * 0.75;

      while (ballNetDistance < NET_RADIUS + BALL_RADIUS) {
        state.ball.x += state.ball.vX;
        state.ball.y += state.ball.vY;

        ballNetDistance = Math.hypot(
          NET_POSITION_X - state.ball.x,
          NET_SPHERE_POSITION - state.ball.y
        );
      }
    }
  }

  // Collision between blobby and the net
  if (state.leftPlayer.x + BLOBBY_LOWER_RADIUS > NET_POSITION_X - NET_RADIUS) {
    state.leftPlayer.x = NET_POSITION_X - NET_RADIUS - BLOBBY_LOWER_RADIUS;
  }
  if (state.rightPlayer.x - BLOBBY_LOWER_RADIUS < NET_POSITION_X + NET_RADIUS) {
    state.rightPlayer.x = NET_POSITION_X + NET_RADIUS + BLOBBY_LOWER_RADIUS;
  }

  // Collision between blobby and the border
  if (state.leftPlayer.x < 0) {
    state.leftPlayer.x = 0;
  }
  if (state.rightPlayer.x > WIDTH) {
    state.rightPlayer.x = WIDTH;
  }

  // Check win
  if (
    (state.isBallValid &&
      state.ball.y > GROUND_PLANE_HEIGHT &&
      state.ball.x < NET_POSITION_X) ||
    state.leftPlayer.hitCount > 3
  ) {
    if (state.leftPlayer.hitCount > 3) {
      state.ball.vX *= 0.6;
      state.ball.vY *= 0.6;
    }
    state.rightPlayer.score++;
    state.isBallValid = false;

    state.leftPlayer.hitCount = 0;
    state.rightPlayer.hitCount = 0;

    state.timeSinceBallout = 0;
    state.servingPlayer = 'right';
  }

  if (
    (state.isBallValid &&
      state.ball.y > GROUND_PLANE_HEIGHT &&
      state.ball.x > NET_POSITION_X) ||
    state.rightPlayer.hitCount > 3
  ) {
    if (state.rightPlayer.hitCount > 3) {
      state.ball.vX *= 0.6;
      state.ball.vY *= 0.6;
    }

    state.leftPlayer.score++;
    state.isBallValid = false;

    state.leftPlayer.hitCount = 0;
    state.rightPlayer.hitCount = 0;

    state.timeSinceBallout = 0;
    state.servingPlayer = 'left';
  }

  if (state.servingPlayer !== '') {
    state.timeSinceBallout++;

    if (state.timeSinceBallout > 120) {
      if (state.servingPlayer === 'left') {
        state.ball.x = 200;
        state.ball.y = STANDARD_BALL_HEIGHT;
      }

      if (state.servingPlayer === 'right') {
        state.ball.x = 600;
        state.ball.y = STANDARD_BALL_HEIGHT;
      }

      state.ball.vX = 0;
      state.ball.vY = 0;
      state.leftPlayer.x = 200;
      state.leftPlayer.y = GROUND_PLANE_HEIGHT;
      state.rightPlayer.x = 600;
      state.rightPlayer.y = GROUND_PLANE_HEIGHT;

      state.isGameRunning = false;
      state.isBallValid = true;

      state.servingPlayer = '';
    }
  }

  return state;
}

module.exports = {
  getInitialState,
  getNextState
};
