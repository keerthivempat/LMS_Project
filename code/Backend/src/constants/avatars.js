// The backend only needs to track the avatar index, not the actual URLs

// Get a random avatar index
export const getRandomAvatarIndex = () => {
  return Math.floor(Math.random() * 10); // We have 10 avatars
};

// In the backend, we just need to track the avatar index
// The actual rendering happens in the frontend
export const DEFAULT_AVATARS_COUNT = 10;

// For backward compatibility
export const DEFAULT_AVATARS = Array(DEFAULT_AVATARS_COUNT).fill("");

// Get avatar URL by index
export const getAvatarUrl = (index) => {
  if (index < 0 || index >= DEFAULT_AVATARS.length) {
    // Return first avatar as default if index is invalid
    return DEFAULT_AVATARS[0];
  }
  return DEFAULT_AVATARS[index];
};
