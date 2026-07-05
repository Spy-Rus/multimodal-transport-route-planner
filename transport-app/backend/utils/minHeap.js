class MinHeap {

    constructor() {
        this.heap = [];
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    insert(item) {

        this.heap.push(item);

        this.heapifyUp();
    }

    extractMin() {

        if (this.isEmpty()) return null;

        if (this.heap.length === 1) {
            return this.heap.pop();
        }

        const min = this.heap[0];

        this.heap[0] = this.heap.pop();

        this.heapifyDown();

        return min;
    }

    heapifyUp() {

        let index = this.heap.length - 1;

        while (index > 0) {

            const parent = Math.floor((index - 1) / 2);

            if (
                this.heap[parent].dist <=
                this.heap[index].dist
            ) {
                break;
            }

            [
                this.heap[parent],
                this.heap[index]
            ] = [
                this.heap[index],
                this.heap[parent]
            ];

            index = parent;
        }
    }

    heapifyDown() {

        let index = 0;

        while (true) {

            const left = index * 2 + 1;
            const right = index * 2 + 2;

            let smallest = index;

            if (
                left < this.heap.length &&
                this.heap[left].dist <
                this.heap[smallest].dist
            ) {
                smallest = left;
            }

            if (
                right < this.heap.length &&
                this.heap[right].dist <
                this.heap[smallest].dist
            ) {
                smallest = right;
            }

            if (smallest === index) {
                break;
            }

            [
                this.heap[index],
                this.heap[smallest]
            ] = [
                this.heap[smallest],
                this.heap[index]
            ];

            index = smallest;
        }
    }
}

export default MinHeap;