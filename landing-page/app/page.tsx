"use client";

import { useState, useEffect, useRef } from "react";
import AsciiDisplay from "@/components/ascii_display";
import Link from "next/link";

const crtBg = {
  background: "repeating-linear-gradient(180deg, #222 0px, #222 2px, #232323 4px, #222 6px)",
};  

const textGlow = {
  textShadow: "0 0 2px #0f0, 0 0 8px #0f0",
};

const HEIGHT = 40;
const WIDTH = 100;


const streams: MatrixStream[] = [];

interface MatrixStream {
    position: number; // position of front (bottom character) on screen
    speed: number;
    length: number;
    chars: string[];
}

const matrix_init = (width: number, height: number) => {
    // generate initial matrix streams
    for (let i = 0; i < width; i++) {
        const stream: MatrixStream = generate_stream();
        streams.push(stream);
    }

    return Array(height).fill(null).map(() => Array(width).fill(' '))
}

const matrix_next_frame = (frameBuffer: string[][], width: number, height: number) => {
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            frameBuffer[i][j] = ' ';
        }   
    }

    streams.forEach((stream: MatrixStream, x: number) => {
        stream.position += stream.speed;

        // reset stream if fully below screen
        if (stream.position - stream.length > height) {
            streams[x] = generate_stream();
            return;
        }

        // otherwise render stream on the framebuffer
        for (let i = 0; i < stream.length; i++) {
            const y: number = stream.position - i;
            if (y >= 0 && y < height) {
                frameBuffer[y][x] = stream.chars[i];
            }
        }

        // change front character to random character
        // emulating the effect in cmatrix
        // stream.chars[0] = random_char();
    });

    return frameBuffer;
}

const generate_stream = () => {
    const stream: MatrixStream = {position: 0, speed: 0, length: 0, chars: []};
    
    stream.position = 0 - Math.floor(Math.random() * 20);
    stream.speed = 1 + Math.floor(Math.random() * 2);
    // stream.speed = 1;
    stream.length = Math.floor(Math.random() * 15) + 5;
    
    for (let i = 0; i < stream.length; i++) {
        stream.chars.push('#');
    }

    return stream;
}

export default function Home() {
  const [frameBuffer, setFrameBuffer] = useState<string[][]>(Array(HEIGHT).fill(null).map(() => Array(WIDTH).fill(' ')));
  const animationRequestID = useRef<number>(0);

  useEffect(() => {
    let current: string[][] = matrix_init(WIDTH, HEIGHT);
    const animationSpeed: number = 15;

    const fpsInterval: number = 1000 / animationSpeed;
    let next: string[][];
    let then: number = Date.now();
    let now: number;
    let elapsed: number;


    const animate = () => {
      now = Date.now();
      elapsed = now - then;

      if (elapsed > fpsInterval) {
        // we've passed the time needed in between frames
        // so we can now update the state of the board
        then = now - (elapsed % fpsInterval);
        next = matrix_next_frame(current, WIDTH, HEIGHT);
        setFrameBuffer(next);
        current = [...next];
      }
      animationRequestID.current = requestAnimationFrame(animate);
    }

    animationRequestID.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationRequestID.current);
    };
  }, []);

  return (
    <main className="min-h-screen flex justify-center items-center flex-col" style={crtBg}>
      {/* scan line overlay */}
      <div
        className="absolute inset-0 z-50 pointer-events-none"
        style={{
            opacity: 0.75,
            background:
                "repeating-linear-gradient(180deg, rgba(14, 32, 12, 0.79) 1px, transparent 4px)",
        }}
      />
      
      <div className="absolute opacity-40 flex z-0">
        <AsciiDisplay frameBuffer={frameBuffer}/>
      </div>
      <div className="z-10">
        <h1 style={textGlow} className="text-6xl font-bold">Student.TTY</h1>
        <p className="text-lg">Web-based terminal environment to teach students CS Fundamentals.</p>
        <Link href="" className="text-2xl hover:underline hover:cursor-pointer">Try Out</Link>
      </div>
    </main>
  )
}
