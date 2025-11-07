const express = require('express');
const router = express.Router();
const Page = require('../models/Page');
const Shape = require('../models/Shape');
const { default: mongoose } = require('mongoose');

// GET /api/pages for list all pages
router.get('/', async (req, res) => {
  try {
    const pages = await Page.find().sort({ createdAt: 1 });
    res.json(pages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pages for create page
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const p = new Page({ name });
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pages/:id/shapes  for get shapes for page
router.get('/:id/shapes', async (req, res) => {
  try {
    const pageId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(pageId)) return res.status(400).json({ error: 'invalid id' });
    const shapes = await Shape.find({ pageId }).sort({ createdAt: 1 });
    res.json(shapes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/pages/:id  for delete page and shapes
router.delete('/:id', async (req, res) => {
  try {
    const pageId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(pageId)) return res.status(400).json({ error: 'invalid id' });
    await Shape.deleteMany({ pageId });
    await Page.findByIdAndDelete(pageId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Update page name
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const updatedPage = await Page.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    res.json(updatedPage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update page" });
  }
});

module.exports = router;
