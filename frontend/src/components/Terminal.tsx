import React, { useState, useRef, useEffect, FormEvent } from "react";

const crtBg = {
    background: "repeating-linear-gradient(180deg, #222 0px, #222 2px, #232323 4px, #222 6px)",
};

interface TerminalLine {
    type: "input" | "output";
    text: string;
}

const apiBase = "http://localhost:8000"

const CRTTerminal: React.FC = () => {
    const [lines, setLines] = useState<TerminalLine[]>([
        { type: "output", text: "Welcome to CRT Terminal! Type a command." },
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const command = input;
        setLines((prev) => [...prev, { type: "input", text: command }]);
        setInput("");
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/api/terminal`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command }),
            });
            const data = await res.json();
            setLines((prev) => [
                ...prev,
                { type: "output", text: data.output || "(no output)" },
            ]);
        } catch (err) {
            setLines((prev) => [
                ...prev,
                { type: "output", text: "Error: Could not reach backend." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const [lastCommand, setLastCommand] = useState<string | null>(null);
    useEffect(() => {
        if (lines.length > 1) {
            const lastInput = [...lines].reverse().find((l) => l.type === "input");
            if (lastInput) setLastCommand(lastInput.text);
        }
    }, [lines]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowUp" && lastCommand) {
            setInput(lastCommand);
            setTimeout(() => inputRef.current?.setSelectionRange(lastCommand.length, lastCommand.length), 0);
        }
    };

    return (
        <div className="min-h-screen min-w-screen flex items-center justify-center" style={crtBg}>

            <div
                ref={containerRef}
                className="overflow-y-auto font-mono text-green-400 text-lg px-2 py-2 text-left"
                style={{
                    textShadow: "0 0 2px #0f0, 0 0 8px #0f0",
                    ...crtBg,
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
                        className="bg-transparent border-none outline-none text-green-200 ml-2 flex-1 placeholder-green-700"
                        style={{
                            textShadow: "0 0 2px #0f0, 0 0 8px #0f0",
                            caretColor: "#00FF00",
                        }}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        autoComplete="off"
                        spellCheck={false}
                        onKeyDown={handleKeyDown}
                        placeholder={loading ? "Waiting for response..." : "Type a command"}
                    />
                    {loading && (
                        <span className="ml-2 animate-pulse text-green-500">▌</span>
                    )}
                </form>
                <div
                    className="pointer-events-none absolute inset-0 opacity-20"
                    style={{
                        background:
                            "repeating-linear-gradient(180deg, rgba(0,255,0,0.05) 0px, rgba(0,255,0,0.05) 2px, transparent 4px, transparent 6px)",
                    }}
                />
            </div>
        </div>
    );
};

export default CRTTerminal;
