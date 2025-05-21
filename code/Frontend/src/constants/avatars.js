// Array of default avatar URLs (using reliable public URLs with proper configuration)
export const DEFAULT_AVATARS = [
  "https://ui-avatars.com/api/?name=A&background=3949AB&color=fff&size=200&bold=true&format=png",
  "https://ui-avatars.com/api/?name=B&background=D81B60&color=fff&size=200&bold=true&format=png",
  "https://ui-avatars.com/api/?name=C&background=689F38&color=fff&size=200&bold=true&format=png",
  "https://ui-avatars.com/api/?name=D&background=FFA000&color=fff&size=200&bold=true&format=png",
  "https://ui-avatars.com/api/?name=E&background=00897B&color=fff&size=200&bold=true&format=png",
  "https://ui-avatars.com/api/?name=F&background=5E35B1&color=fff&size=200&bold=true&format=png",
  "https://ui-avatars.com/api/?name=G&background=E53935&color=fff&size=200&bold=true&format=png",
  "https://ui-avatars.com/api/?name=H&background=1E88E5&color=fff&size=200&bold=true&format=png",
  "https://ui-avatars.com/api/?name=I&background=43A047&color=fff&size=200&bold=true&format=png",
  "https://ui-avatars.com/api/?name=J&background=FB8C00&color=fff&size=200&bold=true&format=png"
];

// Define a list of background colors for initials avatars
const AVATAR_COLORS = [
  "3949AB", // Blue
  "D81B60", // Pink
  "689F38", // Green
  "FFA000", // Amber
  "00897B", // Teal
  "5E35B1", // Deep Purple
  "E53935", // Red
  "1E88E5", // Light Blue
  "43A047", // Light Green
  "FB8C00"  // Orange
];

// Function to generate a color based on a string (name)
export const getColorForName = (name) => {
  if (!name) return AVATAR_COLORS[0];
  
  // Sum the character codes of the name to get a simple hash
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Use modulo to get a consistent color for the same name
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

// Function to generate initials from a name
export const getInitials = (name) => {
  if (!name) return "?";
  
  // Split the name by spaces and get the first letter of each part
  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 1) {
    // If only one name, use the first two letters or just the first if it's a single character
    return parts[0].length > 1 ? parts[0].substring(0, 2).toUpperCase() : parts[0].toUpperCase();
  }
  
  // Otherwise, take first letter of first and last parts
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

// Function to get the URL for a user's avatar
export const getAvatarUrl = (user) => {
  // If user has selected a custom avatar
  if (user?.hasCustomAvatar) {
    // Use the avatarIndex directly to get from the CUSTOM_AVATARS array
    return CUSTOM_AVATARS[user.avatarIndex % CUSTOM_AVATARS.length];
  }
  
  // Otherwise, generate an initials-based avatar
  const initials = getInitials(user?.name || "");
  const color = getColorForName(user?.name || "");
  
  return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff&size=200&bold=true&format=png`;
};

// List of predefined avatars for selection using direct URLs
export const CUSTOM_AVATARS = [
  "https://lh6.googleusercontent.com/proxy/ZLGihPRfkkerdJBqfRKKFRWQcXDCfMMuuK_6_IDH6Mfhu0VI3Du2L9eOTiz0yKsIftOesQQnj0whQCZFudjFH-cXgBKnebrpknuWtjKkDcRC5Ik",
  "https://lh6.googleusercontent.com/proxy/ZLGihPRfkkerdJBqfRKKFRWQcXDCfMMuuK_6_IDH6Mfhu0VI3Du2L9eOTiz0yKsIftOesQQnj0whQCZFudjFH-cXgBKnebrpknuWtjKkDcRC5Ik",
  "https://lh6.googleusercontent.com/proxy/ZLGihPRfkkerdJBqfRKKFRWQcXDCfMMuuK_6_IDH6Mfhu0VI3Du2L9eOTiz0yKsIftOesQQnj0whQCZFudjFH-cXgBKnebrpknuWtjKkDcRC5Ik",
  "https://lh6.googleusercontent.com/proxy/ZLGihPRfkkerdJBqfRKKFRWQcXDCfMMuuK_6_IDH6Mfhu0VI3Du2L9eOTiz0yKsIftOesQQnj0whQCZFudjFH-cXgBKnebrpknuWtjKkDcRC5Ik",
  "https://lh6.googleusercontent.com/proxy/ZLGihPRfkkerdJBqfRKKFRWQcXDCfMMuuK_6_IDH6Mfhu0VI3Du2L9eOTiz0yKsIftOesQQnj0whQCZFudjFH-cXgBKnebrpknuWtjKkDcRC5Ik",
  "https://lh6.googleusercontent.com/proxy/ZLGihPRfkkerdJBqfRKKFRWQcXDCfMMuuK_6_IDH6Mfhu0VI3Du2L9eOTiz0yKsIftOesQQnj0whQCZFudjFH-cXgBKnebrpknuWtjKkDcRC5Ik",
  "https://lh6.googleusercontent.com/proxy/ZLGihPRfkkerdJBqfRKKFRWQcXDCfMMuuK_6_IDH6Mfhu0VI3Du2L9eOTiz0yKsIftOesQQnj0whQCZFudjFH-cXgBKnebrpknuWtjKkDcRC5Ik",
  "https://lh6.googleusercontent.com/proxy/ZLGihPRfkkerdJBqfRKKFRWQcXDCfMMuuK_6_IDH6Mfhu0VI3Du2L9eOTiz0yKsIftOesQQnj0whQCZFudjFH-cXgBKnebrpknuWtjKkDcRC5Ik",
  "https://lh6.googleusercontent.com/proxy/ZLGihPRfkkerdJBqfRKKFRWQcXDCfMMuuK_6_IDH6Mfhu0VI3Du2L9eOTiz0yKsIftOesQQnj0whQCZFudjFH-cXgBKnebrpknuWtjKkDcRC5Ik",
  "https://lh6.googleusercontent.com/proxy/ZLGihPRfkkerdJBqfRKKFRWQcXDCfMMuuK_6_IDH6Mfhu0VI3Du2L9eOTiz0yKsIftOesQQnj0whQCZFudjFH-cXgBKnebrpknuWtjKkDcRC5Ik"
];
