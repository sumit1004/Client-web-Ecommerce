import { settingsService } from '../services/settings.service.js';
import { ok } from '../utils/response.js';

export async function getSettingsGroup(req, res, next) {
  try {
    const { group } = req.params;
    const data = await settingsService.getSettingsByGroup(group);
    ok(res, `Settings for ${group} loaded.`, data);
  } catch (error) {
    next(error);
  }
}

export async function getAllSettings(req, res, next) {
  try {
    const data = await settingsService.getAllSettings();
    ok(res, 'All settings loaded.', data);
  } catch (error) {
    next(error);
  }
}

export async function updateSettingsGroup(req, res, next) {
  try {
    const { group } = req.params;
    const newValues = req.body;
    
    if (!newValues || Object.keys(newValues).length === 0) {
      const error = new Error('No data provided to update');
      error.status = 400;
      throw error;
    }

    const updated = await settingsService.updateSettings(group, newValues, req.admin?.id);
    ok(res, `Settings for ${group} updated successfully.`, updated);
  } catch (error) {
    next(error);
  }
}
