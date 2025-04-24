from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import sys

COMMAND_TRANSLATION = {
    "ping": "ping -c 5 8.8.8.8",
    "visualise": "python3 visualiser.py"
}

app = FastAPI(
    title="Terminal API",
    description="Runs backend for terminal execution for the React CRT terminal.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CommandRequest(BaseModel):
    command: str

async def stream_command_output(command_to_run: str, request: Request):
    process = await asyncio.create_subprocess_shell(
        command_to_run,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    try:
        while True:
            if process.stdout is None:
                break

            line = await process.stdout.readline()
            if not line:
                break

            yield line.decode(errors="replace")
    except asyncio.CancelledError:
        process.terminate()
    finally:
        try:
            await asyncio.wait_for(process.wait(), timeout=2)
        except asyncio.TimeoutError:
            process.kill()

async def empty_stream():
    pass

@app.post("/api/terminal")
async def terminal(cmd: CommandRequest, request: Request):
    text = cmd.command.strip()

    if not text:
        
        return StreamingResponse(empty_stream(), media_type="text/plain")

    if text in COMMAND_TRANSLATION:
        actual_command = COMMAND_TRANSLATION[text]
        return StreamingResponse(
            stream_command_output(actual_command, request),
            media_type="text/plain",
        )
    else:
        return StreamingResponse("Method not allowed")
