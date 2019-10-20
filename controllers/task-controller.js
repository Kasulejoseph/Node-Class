import Task from '../models/task'

class Tasks{
    constructor() {
        // this.task = new Task()
    }
    static async readTask(req, res) {
        try {
            // const tasks = await Task.find({ author: req.user._id})
            const match = {}
            const sort = {}
    
            if(req.query.complete) {
                match.complete = req.query.complete === 'true'
            }
            if(req.query.sort) {
                const parts = req.query.sort.split(':')
                sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
            }
            await req.user.populate({
                path: 'tasks',
                match, 
                options: {
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    sort
                }
            }).execPopulate()        
            const task_count = req.user.tasks.length
            res.status(200).send({
                status: 200,
                task_count: task_count,
                data: req.user.tasks
            })
        } catch (error) {
            res.status(500).send({
                status: 500,
                error: error
            })
        }
    }

    static async createTask(req, res) {
        const task = Task({
            ...req.body,
            author: req.user
        })
        try {
            await task.save()
            res.status(201).send({
                status: 201,
                data: task
            })
        } catch (error) {
            res.status(400).send({
                status: 400,
                error: error.message
            })
        }
    }

    static async readSingleTask(req, res) {
        const _id = req.params.id
        try {
            // const task = await Task.findOne({_id, author: req.user._id})
            const task = await req.user.populate('tasks').execPopulate()
            if(!task) {
                return res.status(404).send({
                    status: 404,
                    data: `Task with id ${_id} Not Found`
                })
            }
            await task.populate('author').execPopulate()
            res.status(200).send({
                status: 200,
                data: task
            })
        } catch (error) {
            res.status(500).send({
                status: 500,
                error
            })    
        }
    }

    static async updateTask(req, res) {
        const _id = req.params.id
        const updateKeys = Object.keys(req.body)
        const requiredKeys = ['desc', 'complete']
    
        const isValidUpdateObj = updateKeys.every((update) => requiredKeys.includes(update))
        if (req.headers['content-type'] !== 'application/json') {
            return res.status(406).send({
                status: 406,
                error: 'Content type should be application/json'
            }) 
        }
        if(!isValidUpdateObj) {
            return res.status(400).send({
                status: 400,
                error: 'Invalid Updates Included!!'
            }) 
        }
        try {
            // const task = await Task.findById(_id, { new: true, runValidators: true})
            const task = await Task.findOne({ _id, author: req.user._id}, {new: true, runValidators: true})
            if(!task) {
                return res.status(404).send({
                    status: 404,
                    error: `Task With Id ${_id} Is Not Found`
                })
            }
            updateKeys.forEach((update) => task[update] = req.body[update])
            task.save()
            res.status(200).send({
                status: 200,
                data: task
            })
            
        } catch (error) {
            res.status(400).send({
                status: 400,
                error
            })  
        }
    }

    static async deleteTask(req, res) {
        try {
            const task = await Task.findOneAndDelete({_id: req.params.id, author: req.user._id})
            if(!task) {
                return res.status(404).send({
                    status: 404,
                    error: `Task With Id ${req.params.id} Was Not Found.`
                })
            }
            res.status(200).send({
                status: 200,
                data: task
            })
            
        } catch (error) {
            res.status(500).send({
                status: 500,
                error
            })  
        }
    }
    
}

export default Tasks