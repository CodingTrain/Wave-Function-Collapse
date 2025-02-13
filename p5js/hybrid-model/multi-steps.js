let algo_queue = []
let current_algo = undefined
let current_algo_generator = undefined
const base_run_frequency = 20
const max_run_frequency = 1000
const min_run_frequency = 2
let run_frequency = base_run_frequency

function queue_algorithm(algo) {
    algo_queue.push(algo)
    loop()
    // console.log(`Algorithm queue ${algo_queue.length}`)
}

function run_current_algorithm() {
    if (current_algo == undefined) {
        if (algo_queue.length == 0) {
            return undefined
            noLoop()
        }
        current_algo = algo_queue[0]
        algo_queue.splice(0, 1)
        run_frequency = base_run_frequency
        // console.log(`Algorithm queue ${algo_queue.length}`)
    }

    if (current_algo == undefined) {
        return undefined
        noLoop()
    }

    if (current_algo_generator == undefined)
        current_algo_generator = current_algo.run()

    let it = current_algo_generator.next()
    if (it.done) {
        current_algo = undefined
        current_algo_generator = undefined
    }
    return it.value
}

function run_current_algorithm_at_fps() {
    let progress = undefined

    if (frameRate >= 10 && run_frequency < max_run_frequency)
        run_frequency *= 1.5
    else if (frameRate < 3 && run_frequency > min_run_frequency)
        run_frequency /= 2

    for (let i = 0; i < run_frequency; i++) {
        progress = run_current_algorithm()
        if (progress == undefined)
            break
    }
  
    return progress
}

function restart_current_algorithm() {
    if (current_algo == undefined)
        return
    current_algo_generator = undefined
    current_algo.restart()
}

function stop_current_algorithm() {
    let algo = current_algo
    current_algo = undefined
    current_algo_generator = undefined
    if (algo != undefined)
        algo.stop()
}

function stop_all_algorithms() {
    algo_queue.length = 0
    stop_current_algorithm()
    // console.log(`Algorithm queue ${algo_queue.length}`)
}

class MultiStepsAlgo {
    constructor() {
        this.stopped = false
    }

    // Run the algorithm, yielding descriptive text of the progress
    // at regular intervals.
    *run() {
        this.stopped = false
    }

    restart() {
        this.stop()
        this.stopped = false
    }

    // Stop what the algorithm is doing.
    // Algorithm sub-classes can implement this function to
    // to further actions when stopped.
    stop() {
        this.stopped = true
    }

    // Called when the algorithm finishes.
    // Do necessary cleanup or triggers.
    finished() {
        current_algo = undefined
        current_algo_generator = undefined
    }
}