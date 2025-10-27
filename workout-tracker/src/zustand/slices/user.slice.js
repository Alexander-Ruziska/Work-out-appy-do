import { supabase } from '../../supabaseClient';

const createUserSlice = (set, get) => ({
  user: {},
  authErrorMessage: '',
  isLoading: true,
  
  fetchUser: async () => {
    // Get the current authenticated user from Supabase
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      set({ user: user || {}, isLoading: false });
    } catch (err) {
      console.log('fetchUser error:', err);
      set({ user: {}, isLoading: false });
    }
  },

  register: async (username, password) => {
    // Register a new user with Supabase Auth using username as email
    // We use username@workout.local as a fake email for Supabase
    get().setAuthErrorMessage('');
    try {
      const fakeEmail = `${username.toLowerCase()}@workout.local`;
      
      const { data, error } = await supabase.auth.signUp({
        email: fakeEmail,
        password,
        options: {
          data: {
            username: username
          },
          emailRedirectTo: undefined // Disable email verification
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        set({ user: data.user });
        return { success: true, message: 'Registration successful! You can now log in.' };
      }
    } catch (err) {
      console.log('register error:', err);
      const message = err.message || 'Oops! Registration failed. That username might already be taken. Try again!';
      get().setAuthErrorMessage(message);
      return { success: false, message };
    }
  },

  logIn: async (username, password) => {
    // Log in an existing user with Supabase Auth using username
    get().setAuthErrorMessage('');
    try {
      const fakeEmail = `${username.toLowerCase()}@workout.local`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        set({ user: data.user });
        return { success: true };
      }
    } catch (err) {
      console.log('logIn error:', err);
      const message = err.message || 'Oops! Login failed. Please check your username and password and try again!';
      get().setAuthErrorMessage(message);
      return { success: false, message };
    }
  },

  logOut: async () => {
    // Log out the current user
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: {} });
    } catch (err) {
      console.log('logOut error:', err);
    }
  },

  setAuthErrorMessage: (message) => {
    // Set an error message for authentication-related issues
    set({ authErrorMessage: message });
  },

  // Listen for auth state changes
  initAuthListener: () => {
    if (!supabase) return;
    
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        set({ user: session.user, isLoading: false });
      } else {
        set({ user: {}, isLoading: false });
      }
    });
  }
});

export default createUserSlice;
