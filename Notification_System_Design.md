# Stage 1

## Efficient Top 10 Maintenance Using a Min Heap

To maintain the top 10 notifications while new notifications keep arriving, use a fixed-size min heap of size 10. The heap stores the current best 10 notifications by their priority score. The smallest score stays at the root, so it is easy to compare every new notification against the weakest item currently in the top 10.

### 1. Priority score

Each notification gets a score using:

score = (weight * 100000000) + timestamp

The weight decides the business priority, and the timestamp breaks ties by recency. A larger score means a better notification.

### 2. Weight assignment

Use the given priority order:

- Placement = 3
- Result = 2
- Event = 1

This ensures Placement notifications always rank above Result, and Result ranks above Event when timestamps are comparable.

### 3. Recency calculation

Recency is represented by the notification timestamp. Newer notifications should rank higher when the priority type is the same. That is why the timestamp is added to the weighted base score.

### 4. Fixed heap size 10

Keep only 10 notifications in the heap at any time. As new notifications arrive:

- If the heap has fewer than 10 items, insert the new notification.
- If the heap already has 10 items, compare the new score with the smallest score at the root.

This keeps memory usage constant and avoids sorting the full list repeatedly.

### 5. Replacement logic

When the heap is full:

- If the new notification score is less than or equal to the root score, ignore it.
- If the new notification score is greater than the root score, remove the root and insert the new notification.

This guarantees that only the current top 10 notifications remain in the heap.

After all notifications are processed, the heap contains the best 10 notifications, but not in sorted order. If needed, extract them and sort descending before returning the final response.

### 6. Complexity analysis

- Inserting into the heap takes O(log 10), which is effectively O(1) because the heap size is fixed.
- Processing n notifications takes O(n log 10), which simplifies to O(n).
- Space usage is O(10), which simplifies to O(1).

This approach is efficient, scalable, and suitable for a live notification stream where new items arrive continuously.