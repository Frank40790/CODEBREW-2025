import React, { useState, useRef, useEffect, FormEvent } from "react";

const crtBg = {
    background: "repeating-linear-gradient(180deg, #222 0px, #222 2px, #232323 4px, #222 6px)",
};

const textGlow = {
    textShadow: "0 0 2px #0f0, 0 0 8px #0f0",
};

interface TerminalLine {
    type: "input" | "output";
    text: string;
}

const apiBase = "http://localhost:8000";

const CRTTerminal: React.FC = () => {
    const [lines, setLines] = useState<TerminalLine[]>([
        { type: "output", text: "Welcome to student.tty" },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
    }, [lines]);

    const abortCtlRef = useRef<AbortController | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const command = input;

        if (command === "clear")
        {
            setLines([]);
            setInput("");
            return;
        }

        setLines(prev => [...prev, { type: "input", text: command }]);
        setInput("");
        setLoading(true);

        const abortCtl = new AbortController();
        abortCtlRef.current = abortCtl;
        let currentOutputIndex = -1;

        try {
            const res = await fetch(`${apiBase}/api/terminal`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command }),
                signal: abortCtl.signal,
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP error ${res.status}: ${errorText || res.statusText}`);
            }

            if (!res.body) throw new Error("Response has no body");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const decodedChunk = decoder.decode(value, { stream: true });
                if (!decodedChunk) continue;

                setLines(prev => {
                    const updated = [...prev];
                    const crPos = decodedChunk.lastIndexOf('\r');
                    const chunkHasCR = crPos !== -1;
                    const textToAdd = chunkHasCR ? decodedChunk.substring(crPos + 1) : decodedChunk;

                    const isCurrentOutputValid = currentOutputIndex !== -1 &&
                                                  currentOutputIndex < updated.length &&
                                                  updated[currentOutputIndex]?.type === 'output';

                    if (!isCurrentOutputValid) {
                        updated.push({ type: 'output', text: textToAdd });
                        currentOutputIndex = updated.length - 1;
                    } else {
                        if (chunkHasCR) {
                            updated[currentOutputIndex] = {
                                ...updated[currentOutputIndex],
                                text: textToAdd
                            };
                        } else {
                            updated[currentOutputIndex] = {
                                ...updated[currentOutputIndex],
                                text: updated[currentOutputIndex].text + textToAdd
                            };
                        }
                    }
                    return updated;
                });
            }

            const finalChunk = decoder.decode();
            if (finalChunk) {
                setLines(prev => {
                    const updated = [...prev];
                    const crPos = finalChunk.lastIndexOf('\r');
                    const chunkHasCR = crPos !== -1;
                    const textToAdd = chunkHasCR ? finalChunk.substring(crPos + 1) : finalChunk;

                    const isCurrentOutputValid = currentOutputIndex !== -1 &&
                                                  currentOutputIndex < updated.length &&
                                                  updated[currentOutputIndex]?.type === 'output';

                    if (!isCurrentOutputValid) {
                        updated.push({ type: 'output', text: textToAdd });
                    } else {
                        if (chunkHasCR) {
                            updated[currentOutputIndex] = { ...updated[currentOutputIndex], text: textToAdd };
                        } else {
                            updated[currentOutputIndex] = { ...updated[currentOutputIndex], text: updated[currentOutputIndex].text + textToAdd };
                        }
                    }
                    return updated;
                 });
            }


        } catch (err: any) {
            if (err.name === "AbortError") {
                setLines(prev => [...prev, { type: "output", text: "(cancelled)" }]);
            } else {
                setLines(prev => [...prev,
                { type: "output", text: "Error: Could not reach backend." }
                ]);
            }
        } finally {
            setLoading(false);
            abortCtlRef.current = null;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.ctrlKey && e.key === "c") {
            if (loading) {
                abortCtlRef.current?.abort();
                e.preventDefault();
            }
            return;
        }

        if (e.key === "ArrowUp" && lastCommand) {
            setInput(lastCommand);
            setTimeout(() =>
                inputRef.current?.setSelectionRange(lastCommand.length, lastCommand.length), 0);
        }
    };


    const [lastCommand, setLastCommand] = useState<string | null>(null);
    useEffect(() => {
        if (lines.length > 1) {
            const lastInput = [...lines].reverse().find((l) => l.type === "input");
            if (lastInput) setLastCommand(lastInput.text);
        }
    }, [lines]);

    return (
        <div className="min-h-screen min-w-screen flex items-center justify-center relative" style={crtBg}>
            {/* Scanner Overlay */}
            <div
                className="absolute inset-0 z-50 pointer-events-none"
                style={{
                    opacity: 0.75,
                    background:
                        "repeating-linear-gradient(180deg, rgba(14, 32, 12, 0.79) 1px, transparent 4px)",
                }}
            />

            {/* Terminal Content */}
            <div
                ref={containerRef}
                className="overflow-y-auto font-mono text-lg px-2 py-2 text-left relative z-0"
                style={{
                    fontSize: "20px", // 👈 Add this
                    ...textGlow
                }}
            >
                {lines.map((line, idx) => (
                    <div key={idx} className="whitespace-pre-wrap">
                        {line.type === "input" ? (
                            <span className="text-green-300">$ {line.text}</span>
                        ) : (
                            <span className="text-green-400">{line.text}</span>
                        )}
                    </div>
                ))}
                <form onSubmit={handleSubmit} className="flex items-center mt-2">
                    <span className="text-green-300">$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="bg-transparent border-none outline-none ml-2 flex-1 placeholder-green-400 text-green-200"
                        style={{
                            ...textGlow,
                            caretColor: "#00FF00",
                        }}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        readOnly={loading}
                        autoComplete="off"
                        spellCheck={false}
                        onKeyDown={handleKeyDown}
                        placeholder={loading ? "Waiting for response..." : "Type a command"}
                    />
                    {loading && (
                        <span className="ml-2 animate-pulse text-green-500">▌</span>
                    )}
                </form>
            </div>
        </div>
    );

};

export default CRTTerminal;
