import pool from "../config/db.js";
import sendResponse from "../utils/response.js";

const VALID_FORMAT_TYPES = ["short_video", "long_video", "carousel", "single_post"];
const VALID_STATUSES = ["idea", "scripting", "recording", "editing", "ready", "published"];
const VALID_PRIORITIES = ["low", "medium", "high"];

// URL Validator Helper
const isValidUrl = (urlString) => {
  try {
    const parseURL = new URL(urlString);
    return parseURL.protocol === "http:" || parseURL.protocol === "https:";
  } catch {
    return false;
  }
};

// 1. GET /api/v1/contents (List konten dengan filter ?status=&channel_id=&format_type=)
export const getContents = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, channel_id, format_type } = req.query;

    let sql = `SELECT c.id, c.user_id, c.channel_id, ch.platform AS channel_platform, ch.handle_name AS channel_handle, c.title, c.description, c.script_draft, c.format_type, c.status, c.priority, c.scheduled_date, c.published_date, c.published_url, c.created_at, c.updated_at FROM contents c JOIN channels ch ON c.channel_id = ch.id WHERE c.user_id = ? `;
    const params = [userId];

    if (status) {
      sql += " AND c.status = ?";
      params.push(status);
    }

    if (channel_id) {
      sql += " AND c.channel_id = ?";
      params.push(channel_id);
    }

    if (format_type) {
      sql += " AND c.format_type = ?";
      params.push(format_type);
    }

    sql += " ORDER BY c.created_at DESC";

    const [contents] = await pool.execute(sql, params);

    return sendResponse(res, 200, true, "Contents retrieved successfully", contents);
  } catch (error) {
    next(error);
  }
};

// 2. GET /api/v1/contents/:id (Detail konten beserta checklists & metrics)
export const getContentById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contentId = req.params.id;

    // Ambil data konten
    const [contents] = await pool.execute(
      `
      SELECT 
        c.id, c.user_id, c.channel_id,
        ch.platform AS channel_platform, ch.handle_name AS channel_handle,
        c.title, c.description, c.script_draft, c.format_type, c.status, c.priority,
        c.scheduled_date, c.published_date, c.published_url,
        c.created_at, c.updated_at
      FROM contents c
      JOIN channels ch ON c.channel_id = ch.id
      WHERE c.id = ? AND c.user_id = ?
      `,
      [contentId, userId]
    );

    if (contents.length === 0) {
      return sendResponse(res, 404, false, "Content not found");
    }

    const content = contents[0];

    // Ambil checklists terkait
    const [checklists] = await pool.execute(
      "SELECT id, content_id, task_name, is_completed, created_at FROM content_checklists WHERE content_id = ? ORDER BY id ASC",
      [contentId]
    );

    // Ambil metrics terkait
    const [metrics] = await pool.execute(
      "SELECT id, content_id, recorded_at, views_count, likes_count, comments_count, shares_count, created_at FROM content_metrics WHERE content_id = ? ORDER BY recorded_at DESC",
      [contentId]
    );

    return sendResponse(res, 200, true, "Content detail retrieved successfully", {
      ...content,
      checklists,
      metrics,
    });
  } catch (error) {
    next(error);
  }
};

// 3. POST /api/v1/contents (Membuat draf ide konten baru)
export const createContent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      channel_id,
      title,
      description = null,
      script_draft = null,
      format_type,
      status = "idea",
      priority = "medium",
      scheduled_date = null,
    } = req.body;

    // Validasi TC-02: Title wajib diisi
    if (!title || typeof title !== "string" || title.trim() === "") {
      return sendResponse(res, 400, false, "Title is required");
    }

    // Validasi channel_id
    if (!channel_id) {
      return sendResponse(res, 400, false, "Channel ID is required");
    }

    const [channels] = await pool.execute(
      "SELECT id FROM channels WHERE id = ? AND user_id = ?",
      [channel_id, userId]
    );

    if (channels.length === 0) {
      return sendResponse(res, 400, false, "Channel not found or does not belong to user");
    }

    // Validasi format_type
    if (!format_type || !VALID_FORMAT_TYPES.includes(format_type)) {
      return sendResponse(
        res,
        400,
        false,
        `Invalid format_type. Allowed values: ${VALID_FORMAT_TYPES.join(", ")}`
      );
    }

    // Validasi status & priority
    const finalStatus = VALID_STATUSES.includes(status) ? status : "idea";
    const finalPriority = VALID_PRIORITIES.includes(priority) ? priority : "medium";

    // Insert ke database
    const [result] = await pool.execute(
      `
      INSERT INTO contents 
      (user_id, channel_id, title, description, script_draft, format_type, status, priority, scheduled_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        channel_id,
        title.trim(),
        description ? description.trim() : null,
        script_draft ? script_draft.trim() : null,
        format_type,
        finalStatus,
        finalPriority,
        scheduled_date || null,
      ]
    );

    return sendResponse(res, 201, true, "Content created successfully", {
      id: result.insertId,
      user_id: userId,
      channel_id,
      title: title.trim(),
      description: description ? description.trim() : null,
      script_draft: script_draft ? script_draft.trim() : null,
      format_type,
      status: finalStatus,
      priority: finalPriority,
      scheduled_date: scheduled_date || null,
      published_date: null,
      published_url: null,
    });
  } catch (error) {
    next(error);
  }
};

// 4. PUT / PATCH /api/v1/contents/:id (Update data konten / transisi status)
export const updateContent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contentId = req.params.id;

    // Pastikan konten ada dan milik user (mencegah IDOR)
    const [contents] = await pool.execute(
      "SELECT * FROM contents WHERE id = ? AND user_id = ?",
      [contentId, userId]
    );

    const currentContent = contents[0];

    if (!currentContent) {
      return sendResponse(res, 404, false, "Content not found");
    }

    if (role === 'editor') {
      // Editor cuma bisa ubah dari 'editing' ke 'review'
      if (status !== 'review' || currentStatus !== 'editing') {
        return sendResponse(res, 403, false, 'Editors can only submit reviews while in edit mode');
      }
    }

    const {
      channel_id,
      title,
      description,
      script_draft,
      format_type,
      status,
      priority,
      scheduled_date,
      published_date,
      published_url,
    } = req.body;

    // Cek channel_id jika diupdate
    let newChannelId = currentContent.channel_id;
    if (channel_id !== undefined && channel_id !== currentContent.channel_id) {
      const [channels] = await pool.execute(
        "SELECT id FROM channels WHERE id = ? AND user_id = ?",
        [channel_id, userId]
      );
      if (channels.length === 0) {
        return sendResponse(res, 400, false, "Channel not found or does not belong to user");
      }
      newChannelId = channel_id;
    }

    // Validasi format_type jika diupdate
    if (format_type !== undefined && !VALID_FORMAT_TYPES.includes(format_type)) {
      return sendResponse(
        res,
        400,
        false,
        `Invalid format_type. Allowed values: ${VALID_FORMAT_TYPES.join(", ")}`
      );
    }

    // Validasi priority jika diupdate
    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
      return sendResponse(
        res,
        400,
        false,
        `Invalid priority. Allowed values: ${VALID_PRIORITIES.join(", ")}`
      );
    }

    // Validasi status jika diupdate
    const targetStatus = status !== undefined ? status : currentContent.status;
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return sendResponse(
        res,
        400,
        false,
        `Invalid status. Allowed values: ${VALID_STATUSES.join(", ")}`
      );
    }

    // Validasi TC-03 (Aturan Transisi Publikasi): Wajib ada published_url valid jika status = published
    let newPublishedUrl = published_url !== undefined ? published_url : currentContent.published_url;
    let newPublishedDate = published_date !== undefined ? published_date : currentContent.published_date;

    if (role === 'creator' && targetStatus === "published") {
      if (!newPublishedUrl || typeof newPublishedUrl !== "string" || newPublishedUrl.trim() === "") {
        return sendResponse(
          res,
          400,
          false,
          "Published URL is required when status is changed to published"
        );
      }

      const cleanUrl = newPublishedUrl.trim();
      if (!isValidUrl(cleanUrl)) {
        return sendResponse(
          res,
          400,
          false,
          "Published URL must be a valid web URL (e.g., https://...)"
        );
      }
      newPublishedUrl = cleanUrl;

      // Otomatis set published_date ke tanggal hari ini jika belum terisi
      if (!newPublishedDate) {
        newPublishedDate = new Date().toISOString().split("T")[0];
      }
    }

    // Siapkan nilai yang akan diupdate
    const newTitle = title !== undefined ? title.trim() : currentContent.title;
    if (title !== undefined && (!title || typeof title !== "string" || title.trim() === "")) {
      return sendResponse(res, 400, false, "Title cannot be empty");
    }

    const newDescription = description !== undefined ? description : currentContent.description;
    const newScriptDraft = script_draft !== undefined ? script_draft : currentContent.script_draft;
    const newFormatType = format_type !== undefined ? format_type : currentContent.format_type;
    const newPriority = priority !== undefined ? priority : currentContent.priority;
    const newScheduledDate = scheduled_date !== undefined ? scheduled_date : currentContent.scheduled_date;

    await pool.execute(
      `
      UPDATE contents SET
        channel_id = ?,
        title = ?,
        description = ?,
        script_draft = ?,
        format_type = ?,
        status = ?,
        priority = ?,
        scheduled_date = ?,
        published_date = ?,
        published_url = ?
      WHERE id = ? AND user_id = ?
      `,
      [
        newChannelId,
        newTitle,
        newDescription,
        newScriptDraft,
        newFormatType,
        targetStatus,
        newPriority,
        newScheduledDate,
        newPublishedDate,
        newPublishedUrl,
        contentId,
        userId,
      ]
    );

    return sendResponse(res, 200, true, "Content updated successfully", {
      id: Number(contentId),
      user_id: userId,
      channel_id: newChannelId,
      title: newTitle,
      description: newDescription,
      script_draft: newScriptDraft,
      format_type: newFormatType,
      status: targetStatus,
      priority: newPriority,
      scheduled_date: newScheduledDate,
      published_date: newPublishedDate,
      published_url: newPublishedUrl,
    });
  } catch (error) {
    next(error);
  }
};

// 5. DELETE /api/v1/contents/:id (Hapus konten beserta relasi anaknya)
export const deleteContent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contentId = req.params.id;

    // Pastikan konten ada dan milik user
    const [contents] = await pool.execute(
      "SELECT id FROM contents WHERE id = ? AND user_id = ?",
      [contentId, userId]
    );

    if (contents.length === 0) {
      return sendResponse(res, 404, false, "Content not found");
    }

    // Hapus konten. MySQL CASCADE akan otomatis menghapus checklists & metrics (TC-04)
    await pool.execute("DELETE FROM contents WHERE id = ? AND user_id = ?", [
      contentId,
      userId,
    ]);

    // Sesuai spesifikasi halaman 6: Status Code 204 No Content
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

