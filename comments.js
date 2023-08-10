// Create web server

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Comment = require('../models/comment');
const authenticate = require('../authenticate');
const cors = require('./cors');

const commentRouter = express.Router();

commentRouter.use(bodyParser.json());

commentRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Comment.find(req.query)
    .populate('author')
    .then((comments) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comments);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
    if (req.body != null) {
        req.body.author = req.user._id; // add author field to body
        Comment.create(req.body)
        .then((comment) => {
            Comment.findById(comment._id)
            .populate('author')
            .then((comment) => {
                console.log('Comment Created ', comment);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comment);
            })
        }, (err) => next(err))
        .catch((err) => next(err));
    }
    else {
        err = new Error('Comment not found in request body');
        err.status = 404;
        return next(err);
    }
})
.put(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /comments');
})
.delete(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
    Comment.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        console.log('Comments Deleted ', resp);
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

commentRouter.route('/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Comment.findById(req.params.commentId)
    .populate('author')
    .then((comment)