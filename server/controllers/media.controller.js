import { mediaService } from '../services/media.service.js';
import { ok } from '../utils/response.js';

export const mediaController = {
  getMedia: async (req, res, next) => {
    try {
      const data = await mediaService.getMedia(req.query);
      ok(res, 'Media loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  deleteMedia: async (req, res, next) => {
    try {
      await mediaService.deleteMedia(req.params.id, req.admin.id);
      ok(res, 'Media deleted successfully.');
    } catch (error) {
      next(error);
    }
  }
};
