const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Product = require('../models/product')
const Order = require('../models/order')

router.get('/', (req, res, next) => {
    console.log("-----------------------------------------")

    Product.find()
        .select('name price _id')
        .exec()
        .then(docs => {
            const response = {
                Description: 'Get all products',
                Count: docs.length,
                Products: docs.map(doc => {
                    return {
                        id: doc._id,
                        name: doc.name,
                        price: doc.price,
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

    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    })

    product.save()
        .then(result => {
            res.status(201).json({
                message: 'Created product successfully.',
                createProduct: {
                    id: result._id,
                    name: result.name,
                    price: result.price,
                }
            })
            console.log("Created product successfully.")
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
            console.log(err)
        })
})

router.get('/:productId', (req, res, next) => {
    console.log("-----------------------------------------")

    const id = req.params.productId

    Product.findById(id)
        .select('name price _id')
        .exec()
        .then(product => {
            if (!product) {
                res.status(404).json({
                    message: 'Product not found.'
                })
                console.log('Product not found.')
            } else {
                res.status(200).json({
                    product: product,
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
            console.log(err)
        })
})

router.patch('/:productId', (req, res, next) => {
    console.log("-----------------------------------------")

    const id = req.params.productId
    const updateOps = {}

    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value
    }

    Product.findById(id)
        .select('_id')
        .exec()
        .then(product => {
            if (!product) {
                console.log('Product not found')
                return res.status(404).json({
                    message: 'Product not found.'
                })
            }

            Product.update({
                    _id: product
                }, {
                    $set: updateOps
                })
                .exec()
                .then(result => {
                    if (!result.ok) {
                        console.log("update product error.")
                        return res.status(500).json({
                            message: 'update product error.'
                        })
                    }
                    console.log("Product updated")
                    return res.status(200).json({
                        message: 'Product updated',
                        productUpdated: result
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

router.delete('/:productId', (req, res, next) => {
    console.log("-----------------------------------------")

    const id = req.params.productId

    Product.findById(id)
        .exec()
        .then(product => {
            if (!product) {
                console.log('Product not found.')
                return res.status(404).json({
                    message: 'Product not found'
                })
            }
            Product.remove({
                    _id: product
                })
                .exec()
                .then(result => {
                    Order.remove({
                        product: {
                            _id: product._id
                        }
                    }).exec()

                    console.log("Product deleted.")
                    return res.status(200).json({
                        message: 'Product deleted.',
                        result: result,
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