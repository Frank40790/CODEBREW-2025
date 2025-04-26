import time
import random
import os
import sys

WIDTH = 70
HEIGHT = 20

def main():

    if len(sys.argv) < 2:
        return
    
    sorting_funcs = {1: bubble_sort, 2: quick_sort, 3: counting_sort, 4: radix_sort}
    test_sorting_algorithm("", sorting_funcs[int(sys.argv[1])])
    # test_sorting_algorithm("Quick Sort", quick_sort)
    # time.sleep(1)
    # test_sorting_algorithm("Counting Sort", counting_sort)
    # time.sleep(1)
    # test_sorting_algorithm("Radix Sort", radix_sort)

def terminal_print(str):
    print(str, flush=True)

def test_sorting_algorithm(name, sort_function):
    # Clear the screen
    # lear_screen()
    # sys.stdout.write('\r')
    
    # Create random array
    bar_heights = [random.randint(1, 20) for _ in range(10)]
    
    # Display initial state
    # print(f"\n{name} - Initial State:")
    
    # Run the sorting algorithm with visualization
    sort_function(bar_heights)

def create_grid():
    return [[' ' for _ in range(WIDTH)] for _ in range(HEIGHT)]

def draw_bars(grid, bar_heights):
    start = 0
    for height in bar_heights:
        draw_rectangle(grid, start, start + 4, 0, height)

        start += 6

def draw_rectangle(grid, x0, x1, y0, y1):
    # Invert y direction
    y0 = HEIGHT - y0 - 1
    y1 = HEIGHT - y1 - 1
    for i in range(y1, y0 + 1):
        if 0 <= i < HEIGHT:
            row = grid[i]
            for j in range(x0, x1 + 1):
                if 0 <= j < WIDTH:
                    row[j] = '#'

def visualize_state(bar_heights, highlighted_indices=None):
    grid = create_grid()
    
    # Draw bars
    start = 0
    for i, height in enumerate(bar_heights):
        char = '@' if highlighted_indices and i in highlighted_indices else '#'
        draw_bar(grid, start, height, char)
        start += 6
    
    terminal_print('\r')
    print_grid(grid)
    time.sleep(0.1)  # Slow down visualization

def draw_bar(grid, start, height, char='#'):
    # Draw the bar
    for i in range(HEIGHT - height - 1, HEIGHT - 1):
        for j in range(start, start + 5):
            if 0 <= j < WIDTH:
                grid[i][j] = char


def print_grid(grid):
    for i in range(HEIGHT):
        terminal_print("".join(grid[i]))

# Sorting Algorithms

def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            # Visualize comparison
            visualize_state(arr, [j, j+1])
            
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
                
                # Visualize after swap
                visualize_state(arr, [j, j+1])
        
        if not swapped:
            break

def quick_sort(arr):
    def partition(arr, low, high):
        pivot = arr[high]
        i = low - 1
        
        for j in range(low, high):
            # Visualize comparison with pivot
            visualize_state(arr, [j, high])
            
            if arr[j] <= pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
                
                # Visualize after swap
                visualize_state(arr, [i, j, high])
        
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        
        # Visualize after placing pivot
        visualize_state(arr, [i + 1])
        
        return i + 1
    
    def quick_sort_recursive(arr, low, high):
        if low < high:
            pi = partition(arr, low, high)
            quick_sort_recursive(arr, low, pi - 1)
            quick_sort_recursive(arr, pi + 1, high)
    
    quick_sort_recursive(arr, 0, len(arr) - 1)

def counting_sort(arr):
    # Find the maximum value
    max_val = max(arr)
    
    # Initialize count array
    count = [0] * (max_val + 1)
    
    # Count occurrences
    for num in arr:
        count[num] += 1
        visualize_state(arr, [arr.index(num)])
    
    # Reconstruct the sorted array
    i = 0
    for num in range(max_val + 1):
        while count[num] > 0:
            arr[i] = num
            i += 1
            count[num] -= 1
            visualize_state(arr, [i-1])

def radix_sort(arr):
    # Find the maximum number to know number of digits
    max_val = max(arr)
    exp = 1
    
    while max_val // exp > 0:
        counting_sort_for_radix(arr, exp)
        exp *= 10

def counting_sort_for_radix(arr, exp):
    n = len(arr)
    output = [0] * n
    count = [0] * 10
    
    # Count occurrences of each digit
    for i in range(n):
        index = arr[i] // exp % 10
        count[index] += 1
        visualize_state(arr, [i])
    
    # Change count[i] so that count[i] contains actual position of this digit in output[]
    for i in range(1, 10):
        count[i] += count[i - 1]
    
    # Build the output array
    i = n - 1
    while i >= 0:
        index = arr[i] // exp % 10
        output[count[index] - 1] = arr[i]
        count[index] -= 1
        i -= 1
    
    # Copy the output array to arr
    for i in range(n):
        arr[i] = output[i]
        visualize_state(arr, [i])

if __name__ == "__main__":
    main()