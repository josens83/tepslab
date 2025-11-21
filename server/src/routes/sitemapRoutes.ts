import express from 'express';
import Course from '../models/Course';

const router = express.Router();

/**
 * @route   GET /api/sitemap
 * @desc    Generate dynamic sitemap XML
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Get all published courses
    const courses = await Course.find({ isPublished: true }).select(
      '_id title thumbnailUrl updatedAt'
    );

    const baseUrl = process.env.CLIENT_URL || 'https://tepslab.com';
    const currentDate = new Date().toISOString().split('T')[0];

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Courses Page -->
  <url>
    <loc>${baseUrl}/courses</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Login & Register -->
  <url>
    <loc>${baseUrl}/login</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/register</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

    // Add individual course URLs
    courses.forEach((course) => {
      const lastmod = course.updatedAt
        ? new Date(course.updatedAt).toISOString().split('T')[0]
        : currentDate;

      sitemap += `
  <url>
    <loc>${baseUrl}/courses/${course._id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;

      if (course.thumbnailUrl) {
        sitemap += `
    <image:image>
      <image:loc>${course.thumbnailUrl}</image:loc>
      <image:title>${course.title}</image:title>
    </image:image>`;
      }

      sitemap += `
  </url>`;
    });

    sitemap += `
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate sitemap',
    });
  }
});

export default router;
