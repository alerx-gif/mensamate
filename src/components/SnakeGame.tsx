'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import styles from './SnakeGame.module.css';

interface SnakeGameProps {
    onClose: () => void;
}

type Point = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION: Point = { x: 0, y: -1 };
const TICK_RATE = 150; // ms

export default function SnakeGame({ onClose }: SnakeGameProps) {
    const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
    const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
    const lastDirectionRef = useRef<Point>(INITIAL_DIRECTION);
    const [food, setFood] = useState<Point>({ x: 5, y: 5 });
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [isPaused, setIsPaused] = useState<boolean>(false);

    const generateFood = useCallback((currentSnake: Point[]) => {
        let newFood: Point;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            };
            // eslint-disable-next-line no-loop-func
            const isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
            if (!isOnSnake) break;
        }
        setFood(newFood);
    }, []);

    const resetGame = () => {
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        lastDirectionRef.current = INITIAL_DIRECTION;
        setGameOver(false);
        setScore(0);
        generateFood(INITIAL_SNAKE);
    };

    useEffect(() => {
        generateFood(INITIAL_SNAKE);
    }, [generateFood]);

    const changeDirection = useCallback((newDir: Point) => {
        const lastDir = lastDirectionRef.current;
        if (newDir.x !== 0 && lastDir.x === -newDir.x) return;
        if (newDir.y !== 0 && lastDir.y === -newDir.y) return;
        setDirection(newDir);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameOver) return;
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    changeDirection({ x: 0, y: -1 });
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    changeDirection({ x: 0, y: 1 });
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    changeDirection({ x: -1, y: 0 });
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    changeDirection({ x: 1, y: 0 });
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown, { passive: false });
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameOver, changeDirection]);

    useEffect(() => {
        if (gameOver || isPaused) return;

        const moveSnake = () => {
            setSnake(prevSnake => {
                const newSnake = [...prevSnake];
                const head = { ...newSnake[0] };

                head.x += direction.x;
                head.y += direction.y;

                lastDirectionRef.current = direction; // Update ref to what actually executed

                // Check collision with walls
                if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                    setGameOver(true);
                    return prevSnake;
                }

                // Check collision with self
                if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
                    setGameOver(true);
                    return prevSnake;
                }

                newSnake.unshift(head);

                // Check food collision
                if (head.x === food.x && head.y === food.y) {
                    setScore(s => s + 10);
                    generateFood(newSnake);
                } else {
                    newSnake.pop();
                }

                return newSnake;
            });
        };

        const intervalId = setInterval(moveSnake, TICK_RATE);
        return () => clearInterval(intervalId);
    }, [direction, food, gameOver, isPaused, generateFood]);

    return (
        <div className={styles.overlay}>
            <div className={styles.header}>
                <h2 className={styles.title}>Snake</h2>
                <div className={styles.score}>Score: {score}</div>
                <button className={styles.closeButton} onClick={onClose} aria-label="Close Game">
                    <X size={24} />
                </button>
            </div>

            <div className={styles.gameBoard}>
                {snake.map((segment, i) => (
                    <div
                        key={i}
                        className={`${styles.snakeSegment} ${i === 0 ? styles.snakeHead : ''}`}
                        style={{
                            left: `${(segment.x / GRID_SIZE) * 100}%`,
                            top: `${(segment.y / GRID_SIZE) * 100}%`,
                            width: `${100 / GRID_SIZE}%`,
                            height: `${100 / GRID_SIZE}%`,
                        }}
                    />
                ))}
                <div
                    className={styles.food}
                    style={{
                        left: `${(food.x / GRID_SIZE) * 100}%`,
                        top: `${(food.y / GRID_SIZE) * 100}%`,
                        width: `${100 / GRID_SIZE}%`,
                        height: `${100 / GRID_SIZE}%`,
                    }}
                />
                {gameOver && (
                    <div className={styles.gameOver}>
                        <h2>Game Over!</h2>
                        <p>Final Score: {score}</p>
                        <button className={styles.restartButton} onClick={resetGame}>
                            Play Again
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.controls}>
                <div 
                    className={`${styles.controlButton} ${styles.up}`} 
                    onPointerDown={(e) => { e.preventDefault(); changeDirection({ x: 0, y: -1 }); }}
                >
                    <ChevronUp size={32} />
                </div>
                <div 
                    className={`${styles.controlButton} ${styles.left}`} 
                    onPointerDown={(e) => { e.preventDefault(); changeDirection({ x: -1, y: 0 }); }}
                >
                    <ChevronLeft size={32} />
                </div>
                <div 
                    className={`${styles.controlButton} ${styles.right}`} 
                    onPointerDown={(e) => { e.preventDefault(); changeDirection({ x: 1, y: 0 }); }}
                >
                    <ChevronRight size={32} />
                </div>
                <div 
                    className={`${styles.controlButton} ${styles.down}`} 
                    onPointerDown={(e) => { e.preventDefault(); changeDirection({ x: 0, y: 1 }); }}
                >
                    <ChevronDown size={32} />
                </div>
            </div>
        </div>
    );
}
