const express = require('express');
const axios = require('axios');
const router = express.Router();

// Proxy route for Google profile pictures
router.get('/google-avatar/:encodedUrl', async (req, res) => {
  try {
    const imageUrl = decodeURIComponent(req.params.encodedUrl);
    
    // Validate that it's a Google profile picture URL
    if (!imageUrl.includes('googleusercontent.com')) {
      return res.status(400).json({ error: 'Invalid image URL' });
    }

    // Fetch the image from Google
    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Set appropriate headers
    res.set({
      'Content-Type': response.headers['content-type'],
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*'
    });

    // Pipe the image data to the response
    response.data.pipe(res);
  } catch (error) {
    console.error('Error proxying image:', error.message);
    res.status(500).json({ error: 'Failed to load image' });
  }
});

module.exports = router;



