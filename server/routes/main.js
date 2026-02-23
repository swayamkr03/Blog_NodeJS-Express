const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

/**
 * GET /
 * Public Blog Homepage
 */
router.get('/', async (req, res) => {
  try {
    const locals = {
      title: "NodeJs Blog",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    };

    let perPage = 10;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments({});
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render('index', {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null
    });

  } catch (error) {
    console.log(error);
  }
});


/**
 * GET /post/:id
 */
router.get('/post/:id', async (req, res) => {
  try {
    const data = await Post.findById(req.params.id);

    if (!data) return res.status(404).send("Post not found");

    res.render('post', {
      locals: {
        title: data.title,
        description: "Simple Blog created with NodeJs, Express & MongoDb."
      },
      data
    });

  } catch (error) {
    console.log(error);
  }
});


/**
 * POST /search
 */
router.post('/search', async (req, res) => {
  try {
    const searchTerm = req.body.searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

    const data = await Post.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { body: { $regex: searchTerm, $options: 'i' } }
      ]
    });

    res.render('search', {
      locals: { title: "Search Results" },
      data
    });

  } catch (error) {
    console.log(error);
  }
});


/**
 * GET /about
 */
router.get('/about', (req, res) => {
  res.render('about');
});


module.exports = router;