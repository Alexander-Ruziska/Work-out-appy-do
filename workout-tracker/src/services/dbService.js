import { supabase } from '../supabaseClient';

// Database service for workout data
// This abstracts all database operations so we can easily switch between localStorage and Supabase

const DB_SERVICE = {
  // Check if Supabase is properly configured
  isSupabaseConfigured: () => {
    return supabase !== null && supabase !== undefined;
  },

  // Get a unique device ID for this browser
  getDeviceId: () => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  },

  // Save current workout
  saveCurrentWorkout: async (workoutData) => {
    const deviceId = DB_SERVICE.getDeviceId();
    
    if (DB_SERVICE.isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('current_workout')
          .upsert({
            device_id: deviceId,
            workout_data: workoutData,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'device_id'
          });

        if (error) throw error;
        console.log('Saved to Supabase');
        return true;
      } catch (error) {
        console.error('Supabase save failed, falling back to localStorage:', error);
        localStorage.setItem('workoutData', JSON.stringify(workoutData));
        return false;
      }
    } else {
      // Fallback to localStorage
      localStorage.setItem('workoutData', JSON.stringify(workoutData));
      return true;
    }
  },

  // Load current workout
  loadCurrentWorkout: async () => {
    const deviceId = DB_SERVICE.getDeviceId();
    
    if (DB_SERVICE.isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('current_workout')
          .select('workout_data')
          .eq('device_id', deviceId)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
        
        if (data && data.workout_data) {
          console.log('Loaded from Supabase');
          return data.workout_data;
        }
      } catch (error) {
        console.error('Supabase load failed, falling back to localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    const saved = localStorage.getItem('workoutData');
    return saved ? JSON.parse(saved) : null;
  },

  // Save a workout to the library
  saveWorkout: async (workout) => {
    const deviceId = DB_SERVICE.getDeviceId();
    
    if (DB_SERVICE.isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('saved_workouts')
          .insert({
            device_id: deviceId,
            workout_id: workout.id,
            name: workout.name,
            workout_data: workout.data,
            saved_at: workout.savedAt
          });

        if (error) throw error;
        console.log('Workout saved to Supabase');
        return true;
      } catch (error) {
        console.error('Supabase save failed, falling back to localStorage:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('savedWorkouts');
        const workouts = saved ? JSON.parse(saved) : [];
        workouts.push(workout);
        localStorage.setItem('savedWorkouts', JSON.stringify(workouts));
        return false;
      }
    } else {
      // Fallback to localStorage
      const saved = localStorage.getItem('savedWorkouts');
      const workouts = saved ? JSON.parse(saved) : [];
      workouts.push(workout);
      localStorage.setItem('savedWorkouts', JSON.stringify(workouts));
      return true;
    }
  },

  // Load all saved workouts
  loadSavedWorkouts: async () => {
    const deviceId = DB_SERVICE.getDeviceId();
    
    if (DB_SERVICE.isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('saved_workouts')
          .select('*')
          .eq('device_id', deviceId)
          .order('saved_at', { ascending: false });

        if (error) throw error;
        
        if (data) {
          console.log('Loaded workouts from Supabase');
          // Convert to the format expected by the app
          return data.map(row => ({
            id: row.workout_id,
            name: row.name,
            data: row.workout_data,
            savedAt: row.saved_at
          }));
        }
      } catch (error) {
        console.error('Supabase load failed, falling back to localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    const saved = localStorage.getItem('savedWorkouts');
    return saved ? JSON.parse(saved) : [];
  },

  // Delete a saved workout
  deleteWorkout: async (workoutId) => {
    const deviceId = DB_SERVICE.getDeviceId();
    
    if (DB_SERVICE.isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('saved_workouts')
          .delete()
          .eq('device_id', deviceId)
          .eq('workout_id', workoutId);

        if (error) throw error;
        console.log('Workout deleted from Supabase');
        return true;
      } catch (error) {
        console.error('Supabase delete failed, falling back to localStorage:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('savedWorkouts');
        if (saved) {
          const workouts = JSON.parse(saved);
          const filtered = workouts.filter(w => w.id !== workoutId);
          localStorage.setItem('savedWorkouts', JSON.stringify(filtered));
        }
        return false;
      }
    } else {
      // Fallback to localStorage
      const saved = localStorage.getItem('savedWorkouts');
      if (saved) {
        const workouts = JSON.parse(saved);
        const filtered = workouts.filter(w => w.id !== workoutId);
        localStorage.setItem('savedWorkouts', JSON.stringify(filtered));
      }
      return true;
    }
  },

  // Update all saved workouts
  updateSavedWorkouts: async (workouts) => {
    const deviceId = DB_SERVICE.getDeviceId();
    
    if (DB_SERVICE.isSupabaseConfigured()) {
      try {
        // Delete all existing workouts for this device
        await supabase
          .from('saved_workouts')
          .delete()
          .eq('device_id', deviceId);

        // Insert all workouts
        const { error } = await supabase
          .from('saved_workouts')
          .insert(workouts.map(w => ({
            device_id: deviceId,
            workout_id: w.id,
            name: w.name,
            workout_data: w.data,
            saved_at: w.savedAt
          })));

        if (error) throw error;
        console.log('All workouts updated in Supabase');
        return true;
      } catch (error) {
        console.error('Supabase update failed, falling back to localStorage:', error);
        localStorage.setItem('savedWorkouts', JSON.stringify(workouts));
        return false;
      }
    } else {
      // Fallback to localStorage
      localStorage.setItem('savedWorkouts', JSON.stringify(workouts));
      return true;
    }
  },

  // Save progressive overload settings
  saveProgressiveSettings: async (settings) => {
    const deviceId = DB_SERVICE.getDeviceId();
    
    if (DB_SERVICE.isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('progressive_settings')
          .upsert({
            device_id: deviceId,
            settings: settings,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'device_id'
          });

        if (error) throw error;
        console.log('Progressive settings saved to Supabase');
        return true;
      } catch (error) {
        console.error('Supabase save settings failed, falling back to localStorage:', error);
        localStorage.setItem('progressiveSettings', JSON.stringify(settings));
        return false;
      }
    } else {
      // Fallback to localStorage
      localStorage.setItem('progressiveSettings', JSON.stringify(settings));
      return true;
    }
  },

  // Load progressive overload settings
  loadProgressiveSettings: async () => {
    const deviceId = DB_SERVICE.getDeviceId();
    
    if (DB_SERVICE.isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('progressive_settings')
          .select('settings')
          .eq('device_id', deviceId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data && data.settings) {
          console.log('Loaded progressive settings from Supabase');
          return data.settings;
        }
      } catch (error) {
        console.error('Supabase load settings failed, falling back to localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    const saved = localStorage.getItem('progressiveSettings');
    return saved ? JSON.parse(saved) : null;
  }
};

export default DB_SERVICE;
