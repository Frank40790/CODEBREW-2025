import re
import shlex
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import sys
import docker

COMMAND_TRANSLATION = {
    "ping": "ping -c 5 8.8.8.8",
    "bubble_sort": "/usr/bin/python3 visualiser.py 1",
    "quicksort": "/usr/bin/python3 visualiser.py 2",
    "counting_sort": "/usr/bin/python3 visualiser.py 3",
    "radix_sort": "/usr/bin/python3 visualiser.py 4",
}

BLACKLIST_COMMANDS = ["rm"]

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

# connect to docker
client = docker.from_env()
container = client.containers.get("tty-user-container")

class CommandRequest(BaseModel):
    command: str



def is_blacklisted(cmd: str) -> bool:
    blacklist_regex = re.compile(r"\b(?:%s)\b" % "|".join(map(re.escape, BLACKLIST_COMMANDS)))
    return bool(blacklist_regex.search(cmd)) or is_blacklisted_shlex(cmd, BLACKLIST_COMMANDS)

def is_blacklisted_shlex(cmd: str, blacklist) -> bool:
    try:
        lexer = shlex.shlex(cmd, posix=True)
        lexer.whitespace_split = True
        lexer.commenters = ""
        tokens = list(lexer)
    except ValueError:
        return True
    return any(tok in blacklist for tok in tokens)

async def stream_command_output(command_to_run: str, request: Request):
    result = container.exec_run(cmd=command_to_run, stdout=True, stderr=False, stream=True, demux=False)
    for output in result.output:
            if isinstance(output, tuple):
                # If output is demuxed
                stdout, _ = output
                chunk = (stdout or b'').decode('utf-8', errors='replace')
            else:
                # If output is not demuxed
                chunk = output.decode('utf-8', errors='replace')
                
            if chunk:
                yield chunk
                
            # Allow other tasks to run
            await asyncio.sleep(0)
            
            # Check if request is disconnected
            if await request.is_disconnected():
                break

async def empty_stream():
    pass

@app.post("/api/terminal")
async def terminal(cmd: CommandRequest, request: Request):
    text = cmd.command.strip()

    if not text:
        return StreamingResponse(empty_stream(), media_type="text/plain")

    return StreamingResponse(stream_command_output(text, request));

    # if (text in COMMAND_TRANSLATION) and not is_blacklisted(text):
    #     actual_command = COMMAND_TRANSLATION[text]
    #     return StreamingResponse(
    #         stream_command_output(actual_command, request),
    #         media_type="text/plain",
    #     )
    # else:
    #     return StreamingResponse("Method not allowed")
