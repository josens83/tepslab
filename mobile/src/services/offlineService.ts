import AsyncStorage from '@react-native-async-storage/async-storage';
import SQLite from 'react-native-sqlite-storage';
import NetInfo from '@react-native-community/netinfo';

SQLite.DEBUG(false);
SQLite.enablePromise(true);

// Storage keys
const STORAGE_KEYS = {
  COURSES: '@offline_courses',
  LESSONS: '@offline_lessons',
  PROGRESS: '@offline_progress',
  USER_DATA: '@offline_user',
  PENDING_SYNC: '@pending_sync',
};

// SQLite database
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize offline database
 */
export const initOfflineDB = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabase({
      name: 'tepslab.db',
      location: 'default',
    });

    // Create tables
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        category TEXT,
        level TEXT,
        thumbnail TEXT,
        data TEXT,
        downloaded_at INTEGER
      );
    `);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS lessons (
        id TEXT PRIMARY KEY,
        course_id TEXT,
        title TEXT,
        content TEXT,
        video_url TEXT,
        duration INTEGER,
        order_index INTEGER,
        data TEXT,
        downloaded_at INTEGER,
        FOREIGN KEY(course_id) REFERENCES courses(id)
      );
    `);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lesson_id TEXT,
        user_id TEXT,
        completed BOOLEAN,
        progress_percentage INTEGER,
        last_position INTEGER,
        updated_at INTEGER,
        synced BOOLEAN DEFAULT 0
      );
    `);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS pending_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action_type TEXT,
        endpoint TEXT,
        method TEXT,
        data TEXT,
        created_at INTEGER
      );
    `);

    console.log('✅ Offline database initialized');
  } catch (error) {
    console.error('Error initializing offline database:', error);
    throw error;
  }
};

/**
 * Check if online
 */
export const isOnline = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected === true;
};

/**
 * Download course for offline use
 */
export const downloadCourseOffline = async (
  courseId: string,
  courseData: any,
): Promise<void> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const timestamp = Date.now();

    await db.executeSql(
      `INSERT OR REPLACE INTO courses (id, title, description, category, level, thumbnail, data, downloaded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        courseId,
        courseData.title,
        courseData.description,
        courseData.category,
        courseData.level,
        courseData.thumbnail,
        JSON.stringify(courseData),
        timestamp,
      ],
    );

    // Download lessons for this course
    if (courseData.lessons) {
      for (const lesson of courseData.lessons) {
        await db.executeSql(
          `INSERT OR REPLACE INTO lessons (id, course_id, title, content, video_url, duration, order_index, data, downloaded_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            lesson.id,
            courseId,
            lesson.title,
            lesson.content || '',
            lesson.videoUrl || '',
            lesson.duration || 0,
            lesson.orderIndex || 0,
            JSON.stringify(lesson),
            timestamp,
          ],
        );
      }
    }

    console.log(`✅ Course ${courseId} downloaded for offline use`);
  } catch (error) {
    console.error('Error downloading course offline:', error);
    throw error;
  }
};

/**
 * Get offline courses
 */
export const getOfflineCourses = async (): Promise<any[]> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const [results] = await db.executeSql(
      'SELECT * FROM courses ORDER BY downloaded_at DESC',
    );

    const courses = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      courses.push({
        ...JSON.parse(row.data),
        downloadedAt: row.downloaded_at,
      });
    }

    return courses;
  } catch (error) {
    console.error('Error getting offline courses:', error);
    return [];
  }
};

/**
 * Get offline lessons for a course
 */
export const getOfflineLessons = async (courseId: string): Promise<any[]> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const [results] = await db.executeSql(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC',
      [courseId],
    );

    const lessons = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      lessons.push({
        ...JSON.parse(row.data),
        downloadedAt: row.downloaded_at,
      });
    }

    return lessons;
  } catch (error) {
    console.error('Error getting offline lessons:', error);
    return [];
  }
};

/**
 * Save progress offline
 */
export const saveProgressOffline = async (
  lessonId: string,
  userId: string,
  progress: {
    completed: boolean;
    progressPercentage: number;
    lastPosition: number;
  },
): Promise<void> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const timestamp = Date.now();

    await db.executeSql(
      `INSERT OR REPLACE INTO progress (lesson_id, user_id, completed, progress_percentage, last_position, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        lessonId,
        userId,
        progress.completed ? 1 : 0,
        progress.progressPercentage,
        progress.lastPosition,
        timestamp,
        0, // not synced yet
      ],
    );

    console.log(`✅ Progress saved offline for lesson ${lessonId}`);
  } catch (error) {
    console.error('Error saving progress offline:', error);
    throw error;
  }
};

/**
 * Get offline progress
 */
export const getOfflineProgress = async (
  lessonId: string,
  userId: string,
): Promise<any | null> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const [results] = await db.executeSql(
      'SELECT * FROM progress WHERE lesson_id = ? AND user_id = ? ORDER BY updated_at DESC LIMIT 1',
      [lessonId, userId],
    );

    if (results.rows.length > 0) {
      const row = results.rows.item(0);
      return {
        lessonId: row.lesson_id,
        userId: row.user_id,
        completed: row.completed === 1,
        progressPercentage: row.progress_percentage,
        lastPosition: row.last_position,
        updatedAt: row.updated_at,
        synced: row.synced === 1,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting offline progress:', error);
    return null;
  }
};

/**
 * Queue action for sync when online
 */
export const queueActionForSync = async (
  actionType: string,
  endpoint: string,
  method: string,
  data: any,
): Promise<void> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const timestamp = Date.now();

    await db.executeSql(
      `INSERT INTO pending_actions (action_type, endpoint, method, data, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [actionType, endpoint, method, JSON.stringify(data), timestamp],
    );

    console.log(`✅ Action queued for sync: ${actionType}`);
  } catch (error) {
    console.error('Error queuing action for sync:', error);
    throw error;
  }
};

/**
 * Get pending sync actions
 */
export const getPendingSyncActions = async (): Promise<any[]> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const [results] = await db.executeSql(
      'SELECT * FROM pending_actions ORDER BY created_at ASC',
    );

    const actions = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      actions.push({
        id: row.id,
        actionType: row.action_type,
        endpoint: row.endpoint,
        method: row.method,
        data: JSON.parse(row.data),
        createdAt: row.created_at,
      });
    }

    return actions;
  } catch (error) {
    console.error('Error getting pending sync actions:', error);
    return [];
  }
};

/**
 * Clear synced action
 */
export const clearSyncedAction = async (actionId: number): Promise<void> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    await db.executeSql('DELETE FROM pending_actions WHERE id = ?', [actionId]);
    console.log(`✅ Synced action ${actionId} cleared`);
  } catch (error) {
    console.error('Error clearing synced action:', error);
    throw error;
  }
};

/**
 * Sync all pending actions
 */
export const syncPendingActions = async (
  apiClient: any,
): Promise<{success: number; failed: number}> => {
  const online = await isOnline();

  if (!online) {
    console.log('⚠️  Offline, skipping sync');
    return {success: 0, failed: 0};
  }

  const actions = await getPendingSyncActions();

  if (actions.length === 0) {
    console.log('✅ No pending actions to sync');
    return {success: 0, failed: 0};
  }

  let successCount = 0;
  let failedCount = 0;

  for (const action of actions) {
    try {
      // Execute API call
      await apiClient.request({
        method: action.method,
        url: action.endpoint,
        data: action.data,
      });

      // Clear from pending actions
      await clearSyncedAction(action.id);
      successCount++;

      console.log(`✅ Synced action: ${action.actionType}`);
    } catch (error) {
      console.error(`❌ Failed to sync action: ${action.actionType}`, error);
      failedCount++;
    }
  }

  console.log(
    `📤 Sync complete: ${successCount} success, ${failedCount} failed`,
  );

  return {success: successCount, failed: failedCount};
};

/**
 * Delete offline course
 */
export const deleteOfflineCourse = async (courseId: string): Promise<void> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    await db.executeSql('DELETE FROM lessons WHERE course_id = ?', [courseId]);
    await db.executeSql('DELETE FROM courses WHERE id = ?', [courseId]);

    console.log(`✅ Offline course ${courseId} deleted`);
  } catch (error) {
    console.error('Error deleting offline course:', error);
    throw error;
  }
};

/**
 * Get offline storage size
 */
export const getOfflineStorageSize = async (): Promise<{
  courses: number;
  lessons: number;
  totalMB: number;
}> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const [coursesResult] = await db.executeSql('SELECT COUNT(*) as count FROM courses');
    const [lessonsResult] = await db.executeSql('SELECT COUNT(*) as count FROM lessons');

    const coursesCount = coursesResult.rows.item(0).count;
    const lessonsCount = lessonsResult.rows.item(0).count;

    // Rough estimate: 1 course ~5MB, 1 lesson ~2MB
    const estimatedMB = coursesCount * 5 + lessonsCount * 2;

    return {
      courses: coursesCount,
      lessons: lessonsCount,
      totalMB: estimatedMB,
    };
  } catch (error) {
    console.error('Error getting offline storage size:', error);
    return {courses: 0, lessons: 0, totalMB: 0};
  }
};

/**
 * Clear all offline data
 */
export const clearAllOfflineData = async (): Promise<void> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    await db.executeSql('DELETE FROM progress');
    await db.executeSql('DELETE FROM lessons');
    await db.executeSql('DELETE FROM courses');
    await db.executeSql('DELETE FROM pending_actions');

    console.log('✅ All offline data cleared');
  } catch (error) {
    console.error('Error clearing offline data:', error);
    throw error;
  }
};
