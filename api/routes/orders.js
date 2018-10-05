const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Order = require('../models/order')
const Product = require('../models/product')

router.get('/', (req, res, next) => {
    console.log("-----------------------------------------")

    Order.find()
        .select('product quantity _id')
        .populate('product', 'name price')
        .exec()
        .then(docs => {
            const response = {
                Description: 'Get all orders',
                Count: docs.length,
                Orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        quantity: doc.quantity,
                        product: {
                            name: doc.product.name,
                            price: doc.product.price
                        },
                    }
                })
            }

            res.status(200).json(response)
            console.log("Count: " + docs.length)
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
            console.log(err)
        })
})

router.post('/', (req, res, next) => {
    console.log("-----------------------------------------")

    const id = req.body.productId
    const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId
    })

    Product.findById(id)
        .then(product => {
            if (!product) {
                res.status(404).json({
                    message: 'Product not found.'
                })
                console.log('Product not found')
            }
            order.save()
                .then(result => {
                    console.log("Created order successfully.")
                    return res.status(201).json({
                        message: 'Created order successfully.',
                        createdOrder: {
                            _id: result._id,
                            product: result.product,
                            quantity: result.quantity
                        }
                    })
                    
                })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
            console.log(err)
        })
})

router.get('/:orderId', (req, res, next) => {
    console.log("-----------------------------------------")

    const id = req.params.orderId

    Order.findById(id)
        .select('product quantity _id')
        .populate('product', 'name price')
        .exec()
        .then(order => {
            if (!order) {
                console.log('Order not found.')
                return res.status(404).json({
                    message: 'Order not found.'
                })
            }
            return res.status(200).json({
                order: {
                    _id: order.id,
                    quantity: order.quantity,
                    product: {
                        name: order.product.name,
                        price: order.product.price
                    }
                },
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
            console.log(err)
        })
})

router.patch('/:orderId', (req, res, next) => {
    console.log("-----------------------------------------")

    const id = req.params.orderId
    const updateOps = {}

    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value
    }

    Order.findById(id)
        .select('_id')
        .exec()
        .then(order => {
            if (!order) {
                console.log('Order not found')
                return res.status(404).json({
                    message: 'Order not found.'
                })
            }
            Order.update({
                    _id: order
                }, {
                    $set: updateOps
                })
                .exec()
                .then(result => {
                    if (!result.ok) {
                        console.log('update product error.')
                        return res.status(500).json({
                            message: 'update product error.'
                        })
                    }
                    console.log("Order updated")
                    return res.status(200).json({
                        message: 'Order updated',
                        orderUpdated: result
                    })
                })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
            console.log(err)
        })
})

router.delete('/:orderId', (req, res, next) => {
    console.log("-----------------------------------------")

    const id = req.params.orderId

    Order.findById(id)
        .exec()
        .then(order => {
            if (!order) {
                console.log('Order not found.')
                return res.status(404).json({
                    message: 'Order not found.',
                })
            }
            Order.remove({
                    _id: order
                })
                .exec()
                .then(result => {
                    console.log('Order deleted')
                    return res.status(200).json({
                        message: 'Order deleted',
                    })
                })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
            console.log(err)
        })
})


module.exports = router