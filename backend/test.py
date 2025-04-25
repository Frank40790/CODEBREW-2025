import time
dir = 1
for i in range(0, 10):
    # print(f"\n{i} " * dir * dir * 10, flush=True)

    for j in range(10):
        if dir == -1:
            print('*' * 5, flush=True)
            continue
        print('*' * 10, flush=True)
    
    time.sleep(0.5)
    print("\r", end="", flush=True)
    dir *= -1

