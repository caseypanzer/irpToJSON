/**
 * Created by sajibsarkar on 4/11/18.
 */

const {EventEmitter} = require('events');
const os = require('os');
const Farm = require('worker-farm/lib/farm');

let shared = null;

class WorkerFarm extends Farm {
    constructor(options) {
        let opts = {
            maxConcurrentWorkers: getNumWorkers(),
            maxCallsPerWorker  : Infinity,
            autoStart: true
        };
        super(opts, require.resolve(options.workerPath));
        this.localWorker  = this.promisifyWorker(require(options.workerPath));
        this.remoteWorker = this.promisifyWorker(this.setup(['init', 'run', 'start']));
        this.started = false;
        this.warmWorkers = 0;
        this.init(options);
    }

    init(options) {
        this.localWorker.init(options);
        this.initRemoteWorkers(options);
    }

    promisifyWorker(worker) {
        let res = {};
        for (let key in worker) {
            res[key] = promisify(worker[key].bind(worker));
        }
        return res;
    }

    async initRemoteWorkers(options) {
        this.started = false;
        let promises = [];
        for (let i = 0; i < this.options.maxConcurrentWorkers; i++) {
            promises.push(this.remoteWorker.init(options));
        }
        await Promise.all(promises);
        if (this.options.maxConcurrentWorkers > 0) {
            this.started = true;
        }
    }

    receive(data) {
        if (!this.children[data.child]) {
            // This handles premature death
            // normally only accurs for workers
            // that are still warming up when killed
            return;
        }

        if (data.event) {
            this.emit(data.event, ...data.args);
        } else {
            super.receive(data);
        }
    }

    async run(...args) {

        return new  Promise((resolve, reject)=>{
            if (this.shouldUseRemoteWorkers()) {
                this.remoteWorker.run(...args).then((results)=>{
                    resolve(results);
                }).catch(err=>{
                    reject(err);
                });
            } else {
                if (this.started) {
                    this.remoteWorker.run(...args).then((results)=>{
                        this.warmWorkers++;
                        resolve(results);
                    }).catch(err=>{
                        reject(err);
                    });
                }  else {
                    this.localWorker.run(...args).then(function (results) {
                        resolve(results);
                    }).catch(err=> reject(err));
                }

            }
        });

    }

    shouldUseRemoteWorkers() {
        return this.started;
    }


    end() {
        // Force kill all children
        this.ending = true;
        for (let child in this.children) {
            this.stopChild(child);
        }

        this.ending = false;
        shared = null;
    }

    static getShared(options) {
        if (!shared) {
            shared = new WorkerFarm(options);
        } else {
            shared.init(options);
        }

        return shared;
    }
}


function promisify(fn) {
    return function(...args) {
        return new Promise(function(resolve, reject) {
            fn(...args, function(err, ...res) {
                if (err) return reject(err);
                if (res.length === 1) return resolve(res[0]);
                resolve(res);
            });
        });
    };
}


for (let key in EventEmitter.prototype) {
    WorkerFarm.prototype[key] = EventEmitter.prototype[key];
}

function getNumWorkers() {
    if (process.env.M_WORKERS) {
        return parseInt(process.env.M_WORKERS, 10);
    }
    let cores = os.cpus().length;
   // console.log('cores', cores);
    return cores || 1;
}

module.exports = WorkerFarm;
