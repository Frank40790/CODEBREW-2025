from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import sys

COMMAND_TRANSLATION = {
    "test": "python test.py",
    "ping": "ping -c 3 8.8.8.8",
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

class CommandResponse(BaseModel):
    output: str

async def stream_command_output(command_to_run: str):
    process = await asyncio.create_subprocess_shell(
        command_to_run,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT
    )

    if process.stdout is None:
        yield "Error: Could not capture subprocess output.\n"
        return

    try:
        while True:
            line = await process.stdout.readline()
            if not line:
                break
            yield line.decode(errors='replace')
    except Exception as e:
        yield f"Error during command execution: {e}\n"
    finally:
        try:
            await process.wait()
        except Exception:
            pass

@app.post("/api/terminal")
async def terminal(cmd: CommandRequest, request: Request):
    text = cmd.command.strip()

    async def empty_stream(msg: str):
        yield msg + "\n"

    if not text:
        return StreamingResponse(empty_stream(""), media_type="text/plain")

    if text in COMMAND_TRANSLATION:
        actual_command = COMMAND_TRANSLATION[text]
        return StreamingResponse(stream_command_output(actual_command),
                                 media_type="text/plain")

    return StreamingResponse(empty_stream("Method not allowed"),
                             media_type="text/plain")