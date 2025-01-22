import RNFS from 'react-native-fs';

const filePath = `${RNFS.DocumentDirectoryPath}/tokens.json`;

// Tokenlarni faylga yozish
export const saveTokensToFile = async (tokens) => {
  try {
    const jsonTokens = JSON.stringify(tokens);
    await RNFS.writeFile(filePath, jsonTokens, 'utf8');
    console.log('Tokens saved to file');
    readTokensFromFile();
  } catch (error) {
    console.error('Error saving tokens to file:', error.message);
  }
};

// Tokenlarni fayldan o'qish
export const readTokensFromFile = async () => {
  try {
    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      console.log('Tokens file does not exist');
      return null;
    }

    const jsonTokens = await RNFS.readFile(filePath, 'utf8');
    const tokens = JSON.parse(jsonTokens);

    // Optional: Check if tokens have expired (you could implement this if your token has an expiry date)
    // Example: if (tokens?.accessToken && Date.now() > tokens.expiryDate) { ... }

    return tokens;
  } catch (error) {
    console.error('Error reading tokens from file:', error.message);
    return null;
  }
};

// Tokenlarni fayldan o'chirish
export const deleteTokensFile = async () => {
  try {
    const fileExists = await RNFS.exists(filePath);
    if (fileExists) {
      await RNFS.unlink(filePath);
      console.log('Tokens file deleted');
    }
  } catch (error) {
    console.error('Error deleting tokens file:', error.message);
  }
};
