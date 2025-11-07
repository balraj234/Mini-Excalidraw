const express = require('express');
const router = express.Router();
const Shape = require('../models/Shape');
const mongoose = require('mongoose');

// GET /api/shapes 
router.get('/', async (req, res) => {
  try {
    const { pageId } = req.query;
    const filter = {};
    if (pageId && mongoose.Types.ObjectId.isValid(String(pageId))) filter.pageId = pageId;
    const shapes = await Shape.find(filter).sort({ createdAt: 1 });
    res.json(shapes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shapes for create new shape
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.type || !payload.pageId) return res.status(400).json({ error: 'type and pageId required' });
    const s = new Shape(payload);
    await s.save();
    res.status(201).json(s);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/shapes/:id  for update shape
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'invalid id' });
    const update = req.body;
    const s = await Shape.findByIdAndUpdate(id, update, { new: true });
    if (!s) return res.status(404).json({ error: 'not found' });
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/shapes/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'invalid id' });
    await Shape.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
