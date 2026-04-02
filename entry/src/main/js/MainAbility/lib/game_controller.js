import { GAME_CONFIG } from './constants';

export const GameStatus = null;
(function (GameStatus) {
    GameStatus[GameStatus.waiting = 0] = 'waiting';
    GameStatus[GameStatus.shooting = 1] = 'shooting';
    GameStatus[GameStatus.gameover = 2] = 'gameover';
    GameStatus[GameStatus.levelcomplete = 3] = 'levelcomplete';
})(GameStatus || (GameStatus = {}));

export class GameController {
    constructor(gameRenderer) {
        this._timer = 0;
        this._gameStatus = GameStatus.waiting;
        this._rotationAngle = 0;
        this._rotationSpeed = GAME_CONFIG.BASE_ROTATION_SPEED;
        this._stuckPins = [];
        this._collisionPinIndex = -1;
        this._shootingPin = {
            x: GAME_CONFIG.SHOOT_START_X,
            y: GAME_CONFIG.SHOOT_START_Y,
            active: false
        };
        this._level = 0;
        this._pinsLeft = 0;
        this._score = 0;
        this._gameRenderer = gameRenderer;
        this.onStatusChange = null;
        this._levelCompleteTimer = 0;
    }

    _setStatus(status) {
        this._gameStatus = status;
        if (this.onStatusChange) {
            this.onStatusChange(GameStatus[status]);
        }
    }

    static getInstance(gameRenderer) {
        if (GameController._instance == null) {
            GameController._instance = new GameController(gameRenderer);
        }
        return GameController._instance;
    }

    getState() {
        return {
            status: this._gameStatus,
            rotationAngle: this._rotationAngle,
            stuckPins: this._stuckPins,
            collisionPinIndex: this._collisionPinIndex,
            shootingPin: this._shootingPin,
            level: this._level,
            pinsLeft: this._pinsLeft,
            score: this._score
        };
    }

    startGame() {
        this._level = 0;
        this._score = 0;
        this._loadLevel();
        if (this._timer) {
            clearInterval(this._timer);
        }
        this._timer = setInterval(() => this.update(), 16);
    }

    stopGame() {
        clearInterval(this._timer);
        this._timer = 0;
    }

    _loadLevel() {
        this._stuckPins = [];
        this._collisionPinIndex = -1;
        this._rotationAngle = 0;
        this._score = 0;
        this._levelCompleteTimer = 0;
        this._shootingPin = {
            x: GAME_CONFIG.SHOOT_START_X,
            y: GAME_CONFIG.SHOOT_START_Y,
            active: false
        };
        this._setStatus(GameStatus.waiting);

        let levelIdx = Math.min(this._level, GAME_CONFIG.PINS_PER_LEVEL.length - 1);
        this._pinsLeft = GAME_CONFIG.PINS_PER_LEVEL[levelIdx];

        let prePlaced = Math.min(this._level + 2, 5);
        for (let i = 0; i < prePlaced; i++) {
            this._stuckPins.push((i / prePlaced) * Math.PI * 2);
        }

        let speed = GAME_CONFIG.BASE_ROTATION_SPEED + this._level * GAME_CONFIG.SPEED_INCREMENT;
        this._rotationSpeed = speed;
    }

    onTouchEnd(event) {
        if (this._gameStatus === GameStatus.waiting) {
            this._shootingPin = {
                x: GAME_CONFIG.SHOOT_START_X,
                y: GAME_CONFIG.SHOOT_START_Y,
                active: true
            };
            this._setStatus(GameStatus.shooting);
        } else if (this._gameStatus === GameStatus.gameover) {
            this._level = 0;
            this._score = 0;
            this._loadLevel();
        }
    }

    update() {
        this._rotationAngle += this._rotationSpeed;

        if (this._gameStatus === GameStatus.levelcomplete) {
            this._levelCompleteTimer++;
            if (this._levelCompleteTimer >= 60) {
                this._level++;
                this._loadLevel();
            }
            this._gameRenderer.drawGame(this.getState());
            return;
        }

        if (this._gameStatus === GameStatus.shooting) {
            this._shootingPin.y -= GAME_CONFIG.SHOOT_SPEED;

            let dx = this._shootingPin.x - GAME_CONFIG.CENTER_X;
            let dy = (this._shootingPin.y - 40) - GAME_CONFIG.CENTER_Y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= GAME_CONFIG.CIRCLE_RADIUS) {
                let arrivalAngle = Math.atan2(dy, dx);
                let localAngle = arrivalAngle - this._rotationAngle;
                localAngle = ((localAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

                let collisionIdx = -1;
                for (let i = 0; i < this._stuckPins.length; i++) {
                    let diff = Math.abs(localAngle - this._stuckPins[i]);
                    diff = Math.min(diff, Math.PI * 2 - diff);
                    if (diff < GAME_CONFIG.MIN_PIN_ANGLE) {
                        collisionIdx = i;
                        break;
                    }
                }

                if (collisionIdx >= 0) {
                    this._collisionPinIndex = collisionIdx;
                    this._setStatus(GameStatus.gameover);
                } else {
                    this._stuckPins.push(localAngle);
                    this._score++;
                    this._pinsLeft--;
                    this._shootingPin.active = false;

                    if (this._pinsLeft <= 0) {
                        this._setStatus(GameStatus.levelcomplete);
                    } else {
                        this._shootingPin = {
                            x: GAME_CONFIG.SHOOT_START_X,
                            y: GAME_CONFIG.SHOOT_START_Y,
                            active: false
                        };
                        this._setStatus(GameStatus.waiting);
                    }
                }
            }
        }

        this._gameRenderer.drawGame(this.getState());
    }
}
GameController._instance = null;