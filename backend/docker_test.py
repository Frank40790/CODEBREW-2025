import docker

# test running and reading output from docker container in python

# Connect to the Docker daemon
client = docker.from_env()

# Create and start the container with an arbitrary command
container = client.containers.get("tty-user-container")
result = container.exec_run(cmd="python3 visualiser.py 1", stdout=True, stderr=True, stream=True, demux=True, tty=True)

for stdout, stderr in result.output:
    if stdout:
        print(stdout.decode().strip())
    if stderr:
        print(stderr.decode().strip())