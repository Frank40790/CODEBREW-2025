"use client";

import AsciiDisplay from "@/components/ascii_display";
import { useState, useEffect, useRef } from "react";

const crtBg = {
  background: "repeating-linear-gradient(180deg, #222 0px, #222 2px, #232323 4px, #222 6px)",
};  

const textGlow = {
  textShadow: "0 0 2px #0f0, 0 0 8px #0f0",
};

const HEIGHT = 40;
const WIDTH = 100;

const sine_wave = (framebuffer: string[][], phase: number) => {
  const rows = HEIGHT;
  const cols = WIDTH;

  const amplitude = 5;
  const frequency = 0.1;
  const offset = 30;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      framebuffer[i][j] = ' ';
    }
  }

  for (let i = 0; i < rows; i++) {
    // Calculate x position for this row
    const y = i;

    // plot on either side
    // translate x left and right

    const x1 = Math.floor(
      cols / 2 + 
      amplitude * 
      Math.sin(frequency * y + phase)
    ) - offset;

    const x2 = Math.floor(
      cols / 2 -
      amplitude * 
      Math.sin(frequency * y + phase)
    ) + offset;
    
    // Make sure x is within grid bounds
    if (x1 >= 0 && x1 < cols && x2 >= 0 && x2 < cols) {
      framebuffer[i][x1] = '*';
      framebuffer[i][x2] = '*';
    }

    // fill gap between 

    for (let j = x1; j < x2; j++) {
      framebuffer[i][j] = '*';
    }
  }

  return framebuffer;
}


let streams: MatrixStream[] = [];

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
    let animationSpeed: number = 15;
    let phase = 0;
    const speed = 0.08;

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
      phase += speed
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
        <p className="text-lg">Web-based terminal to teach students their CS Fundamentals.</p>
        <button onClick={() => alert("Clicked")} className="text-2xl hover:underline hover:cursor-pointer">Try Out</button>
      </div>
    </main>
  )
}
